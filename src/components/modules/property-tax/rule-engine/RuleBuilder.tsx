'use client';

import { RuleItem, RuleScope, FieldConfig, EffectTypeConfig } from '@/types/rule-engine.types';
import { useRuleBuilder } from './useRuleBuilder';
import RuleBuilderHeader from './RuleBuilderHeader';
import RuleBuilderCard from './RuleBuilderCard';
import RuleSaveReasonModal from './RuleSaveReasonModal';
import TargetFilterPanel from './TargetFilterPanel';

interface RuleBuilderProps {
  initialRule?: RuleItem;
  scopes: RuleScope[];
  initialFields: FieldConfig[];
  locale: string;
  onFetchFields: (scopeId: number) => Promise<FieldConfig[]>;
  onSaveRule: (payload: RuleItem) => Promise<{ success: boolean; message: string }>;
  corporations: { label: string; value: string }[];
  effectTypes: { label: string; value: string }[];
  /** Rate section options — used by EffectPanel inside RuleBuilderCard */
  categoryOptions: { label: string; value: string }[];
  /** Rule category options fetched from /api/RuleCategory — used by TargetFilterPanel */
  ruleCategoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
}

export default function RuleBuilder(props: RuleBuilderProps) {
  const {
    ruleName, setRuleName,
    ruleScopeId, setRuleScopeId,
    ruleCategory, setRuleCategory,
    rulesList, fields,
    isReasonOpen, setIsReasonOpen, changeReason, setChangeReason,
    activeScopeName, handleSaveClick, handleConfirmSave,
    isSaving,
    addRuleBlock, removeRuleBlock, moveRuleBlock, updateRuleBlock,
  } = useRuleBuilder(props);

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none">
      <RuleBuilderHeader locale={props.locale} />

      <TargetFilterPanel
        ruleName={ruleName} setRuleName={setRuleName}
        ruleScopeId={ruleScopeId} setRuleScopeId={setRuleScopeId}
        ruleCategory={ruleCategory} setRuleCategory={setRuleCategory}
        scopes={props.scopes}
        ruleCategoryOptions={props.ruleCategoryOptions}
      />

      <RuleBuilderCard
        activeScopeName={activeScopeName}
        handleSaveClick={handleSaveClick}
        isSaving={isSaving}
        isEdit={!!props.initialRule}
        rulesList={rulesList}
        fields={fields}
        effectTypes={props.effectTypes}
        categoryOptions={props.categoryOptions}
        effectTypeConfigs={props.effectTypeConfigs}
        onAddRuleBlock={addRuleBlock}
        onRemoveRuleBlock={removeRuleBlock}
        onMoveRuleBlock={moveRuleBlock}
        onUpdateRuleBlock={updateRuleBlock}
      />

      <RuleSaveReasonModal
        open={isReasonOpen}
        onClose={() => setIsReasonOpen(false)}
        changeReason={changeReason}
        setChangeReason={setChangeReason}
        onConfirm={handleConfirmSave}
      />

    </div>
  );
}

