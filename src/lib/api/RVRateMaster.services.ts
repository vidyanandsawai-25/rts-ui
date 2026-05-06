import { IRateMaster, IZoneDescription, RateCategory, IBackendRateMaster, IRateCreate } from "@/types/RVRateMaster";
import { PagedResponse } from "@/types/RVRateMaster";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";

// Re-export ApiError to maintain compatibility
export { ApiError };

/**
 * Bulk update rate master records (PUT /Rate/Bulk)
 * Accepts array of { id, data } objects as required by backend
 */
export async function bulkUpdateRateMaster(payload: Array<{ id: number, data: Record<string, unknown> }>): Promise<void> {
  try {
    const response = await apiClient.put<{ data?: unknown }>(`/Rate/Bulk`, payload);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to bulk update rate master', 'Bulk update rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Bulk update rate master failed');
  }
}

/**
 * Fetch detailed rates from backend using /Rate/detailed endpoint
 * All params are optional except pageNumber and pageSize (default -1 for all)
 */
export async function getDetailedRates(
  rateSection?: string,
  useGroup?: string,
  assessmentYear?: string,
  pageNumber: number = 1,
  pageSize: number = -1
): Promise<unknown> {
  try {
    const params = new URLSearchParams();
    params.append('PageNumber', pageNumber.toString());
    params.append('PageSize', pageSize.toString());

    if (rateSection && rateSection !== "ALL" && !isNaN(Number(rateSection))) {
      params.append('RateSectionId', rateSection);
    }
    if (useGroup && useGroup !== "ALL" && !isNaN(Number(useGroup))) {
      params.append('TypeOfUseGroupId', useGroup);
    }
    if (assessmentYear && assessmentYear !== "ALL" && !isNaN(Number(assessmentYear))) {
      params.append('YearRangeRVId', assessmentYear);
    }

    const response = await apiClient.get(`/Rate/detailed?${params.toString()}`);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to fetch detailed rates', 'Get detailed rates failed');
    }
    if (!response.data) {
      throw new ApiError(500, 'No data received from server', 'Invalid response format');
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Get detailed rates failed');
  }
}

/**
 * Bulk create rate master records (POST /Rate/Bulk)
 * Backend expects an array of rate objects directly
 */
export async function bulkCreateRateMaster(payload: IRateCreate[]): Promise<void> {
  try {
    const response = await apiClient.post<{ data?: unknown }>(`/Rate/Bulk`, payload);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to bulk create rate master', 'Bulk create rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Bulk create rate master failed');
  }
}
/* ========== GET REQUESTS (Data Fetching) ========== */
/**
 * Fetch paged rate master data for the main list
 * @param taxZoneIds - Optional array of taxZoneIds to filter by (for server-side zone pagination)
 */
export async function getRateMasterPaged(
  pageNumber: number,
  pageSize: number,
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[],
  rateSection?: string | { value: string },
  useGroup?: string | { value: string },
  assessmentYear?: string | { value: string },
  taxZoneIds?: number[]
): Promise<PagedResponse<IRateMaster>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    function getValue(val?: string | { value: string }): string {
      if (!val) return '';
      if (typeof val === 'object' && val && 'value' in val) return val.value || '';
      return typeof val === 'string' ? val : '';
    }

    const rateSectionStr = getValue(rateSection);
    const useGroupStr = getValue(useGroup);
    const assessmentYearStr = getValue(assessmentYear);

    if (rateSectionStr && rateSectionStr !== "ALL" && rateSectionStr !== "undefined" && rateSectionStr.trim() !== "" && !isNaN(Number(rateSectionStr))) {
      params.append('RateSectionId', rateSectionStr);
    }
    if (useGroupStr && useGroupStr !== "ALL" && useGroupStr !== "undefined" && useGroupStr.trim() !== "" && !isNaN(Number(useGroupStr))) {
      params.append('TypeOfUseGroupId', useGroupStr);
    }
    if (assessmentYearStr && assessmentYearStr !== "ALL" && assessmentYearStr !== "undefined" && assessmentYearStr.trim() !== "" && !isNaN(Number(assessmentYearStr))) {
      params.append('YearRangeRVId', assessmentYearStr);
    }

    // Add TaxZoneIds filter if provided (for server-side zone pagination)
    // Backend may support comma-separated TaxZoneIds or multiple params
    if (taxZoneIds && taxZoneIds.length > 0) {
      params.append('TaxZoneIds', taxZoneIds.join(','));
    }

    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?${params.toString()}`);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to fetch paged rate data', 'Get paged rate data failed');
    }
    if (!response.data) {
      throw new ApiError(500, 'No data received from server', 'Invalid response format');
    }

  const data = response.data;
  const backendData: IBackendRateMaster[] = data.items || [];
  const taxZoneIdToNo = new Map(zoneDescriptions.map(z => [z.taxZoneId, String(z.zoneNo).trim()]));
  const groupedData = new Map<string, IRateMaster>();


  backendData.forEach((item) => {
    try {
      // Read camelCase fields
      const taxZoneId = item.taxZoneId;
      const taxZoneNo = String(taxZoneIdToNo.get(taxZoneId) || item.taxZoneNo || taxZoneId).trim();
      const typeOfUseGroupId = String(item.typeOfUseGroupId);
      const rateSectionId = item.rateSectionId;
      const rateSectionNo = item.rateSectionNo || String(rateSectionId);
      const yearRangeRVId = item.yearRangeRVId ?? item.yearRangeId;
      
      // Simplified grouping key: only by taxZoneNo since filters are applied on backend
      // This ensures one row per tax zone in the matrix grid
      const key = taxZoneNo;

      if (!groupedData.has(key)) {
        const initialRates = constructionTypes.map(ct => ({
          rateCategory: ct.constructionCode || ct.constructionId,
          ratePerSqMtr: null
        }));

        groupedData.set(key, {
          id: String(item.id),
          rateSection: rateSectionNo,
          zoneNo: taxZoneNo,
          useGroup: typeOfUseGroupId,
          assessmentYear: `${yearRangeRVId}`,
          rates: initialRates,
        });
      }

      const group = groupedData.get(key);
      if (group) {
        const constructionTypeId = Number(item.constructionTypeId);
        const construction = constructionTypes.find(ct => Number(ct.constructionId) === constructionTypeId);

        if (construction) {
          const constructionCode = construction.constructionCode || construction.constructionId;
          const rateIndex = group.rates.findIndex(r => r.rateCategory === constructionCode);

          if (rateIndex !== -1) {
            // If rate already exists, keep the non-zero value (prefer filled data over nulls)
            const existingRate = group.rates[rateIndex].ratePerSqMtr;
            const newRate = item.rateSquareMeter;
            group.rates[rateIndex].ratePerSqMtr = existingRate && existingRate !== 0 ? existingRate : newRate;
            group.rates[rateIndex].id = item.id;
          }
        }
      }
    } catch {
      // Skip invalid rate items
    }
  });

  let transformedData = Array.from(groupedData.values());

  // Client-side filter by taxZoneIds (fallback if backend doesn't support TaxZoneIds param)
  if (taxZoneIds && taxZoneIds.length > 0) {
    const zoneNoSet = new Set(taxZoneIds.map(id => {
      const zoneNo = zoneDescriptions.find(z => z.taxZoneId === id)?.zoneNo;
      return zoneNo || String(id);
    }));
    transformedData = transformedData.filter(row => 
      zoneNoSet.has(row.zoneNo) || zoneNoSet.has(row.zoneSection || '')
    );
  }

  if (rateSectionStr && rateSectionStr !== "ALL" && rateSectionStr !== "undefined") {
    // If both are numeric, compare as numbers; otherwise, compare as strings
    const firstSection = transformedData[0]?.rateSection;
    if (!isNaN(Number(rateSectionStr)) && rateSectionStr.trim() !== "" && !isNaN(Number(firstSection))) {
      const selectedRateSectionId = Number(rateSectionStr);
      transformedData = transformedData.filter(row => Number(row.rateSection) === selectedRateSectionId);
    } else {
      transformedData = transformedData.filter(row => String(row.rateSection) === String(rateSectionStr));
    }
  }

  return {
    items: transformedData,
    totalCount: data.totalCount || 0,
    pageNumber: data.pageNumber || pageNumber,
    pageSize: data.pageSize || pageSize,
    totalPages: data.totalPages || 0,
    hasPrevious: data.hasPrevious || false,
    hasNext: data.hasNext || false,
  };  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Get paged rate data failed');
  }}

/**
 * Get all rate master data from backend (unpaged)
 */
export async function getRateMasterTableData(
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[]
): Promise<IRateMaster[]> {
  try {
    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?PageSize=-1`);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to fetch rate master data', 'Get rate master data failed');
    }
    if (!response.data) {
      throw new ApiError(500, 'No data received from server', 'Invalid response format');
    }

    const data = response.data;
    const backendData: IBackendRateMaster[] = data.items || [];
    const taxZoneIdToNo = new Map(zoneDescriptions.map(z => [z.taxZoneId, z.zoneNo]));
    const groupedData = new Map<string, IRateMaster>();

    backendData.forEach(item => {
      try {
        const taxZoneNo = taxZoneIdToNo.get(item.taxZoneId) || item.taxZoneNo || String(item.taxZoneId);
        const typeOfUseGroupId = String(item.typeOfUseGroupId);
        const rateSectionNo = item.rateSectionNo || String(item.rateSectionId);
        const yearRangeRVId = String(item.yearRangeRVId || item.yearRangeId);
        const key = `${taxZoneNo}-${typeOfUseGroupId}-${rateSectionNo}-${yearRangeRVId}-${item.year}`;

        if (!groupedData.has(key)) {
          groupedData.set(key, {
            id: String(item.id),
            rateSection: rateSectionNo,
            zoneNo: taxZoneNo,
            assessmentYear: yearRangeRVId,
            useGroup: typeOfUseGroupId,
            rates: constructionTypes.map(ct => ({
              rateCategory: ct.constructionCode || ct.constructionId,
              ratePerSqMtr: null
            }))
          });
        }

        const rateMaster = groupedData.get(key)!;
        const constructionTypeId = Number(item.constructionTypeId);
        const construction = constructionTypes.find(ct => Number(ct.constructionId) === constructionTypeId);
        
        if (construction) {
          const constructionCode = construction.constructionCode || construction.constructionId;
          const rateIndex = rateMaster.rates.findIndex(r => r.rateCategory === constructionCode);
          if (rateIndex !== -1) {
            rateMaster.rates[rateIndex].ratePerSqMtr = item.rateSquareMeter;
            rateMaster.rates[rateIndex].id = item.id;
          }
        }
      } catch {
        // Skip invalid rate items
      }
    });

    return Array.from(groupedData.values());
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Get rate master data failed');
  }
}

/**
 * Get rate master table columns configuration
 */
export async function getRateMasterColumns(constructionTypes: RateCategory[]) {
  return [
    { id: "zoneNo", label: "Zone No" },
    { id: "zoneDescription", label: "Zone Description" },
    ...constructionTypes.map(type => ({
      id: (type.constructionCode || type.constructionId).toLowerCase(),
      label: `${type.constructionCode || type.constructionId} (₹/Sq.mtr)`,
      title: type.description
    }))
  ];
}

/**
 * Get rate master record by ID
 */
export async function getRateMasterById(
  id: string,
  constructionTypes: RateCategory[],
  zoneDescriptions: IZoneDescription[]
): Promise<IRateMaster | null> {
  try {
    const allData = await getRateMasterTableData(constructionTypes, zoneDescriptions);
    return allData.find((item) => item.id === id) || null;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', `Get rate master ${id} failed`);
  }
}

/**
 * Get rate master records by filters
 */
export async function getRateMasterByFilters(
  zoneSection: string,
  useGroup: string,
  assessmentYear: string
): Promise<IBackendRateMaster[]> {
  try {
    const params = new URLSearchParams({
      PageNumber: '1',
      PageSize: '-1', // fetch all records, no cap
    });

    if (zoneSection && zoneSection !== "ALL" && zoneSection !== "undefined" && !isNaN(Number(zoneSection))) {
      params.append('RateSectionId', zoneSection);
    }
    if (useGroup && useGroup !== "ALL" && useGroup !== "undefined" && !isNaN(Number(useGroup))) {
      params.append('TypeOfUseGroupId', useGroup);
    }
    if (assessmentYear && assessmentYear !== "ALL" && assessmentYear !== "undefined" && !isNaN(Number(assessmentYear))) {
      params.append('YearRangeRVId', assessmentYear);
    }

    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?${params.toString()}`);
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to fetch rate data by filters', 'Get rate data by filters failed');
    }
    if (!response.data) {
      throw new ApiError(500, 'No data received from server', 'Invalid response format');
    }

    const data = response.data;
    return data.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Get rate data by filters failed');
  }
}

/* ========== POST/PUT/DELETE REQUESTS (Mutations) ========== */
/**
 * Bulk purge rate master records (DELETE /Rate/Bulk/purge)
 */
export async function bulkPurgeRateMaster(ids: number[]): Promise<void> {  
  try {
    // Pass body through options parameter (RequestInit includes body property)
    const response = await apiClient.delete<unknown>(`/Rate/Bulk/purge`, {
      body: JSON.stringify(ids),
    });
     
    if (!response.success) {
      throw new ApiError(response.statusCode ?? 500, response.error || 'Failed to bulk purge rate master', 'Bulk purge rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error', 'Bulk purge rate master failed');
  }
}