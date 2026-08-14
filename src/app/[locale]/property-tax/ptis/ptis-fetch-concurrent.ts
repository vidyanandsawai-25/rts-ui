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
  fetchTabHeaderInfoAction,
} from './ptis-detail-actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import { getDualMethod } from './DualMethod.action';
import { fetchTaxDetailsByTab } from './TaxDetails/fetchTaxDetails';
import { getPropertyComparisonAction } from './PropertyComparison.action';

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
  showDetailsParam: boolean,
  activeTab?: string
) {
  const isPropertyTab = !activeTab || activeTab === 'propertydetails';
  const isKycTab = activeTab === 'kycdetails';
  const isSocietyTab = activeTab === 'societydetails';
  const isBuildingTab = activeTab === 'buildingpermission';
  const isDiscountTab = activeTab === 'discountdetails';
  const isOldDetailsTab = activeTab === 'olddetails';

  const isRateableTab = !valuationTab || valuationTab === 'rateable';

  let rateableValuePromise: Promise<Awaited<ReturnType<typeof getRateableValue>> | null> = Promise.resolve(null);
  let capitalValuePromise: Promise<Awaited<ReturnType<typeof getCapitalValue>> | null> = Promise.resolve(null);
  let dualMethodPromise: Promise<Awaited<ReturnType<typeof getDualMethod>> | null> = Promise.resolve(null);

  if (propertyId) {
    switch (valuationTab) {
      case 'capital': {
        capitalValuePromise = getCapitalValue(propertyId);
        break;
      }
      case 'rateable': {
        rateableValuePromise = getRateableValue(propertyId);
        break;
      }
      case 'dual': {
        dualMethodPromise = getDualMethod(propertyId);
        if (showDetailsParam) {
          rateableValuePromise = getRateableValue(propertyId);
          capitalValuePromise = getCapitalValue(propertyId);
        }
        break;
      }
      default: {
        // Default to rateable for apartment or other tabs
        rateableValuePromise = getRateableValue(propertyId);
        break;
      }
    }
  }

  // Chain taxDetails fetching to run after calculation actions resolve, as the calculation generates the tax details.
  const taxDetailsPromise = propertyId
    ? Promise.all([
        rateableValuePromise.catch(() => null),
        capitalValuePromise.catch(() => null),
        dualMethodPromise.catch(() => null),
      ]).then(() => fetchTaxDetailsByTab(propertyId, valuationTab, showDetailsParam))
    : Promise.resolve(null);

  // PropertyComparison API call is triggered on Rateable and Dual tabs during SSR
  // Chain comparison fetching to run after calculation actions resolve, as the calculation generates the comparison data.
  const comparisonPromise = propertyId
    ? Promise.all([
        rateableValuePromise.catch(() => null),
        capitalValuePromise.catch(() => null),
        dualMethodPromise.catch(() => null),
      ]).then(() =>
        isRateableTab || valuationTab === 'dual'
          ? getPropertyComparisonAction(propertyId)
          : Promise.resolve(null)
      )
    : Promise.resolve(null);

  // Chain the rule logs fetching to run only after all calculation actions resolve.
  const ruleLogsPromise = propertyId
    ? Promise.all([
      rateableValuePromise.catch(() => null),
      capitalValuePromise.catch(() => null),
      dualMethodPromise.catch(() => null),
      taxDetailsPromise.catch(() => null),
    ])
      .then(async () => {
        return propertyId ? fetchPropertyRuleLogsAction(propertyId) : Promise.resolve(null);
      })
      .catch(() => null)
    : Promise.resolve(null);

  const kycPromise = isKycTab ? fetchKycDetailsOnlyAction(propertyId) : Promise.resolve(null);

  const societyPromise = isSocietyTab
    ? fetchSocietyDetailsOnlyAction(propertyId)
    : Promise.resolve(null);

  const buildingPromise = isBuildingTab
    ? fetchBuildingPermissionOnlyAction(propertyId)
    : Promise.resolve(null);

  const oldDetailsPromise = isOldDetailsTab
    ? fetchOldDetailsOnlyAction(propertyId)
    : Promise.resolve(null);

  const oldFloorPromise = isOldDetailsTab
    ? fetchOldFloorDetailsAction(propertyId)
    : Promise.resolve(null);

  const oldTaxesPromise = isOldDetailsTab
    ? fetchOldTaxesDetailsAction(propertyId)
    : Promise.resolve(null);

  const discountPromise = isDiscountTab
    ? fetchDiscountDetailsOnlyAction(propertyId)
    : Promise.resolve(null);

  const headerInfoPromise = propertyId
    ? fetchTabHeaderInfoAction(propertyId).catch(() => null)
    : Promise.resolve(null);

  const mappedPropertiesPromise =
    isPropertyTab || isOldDetailsTab
      ? fetchMappedPropertiesAction(propertyId)
      : Promise.resolve(null);

  return Promise.all([
    wardId && propertyNo && (isPropertyTab || isSocietyTab)
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
    kycPromise,
    societyPromise,
    buildingPromise,
    oldDetailsPromise,
    oldFloorPromise,
    oldTaxesPromise,
    discountPromise,
    Promise.resolve(null),
    Promise.resolve(null),
    dualMethodPromise,
    taxDetailsPromise,
    ruleLogsPromise,
    Promise.resolve(null),
    headerInfoPromise,
    mappedPropertiesPromise,
    comparisonPromise,
  ]);
}
