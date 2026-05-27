import { getDualMethod } from '@/app/[locale]/property-tax/ptis/DualMethod.action';
import type { OldDetailsData } from '@/types/ptis.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import { getPtisUserSafeErrorMessage } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';

const DUAL_METHOD_ERROR_MESSAGES = {
  dualMethod: 'Unable to load dual method comparison details.',
  rateable: 'Unable to load rateable valuation details.',
  capital: 'Unable to load capital valuation details.',
} as const;

export interface DualMethodSectionData {
  initialDualMethodData: DualMethodResponse | null;
  initialRateableData: RateableValueResponse | null;
  initialCapitalData: CapitalValueResponse | null;
  hasFetchedRateableData: boolean;
  hasFetchedCapitalData: boolean;
  rateableError?: string;
  capitalError?: string;
  finalErrorMessage: string | null;
  oldRv: number;
  oldTax: number;
  aggregatedRv: number;
  aggregatedCv: number;
  rvTotalTax: number;
  cvTotalTax: number;
  retainTotalTax: number;
}

export async function assembleDualMethodSectionData(
  propertyId: number | undefined,
  initialOldDetails: OldDetailsData
): Promise<DualMethodSectionData> {
  const shouldFetch = propertyId != null;

  const dualResult = shouldFetch ? await getDualMethod(propertyId as number) : null;
  const initialDualMethodData = dualResult?.success === true ? (dualResult.data ?? null) : null;

  // SSR empty-state should not turn "no lookup attempted" into user-facing errors/toasts.
  const dualError =
    !shouldFetch || dualResult?.success === true
      ? undefined
      : getPtisUserSafeErrorMessage(
          dualResult?.error,
          dualResult?.statusCode,
          DUAL_METHOD_ERROR_MESSAGES.dualMethod
        );

  const oldRv = initialDualMethodData?.oldRv ?? initialDualMethodData?.oldRV ?? Number(initialOldDetails?.oldRV || 0);
  const oldTax = initialDualMethodData?.oldTaxesTotal ?? initialDualMethodData?.oldTaxTotal ?? Number(initialOldDetails?.oldTotalTax || 0);

  const aggregatedRv = initialDualMethodData?.totalRv ?? initialDualMethodData?.totalRV ?? 0;
  const aggregatedCv = initialDualMethodData?.totalCv ?? initialDualMethodData?.totalCV ?? 0;

  const rvTotalTax = initialDualMethodData?.rvTaxesTotal ?? initialDualMethodData?.rvTaxTotal ?? 0;
  const cvTotalTax = initialDualMethodData?.cvTaxesTotal ?? initialDualMethodData?.cvTaxTotal ?? 0;
  const retainTotalTax = initialDualMethodData?.retainTaxesTotal ?? initialDualMethodData?.retainTaxTotal ?? 0;

  const finalErrorMessage = shouldFetch ? dualError ?? null : null;

  return {
    initialDualMethodData,
    initialRateableData: null,
    initialCapitalData: null,
    hasFetchedRateableData: false,
    hasFetchedCapitalData: false,
    rateableError: undefined,
    capitalError: undefined,
    finalErrorMessage,
    oldRv,
    oldTax,
    aggregatedRv,
    aggregatedCv,
    rvTotalTax,
    cvTotalTax,
    retainTotalTax,
  };
}
