import React from "react";
import { Column } from "@/components/common/MasterTable";
import { Tooltip } from "@/components/common/Tooltip";

// Helper function to render comma-separated values with count & tooltip
const renderMultiRecord = (value: unknown): React.ReactNode => {
  if (value === null || typeof value === 'undefined') return '-';
  const str = String(value).trim();
  if (!str) return '-';

  const parts = str.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <span>{str}</span>;
  }

  const firstRecord = parts[0];
  const count = parts.length - 1;
  const displayText = `${firstRecord} +${count}`;

  return (
    <Tooltip content={<div className="text-xs max-w-sm whitespace-normal break-words leading-relaxed">{str}</div>} placement="top">
      <span className="cursor-help font-semibold text-blue-600 hover:text-blue-800 transition-colors">
        {displayText}
      </span>
    </Tooltip>
  );
};

// Helper function to render comma-separated values with count & tooltip if length > 2
const renderMultiRecordMax2 = (value: unknown): React.ReactNode => {
  if (value === null || typeof value === 'undefined') return '-';
  const str = String(value).trim();
  if (!str) return '-';

  const parts = str.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) {
    return <span>{str}</span>;
  }

  const firstTwo = parts.slice(0, 2).join(', ');
  const count = parts.length - 2;
  const displayText = `${firstTwo} +${count}`;

  return (
    <Tooltip content={<div className="text-xs max-w-sm whitespace-normal break-words leading-relaxed">{str}</div>} placement="top">
      <span className="cursor-help font-semibold text-blue-600 hover:text-blue-800 transition-colors">
        {displayText}
      </span>
    </Tooltip>
  );
};

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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.assessmentYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.surveyConstructionYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.constructionType"), render: renderMultiRecordMax2 },
        { key: "toiletCount", label: t("columns.toiletCount") },
        { key: "carpetASqFt", label: t("columns.carpetAreaSqFt") },
        { key: "carpetASqMtr", label: t("columns.carpetAreaSqMtr") },
        { key: "builtupASqFt", label: t("columns.builtupAreaSqFt") },
        { key: "builtupASqMtr", label: t("columns.builtupAreaSqMtr") },
        { key: "oldConstArea", label: t("columns.oldConstArea") },
        { key: "oldRV", label: t("columns.oldTax") }, // Wait, in original it was label: t("columns.oldTax") or t("columns.oldRV")? Let's check original. Oh, original line 37: { key: "oldTotalTax", label: t("columns.oldTax") }, and line 36: { key: "oldRV", label: t("columns.oldRV") }. Let's preserve that exactly!
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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.asstYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.conYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.conType"), render: renderMultiRecordMax2 },
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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.asstYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.conYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.conType"), render: renderMultiRecordMax2 },
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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.assessmentYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.surveyConstructionYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.constructionType"), render: renderMultiRecordMax2 },
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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.asstYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.conYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.conType"), render: renderMultiRecordMax2 },
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
        { key: "typeOfUse", label: t("columns.description"), render: renderMultiRecord },
        { key: "type", label: t("columns.type"), render: renderMultiRecordMax2 },
        { key: "apartmentType", label: t("columns.apartmentType"), render: renderMultiRecord },
        { key: "floor", label: t("columns.floor"), render: renderMultiRecord },
        { key: "assessmentYear", label: t("columns.asstYear"), render: renderMultiRecord },
        { key: "constructionYear", label: t("columns.conYear"), render: renderMultiRecord },
        { key: "constructionType", label: t("columns.conType"), render: renderMultiRecordMax2 },
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
    { key: 'floor', label: t("columns.floor"), render: renderMultiRecord },
    { key: 'assessmentYear', label: t("columns.asstYear"), render: renderMultiRecord },
    { key: 'constructionYear', label: t("columns.conYear"), render: renderMultiRecord },
    { key: 'typeOfUse', label: t("columns.use"), render: renderMultiRecord },
    { key: 'apartmentType', label: t("columns.apartmentType"), render: renderMultiRecord },
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
