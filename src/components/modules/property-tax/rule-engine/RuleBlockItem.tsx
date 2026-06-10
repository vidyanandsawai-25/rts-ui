'use client';


import { ArrowUp, ArrowDown, Trash2, Edit, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldConfig, RuleBlock, EffectTypeConfig, ConditionGroupState, EffectState } from '@/types/rule-engine.types';
import { Input, ToggleSwitch } from '@/components/common';
import ConditionGroup from './ConditionGroup';
import EffectPanel from './EffectPanel';

interface RuleBlockItemProps {
  ruleBlock: RuleBlock;
  index: number;
  isCollapsed: boolean;
  totalBlocks: number;
  fields: FieldConfig[];
  effectTypes: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
  onRemoveRuleBlock: (index: number) => void;
  onMoveRuleBlock: (index: number, direction: 'up' | 'down') => void;
  onUpdateRuleBlock: (
    index: number,
    key: 'conditions' | 'effect' | 'description' | 'stopProcessing',
    value: ConditionGroupState | EffectState | string | boolean
  ) => void;
  onToggleCollapse: () => void;
}

export default function RuleBlockItem({
  ruleBlock,
  index,
  isCollapsed,
  totalBlocks,
  fields,
  effectTypes,
  categoryOptions,
  effectTypeConfigs,
  onRemoveRuleBlock,
  onMoveRuleBlock,
  onUpdateRuleBlock,
  onToggleCollapse,
}: RuleBlockItemProps) {
  const t = useTranslations('ruleEngine');

  return (
    <div className="border border-zinc-200 bg-zinc-50/10 p-5 rounded-xl flex flex-col gap-5 relative shadow-sm hover:shadow-md transition-all">
      
      {/* Rule block header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <span className="text-sm font-bold text-blue-800">{t('builder.ruleIndex', { index: index + 1 })}</span>
        
        <div className="flex items-center gap-4">
          {/* Stop Processing Toggle */}
          <ToggleSwitch
            checked={ruleBlock.stopProcessing || false}
            onChange={(checked) => onUpdateRuleBlock(index, 'stopProcessing', checked)}
            label={t('stopProcessing.toggleLabel')}
            showPopup={false}
          />

          <div className="flex items-center gap-2 border-l border-zinc-200 pl-4">
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
              disabled={index === totalBlocks - 1}
              onClick={() => onMoveRuleBlock(index, 'down')}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4 text-zinc-600" />
            </button>

            {/* Delete Block */}
            <button
              type="button"
              disabled={totalBlocks <= 1}
              onClick={() => onRemoveRuleBlock(index)}
              className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Remove Rule"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                isCollapsed
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
              title={isCollapsed ? 'Expand Rule' : 'Collapse Rule'}
            >
              {isCollapsed ? (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  <span>{t('library.addRule').replace('Add', 'Edit')}</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{t('conditionRow.done').replace('Done', 'Collapse')}</span>
                </>
              )}
            </button>
          </div>
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

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="flex flex-col gap-5 border-t border-zinc-100 pt-3">
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
      )}
    </div>
  );
}
