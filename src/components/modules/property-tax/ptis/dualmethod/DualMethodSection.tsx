import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ToastNotifier } from '@/components/common';
import { getTranslations } from 'next-intl/server';
import { DualMethodComparisonTable } from './components/ComparisonTable';
import { DualMethodSummary } from './components/DualMethodSummary';
import { DualMethodFloorDetails } from './components/DualMethodFloorDetails';
import { buildPtisUrl } from '@/lib/utils/params';
import { OldDetailsData } from '@/types/ptis.types';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';
import { DUAL_METHOD_QUERY_PARAMS } from './constants';
import { assembleDualMethodSectionData } from './dual-method-data';

interface DualMethodSectionProps {
  propertyId?: number;
  initialOldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}

export async function DualMethodSection({
  propertyId,
  initialOldDetails,
  searchParams,
  locale,
}: DualMethodSectionProps) {
  const rawShowDetails = Array.isArray(searchParams.showDetails)
    ? searchParams.showDetails[searchParams.showDetails.length - 1]
    : searchParams.showDetails;
  const canShowFloorDetails = propertyId != null;
  const showFloorDetails =
    canShowFloorDetails && rawShowDetails === DUAL_METHOD_QUERY_PARAMS.SHOW_DETAILS;
  const {
    initialDualMethodData,
    initialRateableData,
    initialCapitalData,
    hasFetchedRateableData,
    hasFetchedCapitalData,
    rateableError,
    capitalError,
    finalErrorMessage,
    oldRv,
    oldTax,
    aggregatedRv,
    aggregatedCv,
    rvTotalTax,
    cvTotalTax,
    retainTotalTax,
  } = await assembleDualMethodSectionData(propertyId, initialOldDetails);

  const t = await getTranslations({ locale, namespace: 'ptis.modules.DualMethod' });
  const ptisPath = `/${locale}/property-tax/ptis`;
  const toggleHref = `${ptisPath}${buildPtisUrl(searchParams, {
    showDetails: !showFloorDetails,
  })}`;

  return (
    <div className="space-y-1 bg-slate-50 px-1">
      <DualMethodSummary
        locale={locale}
        oldData={{ rv: oldRv, tax: oldTax }}
        rateableData={{ totalRv: aggregatedRv, totalTax: rvTotalTax }}
        capitalData={{ totalCv: aggregatedCv, totalTax: cvTotalTax }}
        retainTotalTax={retainTotalTax}
      />

      {finalErrorMessage && <ToastNotifier message={finalErrorMessage} />}

      <DualMethodComparisonTable locale={locale} dualMethodData={initialDualMethodData} />

      {canShowFloorDetails && (
        <div className="my-1 flex justify-center">
          <Link href={toggleHref} className={PTIS_UI_CLASSES.expandButton}>
            {showFloorDetails ? (
              <>
                {t('buttons.hideFloorDetails')} <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {t('buttons.showFloorDetails')} <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Link>
        </div>
      )}

      {showFloorDetails && (
        <DualMethodFloorDetails
          locale={locale}
          propertyId={propertyId}
          initialRateableData={initialRateableData}
          initialCapitalData={initialCapitalData}
          hasFetchedRateableData={hasFetchedRateableData}
          hasFetchedCapitalData={hasFetchedCapitalData}
          rateableError={rateableError}
          capitalError={capitalError}
          initialOldDetails={initialOldDetails}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}
