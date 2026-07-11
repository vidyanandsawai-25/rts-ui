'use server';

import { cookies } from 'next/headers';
import { toPositiveInt, toSafeString } from '@/lib/utils/format';
import {
  getWardListAction,
  getPropertyListByWardAction,
  fetchWardIdAction,
} from './actions';
import { toValidTab, getInitialData, buildWardOptions, InitialDataResult } from './ptis-data';
import { parsePtisSearchParams } from '@/lib/utils/params';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import { fetchPropertyDetailsConcurrently } from './ptis-fetch-concurrent';
import { mapPtisFetchResults } from './ptis-mapping.helper';
import { defaultPropertyDetails } from '@/lib/constants/ptis.constants';
import type { ActionResult } from '@/types/common.types';
import type { PropertyListItem } from '@/types/ptis.types';

export async function fetchPtisPageData(
  searchParams: Record<string, string | string[] | undefined>,
  locale: string
) {
  const cookieStore = await cookies();
  const initialMediaPanelVisible = cookieStore.get('ptis_media_panel_visible')?.value === 'true';

  const wardNo = toSafeString(searchParams?.wardNo);
  const propertyNo = toSafeString(searchParams?.propertyNo);
  const rawPartitionNo = toSafeString(searchParams?.partitionNo);
  const partitionNo = rawPartitionNo === '0' ? '' : rawPartitionNo;

  const activeTab = toValidTab(searchParams?.tab);
  const ptisParams = parsePtisSearchParams(searchParams);
  const valuationTab = ptisParams.tab;
  const wardIdParam = toPositiveInt(searchParams?.wardId);
  const propertyIdParam = toPositiveInt(searchParams?.propertyId);
  const showFloorParam = searchParams?.showFloor === 'true';
  const showOldTaxParam = searchParams?.showOldTax === 'true';
  const showDetailsParam = searchParams?.showDetails === 'true';

  const pageNumber = toPositiveInt(searchParams?.pageNumber) || 1;
  const pageSize = toPositiveInt(searchParams?.pageSize) || 10;
  const searchTerm = toSafeString(searchParams?.searchTerm);
  const sortBy = toSafeString(searchParams?.sortBy);
  const sortOrder = toSafeString(searchParams?.sortOrder);
  const appartmentTab = toSafeString(searchParams?.appartmentTab) || 'amenities';

  const filterWing = toSafeString(searchParams?.filterWing);
  const filterFlatOrShopNo = toSafeString(searchParams?.filterFlatOrShopNo);
  const filterApartmentType = toSafeString(searchParams?.filterApartmentType);
  const filterPropertyType = toSafeString(searchParams?.filterPropertyType);

  let criticalError: string | undefined = undefined;
  let resolvedWardId = wardIdParam;
  let resolvedPropertyId = propertyIdParam;

  // 1. Fetch ward list and initial ward ID in parallel
  const [wardListResult, initialWardIdResult] = await Promise.all([
    getWardListAction(),
    !wardIdParam && wardNo ? fetchWardIdAction(wardNo) : Promise.resolve(null),
  ]);

  if (!resolvedWardId && initialWardIdResult?.success && initialWardIdResult.data?.wardId) {
    resolvedWardId = initialWardIdResult.data.wardId;
  }

  const wardOptions = wardListResult.success && wardListResult.data ? buildWardOptions(wardListResult.data) : [];

  let propertyDetailsResult: InitialDataResult = {
    success: true,
    propertyDetails: defaultPropertyDetails,
  };
  let propertyListResult: ActionResult<PropertyListItem[]> | null = null;
  let detailResults: unknown[] = [];

  try {
    if (propertyIdParam && resolvedWardId) {
      // SCENARIO 1: Both propertyId and wardId are known. Fetch everything concurrently!
      const detailsPromise = fetchPropertyDetailsConcurrently(
        propertyIdParam, resolvedWardId, propertyNo, partitionNo, appartmentTab,
        pageNumber, pageSize, searchTerm, filterWing, filterFlatOrShopNo,
        filterApartmentType, filterPropertyType, sortBy, sortOrder, valuationTab,
        showDetailsParam, initialMediaPanelVisible
      );

      const [propDetailsRes, propListRes, detailsRes] = await Promise.all([
        getInitialData(wardNo, propertyNo, partitionNo, resolvedWardId, propertyIdParam),
        getPropertyListByWardAction(resolvedWardId),
        detailsPromise
      ]);

      propertyDetailsResult = propDetailsRes;
      propertyListResult = propListRes;
      detailResults = detailsRes;
    } else {
      // SCENARIO 2: One or both are missing. Resolve sequentially.
      const propDetailsRes = await getInitialData(wardNo, propertyNo, partitionNo, resolvedWardId, propertyIdParam);
      propertyDetailsResult = propDetailsRes;

      if (!resolvedWardId && propertyDetailsResult.success && propertyDetailsResult.wardId) {
        resolvedWardId = propertyDetailsResult.wardId;
      }

      resolvedPropertyId = propertyIdParam ?? propertyDetailsResult.propertyId;

      const propListPromise = resolvedWardId
        ? getPropertyListByWardAction(resolvedWardId)
        : Promise.resolve(null);

      const detailsPromise = resolvedPropertyId
        ? fetchPropertyDetailsConcurrently(
            resolvedPropertyId, resolvedWardId, propertyNo, partitionNo, appartmentTab,
            pageNumber, pageSize, searchTerm, filterWing, filterFlatOrShopNo,
            filterApartmentType, filterPropertyType, sortBy, sortOrder, valuationTab,
            showDetailsParam, initialMediaPanelVisible
          )
        : Promise.resolve(null);

      const [propListRes, detailsRes] = await Promise.all([
        propListPromise,
        detailsPromise
      ]);

      propertyListResult = propListRes;
      detailResults = detailsRes ? detailsRes : [];
    }
  } catch (err) {
    criticalError = getCleanErrorMessage(err, 'Failed to fetch property details.');
  }

  // 2. Delegate mapping and redirect checks to the mapping helper
  return mapPtisFetchResults({
    propertyDetailsResult,
    propertyListResult,
    detailResults,
    valuationTab,
    resolvedPropertyId,
    activeTab,
    criticalError,
    resolvedWardId,
    initialMediaPanelVisible,
    showFloorParam,
    showOldTaxParam,
    showDetailsParam,
    searchParams,
    locale,
    propertyIdParam,
    wardOptions,
  });
}
