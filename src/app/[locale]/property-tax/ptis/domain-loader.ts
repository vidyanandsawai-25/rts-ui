import {
  fetchKycDetailsOnlyAction,
  fetchSocietyDetailsOnlyAction,
  fetchOldDetailsOnlyAction,
  fetchOldFloorDetailsAction,
  fetchOldTaxesDetailsAction,
} from './actions';
import { getApartmentQCDataAction } from './apartmentQC.action';
import { getCapitalValue } from './CapitalValue.action';
import { getRateableValue } from './RateableValue.action';
import {
  defaultKycDetails,
  defaultSocietyDetails,
  defaultOldDetails,
} from '@/lib/constants/ptis.constants';
import type { OldFloorDetailsData, OldTaxesData } from '@/types/ptis.types';

interface FetchDomainDataParams {
  resolvedWardId: number | undefined;
  propertyNo: string;
  appartmentTab: string;
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  resolvedPropertyId: number | undefined;
}

export async function fetchPtisDomainData({
  resolvedWardId,
  propertyNo,
  appartmentTab,
  pageNumber,
  pageSize,
  searchTerm,
  resolvedPropertyId,
}: FetchDomainDataParams) {
  const emptyPaged = {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  };

  const [
    apartmentData,
    rateableResult,
    capitalResult,
    kycResult,
    societyResult,
    oldDetailsResult,
    oldFloorResult,
    oldTaxesResult,
  ] = await Promise.all([
    resolvedWardId && propertyNo
      ? getApartmentQCDataAction(
          resolvedWardId,
          propertyNo,
          appartmentTab,
          pageNumber,
          pageSize,
          searchTerm,
          resolvedPropertyId
        )
      : Promise.resolve({ amenities: emptyPaged, commercial: emptyPaged, residential: emptyPaged }),
    resolvedPropertyId ? getRateableValue(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? getCapitalValue(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchKycDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchSocietyDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldDetailsOnlyAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldFloorDetailsAction(resolvedPropertyId) : Promise.resolve(null),
    resolvedPropertyId ? fetchOldTaxesDetailsAction(resolvedPropertyId) : Promise.resolve(null),
  ]);

  let kycDetails = defaultKycDetails;
  let societyDetails = defaultSocietyDetails;
  let oldDetails = defaultOldDetails;
  let oldFloorTableData: OldFloorDetailsData[] = [];
  let oldTaxesData: OldTaxesData | null = null;

  if (kycResult?.success && kycResult.data) {
    kycDetails = { ...defaultKycDetails, ...kycResult.data };
  }
  if (societyResult?.success && societyResult.data) {
    societyDetails = { ...defaultSocietyDetails, ...societyResult.data };
  }
  if (oldDetailsResult?.success && oldDetailsResult.data) {
    oldDetails = { ...defaultOldDetails, ...oldDetailsResult.data };
  }
  if (oldFloorResult?.success && Array.isArray(oldFloorResult.data)) {
    oldFloorTableData = oldFloorResult.data;
  }
  if (oldTaxesResult?.success && oldTaxesResult.data) {
    oldTaxesData = oldTaxesResult.data;
  }

  return {
    apartmentData,
    rateableResult,
    capitalResult,
    kycDetails,
    societyDetails,
    oldDetails,
    oldFloorTableData,
    oldTaxesData,
  };
}
