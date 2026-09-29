import type {
  IndividualPropertyDto,
  IndividualAdditionalRevenueDto,
  IndividualPropertyMasterData,
  IndividualPerformanceData,
} from '@/types/property-tax/individual';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { formatAadharNumber } from '@/lib/utils/format';

/**
 * Formats a number to Indian Rupee format (e.g. ₹1,16,318)
 */
export function formatIndianCurrency(val: unknown): string {
  if (val === null || val === undefined || val === '') return '₹0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return '₹0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absNum);
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Format area string from Feet and Meter values
 */
function formatAreaFtMtr(ft?: number | string | null, mtr?: number | string | null): string {
  const hasFt = ft !== null && ft !== undefined && ft !== '' && ft !== 0 && ft !== '0';
  const hasMtr = mtr !== null && mtr !== undefined && mtr !== '' && mtr !== 0 && mtr !== '0';

  if (hasFt && hasMtr) {
    return `${ft} sqft / ${mtr} sq mtr`;
  }
  if (hasFt) {
    return `${ft} sqft`;
  }
  if (hasMtr) {
    return `${mtr} sq mtr`;
  }
  if (mtr === 0 || mtr === '0') {
    return '0 sq mtr';
  }
  return '-';
}

/**
 * Map additional revenue DTO into UI performance data structure
 */
export function mapIndividualPerformanceData(
  revInput?: IndividualAdditionalRevenueDto | IndividualAdditionalRevenueDto[] | null
): IndividualPerformanceData {
  const rev = Array.isArray(revInput) ? revInput[0] : revInput;
  if (!rev) {
    return {
      thisAssessmentRevenue: '₹0',
      revenueGrowthPct: '0%',
      isGrowthNegative: false,
      currentTax: '₹0',
      retroTax: '₹0',
      totalTax: '₹0',
      totalDemand: '₹0',
      currentDemand: '₹0',
      pendingDemand: '₹0',
      collectionPercent: '0%',
      collectionAmount: '₹0',
      totalBalance: '₹0',
      differenceAmount: '₹0',
      rawDifferenceAmount: 0,
      oldCurrentTax: '₹0',
      changePercent: 0,
    };
  }

  const diffAmount = rev.differenceAmount ?? 0;
  const changePct = rev.changePercent ?? 0;
  const isNegative = diffAmount < 0 || changePct < 0;
  const rawDifference = rev.differenceAmount;
  const heroAmount = rawDifference ?? rev.totalTax ?? rev.currentTax ?? 0;

  return {
    thisAssessmentRevenue: formatIndianCurrency(heroAmount),
    revenueGrowthPct: `${changePct}%`,
    isGrowthNegative: isNegative,
    currentTax: formatIndianCurrency(rev.currentTax),
    retroTax: formatIndianCurrency(rev.retroTax),
    totalTax: formatIndianCurrency(rev.totalTax),
    totalDemand: formatIndianCurrency(rev.totalDemand),
    currentDemand: formatIndianCurrency(rev.currentDemand ?? rev.currentTax),
    pendingDemand: formatIndianCurrency(rev.pendingDemand ?? rev.pendingCurrent ?? rev.retroTax),
    collectionPercent: `${rev.collectionPercentage != null ? rev.collectionPercentage : rev.totalDemand && rev.totalDemand > 0 && rev.collection ? Math.round((rev.collection / rev.totalDemand) * 100) : 0}%`,
    collectionAmount: formatIndianCurrency(rev.collection),
    totalBalance: formatIndianCurrency(rev.totalBalance),
    differenceAmount: formatIndianCurrency(diffAmount),
    rawDifferenceAmount: diffAmount,
    oldCurrentTax: formatIndianCurrency(rev.oldCurrentTax),
    changePercent: changePct,
  };
}

/**
 * Map IndividualPropertyDto from backend into IndividualPropertyMasterData for UI
 */
export function mapIndividualPropertyDtoToMasterData(
  dto?: IndividualPropertyDto | null
): IndividualPropertyMasterData {
  if (!dto) {
    return {
      propertyNo: '-',
      upic: '-',
      ownerName: '-',
      owner: '-',
      propertyHolder: '-',
      holderRegional: '-',
      occupierName: '-',
      occupierRegional: '-',
      ownerCategory: '-',
      division: '-',
      moujaName: '-',
      surveyNo: '-',
      taxZone: '-',
      taxZoneAndName: '-',
      subZoneCsnNo: '-',
      plotNo: '-',
      aadharNo: '',
      title: '',
      mobileNo: '-',
      altMobileNo: '-',
      alternateMobileNo: '-',
      emailId: '-',
      societyAddress: '-',
      address: '-',
      plotAreaFtMtr: '-',
      carpetAreaFtMtr: '-',
      builtUpAreaFtMtr: '-',
      status: 'ACTIVE PROPERTY',
      category: '-',
      propertyDescription: '-',
      propertyDescriptionRegional: '-',
      performance: mapIndividualPerformanceData(null),
    };
  }

  const photoGuid =
    dto.individualPropertyPhotoGuid ||
    dto.individualPropertyGuid ||
    dto.societyBuildingPhotoGuid ||
    undefined;

  const formattedAadhar = formatAadharNumber(dto.aadharNo);
  const aadharDisplay = formattedAadhar || '-';

  // Area Dimensions: support both new (*sqFt, *sqMtr) and legacy (*Ft, *Mtr) API keys
  const plotAreaDisplay = formatAreaFtMtr(dto.plotAreaFt, dto.plotAreaMtr);
  const carpetFt = dto.carpetAreasqFt ?? dto.carpetAreaFt;
  const carpetMtr = dto.carpetAreasqMtr ?? dto.carpetAreaMtr;
  const carpetAreaDisplay = formatAreaFtMtr(carpetFt, carpetMtr);

  const builtUpFt = dto.builtUpAreasqFt ?? dto.builtUpAreaFt;
  const builtUpMtr = dto.builtUpAreasqMtr ?? dto.builtUpAreaMtr;
  const builtUpAreaDisplay = formatAreaFtMtr(builtUpFt, builtUpMtr);

  // Previous assessment area dimensions for comparison/context
  const oldCarpetDisplay = formatAreaFtMtr(dto.oldCarpetAreaSqFeet, dto.oldCarpetAreaSqMeter);
  const oldBuiltUpDisplay = formatAreaFtMtr(dto.oldBuiltupAreaSqFeet, dto.oldBuiltupAreaSqMeter);

  // Owner & Occupier Regional Support
  const effectiveOwner = dto.ownerName || dto.owner || dto.propertyHolder || '-';
  const effectiveHolderRegional =
    dto.ownerNameRegional || dto.holderRegional || dto.ownerName || '-';
  const effectiveOccupierRegional =
    dto.occupierNameRegional || dto.occupierRegional || '-';

  // Tax Zone & Rate Section synthesis
  const zoneParts = [
    dto.taxZoneNo ? `Zone ${dto.taxZoneNo}` : '',
    dto.subZoneNo ? `Sub-Zone ${dto.subZoneNo}` : '',
    dto.rateSectionName ? dto.rateSectionName : '',
  ].filter(Boolean);
  const synthesizedTaxZone = zoneParts.length > 0 ? zoneParts.join(' - ') : (dto.taxZone || '-');

  // Address: English & Regional breakdown
  const addressEnglish = dto.addressEnglish || undefined;
  const addressRegional = dto.addressRegional || dto.fullAddress || dto.address || undefined;
  const effectiveAddress = dto.addressEnglish || dto.addressRegional || dto.fullAddress || dto.address || '-';

  return {
    propertyId: dto.propertyId ?? undefined,
    propertyNo: dto.propertyNo || '-',
    upic: dto.upicId || '-',
    ownerName: effectiveOwner,
    owner: effectiveOwner,
    propertyHolder: dto.propertyHolder || effectiveOwner,
    holderRegional: effectiveHolderRegional,
    ownerNameRegional: dto.ownerNameRegional || dto.holderRegional || undefined,
    occupierName: dto.occupierName || '-',
    occupierNameEnglish: dto.occupierName || '-',
    occupierRegional: effectiveOccupierRegional,
    occupierNameRegional: dto.occupierNameRegional || dto.occupierRegional || undefined,
    ownerCategory: dto.ownerCategory || '-',
    division: dto.division || '-',
    moujaName: dto.moujaName || '-',
    surveyNo: dto.surveyNo || '-',
    taxZone: synthesizedTaxZone,
    taxZoneNo: dto.taxZoneNo || undefined,
    subZoneNo: dto.subZoneNo || dto.subZone || undefined,
    subZone: dto.subZoneNo || dto.subZone || undefined,
    rateSectionName: dto.rateSectionName || undefined,
    taxZoneAndName: synthesizedTaxZone,
    subZoneCsnNo: dto.surveyNo || '-',
    plotNo: dto.plotNo || '-',
    flatOrShopNo: dto.flatOrShopNo || undefined,
    flatOrShopName: dto.flatOrShopName || dto.flatOrShopNameEnglish || dto.shopName || undefined,
    shopName: dto.shopName || dto.flatOrShopName || dto.flatOrShopNameEnglish || undefined,
    aadharNo: dto.aadharNo || '',
    title: dto.ownerTitle || '',
    ownerTitle: dto.ownerTitle || '',
    aadharWithTitle: aadharDisplay,
    mobileNo: dto.mobileNo || dto.alternateMobileNo || '-',
    altMobileNo: dto.alternateMobileNo || '-',
    alternateMobileNo: dto.alternateMobileNo || '-',
    emailId: dto.emailId || '-',
    societyAddress: addressRegional || effectiveAddress,
    address: effectiveAddress,
    addressEnglish: addressEnglish,
    addressRegional: addressRegional,
    plotAreaFtMtr: plotAreaDisplay,
    carpetAreaFtMtr: carpetAreaDisplay,
    builtUpAreaFtMtr: builtUpAreaDisplay,
    oldCarpetAreaFtMtr: oldCarpetDisplay !== '-' ? oldCarpetDisplay : undefined,
    oldBuiltUpAreaFtMtr: oldBuiltUpDisplay !== '-' ? oldBuiltUpDisplay : undefined,
    status: 'ACTIVE PROPERTY',
    category: dto.propertyCategory || dto.category || dto.categoryName || 'Individual',
    propertyDescription: dto.propertyDescription || '-',
    propertyDescriptionRegional: dto.propertyDescription || '-',
    societyBuildingPhotoGuid: photoGuid,
    imageUrl: photoGuid ? getViewDocumentUrl(photoGuid) : undefined,
    performance: mapIndividualPerformanceData(dto.additionalRevenue),
  };
}
