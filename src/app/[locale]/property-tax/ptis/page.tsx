import PropertyTabSection from '@/components/modules/property-tax/ptis/PropertyTabSection';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';
import {
  fetchPropertyDetailsOnlyAction,
  getWardListAction,
  getPropertyListByWardAction,
  fetchWardIdAction,
  fetchKycDetailsOnlyAction,
  fetchSocietyDetailsOnlyAction,
  fetchOldDetailsOnlyAction,
  fetchOldFloorDetailsAction,
  fetchOldTaxesDetailsAction,
} from './actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import { assembleDualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type {
  PropertyListItem,
  Ward,
  OldFloorDetailsData,
  OldTaxesData,
  PtisInitialData,
  PropertyDetailsData,
} from '@/types/ptis.types';

import { toPositiveInt, toSafeString } from '@/lib/utils/format';
import { PTIS_TABS, PtisTabId } from '@/types/ptis.types';
import { redirect } from 'next/navigation';
import PtisMainScreen from '@/components/modules/property-tax/ptis/PtisMainScreen';
import { parsePtisSearchParams } from '@/lib/utils/params';
import { getPtisUserSafeErrorMessage } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';
import { RateableTaxDetailsSection } from '@/components/modules/property-tax/ptis/rateable';
import { CapitalTaxDetailsSection } from '@/components/modules/property-tax/ptis/capital';
import { fetchTaxDetailsByTab } from './TaxDetails/fetchTaxDetails';

const toValidTab = (value: unknown): PtisTabId => {
  return typeof value === 'string' && (PTIS_TABS as readonly string[]).includes(value)
    ? (value as PtisTabId)
    : 'propertydetails';
};

async function getInitialData(
  wardNo?: string,
  propertyNo?: string,
  partitionNo?: string,
  wardId?: number,
  propertyId?: number
): Promise<{
  success: boolean;
  propertyId?: number;
  propertyDetails: PropertyDetailsData;
  error?: string;
}> {
  try {
    if (propertyId || (wardNo && propertyNo)) {
      const result = await fetchPropertyDetailsOnlyAction(
        wardNo || '',
        propertyNo || '',
        partitionNo || '',
        wardId,
        propertyId
      );

      if (result.success && result.data) {
        return {
          success: true,
          propertyId: result.data.propertyId,
          propertyDetails: {
            ...defaultPropertyDetails,
            ...result.data.details,
          },
        };
      }
      return {
        success: false,
        error: result.error,
        propertyDetails: defaultPropertyDetails,
      };
    }

    return {
      success: true,
      propertyId: undefined,
      propertyDetails: defaultPropertyDetails,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load initial property data',
      propertyDetails: defaultPropertyDetails,
    };
  }
}

interface PtisPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      wardNo?: string;
      propertyNo?: string;
      partitionNo?: string;
      propertyId?: string;
      wardId?: string;
      tab?: string;
      showFloor?: string;
      showOldTax?: string;
    }
  >;
}

/**
 * PTIS Page Component (Server Component)
 * Handles data pre-fetching and URL normalization.
 */
export default async function PtisPage({ params, searchParams }: PtisPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const wardNo = toSafeString(resolvedSearchParams?.wardNo);
  const propertyNo = toSafeString(resolvedSearchParams?.propertyNo);
  const rawPartitionNo = toSafeString(resolvedSearchParams?.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;
  const { locale } = resolvedParams;
  const activeTab = toValidTab(resolvedSearchParams?.tab);
  const ptisParams = parsePtisSearchParams(resolvedSearchParams);
  const wardIdParam = toPositiveInt(resolvedSearchParams?.wardId);
  const propertyIdParam = toPositiveInt(resolvedSearchParams?.propertyId);
  const showFloorParam = resolvedSearchParams?.showFloor === 'true';
  const showOldTaxParam = resolvedSearchParams?.showOldTax === 'true';

  const pageNumber = toPositiveInt(resolvedSearchParams?.pageNumber) || 1;
  const pageSize = toPositiveInt(resolvedSearchParams?.pageSize) || 10;
  const searchTerm = toSafeString(resolvedSearchParams?.searchTerm);
  const appartmentTab = toSafeString(resolvedSearchParams?.appartmentTab) || 'amenities';

  const [wardListSettled, initialWardIdSettled] = await Promise.allSettled([
    getWardListAction(),
    !wardIdParam && wardNo ? fetchWardIdAction(wardNo) : Promise.resolve(null),
  ]);

  const wardListResult =
    wardListSettled.status === 'fulfilled'
      ? wardListSettled.value
      : { success: false, error: 'Failed to fetch wards', data: [] };

  const initialWardIdResult =
    initialWardIdSettled.status === 'fulfilled' ? initialWardIdSettled.value : null;

  // CRITICAL FAILURE: If ward list cannot be loaded at all, trigger error boundary
  if (wardListSettled.status === 'rejected' || (!wardListResult.success && (!wardListResult.data || wardListResult.data.length === 0))) {
    throw new Error(wardListResult.error || 'Failed to load critical module data (Ward List)');
  }

  // Process Ward List for initial options
  const wardOptions: SearchSelectOption[] =
    wardListResult.success && wardListResult.data
      ? wardListResult.data.map((w: Ward) => ({
        label: w.wardNo || '',
        value: (w.wardId ?? w.wardID ?? '').toString(),
      }))
      : [];

  let resolvedWardId = wardIdParam;
  if (!resolvedWardId && initialWardIdResult?.success && initialWardIdResult.data?.wardId) {
    resolvedWardId = initialWardIdResult.data.wardId;
  }

  const [propertyListResult, propertyDetailsResult] = await Promise.all([
    resolvedWardId ? getPropertyListByWardAction(resolvedWardId) : Promise.resolve(null),
    getInitialData(wardNo, propertyNo, partitionNo, resolvedWardId, propertyIdParam),
  ]);

  // Capture non-critical errors to be surfaced as toasts on the client
  const initialError =
    (!propertyDetailsResult.success && propertyDetailsResult.error) ||
    (propertyListResult && !propertyListResult.success && propertyListResult.error) ||
    undefined;

  let propertyOptions: SearchSelectOption[] = [];
  let rawPropertyData: PropertyListItem[] = [];

  if (resolvedWardId && propertyListResult?.success && propertyListResult.data) {
    rawPropertyData = propertyListResult.data;
    propertyOptions = propertyListResult.data.map((p) => {
      const trimmedPartitionNo = (p.partitionNo ?? '').trim();
      const normalizedPartitionNo = trimmedPartitionNo === '0' ? '' : trimmedPartitionNo;
      return {
        label: `${p.propertyNo}${normalizedPartitionNo ? ` - ${normalizedPartitionNo}` : ''}`,
        value: JSON.stringify({
          propertyNo: p.propertyNo,
          partitionNo: normalizedPartitionNo,
          propertyId: p.propertyId,
        }),
      };
    });
  }

  let kycDetails = defaultKycDetails;
  let societyDetails = defaultSocietyDetails;
  let oldDetails = defaultOldDetails;
  let oldFloorTableData: OldFloorDetailsData[] = [];
  let oldTaxesData: OldTaxesData | null = null;

  const resolvedPropertyId = propertyIdParam ?? propertyDetailsResult.propertyId;

  // Fetch Apartment QC data and Valuations if property info is available
  const emptyPaged = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };

  const [
    apartmentData,
    rateableResult,
    capitalResult,
    kycResult,
    societyResult,
    oldDetailsResult,
    oldFloorResult,
    oldTaxesResult
  ] = await Promise.all([
    resolvedWardId && propertyNo
      ? getApartmentQCDataAction(resolvedWardId, propertyNo, appartmentTab, pageNumber, pageSize, searchTerm, resolvedPropertyId)
      : Promise.resolve({ amenities: emptyPaged, commercial: emptyPaged, residential: emptyPaged }),
    resolvedPropertyId ? getRateableValue(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? getCapitalValue(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchKycDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchSocietyDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldFloorDetailsAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldTaxesDetailsAction(resolvedPropertyId) : Promise.resolve(null),
  ]);

  // Map results to data objects
  if (kycResult?.success && kycResult.data) {
    kycDetails = { ...defaultKycDetails, ...kycResult.data };
  }
  if (societyResult?.success && societyResult.data) {
    societyDetails = { ...defaultSocietyDetails, ...societyResult.data };
  }
  if (oldDetailsResult?.success && oldDetailsResult.data) {
    oldDetails = { ...defaultOldDetails, ...oldDetailsResult.data };
  }
  if (oldFloorResult?.success && Array.isArray(oldFloorResult.data)) {
    oldFloorTableData = oldFloorResult.data;
  }
  if (oldTaxesResult?.success && oldTaxesResult.data) {
    oldTaxesData = oldTaxesResult.data;
  }

  // Dual Method data triggers additional valuation fetches internally,
  // so only load it when the dual-method UI is actually being rendered.
  const dualSectionData =
    ptisParams.tab === 'dual'
      ? await assembleDualMethodSectionData(resolvedPropertyId, oldDetails)
      : undefined;

  const initialData: PtisInitialData = {
    propertyDetails: propertyDetailsResult.propertyDetails,
    kycDetails,
    societyDetails,
    wardOptions,
    propertyOptions,
    rawPropertyData,
    oldDetails,
    oldFloorTableData,
    showOldFloorInfo: showFloorParam,
    oldTaxesData,
    showOldTaxInfo: showOldTaxParam,
  };
  try {
    // URL Normalization (Redirect if ID resolved but not in URL)
    if (propertyDetailsResult.propertyId && !propertyIdParam) {
      const newParams = new URLSearchParams();
      for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (value == null) continue;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          if (v != null) newParams.append(key, v);
        });
      }
      newParams.set('propertyId', propertyDetailsResult.propertyId.toString());
      redirect(`/${locale}/property-tax/ptis?${newParams.toString()}`);
    }
  } catch (error: unknown) {
    // Re-throw redirect errors so Next.js can handle them
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // For other errors, let the error boundary handle it
    throw error;
  }

  const sanitizedInitialError = propertyDetailsResult.error
    ? getPtisUserSafeErrorMessage(
      propertyDetailsResult.error,
      undefined,
      'Unable to load PTIS details. Please try again.'
    )
    : undefined;

  // Fetch tax details based on valuation tab (ptisParams.tab), not property tab (activeTab)
  const valuationTab = ptisParams.tab;
  const { rateableTaxDetails, capitalTaxDetails, rateableTaxError, capitalTaxError } =
    await fetchTaxDetailsByTab(resolvedPropertyId, valuationTab);

  return (
    <>
      <PropertyTabSection
        initialData={initialData}
        initialWardId={resolvedWardId}
        initialTab={activeTab}
        initialError={initialError}
      />
      <PtisMainScreen
        locale={locale}
        propertyId={resolvedPropertyId}
        ptisParams={ptisParams}
        resolvedSearchParams={resolvedSearchParams}
        error={sanitizedInitialError}
        initialApartmentData={apartmentData}
        initialDualSectionData={dualSectionData}
        wardId={resolvedWardId}
        propertyNo={propertyNo}
        rateableSection={
          <RateableTaxDetailsSection
            rateableData={rateableResult?.success ? rateableResult.data : null}
            error={!rateableResult?.success ? rateableResult?.error : undefined}
            hasFetchedData={rateableResult != null}
            oldDetails={initialData.oldDetails || defaultOldDetails}
            propertyId={resolvedPropertyId}
            searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            initialTaxDetails={rateableTaxDetails}
            taxDetailsError={rateableTaxError}
            locale={locale}
          />
        }
        capitalSection={
          <CapitalTaxDetailsSection
            capitalData={capitalResult?.success ? capitalResult.data : null}
            error={!capitalResult?.success ? capitalResult?.error : undefined}
            hasFetchedData={capitalResult != null}
            oldDetails={initialData.oldDetails || defaultOldDetails}
            propertyId={resolvedPropertyId}
            searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            initialTaxDetails={capitalTaxDetails}
            taxDetailsError={capitalTaxError}
            locale={locale}
          />
        }
        dualRateableSection={
          <RateableTaxDetailsSection
            rateableData={dualSectionData?.initialRateableData || null}
            error={dualSectionData?.rateableError}
            hasFetchedData={dualSectionData != null}
            oldDetails={initialData.oldDetails || defaultOldDetails}
            propertyId={resolvedPropertyId}
            searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            locale={locale}
            initialTaxDetails={rateableTaxDetails}
            taxDetailsError={rateableTaxError}
            showInlineError={false}
          />
        }
        dualCapitalSection={
          <CapitalTaxDetailsSection
            capitalData={dualSectionData?.initialCapitalData || null}
            error={dualSectionData?.capitalError}
            hasFetchedData={dualSectionData != null}
            oldDetails={initialData.oldDetails || defaultOldDetails}
            propertyId={resolvedPropertyId}
            searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
            locale={locale}
            initialTaxDetails={capitalTaxDetails}
            taxDetailsError={capitalTaxError}
            showInlineError={false}
          />
        }
      />
    </>
  );
}
