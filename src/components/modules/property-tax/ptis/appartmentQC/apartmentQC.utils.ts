import { ApartmentQCDetail, PagedResponse } from '@/types/apartmentQC.types';
import { formatNumericDate } from '@/lib/utils/format';

export const emptyPagedResponse: PagedResponse<ApartmentQCDetail> = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

export const mainTabs = [
  { value: 'amenities', label: 'Amenities', icon: 'Building2' },
  { value: 'commercial', label: 'Commercial Units', icon: 'Building' },
  { value: 'residential', label: 'Residential Units', icon: 'Home' },
];

export const subTabsList = [
  { value: 'rateable', label: 'Rateable', icon: 'Calculator' },
  { value: 'capital', label: 'Capital', icon: 'IndianRupee' },
  { value: 'dual-method', label: 'Dual Method', icon: 'GitMerge' },
];

/**
 * Transforms raw API items into a format suitable for the table display.
 */
export const transformApartmentData = (items: ApartmentQCDetail[], _activeMainTab: string) => {
  if (_activeMainTab === 'commercial' || _activeMainTab === 'residential') {
    return items.map((item) => ({
      ...item,
      oldPropertyNo: item.oldPropertyNo ?? '-',
      flatOrShopNo: item.flatOrShopNo || '-',
      flatOrShopName: item.flatOrShopName || '-',
      ownerName: item.ownerName || '-',
      occupierName: item.occupierName || '-',
      rentMonthly: item.rentMonthly || 0,
      renterName: item.renterName || '-',
      typeOfUse: item.typeOfUse || '-',
      type: item.type || '-',
      floor: item.floor || '-',
      assessmentYear: item.assessmentYear || '-',
      constructionYear: item.constructionYear || '-',
      constructionType: item.constructionType || '-',
      carpetASqFt: item.carpetASqFt || 0,
      carpetASqMtr: item.carpetASqMtr || 0,
      builtupASqFt: item.builtupASqFt || 0,
      builtupASqMtr: item.builtupASqMtr || 0,
      oldConstArea: item.oldConstructionArea ?? '-',
      oldRV: item.oldRV ?? '-',
      oldTotalTax: item.oldTotalTax ?? '-',
      rateableValue: item.rateableValue ?? '-',
      capitalValue: item.capitalValue ?? '-',
      newTaxTotal: item.newTaxTotal || 0,
      newTaxTotalRV: item.newTaxTotalRV || 0,
      newTaxTotalCV: item.newTaxTotalCV || 0,
      mobileNo: item.mobileNo || '-',
      emailId: item.emailId || '-',
      ocDate: formatNumericDate(item.ocDate),
    }));
  }

  return items.map((item) => ({
    ...item,
    propertyNo: item.propertyNo || '-',
    floor: item.floor || '-',
    assessmentYear: item.assessmentYear || '-',
    constructionYear: item.constructionYear || '-',
    typeOfUse: item.typeOfUse || '-',
    carpetArea: `${item.carpetASqFt || 0} / ${item.carpetASqMtr || 0}`,
    builtupArea: `${item.builtupASqFt || 0} / ${item.builtupASqMtr || 0}`,
    oldConstArea: item.oldConstructionArea || '-',
    oldRV: item.oldRV || '-',
    newRV: item.newTaxTotalRV || '-',
    cv: item.newTaxTotalCV || '-',
    totalTax: item.newTaxTotal || 0,
    ocDate: formatNumericDate(item.ocDate),
  }));
};

export const getTabTitle = (activeMainTab: string, t: (key: string) => string) => {
  switch (activeMainTab) {
    case 'commercial':
      return t("apartmentTabs.commercialTitle");
    case 'residential':
      return t("apartmentTabs.residentialTitle");
    default:
      return t("apartmentTabs.amenitiesTitle");
  }
};
