import { getTranslations } from 'next-intl/server';
import { ToastNotifier } from '@/components/common';
import type { OldDetailsData } from '@/types/ptis.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import { CapitalTaxTable } from './components/CapitalTaxTable';
import { ValuationSummaryFooter } from '@/components/modules/property-tax/ptis/shared/ValuationSummaryFooter';
import { getCapitalValue } from '@/app/[locale]/property-tax/ptis/CapitalValue.action';
import { calculateCapitalTotal } from '@/lib/utils/ptis-calculations';
import { resolveValuationData } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';
import { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';

interface Props {
  propertyId?: number;
  oldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  capitalData?: CapitalValueResponse | null;
  hasFetchedData?: boolean;
  error?: string;
  showInlineError?: boolean;
  initialTaxDetails?: TaxDetailsData;
  taxDetailsError?: string;
  locale: string;
}

export async function CapitalTaxDetailsSection({
  propertyId,
  oldDetails,
  searchParams,
  capitalData: initialData,
  hasFetchedData = false,
  error: initialError,
  showInlineError = true,
  initialTaxDetails,
  taxDetailsError,
  locale,
}: Props) {
  
  const { data: capitalData, error } = await resolveValuationData<CapitalValueResponse>({
    propertyId,
    initialData,
    initialError,
    hasFetchedInitialData: hasFetchedData,
    fetcher: getCapitalValue,
    fallbackUserMessage: 'Unable to load capital valuation details.',
  });

  const t = await getTranslations({ locale, namespace: 'ptis.modules.PtisTaxDetails' });
  const { cv, tax } = calculateCapitalTotal(capitalData);

  const finalErrorMessage = error || null;

  return (
    <div className="space-y-0.5 p-0.5">
      {showInlineError && (finalErrorMessage || taxDetailsError) && (
        <ToastNotifier message={finalErrorMessage || taxDetailsError || ''} />
      )}
      <CapitalTaxTable locale={locale} capitalData={capitalData} searchParams={searchParams} />
      <ValuationSummaryFooter
        title={t('title')}
        badges={[
          { label: t('oldTotalCv'), value: Number(oldDetails.oldCV) || 0, color: 'blue' },
          { label: t('oldTotalTax'), value: Number(oldDetails.oldTotalTax) || 0, color: 'blue' },
          { label: t('totalCv'), value: cv, color: 'purple' },
          { label: t('totalTax'), value: tax, color: 'purple' },
        ]}
        initialTaxDetails={initialTaxDetails}
      />
    </div>
  );
}
