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
    ruleDescription, setRuleDescription,
    rulesList, fields,
    isReasonOpen, setIsReasonOpen, changeReason, setChangeReason,
    activeScopeName, handleSaveClick, handleConfirmSave,
    isSaving, 
    addRuleBlock, removeRuleBlock, moveRuleBlock, updateRuleBlock,
  } = useRuleBuilder(props);

  // Serialise current form state — passed to SaveRulesButton which holds the initial snapshot
  const currentData = JSON.stringify({ ruleName, ruleCategory, description: ruleDescription, ruleScopeId, rulesList });

  return (
    <div className="flex flex-col gap-3.5 w-full px-1 pb-8 lg:pb-0 select-none lg:h-[calc(100vh-170px)] lg:overflow-hidden">
      <RuleBuilderHeader locale={props.locale} />

      <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch w-full flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Left Side: Rule Details Form */}
        <div className="w-full lg:w-[320px] shrink-0 lg:h-full lg:overflow-y-auto pr-1">
          <TargetFilterPanel
            ruleName={ruleName} setRuleName={setRuleName}
            ruleScopeId={ruleScopeId} setRuleScopeId={setRuleScopeId}
            ruleCategory={ruleCategory} setRuleCategory={setRuleCategory}
            ruleDescription={ruleDescription} setRuleDescription={setRuleDescription}
            scopes={props.scopes}
            ruleCategoryOptions={props.ruleCategoryOptions}
          />
        </div>

        {/* Right Side: Visual Rule Builder */}
        <div className="flex-grow min-w-0 w-full flex flex-col lg:h-full lg:overflow-hidden">
          <RuleBuilderCard
            activeScopeName={activeScopeName}
            handleSaveClick={handleSaveClick}
            isSaving={isSaving}
            currentData={currentData}
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
        </div>
      </div>

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

