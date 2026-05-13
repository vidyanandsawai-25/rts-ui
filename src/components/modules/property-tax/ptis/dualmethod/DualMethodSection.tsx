'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ToastNotifier } from '@/components/common';
import { useTranslations } from 'next-intl';
import { DualMethodComparisonTable } from './components/ComparisonTable';
import { DualMethodSummary } from './components/DualMethodSummary';
import { DualMethodFloorDetails } from './components/DualMethodFloorDetails';
import { buildPtisUrl } from '@/lib/utils/params';
import { OldDetailsData } from '@/types/ptis.types';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';
import { DUAL_METHOD_QUERY_PARAMS } from './constants';
import type { DualMethodSectionData } from './dual-method-data';

interface DualMethodSectionProps {
  propertyId?: number;
  initialOldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
  initialData?: DualMethodSectionData;
}

export const DualMethodSection: React.FC<DualMethodSectionProps> = ({
  propertyId,
  initialOldDetails,
  searchParams,
  locale,
  initialData,
}) => {
  const t = useTranslations('ptis.modules.DualMethod');

  if (!initialData) {
    return (
      <div className="p-10 text-center text-gray-500 italic">
        {t('messages.noData')}
      </div>
    );
  }

  const {
    initialDualMethodData,
    initialRateableData,
    initialCapitalData,
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
  } = initialData;

  const rawShowDetails = Array.isArray(searchParams.showDetails)
    ? searchParams.showDetails[searchParams.showDetails.length - 1]
    : searchParams.showDetails;
    
  const canShowFloorDetails = propertyId != null;
  const showFloorDetails = canShowFloorDetails && rawShowDetails === DUAL_METHOD_QUERY_PARAMS.SHOW_DETAILS;
  
  const ptisPath = `/${locale}/property-tax/ptis`;
  const toggleHref = `${ptisPath}${buildPtisUrl(searchParams as Record<string, string | string[] | undefined>, {
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
          <Link href={toggleHref} className={PTIS_UI_CLASSES.expandButton} scroll={false}>
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
          rateableError={rateableError}
          capitalError={capitalError}
          initialOldDetails={initialOldDetails}
          searchParams={searchParams}
        />
      )}
    </div>
  );
};
