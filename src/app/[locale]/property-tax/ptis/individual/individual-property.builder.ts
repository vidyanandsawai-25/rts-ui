import 'server-only';

import type {
  IndividualPropertyMasterData,
  IndividualPerformanceData,
} from '@/types/property-tax/individual';
import type { fetchPtisPageData } from '@/app/[locale]/property-tax/ptis/ptis-fetch.service';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { formatAadharNumber } from '@/lib/utils/format';

export type PtisPageData = Awaited<ReturnType<typeof fetchPtisPageData>>;

export interface BuildIndividualMasterDataParams {
  resolvedPropertyId?: number;
  baseData?: IndividualPropertyMasterData;
  pageData: PtisPageData;
  wardNo?: string;
  propertyNo?: string;
}

interface PhotoItemLike {
  photoTypeCode?: string;
  photoTypeName?: string;
  photoTypeId?: number;
  documentGuid?: string | number;
  viewUrl?: string;
  hasPhoto?: boolean;
}

/**
 * Safely extracts a non-empty, non-dash string property from an unknown record.
 */
function getSafeString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const val = (obj as Record<string, unknown>)[key];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed !== '' && trimmed !== '-' ? trimmed : undefined;
  }
  if (typeof val === 'number' && !isNaN(val)) {
    return String(val);
  }
  return undefined;
}

function isPropertyFrontPhoto(code?: string, name?: string): boolean {
  const c = (code || '').toUpperCase();
  const n = (name || '').toUpperCase();
  return c.includes('FRONT') || c.includes('PROPERTY') || n.includes('FRONT') || n.includes('PROPERTY');
}

/**
 * Resolves the primary photo document GUID and URL dynamically from PTIS page data.
 */
function resolvePropertyPhoto(pageData: PtisPageData): { guid?: string; url?: string } {
  const { initialPhotos, initialPhotoSlots } = pageData;
  const photoList = (initialPhotos as PhotoItemLike[] | undefined) || [];
  const slotList = (initialPhotoSlots as PhotoItemLike[] | undefined) || [];

  const photoObj =
    photoList.find((p) => isPropertyFrontPhoto(p.photoTypeCode, p.photoTypeName)) ||
    slotList.find((s) => Boolean(s.hasPhoto) && isPropertyFrontPhoto(s.photoTypeCode, s.photoTypeName)) ||
    photoList[0] ||
    slotList.find((s) => Boolean(s.hasPhoto));

  const guid = photoObj?.documentGuid ? String(photoObj.documentGuid) : undefined;
  const url = guid ? getViewDocumentUrl(guid) : photoObj?.viewUrl || undefined;

  return { guid, url };
}

const DEFAULT_PERFORMANCE: IndividualPerformanceData = {
  thisAssessmentRevenue: '₹0',
  revenueGrowthPct: '',
  isGrowthNegative: false,
  currentTax: '-',
  retroTax: '-',
  totalTax: '-',
  totalDemand: '-',
  currentDemand: '-',
  pendingDemand: '-',
  collectionPercent: 0,
  collectionAmount: '₹0',
  totalBalance: '₹0',
  differenceAmount: '₹0',
  rawDifferenceAmount: 0,
  oldCurrentTax: '-',
  changePercent: 0,
};

/**
 * Builds the canonical, normalized IndividualPropertyMasterData domain model.
 * Acts as the Single Source of Truth (SSOT) so UI components receive clean,
 * non-null, pre-formatted values without repeating fallback logic.
 */
export function buildInitialIndividualMasterData(
  params: BuildIndividualMasterDataParams
): IndividualPropertyMasterData | undefined {
  const { resolvedPropertyId, baseData, pageData, wardNo, propertyNo } = params;
  if (!resolvedPropertyId && !baseData) return undefined;

  const { propertyDetailsResult, societyDetails, kycDetails, tabHeaderInfo, rawPropertyData } =
    pageData;
  const propDetails = propertyDetailsResult?.propertyDetails;

  const { guid: photoGuid, url: photoUrl } = resolvePropertyPhoto(pageData);

  // 1. Identifiers
  const effectiveWardNo =
    baseData?.wardNo && baseData.wardNo !== '-'
      ? baseData.wardNo
      : wardNo && wardNo !== '-'
        ? wardNo
        : getSafeString(propDetails, 'wardNo') || getSafeString(tabHeaderInfo, 'oldWardNo') || '-';

  const effectivePropNo =
    baseData?.propertyNo && baseData.propertyNo !== '-'
      ? baseData.propertyNo
      : propertyNo && propertyNo !== '-'
        ? propertyNo
        : getSafeString(propDetails, 'propertyNo') ||
          getSafeString(tabHeaderInfo, 'oldPropertyNo') ||
          '-';

  const effectiveUpic =
    baseData?.upic && baseData.upic !== '-'
      ? baseData.upic
      : getSafeString(tabHeaderInfo, 'upicId') ||
        getSafeString(propDetails, 'upicId') ||
        getSafeString(rawPropertyData?.[0], 'upicId') ||
        '-';

  // 2. Ownership & Occupancy
  const effectiveOwnerName =
    baseData?.ownerName && baseData.ownerName !== '-'
      ? baseData.ownerName
      : getSafeString(kycDetails, 'propertyHolderName') ||
        getSafeString(tabHeaderInfo, 'ownerName') ||
        getSafeString(propDetails, 'ownerName') ||
        '-';

  const effectiveOwner =
    baseData?.owner && baseData.owner !== '-' ? baseData.owner : effectiveOwnerName;

  const effectivePropertyHolder =
    baseData?.propertyHolder && baseData.propertyHolder !== '-'
      ? baseData.propertyHolder
      : getSafeString(kycDetails, 'propertyHolderName') || effectiveOwnerName;

  const effectiveHolderRegional =
    baseData?.ownerNameRegional && baseData.ownerNameRegional !== '-'
      ? baseData.ownerNameRegional
      : baseData?.holderRegional && baseData.holderRegional !== '-'
        ? baseData.holderRegional
        : getSafeString(kycDetails, 'propertyHolderNameMarathi') || '-';

  const effectiveOccupierName =
    baseData?.occupierName && baseData.occupierName !== '-'
      ? baseData.occupierName
      : getSafeString(kycDetails, 'occupierName') || '-';

  const effectiveOccupierRegional =
    baseData?.occupierNameRegional && baseData.occupierNameRegional !== '-'
      ? baseData.occupierNameRegional
      : baseData?.occupierRegional && baseData.occupierRegional !== '-'
        ? baseData.occupierRegional
        : getSafeString(kycDetails, 'occupierNameMarathi') || '-';

  // 3. Category & Description
  const effectiveCategory =
    baseData?.category && baseData.category !== '-' && baseData.category !== baseData.ownerCategory
      ? baseData.category
      : getSafeString(tabHeaderInfo, 'category') ||
        getSafeString(propDetails, 'categoryName') ||
        getSafeString(propDetails, 'category') ||
        getSafeString(rawPropertyData?.[0], 'categoryLabel') ||
        getSafeString(rawPropertyData?.[0], 'category') ||
        (baseData?.category && baseData.category !== '-' ? baseData.category : 'Individual');

  const effectiveOwnerCategory =
    baseData?.ownerCategory && baseData.ownerCategory !== '-'
      ? baseData.ownerCategory
      : getSafeString(kycDetails, 'ownerCategory') ||
        (effectiveCategory !== '-' ? effectiveCategory : '-');

  const effectiveDescRegional =
    baseData?.propertyDescriptionRegional && baseData.propertyDescriptionRegional !== '-'
      ? baseData.propertyDescriptionRegional
      : getSafeString(propDetails, 'propertyDescriptionRegional') ||
        getSafeString(propDetails, 'propertyDescription') ||
        getSafeString(tabHeaderInfo, 'description') ||
        '-';

  // 4. Geographical & Cadastral
  const effectiveDivision =
    baseData?.division && baseData.division !== '-'
      ? baseData.division
      : getSafeString(propDetails, 'division') ||
        getSafeString(propDetails, 'divisionName') ||
        getSafeString(tabHeaderInfo, 'division') ||
        '-';

  const effectiveMoujaName =
    baseData?.moujaName && baseData.moujaName !== '-'
      ? baseData.moujaName
      : getSafeString(propDetails, 'moujaName') || getSafeString(tabHeaderInfo, 'moujaName') || '-';

  const rawTaxZone = getSafeString(propDetails, 'taxZone');
  const rawTaxZoneName = getSafeString(propDetails, 'taxZoneName');
  const effectiveTaxZoneAndName =
    baseData?.taxZoneAndName && baseData.taxZoneAndName !== '-'
      ? baseData.taxZoneAndName
      : rawTaxZone && rawTaxZoneName
        ? `${rawTaxZone} - ${rawTaxZoneName}`
        : rawTaxZone || '-';

  const effectiveTaxZone =
    baseData?.taxZone && baseData.taxZone !== '-' ? baseData.taxZone : rawTaxZone || '-';

  const effectiveSurveyNo =
    baseData?.surveyNo && baseData.surveyNo !== '-'
      ? baseData.surveyNo
      : getSafeString(propDetails, 'surveyNo') || getSafeString(tabHeaderInfo, 'surveyNo') || '-';

  const effectivePlotNo =
    baseData?.plotNo && baseData.plotNo !== '-'
      ? baseData.plotNo
      : getSafeString(propDetails, 'plotNo') || getSafeString(tabHeaderInfo, 'plotNo') || '-';

  // 5. Aadhar & Title Normalization
  const effectiveAadharNo =
    baseData?.aadharNo && baseData.aadharNo !== ''
      ? baseData.aadharNo
      : getSafeString(kycDetails, 'aadharNo') || '';

  const effectiveTitle =
    baseData?.title && baseData.title !== ''
      ? baseData.title
      : baseData?.ownerTitle && baseData.ownerTitle !== ''
        ? baseData.ownerTitle
        : getSafeString(kycDetails, 'title') || getSafeString(kycDetails, 'ownerTitle') || '';

  const formattedAadhar = formatAadharNumber(effectiveAadharNo);

  const effectiveAadharWithTitle = formattedAadhar || '-';

  // 6. Contact & Address
  const effectiveMobileNo =
    baseData?.mobileNo && baseData.mobileNo !== '-'
      ? baseData.mobileNo
      : getSafeString(kycDetails, 'mobileNo') ||
        getSafeString(kycDetails, 'alternateMobileNo') ||
        '-';

  const effectiveEmailId =
    baseData?.emailId && baseData.emailId !== '-'
      ? baseData.emailId
      : getSafeString(kycDetails, 'emailId') || '-';

  const effectiveAddress =
    baseData?.societyAddress && baseData.societyAddress !== '-'
      ? baseData.societyAddress
      : baseData?.address && baseData.address !== '-'
        ? baseData.address
        : getSafeString(kycDetails, 'address') ||
          getSafeString(societyDetails, 'societyAddress') ||
          '-';

  // 7. Area Dimensions
  const rawPlotAreaStr = getSafeString(propDetails, 'plotArea') || '';
  const effectivePlotArea =
    baseData?.plotAreaFtMtr && baseData.plotAreaFtMtr !== '-'
      ? baseData.plotAreaFtMtr
      : rawPlotAreaStr !== '' && rawPlotAreaStr !== '0'
        ? `${rawPlotAreaStr} sqft`
        : '-';

  const rawCarpet = getSafeString(propDetails, 'carpetArea') || '';
  const effectiveCarpetArea =
    baseData?.carpetAreaFtMtr && baseData.carpetAreaFtMtr !== '-'
      ? baseData.carpetAreaFtMtr
      : rawCarpet !== ''
        ? `${rawCarpet} sqft`
        : '-';

  const rawBuiltUp = getSafeString(propDetails, 'builtUpArea') || '';
  const effectiveBuiltUpArea =
    baseData?.builtUpAreaFtMtr && baseData.builtUpAreaFtMtr !== '-'
      ? baseData.builtUpAreaFtMtr
      : rawBuiltUp !== ''
        ? `${rawBuiltUp} sqft`
        : '-';

  const perf = baseData?.performance || DEFAULT_PERFORMANCE;

  const hasPhotosList = Array.isArray(pageData.initialPhotos) || Array.isArray(pageData.initialPhotoSlots);
  const effectivePhotoGuid = photoGuid || (!hasPhotosList ? baseData?.societyBuildingPhotoGuid : undefined);
  const effectivePhotoUrl = photoUrl || (!hasPhotosList ? baseData?.imageUrl : undefined);

  return {
    ...(baseData || {}),
    propertyId: resolvedPropertyId ?? baseData?.propertyId ?? undefined,
    propertyNo: effectivePropNo,
    upic: effectiveUpic,
    ownerName: effectiveOwnerName,
    owner: effectiveOwner,
    propertyHolder: effectivePropertyHolder,
    holderRegional: effectiveHolderRegional,
    occupierName: effectiveOccupierName,
    occupierRegional: effectiveOccupierRegional,
    ownerCategory: effectiveOwnerCategory,
    division: effectiveDivision,
    moujaName: effectiveMoujaName,
    wardNo: effectiveWardNo,
    category: effectiveCategory,
    taxZoneAndName: effectiveTaxZoneAndName,
    taxZone: effectiveTaxZone,
    surveyNo: effectiveSurveyNo,
    plotNo: effectivePlotNo,
    aadharNo: effectiveAadharNo,
    title: effectiveTitle,
    ownerTitle: effectiveTitle,
    aadharWithTitle: effectiveAadharWithTitle,
    mobileNo: effectiveMobileNo,
    emailId: effectiveEmailId,
    societyAddress: effectiveAddress,
    address: effectiveAddress,
    plotAreaFtMtr: effectivePlotArea,
    carpetAreaFtMtr: effectiveCarpetArea,
    builtUpAreaFtMtr: effectiveBuiltUpArea,
    societyBuildingPhotoGuid: effectivePhotoGuid,
    imageUrl: effectivePhotoUrl,
    propertyDescription: effectiveDescRegional,
    propertyDescriptionRegional: effectiveDescRegional,
    performance: perf,
  };
}
