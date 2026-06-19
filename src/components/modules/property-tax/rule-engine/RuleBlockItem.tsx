'use client';


import { ArrowUp, ArrowDown, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldConfig, RuleBlock, EffectTypeConfig, ConditionGroupState, EffectState } from '@/types/rule-engine.types';
import { Input } from '@/components/common';
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
    <div className={`border border-zinc-200 bg-zinc-50/10 p-3.5 rounded-xl flex flex-col gap-3 relative shadow-sm hover:shadow-md transition-all ${!isCollapsed ? 'z-10' : 'z-0'}`}>
      
      {/* Rule block header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-wrap items-center gap-3 flex-grow w-full sm:w-auto">
          <span className="text-sm font-bold text-blue-800 shrink-0">{t('builder.ruleIndex', { index: index + 1 })}</span>
          
          <div className="flex items-center gap-2 flex-grow sm:flex-1 min-w-[180px]">
            <span className="text-[13px] font-semibold text-zinc-500 shrink-0">{t('targetFilter.description')}:</span>
            <div className="flex-grow">
              <Input
                value={ruleBlock.description}
                onChange={(e) => onUpdateRuleBlock(index, 'description', e.target.value)}
                placeholder={t('targetFilter.descriptionPlaceholder')}
                fullWidth
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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

            {/* Edit Rule — only shown when collapsed */}
            {isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all"
                title="Edit Rule"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{t('builder.editRule')}</span>
              </button>
            )}

            {/* Collapse / Expand chevron — always visible */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-all"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed
                ? <ChevronDown className="w-4 h-4 text-zinc-500" />
                : <ChevronUp className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-2">
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
            stopProcessing={ruleBlock.stopProcessing || false}
            onStopProcessingChange={(checked) => onUpdateRuleBlock(index, 'stopProcessing', checked)}
          />
        </div>
      )}
    </div>
  );
}
