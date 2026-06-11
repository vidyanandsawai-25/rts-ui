import { RuleItem, RuleBlock, ConditionGroupState, ConditionState } from '@/types/rule-engine.types';

/** Converts legacy verbose operator codes to the short symbols used in state. */
function normalizeOperator(op: string): string {
  switch (op) {
    case 'EQUALS':                  return '=';
    case 'NOT_EQUALS':              return '?';
    case 'GREATER_THAN':            return '>';
    case 'LESS_THAN':               return '<';
    case 'GREATER_THAN_OR_EQUALS':  return '>=';
    case 'LESS_THAN_OR_EQUALS':     return '<=';
    case 'IN':                      return 'In';
    case 'NOT_IN':                  return 'Not In';
    case 'CONTAINS_ANY':            return 'contains any';
    case 'CONTAINS_ALL':            return 'contains all';
    default:                        return op;
  }
}

/** Recursively normalizes operator codes in a condition group. */
function normalizeGroup(g: ConditionGroupState): ConditionGroupState {
  return {
    ...g,
    conditions: (g.conditions || []).map((c: ConditionState) => ({ ...c, operator: normalizeOperator(c.operator) })),
    groups: (g.groups || []).map(normalizeGroup),
  };
}

/**
 * Initializes the rules list, falling back to legacy single conditions and effect format
 * if conditionsJson is not an array.
 */
export function initializeRulesList(initialRule?: RuleItem): RuleBlock[] {
  try {
    if (!initialRule?.conditionsJson) throw new Error();
    const parsed = JSON.parse(initialRule.conditionsJson);
    if (Array.isArray(parsed)) {
      return (parsed as Partial<RuleBlock>[]).map((item) => ({
        id: item.id || safeUUID(),
        description: item.description || '',
        conditions: normalizeGroup(item.conditions || {
          id: safeUUID(),
          logicalOperator: 'AND',
          conditions: [],
          groups: [],
        }),
        effect: item.effect || { effectType: '', value: '', isPercentage: true },
        stopProcessing: item.stopProcessing || false,
      }));
    }
  } catch {}

  return [{
    id: safeUUID(),
    description: '',
    conditions: { id: safeUUID(), logicalOperator: 'AND', conditions: [], groups: [] },
    effect: { effectType: '', value: '', isPercentage: true },
    stopProcessing: false,
  }];
}

/**
 * Validates the inputs of the Rule Builder.
 * Returns a string error message if validation fails, or null if validation passes.
 */
export function validateRuleBuilder(
  ruleName: string,
  ruleCategory: string,
  rulesList: RuleBlock[]
): string | null {
  if (!ruleName.trim()) return 'Rule Name is required!';
  if (!ruleCategory) return 'Category is required!';

  for (let i = 0; i < rulesList.length; i++) {
    const block = rulesList[i];
    if (!block.effect.effectType) {
      return `Rule ${i + 1}: Effect Type is required!`;
    }
    if (
      block.effect.value === undefined ||
      block.effect.value === null ||
      block.effect.value.toString().trim() === ''
    ) {
      return `Rule ${i + 1}: Effect Value is required!`;
    }
    const valNum = Number(block.effect.value);
    if (isNaN(valNum) || valNum < 0 || valNum > 100) {
      return `Rule ${i + 1}: Effect Value must be between 0% and 100%!`;
    }
  }
  return null;
}

/**
 * Safely generates a random UUID in both secure (HTTPS/localhost) and insecure browser contexts.
 */
export function safeUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extracts rule parameter field IDs recursively from the rule conditions.
 */
export function extractRuleParameters(rule: RuleItem): string[] {
  const extracted = new Set<string>();
  try {
    const blocks = initializeRulesList(rule);
    blocks.forEach((block) => {
      if (block.conditions) {
        const extract = (g: ConditionGroupState) => {
          if (!g) return;
          if (Array.isArray(g.conditions)) {
            g.conditions.forEach((cond) => {
              if (cond && cond.fieldId) {
                extracted.add(cond.fieldId);
              }
            });
          }
          if (Array.isArray(g.groups)) {
            g.groups.forEach((subGroup) => {
              extract(subGroup);
            });
          }
        };
        extract(block.conditions);
      }
    });
  } catch (_e) {
    // safe fallback
  }
  return Array.from(extracted);
}

/**
 * Resolves rule-wise description lists from conditionsJson.
 */
export function getRuleWiseDescriptions(conditionsJson?: string): string[] {
  try {
    if (!conditionsJson) return [];
    const parsed = JSON.parse(conditionsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => item.description).filter(Boolean);
    }
  } catch {}
  return [];
}
// Re-export label helpers from their dedicated file so existing imports remain valid
export { formatFieldName, getFieldLabel, getFriendlyOperatorLabel } from './field-label.helpers';
