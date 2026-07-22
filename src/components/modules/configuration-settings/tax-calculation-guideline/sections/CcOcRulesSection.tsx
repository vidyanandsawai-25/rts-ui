'use client';

import { useTranslations } from 'next-intl';
import type { TaxCalculationGuidelineSectionProps } from '@/types/tax-calculation-guideline.types';
import { DynamicGuidelineField } from '../TaxFormField';

/**
 * Section 3 – CC & OC Rules
 * Dynamically rendered based on metadata from the API.
 */
export function CcOcRulesSection({ formData, onChangeGuideline }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { dynamicGuidelines = [], generalSettings } = formData;

  const ccOcGuidelines = dynamicGuidelines
    .filter((g) => g.guidelineGroup === 'CC_OC')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const isCertTaxDisabled = !generalSettings.enableCertificateBasedTax;
  
  // Find Split toggle to determine conditional disable
  const splitGuideline = dynamicGuidelines.find(g => g.guidelineCode === 'ENABLE_CC_TO_OC_SPLIT');
  const isSplitOff = splitGuideline ? (splitGuideline.guidelineValue !== 'true' && splitGuideline.guidelineValue !== '1') : true;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.ccOcRules')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 pb-4">
        {ccOcGuidelines.map((guideline) => {
          const isToggle = guideline.guidelineCode === 'ENABLE_CC_TO_OC_SPLIT';
          const isFieldDisabled = isCertTaxDisabled || (!isToggle && isSplitOff);

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
