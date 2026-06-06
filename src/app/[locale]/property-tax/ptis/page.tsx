import PropertyTabSection from '@/components/modules/property-tax/ptis/PropertyTabSection';
import {
  defaultPropertyDetails,
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
  defaultDiscountData,
  defaultBuildingPermission,
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
  fetchDiscountDetailsOnlyAction,
  fetchBuildingPermissionOnlyAction,
} from './actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import { assembleDualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type { ApartmentQCDetail } from '@/types/apartmentQC.types';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { PtisFooterControls } from '@/components/modules/property-tax/ptis/PtisFooterControls';
import { FALLBACK_FOOTER_ACTIONS } from '@/config/footer-fallback';
import { FOOTER_REGISTRY, DEFAULT_ACTION_STYLE } from '@/config/footer-registry';
import { FooterAction } from '@/lib/api/footer.service';
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
import { AlertCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
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
  wardId?: number;
  wardNo?: string;
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
          wardId: result.data.wardId,
          wardNo: result.data.wardNo,
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
  const t = await getTranslations({ locale, namespace: 'ptis' });
  const activeTab = toValidTab(resolvedSearchParams?.tab);
  const ptisParams = parsePtisSearchParams(resolvedSearchParams);
  const valuationTab = ptisParams.tab;
  const wardIdParam = toPositiveInt(resolvedSearchParams?.wardId);
  const propertyIdParam = toPositiveInt(resolvedSearchParams?.propertyId);
  const showFloorParam = resolvedSearchParams?.showFloor === 'true';
  const showOldTaxParam = resolvedSearchParams?.showOldTax === 'true';
  const showDetailsParam = resolvedSearchParams?.showDetails === 'true';

  const pageNumber = toPositiveInt(resolvedSearchParams?.pageNumber) || 1;
  const pageSize = toPositiveInt(resolvedSearchParams?.pageSize) || 10;
  const searchTerm = toSafeString(resolvedSearchParams?.searchTerm);
  const appartmentTab = toSafeString(resolvedSearchParams?.appartmentTab) || 'amenities';

  // Column filter parameters
  const filterWing = toSafeString(resolvedSearchParams?.filterWing);
  const filterFlatOrShopNo = toSafeString(resolvedSearchParams?.filterFlatOrShopNo);
  const filterApartmentType = toSafeString(resolvedSearchParams?.filterApartmentType);
  const filterPropertyType = toSafeString(resolvedSearchParams?.filterPropertyType);

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

  let criticalError: string | undefined = undefined;

  if (wardListSettled.status === 'rejected') {
    criticalError = t('search.errors.fetchWardsFailed');
  } else if (
    !wardListResult.success &&
    (!wardListResult.data || wardListResult.data.length === 0)
  ) {
    criticalError = getCleanErrorMessage(wardListResult.error, t('search.errors.fetchWardsFailed'));
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

  const emptyPaged = {
    items: [] as ApartmentQCDetail[],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  let propertyOptions: SearchSelectOption[] = [];
  let rawPropertyData: PropertyListItem[] = [];
  let kycDetails = defaultKycDetails;
  let societyDetails = defaultSocietyDetails;
  let buildingPermission = defaultBuildingPermission;
  let oldDetails = defaultOldDetails;
  let discountDetails = defaultDiscountData;
  let oldFloorTableData: OldFloorDetailsData[] = [];
  let oldTaxesData: OldTaxesData | null = null;
  let resolvedPropertyId: number | undefined = undefined;

  let apartmentData = {
    amenities: emptyPaged,
    commercial: emptyPaged,
    residential: emptyPaged,
  };
  let rateableResult: Awaited<ReturnType<typeof getRateableValue>> | null = null;
  let capitalResult: Awaited<ReturnType<typeof getCapitalValue>> | null = null;
  let dualSectionData: Awaited<ReturnType<typeof assembleDualMethodSectionData>> | undefined =
    undefined;
  let initialError: string | undefined = undefined;

  let propertyDetailsResult: {
    success: boolean;
    propertyId?: number;
    wardId?: number;
    wardNo?: string;
    propertyDetails: PropertyDetailsData;
    error?: string;
  } = {
    success: true,
    propertyId: undefined,
    wardId: undefined,
    wardNo: undefined,
    propertyDetails: defaultPropertyDetails,
    error: undefined,
  };
  let propertyListResult: Awaited<ReturnType<typeof getPropertyListByWardAction>> | null = null;

  if (!criticalError) {
    try {
      const propDetailsRes = await getInitialData(
        wardNo,
        propertyNo,
        partitionNo,
        resolvedWardId,
        propertyIdParam
      );
      propertyDetailsResult = propDetailsRes;

      if (!resolvedWardId && propertyDetailsResult.success && propertyDetailsResult.wardId) {
        resolvedWardId = propertyDetailsResult.wardId;
      }

      const propListRes = resolvedWardId ? await getPropertyListByWardAction(resolvedWardId) : null;
      propertyListResult = propListRes;

      // Capture non-critical errors to be surfaced as toasts on the client
      initialError =
        (!propertyDetailsResult.success && propertyDetailsResult.error) ||
        (propertyListResult && !propertyListResult.success && propertyListResult.error) ||
        undefined;

      if (resolvedWardId && propertyListResult?.success && propertyListResult.data) {
        rawPropertyData = propertyListResult.data;
        propertyOptions = propertyListResult.data.map((p: PropertyListItem) => {
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

      resolvedPropertyId = propertyIdParam ?? propertyDetailsResult.propertyId;

      const [
        aptData,
        rateableRes,
        capitalRes,
        kycResult,
        societyResult,
        buildingPermissionResult,
        oldDetailsResult,
        oldFloorResult,
        oldTaxesResult,
        discountResult,
      ] = await Promise.all([
        resolvedWardId && propertyNo
          ? getApartmentQCDataAction(
              resolvedWardId,
              propertyNo,
              appartmentTab,
              pageNumber,
              pageSize,
              searchTerm,
              resolvedPropertyId,
              {
                wing: filterWing || undefined,
                flatOrShopNo: filterFlatOrShopNo || undefined,
                apartmentType: filterApartmentType || undefined,
                propertyType: filterPropertyType || undefined,
              }
            )
          : Promise.resolve({
              amenities: emptyPaged,
              commercial: emptyPaged,
              residential: emptyPaged,
            }),
        resolvedPropertyId ? getRateableValue(resolvedPropertyId) : Promise.resolve(null),
        resolvedPropertyId &&
        (valuationTab === 'capital' || (valuationTab === 'dual' && showDetailsParam))
          ? getCapitalValue(resolvedPropertyId)
          : Promise.resolve(null),
        resolvedPropertyId ? fetchKycDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
        resolvedPropertyId
          ? fetchSocietyDetailsOnlyAction(resolvedPropertyId)
          : Promise.resolve(null),
        resolvedPropertyId
          ? fetchBuildingPermissionOnlyAction(resolvedPropertyId)
          : Promise.resolve(null),
        resolvedPropertyId ? fetchOldDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
        resolvedPropertyId ? fetchOldFloorDetailsAction(resolvedPropertyId) : Promise.resolve(null),
        resolvedPropertyId ? fetchOldTaxesDetailsAction(resolvedPropertyId) : Promise.resolve(null),
        resolvedPropertyId
          ? fetchDiscountDetailsOnlyAction(resolvedPropertyId)
          : Promise.resolve(null),
      ]);

      apartmentData = aptData;
      rateableResult = rateableRes;
      capitalResult = capitalRes;

      // Map results to data objects
      if (kycResult?.success && kycResult.data) {
        kycDetails = { ...defaultKycDetails, ...kycResult.data };
      }
      if (societyResult?.success && societyResult.data) {
        societyDetails = { ...defaultSocietyDetails, ...societyResult.data };
      }
      if (buildingPermissionResult?.success && buildingPermissionResult.data) {
        buildingPermission = { ...defaultBuildingPermission, ...buildingPermissionResult.data };
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
      if (discountResult?.success && discountResult.data) {
        discountDetails = { ...defaultDiscountData, ...discountResult.data };
      }

      // Dual Method data triggers additional valuation fetches internally,
      // so only load it when the dual-method UI is actually being rendered.
      dualSectionData =
        ptisParams.tab === 'dual'
          ? await assembleDualMethodSectionData(
              resolvedPropertyId,
              oldDetails,
              rateableRes,
              capitalRes
            )
          : undefined;
    } catch (err) {
      criticalError = getCleanErrorMessage(err, t('search.errors.fetchPropertiesFailed'));
    }
  }

  const initialData: PtisInitialData = {
    propertyDetails: propertyDetailsResult.propertyDetails,
    kycDetails,
    societyDetails,
    buildingPermission,
    wardOptions,
    propertyOptions,
    rawPropertyData,
    oldDetails,
    oldFloorTableData,
    showOldFloorInfo: showFloorParam,
    oldTaxesData,
    showOldTaxInfo: showOldTaxParam,
    discountDetails,
  };

  try {
    // URL Normalization (Redirect if we have property details but missing wardNo, propertyNo, partitionNo, wardId, or propertyId in the URL)
    const hasFullParams =
      resolvedSearchParams.wardNo &&
      resolvedSearchParams.propertyNo &&
      resolvedSearchParams.wardId &&
      resolvedSearchParams.propertyId;

    if (
      propertyDetailsResult.success &&
      propertyDetailsResult.propertyId &&
      (!hasFullParams || !propertyIdParam)
    ) {
      const newParams = new URLSearchParams();
      for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (value == null) continue;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          if (v != null) newParams.append(key, v);
        });
      }
      newParams.set('propertyId', propertyDetailsResult.propertyId.toString());
      if (propertyDetailsResult.wardId) {
        newParams.set('wardId', propertyDetailsResult.wardId.toString());
      }
      if (propertyDetailsResult.wardNo) {
        newParams.set('wardNo', propertyDetailsResult.wardNo);
      }
      if (propertyDetailsResult.propertyDetails.propertyNo) {
        newParams.set('propertyNo', propertyDetailsResult.propertyDetails.propertyNo);
      }
      const rawPart = propertyDetailsResult.propertyDetails.partitionNo;
      newParams.set('partitionNo', rawPart && rawPart.trim() !== '' ? rawPart : '0');

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

    // For other errors, set criticalError instead of throwing
    criticalError = getCleanErrorMessage(error, t('error.generic'));
  }

  const sanitizedInitialError = propertyDetailsResult.error
    ? getPtisUserSafeErrorMessage(propertyDetailsResult.error, undefined, t('error.generic'))
    : undefined;

  // Fetch tax details based on valuation tab (ptisParams.tab), not property tab (activeTab)
  const { rateableTaxDetails, capitalTaxDetails, rateableTaxError, capitalTaxError } =
    await fetchTaxDetailsByTab(resolvedPropertyId, valuationTab, showDetailsParam);

  const footerActions: FooterAction[] = FALLBACK_FOOTER_ACTIONS.map((action, index) => {
    const baseStyle = FOOTER_REGISTRY[action.actionCommand] || DEFAULT_ACTION_STYLE;
    return {
      id: index + 1000,
      ...action,
      style: {
        ...baseStyle,
        iconName: action.lucideIcon || baseStyle.iconName,
      },
    };
  });

  return (
    <div className="flex flex-col gap-6 pb-24">
      {criticalError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold">{t('error.networkError.title')}</p>
            <p className="text-sm mt-0.5">{criticalError}</p>
          </div>
        </div>
      )}
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
          valuationTab === 'capital' ? (
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
          ) : null
        }
        dualRateableSection={
          valuationTab === 'dual' && showDetailsParam ? (
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
          ) : null
        }
        dualCapitalSection={
          valuationTab === 'dual' && showDetailsParam ? (
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
          ) : null
        }
      />
      <BottomActionBar
        actions={footerActions}
        properties={rawPropertyData}
        leftContent={<PtisFooterControls />}
      />
    </div>
  );
}
