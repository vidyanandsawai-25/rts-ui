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

  const plotAreaDisplay = formatAreaFtMtr(dto.plotAreaFt, dto.plotAreaMtr);
  const carpetAreaDisplay = formatAreaFtMtr(dto.carpetAreaFt, dto.carpetAreaMtr);
  const builtUpAreaDisplay = formatAreaFtMtr(dto.builtUpAreaFt, dto.builtUpAreaMtr);

  return {
    propertyId: dto.propertyId ?? undefined,
    propertyNo: dto.propertyNo || '-',
    upic: dto.upicId || '-',
    ownerName: dto.ownerName || dto.owner || dto.propertyHolder || '-',
    owner: dto.owner || dto.ownerName || '-',
    propertyHolder: dto.propertyHolder || dto.ownerName || '-',
    holderRegional: dto.holderRegional || dto.ownerName || '-',
    occupierName: dto.occupierName || '-',
    occupierNameEnglish: dto.occupierName || '-',
    occupierRegional: dto.occupierRegional || '-',
    ownerCategory: dto.ownerCategory || '-',
    division: dto.division || '-',
    moujaName: dto.moujaName || '-',
    surveyNo: dto.surveyNo || '-',
    taxZone: dto.taxZone || '-',
    taxZoneAndName: dto.taxZone || '-',
    subZoneCsnNo: dto.surveyNo || '-',
    plotNo: dto.plotNo || '-',
    aadharNo: dto.aadharNo || '',
    title: dto.ownerTitle || '',
    ownerTitle: dto.ownerTitle || '',
    aadharWithTitle: aadharDisplay,
    mobileNo: dto.mobileNo || dto.alternateMobileNo || '-',
    altMobileNo: dto.alternateMobileNo || '-',
    alternateMobileNo: dto.alternateMobileNo || '-',
    emailId: dto.emailId || '-',
    societyAddress: dto.fullAddress || dto.address || dto.addressEnglish || '-',
    address: dto.fullAddress || dto.address || dto.addressEnglish || '-',
    plotAreaFtMtr: plotAreaDisplay,
    carpetAreaFtMtr: carpetAreaDisplay,
    builtUpAreaFtMtr: builtUpAreaDisplay,
    status: 'ACTIVE PROPERTY',
    category: dto.category || dto.categoryName || 'Individual',
    propertyDescription: dto.propertyDescription || '-',
    propertyDescriptionRegional: dto.propertyDescription || '-',
    societyBuildingPhotoGuid: photoGuid,
    imageUrl: photoGuid ? getViewDocumentUrl(photoGuid) : undefined,
    performance: mapIndividualPerformanceData(dto.additionalRevenue),
  };
}
