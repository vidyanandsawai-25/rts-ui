import { apiClient } from "@/services/api.service";
import { getTranslations } from "next-intl/server";
import { ApiError, normalizePagedResponse } from "@/lib/utils/api";
import {
  LockedScreen,
  LockUnlockPropertyItem,
  LockUnlockPropertiesQueryParams,
  LockUnlockPropertiesResponse,
} from "@/types/lockunlock.types";

interface GetScreensResponse {
  items?: LockedScreen[];
  [key: string]: unknown;
}

/**
 * Fetches the list of all screen options that can be locked/unlocked.
 * GET /api/LockUnlock/screens
 */
export async function getLockUnlockScreens(): Promise<LockedScreen[]> {
  const response = await apiClient.get<LockedScreen[]>("/LockUnlock/screens");

  if (!response.success || !response.data) {
    const t = await getTranslations("lockUnlock");
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || t("messages.fetchScreensFailed"),
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
  const urlParams = new URLSearchParams({
    PageNumber: params.PageNumber?.toString() ?? "1",
    PageSize: params.PageSize?.toString() ?? "10",
  });

  if (params.WardId) urlParams.append("WardId", params.WardId.toString());
  if (params.FromPropertyNo?.trim()) urlParams.append("FromPropertyNo", params.FromPropertyNo.trim());
  if (params.ToPropertyNo?.trim()) urlParams.append("ToPropertyNo", params.ToPropertyNo.trim());
  if (params.Search?.trim()) urlParams.append("Search", params.Search.trim());
  if (params.SearchTerm?.trim()) urlParams.append("SearchTerm", params.SearchTerm.trim());
  if (params.SortBy?.trim()) urlParams.append("SortBy", params.SortBy.trim());
  if (params.SortOrder?.trim()) urlParams.append("SortOrder", params.SortOrder.trim());
  if (params.FilterLogic !== undefined && params.FilterLogic !== null) {
    urlParams.append("FilterLogic", params.FilterLogic.toString());
  }

  const response = await apiClient.get<LockUnlockPropertiesResponse>(
    `/LockUnlock/properties?${urlParams.toString()}`
  );

  if (!response.success || !response.data) {
    const t = await getTranslations("lockUnlock");
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || t("messages.fetchPropertiesFailed"),
      "Get properties failed"
    );
  }

  return normalizePagedResponse<LockUnlockPropertyItem>(response.data);
}
