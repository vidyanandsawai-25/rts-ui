import { RuleItem, RuleBlock, EffectState } from '@/types/rule-engine.types';
import { safeParse } from '@/lib/utils/json-parse';

/**
 * Initializes the rules list, falling back to legacy single conditions and effect format
 * if conditionsJson is not an array.
 */
export function initializeRulesList(initialRule?: RuleItem): RuleBlock[] {
  try {
    if (!initialRule?.conditionsJson) throw new Error();
    const parsed = JSON.parse(initialRule.conditionsJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        id: item.id || safeUUID(),
        description: item.description || '',
        conditions: item.conditions || {
          id: safeUUID(),
          logicalOperator: 'AND',
          conditions: [],
          groups: [],
        },
        effect: item.effect || {
          effectType: '',
          value: '',
          isPercentage: true,
        }
      }));
    } else {
      // Fallback: parse legacy single conditions and single effect
      return [
        {
          id: safeUUID(),
          description: initialRule?.description ?? '',
          conditions: parsed || {
            id: safeUUID(),
            logicalOperator: 'AND',
            conditions: [],
            groups: [],
          },
          effect: safeParse<EffectState>(initialRule?.effectJson, {
            effectType: '',
            value: '',
            isPercentage: true,
          }),
        },
      ];
    }
  } catch {
    return [
      {
        id: safeUUID(),
        description: '',
        conditions: {
          id: safeUUID(),
          logicalOperator: 'AND',
          conditions: [],
          groups: [],
        },
        effect: {
          effectType: '',
          value: '',
          isPercentage: true,
        },
      },
    ];
  }
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
