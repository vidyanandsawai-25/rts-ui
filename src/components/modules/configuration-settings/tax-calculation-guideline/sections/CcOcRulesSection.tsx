'use client';

import { useTranslations } from 'next-intl';
import { ToggleSwitch } from '@/components/common';
import { DURATION_UNIT_OPTIONS } from '@/config/tax-calculation-guideline.config';
import type {
  DurationUnit,
  TaxCalculationGuidelineSectionProps,
} from '@/types/tax-calculation-guideline.types';
import { cn } from '@/lib/utils/cn';
import { TaxNumberInput, TaxSelect } from '../TaxFormField';

/**
 * Section 3 – CC & OC Rules
 * ─ Apply CC to OC Split (toggle)
 * ─ CC – OC difference threshold (number + unit)
 * ─ CC Period Multiplier
 * ─ OC Period Multiplier
 */
export function CcOcRulesSection({ formData, onChange }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { ccOcRules } = formData;
  const isCertTaxDisabled = !formData.generalSettings.enableCertificateBasedTax;
  const isSplitDisabled = isCertTaxDisabled || !ccOcRules.applyCcToOcSplit;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.ccOcRules')}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 flex-1 min-h-0">
        {/* Toggle */}
        <div className={cn("flex flex-col gap-1", isCertTaxDisabled && "opacity-60 pointer-events-none")}>
          <span className="text-xs font-medium text-slate-700">{t('fields.applyCcToOcSplit')}</span>
          <ToggleSwitch
            id="apply-cc-to-oc-split"
            checked={ccOcRules.applyCcToOcSplit}
            disabled={isCertTaxDisabled}
            onChange={(val: boolean) => onChange('ccOcRules', 'applyCcToOcSplit', val)}
            showPopup={false}
          />
        </div>

        {/* Threshold – number + unit */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">
            {t('fields.ccOcDiffLabel')}
          </span>
          <div className="flex items-end gap-2">
            <TaxNumberInput
              value={ccOcRules.ccOcDifferenceThreshold}
              onChange={(val) => onChange('ccOcRules', 'ccOcDifferenceThreshold', val)}
              min={0}
              max={999}
              step={1}
              disabled={isSplitDisabled}
              className="w-20"
            />
            <TaxSelect
              options={DURATION_UNIT_OPTIONS.map((opt) => ({
                ...opt,
                label: t(`options.units.${opt.value}`),
              }))}
              value={ccOcRules.ccOcDifferenceUnit}
              disabled={isSplitDisabled}
              onChange={(val) => onChange('ccOcRules', 'ccOcDifferenceUnit', val as DurationUnit)}
              className="w-28"
            />
          </div>
        </div>

        {/* CC Period Multiplier */}
        <TaxNumberInput
          label={t('fields.ccPeriodMultiplier')}
          value={ccOcRules.ccPeriodMultiplier}
          onChange={(val) => onChange('ccOcRules', 'ccPeriodMultiplier', val)}
          min={0}
          max={99}
          step={0.01}
          disabled={isSplitDisabled}
          className="w-28"
        />

        {/* OC Period Multiplier */}
        <TaxNumberInput
          label={t('fields.ocPeriodMultiplier')}
          value={ccOcRules.ocPeriodMultiplier}
          onChange={(val) => onChange('ccOcRules', 'ocPeriodMultiplier', val)}
          min={0}
          max={99}
          step={0.01}
          disabled={isSplitDisabled}
          className="w-28"
        />
      </div>
    </div>
  );
}
