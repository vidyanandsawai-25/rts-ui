import 'server-only';

import type {
  PropertyMasterData,
  WingWiseDetailsItems,
  ApartmentTaxDetailsItem,
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
  initialApartmentTaxDetails?: ApartmentTaxDetailsItem | null;
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
  const { resolvedPropertyId, baseData, pageData, wardNo, propertyNo, rawData, initialApartmentTaxDetails } = params;
  if (!resolvedPropertyId && !baseData) return undefined;

  const { propertyDetailsResult, societyDetails, kycDetails, tabHeaderInfo, rawPropertyData } = pageData;
  const propDetails = propertyDetailsResult?.propertyDetails;
  const rawPropDetails = propDetails as unknown as Record<string, unknown>;
  const rawSoc = societyDetails as unknown as Record<string, unknown>;
  const rawKyc = kycDetails as unknown as Record<string, unknown>;
  const rawTabHeader = tabHeaderInfo as unknown as Record<string, unknown>;
  const rawWingData = rawData as unknown as Record<string, unknown>;
  const firstWingRaw = rawData?.wings?.[0] as unknown as Record<string, unknown> | undefined;

  const { guid: photoGuid, url: photoUrl } = resolveSocietyPhoto(pageData);

  const currentTaxSum = initialApartmentTaxDetails?.currentTaxes?.reduce((acc, grp) =>
    acc + (grp.taxHeads?.reduce((s, h) => s + (Number(h.taxAmount) || 0), 0) || 0), 0) || 0;
  const retroTaxSum = initialApartmentTaxDetails?.arrears?.reduce((acc, h) => acc + (Number(h.taxAmount) || 0), 0) || 0;
  const totalTaxSum = currentTaxSum + retroTaxSum;

  const effectiveWardNo = (baseData?.wardNo && baseData.wardNo !== '-') ? baseData.wardNo : (wardNo && wardNo !== '-') ? wardNo : propDetails?.wardNo || tabHeaderInfo?.oldWardNo || '-';
  const effectivePropNo = (baseData?.propertyNo && baseData.propertyNo !== '-') ? baseData.propertyNo : (propertyNo && propertyNo !== '-') ? propertyNo : propDetails?.propertyNo || tabHeaderInfo?.oldPropertyNo || '-';
  const effectiveUpic = (baseData?.upic && baseData.upic !== '-') ? baseData.upic : tabHeaderInfo?.upicId || propDetails?.upicId || rawPropertyData?.[0]?.upicId || '-';
  const effectiveSocietyName = (baseData?.societyName && baseData.societyName !== '-') ? baseData.societyName : societyDetails?.buildingSocietyName || (societyDetails as unknown as { societyName?: string })?.societyName || kycDetails?.propertyHolderName || tabHeaderInfo?.ownerName || '-';
  const effectiveDivision = (baseData?.division && baseData.division !== '-') ? baseData.division : (typeof rawPropDetails?.division === 'string' && rawPropDetails.division !== '-') ? rawPropDetails.division : (typeof rawPropDetails?.divisionName === 'string' && rawPropDetails.divisionName !== '-') ? rawPropDetails.divisionName : (typeof rawTabHeader?.division === 'string' && rawTabHeader.division !== '-') ? rawTabHeader.division : '-';
  const effectiveTaxZoneAndName = (baseData?.taxZoneAndName && baseData.taxZoneAndName !== '-') ? baseData.taxZoneAndName : (rawPropDetails?.taxZone && rawPropDetails?.taxZoneName) ? `${rawPropDetails.taxZone} - ${rawPropDetails.taxZoneName}` : '-';
  const effectiveSubZoneCsn = (baseData?.subZoneCsnNo && baseData.subZoneCsnNo !== '-') ? baseData.subZoneCsnNo : rawPropDetails?.csn ? `CSN - ${rawPropDetails.csn}` : rawPropDetails?.subZone ? `CSN - ${rawPropDetails.subZone}` : rawTabHeader?.surveyNo ? `CSN - ${rawTabHeader.surveyNo}` : '-';
  const effectivePlotNo = (baseData?.plotNo && baseData.plotNo !== '-') ? baseData.plotNo : (typeof rawPropDetails?.plotNo === 'string' && rawPropDetails.plotNo !== '-') ? rawPropDetails.plotNo : (typeof rawTabHeader?.plotNo === 'string' && rawTabHeader.plotNo !== '-') ? rawTabHeader.plotNo : '-';
  const effectiveLandOwner = (baseData?.landOwnerName && baseData.landOwnerName !== '-') ? baseData.landOwnerName : (typeof rawSoc?.landOwnerName === 'string' && rawSoc.landOwnerName !== '-') ? rawSoc.landOwnerName : (typeof rawKyc?.propertyHolderNameMarathi === 'string' && rawKyc.propertyHolderNameMarathi !== '-') ? rawKyc.propertyHolderNameMarathi : baseData?.ownerName || '-';
  const effectiveBuilder = (baseData?.builderName && baseData.builderName !== '-') ? baseData.builderName : (typeof rawSoc?.builderName === 'string' && rawSoc.builderName !== '-') ? rawSoc.builderName : (typeof rawKyc?.occupierNameMarathi === 'string' && rawKyc.occupierNameMarathi !== '-') ? rawKyc.occupierNameMarathi : '-';
  const effectiveSocietyEmail = (baseData?.societyEmail && baseData.societyEmail !== '-') ? baseData.societyEmail : (typeof rawSoc?.societyEmailId === 'string' && rawSoc.societyEmailId !== '-') ? rawSoc.societyEmailId : (typeof rawKyc?.emailId === 'string' && rawKyc.emailId !== '-') ? rawKyc.emailId : '-';
  const effectiveSecName = (baseData?.secretaryName && baseData.secretaryName !== '-') ? baseData.secretaryName : (typeof rawSoc?.secretaryName === 'string' && rawSoc.secretaryName !== '-') ? rawSoc.secretaryName : (typeof firstWingRaw?.secretaryName === 'string' && firstWingRaw.secretaryName !== '-') ? firstWingRaw.secretaryName : '-';
  const rawSecMobile = (baseData?.secretaryMobileNo && baseData.secretaryMobileNo !== '-') ? baseData.secretaryMobileNo : (typeof rawSoc?.secretaryMobileNo === 'string' && rawSoc.secretaryMobileNo !== '-') ? rawSoc.secretaryMobileNo : (typeof firstWingRaw?.secretaryMobileNo === 'string' && firstWingRaw.secretaryMobileNo !== '-') ? firstWingRaw.secretaryMobileNo : '-';
  const effectiveSecMobile = rawSecMobile !== '-' ? (rawSecMobile.startsWith('+') ? rawSecMobile : `+91 ${rawSecMobile.replace(/\D/g, '').slice(-10)}`) : '-';
  const effectiveSecEmail = (baseData?.secretaryEmail && baseData.secretaryEmail !== '-') ? baseData.secretaryEmail : (typeof rawSoc?.secretaryEmailId === 'string' && rawSoc.secretaryEmailId !== '-') ? rawSoc.secretaryEmailId : '-';
  const effectiveAddress = (baseData?.societyAddress && baseData.societyAddress !== '-') ? baseData.societyAddress : (baseData?.address && baseData.address !== '-') ? baseData.address : (typeof rawSoc?.societyAddress === 'string' && rawSoc.societyAddress !== '-') ? rawSoc.societyAddress : (typeof rawKyc?.address === 'string' && rawKyc.address !== '-') ? rawKyc.address : '-';
  const effectivePlotArea = (baseData?.plotArea && baseData.plotArea !== '-') ? baseData.plotArea : rawPropDetails?.plotArea ? `${rawPropDetails.plotArea} sq.ft` : '-';
  const effectiveCarpetBuiltUp = (baseData?.carpetBuiltUpArea && baseData.carpetBuiltUpArea !== '-') ? baseData.carpetBuiltUpArea : (rawPropDetails?.carpetArea && rawPropDetails?.builtUpArea) ? `${rawPropDetails.carpetArea} / ${rawPropDetails.builtUpArea}` : '-';
  const effectiveTotalFloors = (baseData?.totalFloors && baseData.totalFloors !== '-') ? baseData.totalFloors : rawPropDetails?.totalFloors ? String(rawPropDetails.totalFloors) : rawData?.wings?.length ? String(rawData.wings.length) : '-';
  const effectiveTotalProperties = (baseData?.totalPropertiesResCommAmen && baseData.totalPropertiesResCommAmen !== '-') ? baseData.totalPropertiesResCommAmen : rawPropDetails?.totalProperties ? String(rawPropDetails.totalProperties) : rawWingData?.totalUnits ? String(rawWingData.totalUnits) : '-';
  const effectiveCategory = (baseData?.category && baseData.category !== '-') ? baseData.category : (typeof rawTabHeader?.category === 'string' && rawTabHeader.category !== '-') ? rawTabHeader.category : (typeof rawPropDetails?.categoryName === 'string' && rawPropDetails.categoryName !== '-') ? rawPropDetails.categoryName : 'Apartment';
  const effectiveDescRegional = (baseData?.propertyDescriptionRegional && baseData.propertyDescriptionRegional !== '-') ? baseData.propertyDescriptionRegional : (typeof rawPropDetails?.propertyDescriptionRegional === 'string' && rawPropDetails.propertyDescriptionRegional !== '-') ? rawPropDetails.propertyDescriptionRegional : 'निवासी व अनिवासी';

  const perf = baseData?.performance;
  const hasPerfTaxes = Boolean(perf && perf.currentTax && perf.currentTax !== '-');

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
    performance: {
      ...(perf || {}),
      thisAssessmentRevenue: (perf?.thisAssessmentRevenue && perf.thisAssessmentRevenue !== '₹0' && perf.thisAssessmentRevenue !== '-') ? perf.thisAssessmentRevenue : (totalTaxSum > 0 ? `₹${totalTaxSum.toLocaleString('en-IN')}` : '₹0'),
      revenueGrowthPct: perf?.revenueGrowthPct || '',
      currentTax: hasPerfTaxes ? perf?.currentTax : (currentTaxSum > 0 ? `₹${currentTaxSum.toLocaleString('en-IN')}` : '-'),
      retroTax: hasPerfTaxes ? perf?.retroTax : (retroTaxSum > 0 ? `₹${retroTaxSum.toLocaleString('en-IN')}` : '-'),
      totalTax: hasPerfTaxes ? perf?.totalTax : (totalTaxSum > 0 ? `₹${totalTaxSum.toLocaleString('en-IN')}` : '-'),
      totalDemand: hasPerfTaxes ? perf?.totalDemand : (totalTaxSum > 0 ? `₹${totalTaxSum.toLocaleString('en-IN')}` : '-'),
      currentDemand: hasPerfTaxes ? perf?.currentDemand : (currentTaxSum > 0 ? `₹${currentTaxSum.toLocaleString('en-IN')}` : '-'),
      pendingDemand: hasPerfTaxes ? perf?.pendingDemand : (retroTaxSum > 0 ? `₹${retroTaxSum.toLocaleString('en-IN')}` : '-'),
      collectionAmount: perf?.collectionAmount && perf.collectionAmount !== '-' ? perf.collectionAmount : '₹0',
      collectionPercent: perf?.collectionPercent ? perf.collectionPercent : '0%',
      totalBalance: hasPerfTaxes ? perf?.totalBalance : (totalTaxSum > 0 ? `₹${totalTaxSum.toLocaleString('en-IN')}` : '-'),
      isGrowthNegative: perf?.isGrowthNegative ?? false,
    },
  };
}
