'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common';
import { useRuleFieldsConfig } from './useRuleFieldsConfig';
import {
  RuleItem, RuleScope, FieldConfig,
  ConditionGroupState, EffectState, TargetFilterState,
  EffectTypeConfig,
} from '@/types/rule-engine.types';
import { safeParse } from '@/lib/utils/json-parse';

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
  const [description, setDescription]  = React.useState(initialRule?.description ?? '');

  const [targetFilters, setTargetFilters] = React.useState<TargetFilterState>(
    () => safeParse<TargetFilterState>(initialRule?.targetFiltersJson, {})
  );
  const [conditions, setConditions] = React.useState<ConditionGroupState>(
    () => safeParse<ConditionGroupState>(initialRule?.conditionsJson, {
      id: crypto.randomUUID(),
      logicalOperator: 'AND',
      conditions: [],
      groups: [],
    })
  );
  const [effect, setEffect] = React.useState<EffectState>(
    () => safeParse<EffectState>(initialRule?.effectJson, {
      effectType: '',
      value: '',
      isPercentage: false,
    })
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

  const handleSaveClick = () => {
    if (!ruleName.trim()) { toast.error('Rule Name is required!'); return; }
    if (!ruleCategory)    { toast.error('Category is required!'); return; }
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
        conditionsJson:   JSON.stringify(conditions),
        effectJson:       JSON.stringify(effect),
        targetFiltersJson: JSON.stringify(targetFilters),
        description:      description.trim(),
        ruleCategory,
        changeReason:     changeReason.trim(),
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
    description, setDescription,
    targetFilters, setTargetFilters, conditions, setConditions,
    effect, setEffect, fields, setFields,
    isReasonOpen, setIsReasonOpen, changeReason, setChangeReason,
    activeScopeName, handleSaveClick, handleConfirmSave,
    isSaving,
  };
}
