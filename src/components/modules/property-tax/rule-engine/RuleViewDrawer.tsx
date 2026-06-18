'use client';

import React from 'react';
import { Eye, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { FieldConfig, RuleItem, RuleBlock, ConditionGroupState, ConditionState } from '@/types/rule-engine.types';
import { initializeRulesList, getFieldLabel, getFriendlyOperatorLabel } from './useRuleBuilderHelpers';
import { fetchFieldsForScopeAction, fetchEffectTypeConfigsAction, fetchDynamicFieldOptionsAction } from '@/app/[locale]/property-tax/rule-engine/actions';

interface RuleViewDrawerProps {
  rule: RuleItem | null;
  open: boolean;
  onClose: () => void;
  scopeName?: string;
}

export default function RuleViewDrawer({ rule, open, onClose, scopeName }: RuleViewDrawerProps) {
  const t = useTranslations('ruleEngine');
  const [fields, setFields] = React.useState<FieldConfig[]>([]);
  const [paramOptions, setParamOptions] = React.useState<Record<string, string>>({});

  const ruleBlocks = React.useMemo<RuleBlock[]>(() => {
    if (!rule) return [];
    return initializeRulesList(rule);
  }, [rule]);

  React.useEffect(() => {
    if (open && rule?.ruleScopeId) {
      let active = true;
      fetchFieldsForScopeAction(rule.ruleScopeId)
        .then((list) => { if (active) setFields(list); })
        .catch(() => {});
      return () => {
        active = false;
        setFields([]);
      };
    }
  }, [open, rule?.ruleScopeId]);

  React.useEffect(() => {
    if (open && rule && ruleBlocks.length > 0) {
      let active = true;
      fetchEffectTypeConfigsAction()
        .then(async (configs) => {
          if (!active) return;
          const uniqueTypes = Array.from(new Set(ruleBlocks.map((b) => b.effect.effectType).filter(Boolean)));
          const newMap: Record<string, string> = {};

          for (const type of uniqueTypes) {
            const cfg = configs.find((c) => c.effectType === type);
            if (cfg?.staticApiEndpoint) {
              const opts = await fetchDynamicFieldOptionsAction(
                cfg.staticApiEndpoint,
                cfg.staticApiMethod ?? 'GET',
                cfg.staticApiParamter ?? undefined,
                cfg.staticApiResponseMapping ?? undefined
              );
              opts.forEach((opt) => {
                newMap[opt.value] = opt.label;
              });
            }
          }
          if (active) {
            setParamOptions((prev) => ({ ...prev, ...newMap }));
          }
        })
        .catch(() => {});

      return () => {
        active = false;
        setParamOptions({});
      };
    }
  }, [open, rule, ruleBlocks]);

  if (!rule) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-base">
          <Eye className="w-4 h-4 text-blue-600 stroke-[2.5]" />
          <span>{t('simulation.viewRuleTitle', { code: rule.ruleCode })}</span>
        </div>
      }
    >
      {open && (
        <div className="flex flex-col gap-3 p-3 bg-[#F8FAFF] min-h-[calc(100vh-56px)] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">{t('simulation.ruleCode')}</span>
              <span className="text-sm font-bold text-slate-800">{rule.ruleCode}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">{t('simulation.ruleName')}</span>
              <span className="text-sm font-bold text-slate-800">{rule.ruleName}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">{t('simulation.category')}</span>
              <span className="text-sm font-bold text-slate-800">{rule.ruleCategory}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">{t('simulation.scope')}</span>
              <span className="text-sm font-bold text-slate-800">{scopeName || `Scope ID: ${rule.ruleScopeId}`}</span>
            </div>
          </div>

          {/* Rules Blocks List */}
          <div className="flex flex-col gap-2 flex-1">
            {ruleBlocks.map((block, idx) => (
              <div
                key={block.id}
                className="bg-white px-3 py-2.5 rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-2 hover:border-blue-200 transition-all"
              >
                {/* Block header */}
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-1.5">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                    {t('simulation.ruleIndex', { index: idx + 1 })}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 truncate">
                    {block.description || t('simulation.noDescription')}
                  </span>
                </div>

                {/* Conditions Block */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('simulation.conditions')}</span>
                  {(!block.conditions || (block.conditions.conditions.length === 0 && block.conditions.groups.length === 0)) ? (
                    <div className="text-xs text-gray-400 italic pl-3">{t('simulation.noConditions')}</div>
                  ) : (
                    <RenderConditionGroup group={block.conditions} fields={fields} />
                  )}
                </div>

                {/* Effect Panel */}
                <div className="flex flex-col gap-1 bg-slate-50/60 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('simulation.outcomeAction')}</span>
                  <div className="flex items-center justify-between text-sm text-slate-800 mt-0.5">
                    <span className="font-semibold text-slate-800">
                      {(() => {
                        const typeLabel = block.effect.effectType || 'No action';
                        const val = block.effect.value;
                        const isPct = block.effect.isPercentage;
                        const mult = block.effect.multiplierField;
                        const overrideVal = block.effect.overrideRate;

                        const paramLabel = (overrideVal !== undefined && overrideVal !== null)
                          ? (paramOptions[overrideVal.toString()] || overrideVal.toString())
                          : '';

                        const subject = paramLabel || 'Rate';
                        const typeLower = typeLabel.toLowerCase();

                        let phrase = '';
                        if (typeLower.includes('override') || typeLower.includes('set') || typeLower.includes('equal')) {
                          phrase = `${typeLabel} ${subject} to ${val}${isPct ? '%' : ''}`;
                        } else {
                          phrase = `${typeLabel} ${subject} by ${val}${isPct ? '%' : ''}`;
                        }

                        if (mult) {
                          phrase += ` based on ${mult}`;
                        }

                        return phrase;
                      })()}
                    </span>
                    {block.stopProcessing && (
                      <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold border border-amber-200">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{t('simulation.stopProcessingText')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}

// Inner helper render components
function RenderConditionGroup({ group, fields }: { group: ConditionGroupState; fields: FieldConfig[] }) {
  const t = useTranslations('ruleEngine');
  const hasMultiple = (group.conditions?.length || 0) + (group.groups?.length || 0) > 1;

  return (
    <div className="flex flex-col gap-1 pl-3 border-l-2 border-indigo-100 relative">
      {hasMultiple && (
        <span className="absolute -left-[9px] top-0.5 px-1 py-0 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider select-none leading-4">
          {group.logicalOperator}
        </span>
      )}

      {/* Conditions */}
      {group.conditions?.map((cond: ConditionState, idx: number) => {
        const valLabel = cond.valueLabel
          ? (Array.isArray(cond.valueLabel) ? cond.valueLabel.join(', ') : String(cond.valueLabel))
          : (Array.isArray(cond.value) ? cond.value.join(', ') : String(cond.value));

        const fieldObj = fields.find(
          (f) => f.fieldId === cond.fieldId || f.fieldName === cond.fieldId || f.databaseColumnName === cond.fieldId
        );
        const rawLabel = fieldObj?.fieldName || cond.fieldId;
        const displayLabel = getFieldLabel(cond.fieldId, rawLabel, t);

        return (
          <div key={cond.id} className="flex items-center gap-1.5 text-sm text-slate-800 py-0.5 hover:bg-slate-50 rounded px-1 transition-all">
            <span className="text-slate-400 font-medium text-xs">{idx + 1}.</span>
            <span className="font-bold text-slate-900">{displayLabel}</span>
            <span className="text-blue-600 font-semibold text-xs bg-blue-50/50 px-1.5 py-0 rounded border border-blue-100/50 leading-5">
              {getFriendlyOperatorLabel(cond.operator)}
            </span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0 rounded border border-slate-200/80 text-xs leading-5">
              {valLabel || t('simulation.emptyValue')}
            </span>
          </div>
        );
      })}

      {/* Subgroups */}
      {group.groups?.map((subGroup: ConditionGroupState) => (
        <RenderConditionGroup key={subGroup.id} group={subGroup} fields={fields} />
      ))}
    </div>
  );
}
