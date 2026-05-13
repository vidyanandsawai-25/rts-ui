import { Column } from "@/components/common/MasterTable";

/**
 * Returns column definitions for Apartment QC tables based on active tabs.
 * 
 * @param activeMainTab - 'amenities', 'commercial', or 'residential'
 * @param activeSubTab - 'rateable', 'capital', or 'dual-method'
 * @param t - Translation function from next-intl (namespace: appartmentQC)
 * @returns Array of column definitions
 */
export const getApartmentQCColumns = (activeMainTab: string, activeSubTab: string, t: (key: string) => string): Column<Record<string, unknown>>[] => {
  if (activeMainTab === 'commercial') {
    if (activeSubTab === 'dual-method') {
      return [
        { key: "propertyNo", label: t("columns.partitionNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.shopNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "flatOrShopName", label: t("columns.shopName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.assessmentYear") },
        { key: "constructionYear", label: t("columns.surveyConstructionYear") },
        { key: "constructionType", label: t("columns.constructionType") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetAreaSqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetAreaSqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupAreaSqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupAreaSqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "rateableValue", label: t("columns.newRV") },
        { key: "newTaxTotalRV", label: t("columns.newTaxRV") },
        { key: "capitalValue", label: t("columns.capitalValue") },
        { key: "newTaxTotalCV", label: t("columns.totalTaxCV") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    } else if (activeSubTab === 'capital') {
      return [
        { key: "propertyNo", label: t("columns.propertyNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.shopNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "flatOrShopName", label: t("columns.shopName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.asstYear") },
        { key: "constructionYear", label: t("columns.conYear") },
        { key: "constructionType", label: t("columns.conType") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetASqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetASqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupASqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupASqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRVCV") },
        { key: "capitalValue", label: t("columns.newCV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "newTaxTotalCV", label: t("columns.newTax") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    } else {
      return [
        { key: "propertyNo", label: t("columns.propertyNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.shopNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "flatOrShopName", label: t("columns.shopName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.asstYear") },
        { key: "constructionYear", label: t("columns.conYear") },
        { key: "constructionType", label: t("columns.conType") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetASqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetASqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupASqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupASqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRV") },
        { key: "rateableValue", label: t("columns.newRV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "newTaxTotal", label: t("columns.newTax") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    }
  }

  if (activeMainTab === 'residential') {
    if (activeSubTab === 'dual-method') {
      return [
        { key: "propertyNo", label: t("columns.partitionNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.flatNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.assessmentYear") },
        { key: "constructionYear", label: t("columns.surveyConstructionYear") },
        { key: "constructionType", label: t("columns.constructionType") },
        { key: "bhk", label: t("columns.bhk") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetAreaSqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetAreaSqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupAreaSqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupAreaSqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "rateableValue", label: t("columns.newRV") },
        { key: "newTaxTotalRV", label: t("columns.newTaxRV") },
        { key: "capitalValue", label: t("columns.capitalValue") },
        { key: "newTaxTotalCV", label: t("columns.totalTaxCV") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    } else if (activeSubTab === 'capital') {
      return [
        { key: "propertyNo", label: t("columns.propertyNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.flatNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.asstYear") },
        { key: "constructionYear", label: t("columns.conYear") },
        { key: "constructionType", label: t("columns.conType") },
        { key: "bhk", label: t("columns.bhk") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetASqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetASqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupASqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupASqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRVCV") },
        { key: "capitalValue", label: t("columns.newCV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "newTaxTotalCV", label: t("columns.newTax") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    } else {
      return [
        { key: "propertyNo", label: t("columns.propertyNo") },
        { key: "oldPropertyNo", label: t("columns.oldPropertyNo") },
        { key: "wingName", label: t("columns.wingName") },
        { key: "flatOrShopNo", label: t("columns.flatNo") },
        { key: "ownerName", label: t("columns.ownerName") },
        { key: "occupierName", label: t("columns.occupierName") },
        { key: "rentMonthly", label: t("columns.rent") },
        { key: "renterName", label: t("columns.renterName") },
        { key: "typeOfUse", label: t("columns.description") },
        { key: "type", label: t("columns.type") },
        { key: "floor", label: t("columns.floor") },
        { key: "assessmentYear", label: t("columns.asstYear") },
        { key: "constructionYear", label: t("columns.conYear") },
        { key: "constructionType", label: t("columns.conType") },
        { key: "bhk", label: t("columns.bhk") },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetASqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetASqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupASqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupASqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldRV") },
        { key: "rateableValue", label: t("columns.newRV") },
        { key: "oldTotalTax", label: t("columns.oldTax") },
        { key: "newTaxTotal", label: t("columns.newTax") },
        { key: "mobileNo", label: t("columns.mobileNo") },
        { key: "emailId", label: t("columns.emailId") },
        { key: "ocDate", label: t("columns.ocDate") },
      ];
    }
  }

  // Fallback / Amenities columns
  const baseColumns = [
    { key: 'propertyNo', label: t("columns.propertyNo") },
    { key: 'floor', label: t("columns.floor") },
    { key: 'assessmentYear', label: t("columns.asstYear") },
    { key: 'constructionYear', label: t("columns.conYear") },
    { key: 'typeOfUse', label: t("columns.use") },
    { key: 'carpetArea', label: t("columns.carpetAreaSqFtMtr") },
    { key: 'builtupArea', label: t("columns.builtupAreaSqFtMtr") },
    { key: 'oldConstArea', label: t("columns.oldConA") },
    { key: 'oldRV', label: t("columns.oldRV") },
    { key: 'ocDate', label: t("columns.ocDate") },
  ];

  if (activeSubTab === 'capital') {
    baseColumns.push({ key: 'cv', label: t("columns.cv") });
  } else if (activeSubTab === 'dual-method') {
    baseColumns.push({ key: 'cv', label: t("columns.cv") });
    baseColumns.push({ key: 'newRV', label: t("columns.newRV") });
  } else {
    baseColumns.push({ key: 'newRV', label: t("columns.newRV") });
  }

  baseColumns.push({ key: 'totalTax', label: t("columns.totalTax") });
  return baseColumns;
};
