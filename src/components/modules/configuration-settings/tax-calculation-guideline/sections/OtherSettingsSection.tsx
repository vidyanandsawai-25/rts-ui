'use client';

import { useTranslations } from 'next-intl';
import { ToggleSwitch } from '@/components/common';
import {
  PRORATION_TYPE_OPTIONS,
  TAX_PERSISTENCE_MODE_OPTIONS,
} from '@/config/tax-calculation-guideline.config';
import type {
  ProrationType,
  TaxCalculationGuidelineSectionProps,
  TaxPersistenceMode,
} from '@/types/tax-calculation-guideline.types';
import { cn } from '@/lib/utils/cn';
import { TaxSelect } from '../TaxFormField';

/**
 * Section 7 – Other Settings
 * ─ Enable Current Year Proration (toggle)
 * ─ Proration Method (dropdown)
 * ─ Tax Persistence Mode (dropdown)
 */
export function OtherSettingsSection({ formData, onChange }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { otherSettings } = formData;

  const isCertTaxDisabled = !formData.generalSettings.enableCertificateBasedTax;
  const isProrationDisabled = isCertTaxDisabled || !otherSettings.enableCurrentYearProration;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.otherSettings')}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 flex-1 min-h-0">
        {/* Enable Proration */}
        <div className={cn("flex flex-col gap-1", isCertTaxDisabled && "opacity-60 pointer-events-none")}>
          <span className="text-xs font-medium text-slate-700">{t('fields.enableProration')}</span>
          <ToggleSwitch
            id="enable-current-year-proration"
            checked={otherSettings.enableCurrentYearProration}
            disabled={isCertTaxDisabled}
            onChange={(val: boolean) => onChange('otherSettings', 'enableCurrentYearProration', val)}
            showPopup={false}
          />
        </div>

        {/* Proration Method */}
        <TaxSelect
          label={t('fields.prorationMethod')}
          options={PRORATION_TYPE_OPTIONS.map((opt) => ({
            ...opt,
            label: t(`options.proration.${opt.value}`),
          }))}
          value={otherSettings.prorationType}
          disabled={isProrationDisabled}
          onChange={(val) => onChange('otherSettings', 'prorationType', val as ProrationType)}
          className="min-w-[130px]"
        />

        {/* Tax Persistence Mode */}
        <TaxSelect
          label={t('fields.taxPersistenceMode')}
          options={TAX_PERSISTENCE_MODE_OPTIONS.map((opt) => ({
            ...opt,
            label: t(`options.persistence.${opt.value}`),
          }))}
          value={otherSettings.taxPersistenceMode}
          disabled={isCertTaxDisabled}
          onChange={(val) =>
            onChange('otherSettings', 'taxPersistenceMode', val as TaxPersistenceMode)
          }
          className="min-w-[180px]"
        />
      </div>
    </div>
  );
}
