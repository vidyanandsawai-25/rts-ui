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

  const isSocietyPlace = (code?: string, name?: string) => {
    const cUpper = code?.toUpperCase() || '';
    const nLower = name?.toLowerCase() || '';
    if (
      cUpper.includes('BOARD') ||
      nLower.includes('board') ||
      cUpper.includes('SIGN') ||
      nLower.includes('sign') ||
      cUpper.includes('WING') ||
      nLower.includes('wing')
    ) {
      return false;
    }
    return (
      cUpper === 'SOCIETY_PLACE' ||
      cUpper === 'SOCIETY_PLACE_PHOTO' ||
      nLower.includes('society place') ||
      cUpper === 'SOCIETY' ||
      cUpper === 'SOCIETY_PHOTO' ||
      cUpper === 'SOCIETY_BUILDING' ||
      nLower === 'society photo'
    );
  };

  const societyPhotoObj =
    initialPhotos?.find(
      (p: { photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
        p.photoTypeCode?.toUpperCase() === 'SOCIETY_PLACE' ||
        p.photoTypeCode?.toUpperCase() === 'SOCIETY_PLACE_PHOTO' ||
        p.photoTypeName?.toLowerCase().includes('society place')
    ) ||
    initialPhotos?.find(
      (p: { photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
        isSocietyPlace(p.photoTypeCode, p.photoTypeName) || p.photoTypeId === 5
    );

  let guid = societyPhotoObj?.documentGuid ? String(societyPhotoObj.documentGuid) : undefined;
  let url = guid ? getViewDocumentUrl(guid) : (societyPhotoObj?.viewUrl || undefined);

  if (!guid && !url) {
    const slotObj =
      initialPhotoSlots?.find(
        (s: { hasPhoto?: boolean; photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
          Boolean(s.hasPhoto) &&
          (s.photoTypeCode?.toUpperCase() === 'SOCIETY_PLACE' ||
            s.photoTypeCode?.toUpperCase() === 'SOCIETY_PLACE_PHOTO' ||
            s.photoTypeName?.toLowerCase().includes('society place'))
      ) ||
      initialPhotoSlots?.find(
        (s: { hasPhoto?: boolean; photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number; documentGuid?: string | number; viewUrl?: string }) =>
          Boolean(s.hasPhoto) && isSocietyPlace(s.photoTypeCode, s.photoTypeName)
      );

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
  const { resolvedPropertyId, baseData, pageData, propertyNo, rawData } = params;
  if (!resolvedPropertyId && !baseData) return undefined;

  const { propertyDetailsResult, societyDetails, kycDetails, tabHeaderInfo, rawPropertyData } = pageData;
  const propDetails = propertyDetailsResult?.propertyDetails;
  const rawPropDetails = propDetails as unknown as Record<string, unknown>;
  const rawSoc = societyDetails as unknown as Record<string, unknown>;
  const rawKyc = kycDetails as unknown as Record<string, unknown>;
  const rawTabHeader = tabHeaderInfo as unknown as Record<string, unknown>;
  const firstWingRaw = rawData?.wings?.[0] as unknown as Record<string, unknown> | undefined;

  const { guid: photoGuid, url: photoUrl } = resolveSocietyPhoto(pageData);

  const effectiveWardNo = (baseData?.wardNo && baseData.wardNo !== '-')
    ? baseData.wardNo
    : (typeof propDetails?.wardNo === 'string' && propDetails.wardNo !== '-')
    ? propDetails.wardNo
    : (typeof tabHeaderInfo?.oldWardNo === 'string' && tabHeaderInfo.oldWardNo !== '-')
    ? tabHeaderInfo.oldWardNo
    : '-';
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
  const rawPlotAreaStr = rawPropDetails?.plotArea != null ? String(rawPropDetails.plotArea).trim() : '';
  const effectivePlotArea = (baseData?.plotArea && baseData.plotArea !== '-')
    ? baseData.plotArea
    : (rawPlotAreaStr !== '' && rawPlotAreaStr !== '-' && rawPlotAreaStr !== '0')
      ? `${rawPlotAreaStr} sq.ft`
      : '-';

  const rawCarpet = rawPropDetails?.carpetArea != null ? String(rawPropDetails.carpetArea).trim() : '';
  const rawBuiltUp = rawPropDetails?.builtUpArea != null ? String(rawPropDetails.builtUpArea).trim() : '';
  const effectiveCarpetBuiltUp = (baseData?.carpetBuiltUpArea && baseData.carpetBuiltUpArea !== '-')
    ? baseData.carpetBuiltUpArea
    : (rawCarpet !== '' && rawBuiltUp !== '' && rawCarpet !== '-' && rawBuiltUp !== '-')
      ? `${rawCarpet} / ${rawBuiltUp}`
      : '-';

  const rawFloors = rawPropDetails?.totalFloors != null ? String(rawPropDetails.totalFloors).trim() : '';
  const effectiveTotalFloors = (baseData?.totalFloors && baseData.totalFloors !== '-')
    ? baseData.totalFloors
    : (rawFloors !== '' && rawFloors !== '-')
      ? rawFloors
      : '-';

  const rawProps = rawPropDetails?.totalProperties != null ? String(rawPropDetails.totalProperties).trim() : '';
  const effectiveTotalProperties = (baseData?.totalPropertiesResCommAmen && baseData.totalPropertiesResCommAmen !== '-')
    ? baseData.totalPropertiesResCommAmen
    : (rawProps !== '' && rawProps !== '-')
      ? rawProps
      : '-';
  const effectiveCategory = (baseData?.category && baseData.category !== '-') ? baseData.category : (typeof rawTabHeader?.category === 'string' && rawTabHeader.category !== '-') ? rawTabHeader.category : (typeof rawPropDetails?.categoryName === 'string' && rawPropDetails.categoryName !== '-') ? rawPropDetails.categoryName : 'Apartment';
  const effectiveDescRegional = (baseData?.propertyDescriptionRegional && baseData.propertyDescriptionRegional !== '-') ? baseData.propertyDescriptionRegional : (typeof rawPropDetails?.propertyDescriptionRegional === 'string' && rawPropDetails.propertyDescriptionRegional !== '-') ? rawPropDetails.propertyDescriptionRegional : 'निवासी व अनिवासी';

  const perf = baseData?.performance;

  return {
    ...(baseData || {}),
    propertyId: resolvedPropertyId ?? undefined,
    propertyNo: effectivePropNo,
    upic: effectiveUpic,
    societyName: effectiveSocietyName,
    societyNameEnglish: (baseData?.societyNameEnglish && baseData.societyNameEnglish !== '-') ? baseData.societyNameEnglish : (typeof rawSoc?.societyNameEnglish === 'string' && rawSoc.societyNameEnglish !== '-') ? rawSoc.societyNameEnglish : baseData?.societyNameEnglish,
    division: effectiveDivision,
    wardNo: effectiveWardNo,
    category: effectiveCategory,
    taxZoneAndName: effectiveTaxZoneAndName,
    taxZone: (baseData?.taxZone && baseData.taxZone !== '-') ? baseData.taxZone : (rawPropDetails?.taxZone ? String(rawPropDetails.taxZone) : '-'),
    subZoneCsnNo: effectiveSubZoneCsn,
    plotNo: effectivePlotNo,
    landOwnerName: effectiveLandOwner,
    landOwnerNameEnglish: (baseData?.landOwnerNameEnglish && baseData.landOwnerNameEnglish !== '-') ? baseData.landOwnerNameEnglish : (typeof rawSoc?.landOwnerNameEnglish === 'string' && rawSoc.landOwnerNameEnglish !== '-') ? rawSoc.landOwnerNameEnglish : baseData?.landOwnerNameEnglish,
    builderName: effectiveBuilder,
    builderNameEnglish: (baseData?.builderNameEnglish && baseData.builderNameEnglish !== '-') ? baseData.builderNameEnglish : (typeof rawSoc?.builderNameEnglish === 'string' && rawSoc.builderNameEnglish !== '-') ? rawSoc.builderNameEnglish : baseData?.builderNameEnglish,
    societyEmail: effectiveSocietyEmail,
    secretaryName: effectiveSecName,
    secretaryNameEnglish: (baseData?.secretaryNameEnglish && baseData.secretaryNameEnglish !== '-') ? baseData.secretaryNameEnglish : (typeof rawSoc?.secretaryNameEnglish === 'string' && rawSoc.secretaryNameEnglish !== '-') ? rawSoc.secretaryNameEnglish : baseData?.secretaryNameEnglish,
    secretaryMobileNo: effectiveSecMobile,
    secretaryEmail: effectiveSecEmail,
    societyAddress: effectiveAddress,
    societyAddressEnglish: (baseData?.societyAddressEnglish && baseData.societyAddressEnglish !== '-') ? baseData.societyAddressEnglish : (typeof rawSoc?.societyAddressEnglish === 'string' && rawSoc.societyAddressEnglish !== '-') ? rawSoc.societyAddressEnglish : baseData?.societyAddressEnglish,
    address: effectiveAddress,
    managerName: (baseData?.managerName && baseData.managerName !== '-') ? baseData.managerName : (typeof rawSoc?.managerName === 'string' && rawSoc.managerName !== '-') ? rawSoc.managerName : baseData?.managerName,
    managerNameEnglish: (baseData?.managerNameEnglish && baseData.managerNameEnglish !== '-') ? baseData.managerNameEnglish : (typeof rawSoc?.managerNameEnglish === 'string' && rawSoc.managerNameEnglish !== '-') ? rawSoc.managerNameEnglish : baseData?.managerNameEnglish,
    plotArea: effectivePlotArea,
    carpetBuiltUpArea: effectiveCarpetBuiltUp,
    oldCarpetBuiltUp: (baseData?.oldCarpetBuiltUp && baseData.oldCarpetBuiltUp !== '-') ? baseData.oldCarpetBuiltUp : (typeof rawSoc?.oldCarpetBuiltUp === 'string' && rawSoc.oldCarpetBuiltUp !== '-') ? rawSoc.oldCarpetBuiltUp : '-',
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
