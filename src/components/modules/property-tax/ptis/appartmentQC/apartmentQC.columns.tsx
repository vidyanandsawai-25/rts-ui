import React from 'react';

import { Tooltip } from '@/components/common/Tooltip';

export type Column<T = Record<string, unknown>> = {
  key: string;
  label: string;
  headerTooltip?: boolean | string;
  cellClassName?: string;
  headerClassName?: string;
  render?: (value: unknown, row?: T) => React.ReactNode;
};

// Mapping of column keys to their full tooltip translation keys
const COLUMN_FULL_NAME_KEYS: Record<string, string> = {
  propertyNo: 'tooltips.propertyNo',
  oldPropertyNo: 'tooltips.oldPropertyNo',
  wing: 'tooltips.wing',
  flatOrShopNo: 'tooltips.flatOrShopNo',
  flatOrShopName: 'tooltips.flatOrShopName',
  ownerName: 'tooltips.ownerName',
  occupierName: 'tooltips.occupierName',
  ocDate: 'tooltips.ocDate',
  oldRV: 'tooltips.oldRV',
  rateableValue: 'tooltips.rateableValue',
  rentMonthly: 'tooltips.rentMonthly',
  renterName: 'tooltips.renterName',
  typeOfUse: 'tooltips.typeOfUse',
  propertyTypeName: 'tooltips.propertyTypeName',
  apartmentType: 'tooltips.apartmentType',
  assessmentYear: 'tooltips.assessmentYear',
  constructionYear: 'tooltips.constructionYear',
  constructionType: 'tooltips.constructionType',
  toiletCount: 'tooltips.toiletCount',
  bhk: 'tooltips.bhk',
  carpetArea: 'tooltips.carpetArea',
  builtupArea: 'tooltips.builtupArea',
  oldConstArea: 'tooltips.oldConstArea',
  capitalValue: 'tooltips.capitalValue',
  oldTotalTax: 'tooltips.oldTotalTax',
  // newTaxTotal: "tooltips.newTaxTotal",
  newTaxTotalRV: 'tooltips.newTaxTotalRV',
  newTaxTotalCV: 'tooltips.newTaxTotalCV',
  mobileNo: 'tooltips.mobileNo',
  emailId: 'tooltips.emailId',
  cv: 'tooltips.cv',
  newRV: 'tooltips.newRV',
  totalTax: 'tooltips.totalTax',
};

// Wrapper to add header tooltips with full names from translations
const withHeaderTooltips = <T,>(columns: Column<T>[], t: (key: string) => string): Column<T>[] =>
  columns.map((col) => {
    let tooltip: string | undefined;

    // 1. If headerTooltip is a STRING → use it directly
    if (typeof col.headerTooltip === 'string') {
      tooltip = col.headerTooltip;
    }

    // 2. If headerTooltip is TRUE → use translation mapping
    else if (col.headerTooltip === true) {
      tooltip = COLUMN_FULL_NAME_KEYS[col.key] ? t(COLUMN_FULL_NAME_KEYS[col.key]) : col.label;
    }

    // 3. If undefined → fallback to mapping or label
    else {
      tooltip = COLUMN_FULL_NAME_KEYS[col.key] ? t(COLUMN_FULL_NAME_KEYS[col.key]) : col.label;
    }

    return {
      ...col,
      headerTooltip: tooltip,
    };
  });
// Helper function to render comma-separated values with count & tooltip
const renderMultiRecord = (value: unknown): React.ReactNode => {
  if (value === null || typeof value === 'undefined') return '-';
  const str = String(value).trim();
  if (!str) return '-';

  const parts = str
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return <span>{str}</span>;
  }

  const firstRecord = parts[0];
  const count = parts.length - 1;
  const displayText = `${firstRecord} +${count}`;

  return (
    <Tooltip
      content={
        <div className="text-xs max-w-sm whitespace-normal break-words leading-relaxed">{str}</div>
      }
      placement="top"
    >
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

  const parts = str
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 2) {
    return <span>{str}</span>;
  }

  const firstTwo = parts.slice(0, 2).join(', ');
  const count = parts.length - 2;
  const displayText = `${firstTwo} +${count}`;

  return (
    <Tooltip
      content={
        <div className="text-xs max-w-sm whitespace-normal break-words leading-relaxed">{str}</div>
      }
      placement="top"
    >
      <span className="cursor-help font-semibold text-blue-600 hover:text-blue-800 transition-colors">
        {displayText}
      </span>
    </Tooltip>
  );
};
const renderOwnerName = (value: unknown): React.ReactNode => {
  if (!value) return '-';

  const text = String(value);

  const shortText = text.length > 20 ? `${text.substring(0, 20)}...` : text;

  return (
    <Tooltip content={<div className="max-w-sm break-words text-xs">{text}</div>} placement="top">
      <span className="text-left block">{shortText}</span>
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
export const getApartmentQCColumns = (
  activeMainTab: string,
  activeSubTab: string,
  t: (key: string) => string
): Column<Record<string, unknown>>[] => {
  if (activeMainTab === 'commercial') {
    if (activeSubTab === 'dual-method') {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.partitionNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'wing', label: t('columns.wingName') },
          { key: 'flatOrShopNo', label: t('columns.shopNo') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'flatOrShopName', label: t('columns.shopName') },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          {
            key: 'oldTotalTax',
            label: t('columns.oldTax'),
            headerTooltip: t('tooltips.oldRV'), // 👈 THIS is what you want
          },
          { key: 'rateableValue', label: t('columns.newRV') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.type'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.assessmentYear'), render: renderMultiRecord },
          {
            key: 'constructionYear',
            label: t('columns.surveyConstructionYear'),
            render: renderMultiRecord,
          },
          {
            key: 'constructionType',
            label: t('columns.constructionType'),
            render: renderMultiRecordMax2,
          },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          // { key: "carpetAreaSqMtr", label: t("columns.carpetAreaSqMtr") },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          // { key: "builtupASqMtr", label: t("columns.builtupAreaSqMtr") },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'newTaxTotalRV', label: t('columns.newTaxRV') },
          { key: 'capitalValue', label: t('columns.capitalValue') },
          { key: 'newTaxTotalCV', label: t('columns.totalTaxCV') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
          // { key: "ocDate", label: t("columns.ocDate") },
        ],
        t
      );
    } else if (activeSubTab === 'capital') {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.propertyNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'wing', label: t('columns.wingName') },
          { key: 'flatOrShopNo', label: t('columns.shopNo') },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          { key: 'rateableValue', label: t('columns.newRV') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.type'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.asstYear'), render: renderMultiRecord },
          { key: 'constructionYear', label: t('columns.conYear'), render: renderMultiRecord },
          { key: 'constructionType', label: t('columns.conType'), render: renderMultiRecordMax2 },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'capitalValue', label: t('columns.newCV') },
          { key: 'oldTotalTax', label: t('columns.oldTax') },
          { key: 'newTaxTotalCV', label: t('columns.newTax') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
        ],
        t
      );
    } else {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.propertyNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'wing', label: t('columns.wingName') },
          { key: 'flatOrShopNo', label: t('columns.shopNo') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          { key: 'rateableValue', label: t('columns.newRV') },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'flatOrShopName', label: t('columns.shopName') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.type'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.asstYear'), render: renderMultiRecord },
          { key: 'constructionYear', label: t('columns.conYear'), render: renderMultiRecord },
          { key: 'constructionType', label: t('columns.conType'), render: renderMultiRecordMax2 },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'oldTotalTax', label: t('columns.oldTax') },
          { key: 'newTaxTotal', label: t('columns.newTax') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
        ],
        t
      );
    }
  }

  if (activeMainTab === 'residential') {
    if (activeSubTab === 'dual-method') {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.partitionNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'flatOrShopNo', label: t('columns.flatNo') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          { key: 'rateableValue', label: t('columns.newRV') },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.type'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.assessmentYear'), render: renderMultiRecord },
          {
            key: 'constructionYear',
            label: t('columns.surveyConstructionYear'),
            render: renderMultiRecord,
          },
          {
            key: 'constructionType',
            label: t('columns.constructionType'),
            render: renderMultiRecordMax2,
          },
          { key: 'bhk', label: t('columns.bhk') },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'newTaxTotalRV', label: t('columns.newTaxRV') },
          { key: 'capitalValue', label: t('columns.capitalValue') },
          { key: 'newTaxTotalCV', label: t('columns.totalTaxCV') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
        ],
        t
      );
    } else if (activeSubTab === 'capital') {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.propertyNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'flatOrShopNo', label: t('columns.flatNo') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          { key: 'rateableValue', label: t('columns.newRV') },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.apartmentType'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.asstYear'), render: renderMultiRecord },
          { key: 'constructionYear', label: t('columns.conYear'), render: renderMultiRecord },
          { key: 'constructionType', label: t('columns.conType'), render: renderMultiRecordMax2 },
          { key: 'bhk', label: t('columns.bhk') },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'capitalValue', label: t('columns.newCV') },
          { key: 'oldTotalTax', label: t('columns.oldTax') },
          { key: 'newTaxTotalCV', label: t('columns.newTax') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
        ],
        t
      );
    } else {
      return withHeaderTooltips(
        [
          { key: 'propertyNo', label: t('columns.propertyNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
          { key: 'oldPropertyNo', label: t('columns.oldPropertyNo'), cellClassName: 'font-semibold text-amber-700 bg-amber-50' },
          { key: 'flatOrShopNo', label: t('columns.flatNo') },
          {
            key: 'ownerName',
            label: t('columns.ownerName'),
            render: renderOwnerName,
            cellClassName: 'text-left min-w-[220px] max-w-[220px]',
          },
          { key: 'ocDate', label: t('columns.ocDate') },
          { key: 'oldRV', label: t('columns.oldRV') },
          { key: 'rateableValue', label: t('columns.newRV') },
          { key: 'occupierName', label: t('columns.occupierName') },
          { key: 'rentMonthly', label: t('columns.rent') },
          { key: 'renterName', label: t('columns.renterName') },
          { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
          {
            key: 'propertyTypeName',
            label: t('columns.description'),
            render: renderMultiRecordMax2,
          },
          { key: 'apartmentType', label: t('columns.type'), render: renderMultiRecord },
          { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
          { key: 'assessmentYear', label: t('columns.asstYear'), render: renderMultiRecord },
          { key: 'constructionYear', label: t('columns.conYear'), render: renderMultiRecord },
          { key: 'constructionType', label: t('columns.conType'), render: renderMultiRecordMax2 },
          { key: 'bhk', label: t('columns.bhk') },
          { key: 'toiletCount', label: t('columns.toiletCount') },
          { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
          { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
          { key: 'oldConstArea', label: t('columns.oldConstArea') },
          { key: 'oldTotalTax', label: t('columns.oldTax') },
          { key: 'newTaxTotal', label: t('columns.newTax') },
          { key: 'mobileNo', label: t('columns.mobileNo') },
          { key: 'emailId', label: t('columns.emailId') },
        ],
        t
      );
    }
  }

  // Fallback / Amenities columns
  const baseColumns = [
    { key: 'propertyNo', label: t('columns.propertyNo'), cellClassName: 'font-semibold text-blue-700 bg-blue-50' },
    { key: 'floor', label: t('columns.floor'), render: renderMultiRecord },
    { key: 'assessmentYear', label: t('columns.asstYear'), render: renderMultiRecord },
    { key: 'constructionYear', label: t('columns.conYear'), render: renderMultiRecord },
    { key: 'typeOfUse', label: t('columns.use'), render: renderMultiRecord },
    { key: 'apartmentType', label: t('columns.apartmentType'), render: renderMultiRecord },
    { key: 'ocDate', label: t('columns.ocDate') },
    { key: 'oldRV', label: t('columns.oldRV') },
    { key: 'newRV', label: t('columns.newRV') },
    { key: 'carpetArea', label: t('columns.carpetAreaSqFtMtr') },
    { key: 'builtupArea', label: t('columns.builtupAreaSqFtMtr') },
    { key: 'oldConstArea', label: t('columns.oldConA') },
  ];

  if (activeSubTab === 'capital') {
    baseColumns.push({ key: 'cv', label: t('columns.cv') });
  } else if (activeSubTab === 'dual-method') {
    baseColumns.push({ key: 'cv', label: t('columns.cv') });
  }

  baseColumns.push({ key: 'totalTax', label: t('columns.totalTax') });
  return withHeaderTooltips(baseColumns, t);
};
