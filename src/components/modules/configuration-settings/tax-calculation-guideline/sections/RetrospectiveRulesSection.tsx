'use client';

import { useTranslations } from 'next-intl';
import { NO_DATE_RULE_OPTIONS } from '@/config/tax-calculation-guideline.config';
import type {
  NoDateRule,
  TaxCalculationGuidelineSectionProps,
} from '@/types/tax-calculation-guideline.types';
import { TaxNumberInput, TaxSelect } from '../TaxFormField';

/**
 * Section 5 – Retrospective (No Date) Rules
 * ─ When No Date is Available (dropdown)
 * ─ Lookback Years (number)
 * ─ Default Retrospective Multiplier (number)
 */
export function RetrospectiveRulesSection({
  formData,
  onChange,
}: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { retrospectiveRules } = formData;

  const isCertTaxDisabled = !formData.generalSettings.enableCertificateBasedTax;
  const isRetroDisabled = isCertTaxDisabled || retrospectiveRules.whenNoDateIsAvailable === 'Select';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.retrospectiveRules')}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 flex-1 min-h-0">
        {/* When No Date is Available */}
        <div className="min-w-[180px] flex-1">
          <TaxSelect
            label={t('fields.whenNoDateIsAvailable')}
            options={NO_DATE_RULE_OPTIONS.map((opt) => ({
              ...opt,
              label: t(`options.noDateRules.${opt.value}`),
            }))}
            value={retrospectiveRules.whenNoDateIsAvailable}
            disabled={isCertTaxDisabled}
            onChange={(val) =>
              onChange('retrospectiveRules', 'whenNoDateIsAvailable', val as NoDateRule)
            }
          />
        </div>

        {/* Lookback Years */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-700">{t('fields.lookbackYears')}</span>
          <TaxNumberInput
            value={retrospectiveRules.lookbackYears}
            onChange={(val) => onChange('retrospectiveRules', 'lookbackYears', val)}
            min={0}
            max={50}
            step={1}
            disabled={isRetroDisabled}
            className="w-20"
          />
        </div>

        {/* Default Retrospective Multiplier */}
        <TaxNumberInput
          label={t('fields.defaultRetrospectiveMultiplier')}
          value={retrospectiveRules.defaultRetrospectiveMultiplier}
          onChange={(val) => onChange('retrospectiveRules', 'defaultRetrospectiveMultiplier', val)}
          min={0}
          max={99}
          step={0.01}
          disabled={isRetroDisabled}
          className="w-28"
        />
      </div>
    </div>
  );
}
