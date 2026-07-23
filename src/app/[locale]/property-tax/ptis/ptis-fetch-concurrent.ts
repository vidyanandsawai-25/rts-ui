'use server';

import {
  fetchKycDetailsOnlyAction,
  fetchSocietyDetailsOnlyAction,
  fetchOldDetailsOnlyAction,
  fetchOldFloorDetailsAction,
  fetchOldTaxesDetailsAction,
  fetchDiscountDetailsOnlyAction,
  fetchBuildingPermissionOnlyAction,
  fetchPropertyRuleLogsAction,
  fetchMappedPropertiesAction,
} from './ptis-detail-actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import { getDualMethod } from './DualMethod.action';
import { fetchTaxDetailsByTab } from './TaxDetails/fetchTaxDetails';

export async function fetchPropertyDetailsConcurrently(
  propertyId: number,
  wardId: number | undefined,
  propertyNo: string,
  partitionNo: string,
  appartmentTab: string,
  pageNumber: number,
  pageSize: number,
  searchTerm: string,
  filterWing: string,
  filterFlatOrShopNo: string,
  filterApartmentType: string,
  filterPropertyType: string,
  sortBy: string,
  sortOrder: string,
  valuationTab: 'rateable' | 'capital' | 'dual' | 'apartment' | 'reassessment' | undefined,
  showDetailsParam: boolean
) {
  const rateableValuePromise = getRateableValue(propertyId);
  
  const capitalValuePromise = valuationTab === 'capital' || (valuationTab === 'dual' && showDetailsParam)
    ? getCapitalValue(propertyId)
    : Promise.resolve(null);

  const dualMethodPromise = valuationTab === 'dual'
    ? getDualMethod(propertyId)
    : Promise.resolve(null);

  const taxDetailsPromise = fetchTaxDetailsByTab(propertyId, valuationTab, showDetailsParam);

  // Chain the rule logs fetching to run only after all calculation actions resolve.
  // This avoids the race condition where rule logs are queried before calculation creates them.
  const ruleLogsPromise = Promise.all([
    rateableValuePromise.catch(() => null),
    capitalValuePromise.catch(() => null),
    dualMethodPromise.catch(() => null),
    taxDetailsPromise.catch(() => null),
  ]).then(async () => {
    return propertyId ? fetchPropertyRuleLogsAction(propertyId) : Promise.resolve(null);
  }).catch(() => null);

  return Promise.all([
    wardId && propertyNo
      ? getApartmentQCDataAction(
          wardId,
          propertyNo,
          appartmentTab,
          pageNumber,
          pageSize,
          searchTerm,
          propertyId,
          {
            wing: filterWing || undefined,
            flatOrShopNo: filterFlatOrShopNo || undefined,
            apartmentType: filterApartmentType || undefined,
            propertyType: filterPropertyType || undefined,
          },
          {
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
          },
          partitionNo
        )
      : Promise.resolve(null),
    rateableValuePromise,
    capitalValuePromise,
    fetchKycDetailsOnlyAction(propertyId),
    fetchSocietyDetailsOnlyAction(propertyId),
    fetchBuildingPermissionOnlyAction(propertyId),
    fetchOldDetailsOnlyAction(propertyId),
    fetchOldFloorDetailsAction(propertyId),
    fetchOldTaxesDetailsAction(propertyId),
    fetchDiscountDetailsOnlyAction(propertyId),
    Promise.resolve(null),
    Promise.resolve(null),
    dualMethodPromise,
    taxDetailsPromise,
    ruleLogsPromise,
    Promise.resolve(null),
    import('./ptis-detail-actions').then(m => propertyId ? m.fetchTabHeaderInfoAction(propertyId) : Promise.resolve(null)).catch(() => null),
    fetchMappedPropertiesAction(propertyId),
  ]);
}
