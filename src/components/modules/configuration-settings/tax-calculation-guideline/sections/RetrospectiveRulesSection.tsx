'use client';

import { useTranslations } from 'next-intl';
import type { TaxCalculationGuidelineSectionProps } from '@/types/tax-calculation-guideline.types';
import { DynamicGuidelineField } from '../TaxFormField';

/**
 * Section 5 – Retrospective (No Date) Rules
 * Dynamically rendered based on metadata from the API.
 */
export function RetrospectiveRulesSection({ formData, onChangeGuideline }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { dynamicGuidelines = [], generalSettings } = formData;

  const retrospectiveGuidelines = dynamicGuidelines
    .filter((g) => g.guidelineGroup === 'RETROSPECTIVE')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const isCertTaxDisabled = !generalSettings.enableCertificateBasedTax;

  // Conditional disable logic
  const retroToggle = dynamicGuidelines.find((g) => g.guidelineCode === 'ENABLE_RETROSPECTIVE_TAX');
  const isRetroOff = retroToggle ? (retroToggle.guidelineValue !== 'true' && retroToggle.guidelineValue !== '1') : true;

  const noDateRule = dynamicGuidelines.find((g) => g.guidelineCode === 'NO_DATE_RULE');
  const isNoDateSelect = noDateRule ? (!noDateRule.guidelineValue || noDateRule.guidelineValue === 'Select') : true;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.retrospectiveRules')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 pb-4">
        {retrospectiveGuidelines.map((guideline) => {
          const code = guideline.guidelineCode;
          const isToggle = code === 'ENABLE_RETROSPECTIVE_TAX';
          const isDropdown = code === 'NO_DATE_RULE';
          
          // Disable lookback/multiplier if retro calculation is disabled or if noDateRule is Select
          const isFieldDisabled = isCertTaxDisabled || 
            (!isToggle && isRetroOff) || 
            (!isToggle && !isDropdown && isNoDateSelect);

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
