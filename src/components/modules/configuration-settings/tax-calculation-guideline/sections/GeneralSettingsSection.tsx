'use client';

import { useTranslations } from 'next-intl';
import { ToggleSwitch } from '@/components/common';
import { MONTH_OPTIONS, DAY_OPTIONS } from '@/config/tax-calculation-guideline.config';
import type { TaxCalculationGuidelineSectionProps } from '@/types/tax-calculation-guideline.types';
import { TaxSelect } from '../TaxFormField';

/**
 * Section 1 – General Settings
 * ─ Enable Certificate Based Tax (toggle)
 * ─ Apply Tax Only For Protected Certificate Types (toggle)
 * ─ Financial Year Start (Month + Day dropdowns)
 */
export function GeneralSettingsSection({ formData, onChange }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { generalSettings } = formData;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.generalSettings')}</h2>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:gap-6 flex-1 min-h-0 justify-center">
        {/* Left – toggles */}
        <div className="flex flex-1 flex-col gap-2 justify-center">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-700">{t('fields.enableCertificateBasedTax')}</span>
            <ToggleSwitch
              id="enable-certificate-based-tax"
              checked={generalSettings.enableCertificateBasedTax}
              onChange={(val: boolean) => onChange('generalSettings', 'enableCertificateBasedTax', val)}
              showPopup={false}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-700">
              {t('fields.applyTaxOnlyForProtected')}
            </span>
            <ToggleSwitch
              id="apply-tax-only-for-protected"
              checked={generalSettings.applyTaxOnlyForProtectedCertificateTypes}
              onChange={(val: boolean) =>
                onChange('generalSettings', 'applyTaxOnlyForProtectedCertificateTypes', val)
              }
              showPopup={false}
            />
          </div>
        </div>

        {/* Right – Financial Year Start */}
        <div className="flex flex-col gap-1 sm:min-w-[200px]">
          <span className="text-xs font-semibold text-slate-700">{t('fields.financialYearStart')}</span>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TaxSelect
                label={t('fields.month')}
                options={MONTH_OPTIONS.map((opt) => ({
                  ...opt,
                  label: t(`options.months.${opt.value}`),
                }))}
                value={String(generalSettings.financialYearStart.month)}
                onChange={(val) =>
                  onChange('generalSettings', 'financialYearStart', {
                    ...generalSettings.financialYearStart,
                    month: val === 'Select' ? 'Select' : Number(val),
                  })
                }
              />
            </div>
            <div className="w-20">
              <TaxSelect
                label={t('fields.day')}
                options={DAY_OPTIONS.map((opt) => ({
                  ...opt,
                  label: opt.value === 'Select' ? t('options.select') : opt.label,
                }))}
                value={String(generalSettings.financialYearStart.day)}
                onChange={(val) =>
                  onChange('generalSettings', 'financialYearStart', {
                    ...generalSettings.financialYearStart,
                    day: val === 'Select' ? 'Select' : Number(val),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
