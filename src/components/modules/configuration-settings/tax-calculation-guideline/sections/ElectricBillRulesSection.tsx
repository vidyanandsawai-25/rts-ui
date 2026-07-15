'use client';

import { useTranslations } from 'next-intl';
import {
  ELECTRIC_BILL_DATE_RULE_OPTIONS,
  DURATION_UNIT_OPTIONS,
} from '@/config/tax-calculation-guideline.config';
import type {
  DurationUnit,
  ElectricBillDateRule,
  TaxCalculationGuidelineSectionProps,
} from '@/types/tax-calculation-guideline.types';
import { TaxNumberInput, TaxSelect } from '../TaxFormField';

/**
 * Section 4 – Electric Bill Rules
 * ─ Electric Bill Date Rule (dropdown)
 * ─ Add Months to Electric Bill Date (number + unit)
 * ─ Electric Bill Multiplier
 */
export function ElectricBillRulesSection({
  formData,
  onChange,
}: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { electricBillRules } = formData;

  const isCertTaxDisabled = !formData.generalSettings.enableCertificateBasedTax;
  const isEbDisabled = isCertTaxDisabled || electricBillRules.electricBillDateRule === 'Select';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.electricBillRules')}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 flex-1 min-h-0">
        {/* Date Rule */}
        <div className="min-w-[180px] flex-1">
          <TaxSelect
            label={t('fields.electricBillDateRule')}
            options={ELECTRIC_BILL_DATE_RULE_OPTIONS.map((opt) => ({
              ...opt,
              label: t(`options.ebRules.${opt.value}`),
            }))}
            value={electricBillRules.electricBillDateRule}
            disabled={isCertTaxDisabled}
            onChange={(val) =>
              onChange('electricBillRules', 'electricBillDateRule', val as ElectricBillDateRule)
            }
          />
        </div>

        {/* Add Months */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-700">{t('fields.addMonths')}</span>
          <div className="flex items-end gap-2">
            <TaxNumberInput
              value={electricBillRules.addMonthsToElectricBillDate}
              onChange={(val) => onChange('electricBillRules', 'addMonthsToElectricBillDate', val)}
              min={0}
              max={120}
              step={1}
              disabled={isEbDisabled}
              className="w-20"
            />
            <TaxSelect
              options={DURATION_UNIT_OPTIONS.map((opt) => ({
                ...opt,
                label: t(`options.units.${opt.value}`),
              }))}
              value={electricBillRules.addMonthsUnit}
              disabled={isEbDisabled}
              onChange={(val) =>
                onChange('electricBillRules', 'addMonthsUnit', val as DurationUnit)
              }
              className="w-28"
            />
          </div>
        </div>

        {/* Multiplier */}
        <TaxNumberInput
          label={t('fields.electricBillMultiplier')}
          value={electricBillRules.electricBillMultiplier}
          onChange={(val) => onChange('electricBillRules', 'electricBillMultiplier', val)}
          min={0}
          max={99}
          step={0.01}
          disabled={isEbDisabled}
          className="w-28"
        />
      </div>
    </div>
  );
}
