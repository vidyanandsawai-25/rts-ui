import React from 'react';
import { RuleItem, FieldConfig } from '@/types/rule-engine.types';
import { ApiResponse } from '@/types/common.types';
import { extractRuleParameters } from './useRuleBuilderHelpers';
import { dryRunRuleAction, fetchFieldsForScopeAction } from '@/app/[locale]/property-tax/rule-engine/actions';
import {
  collectExpressionsFromRuleJson,
  inferFieldTypes,
  coerceInputValue,
  KNOWN_CS_METHODS,
} from './simulatorExpressionParser';

export interface InputRow {
  key: string;
  value: string;
  isExtracted: boolean;
}

export function useSimulatorPayload(rule: RuleItem) {
  const [loading, setLoading]               = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<ApiResponse<unknown> | null>(null);
  const [dryRunResult, setDryRunResult]     = React.useState<any | null>(null);
  const [fields, setFields]                 = React.useState<FieldConfig[]>([]);

  /**
   * Fields that require array payload values.
   * Only 'contains any' / 'contains all' generate C# .Contains() calls.
   * 'In' / 'Not In' generate scalar == comparisons — not arrays.
   */
  const arrayFieldIds = React.useMemo<Set<string>>(() => {
    const ARRAY_OPS = new Set(['contains any', 'contains all', 'contains_any', 'contains_all']);
    const result = new Set<string>();
    try {
      const blocks = JSON.parse(rule.conditionsJson || '[]');
      if (Array.isArray(blocks)) {
        const scanGroup = (g: any) => {
          if (!g) return;
          (g.conditions || []).forEach((c: any) => {
            if (c?.fieldId && c?.operator && ARRAY_OPS.has(String(c.operator).toLowerCase()))
              result.add(c.fieldId);
          });
          (g.groups || []).forEach(scanGroup);
        };
        blocks.forEach((block: any) => scanGroup(block?.conditions));
      }
    } catch { /* invalid conditionsJson — ignore */ }
    return result;
  }, [rule.conditionsJson]);

  React.useEffect(() => {
    if (!rule.ruleScopeId) return;
    fetchFieldsForScopeAction(rule.ruleScopeId)
      .then((data) => {
        if (!data) return;
        setFields(data);
        if (rule.id !== -1) return;

        const extractedParams   = extractRuleParameters(rule);
        const lowercaseExtracted = extractedParams.map(p => p.toLowerCase());
        const filteredFields    = data.filter(f =>
          lowercaseExtracted.includes(f.fieldId.toLowerCase()) ||
          lowercaseExtracted.includes((f.fieldName || '').toLowerCase()) ||
          lowercaseExtracted.includes((f.databaseColumnName || '').toLowerCase()),
        );
        const rows: InputRow[] = filteredFields.map(f => ({
          key: f.databaseColumnName || f.fieldId || '',
          value: '',
          isExtracted: true,
        }));
        lowercaseExtracted.forEach(param => {
          if (!rows.some(r => r.key.toLowerCase() === param)) {
            const original = extractedParams.find(p => p.toLowerCase() === param) || param;
            rows.push({ key: original, value: '', isExtracted: true });
          }
        });
        if (!rows.some(r => r.key.toLowerCase() === 'rate'))
          rows.push({ key: 'Rate', value: '1000', isExtracted: true });
        setInputs(rows);
      })
      .catch(err => console.error('Failed to fetch scope fields:', err));
  }, [rule.ruleScopeId, rule.id]);

  const getFieldConfig = React.useCallback((key: string): FieldConfig | undefined =>
    fields.find(f =>
      f.fieldName?.toLowerCase()        === key.toLowerCase() ||
      f.databaseColumnName?.toLowerCase() === key.toLowerCase() ||
      f.fieldId?.toLowerCase()           === key.toLowerCase(),
    ),
  [fields]);

  const [inputs, setInputs] = React.useState<InputRow[]>(() => {
    const extracted = extractRuleParameters(rule);
    let effectParam = 'Rate';
    try {
      const parsed = JSON.parse(rule.effectJson);
      if (parsed?.parameterCode) effectParam = parsed.parameterCode.replace('input.', '').trim();
    } catch { /* ignore */ }
    if (effectParam && !extracted.includes(effectParam)) extracted.push(effectParam);
    if (!extracted.includes('Rate') && !extracted.includes('BaseRate')) extracted.push('Rate');
    const rows = extracted.map(field => ({ key: field, value: '', isExtracted: true }));
    return rows.length === 0 ? [{ key: '', value: '', isExtracted: false }] : rows;
  });

  const handleAddRow    = () => setInputs(prev => [...prev, { key: '', value: '', isExtracted: false }]);
  const handleRemoveRow = (index: number) => setInputs(prev => prev.filter((_, i) => i !== index));
  const handleRowChange = (index: number, field: 'key' | 'value', val: string) =>
    setInputs(prev => prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)));

  const handleRunSimulation = async () => {
    setLoading(true);
    setExecutionResult(null);
    setDryRunResult(null);

    const expressions = collectExpressionsFromRuleJson(rule.ruleJson);
    const types       = inferFieldTypes(expressions);

    // Build typed payload from user inputs
    const payload: Record<string, unknown> = {};
    inputs.forEach(row => {
      const key = row.key.trim();
      if (!key) return;
      payload[key] = coerceInputValue(key, row.value, types, arrayFieldIds, getFieldConfig(key));
    });

    // Auto-fill fields present in expressions but not entered by user
    expressions.forEach(expr => {
      const varRx = /\b[iI]nput\.(\w+)\b/g;
      let m: RegExpExecArray | null;
      while ((m = varRx.exec(expr)) !== null) {
        const name = m[1];
        if (KNOWN_CS_METHODS.has(name) || payload[name] !== undefined) continue;
        payload[name] = types.arrayFields.has(name) || arrayFieldIds.has(name)
          ? [] : types.numericFields.has(name) ? 0 : '';
      }
    });

    console.group('%c[Simulator] Dry-Run Payload', 'color:#4f46e5;font-weight:bold');
    console.log('📦 payload:', JSON.parse(JSON.stringify(payload)));
    console.log('🔷 arrayFields:', [...types.arrayFields]);
    console.log('🔢 numericFields:', [...types.numericFields]);
    console.groupEnd();

    try {
      if (rule.id === -1 && rule.ruleCategory === 'ALL') {
        let categories: string[] = [];
        try {
          const blocks = JSON.parse(rule.conditionsJson);
          categories = Array.from(new Set(blocks.map((b: any) => b.ruleCategory).filter(Boolean)));
        } catch { /* ignore */ }
        if (categories.length === 0) categories = ['ARV'];

        const responses = await Promise.all(categories.map(cat => dryRunRuleAction(cat, payload)));
        const merged = { category: 'ALL', totalRulesLoaded: 0, totalSubRulesEvaluated: 0, matchedCount: 0, stoppedEarly: false, workflows: [] as any[] };
        let fallback: any = null;
        let hasData = false;
        responses.forEach(res => {
          const data = res && (res as any).success !== false ? ((res as any).data || res) : null;
          if (data) {
            hasData = true;
            merged.totalRulesLoaded       += data.totalRulesLoaded || 0;
            merged.totalSubRulesEvaluated += data.totalSubRulesEvaluated || 0;
            merged.matchedCount           += data.matchedCount || 0;
            if (data.stoppedEarly) merged.stoppedEarly = true;
            if (data.workflows) merged.workflows.push(...data.workflows);
          } else { fallback = res; }
        });
        hasData ? setDryRunResult(merged) : fallback && setExecutionResult(fallback);
      } else {
        const ruleJson = rule.id === -1 ? undefined : rule.ruleJson;
        const response = await dryRunRuleAction(rule.ruleCategory || 'ALL', payload, ruleJson);
        const data = response && (response as any).success !== false ? ((response as any).data || response) : null;
        data ? setDryRunResult(data) : setExecutionResult(response);
      }
    } catch (error) {
      setExecutionResult({ success: false, error: error instanceof Error ? error.message : 'Execution failed' });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, executionResult, dryRunResult,
    inputs, arrayFieldIds,
    handleAddRow, handleRemoveRow, handleRowChange,
    handleRunSimulation, getFieldConfig,
  };
}
