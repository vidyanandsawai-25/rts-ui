import type { PropertyMasterData, ApartmentQcTopSectionDto } from '@/types/property-tax/apartment';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { mapPerformanceSummary } from './apartment-qc-performance.mapper';

export { mapPerformanceSummary };

const toPositiveNumberOrNull = (val: unknown): number | null => {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  return !isNaN(num) && num > 0 && num !== 2147483647 ? num : null;
};

const formatPhone = (val: unknown): string => {
  if (val === null || val === undefined) return '-';
  const str = String(val).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';
  const digits = str.replace(/\D/g, '');
  if (digits.length < 5) return '-';
  return str.startsWith('+') ? str : `+91 ${digits.slice(-10)}`;
};

export function mapApartmentQcTopSectionToPropertyMasterData(
  dto?: ApartmentQcTopSectionDto | null
): PropertyMasterData {
  if (!dto) {
    return {
      propertyNo: '-', upic: '-', societyName: '-', ownerName: '-',
      status: 'ACTIVE PROPERTY', category: '-', propertyDescriptionRegional: '-',
      division: '-', taxZone: '-', taxZoneAndName: '-', subZoneCsnNo: '-',
      plotNo: '-', address: '-', societyAddress: '-', plotArea: '-',
      carpetBuiltUpArea: '-', oldCarpetBuiltUp: '-', totalFloors: '-',
      totalPropertiesResCommAmen: '-', secretaryName: '-', secretaryMobileNo: '-',
      secretaryEmail: '-', builderName: '-', landOwnerName: '-', societyEmail: '-',
      societyBuildingPhotoGuid: undefined, imageUrl: undefined,
      performance: mapPerformanceSummary(null),
    };
  }

  const overview = dto.propertyOverview;
  const info = dto.propertyInfo;
  const perf = dto.performanceSummary;
  const addRev = dto.additionalRevenue || perf?.additionalRevenue;

  const rawDto = dto as unknown as Record<string, unknown>;
  const rawOverview = overview as unknown as Record<string, unknown>;
  const rawInfo = info as unknown as Record<string, unknown>;

  const propertyNo =
    (rawOverview?.propertyNo && rawOverview.propertyNo !== '-') ? String(rawOverview.propertyNo)
      : (rawDto?.propertyNo && rawDto.propertyNo !== '-') ? String(rawDto.propertyNo)
      : (overview?.propertyId && overview.propertyId !== '-') ? String(overview.propertyId) : '-';

  const upic =
    (overview?.upic && overview.upic !== '-') ? overview.upic
      : (rawOverview?.upicId && rawOverview.upicId !== '-') ? String(rawOverview.upicId)
      : (rawDto?.upic && rawDto.upic !== '-') ? String(rawDto.upic) : '-';

  const societyName = overview?.societyName || overview?.propertyHolder || overview?.owner || '-';
  const ownerName = overview?.societyName || overview?.owner || overview?.propertyHolder || '-';
  const status = overview?.propertyStatus ? `${overview.propertyStatus.toUpperCase()} PROPERTY` : 'ACTIVE PROPERTY';
  const category = overview?.propertyCategory || '-';
  const propertyDescriptionRegional = overview?.propertyDescription || '-';
  const division = info?.division || '-';
  const taxZone = info?.taxZone || '-';
  const surveyNo = info?.surveyNo || '';
  const subZoneCsnNo = (rawInfo?.subZoneCsnNo && rawInfo.subZoneCsnNo !== '-') ? String(rawInfo.subZoneCsnNo)
    : (rawDto?.subZoneCsnNo && rawDto.subZoneCsnNo !== '-') ? String(rawDto.subZoneCsnNo) : '-';
  const plotNo = info?.plotNo || '-';
  const address = info?.address || '-';

  const plotArea = info?.plotAreaFt ? `${info.plotAreaFt.toLocaleString('en-IN')} sq.ft`
    : info?.plotAreaMtr ? `${info.plotAreaMtr} sq.mtr` : '-';

  const carpetBuiltUpArea = (info?.carpetAreaFt != null && info?.builtUpAreaFt != null)
    ? `${info.carpetAreaFt.toLocaleString('en-IN')} / ${info.builtUpAreaFt.toLocaleString('en-IN')}` : '-';

  const wings = overview?.wings || [];
  const firstWing = wings[0];

  const secretaryName = (overview?.secretaryName && overview.secretaryName !== '-') ? overview.secretaryName
    : (firstWing?.secretaryName && firstWing.secretaryName !== '-') ? firstWing.secretaryName : '-';

  const secretaryNameEnglish = (rawDto?.secretaryNameEnglish && rawDto.secretaryNameEnglish !== '-') ? String(rawDto.secretaryNameEnglish)
    : (overview?.secretaryNameEnglish && overview.secretaryNameEnglish !== '-') ? overview.secretaryNameEnglish
    : (firstWing?.secretaryNameEnglish && firstWing.secretaryNameEnglish !== '-') ? firstWing.secretaryNameEnglish : undefined;

  const rawSecMobile =
    (info?.secretaryMobileNo && info.secretaryMobileNo !== '-') ? info.secretaryMobileNo
    : (rawOverview?.secretaryMobileNo && rawOverview.secretaryMobileNo !== '-') ? rawOverview.secretaryMobileNo
    : (firstWing?.secretaryMobileNo && firstWing.secretaryMobileNo !== '-') ? firstWing.secretaryMobileNo
    : (rawDto?.secretaryMobileNo && rawDto.secretaryMobileNo !== '-') ? rawDto.secretaryMobileNo : undefined;
  const secretaryMobileNo = formatPhone(rawSecMobile);

  const secretaryEmail = (info?.emailId && info.emailId !== '-') ? info.emailId
    : (info?.secretaryEmailId && info.secretaryEmailId !== '-') ? info.secretaryEmailId
    : (firstWing?.secretaryEmailId && firstWing.secretaryEmailId !== '-') ? firstWing.secretaryEmailId : '-';

  const managerName = (rawDto?.managerName && rawDto.managerName !== '-') ? String(rawDto.managerName)
    : (overview?.managerName && overview.managerName !== '-') ? String(overview.managerName)
    : (firstWing?.managerName && firstWing.managerName !== '-') ? String(firstWing.managerName) : '-';

  const managerNameEnglish = (rawDto?.managerNameEnglish && rawDto.managerNameEnglish !== '-') ? String(rawDto.managerNameEnglish)
    : (overview?.managerNameEnglish && overview.managerNameEnglish !== '-') ? overview.managerNameEnglish
    : (firstWing?.managerNameEnglish && firstWing.managerNameEnglish !== '-') ? firstWing.managerNameEnglish : undefined;

  const rawMgrMobile =
    (info?.managerMobileNo && info.managerMobileNo !== '-') ? info.managerMobileNo
    : (rawOverview?.managerMobileNo && rawOverview.managerMobileNo !== '-') ? rawOverview.managerMobileNo
    : (firstWing?.managerMobileNo && firstWing.managerMobileNo !== '-') ? firstWing.managerMobileNo
    : (rawDto?.managerMobileNo && rawDto.managerMobileNo !== '-') ? rawDto.managerMobileNo : undefined;
  const managerMobileNo = formatPhone(rawMgrMobile);

  const managerEmail = (info?.managerEmailId && info.managerEmailId !== '-') ? info.managerEmailId
    : (firstWing?.managerEmailId && firstWing.managerEmailId !== '-') ? firstWing.managerEmailId : '-';

  const builderName = (rawOverview?.builderName && rawOverview.builderName !== '-') ? String(rawOverview.builderName)
    : (overview?.builderName && overview.builderName !== '-') ? overview.builderName
    : (rawDto?.builderName && rawDto.builderName !== '-') ? String(rawDto.builderName)
    : (rawInfo?.builderName && rawInfo.builderName !== '-') ? String(rawInfo.builderName) : '-';

  const landOwnerName = (rawOverview?.landOwnerName && rawOverview.landOwnerName !== '-') ? String(rawOverview.landOwnerName)
    : (rawDto?.landOwnerName && rawDto.landOwnerName !== '-') ? String(rawDto.landOwnerName)
    : (rawInfo?.landOwnerName && rawInfo.landOwnerName !== '-') ? String(rawInfo.landOwnerName)
    : (overview?.owner && overview.owner !== '-') ? overview.owner : '-';

  const societyEmail = (rawDto?.societyEmailId && rawDto.societyEmailId !== '-') ? String(rawDto.societyEmailId)
    : (rawOverview?.societyEmailId && rawOverview.societyEmailId !== '-') ? String(rawOverview.societyEmailId)
    : (info?.emailId && info.emailId !== '-') ? info.emailId : undefined;

  const performance = {
    ...mapPerformanceSummary(addRev),
    gradeScore: perf?.propertyGrade?.score7,
    gradeLabel: perf?.propertyGrade?.letterGrade,
    gradeDescription: perf?.propertyGrade?.label,
    starRating: perf?.propertyGrade?.stars,
    healthScore: perf?.healthScore?.percent,
    healthStatus: perf?.healthScore?.label,
  };

  const rawSecWingIds = rawDto?.secretaryTargetWingDetailIds ?? rawOverview?.secretaryTargetWingDetailIds;
  const secretaryTargetWingDetailIds = Array.isArray(rawSecWingIds)
    ? rawSecWingIds.map(toPositiveNumberOrNull).filter((id): id is number => typeof id === 'number') : undefined;

  const rawMgrWingIds = rawDto?.managerTargetWingDetailIds ?? rawOverview?.managerTargetWingDetailIds;
  const managerTargetWingDetailIds = Array.isArray(rawMgrWingIds)
    ? rawMgrWingIds.map(toPositiveNumberOrNull).filter((id): id is number => typeof id === 'number') : undefined;

  const pinCode = (rawInfo?.pincode && rawInfo.pincode !== '-') ? String(rawInfo.pincode)
    : (rawInfo?.pinCode && rawInfo.pinCode !== '-') ? String(rawInfo.pinCode)
    : (rawDto?.pinCode && rawDto.pinCode !== '-') ? String(rawDto.pinCode) : undefined;

  return {
    propertyNo, upic, societyName, ownerName, status, category, propertyDescriptionRegional, division,
    wardNo: (rawInfo?.wardNo && rawInfo.wardNo !== '-') ? String(rawInfo.wardNo) : (rawInfo?.wardName && rawInfo.wardName !== '-') ? String(rawInfo.wardName) : (rawOverview?.wardNo && rawOverview.wardNo !== '-') ? String(rawOverview.wardNo) : (rawOverview?.wardName && rawOverview.wardName !== '-') ? String(rawOverview.wardName) : (rawDto?.wardNo && rawDto.wardNo !== '-') ? String(rawDto.wardNo) : '-',
    taxZone,
    taxZoneAndName: (rawInfo?.taxZoneAndName && rawInfo.taxZoneAndName !== '-') ? String(rawInfo.taxZoneAndName) : (rawInfo?.taxZone && rawInfo?.taxZoneName && rawInfo.taxZone !== '-' && rawInfo.taxZoneName !== '-') ? `${rawInfo.taxZone} - ${rawInfo.taxZoneName}` : (rawInfo?.taxZoneNo && rawInfo?.taxZoneName) ? `${rawInfo.taxZoneNo} - ${rawInfo.taxZoneName}` : taxZone,
    surveyNo, subZoneCsnNo, plotNo, address, societyAddress: address, plotArea, carpetBuiltUpArea,
    oldCarpetBuiltUp: carpetBuiltUpArea,
    totalFloors: (rawOverview?.totalFloors && rawOverview.totalFloors !== '-') ? String(rawOverview.totalFloors) : (rawInfo?.totalFloors && rawInfo.totalFloors !== '-') ? String(rawInfo.totalFloors) : (rawDto?.totalFloors && rawDto.totalFloors !== '-') ? String(rawDto.totalFloors) : '-',
    totalPropertiesResCommAmen: (rawOverview?.totalProperties && rawOverview.totalProperties !== '-') ? String(rawOverview.totalProperties) : (rawOverview?.totalPropertiesResCommAmen && rawOverview.totalPropertiesResCommAmen !== '-') ? String(rawOverview.totalPropertiesResCommAmen) : (rawInfo?.totalProperties && rawInfo.totalProperties !== '-') ? String(rawInfo.totalProperties) : (rawDto?.totalProperties && rawDto.totalProperties !== '-') ? String(rawDto.totalProperties) : '-',
    moujaId: toPositiveNumberOrNull(rawInfo?.moujaId ?? rawOverview?.moujaId ?? rawDto?.moujaId),
    taxZoneId: toPositiveNumberOrNull(rawInfo?.taxZoneId ?? rawOverview?.taxZoneId ?? rawDto?.taxZoneId),
    categoryId: toPositiveNumberOrNull(rawOverview?.categoryId ?? rawInfo?.categoryId ?? rawDto?.categoryId),
    propertyTypeId: toPositiveNumberOrNull(rawOverview?.propertyTypeId ?? rawInfo?.propertyTypeId ?? rawDto?.propertyTypeId),
    ownerTypeId: toPositiveNumberOrNull(rawOverview?.ownerTypeId ?? rawInfo?.ownerTypeId ?? rawDto?.ownerTypeId),
    aadharNo: (rawInfo?.aadharNo && rawInfo.aadharNo !== '-') ? String(rawInfo.aadharNo) : (rawDto?.aadharNo && rawDto.aadharNo !== '-') ? String(rawDto.aadharNo) : undefined,
    alternateMobileNo: (rawInfo?.alternateMobileNo && rawInfo.alternateMobileNo !== '-') ? String(rawInfo.alternateMobileNo) : (rawDto?.alternateMobileNo && rawDto.alternateMobileNo !== '-') ? String(rawDto.alternateMobileNo) : undefined,
    pinCode, pincode: pinCode,
    occupierName: (rawOverview?.occupierName && rawOverview.occupierName !== '-') ? String(rawOverview.occupierName) : (rawDto?.occupierName && rawDto.occupierName !== '-') ? String(rawDto.occupierName) : builderName,
    occupierNameEnglish: (rawOverview?.occupierNameEnglish && rawOverview.occupierNameEnglish !== '-') ? String(rawOverview.occupierNameEnglish) : (rawDto?.occupierNameEnglish && rawDto.occupierNameEnglish !== '-') ? String(rawDto.occupierNameEnglish) : undefined,
    ownerNameEnglish: (rawOverview?.ownerNameEnglish && rawOverview.ownerNameEnglish !== '-') ? String(rawOverview.ownerNameEnglish) : (rawDto?.ownerNameEnglish && rawDto.ownerNameEnglish !== '-') ? String(rawDto.ownerNameEnglish) : (rawDto?.landOwnerNameEnglish && rawDto.landOwnerNameEnglish !== '-') ? String(rawDto.landOwnerNameEnglish) : undefined,
    secretaryTargetWingDetailIds, managerTargetWingDetailIds,
    secretaryName, secretaryNameEnglish, secretaryMobileNo, secretaryEmail,
    managerName, managerNameEnglish, managerMobileNo, managerEmail,
    builderName,
    builderNameEnglish: (rawDto?.builderNameEnglish && rawDto.builderNameEnglish !== '-') ? String(rawDto.builderNameEnglish) : ((rawDto?.builderEnglish && rawDto.builderEnglish !== '-') ? String(rawDto.builderEnglish) : undefined),
    builderMobileNo: (rawDto?.builderMobileNo && rawDto.builderMobileNo !== '-') ? String(rawDto.builderMobileNo) : (rawInfo?.builderMobileNo && rawInfo.builderMobileNo !== '-') ? String(rawInfo.builderMobileNo) : (rawInfo?.mobileNo && rawInfo.mobileNo !== '-') ? String(rawInfo.mobileNo) : (rawDto?.mobileNo && rawDto.mobileNo !== '-') ? String(rawDto.mobileNo) : (rawOverview?.builderMobileNo && rawOverview.builderMobileNo !== '-') ? String(rawOverview.builderMobileNo) : undefined,
    mobileNo: (rawInfo?.mobileNo && rawInfo.mobileNo !== '-') ? String(rawInfo.mobileNo) : (rawDto?.mobileNo && rawDto.mobileNo !== '-') ? String(rawDto.mobileNo) : (rawInfo?.builderMobileNo && rawInfo.builderMobileNo !== '-') ? String(rawInfo.builderMobileNo) : (rawDto?.builderMobileNo && rawDto.builderMobileNo !== '-') ? String(rawDto.builderMobileNo) : undefined,
    landOwnerName,
    landOwnerNameEnglish: (rawDto?.landOwnerNameEnglish && rawDto.landOwnerNameEnglish !== '-') ? String(rawDto.landOwnerNameEnglish) : ((rawDto?.ownerNameEnglish && rawDto.ownerNameEnglish !== '-') ? String(rawDto.ownerNameEnglish) : undefined),
    societyNameEnglish: (rawDto?.societyNameEnglish && rawDto.societyNameEnglish !== '-') ? String(rawDto.societyNameEnglish) : undefined,
    societyAddressEnglish: (rawDto?.societyAddressEnglish && rawDto.societyAddressEnglish !== '-') ? String(rawDto.societyAddressEnglish) : undefined,
    societyEmail,
    societyBuildingPhotoGuid: overview?.societyBuildingPhotoGuid || undefined,
    imageUrl: overview?.societyBuildingPhotoGuid ? getViewDocumentUrl(overview.societyBuildingPhotoGuid) : undefined,
    wings: overview?.wings || [],
    performance,
  };
}
