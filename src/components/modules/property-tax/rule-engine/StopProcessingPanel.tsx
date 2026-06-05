'use client';

import React from 'react';
import { ShieldOff, AlertTriangle } from 'lucide-react';
import { MultiSelect, Input } from '@/components/common';
import { useTranslations } from 'next-intl';
import { fetchAllRulesForSkipAction } from '@/app/[locale]/property-tax/rule-engine/actions';

interface StopProcessingPanelProps {
  /** Whether to halt evaluation after this rule matches */
  stopProcessing: boolean;
  onStopProcessingChange: (val: boolean) => void;
  /** IDs (as strings) of rules to skip */
  skipRuleIds: string[];
  onSkipRuleIdsChange: (ids: string[]) => void;
  /** Human-readable exclusion reason */
  exclusionReason: string;
  onExclusionReasonChange: (val: string) => void;
  /** ID of the current rule being edited — excluded from the skip list */
  currentRuleId?: number;
}

/**
 * StopProcessingPanel
 * Renders the "Stop Processing" section below the EffectPanel.
 * When the toggle is ON:
 *   - Lets the author pick one or more rules to skip via a MultiSelect.
 *   - Accepts a free-text exclusion reason for audit trail.
 */
export default function StopProcessingPanel({
  stopProcessing,
  onStopProcessingChange,
  skipRuleIds,
  onSkipRuleIdsChange,
  exclusionReason,
  onExclusionReasonChange,
  currentRuleId,
}: StopProcessingPanelProps) {
  const t = useTranslations('ruleEngine');
  const [ruleOptions, setRuleOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch available rules once when the toggle is turned ON
  React.useEffect(() => {
    if (!stopProcessing) return;
    if (ruleOptions.length > 0) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    fetchAllRulesForSkipAction()
      .then((opts) => {
        if (!cancelled) {
          setRuleOptions(
            currentRuleId
              ? opts.filter((o) => o.value !== String(currentRuleId))
              : opts
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stopProcessing, currentRuleId, ruleOptions.length]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ─── Section divider ──────────────────────────────────────── */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-dashed border-zinc-300" />
        <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {t('stopProcessing.sectionLabel')}
        </span>
        <div className="flex-grow border-t border-dashed border-zinc-300" />
      </div>

      {/* ─── Toggle row ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${stopProcessing ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400'}`}>
            <ShieldOff className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t('stopProcessing.toggleLabel')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('stopProcessing.toggleHint')}</p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={stopProcessing}
          aria-label={t('stopProcessing.toggleLabel')}
          onClick={() => onStopProcessingChange(!stopProcessing)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${stopProcessing ? 'bg-amber-500' : 'bg-zinc-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
              ${stopProcessing ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* ─── Expanded panel (shown only when toggle is ON) ────────── */}
      {stopProcessing && (
        <div className="flex flex-col gap-4 p-4 bg-amber-50/40 border border-amber-200 rounded-xl">

          {/* Warning callout */}
          <div className="flex items-start gap-2 text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium leading-relaxed">{t('stopProcessing.warningText')}</p>
          </div>

          {/* Skip rules multiselect */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700">
              {t('stopProcessing.skipRulesLabel')}
              <span className="text-zinc-400 font-normal ml-1 text-xs">
                ({t('stopProcessing.optional')})
              </span>
            </label>
            <MultiSelect
              id="skip-rule-ids"
              options={ruleOptions}
              value={skipRuleIds}
              onChange={onSkipRuleIdsChange}
              placeholder={
                loading
                  ? t('stopProcessing.loadingRules')
                  : t('stopProcessing.skipRulesPlaceholder')
              }
              disabled={loading}
            />
            {skipRuleIds.length > 0 && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('stopProcessing.skipRulesSelected', { count: skipRuleIds.length })}
              </p>
            )}
          </div>

          {/* Exclusion reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-zinc-700" htmlFor="exclusion-reason">
              {t('stopProcessing.exclusionReasonLabel')}
              <span className="text-zinc-400 font-normal ml-1 text-xs">
                ({t('stopProcessing.optional')})
              </span>
            </label>
            <Input
              id="exclusion-reason"
              value={exclusionReason}
              onChange={(e) => onExclusionReasonChange(e.target.value)}
              placeholder={t('stopProcessing.exclusionReasonPlaceholder')}
              fullWidth
            />
          </div>
        </div>
      )}
    </div>
  );
}
