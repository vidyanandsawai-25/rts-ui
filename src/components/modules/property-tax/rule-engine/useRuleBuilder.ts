'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common';
import { useRuleFieldsConfig } from './useRuleFieldsConfig';
import {
  RuleItem, RuleScope, FieldConfig,
  TargetFilterState, EffectTypeConfig, RuleBlock,
} from '@/types/rule-engine.types';
import { safeParse } from '@/lib/utils/json-parse';
import {
  initializeRulesList,
  validateRuleBuilder,
  safeUUID,
} from './useRuleBuilderHelpers';

// ─── Default fallback values ──────────────────────────────────────────────────

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseRuleBuilderProps {
  initialRule?: RuleItem;
  scopes: RuleScope[];
  initialFields: FieldConfig[];
  locale: string;
  onFetchFields: (scopeId: number) => Promise<FieldConfig[]>;
  onSaveRule: (payload: RuleItem) => Promise<{ success: boolean; message: string }>;
  effectTypeConfigs: EffectTypeConfig[];
}

export function useRuleBuilder({
  initialRule, scopes, initialFields,
  locale, onFetchFields, onSaveRule,
  effectTypeConfigs: _effectTypeConfigs, // available for future use
}: UseRuleBuilderProps) {
  const router = useRouter();
  const toast = useToast();

  const [ruleName, setRuleName]       = React.useState(initialRule?.ruleName ?? '');
  const [ruleCode, setRuleCode]       = React.useState(initialRule?.ruleCode ?? '');
  const [isActive, setIsActive]       = React.useState(initialRule?.isActive ?? true);
  const [ruleScopeId, setRuleScopeId] = React.useState(initialRule?.ruleScopeId ?? scopes[0]?.id ?? 0);
  const [ruleCategory, setRuleCategory] = React.useState(initialRule?.ruleCategory ?? 'ARV');

  const [targetFilters, setTargetFilters] = React.useState<TargetFilterState>(
    () => safeParse<TargetFilterState>(initialRule?.targetFiltersJson, {})
  );

  const [rulesList, setRulesList] = React.useState<RuleBlock[]>(() =>
    initializeRulesList(initialRule)
  );

  const { fields, setFields } = useRuleFieldsConfig({
    ruleScopeId,
    initialFields,
    onFetchFields,
  });

  const [isReasonOpen, setIsReasonOpen] = React.useState(false);
  const [changeReason, setChangeReason] = React.useState('');
  const [isSaving, setIsSaving]         = React.useState(false);

  const activeScopeName = React.useMemo(
    () => scopes.find((s) => s.id === ruleScopeId)?.scopeName ?? '',
    [scopes, ruleScopeId]
  );

  const addRuleBlock = () => {
    setRulesList((prev) => [
      ...prev,
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
    ]);
  };

  const removeRuleBlock = (index: number) => {
    if (rulesList.length <= 1) {
      toast.error('At least one rule is required.');
      return;
    }
    setRulesList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveRuleBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rulesList.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setRulesList((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const updateRuleBlock = (
    index: number,
    key: 'conditions' | 'effect' | 'description',
    value: RuleBlock['conditions'] | RuleBlock['effect'] | string
  ) => {
    setRulesList((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [key]: value,
      } as RuleBlock;
      return copy;
    });
  };

  const handleSaveClick = () => {
    const errorMsg = validateRuleBuilder(ruleName, ruleCategory, rulesList);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setChangeReason(initialRule ? '' : 'Initial rule creation');
    setIsReasonOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!changeReason.trim()) {
      toast.error('Please enter a reason for this change.');
      return;
    }
    if (isSaving) return; // prevent double-submit

    setIsReasonOpen(false);
    setIsSaving(true);

    try {
      // Backend generates ruleJson from conditionsJson + effectJson — no transform needed here
      const payload: RuleItem = {
        id:               initialRule?.id,
        ruleName:         ruleName.trim(),
        ruleCode,
        isActive,
        ruleScopeId,
        conditionsJson:   JSON.stringify(rulesList),
        effectJson:       JSON.stringify(rulesList[0]?.effect || {}),
        targetFiltersJson: JSON.stringify(targetFilters),
        description:      (rulesList[0]?.description || '').trim(),
        ruleCategory,
        changeReason:     changeReason.trim(),
        priority:         1,
      };
      const res = await onSaveRule(payload);
      if (res.success) {
        toast.success('Rule saved successfully');
        router.push(`/${locale}/property-tax/rule-engine`);
      } else {
        toast.error(res.message || 'Failed to save rule.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ruleName, setRuleName, ruleCode, setRuleCode,
    isActive, setIsActive,
    ruleScopeId, setRuleScopeId,
    ruleCategory, setRuleCategory,
    targetFilters, setTargetFilters,
    rulesList, setRulesList,
    fields, setFields,
    isReasonOpen, setIsReasonOpen, changeReason, setChangeReason,
    activeScopeName, handleSaveClick, handleConfirmSave,
    isSaving,
    addRuleBlock, removeRuleBlock, moveRuleBlock, updateRuleBlock,
  };
}
