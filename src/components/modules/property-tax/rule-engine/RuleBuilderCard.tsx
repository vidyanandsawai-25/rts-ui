'use client';

import React from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldConfig, RuleBlock, EffectTypeConfig, ConditionGroupState, EffectState } from '@/types/rule-engine.types';
import RuleBlockItem from './RuleBlockItem';

interface RuleBuilderCardProps {
  activeScopeName: string;
  handleSaveClick: () => void;
  isSaving: boolean;
  isEdit: boolean;
  rulesList: RuleBlock[];
  fields: FieldConfig[];
  effectTypes: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  effectTypeConfigs: EffectTypeConfig[];
  onAddRuleBlock: () => void;
  onRemoveRuleBlock: (index: number) => void;
  onMoveRuleBlock: (index: number, direction: 'up' | 'down') => void;
  onUpdateRuleBlock: (
    index: number,
    key: 'conditions' | 'effect' | 'description' | 'stopProcessing',
    value: ConditionGroupState | EffectState | string | boolean
  ) => void;
}

/** The main IF/THEN card container: card header and rule configurator panel. */
export default function RuleBuilderCard({
  activeScopeName, handleSaveClick, isSaving, isEdit,
  rulesList, fields,
  effectTypes, categoryOptions, effectTypeConfigs,
  onAddRuleBlock, onRemoveRuleBlock, onMoveRuleBlock, onUpdateRuleBlock,
}: RuleBuilderCardProps) {
  const t = useTranslations('ruleEngine');
  const [collapsedBlocks, setCollapsedBlocks] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    rulesList.forEach((block) => {
      initial[block.id] = isEdit;
    });
    return initial;
  });

  const prevLengthRef = React.useRef(rulesList.length);

  React.useEffect(() => {
    if (rulesList.length > prevLengthRef.current) {
      // Collapse all existing blocks and expand the newly added one
      const newCollapsedBlocks: Record<string, boolean> = {};
      rulesList.forEach((block, index) => {
        if (index === rulesList.length - 1) {
          newCollapsedBlocks[block.id] = false; // expanded
        } else {
          newCollapsedBlocks[block.id] = true; // collapsed
        }
      });
      setCollapsedBlocks(newCollapsedBlocks);
    }
    prevLengthRef.current = rulesList.length;
  }, [rulesList]);

  const toggleCollapse = (id: string) => {
    setCollapsedBlocks((prev) => {
      const current = prev[id] !== false;
      return {
        ...prev,
        [id]: !current,
      };
    });
  };

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
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed border border-transparent rounded-lg transition-all shadow-sm"
          >
            {isSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('builder.saving')}</>
              : <><PlusCircle className="w-4 h-4" /> {t('builder.saveRules')}</>
            }
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 flex flex-col gap-6">
        
        {/* Rules list */}
        <div className="flex flex-col gap-8">
          {rulesList.map((ruleBlock, index) => {
            const isCollapsed = collapsedBlocks[ruleBlock.id] ?? isEdit;

            return (
              <RuleBlockItem
                key={ruleBlock.id}
                ruleBlock={ruleBlock}
                index={index}
                isCollapsed={isCollapsed}
                totalBlocks={rulesList.length}
                fields={fields}
                effectTypes={effectTypes}
                categoryOptions={categoryOptions}
                effectTypeConfigs={effectTypeConfigs}
                onRemoveRuleBlock={onRemoveRuleBlock}
                onMoveRuleBlock={onMoveRuleBlock}
                onUpdateRuleBlock={onUpdateRuleBlock}
                onToggleCollapse={() => toggleCollapse(ruleBlock.id)}
              />
            );
          })}
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
