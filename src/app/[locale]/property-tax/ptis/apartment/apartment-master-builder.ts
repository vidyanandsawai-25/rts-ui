import 'server-only';

import type {
  PropertyMasterData,
  WingWiseDetailsItems,
} from '@/types/property-tax/apartment';
import type { fetchPtisPageData } from '@/app/[locale]/property-tax/ptis/ptis-fetch.service';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';

export type PtisPageData = Awaited<ReturnType<typeof fetchPtisPageData>>;

export interface BuildMasterDataParams {
  resolvedPropertyId?: number;
  baseData?: PropertyMasterData;
  pageData: PtisPageData;
  wardNo?: string;
  propertyNo?: string;
  rawData?: WingWiseDetailsItems | null;
  initialApartmentTaxDetails?: unknown;
}

function resolveSocietyPhoto(pageData: PtisPageData): { guid?: string; url?: string } {
  const { initialPhotos, initialPhotoSlots } = pageData;
  const societyPhotoObj =
    initialPhotos?.find(
      (p: { photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
        p.photoTypeCode?.toUpperCase() === 'SOCIETY' ||
        p.photoTypeCode?.toUpperCase() === 'SOCIETY_PHOTO' ||
        p.photoTypeCode?.toUpperCase() === 'SOCIETY_BUILDING' ||
        p.photoTypeName?.toLowerCase().includes('society') ||
        p.photoTypeId === 5
    ) ||
    initialPhotos?.find(
      (p: { photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
        p.photoTypeCode?.toUpperCase() === 'FRONT' ||
        p.photoTypeCode?.toUpperCase() === 'PROPERTY_PHOTO' ||
        p.photoTypeCode?.toUpperCase() === 'BUILDING_PHOTO' ||
        p.photoTypeName?.toLowerCase().includes('front')
    ) ||
    initialPhotos?.[0];

  let guid = societyPhotoObj?.documentGuid ? String(societyPhotoObj.documentGuid) : undefined;
  let url = guid ? getViewDocumentUrl(guid) : (societyPhotoObj?.viewUrl || undefined);

  if (!guid && !url) {
    const slotObj =
      initialPhotoSlots?.find(
        (s: { hasPhoto?: boolean; photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
          s.hasPhoto &&
          (s.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
            s.photoTypeName?.toLowerCase().includes('society') ||
            s.photoTypeId === 5)
      ) || initialPhotoSlots?.find((s: { hasPhoto?: boolean; photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) => s.hasPhoto);

    if (slotObj) {
      if (slotObj.documentGuid) {
        guid = String(slotObj.documentGuid);
        url = getViewDocumentUrl(String(slotObj.documentGuid));
      } else if (slotObj.viewUrl) {
        url = slotObj.viewUrl;
      }
    }
  }
  return { guid, url };
}

export function buildInitialPropertyMasterData(
  params: BuildMasterDataParams
): PropertyMasterData | undefined {
  const { resolvedPropertyId, baseData, pageData, wardNo, propertyNo, rawData } = params;
  if (!resolvedPropertyId && !baseData) return undefined;

  const { propertyDetailsResult, societyDetails, kycDetails, tabHeaderInfo, rawPropertyData } = pageData;
  const propDetails = propertyDetailsResult?.propertyDetails;
  const rawPropDetails = propDetails as unknown as Record<string, unknown>;
  const rawSoc = societyDetails as unknown as Record<string, unknown>;
  const rawKyc = kycDetails as unknown as Record<string, unknown>;
  const rawTabHeader = tabHeaderInfo as unknown as Record<string, unknown>;
  const firstWingRaw = rawData?.wings?.[0] as unknown as Record<string, unknown> | undefined;

  const { guid: photoGuid, url: photoUrl } = resolveSocietyPhoto(pageData);

  const effectiveWardNo = (baseData?.wardNo && baseData.wardNo !== '-') ? baseData.wardNo : (wardNo && wardNo !== '-') ? wardNo : (typeof propDetails?.wardNo === 'string' ? propDetails.wardNo : '') || (typeof tabHeaderInfo?.oldWardNo === 'string' ? tabHeaderInfo.oldWardNo : '') || '-';
  const effectivePropNo = (baseData?.propertyNo && baseData.propertyNo !== '-') ? baseData.propertyNo : (propertyNo && propertyNo !== '-') ? propertyNo : (typeof propDetails?.propertyNo === 'string' ? propDetails.propertyNo : '') || (typeof tabHeaderInfo?.oldPropertyNo === 'string' ? tabHeaderInfo.oldPropertyNo : '') || '-';
  const effectiveUpic = (baseData?.upic && baseData.upic !== '-') ? baseData.upic : (typeof tabHeaderInfo?.upicId === 'string' ? tabHeaderInfo.upicId : '') || (typeof propDetails?.upicId === 'string' ? propDetails.upicId : '') || (typeof rawPropertyData?.[0]?.upicId === 'string' ? rawPropertyData[0].upicId : '') || '-';
  const effectiveSocietyName = (baseData?.societyName && baseData.societyName !== '-') ? baseData.societyName : (typeof societyDetails?.buildingSocietyName === 'string' ? societyDetails.buildingSocietyName : '') || (typeof rawSoc?.societyName === 'string' ? rawSoc.societyName : '') || (typeof kycDetails?.propertyHolderName === 'string' ? kycDetails.propertyHolderName : '') || (typeof tabHeaderInfo?.ownerName === 'string' ? tabHeaderInfo.ownerName : '') || '-';
  const effectiveDivision = (baseData?.division && baseData.division !== '-') ? baseData.division : (typeof rawPropDetails?.division === 'string' && rawPropDetails.division !== '-') ? rawPropDetails.division : (typeof rawPropDetails?.divisionName === 'string' && rawPropDetails.divisionName !== '-') ? rawPropDetails.divisionName : (typeof rawTabHeader?.division === 'string' && rawTabHeader.division !== '-') ? rawTabHeader.division : '-';
  const effectiveTaxZoneAndName = (baseData?.taxZoneAndName && baseData.taxZoneAndName !== '-') ? baseData.taxZoneAndName : (rawPropDetails?.taxZone && rawPropDetails?.taxZoneName) ? `${String(rawPropDetails.taxZone)} - ${String(rawPropDetails.taxZoneName)}` : '-';
  const effectiveSubZoneCsn = (baseData?.subZoneCsnNo && baseData.subZoneCsnNo !== '-') ? baseData.subZoneCsnNo : rawPropDetails?.csn ? `CSN - ${String(rawPropDetails.csn)}` : rawPropDetails?.subZone ? `CSN - ${String(rawPropDetails.subZone)}` : rawTabHeader?.surveyNo ? `CSN - ${String(rawTabHeader.surveyNo)}` : '-';
  const effectivePlotNo = (baseData?.plotNo && baseData.plotNo !== '-') ? baseData.plotNo : (typeof rawPropDetails?.plotNo === 'string' && rawPropDetails.plotNo !== '-') ? rawPropDetails.plotNo : (typeof rawTabHeader?.plotNo === 'string' && rawTabHeader.plotNo !== '-') ? rawTabHeader.plotNo : '-';
  const effectiveLandOwner = (baseData?.landOwnerName && baseData.landOwnerName !== '-') ? baseData.landOwnerName : (typeof rawSoc?.landOwnerName === 'string' && rawSoc.landOwnerName !== '-') ? rawSoc.landOwnerName : (typeof rawKyc?.propertyHolderNameMarathi === 'string' && rawKyc.propertyHolderNameMarathi !== '-') ? rawKyc.propertyHolderNameMarathi : baseData?.ownerName || '-';
  const effectiveBuilder = (baseData?.builderName && baseData.builderName !== '-') ? baseData.builderName : (typeof rawSoc?.builderName === 'string' && rawSoc.builderName !== '-') ? rawSoc.builderName : (typeof rawKyc?.occupierNameMarathi === 'string' && rawKyc.occupierNameMarathi !== '-') ? rawKyc.occupierNameMarathi : '-';
  const effectiveSocietyEmail = (baseData?.societyEmail && baseData.societyEmail !== '-') ? baseData.societyEmail : (typeof rawSoc?.societyEmailId === 'string' && rawSoc.societyEmailId !== '-') ? rawSoc.societyEmailId : (typeof rawKyc?.emailId === 'string' && rawKyc.emailId !== '-') ? rawKyc.emailId : '-';
  const effectiveSecName = (baseData?.secretaryName && baseData.secretaryName !== '-') ? baseData.secretaryName : (typeof rawSoc?.secretaryName === 'string' && rawSoc.secretaryName !== '-') ? rawSoc.secretaryName : (typeof firstWingRaw?.secretaryName === 'string' && firstWingRaw.secretaryName !== '-') ? String(firstWingRaw.secretaryName) : '-';
  const rawSecMobile = (baseData?.secretaryMobileNo && baseData.secretaryMobileNo !== '-') ? baseData.secretaryMobileNo : (typeof rawSoc?.secretaryMobileNo === 'string' && rawSoc.secretaryMobileNo !== '-') ? rawSoc.secretaryMobileNo : (typeof firstWingRaw?.secretaryMobileNo === 'string' && firstWingRaw.secretaryMobileNo !== '-') ? String(firstWingRaw.secretaryMobileNo) : '-';
  const secDigits = String(rawSecMobile || '').replace(/\D/g, '');
  const effectiveSecMobile = (rawSecMobile && rawSecMobile !== '-' && secDigits.length >= 5)
    ? (rawSecMobile.startsWith('+') ? rawSecMobile : `+91 ${secDigits.slice(-10)}`)
    : (baseData?.secretaryMobileNo || '-');
  const effectiveSecEmail = (baseData?.secretaryEmail && baseData.secretaryEmail !== '-') ? baseData.secretaryEmail : (typeof rawSoc?.secretaryEmailId === 'string' && rawSoc.secretaryEmailId !== '-') ? rawSoc.secretaryEmailId : '-';
  const effectiveAddress = (baseData?.societyAddress && baseData.societyAddress !== '-') ? baseData.societyAddress : (baseData?.address && baseData.address !== '-') ? baseData.address : (typeof rawSoc?.societyAddress === 'string' && rawSoc.societyAddress !== '-') ? rawSoc.societyAddress : (typeof rawKyc?.address === 'string' && rawKyc.address !== '-') ? rawKyc.address : '-';
  const effectivePlotArea = (baseData?.plotArea && baseData.plotArea !== '-') ? baseData.plotArea : (typeof rawPropDetails?.plotArea === 'string' || typeof rawPropDetails?.plotArea === 'number') ? `${String(rawPropDetails.plotArea)} sq.ft` : '-';
  const effectiveCarpetBuiltUp = (baseData?.carpetBuiltUpArea && baseData.carpetBuiltUpArea !== '-') ? baseData.carpetBuiltUpArea : (rawPropDetails?.carpetArea && rawPropDetails?.builtUpArea) ? `${String(rawPropDetails.carpetArea)} / ${String(rawPropDetails.builtUpArea)}` : '-';
  const effectiveTotalFloors = (baseData?.totalFloors && baseData.totalFloors !== '-') ? baseData.totalFloors : rawPropDetails?.totalFloors ? String(rawPropDetails.totalFloors) : '-';
  const effectiveTotalProperties = (baseData?.totalPropertiesResCommAmen && baseData.totalPropertiesResCommAmen !== '-') ? baseData.totalPropertiesResCommAmen : rawPropDetails?.totalProperties ? String(rawPropDetails.totalProperties) : '-';
  const effectiveCategory = (baseData?.category && baseData.category !== '-') ? baseData.category : (typeof rawTabHeader?.category === 'string' && rawTabHeader.category !== '-') ? rawTabHeader.category : (typeof rawPropDetails?.categoryName === 'string' && rawPropDetails.categoryName !== '-') ? rawPropDetails.categoryName : 'Apartment';
  const effectiveDescRegional = (baseData?.propertyDescriptionRegional && baseData.propertyDescriptionRegional !== '-') ? baseData.propertyDescriptionRegional : (typeof rawPropDetails?.propertyDescriptionRegional === 'string' && rawPropDetails.propertyDescriptionRegional !== '-') ? rawPropDetails.propertyDescriptionRegional : 'निवासी व अनिवासी';

  const perf = baseData?.performance;

  return {
    ...(baseData || {}),
    propertyId: resolvedPropertyId ?? undefined,
    propertyNo: effectivePropNo,
    upic: effectiveUpic,
    societyName: effectiveSocietyName,
    division: effectiveDivision,
    wardNo: effectiveWardNo,
    category: effectiveCategory,
    taxZoneAndName: effectiveTaxZoneAndName,
    taxZone: (baseData?.taxZone && baseData.taxZone !== '-') ? baseData.taxZone : (rawPropDetails?.taxZone ? String(rawPropDetails.taxZone) : '-'),
    subZoneCsnNo: effectiveSubZoneCsn,
    plotNo: effectivePlotNo,
    landOwnerName: effectiveLandOwner,
    builderName: effectiveBuilder,
    societyEmail: effectiveSocietyEmail,
    secretaryName: effectiveSecName,
    secretaryMobileNo: effectiveSecMobile,
    secretaryEmail: effectiveSecEmail,
    societyAddress: effectiveAddress,
    address: effectiveAddress,
    plotArea: effectivePlotArea,
    carpetBuiltUpArea: effectiveCarpetBuiltUp,
    oldCarpetBuiltUp: baseData?.oldCarpetBuiltUp || effectiveCarpetBuiltUp,
    totalFloors: effectiveTotalFloors,
    totalPropertiesResCommAmen: effectiveTotalProperties,
    societyBuildingPhotoGuid: baseData?.societyBuildingPhotoGuid || photoGuid,
    imageUrl: baseData?.imageUrl || photoUrl,
    propertyDescriptionRegional: effectiveDescRegional,
    performance: perf || {
      thisAssessmentRevenue: '₹0',
      revenueGrowthPct: '',
      currentTax: '-',
      retroTax: '-',
      totalTax: '-',
      totalDemand: '-',
      currentDemand: '-',
      pendingDemand: '-',
      collectionAmount: '-',
      collectionPercent: '0%',
      totalBalance: '-',
      totalOutstanding: '-',
      arrears: '-',
      interest: '-',
      advance: '-',
      oldCurrentTax: '-',
      differenceAmount: '-',
      rawDifferenceAmount: null,
      changePercent: null,
      isGrowthNegative: false,
    },
  };
}
