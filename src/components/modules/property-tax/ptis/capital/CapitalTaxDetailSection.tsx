'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ToastNotifier } from '@/components/common';
import type { OldDetailsData } from '@/types/ptis.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import { CapitalTaxTable } from './components/CapitalTaxTable';
import { ValuationSummaryFooter } from '@/components/modules/property-tax/ptis/shared/ValuationSummaryFooter';
import { calculateCapitalTotal } from '@/lib/utils/ptis-calculations';

interface Props {
  propertyId?: number;
  oldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  capitalData?: CapitalValueResponse | null;
  error?: string;
  showInlineError?: boolean;
  locale: string;
}

export const CapitalTaxDetailsSection: React.FC<Props> = ({
  capitalData,
  oldDetails,
  searchParams,
  error,
  showInlineError = true,
  locale,
}) => {
  const t = useTranslations('ptis.modules.PtisTaxDetails');
  const { cv, tax } = calculateCapitalTotal(capitalData || null);

  return (
    <div className="space-y-0.5 p-0.5">
      {showInlineError && error && <ToastNotifier message={error} />}
      <CapitalTaxTable locale={locale} capitalData={capitalData || null} searchParams={searchParams} />
      <ValuationSummaryFooter
        title={t('title')}
        badges={[
          { label: t('oldTotalCv'), value: Number(oldDetails.oldCV) || 0, color: 'blue' },
          { label: t('oldTotalTax'), value: Number(oldDetails.oldTotalTax) || 0, color: 'blue' },
          { label: t('totalCv'), value: cv, color: 'purple' },
          { label: t('totalTax'), value: tax, color: 'purple' },
        ]}
      />
    </div>
  );
};
