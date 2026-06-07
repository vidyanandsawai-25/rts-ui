'use client';

import React from 'react';
import { Play, Copy, Check, Plus, Trash2, Terminal, HelpCircle } from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { Button } from '@/components/common/ActionButton';
import { Input } from '@/components/common/Input';
import { RuleItem } from '@/types/rule-engine.types';
import { initializeRulesList } from './useRuleBuilderHelpers';
import { executeRuleAction } from '@/app/[locale]/property-tax/rule-engine/actions';

interface RuleExecutionDrawerProps {
  rule: RuleItem | null;
  open: boolean;
  onClose: () => void;
}

interface InputRow {
  key: string;
  value: string;
  isExtracted: boolean;
}

export default function RuleExecutionDrawer({
  rule,
  open,
  onClose,
}: RuleExecutionDrawerProps) {
  const [inputs, setInputs] = React.useState<InputRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<any>(null);

  // Extract all unique fieldIds from visual condition groups recursively
  const extractFieldIds = React.useCallback((group: any, fieldIds: Set<string>) => {
    if (!group) return;
    if (Array.isArray(group.conditions)) {
      group.conditions.forEach((cond: any) => {
        if (cond && cond.fieldId) {
          fieldIds.add(cond.fieldId);
        }
      });
    }
    if (Array.isArray(group.groups)) {
      group.groups.forEach((subGroup: any) => {
        extractFieldIds(subGroup, fieldIds);
      });
    }
  }, []);

  // Compute the JSON preview string for display
  const ruleJsonString = React.useMemo(() => {
    if (!rule) return '';
    try {
      const parsedRules = initializeRulesList(rule);
      const schema = {
        ruleCode: rule.ruleCode,
        ruleName: rule.ruleName,
        category: rule.ruleCategory,
        description: rule.description,
        rules: parsedRules,
      };
      return JSON.stringify(schema, null, 2);
    } catch {
      return JSON.stringify(rule, null, 2);
    }
  }, [rule]);

  // Load and initialize input rows based on rule conditions
  React.useEffect(() => {
    if (!rule || !open) return;
    
    const extracted = new Set<string>();
    try {
      const blocks = initializeRulesList(rule);
      blocks.forEach((block) => {
        if (block.conditions) {
          extractFieldIds(block.conditions, extracted);
        }
      });
    } catch (e) {
      // safe fallback
    }

    const initialRows: InputRow[] = Array.from(extracted).map((field) => ({
      key: field,
      value: '',
      isExtracted: true,
    }));

    // If no fields were extracted, provide a single custom row for user input
    if (initialRows.length === 0) {
      initialRows.push({ key: '', value: '', isExtracted: false });
    }

    setInputs(initialRows);
    setExecutionResult(null);
  }, [rule, open, extractFieldIds]);

  const handleCopy = async () => {
    if (!ruleJsonString) return;
    try {
      await navigator.clipboard.writeText(ruleJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // fallback copy
    }
  };

  const handleAddRow = () => {
    setInputs((prev) => [...prev, { key: '', value: '', isExtracted: false }]);
  };

  const handleRemoveRow = (index: number) => {
    setInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: 'key' | 'value', val: string) => {
    setInputs((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: val } : row))
    );
  };

  const handleRunSimulation = async () => {
    if (!rule) return;
    setLoading(true);
    setExecutionResult(null);

    const payload: Record<string, string> = {};
    inputs.forEach((row) => {
      const trimmedKey = row.key.trim();
      if (trimmedKey) {
        payload[trimmedKey] = row.value;
      }
    });

    try {
      const response = await executeRuleAction(rule.ruleCategory || 'ALL', payload);
      setExecutionResult(response);
    } catch (error: any) {
      setExecutionResult({
        success: false,
        error: error?.message || 'Failed to complete execution',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!rule) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2.5 text-[#1E3A8A] font-bold text-base md:text-lg">
          <Terminal className="w-5.5 h-5.5 text-indigo-600 stroke-[2.5]" />
          <span>Simulation Console: {rule.ruleCode}</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-[#F8FAFF] min-h-[calc(100vh-56px)]">
        {/* ================= LEFT COLUMN: SCHEMA PREVIEW ================= */}
        <div className="flex flex-col gap-3 bg-white p-5 border border-blue-100 rounded-xl shadow-sm h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <span>Rule JSON Structure</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                Read-Only
              </span>
            </h3>
            <button
              onClick={handleCopy}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
                ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95'
                }
              `}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="text-xs bg-slate-900 text-slate-100 p-4.5 rounded-xl overflow-auto h-[480px] font-mono leading-relaxed select-text border border-slate-800 shadow-inner">
              {ruleJsonString}
            </pre>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE CONSOLE ================= */}
        <div className="flex flex-col gap-5 bg-white p-5 border border-blue-100 rounded-xl shadow-sm h-fit">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Rule Simulator</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Test policy evaluation by inputting values. Extracted variables are auto-populated from rules configuration.
            </p>
          </div>

          {/* Test Inputs list */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 px-1">
              <span className="col-span-5">Parameter Name</span>
              <span className="col-span-6">Simulation Value</span>
              <span className="col-span-1"></span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {inputs.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="e.g. usageType"
                      value={row.key}
                      onChange={(e) => handleRowChange(index, 'key', e.target.value)}
                      disabled={row.isExtracted}
                      className={row.isExtracted ? 'bg-gray-50 font-mono text-xs text-gray-600 font-bold border-gray-200' : 'font-mono text-xs'}
                    />
                  </div>
                  <div className="col-span-6">
                    <Input
                      placeholder="Input value..."
                      value={row.value}
                      onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {!row.isExtracted ? (
                      <button
                        onClick={() => handleRemoveRow(index)}
                        title="Delete parameter"
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="text-gray-300" title="Auto-extracted from rule block criteria">
                        <HelpCircle className="w-4 h-4 text-gray-350" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition w-fit mt-1.5 px-2 py-1 rounded hover:bg-indigo-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Parameter</span>
            </button>
          </div>

          <Button
            variant="primary"
            onClick={handleRunSimulation}
            isLoading={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white font-medium py-2.5 rounded-lg shadow-sm active:scale-[0.99]"
            icon={Play}
          >
            Run Simulation
          </Button>

          {/* Results panel */}
          {executionResult && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700">Execution Result Output</h4>
              
              {executionResult.success !== false ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-medium">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Evaluation processed successfully.</span>
                  </div>
                  <pre className="text-[11px] bg-slate-950 text-slate-350 p-4 rounded-lg overflow-auto max-h-[200px] font-mono leading-relaxed select-text border border-slate-800 shadow-inner">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-medium">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Evaluation failed or encountered errors.</span>
                  </div>
                  <pre className="text-[11px] bg-rose-950 text-rose-250 p-4 rounded-lg overflow-auto max-h-[160px] font-mono leading-relaxed select-text border border-rose-900 shadow-inner">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
