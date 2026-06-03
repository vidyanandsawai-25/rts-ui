'use client';

import { PlusCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RuleItem, FieldConfig, ConditionGroupState, EffectState, EffectTypeConfig } from '@/types/rule-engine.types';
import ConditionGroup from './ConditionGroup';
import EffectPanel from './EffectPanel';
import StopProcessingPanel from './StopProcessingPanel';

interface RuleBuilderCardProps {
  activeScopeName: string;
  handleSaveClick: () => void;
  isSaving: boolean;
  initialRule?: RuleItem;
  conditions: ConditionGroupState;
  fields: FieldConfig[];
  setConditions: (g: ConditionGroupState) => void;
  effect: EffectState;
  setEffect: (e: EffectState) => void;
  effectTypes: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
  // ─── Stop Processing ─────────────────────────────────────────
  stopProcessing: boolean;
  onStopProcessingChange: (val: boolean) => void;
  skipRuleIds: string[];
  onSkipRuleIdsChange: (ids: string[]) => void;
  exclusionReason: string;
  onExclusionReasonChange: (val: string) => void;
}

/** The main IF/THEN card container: card header and rule configurator panel. */
export default function RuleBuilderCard({
  activeScopeName, handleSaveClick, isSaving,
  initialRule, conditions, fields, setConditions,
  effect, setEffect, effectTypes, categoryOptions, effectTypeConfigs,
  stopProcessing, onStopProcessingChange,
  skipRuleIds, onSkipRuleIdsChange,
  exclusionReason, onExclusionReasonChange,
}: RuleBuilderCardProps) {
  const t = useTranslations('ruleEngine');
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mt-2">

      {/* Card header */}
      <div className="bg-[#dcf0fa]/60 px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">{t('builder.title', { scopeName: activeScopeName })}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed border border-transparent rounded-lg transition-all shadow-sm"
          >
            {isSaving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('builder.saving')}</>
              : <><PlusCircle className="w-3.5 h-3.5" /> {initialRule ? t('builder.saveChanges') : t('builder.add')}</>
            }
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 flex flex-col gap-6">
        <ConditionGroup group={conditions} fields={fields} onChange={setConditions} />
        <EffectPanel
          effect={effect}
          onChange={setEffect}
          effectTypes={effectTypes}
          categoryOptions={categoryOptions}
          effectTypeConfigs={effectTypeConfigs}
        />
        <StopProcessingPanel
          stopProcessing={stopProcessing}
          onStopProcessingChange={onStopProcessingChange}
          skipRuleIds={skipRuleIds}
          onSkipRuleIdsChange={onSkipRuleIdsChange}
          exclusionReason={exclusionReason}
          onExclusionReasonChange={onExclusionReasonChange}
          currentRuleId={initialRule?.id}
        />
      </div>
    </div>
  );
}

