'use server';

import {
  defaultDiscountData,
  defaultBuildingPermission,
} from '@/lib/constants/ptis.constants';
import { buildDetailsFromResults, buildPropertyOptions, InitialDataResult } from './ptis-data';
import type {
  KYCDetailsData,
  SocietyDetailsData,
  OldDetailsData,
  OldFloorDetailsData,
  OldTaxesData,
  TabHeaderInfoData,
  PropertyBasicDetailsApiResponse,
} from '@/types/ptis.types';
import type { WaybackRelease } from '@/lib/api/wayback.service';
import { assembleDualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { ActionResult } from '@/types/common.types';
import type { PropertyListItem } from '@/types/ptis.types';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type { PropertyPhotoDto, PropertyPhotoTypeWithStatusDto } from '@/types/photoplan.types';
import type { PagedResponse, ApartmentQCDetail } from '@/types/apartmentQC.types';
import type { TaxDetailsResult } from './TaxDetails/fetchTaxDetails';

import type { PropertyRuleLogItem } from '@/types/rule-engine';

export async function mapPtisFetchResults({
  propertyDetailsResult,
  propertyListResult,
  detailResults,
  valuationTab,
  resolvedPropertyId,
  activeTab,
  criticalError,
  resolvedWardId,
  initialMediaPanelVisible,
  showFloorParam,
  showOldTaxParam,
  showDetailsParam,
  searchParams,
  locale,
  propertyIdParam,
  wardOptions,
}: {
  propertyDetailsResult: InitialDataResult;
  propertyListResult: ActionResult<PropertyListItem[]> | null;
  detailResults: unknown[];
  valuationTab: 'rateable' | 'capital' | 'dual' | 'apartment' | undefined;
  resolvedPropertyId: number | undefined;
  activeTab: string;
  criticalError: string | undefined;
  resolvedWardId: number | undefined;
  initialMediaPanelVisible: boolean;
  showFloorParam: boolean;
  showOldTaxParam: boolean;
  showDetailsParam: boolean;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
  propertyIdParam: number | undefined;
  wardOptions: SearchSelectOption[];
}) {
  const [
    aptData, rateableRes, capitalRes, kycResult, societyResult,
    buildingPermissionResult, oldDetailsResult, oldFloorResult, oldTaxesResult,
    discountResult, photoSlotsRes, photosRes, dualResult, taxDetailsRes, ruleLogsRes,
    basicDetailsRes, waybackReleasesRes, tabHeaderInfoResult
  ] = (detailResults.length > 0 ? detailResults : Array(18).fill(null)) as [
    { amenities: PagedResponse<ApartmentQCDetail>; commercial: PagedResponse<ApartmentQCDetail>; residential: PagedResponse<ApartmentQCDetail>; } | null,
    ActionResult<RateableValueResponse> | null,
    ActionResult<CapitalValueResponse> | null,
    { success: boolean; data?: KYCDetailsData } | null,
    { success: boolean; data?: SocietyDetailsData } | null,
    { success: boolean; data?: Record<string, unknown> } | null,
    { success: boolean; data?: OldDetailsData } | null,
    { success: boolean; data?: OldFloorDetailsData[] } | null,
    { success: boolean; data?: OldTaxesData } | null,
    { success: boolean; data?: Record<string, unknown> } | null,
    ActionResult<PropertyPhotoTypeWithStatusDto[]> | null,
    ActionResult<PropertyPhotoDto[]> | null,
    ActionResult<DualMethodResponse> | null,
    TaxDetailsResult | null,
    ActionResult<{ items: PropertyRuleLogItem[] }> | null,
    { success: boolean; data?: PropertyBasicDetailsApiResponse } | null,
    WaybackRelease[] | null,
    { success: boolean; data?: TabHeaderInfoData } | null
  ];

  const emptyPaged: PagedResponse<ApartmentQCDetail> = {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

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

  const constructionYearStr = 
    basicDetailsRes?.success && basicDetailsRes.data?.constructionYear
      ? basicDetailsRes.data.constructionYear
      : propertyDetailsResult.success && propertyDetailsResult.propertyDetails?.constructionYear
      ? propertyDetailsResult.propertyDetails.constructionYear
      : undefined;

  let waybackReleases = waybackReleasesRes || [];
  if (constructionYearStr) {
    const yearParsed = parseInt(constructionYearStr, 10);
    if (!isNaN(yearParsed)) {
      const startYear = Math.max(2015, yearParsed - 1);
      waybackReleases = waybackReleases.filter((r) => r.year >= startYear);
    }
  }

  const latitudeStr =
    basicDetailsRes?.success && basicDetailsRes.data?.latitude
      ? basicDetailsRes.data.latitude
      : propertyDetailsResult.success &&
        propertyDetailsResult.propertyDetails?.latitude
        ? propertyDetailsResult.propertyDetails.latitude
        : undefined;
  const latitudeNum = latitudeStr ? parseFloat(latitudeStr) : NaN;
  const latitude = Number.isFinite(latitudeNum) ? latitudeNum : undefined;

  const longitudeStr =
    basicDetailsRes?.success && basicDetailsRes.data?.longitude
      ? basicDetailsRes.data.longitude
      : propertyDetailsResult.success &&
        propertyDetailsResult.propertyDetails?.longitude
        ? propertyDetailsResult.propertyDetails.longitude
        : undefined;
  const longitudeNum = longitudeStr ? parseFloat(longitudeStr) : NaN;
  const longitude = Number.isFinite(longitudeNum) ? longitudeNum : undefined;

  const dualSectionData = valuationTab === 'dual' && resolvedPropertyId
    ? await assembleDualMethodSectionData(resolvedPropertyId, oldDetails, rateableRes, capitalRes, dualResult)
    : undefined;

  const taxDetails = taxDetailsRes || { rateableTaxDetails: undefined, capitalTaxDetails: undefined, rateableTaxError: undefined, capitalTaxError: undefined };

  const rawPropertyData = propertyListResult?.success && propertyListResult.data ? propertyListResult.data : [];
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
    initialMediaPanelVisible,
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
  };
}
