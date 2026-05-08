'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ToastNotifier } from '@/components/common';
import type { OldDetailsData } from '@/types/ptis.types';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import { RateableTaxTable } from './components/RateableTaxTable';
import { ValuationSummaryFooter } from '@/components/modules/property-tax/ptis/shared/ValuationSummaryFooter';
import { calculateRateableTotal } from '@/lib/utils/ptis-calculations';
import { PTIS_TABLE_PRESETS } from '../constants';

interface Props {
  propertyId?: number;
  oldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  rateableData?: RateableValueResponse | null;
  error?: string;
  showInlineError?: boolean;
  locale: string;
}

export const RateableTaxDetailsSection: React.FC<Props> = ({
  rateableData,
  oldDetails,
  searchParams,
  error,
  showInlineError = true,
  locale,
}) => {
  const t = useTranslations('ptis.modules.PtisTaxDetails');
  const { rv, tax, alv } = calculateRateableTotal(rateableData || null);

  const oldAreaRV = Number(oldDetails?.oldRV || 0);
  const oldAreaALV = Number(oldDetails?.oldALV || 0);
  const oldAreaTax = Number(oldDetails?.oldTotalTax || 0);

  return (
    <div className="space-y-0.5 p-0.5">
      {showInlineError && error && <ToastNotifier message={error} />}
      <RateableTaxTable locale={locale} rateableData={rateableData || null} searchParams={searchParams} />

      <ValuationSummaryFooter
        title={t('title')}
        badges={[
          { label: t('oldTotalRv'), value: oldAreaRV, color: 'blue' },
          { label: t('oldTotalTax'), value: oldAreaTax, color: 'blue' },
          { label: t('totalRv'), value: rv, color: 'purple' },
          { label: t('totalTax'), value: tax, color: 'purple' },
          { label: t('oldTotalAlv'), value: oldAreaALV, color: 'blue' },
          { label: t('totalAlv'), value: alv, color: 'purple' },
        ]}
      />
    </div>
  );
};
