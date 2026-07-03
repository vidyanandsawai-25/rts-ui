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
  fetchTabHeaderInfoAction,
} from './ptis-detail-actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import { getDualMethod } from './DualMethod.action';
import { photoPlanService } from '@/lib/api/ptis/photoplan/photoplan.service';
import { fetchTaxDetailsByTab } from './TaxDetails/fetchTaxDetails';
import { fetchWaybackReleases } from '@/lib/api/wayback.service';

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
  valuationTab: 'rateable' | 'capital' | 'dual' | 'apartment' | undefined,
  showDetailsParam: boolean,
  initialMediaPanelVisible: boolean
) {
  const settled = await Promise.allSettled([
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
    getRateableValue(propertyId),
    valuationTab === 'capital' || (valuationTab === 'dual' && showDetailsParam)
      ? getCapitalValue(propertyId)
      : Promise.resolve(null),
    fetchKycDetailsOnlyAction(propertyId),
    fetchSocietyDetailsOnlyAction(propertyId),
    fetchBuildingPermissionOnlyAction(propertyId),
    fetchOldDetailsOnlyAction(propertyId),
    fetchOldFloorDetailsAction(propertyId),
    fetchOldTaxesDetailsAction(propertyId),
    fetchDiscountDetailsOnlyAction(propertyId),
    initialMediaPanelVisible ? photoPlanService.getPhotoTypesWithStatus(propertyId) : Promise.resolve(null),
    initialMediaPanelVisible ? photoPlanService.getPhotosByProperty(propertyId) : Promise.resolve(null),
    valuationTab === 'dual' ? getDualMethod(propertyId) : Promise.resolve(null),
    fetchTaxDetailsByTab(propertyId, valuationTab, showDetailsParam),
    propertyId ? fetchPropertyRuleLogsAction(propertyId) : Promise.resolve(null),
    initialMediaPanelVisible ? fetchWaybackReleases() : Promise.resolve(null),
    propertyId ? fetchTabHeaderInfoAction(propertyId) : Promise.resolve(null),
  ]);
  return settled.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
