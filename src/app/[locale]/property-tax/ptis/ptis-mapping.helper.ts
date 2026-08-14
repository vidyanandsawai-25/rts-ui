// Server-side mapping helper — imported only from server modules, not a callable action

import {
  defaultDiscountData,
  defaultBuildingPermission,
} from '@/lib/constants/ptis.constants';
import { buildDetailsFromResults, buildPropertyOptions, InitialDataResult } from './ptis-data';
import { normalizePartition } from '@/lib/utils/format';
import type { WaybackRelease } from '@/lib/api/wayback.service';
import { assembleDualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { ActionResult } from '@/types/common.types';
import type { PropertyListItem } from '@/types/ptis.types';
import type { PropertyRuleLogItem } from '@/types/rule-engine';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type { PagedResponse, ApartmentQCDetail } from '@/types/apartmentQC.types';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type { PropertyComparisonResponse } from '@/types/propertyComparison.types';
import type {
  KYCDetailsData,
  SocietyDetailsData,
  BuildingPermissionData,
  OldDetailsData,
  OldFloorDetailsData,
  OldTaxesData,
  DiscountData,
  TabHeaderInfoData,
  MappedPropertyItem,
} from '@/types/ptis.types';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { TaxDetailsResult } from './TaxDetails/fetchTaxDetails';

type ConcurrentResultsTuple = [
  {
    amenities: PagedResponse<ApartmentQCDetail>;
    commercial: PagedResponse<ApartmentQCDetail>;
    residential: PagedResponse<ApartmentQCDetail>;
  } | null,
  ActionResult<RateableValueResponse> | null,
  ActionResult<CapitalValueResponse> | null,
  ActionResult<KYCDetailsData> | null,
  ActionResult<SocietyDetailsData> | null,
  ActionResult<BuildingPermissionData> | null,
  ActionResult<OldDetailsData> | null,
  ActionResult<OldFloorDetailsData[]> | null,
  ActionResult<OldTaxesData> | null,
  ActionResult<DiscountData> | null,
  ActionResult<PropertyPhotoTypeWithStatusDto[]> | null,
  ActionResult<PropertyPhotoDto[]> | null,
  ActionResult<DualMethodResponse> | null,
  TaxDetailsResult | null,
  { success: boolean; data?: { items?: PropertyRuleLogItem[] } } | null,
  WaybackRelease[] | null,
  ActionResult<TabHeaderInfoData> | null,
  ActionResult<MappedPropertyItem[]> | null,
  ActionResult<PropertyComparisonResponse> | null
];


export async function mapPtisFetchResults({
  propertyDetailsResult,
  propertyListResult,
  detailResults,
  valuationTab,
  resolvedPropertyId,
  activeTab,
  criticalError,
  resolvedWardId,
  showFloorParam,
  showOldTaxParam,
  showMapDetailsParam,
  showDetailsParam,
  searchParams,
  locale,
  propertyIdParam,
  wardOptions,
}: {
  propertyDetailsResult: InitialDataResult;
  propertyListResult: ActionResult<PropertyListItem[]> | null;
  detailResults: unknown[];
  valuationTab: 'rateable' | 'capital' | 'dual' | 'apartment' | 'reassessment' | undefined;
  resolvedPropertyId: number | undefined;
  activeTab: string;
  criticalError: string | undefined;
  resolvedWardId: number | undefined;
  showFloorParam: boolean;
  showOldTaxParam: boolean;
  showOldTaxInfo?: boolean;
  showMapDetailsParam: boolean;
  showDetailsParam: boolean;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
  propertyIdParam: number | undefined;
  wardOptions: SearchSelectOption[];
}) {
  const results = detailResults.length > 0 ? detailResults : Array(19).fill(null);
  const [
    aptData, rateableRes, capitalRes, kycResult, societyResult,
    buildingPermissionResult, oldDetailsResult, oldFloorResult, oldTaxesResult,
    discountResult, photoSlotsRes, photosRes, dualResult, taxDetailsRes, ruleLogsRes,
    waybackReleasesRes, tabHeaderInfoResult, mappedPropertiesResult, comparisonResult
  ] = results as unknown as ConcurrentResultsTuple;

  const emptyPaged: PagedResponse<ApartmentQCDetail> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };

  const apartmentData = aptData || {
    amenities: emptyPaged,
    commercial: emptyPaged,
    residential: emptyPaged,
  };

  const rawPropertyData = propertyListResult?.success && propertyListResult.data ? propertyListResult.data : [];
  const propertyOptions = buildPropertyOptions(rawPropertyData);

  const { kycDetails, societyDetails, oldDetails, oldFloorTableData, oldTaxesData } = buildDetailsFromResults(
    kycResult,
    societyResult,
    oldDetailsResult,
    oldFloorResult,
    oldTaxesResult
  );

  const buildingPermission = buildingPermissionResult?.success && buildingPermissionResult.data
    ? { ...defaultBuildingPermission, ...buildingPermissionResult.data }
    : defaultBuildingPermission;

  const discountDetails = discountResult?.success && discountResult.data
    ? { ...defaultDiscountData, ...discountResult.data }
    : defaultDiscountData;

  const initialPhotoSlots = photoSlotsRes?.success && Array.isArray(photoSlotsRes.data)
    ? photoSlotsRes.data
    : [];

  const initialPhotos = photosRes?.success && Array.isArray(photosRes.data)
    ? photosRes.data
    : [];

  const waybackReleases = Array.isArray(waybackReleasesRes) ? waybackReleasesRes : [];

  const parseCoord = (val: unknown): number | undefined => {
    if (typeof val === 'number' && Number.isFinite(val) && val !== 0) return val;
    if (typeof val === 'string' && val.trim() !== '') {
      const parsed = parseFloat(val);
      if (Number.isFinite(parsed) && parsed !== 0) return parsed;
    }
    return undefined;
  };

  const searchLatParam = searchParams?.latitude ?? searchParams?.lat;
  const searchLngParam = searchParams?.longitude ?? searchParams?.lng;

  const rawPropObj = propertyDetailsResult?.propertyDetails as unknown as Record<string, unknown> | undefined;
  const rawDataObj = (Array.isArray(rawPropertyData) ? rawPropertyData[0] : rawPropertyData) as unknown as Record<string, unknown> | undefined;

  const latitude =
    parseCoord(searchLatParam) ??
    parseCoord(rawPropObj?.latitude) ??
    parseCoord(rawPropObj?.Latitude) ??
    parseCoord(rawDataObj?.latitude) ??
    parseCoord(rawDataObj?.Latitude);

  const longitude =
    parseCoord(searchLngParam) ??
    parseCoord(rawPropObj?.longitude) ??
    parseCoord(rawPropObj?.Longitude) ??
    parseCoord(rawDataObj?.longitude) ??
    parseCoord(rawDataObj?.Longitude);

  const mappedPropertiesData = mappedPropertiesResult?.success && Array.isArray(mappedPropertiesResult.data)
    ? mappedPropertiesResult.data
    : [];

  const rateableResult = rateableRes ?? undefined;
  const capitalResult = capitalRes ?? undefined;

  const dualSectionData = valuationTab === 'dual' && resolvedPropertyId
    ? await assembleDualMethodSectionData(resolvedPropertyId, oldDetails, rateableRes, capitalRes, dualResult)
    : undefined;

  const taxDetails = taxDetailsRes ?? {
    rateableTaxDetails: null,
    capitalTaxDetails: null,
    rateableTaxError: undefined,
    capitalTaxError: undefined,
  };

  let shouldRedirect = false;
  let redirectUrl = '';

  const hasMissingParams = Boolean(resolvedPropertyId) && (!searchParams?.propertyNo || !searchParams?.wardNo);
  const isIdMismatch = Boolean(resolvedPropertyId) && (!propertyIdParam || propertyIdParam !== resolvedPropertyId);

  if (resolvedPropertyId && (isIdMismatch || hasMissingParams)) {
    const matchedProp = rawPropertyData.find(p => p.propertyId === resolvedPropertyId);
    const finalPropNo = matchedProp?.propertyNo || propertyDetailsResult.propertyDetails?.propertyNo;
    const finalPartNo = matchedProp?.partitionNo ?? propertyDetailsResult.propertyDetails?.partitionNo;
    const finalWardNo = propertyDetailsResult.wardNo || propertyDetailsResult.propertyDetails?.wardNo;
    const finalWardId = resolvedWardId || propertyDetailsResult.wardId;

    const newParams = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === 'string') newParams.set(k, v);
      });
    }
    newParams.set('propertyId', resolvedPropertyId.toString());

    if (finalPropNo && !searchParams?.propertyNo) {
      newParams.set('propertyNo', finalPropNo);
    }
    if (finalPartNo !== undefined && finalPartNo !== null && searchParams?.partitionNo === undefined) {
      newParams.set('partitionNo', normalizePartition(finalPartNo));
    }
    if (finalWardNo && !searchParams?.wardNo) {
      newParams.set('wardNo', finalWardNo);
    }
    if (finalWardId && !searchParams?.wardId) {
      newParams.set('wardId', finalWardId.toString());
    }

    shouldRedirect = true;
    redirectUrl = `/${locale}/property-tax/ptis?${newParams.toString()}`;
  }

  const tabHeaderInfo = tabHeaderInfoResult?.success && tabHeaderInfoResult.data
    ? tabHeaderInfoResult.data : null;

  return {
    criticalError,
    resolvedPropertyId,
    resolvedWardId,
    propertyDetailsResult,
    rawPropertyData,
    propertyOptions,
    wardOptions,
    kycDetails,
    societyDetails,
    buildingPermission,
    oldDetails,
    oldFloorTableData,
    oldTaxesData,
    discountDetails,
    apartmentData,
    rateableResult,
    capitalResult,
    comparisonResult,
    dualSectionData,
    initialPhotoSlots,
    initialPhotos,
    showFloorParam,
    showOldTaxParam,
    showMapDetailsParam,
    showDetailsParam,
    rateableTaxDetails: taxDetails.rateableTaxDetails ?? undefined,
    capitalTaxDetails: taxDetails.capitalTaxDetails ?? undefined,
    rateableTaxError: taxDetails.rateableTaxError,
    capitalTaxError: taxDetails.capitalTaxError,
    shouldRedirect,
    redirectUrl,
    activeTab,
    hasAppliedRules: ruleLogsRes?.success && ruleLogsRes.data && ruleLogsRes.data.items && ruleLogsRes.data.items.length > 0 ? true : false,
    appliedRulesList: ruleLogsRes?.success && ruleLogsRes.data && ruleLogsRes.data.items ? ruleLogsRes.data.items : [],
    latitude,
    longitude,
    waybackReleases,
    tabHeaderInfo,
    mappedPropertiesData,
  };
}
