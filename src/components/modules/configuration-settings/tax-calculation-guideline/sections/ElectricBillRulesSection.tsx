'use client';

import { useTranslations } from 'next-intl';
import type { TaxCalculationGuidelineSectionProps } from '@/types/tax-calculation-guideline.types';
import { DynamicGuidelineField } from '../TaxFormField';

/**
 * Section 4 – Electric Bill Rules
 * Dynamically rendered based on metadata from the API.
 */
export function ElectricBillRulesSection({ formData, onChangeGuideline }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { dynamicGuidelines = [], generalSettings } = formData;

  const ebGuidelines = dynamicGuidelines
    .filter((g) => g.guidelineGroup === 'ELECTRIC_BILL')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const isCertTaxDisabled = !generalSettings.enableCertificateBasedTax;

  // Find date rule selection to determine conditional disable
  const dateRuleGuideline = dynamicGuidelines.find((g) => g.guidelineCode === 'ELECTRIC_BILL_DATE_RULE');
  const isEbDisabled = isCertTaxDisabled || !dateRuleGuideline || !dateRuleGuideline.guidelineValue || dateRuleGuideline.guidelineValue === 'Select';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.electricBillRules')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 pb-4">
        {ebGuidelines.map((guideline) => {
          const isDateRule = guideline.guidelineCode === 'ELECTRIC_BILL_DATE_RULE';
          const isFieldDisabled = isCertTaxDisabled || (!isDateRule && isEbDisabled);

          return (
            <div key={guideline.guidelineCode} className="flex flex-col justify-center min-h-0">
              <DynamicGuidelineField
                guideline={guideline}
                value={guideline.guidelineValue}
                onChange={(val) => onChangeGuideline?.(guideline.guidelineCode!, val)}
                disabled={isFieldDisabled}
                t={t}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
