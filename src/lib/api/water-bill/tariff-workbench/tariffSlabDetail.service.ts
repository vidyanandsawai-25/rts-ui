import { getTranslations } from "next-intl/server";
import { apiClient } from "@/services/api.service";
import type { ApiResponse } from "@/types/common.types";
import type { TariffSlabData } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

const BASE_ENDPOINT = "/TariffSlabDetail";

export interface TariffSlabQueryParameters {
  id?: number;
  tariffId?: number;
  geographyUnitId?: number;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterLogic?: string;
}

export interface TariffSlabPagedResponse {
  items: TariffSlabData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface RawTariffSlabResponse {
  items?: TariffSlabData[];
  Items?: TariffSlabData[];
  data?: { items?: TariffSlabData[] };
  totalCount?: number;
  TotalCount?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Fetch paginated or all tariff slab details
 */
export async function getTariffSlabDetailsPaged(
  params?: TariffSlabQueryParameters
): Promise<ApiResponse<TariffSlabPagedResponse>> {
  try {
    const query = new URLSearchParams();
    if (params?.id) query.append("Id", params.id.toString());
    if (params?.tariffId) query.append("TariffId", params.tariffId.toString());
    if (params?.geographyUnitId) query.append("GeographyUnitId", params.geographyUnitId.toString());
    query.append("PageNumber", (params?.pageNumber ?? 1).toString());
    query.append("PageSize", (params?.pageSize ?? 2000).toString());
    if (params?.searchTerm?.trim()) query.append("SearchTerm", params.searchTerm.trim());
    if (params?.sortBy) query.append("SortBy", params.sortBy);
    if (params?.sortOrder) query.append("SortOrder", params.sortOrder);
    if (params?.filterLogic) query.append("FilterLogic", params.filterLogic);

    const url = `${BASE_ENDPOINT}?${query.toString()}`;
    const response = await apiClient.get<TariffSlabData[] | RawTariffSlabResponse>(url);

    if (response.success && response.data) {
      const rawData = response.data;
      const pageSize = params?.pageSize ?? 2000;
      const pageNumber = params?.pageNumber ?? 1;
      let items: TariffSlabData[] = [];
      let totalCount = 0;
      let totalPages = 1;

      if (Array.isArray(rawData)) {
        items = rawData;
        totalCount = items.length;
        totalPages = Math.ceil(totalCount / pageSize) || 1;
      } else {
        items = rawData.items || rawData.Items || rawData.data?.items || [];
        totalCount = rawData.totalCount ?? rawData.TotalCount ?? items.length;
        totalPages = rawData.totalPages ?? (Math.ceil(totalCount / pageSize) || 1);
      }

      return {
        success: true,
        data: {
          items,
          totalCount,
          pageNumber,
          pageSize,
          totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages,
        },
        statusCode: response.statusCode,
      };
    }

    return {
      success: false,
      error: response.error,
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchListFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Fetch a single tariff slab detail by ID
 */
export async function getTariffSlabDetailById(
  id: number
): Promise<ApiResponse<TariffSlabData>> {
  try {
    const t = await getTranslations("tariffWorkbench");
    const response = await apiClient.get<TariffSlabData>(`${BASE_ENDPOINT}/${id}`);
    if (response.success && response.data) {
      return response;
    }
    return {
      success: false,
      error: response.error || t("errors.fetchItemFailed"),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchItemFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Create a new tariff slab detail
 */
export async function createTariffSlabDetail(
  data: Partial<TariffSlabData>
): Promise<ApiResponse<TariffSlabData>> {
  try {
    const t = await getTranslations("tariffWorkbench");
    const response = await apiClient.post<TariffSlabData>(BASE_ENDPOINT, data);
    if (response.success && response.data) {
      return response;
    }
    return {
      success: false,
      error: response.error || t("errors.createFailed"),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.createFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Update an existing tariff slab detail
 */
export async function updateTariffSlabDetail(
  id: number,
  data: Partial<TariffSlabData>
): Promise<ApiResponse<TariffSlabData>> {
  try {
    const t = await getTranslations("tariffWorkbench");
    const response = await apiClient.put<TariffSlabData>(`${BASE_ENDPOINT}/${id}`, data);
    if (response.success && response.data) {
      return response;
    }
    return {
      success: false,
      error: response.error || t("errors.updateFailed"),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.updateFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Delete a tariff slab detail by ID
 */
export async function deleteTariffSlabDetail(
  id: number
): Promise<ApiResponse<boolean>> {
  try {
    const t = await getTranslations("tariffWorkbench");
    const response = await apiClient.delete<boolean>(`${BASE_ENDPOINT}/${id}`);
    if (response.success) {
      return { success: true, data: true, statusCode: response.statusCode };
    }
    return {
      success: false,
      error: response.error || t("errors.deleteFailed"),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.deleteFailed"),
      statusCode: 500,
    };
  }
}
