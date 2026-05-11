import { IRateMaster, IZoneDescription, RateCategory, IBackendRateMaster } from "@/types/RVRateMaster";
import { PagedResponse } from "@/types/RVRateMaster";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { getTranslations } from 'next-intl/server';
import {
  buildRateQueryParams,
  extractValue,
  transformBackendRatesToMatrix,
  filterByRateSection,
  filterByTaxZoneIds
} from './rvRateMaster.helpers';

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
    const params = buildRateQueryParams(pageNumber, pageSize, { rateSection, useGroup, assessmentYear });

    const response = await apiClient.get(`/Rate/detailed?${params.toString()}`);
    if (!response.success) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || t('rvRateMasterErrors.fetchDetailedRatesFailed'),
        'Get detailed rates failed'
      );
    }
    if (!response.data) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        500,
        t('rvRateMasterErrors.noDataReceived'),
        'Invalid response format'
      );
    }
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('ptis_RVRateMaster');
    throw new ApiError(
      500,
      error instanceof Error ? error.message : t('rvRateMasterErrors.unknownError'),
      'Get detailed rates failed'
    );
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
    const params = buildRateQueryParams(1, -1, { 
      rateSection: zoneSection, 
      useGroup, 
      assessmentYear 
    });

    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?${params.toString()}`);
    if (!response.success) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || t('rvRateMasterErrors.fetchRateDataByFiltersFailed'),
        'Get rate data by filters failed'
      );
    }
    if (!response.data) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        500,
        t('rvRateMasterErrors.noDataReceived'),
        'Invalid response format'
      );
    }

    return response.data.items || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('ptis_RVRateMaster');
    throw new ApiError(
      500,
      error instanceof Error ? error.message : t('rvRateMasterErrors.unknownError'),
      'Get rate data by filters failed'
    );
  }
}

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
    const rateSectionStr = extractValue(rateSection);
    const useGroupStr = extractValue(useGroup);
    const assessmentYearStr = extractValue(assessmentYear);

    const params = buildRateQueryParams(pageNumber, pageSize, {
      rateSection: rateSectionStr,
      useGroup: useGroupStr,
      assessmentYear: assessmentYearStr,
      taxZoneIds
    });

    const response = await apiClient.get<PagedResponse<IBackendRateMaster>>(`/Rate?${params.toString()}`);
    if (!response.success) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || t('rvRateMasterErrors.fetchPagedRateDataFailed'),
        'Get paged rate data failed'
      );
    }
    if (!response.data) {
      const t = await getTranslations('ptis_RVRateMaster');
      throw new ApiError(
        500,
        t('rvRateMasterErrors.noDataReceived'),
        'Invalid response format'
      );
    }

    const data = response.data;
    const backendData: IBackendRateMaster[] = data.items || [];

    let transformedData = transformBackendRatesToMatrix(backendData, constructionTypes, zoneDescriptions);
    transformedData = filterByTaxZoneIds(transformedData, taxZoneIds, zoneDescriptions);
    transformedData = filterByRateSection(transformedData, rateSectionStr);

    return {
      items: transformedData,
      totalCount: data.totalCount || 0,
      pageNumber: data.pageNumber || pageNumber,
      pageSize: data.pageSize || pageSize,
      totalPages: data.totalPages || 0,
      hasPrevious: data.hasPrevious || false,
      hasNext: data.hasNext || false,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('ptis_RVRateMaster');
    throw new ApiError(
      500,
      error instanceof Error ? error.message : t('rvRateMasterErrors.unknownError'),
      'Get paged rate data failed'
    );
  }
}
