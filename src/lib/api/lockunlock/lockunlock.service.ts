import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import {
  LockedScreen,
  LockUnlockPropertyItem,
  LockUnlockPropertiesQueryParams,
  LockUnlockPropertiesResponse,
  BulkLockUnlockPayload
} from "@/types/loackunlock.types";

interface GetScreensResponse {
  items?: LockedScreen[];
  [key: string]: unknown;
}

interface WrappedPropertiesResponse {
  items?: Record<string, unknown> | LockUnlockPropertyItem[] | ArrayLike<unknown>;
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Fetches the list of all screen options that can be locked/unlocked.
 * GET /api/LockUnlock/screens
 */
export async function getLockUnlockScreens(): Promise<LockedScreen[]> {
  const response = await apiClient.get<LockedScreen[]>("/LockUnlock/screens");

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch screens",
      "Get screens failed"
    );
  }

  // Handle optional wrapped response format
  const data = response.data as unknown as GetScreensResponse;
  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }

  return response.data;
}

/**
 * Fetches paginated properties with lock status details.
 * GET /api/LockUnlock/properties
 */
export async function getLockUnlockProperties(
  params: LockUnlockPropertiesQueryParams
): Promise<LockUnlockPropertiesResponse> {
  const urlParams = new URLSearchParams();

  if (params.WardId !== undefined && params.WardId !== null) {
    urlParams.set("WardId", params.WardId.toString());
  }
  if (params.FromPropertyNo !== undefined && params.FromPropertyNo !== null) {
    urlParams.set("FromPropertyNo", params.FromPropertyNo);
  }
  if (params.ToPropertyNo !== undefined && params.ToPropertyNo !== null) {
    urlParams.set("ToPropertyNo", params.ToPropertyNo);
  }
  if (params.Search !== undefined && params.Search !== null) {
    urlParams.set("Search", params.Search);
  }
  if (params.PageNumber !== undefined && params.PageNumber !== null) {
    urlParams.set("PageNumber", params.PageNumber.toString());
  }
  if (params.PageSize !== undefined && params.PageSize !== null) {
    urlParams.set("PageSize", params.PageSize.toString());
  }
  if (params.SearchTerm !== undefined && params.SearchTerm !== null) {
    urlParams.set("SearchTerm", params.SearchTerm);
  }
  if (params.SortBy !== undefined && params.SortBy !== null) {
    urlParams.set("SortBy", params.SortBy);
  }
  if (params.SortOrder !== undefined && params.SortOrder !== null) {
    urlParams.set("SortOrder", params.SortOrder);
  }
  if (params.FilterLogic !== undefined && params.FilterLogic !== null) {
    urlParams.set("FilterLogic", params.FilterLogic.toString());
  }

  const response = await apiClient.get<LockUnlockPropertiesResponse>(
    `/LockUnlock/properties?${urlParams.toString()}`
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch properties",
      "Get properties failed"
    );
  }

  const data = response.data as unknown as WrappedPropertiesResponse;

  // Handle wrapped response format: {success, message, items: PagedResponse, ...}
  if (data.items && typeof data.items === "object" && !Array.isArray(data.items)) {
    const nestedResponse = data.items as unknown as LockUnlockPropertiesResponse;
    if (nestedResponse.items && Array.isArray(nestedResponse.items)) {
      return nestedResponse;
    }
  }

  // Handle standard PagedResponse format: {items: [], totalCount, ...}
  if (data.items && Array.isArray(data.items)) {
    return response.data;
  }

  return response.data;
}

/**
 * Submits bulk lock or unlock request for property IDs and screen IDs.
 * PUT /api/LockUnlock/bulk
 */
export async function bulkLockUnlockProperties(
  payload: BulkLockUnlockPayload
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    "/LockUnlock/bulk",
    payload
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.error || "Failed to perform bulk lock/unlock action"
    };
  }

  return response.data;
}