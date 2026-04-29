import { getDualMethod } from '@/app/[locale]/property-tax/ptis/DualMethod.action';
import { getRateableValue } from '@/app/[locale]/property-tax/ptis/RateableValue.action';
import { getCapitalValue } from '@/app/[locale]/property-tax/ptis/CapitalValue.action';
import { collectDualMethodErrors } from '@/lib/utils/ptis';
import {
  calculateCapitalTotal,
  calculateRateableTotal,
  getMethodTaxTotal,
  getOldRvTotal,
  getOldTaxTotal,
} from '@/lib/utils/ptis-calculations';
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

function withMethodContext(method: 'Rateable' | 'Capital', error: string | undefined): string | undefined {
  const message = error?.trim();
  if (!message) return undefined;
  return `${method}: ${message}`;
}

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

  const [dualResult, rateableResult, capitalResult] = await Promise.all([
    shouldFetch ? getDualMethod(propertyId as number) : Promise.resolve(null),
    shouldFetch ? getRateableValue(propertyId as number) : Promise.resolve(null),
    shouldFetch ? getCapitalValue(propertyId as number) : Promise.resolve(null),
  ]);

  const initialDualMethodData = dualResult?.success === true ? (dualResult.data ?? null) : null;
  const initialRateableData = rateableResult?.success === true ? (rateableResult.data ?? null) : null;
  const initialCapitalData = capitalResult?.success === true ? (capitalResult.data ?? null) : null;

  // SSR empty-state should not turn "no lookup attempted" into user-facing errors/toasts.
  const dualError =
    !shouldFetch || dualResult?.success === true
      ? undefined
      : getPtisUserSafeErrorMessage(
          dualResult?.error,
          dualResult?.statusCode,
          DUAL_METHOD_ERROR_MESSAGES.dualMethod
        );

  const rateableError =
    !shouldFetch || rateableResult?.success === true
      ? undefined
      : withMethodContext(
          'Rateable',
          getPtisUserSafeErrorMessage(
            rateableResult?.error,
            rateableResult?.statusCode,
            DUAL_METHOD_ERROR_MESSAGES.rateable
          )
        );

  const capitalError =
    !shouldFetch || capitalResult?.success === true
      ? undefined
      : withMethodContext(
          'Capital',
          getPtisUserSafeErrorMessage(
            capitalResult?.error,
            capitalResult?.statusCode,
            DUAL_METHOD_ERROR_MESSAGES.capital
          )
        );

  const oldRv = getOldRvTotal(initialOldDetails);
  const oldTax = getOldTaxTotal(initialDualMethodData, initialOldDetails);

  const { rv: aggregatedRv, tax: aggregatedRvTax } = calculateRateableTotal(initialRateableData);
  const { cv: aggregatedCv, tax: aggregatedCvTax } = calculateCapitalTotal(initialCapitalData);

  const rvTotalTax = getMethodTaxTotal(
    initialDualMethodData?.rvTaxesTotal,
    initialDualMethodData?.rvTaxes,
    aggregatedRvTax
  ) ?? 0;
  const cvTotalTax = getMethodTaxTotal(
    initialDualMethodData?.cvTaxesTotal,
    initialDualMethodData?.cvTaxes,
    aggregatedCvTax
  ) ?? 0;
  const retainTotalTax = getMethodTaxTotal(
    initialDualMethodData?.retainTaxesTotal,
    initialDualMethodData?.retainTaxes
  ) ?? 0;

  const finalErrorMessage = shouldFetch ? collectDualMethodErrors(dualError, rateableError, capitalError) : null;

  return {
    initialDualMethodData,
    initialRateableData,
    initialCapitalData,
    hasFetchedRateableData: shouldFetch,
    hasFetchedCapitalData: shouldFetch,
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
  };
}
