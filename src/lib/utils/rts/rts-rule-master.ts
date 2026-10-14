import type { RtsRuleMasterRule } from '@/types/rts/rts-rulemaster.types';
import type { RtsFieldDefinitionApiItem } from '@/types/rts/field-definition.types';

export type RuleTab = 'fee' | 'assignment';
export const RULE_ACTIONS = ['BASE_FEE', 'ADDON_FEE', 'STAGE_ALLOCATION'] as const;
export type RuleAction = (typeof RULE_ACTIONS)[number];

export function ruleTab(action: string): RuleTab | 'legacy' {
  if (action === 'BASE_FEE' || action === 'ADDON_FEE') return 'fee';
  if (action === 'STAGE_ALLOCATION') return 'assignment';
  return 'legacy';
}

export interface StageAllocationActionValue {
  approvalFlowStageId: number;
  stageOrder: number;
}

export function parseStageAllocationActionValue(
  value: string | null | undefined
): StageAllocationActionValue | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const config = parsed as Record<string, unknown>;
    const approvalFlowStageId = Number(config.approvalFlowStageId);
    const stageOrder = Number(config.stageOrder);
    if (
      !Number.isSafeInteger(approvalFlowStageId) ||
      approvalFlowStageId < 1 ||
      !Number.isSafeInteger(stageOrder) ||
      stageOrder < 1
    ) {
      return null;
    }
    return { approvalFlowStageId, stageOrder };
  } catch {
    return null;
  }
}

export function serializeStageAllocationActionValue(value: StageAllocationActionValue): string {
  return JSON.stringify({
    approvalFlowStageId: value.approvalFlowStageId,
    stageOrder: value.stageOrder,
  });
}

export function splitRules(rules: RtsRuleMasterRule[]) {
  return {
    fee: rules.filter((rule) => ruleTab(rule.ruleActionType) === 'fee'),
    assignment: rules.filter((rule) => ruleTab(rule.ruleActionType) === 'assignment'),
    legacy: rules.filter((rule) => ruleTab(rule.ruleActionType) === 'legacy'),
  };
}

export function operatorsForField(fieldType: string): string[] {
  const type = fieldType.trim().toLowerCase();
  // Equality for date/datetime supports optional components (day, month, year,
  // and time for datetime). Ordered comparisons switch the editor to a complete
  // native date/datetime input, so the comparison remains unambiguous.
  if (['number', 'decimal', 'amount', 'year', 'date', 'datetime', 'date_time', 'date-time', 'time', 'month'].includes(type)) {
    return ['=', '!=', '>', '>=', '<', '<='];
  }
  if (['select', 'dropdown', 'radio', 'checkbox'].includes(type)) return ['=', '!='];
  return ['=', '!=', 'CONTAINS'];
}

/** Human-readable labels while preserving the operator values expected by the rule engine. */
export function operatorLabel(operator: string | null | undefined): string {
  const labels: Record<string, string> = {
    '=': 'Equal to',
    '!=': 'Not equal to',
    '>': 'Greater than',
    '>=': 'Greater than or equal to',
    '<': 'Less than',
    '<=': 'Less than or equal to',
    CONTAINS: 'Contains',
  };

  return labels[operator ?? ''] ?? operator ?? '—';
}

export function fieldOptions(
  field: RtsFieldDefinitionApiItem
): Array<{ value: string; label: string }> {
  if (!field.optionsJson) return [];
  try {
    const parsed: unknown = JSON.parse(field.optionsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const option = item as Record<string, unknown>;
      const rawValue = option.value ?? option.id ?? option.key;
      if (rawValue === null || rawValue === undefined) return [];
      const rawLabel = option.label ?? option.text ?? option.name ?? rawValue;
      const label =
        typeof rawLabel === 'object' && rawLabel !== null
          ? ((rawLabel as Record<string, unknown>).en ?? rawValue)
          : rawLabel;
      return [{ value: String(rawValue), label: String(label) }];
    });
  } catch {
    return [];
  }
}
