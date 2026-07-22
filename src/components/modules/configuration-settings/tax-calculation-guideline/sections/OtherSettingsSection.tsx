'use client';

import { useTranslations } from 'next-intl';
import type { TaxCalculationGuidelineSectionProps } from '@/types/tax-calculation-guideline.types';
import { DynamicGuidelineField } from '../TaxFormField';

/**
 * Section 7 – Other Settings
 * Dynamically rendered based on metadata from the API.
 */
export function OtherSettingsSection({ formData, onChangeGuideline }: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { dynamicGuidelines = [], generalSettings } = formData;

  const otherGuidelines = dynamicGuidelines
    .filter((g) => g.guidelineGroup === 'OTHER')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const isCertTaxDisabled = !generalSettings.enableCertificateBasedTax;

  // Find proration toggle
  const prorationToggle = dynamicGuidelines.find((g) => g.guidelineCode === 'ENABLE_CURRENT_YEAR_PRORATION');
  const isProrationDisabled = isCertTaxDisabled || !prorationToggle || (prorationToggle.guidelineValue !== 'true' && prorationToggle.guidelineValue !== '1');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="text-sm font-bold text-slate-800">{t('sections.otherSettings')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3 pb-4">
        {otherGuidelines.map((guideline) => {
          const code = guideline.guidelineCode;
          const isProrationMethod = code === 'PRORATION_METHOD';
          const isFieldDisabled = isProrationMethod ? isProrationDisabled : isCertTaxDisabled;

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
