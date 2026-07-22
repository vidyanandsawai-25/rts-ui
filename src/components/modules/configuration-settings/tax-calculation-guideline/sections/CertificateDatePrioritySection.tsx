'use client';

import { useTranslations } from 'next-intl';
import { DATE_PRIORITY_OPTIONS } from '@/config/tax-calculation-guideline.config';
import type {
  DatePriorityOption,
  TaxCalculationGuidelineSectionProps,
} from '@/types/tax-calculation-guideline.types';
import { TaxSelect } from '../TaxFormField';

const PRIORITY_LABEL_KEYS: Record<number, string> = {
  1: 'fields.priority1',
  2: 'fields.priority2',
  3: 'fields.priority3',
  4: 'fields.priority4',
};

type PriorityKey = 'priority1' | 'priority2' | 'priority3' | 'priority4';

const PRIORITY_KEYS: PriorityKey[] = ['priority1', 'priority2', 'priority3', 'priority4'];

/**
 * Section 2 – Certificate Date Priority
 * Four ranked dropdowns that determine the order in which certificate dates are
 * evaluated. Priority 1 is the highest.
 */
export function CertificateDatePrioritySection({
  formData,
  onChange,
}: TaxCalculationGuidelineSectionProps) {
  const t = useTranslations('taxCalculationGuideline');
  const { certificateDatePriority } = formData;

  const isDisabled = !formData.generalSettings.enableCertificateBasedTax;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="border-b border-slate-100 px-4 py-2 shrink-0">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          {t('sections.datePriority')}
          <span className="text-xs font-normal text-slate-500">{t('sections.datePriorityHint')}</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-3 pb-4 lg:grid-cols-4">
        {PRIORITY_KEYS.map((key, idx) => (
          <TaxSelect
            key={key}
            label={t(PRIORITY_LABEL_KEYS[idx + 1])}
            options={DATE_PRIORITY_OPTIONS.map((opt) => ({
              ...opt,
              label: t(`options.priorities.${opt.value}`),
            }))}
            value={certificateDatePriority[key]}
            disabled={isDisabled}
            onChange={(val) =>
              onChange('certificateDatePriority', key, val as DatePriorityOption)
            }
          />
        ))}
      </div>
    </div>
  );
}
