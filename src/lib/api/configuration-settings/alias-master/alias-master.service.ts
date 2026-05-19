import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { PagedResponse } from "@/types/common.types";
import {
  AutoTranslationConfig,
  MultilingualTranslation,
  MultilingualTranslationBulkResult,
  MultilingualTranslationBulkUpdateItem,
  SupportedLanguageCode,
} from "@/types/alias-master.types";
import {
  isMultilingualTranslationShape,
  normalizeMultilingualTranslation,
} from "./alias-master-types-guard";
import {
  validateBulkUpdateItems,
  validateLanguageFilter,
  validateResourceFilter,
} from "./alias-master-validation";

const ENDPOINT = "/MultilingualTranslation";

/** Fetch the distinct resource file names available. */
export async function getMultilingualResources(): Promise<string[]> {
  const response = await apiClient.get<unknown>(`${ENDPOINT}/GetResources`);
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch resources",
      "Get multilingual resources failed"
    );
  }
  const raw = response.data;
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown[] })?.items)
      ? ((raw as { items: unknown[] }).items)
      : [];
  return list
    .filter((v): v is string | number => typeof v === "string" || typeof v === "number")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

/** Fetch the server-side auto-translation config flag. */
export async function getAutoTranslationConfig(): Promise<AutoTranslationConfig> {
  const response = await apiClient.get<unknown>(`${ENDPOINT}/AutoTranslationConfig`);
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch auto-translation config",
      "Get auto-translation config failed"
    );
  }
  const raw = response.data;
  const flag =
    raw && typeof raw === "object" && "isEnabled" in raw
      ? (raw as { isEnabled: unknown }).isEnabled
      : raw;
  return { isEnabled: flag === true || flag === "true" };
}

/** Fetch paged multilingual translations, optionally filtered by resource + languages. */
export async function getMultilingualTranslationsPaged(
  pageNumber: number,
  pageSize: number,
  resource?: string,
  filterEmptyLanguages?: SupportedLanguageCode[],
  isAutoTranslate?: boolean
): Promise<PagedResponse<MultilingualTranslation>> {
  const params = new URLSearchParams();
  params.append("PageNumber", String(pageNumber));
  params.append("PageSize", String(pageSize));

  const safeResource = validateResourceFilter(resource);
  if (safeResource) {
    params.append("Resource", safeResource);
  }
  const safeLanguages = validateLanguageFilter(filterEmptyLanguages);
  for (const lang of safeLanguages) {
    params.append("FilterEmptyLanguages", lang);
  }
  if (isAutoTranslate) {
    params.append("IsAutoTranslate", "true");
  }

  const response = await apiClient.get<PagedResponse<MultilingualTranslation>>(
    `${ENDPOINT}?${params.toString()}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch translations",
      "Get multilingual translations failed"
    );
  }
  if (!response.data) {
    throw new ApiError(500, "No data received from server", "Invalid response format");
  }

  const items = response.data.items ?? [];
  const normalized = items
    .filter(isMultilingualTranslationShape)
    .map(normalizeMultilingualTranslation);

  return { ...response.data, items: normalized };
}

/** Bulk update multilingual translations. */
export async function bulkUpdateMultilingualTranslations(
  items: MultilingualTranslationBulkUpdateItem[]
): Promise<MultilingualTranslationBulkResult> {
  validateBulkUpdateItems(items);

  const payload = items.map((item) => ({
    id: item.id,
    data: {
      resource: item.data.resource,
      key: item.data.key,
      en_US: item.data.en_US,
      hi_IN: item.data.hi_IN,
      mr_IN: item.data.mr_IN,
      ...(item.data.updatedBy !== undefined ? { updatedBy: item.data.updatedBy } : {}),
    },
  }));

  const response = await apiClient.put<{
    success: boolean;
    message?: string;
    items?: MultilingualTranslationBulkResult;
  }>(`${ENDPOINT}/Bulk`, payload);

  if (!response.success || !response.data?.success) {
    const errorMsg = response.error || response.data?.message || "Bulk update failed";
    throw new ApiError(response.statusCode ?? 500, errorMsg, "Bulk update multilingual translations failed");
  }

  const result = response.data.items;
  return {
    successCount: Number(result?.successCount ?? items.length),
    failedCount: Number(result?.failedCount ?? 0),
    allSucceeded: Boolean(result?.allSucceeded ?? true),
  };
}
