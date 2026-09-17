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
import type { WingWiseWingDetails } from '@/types/property-tax/apartment';

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
  ActionResult<OldTaxesData[]> | null,
  ActionResult<DiscountData> | null,
  ActionResult<PropertyPhotoTypeWithStatusDto[]> | null,
  ActionResult<PropertyPhotoDto[]> | null,
  ActionResult<DualMethodResponse> | null,
  TaxDetailsResult | null,
  ActionResult<{ items: PropertyRuleLogItem[] }> | null,
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
  wings = [],
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
  wings?: WingWiseWingDetails[];
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

  const matchedProp = rawPropertyData.find(p => p.propertyId === resolvedPropertyId);
  const finalSocietyDetailId =
    matchedProp?.societyDetailId ||
    societyDetails?.societyDetailId ||
    (rawPropObj as Record<string, unknown>)?.societyDetailId ||
    (rawPropObj as Record<string, unknown>)?.SocietyDetailId ||
    (rawDataObj as Record<string, unknown>)?.societyDetailId ||
    (rawDataObj as Record<string, unknown>)?.SocietyDetailId ||
    (rawPropObj as Record<string, unknown>)?.societyId ||
    (rawPropObj as Record<string, unknown>)?.SocietyId ||
    (rawDataObj as Record<string, unknown>)?.societyId ||
    (rawDataObj as Record<string, unknown>)?.SocietyId;

  const finalWingDetailId =
    matchedProp?.wingDetailId ||
    (rawPropObj as Record<string, unknown>)?.wingDetailId ||
    (rawPropObj as Record<string, unknown>)?.WingDetailId ||
    (rawDataObj as Record<string, unknown>)?.wingDetailId ||
    (rawDataObj as Record<string, unknown>)?.WingDetailId ||
    (rawPropObj as Record<string, unknown>)?.wingId ||
    (rawPropObj as Record<string, unknown>)?.WingId ||
    (rawDataObj as Record<string, unknown>)?.wingId ||
    (rawDataObj as Record<string, unknown>)?.WingId;

  const allWings: WingWiseWingDetails[] = [
    ...(wings || []),
    ...(((matchedProp?.wings as unknown as WingWiseWingDetails[]) || []))
  ];

  const targetWingDetailId =
    finalWingDetailId ||
    searchParams?.wingDetailId ||
    searchParams?.wingdetailid;

  const matchedWing = allWings.find(
    (w) =>
      (targetWingDetailId && String(w.wingDetailId) === String(targetWingDetailId)) ||
      (searchParams?.wingId && String(w.wingMasterId) === String(searchParams.wingId))
  );

  const resolvedWingName =
    matchedWing?.wingName?.trim() ||
    matchedWing?.wingNo?.trim() ||
    propertyDetailsResult.propertyDetails?.wingName?.trim() ||
    propertyDetailsResult.propertyDetails?.wingNo?.trim();

  if (resolvedWingName) {
    if (propertyDetailsResult.propertyDetails && !propertyDetailsResult.propertyDetails.wingName) {
      propertyDetailsResult.propertyDetails.wingName = resolvedWingName;
    }
    if (propertyDetailsResult.propertyDetails && !propertyDetailsResult.propertyDetails.wingNo && matchedWing?.wingNo) {
      propertyDetailsResult.propertyDetails.wingNo = matchedWing.wingNo;
    }
    if (propertyDetailsResult.propertyDetails && !propertyDetailsResult.propertyDetails.wingDetailId && targetWingDetailId) {
      propertyDetailsResult.propertyDetails.wingDetailId = Number(targetWingDetailId);
    }
  }

  const hasSocietyInParams = Boolean(
    searchParams?.societyDetailId ||
    searchParams?.societydetailid ||
    searchParams?.societyId ||
    searchParams?.societyid ||
    searchParams?.societyMasterId ||
    searchParams?.societyMasterid
  );

  const hasWingInParams = Boolean(
    searchParams?.wingDetailId ||
    searchParams?.wingdetailid ||
    searchParams?.wingId ||
    searchParams?.wingid
  );

  const hasMissingParams = Boolean(resolvedPropertyId) && (
    !searchParams?.propertyNo ||
    !searchParams?.wardNo ||
    (Boolean(finalSocietyDetailId) && !hasSocietyInParams) ||
    (Boolean(finalWingDetailId) && !hasWingInParams) ||
    (Boolean(resolvedWingName) && !searchParams?.wingName && !searchParams?.wingname)
  );

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
        if (typeof v === 'string') {
          newParams.set(k, v);
        } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
          newParams.set(k, v[0]);
        }
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

    if (finalSocietyDetailId && !hasSocietyInParams) {
      newParams.set('societyDetailId', String(finalSocietyDetailId));
    }
    if (finalWingDetailId && !hasWingInParams) {
      newParams.set('wingDetailId', String(finalWingDetailId));
    }
    if (resolvedWingName && !searchParams?.wingName && !searchParams?.wingname) {
      newParams.set('wingName', resolvedWingName);
    }
    const currentParams = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (typeof v === 'string') {
          currentParams.set(k, v);
        } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
          currentParams.set(k, v[0]);
        }
      });
    }

    let paramsChanged = false;
    newParams.forEach((val, key) => {
      if (currentParams.get(key) !== val) {
        paramsChanged = true;
      }
    });
    currentParams.forEach((val, key) => {
      if (newParams.get(key) !== val) {
        paramsChanged = true;
      }
    });

    if (paramsChanged) {
      shouldRedirect = true;
      redirectUrl = `/${locale}/property-tax/ptis?${newParams.toString()}`;
    }
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
    wings: allWings,
  };
}
