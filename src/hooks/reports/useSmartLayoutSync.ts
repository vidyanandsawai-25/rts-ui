import { useEffect } from 'react';
import type { ReportParameterDefinition } from '@/types/report.types';

export function parseSelectedPropertyValue(value: string, partitionNo: string) {
  const separatorIndex = value.lastIndexOf('|');
  const displayValue = (separatorIndex >= 0 ? value.slice(0, separatorIndex) : value).trim();
  const propertyId = (separatorIndex >= 0 ? value.slice(separatorIndex + 1) : '').trim();
  const normalizedPartition = partitionNo.trim();
  const partitionSuffix = normalizedPartition ? `/${normalizedPartition}` : '';

  const propertyNo = partitionSuffix && displayValue.endsWith(partitionSuffix)
    ? displayValue.slice(0, -partitionSuffix.length).trim()
    : displayValue;

  return { propertyNo, propertyId };
}

export interface SmartLayoutSyncProps {
  financialYear: string;
  zoneId: string;
  wardId: string[];
  fromProperty: string;
  toProperty: string;
  propertyNo: string;
  partitionNo: string;
  ownerIdList: string;
  selectedProperties: string[];
  selectionMode: string;
  amountOperator: string;
  amountValue: string;
  propertyDescription: string[];
  assessmentStatus: string[];
  parameters: ReportParameterDefinition[];
  handleParamChange: (key: string, value: string) => void;
}

type CanonicalSmartLayoutInput = Omit<SmartLayoutSyncProps, 'handleParamChange' | 'parameters'>;

/** Values consumed directly by the report data providers.
 * Build these from the current controls at submit time so Generate cannot race
 * the effect which mirrors smart-layout state into paramValues.
 */
export function buildCanonicalSmartLayoutParameters({
  financialYear,
  zoneId,
  wardId,
  fromProperty,
  toProperty,
  propertyNo,
  partitionNo,
  ownerIdList,
  selectedProperties,
  selectionMode,
}: CanonicalSmartLayoutInput): Record<string, string> {
  const parsed = selectionMode === 'property' && propertyNo
    ? parseSelectedPropertyValue(propertyNo, partitionNo)
    : { propertyNo: '', propertyId: '' };
  const selectedIds = selectedProperties.map((id) => id.trim()).filter(Boolean).join(',');
  const propertyIds = parsed.propertyId || selectedIds || ownerIdList;

  return {
    financeyear: financialYear,
    zoneId,
    wardId: wardId.join(','),
    fromPropertyNo: selectionMode === 'range' ? fromProperty : '',
    toPropertyNo: selectionMode === 'range' ? toProperty : '',
    propertyNo: selectionMode === 'property' ? parsed.propertyNo : '',
    propertyId: selectionMode === 'property' ? propertyIds : '',
    ownerId: selectionMode === 'property' ? propertyIds : '',
    partitionNo: selectionMode === 'property' ? partitionNo : '',
    propertySelectionMode: selectionMode,
  };
}

/**
 * WarrentNotice currently excludes a property whenever an explicit finance
 * year has no TransMast row, even when that property has pending tax. For an
 * individual warrant, send 0 so required-field validation still passes while
 * the provider uses its active-year path without dropping the exact property
 * selected by ownerId.
 */
export function prepareReportSubmissionParameters(
  reportCode: string,
  selectionMode: string,
  parameters: Record<string, string>,
): Record<string, string> {
  const result = { ...parameters };
  const normalizedReportCode = reportCode.toLowerCase().replace(/[_\s-]+/g, '');

  if (normalizedReportCode === 'warrentnotice' && selectionMode === 'property') {
    Object.keys(result).forEach((key) => {
      const normalizedKey = key.toLowerCase().replace(/[_\s-]+/g, '');
      if (normalizedKey === 'financeyear') result[key] = '0';
    });
  }

  return result;
}

export function useSmartLayoutSync({
  financialYear, zoneId, wardId, fromProperty, toProperty, propertyNo, partitionNo, ownerIdList, selectedProperties,
  selectionMode, amountOperator, amountValue, propertyDescription, assessmentStatus, parameters,
  handleParamChange
}: SmartLayoutSyncProps) {

  useEffect(() => {
    const wardVal = wardId.join(',');
    const propDescVal = propertyDescription.join(',');
    const assessmentVal = assessmentStatus.join(',');

    let propNoVal = selectionMode === 'property' ? (propertyNo || selectedProperties.join(',')) : '';
    let selectedPropertyId = '';

    if (selectionMode === 'property' && propertyNo) {
      const parsedProperty = parseSelectedPropertyValue(propertyNo, partitionNo);
      propNoVal = parsedProperty.propertyNo;
      selectedPropertyId = parsedProperty.propertyId;
    }

    const fromPropVal = selectionMode === 'range' ? fromProperty : (selectionMode === 'property' ? propNoVal : '');
    const toPropVal = selectionMode === 'range' ? toProperty : (selectionMode === 'property' ? propNoVal : '');
    const topNVal = amountOperator === 'top' ? amountValue : '';

    let searchCategoryVal = '';
    if (selectionMode === 'range') searchCategoryVal = '4';
    else if (selectionMode === 'property') searchCategoryVal = '3';
    else if (selectionMode === 'ward') searchCategoryVal = '2';
    else if (selectionMode === 'zone') searchCategoryVal = '1';

    const sortedParams = [...parameters].sort((a, b) => {
      const isAProp = /^property|^prop/i.test(a.parameterKey) && !/from|to|desc|type/i.test(a.parameterKey);
      const isBProp = /^property|^prop/i.test(b.parameterKey) && !/from|to|desc|type/i.test(b.parameterKey);
      if (isAProp && !isBProp) return -1;
      if (!isAProp && isBProp) return 1;
      return 0;
    });

    sortedParams.forEach((p) => {
      const key = p.parameterKey;
      const keyLabel = `${p.parameterKey} ${p.label}`.toLowerCase();

      if (/year|financial/i.test(keyLabel)) {
        handleParamChange(key, financialYear);
      } else if (/zone/i.test(keyLabel)) {
        handleParamChange(key, zoneId);
      } else if (/ward/i.test(keyLabel)) {
        handleParamChange(key, wardVal);
      } else if (/from.*prop|fromprop|prop.*from/i.test(keyLabel)) {
        handleParamChange(key, fromPropVal);
      } else if (/to.*prop|toprop|prop.*to/i.test(keyLabel)) {
        handleParamChange(key, toPropVal);
      } else if (/search.*cat|category/i.test(keyLabel)) {
        handleParamChange(key, searchCategoryVal);
      } else if (/partition/i.test(keyLabel)) {
        handleParamChange(key, partitionNo);
      } else if (/property.*id|prop.*id/i.test(keyLabel)) {
        handleParamChange(key, selectedPropertyId);
      } else if (/owner.*id/i.test(keyLabel)) {
        handleParamChange(key, selectedPropertyId || ownerIdList);
      } else if (/^(property|prop)/i.test(keyLabel) && !/from|to|desc|type|partition|id/i.test(keyLabel)) {
        handleParamChange(key, propNoVal);
      } else if (/amount.*op|amount.*filter|amount.*condition/i.test(keyLabel) || /lessthan|greaterthan/i.test(keyLabel)) {
        handleParamChange(key, amountOperator);
      } else if (/amount/i.test(keyLabel) || /totaltax/i.test(keyLabel)) {
        handleParamChange(key, amountValue);
      } else if (/top.*n/i.test(keyLabel)) {
        handleParamChange(key, topNVal);
      } else if (/assessment/i.test(keyLabel)) {
        handleParamChange(key, assessmentVal);
      } else if (/property.*desc/i.test(keyLabel)) {
        handleParamChange(key, propDescVal);
      } else if (key.toLowerCase() === 'type') {
        handleParamChange(key, propDescVal);
      } else if (/property.*type/i.test(keyLabel)) {
        handleParamChange(key, propDescVal);
      }
    });

    const canonicalValues = buildCanonicalSmartLayoutParameters({
      financialYear, zoneId, wardId, fromProperty, toProperty, propertyNo, partitionNo,
      ownerIdList, selectedProperties, selectionMode, amountOperator, amountValue,
      propertyDescription, assessmentStatus,
    });
    Object.entries(canonicalValues).forEach(([key, value]) => handleParamChange(key, value));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    financialYear, zoneId, wardId, fromProperty, toProperty, propertyNo, partitionNo, ownerIdList, selectedProperties,
    selectionMode, amountOperator, amountValue, propertyDescription, assessmentStatus, parameters.length,
  ]);
}
