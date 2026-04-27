import { apiClient } from '@/services/api.service';
import { ApiError } from '@/lib/utils/api';
import type {
  ConstructionType,
  DepreciationRow,
  DepreciationPagedResponse,
} from '@/types/depreciation.types';
import { getConstruction } from './construction-crud.service';

/**
 * Fetch paginated depreciation records (for range-wise pagination)
 * @param pageNumber - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated depreciation response
 */
export async function getDepreciationPaged(
  pageNumber: number,
  pageSize: number
): Promise<DepreciationPagedResponse> {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await apiClient.get<DepreciationPagedResponse>(
    `/Depreciation?${params.toString()}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch depreciation records',
      'Get depreciation records failed'
    );
  }

  if (!response.data) {
    throw new ApiError(500, 'No data received from server', 'Invalid response format');
  }

  return response.data;
}

/**
 * Get construction types from construction-crud service
 */
export async function getConstructionTypes(): Promise<ConstructionType[]> {
  const constructionTypes = await getConstruction();
  return constructionTypes.map((ct) => ({
    constructionId: ct.constructionTypeId, 
    constructionCode: ct.constructionCode,
  }));
}

/**
 * Fetch all depreciation records (for bulk operations)
 * Handles API pagination by fetching all pages
 * @returns Array of all depreciation records
 */
export async function getDepreciationsAll(): Promise<DepreciationRow[]> {
  const allItems: DepreciationRow[] = [];
  let pageNumber = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await apiClient.get<DepreciationPagedResponse>(
      `/Depreciation?${params.toString()}`
    );

    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || 'Failed to fetch depreciation records',
        'Get depreciation records failed'
      );
    }

    if (!response.data) {
      throw new ApiError(500, 'No data received from server', 'Invalid response format');
    }

    const items = response.data.items || [];
    allItems.push(...items);

    hasMore = response.data.hasNext === true && items.length > 0;
    pageNumber++;

    if (pageNumber > 100) break;
  }

  return allItems;
}

export async function syncDepreciationRates(updates: Record<number, number>): Promise<void> {
  const allData = await getDepreciationsAll();

  const depreciations = Object.entries(updates)
    .map(([idStr, newRate]) => {
      const id = Number(idStr);
      const existing = allData.find((d) => d.id === id);

      if (!existing) {
        return null;
      }

      return {
        id: existing.id,
        minYear: existing.minYear,
        maxYear: existing.maxYear,
        constructionTypeId: existing.constructionTypeId,
        rate: newRate,
        yearRangeRVId: existing.yearRangeRVId,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (depreciations.length === 0) {
    return;
  }

  await bulkUpdateDepreciationRates({
    depreciations,
    updatedBy: 0,
  });
}

/**
 * Bulk create depreciation records
 */
export async function bulkCreateDepreciation(payload: {
  minYear: number;
  maxYear: number;
  rates: Array<{
    constructionTypeId: number;
    rate: number;
  }>;
  createdBy?: number;
}): Promise<void> {
  const bulkPayload = payload.rates.map((item) => ({
    isActive: true,
    createdBy: payload.createdBy || 0,
    constructionTypeId: item.constructionTypeId,
    minYear: payload.minYear,
    maxYear: payload.maxYear,
    rate: item.rate,
    yearRangeRVId: 1,
  }));

  const response = await apiClient.post<unknown>('/Depreciation/Bulk', bulkPayload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to create bulk depreciation records',
      'Bulk create failed'
    );
  }
}

/**
 * Add depreciation range for all construction types
 */
export async function addDepreciationRangeBulk(payload: {
  minYear: number;
  maxYear: number;
  defaultRate?: number;
}): Promise<void> {
  const constructionTypes = await getConstructionTypes();

  const rates = constructionTypes.map((type) => ({
    constructionTypeId: type.constructionId,
    rate: payload.defaultRate || 0,
  }));

  await bulkCreateDepreciation({
    minYear: payload.minYear,
    maxYear: payload.maxYear,
    rates: rates,
    createdBy: 0,
  });
}

/**
 * Delete depreciation range - uses purge for hard delete
 */
export async function deleteDepreciationRange(payload: {
  minYear: number;
  maxYear: number;
}): Promise<void> {
  const allData = await getDepreciationsAll();
  const targets = allData.filter(
    (x) => x.minYear === payload.minYear && x.maxYear === payload.maxYear
  );

  // Use purge for hard delete - delete one by one
  for (const target of targets) {
    await purgeDepreciation(target.id);
  }
}

/**
 * Bulk update depreciation rates
 */
export async function bulkUpdateDepreciationRates(payload: {
  depreciations: Array<{
    id: number;
    minYear: number;
    maxYear: number;
    constructionTypeId: number;
    rate: number;
    yearRangeRVId: number;
  }>;
  updatedBy?: number;
}): Promise<void> {
  // Build payload exactly as backend expects: [{id, data: {...}}]
  const bulkPayload = payload.depreciations.map((item) => ({
    id: item.id,
    data: {
      id: item.id,
      constructionTypeId: item.constructionTypeId,
      minYear: item.minYear,
      maxYear: item.maxYear,
      rate: item.rate,
      yearRangeRVId: item.yearRangeRVId,
      isActive: true,
      updatedBy: payload.updatedBy || 1,
    },
  }));

  const response = await apiClient.put<unknown>('/Depreciation/Bulk', bulkPayload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to bulk update depreciation rates',
      'Bulk update failed'
    );
  }
}

/**
 * Hard delete (purge) a single depreciation record
 */
export async function purgeDepreciation(id: number): Promise<void> {
  if (!id || id <= 0) {
    throw new ApiError(400, 'Valid depreciation ID is required', 'Validation failed');
  }

  const response = await apiClient.delete<void>(
    `/Depreciation/${encodeURIComponent(String(id))}/purge`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to purge depreciation record',
      `Purge depreciation ${id} failed`
    );
  }
}
