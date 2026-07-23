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
  ActionResult<MappedPropertyItem[]> | null
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
  showMapDetailsParam: boolean;
  showDetailsParam: boolean;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
  propertyIdParam: number | undefined;
  wardOptions: SearchSelectOption[];
}) {
  const results = detailResults.length > 0 ? detailResults : Array(18).fill(null);
  const [
    aptData, rateableRes, capitalRes, kycResult, societyResult,
    buildingPermissionResult, oldDetailsResult, oldFloorResult, oldTaxesResult,
    discountResult, photoSlotsRes, photosRes, dualResult, taxDetailsRes, ruleLogsRes,
    waybackReleasesRes, tabHeaderInfoResult, mappedPropertiesResult
  ] = results as unknown as ConcurrentResultsTuple;

  const emptyPaged: PagedResponse<ApartmentQCDetail> = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false };

  const apartmentData = aptData || {
    amenities: emptyPaged,
    commercial: emptyPaged,
    residential: emptyPaged,
  };
  const rateableResult = rateableRes;
  const capitalResult = capitalRes;

  const { kycDetails, societyDetails, oldDetails, oldFloorTableData, oldTaxesData } = buildDetailsFromResults(
    kycResult, societyResult, oldDetailsResult, oldFloorResult, oldTaxesResult
  );
  const buildingPermission = buildingPermissionResult?.success && buildingPermissionResult.data
    ? { ...defaultBuildingPermission, ...buildingPermissionResult.data } : defaultBuildingPermission;
  const discountDetails = discountResult?.success && discountResult.data
    ? { ...defaultDiscountData, ...discountResult.data } : defaultDiscountData;
  const initialPhotoSlots = photoSlotsRes?.success && photoSlotsRes.data ? photoSlotsRes.data : [];
  const initialPhotos = photosRes?.success && photosRes.data ? photosRes.data : [];
  const constYear = propertyDetailsResult.success ? propertyDetailsResult.propertyDetails?.constructionYear : undefined;
  const startYear = constYear && !isNaN(parseInt(constYear, 10)) ? Math.max(2015, parseInt(constYear, 10) - 1) : null;
  const waybackReleases = startYear ? (waybackReleasesRes || []).filter((r: WaybackRelease) => r.year >= startYear) : (waybackReleasesRes || []);
  const latStr = propertyDetailsResult.success ? propertyDetailsResult.propertyDetails?.latitude : undefined;
  const latitude = latStr && Number.isFinite(parseFloat(latStr)) ? parseFloat(latStr) : undefined;
  const lngStr = propertyDetailsResult.success ? propertyDetailsResult.propertyDetails?.longitude : undefined;
  const longitude = lngStr && Number.isFinite(parseFloat(lngStr)) ? parseFloat(lngStr) : undefined;
  const dualSectionData = valuationTab === 'dual' && resolvedPropertyId
    ? await assembleDualMethodSectionData(resolvedPropertyId, oldDetails, rateableRes, capitalRes, dualResult)
    : undefined;
  const mappedPropertiesData = mappedPropertiesResult?.success && Array.isArray(mappedPropertiesResult.data)
    ? mappedPropertiesResult.data : [];
  const taxDetails = taxDetailsRes || { rateableTaxDetails: undefined, capitalTaxDetails: undefined, rateableTaxError: undefined, capitalTaxError: undefined };
  let rawPropertyData = propertyListResult?.success && propertyListResult.data ? propertyListResult.data : [];

  if (propertyDetailsResult.success && propertyDetailsResult.propertyDetails) {
    const details = propertyDetailsResult.propertyDetails;
    const exists = rawPropertyData.some(
      (p) =>
        p.propertyNo === details.propertyNo &&
        normalizePartition(p.partitionNo) === normalizePartition(details.partitionNo)
    );
    if (!exists) {
      rawPropertyData = [
        {
          propertyId: propertyDetailsResult.propertyId!,
          propertyNo: details.propertyNo,
          partitionNo: details.partitionNo || '',
          upicId: details.upicId || '',
          ownerName: details.ownerName || '',
          address: '',
          displayProperty: details.propertyNo,
        },
        ...rawPropertyData,
      ];
    }
  }

  const propertyOptions = buildPropertyOptions(rawPropertyData);

  // URL Normalization check
  let shouldRedirect = false;
  let redirectUrl = '';
  const hasFullParams = searchParams?.wardNo && searchParams?.propertyNo && searchParams?.wardId && searchParams?.propertyId;

  if (propertyDetailsResult.success && propertyDetailsResult.propertyId && (!hasFullParams || !propertyIdParam)) {
    const newParams = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value == null) continue;
      const values = Array.isArray(value) ? value : [value];
      values.forEach((v) => newParams.append(key, v));
    }
    newParams.set('propertyId', propertyDetailsResult.propertyId.toString());
    if (propertyDetailsResult.wardId) newParams.set('wardId', propertyDetailsResult.wardId.toString());
    if (propertyDetailsResult.wardNo) newParams.set('wardNo', propertyDetailsResult.wardNo);
    if (propertyDetailsResult.propertyDetails.propertyNo) newParams.set('propertyNo', propertyDetailsResult.propertyDetails.propertyNo);
    const rawPart = propertyDetailsResult.propertyDetails.partitionNo;
    newParams.set('partitionNo', rawPart && rawPart.trim() !== '' ? rawPart : '0');
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
