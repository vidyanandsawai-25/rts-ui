'use client';

import React, { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Zap, FileText, Shield } from 'lucide-react';
import { Select, Input, Badge } from '@/components/common';
import { useRetrospectiveRuleActions } from '@/hooks/configuration-settings/retrospective-rule-library/useRetrospectiveRuleActions';
import type { EvidenceItemCode } from '@/types/retrospective-rule.types';

interface ActionsSectionProps {
  ruleCode?: string;
  ruleName?: string;
  taxStartsFrom: string;
  onTaxStartsFromChange: (val: string) => void;
  retrospectiveLimit: string;
  onRetrospectiveLimitChange: (val: string) => void;
  maximumYears: number | string;
  onMaximumYearsChange: (val: number | string) => void;
  taxCalculation: string;
  onTaxCalculationChange: (val: string) => void;
  taxMultiplier: number | string;
  onTaxMultiplierChange: (val: number | string) => void;
  isAuthorized: boolean;
  availableEvidence: EvidenceItemCode[];
  compareEvidenceDates: string;
  formErrors?: Record<string, string>;
}

export const ActionsSection: React.FC<ActionsSectionProps> = memo(({
  taxStartsFrom,
  onTaxStartsFromChange,
  retrospectiveLimit,
  onRetrospectiveLimitChange,
  maximumYears,
  onMaximumYearsChange,
  taxCalculation,
  onTaxCalculationChange,
  taxMultiplier,
  onTaxMultiplierChange,
  isAuthorized,
  availableEvidence,
  compareEvidenceDates,
  formErrors,
}) => {
  const t = useTranslations('retrospectiveRuleLibrary.builder.actions');
  const { taxStartModes, limitTypes, taxCalculationModes, isLoading } = useRetrospectiveRuleActions();

  // Resolve selection values matching code or label or fallback to empty string
  const selectedTaxStartValue = React.useMemo(() => {
    if (!taxStartModes || taxStartModes.length === 0) return taxStartsFrom;
    const match = taxStartModes.find(
      (m) => m.code === taxStartsFrom || m.label === taxStartsFrom
    );
    return match ? match.code : taxStartsFrom || '';
  }, [taxStartModes, taxStartsFrom]);

  const selectedLimitValue = React.useMemo(() => {
    if (!limitTypes || limitTypes.length === 0) return retrospectiveLimit;
    const match = limitTypes.find(
      (m) => m.code === retrospectiveLimit || m.label === retrospectiveLimit
    );
    return match ? match.code : retrospectiveLimit || '';
  }, [limitTypes, retrospectiveLimit]);

  const selectedCalcValue = React.useMemo(() => {
    if (!taxCalculationModes || taxCalculationModes.length === 0) return taxCalculation;
    const match = taxCalculationModes.find(
      (m) => m.code === taxCalculation || m.label === taxCalculation
    );
    return match ? match.code : taxCalculation || '';
  }, [taxCalculationModes, taxCalculation]);

  const taxStartOptions = React.useMemo(() => {
    const opts = taxStartModes.map((m) => ({ label: m.label, value: m.code }));
    if (selectedTaxStartValue && !opts.some((o) => o.value === selectedTaxStartValue)) {
      opts.push({ label: selectedTaxStartValue, value: selectedTaxStartValue });
    }
    return [{ label: 'Select...', value: '' }, ...opts];
  }, [taxStartModes, selectedTaxStartValue]);

  const limitOptions = React.useMemo(() => {
    const opts = limitTypes.map((m) => ({ label: m.label, value: m.code }));
    if (selectedLimitValue && !opts.some((o) => o.value === selectedLimitValue)) {
      opts.push({ label: selectedLimitValue, value: selectedLimitValue });
    }
    return [{ label: 'Select...', value: '' }, ...opts];
  }, [limitTypes, selectedLimitValue]);

  const taxCalcOptions = React.useMemo(() => {
    const opts = taxCalculationModes.map((m) => ({ label: m.label, value: m.code }));
    if (selectedCalcValue && !opts.some((o) => o.value === selectedCalcValue)) {
      opts.push({ label: selectedCalcValue, value: selectedCalcValue });
    }
    return [{ label: 'Select...', value: '' }, ...opts];
  }, [taxCalculationModes, selectedCalcValue]);

  return (
    <section id="section-actions" className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden h-full flex flex-col justify-between">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Zap className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-900">{t('title')}</h2>
            <p className="text-[11px] text-gray-500">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="destructive" size="sm" className="font-bold tracking-wider">
          {t('badge')}
        </Badge>
      </div>

      <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
        {/* Retrospective Tax Sub-section */}
        <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/40 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-700" />
            <div>
              <h3 className="text-[11px] font-bold text-gray-900">{t('retrospectiveTaxTitle')}</h3>
              <p className="text-[10px] text-gray-500">{t('retrospectiveTaxSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            <div>
              <Select
                label={t('taxStartsFromLabel')}
                required
                options={taxStartOptions}
                value={selectedTaxStartValue}
                onChange={(_e, val) => onTaxStartsFromChange(val)}
                disabled={isLoading}
                error={formErrors?.taxStartsFrom}
                selectSize="sm"
                className="w-full text-xs"
              />
            </div>

            <div>
              <Select
                label={t('limitLabel')}
                required
                options={limitOptions}
                value={selectedLimitValue}
                onChange={(_e, val) => onRetrospectiveLimitChange(val)}
                disabled={isLoading}
                error={formErrors?.retrospectiveLimit}
                selectSize="sm"
                className="w-full text-xs"
              />
            </div>

            <div>
              <Input
                label={t('maxYearsLabel')}
                required={Boolean(
                  retrospectiveLimit &&
                    (retrospectiveLimit.toLowerCase().includes('max') ||
                      retrospectiveLimit.toLowerCase().includes('years'))
                )}
                type="number"
                min={1}
                max={20}
                value={maximumYears}
                onChange={(e) => onMaximumYearsChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={formErrors?.maximumYears}
                className="w-full text-xs"
              />
            </div>

            <div>
              <Select
                label={t('taxCalcLabel')}
                required
                options={taxCalcOptions}
                value={selectedCalcValue}
                onChange={(_e, val) => onTaxCalculationChange(val)}
                disabled={isLoading}
                error={formErrors?.taxCalculation}
                selectSize="sm"
                className="w-full text-xs"
              />
            </div>

            <div>
              <Input
                label={t('multiplierLabel')}
                required
                type="number"
                step="0.1"
                min={0.1}
                max={10}
                value={taxMultiplier}
                onChange={(e) => onTaxMultiplierChange(e.target.value === '' ? '' : Number(e.target.value))}
                error={formErrors?.taxMultiplier}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
            {t('taxationUsedNotice')}
          </div>
        </div>

        {/* Unauthorized Construction Penalty Banner */}
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/40 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-gray-700" />
            <div>
              <h3 className="text-[11px] font-bold text-gray-900">{t('unauthorizedPenaltyTitle')}</h3>
              <p className="text-[10px] text-gray-500">{t('unauthorizedPenaltySubtitle')}</p>
            </div>
          </div>

          {isAuthorized ? (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800">
              <span className="font-bold">{t('authorizedNotice')}</span> — {t('authorizedHelp')}
            </div>
          ) : (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800">
              <span className="font-bold">{t('unauthorizedNotice')}</span> — {t('unauthorizedHelp')}
            </div>
          )}
        </div>

        {/* Rule Summary */}
        <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-2 shadow-2xs">
          <h3 className="text-[11px] font-bold text-gray-900">{t('summaryTitle')}</h3>
          <div className="text-[11px] space-y-1">
            <div className="flex items-start gap-2">
              <span className="font-bold text-gray-500 w-14">{t('summaryWhen')}</span>
              <span className="text-gray-800">
                {t('summaryAvailable', {
                  evidence: availableEvidence.join(', '),
                  compareDate: compareEvidenceDates,
                })}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-gray-500 w-14">{t('summaryTax')}</span>
              <span className="text-gray-800">
                {t('summaryTaxDetail', {
                  years: maximumYears,
                  multiplier: taxMultiplier,
                })}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-gray-500 w-14">{t('summaryPenalty')}</span>
              <span className="text-gray-800">
                {isAuthorized ? t('summaryNotApplicable') : t('summaryApplyPenalty')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ActionsSection.displayName = 'ActionsSection';
