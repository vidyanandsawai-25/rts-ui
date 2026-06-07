import { PlusCircle, Loader2, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RuleItem, FieldConfig, RuleBlock, EffectTypeConfig, ConditionGroupState, EffectState } from '@/types/rule-engine.types';
import { Input } from '@/components/common';
import ConditionGroup from './ConditionGroup';
import EffectPanel from './EffectPanel';

interface RuleBuilderCardProps {
  activeScopeName: string;
  handleSaveClick: () => void;
  isSaving: boolean;
  initialRule?: RuleItem;
  rulesList: RuleBlock[];
  fields: FieldConfig[];
  effectTypes: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
  onAddRuleBlock: () => void;
  onRemoveRuleBlock: (index: number) => void;
  onMoveRuleBlock: (index: number, direction: 'up' | 'down') => void;
  onUpdateRuleBlock: (index: number, key: 'conditions' | 'effect' | 'description', value: ConditionGroupState | EffectState | string) => void;
}

/** The main IF/THEN card container: card header and rule configurator panel. */
export default function RuleBuilderCard({
  activeScopeName, handleSaveClick, isSaving,
  initialRule, rulesList, fields,
  effectTypes, categoryOptions, effectTypeConfigs,
  onAddRuleBlock, onRemoveRuleBlock, onMoveRuleBlock, onUpdateRuleBlock,
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
        
        {/* Rules list */}
        <div className="flex flex-col gap-8">
          {rulesList.map((ruleBlock, index) => (
            <div key={ruleBlock.id} className="border border-zinc-200 bg-zinc-50/10 p-5 rounded-xl flex flex-col gap-5 relative shadow-sm hover:shadow-md transition-all">
              
              {/* Rule block header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-sm font-bold text-blue-800">{t('builder.ruleIndex', { index: index + 1 })}</span>
                <div className="flex items-center gap-2">
                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveRuleBlock(index, 'up')}
                    className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4 text-zinc-600" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={index === rulesList.length - 1}
                    onClick={() => onMoveRuleBlock(index, 'down')}
                    className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4 text-zinc-600" />
                  </button>

                  {/* Delete Block */}
                  <button
                    type="button"
                    disabled={rulesList.length <= 1}
                    onClick={() => onRemoveRuleBlock(index)}
                    className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[13px] font-semibold text-zinc-600">
                  {t('targetFilter.description')}
                </label>
                <Input
                  value={ruleBlock.description}
                  onChange={(e) => onUpdateRuleBlock(index, 'description', e.target.value)}
                  placeholder={t('targetFilter.descriptionPlaceholder')}
                  fullWidth
                />
              </div>

              {/* Conditions Group */}
              <ConditionGroup
                group={ruleBlock.conditions}
                fields={fields}
                onChange={(updatedConditions) => onUpdateRuleBlock(index, 'conditions', updatedConditions)}
              />

              {/* Effect Panel */}
              <EffectPanel
                effect={ruleBlock.effect}
                onChange={(updatedEffect) => onUpdateRuleBlock(index, 'effect', updatedEffect)}
                effectTypes={effectTypes}
                categoryOptions={categoryOptions}
                effectTypeConfigs={effectTypeConfigs}
              />
            </div>
          ))}
        </div>

        {/* Add Rule Button */}
        <button
          type="button"
          onClick={onAddRuleBlock}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl text-zinc-600 hover:text-zinc-800 transition-all font-semibold text-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> {t('library.addRule')}
        </button>

      </div>
    </div>
  );
}

