import { getTranslations } from 'next-intl/server';
import { ToastNotifier } from '@/components/common';
import type { OldDetailsData } from '@/types/ptis.types';

import type { RateableValueResponse } from '@/types/rateableValue.types';
import { RateableTaxTable } from './components/RateableTaxTable';
import { ValuationSummaryFooter } from '@/components/modules/property-tax/ptis/shared/ValuationSummaryFooter';
import { getRateableValue } from '@/app/[locale]/property-tax/ptis/RateableValue.action';
import { calculateRateableTotal } from '@/lib/utils/ptis-calculations';
import { resolveValuationData } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';

interface Props {
  propertyId?: number;
  oldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  rateableData?: RateableValueResponse | null;
  hasFetchedData?: boolean;
  error?: string;
  showInlineError?: boolean;
  locale: string;
}

export async function RateableTaxDetailsSection({
  propertyId,
  oldDetails,
  searchParams,
  rateableData: initialData,
  hasFetchedData = false,
  error: initialError,
  showInlineError = true,
  locale,
}: Props) {
  
  const { data: rateableData, error } = await resolveValuationData<RateableValueResponse>({
    propertyId,
    initialData,
    initialError,
    hasFetchedInitialData: hasFetchedData,
    fetcher: getRateableValue,
    fallbackUserMessage: 'Unable to load rateable valuation details.',
  });

  const t = await getTranslations({ locale, namespace: 'ptis.modules.PtisTaxDetails' });
  const { rv, tax, alv } = calculateRateableTotal(rateableData);

  const oldAreaRV = Number(oldDetails?.oldRV || 0);
  const oldAreaALV = Number(oldDetails?.oldALV || 0);
  const oldAreaTax = Number(oldDetails?.oldTotalTax || 0);

  const finalErrorMessage = error || null;

  return (
    <div className="space-y-0.5 p-0.5">
      {showInlineError && finalErrorMessage && <ToastNotifier message={finalErrorMessage} />}
      <RateableTaxTable locale={locale} rateableData={rateableData} searchParams={searchParams} />


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
}
