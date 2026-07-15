import "server-only";

import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { createLogger } from "@/lib/utils/server-logger";
import {
  InitOperationsResponse,
  ScopeOptionsResponse,
  SearchPropertiesResponse,
  EligibleCountPayload,
  EligibleCountResponse,
  ExecuteOperationPayload,
  ExecuteOperationResponse,
  JobPropertyItem,
  OperationPreviewPayload,
  OperationPreviewResponse,
  ImportTemplateResponse,
} from "@/types/addTaxes.types";
import {
  isSearchPropertyItemShape,
  normalizeSearchPropertyItem,
  isEligibleCountResponseShape,
  normalizeEligibleCountResponse,
} from "./add-taxes-types-guard";

const logger = createLogger("AddTaxesService");

/**
 * Initialize property tax operations.
 * API: GET /api/property-tax/operations/init
 */
export async function initOperations(): Promise<InitOperationsResponse> {
  try {
    const response = await apiClient.get<InitOperationsResponse>("/property-tax/operations/init");
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to initialize operations",
        "Init operations failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    return response.data;
  } catch (error) {
    logger.error("Error initializing operations", undefined, error);
    throw error;
  }
}

/**
 * Fetch scope options.
 * API: GET /api/Property/search/scope-options
 */
export async function getScopeOptions(): Promise<ScopeOptionsResponse> {
  try {
    const response = await apiClient.get<ScopeOptionsResponse>("/Property/search/scope-options");
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch scope options",
        "Get scope options failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    return response.data;
  } catch (error) {
    logger.error("Error fetching scope options", undefined, error);
    throw error;
  }
}

/**
 * Search properties by zone and ward.
 * API: GET /api/Property/search
 */
export async function searchProperties(
  zoneId: string | number | null,
  wardId: string | number
): Promise<SearchPropertiesResponse> {
  try {
    const queryParams = new URLSearchParams();
    const zoneStr = zoneId !== null && zoneId !== undefined ? String(zoneId).trim() : "";
    const wardStr = wardId !== null && wardId !== undefined ? String(wardId).trim() : "";

    if (zoneStr) queryParams.append("ZoneId", zoneStr);
    if (wardStr) queryParams.append("WardId", wardStr);
    queryParams.append("PageSize", "-1");

    const response = await apiClient.get<SearchPropertiesResponse>(
      `/Property/search?${queryParams.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to search properties",
        "Search properties failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }

    // Normalize the nested items using type guards
    const rawItems: unknown[] = response.data.items?.items ?? [];
    const normalizedItems = rawItems
      .filter(isSearchPropertyItemShape)
      .map(normalizeSearchPropertyItem);

    return {
      ...response.data,
      items: {
        ...response.data.items,
        items: normalizedItems,
      },
    };
  } catch (error) {
    logger.error("Error searching properties", undefined, error);
    throw error;
  }
}

/**
 * Get eligible properties count.
 * API: POST /api/property-tax/operations/eligible-count
 */
export async function getEligibleCount(
  payload: EligibleCountPayload
): Promise<EligibleCountResponse> {
  try {
    const response = await apiClient.post<EligibleCountResponse>(
      "/property-tax/operations/eligible-count",
      payload
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to get eligible count",
        "Eligible count failed"
      );
    }

    if (!response.data) {
      return { eligible: 0, total: 0, skipped: 0 };
    }

    // Validate response shape before returning
    if (isEligibleCountResponseShape(response.data)) {
      return normalizeEligibleCountResponse(response.data as Record<string, unknown>);
    }

    return { eligible: 0, total: 0, skipped: 0 };
  } catch (error) {
    logger.error("Error getting eligible count", undefined, error);
    throw error;
  }
}

/**
 * Execute property tax operations.
 * API: POST /property-tax/operations/execute
 */
export async function executeOperation(
  payload: ExecuteOperationPayload
): Promise<ExecuteOperationResponse> {
  try {
    const response = await apiClient.post<ExecuteOperationResponse>(
      "/property-tax/operations/execute",
      payload
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to execute operation",
        "Execute operation failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    return response.data;
  } catch (error) {
    logger.error("Error executing operation", undefined, error);
    throw error;
  }
}

/**
 * Get job processed properties list.
 * API: GET /property-tax/operations/jobs/{jobId}/properties
 */
export async function getJobProperties(
  jobId: string
): Promise<JobPropertyItem[]> {
  try {
    const response = await apiClient.get<{ items: JobPropertyItem[] }>(
      `/property-tax/operations/jobs/${jobId}/properties?PageSize=-1`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch job properties",
        "Get job properties failed"
      );
    }
    return response.data?.items || [];
  } catch (error) {
    logger.error("Error fetching job properties", undefined, error);
    throw error;
  }
}

/**
 * Preview property tax operations.
 * API: POST /api/property-tax/operations/preview
 */
export async function previewOperation(
  payload: OperationPreviewPayload
): Promise<OperationPreviewResponse> {
  try {
    const response = await apiClient.post<OperationPreviewResponse>(
      "/property-tax/operations/preview",
      payload
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to preview operation",
        "Preview operation failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    return response.data;
  } catch (error) {
    logger.error("Error previewing operation", undefined, error);
    throw error;
  }
}

/**
 * Fetch audit list.
 * API: GET /property-tax/operations/audit
 */
export async function getAuditList(
  queryParams: Record<string, string | number | undefined>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Audit list payload format is dynamic and handled generically
): Promise<any> {
  try {
    const params = new URLSearchParams();
    for (const key in queryParams) {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        params.append(key, String(queryParams[key]));
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API returns dynamic list data
    const response = await apiClient.get<any>(
      `/property-tax/operations/audit?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch audit list",
        "Get audit list failed"
      );
    }
    return response.data;
  } catch (error) {
    logger.error("Error fetching audit list", undefined, error);
    throw error;
  }
}

/**
 * Fetch audit job detail.
 * API: GET /property-tax/operations/audit/{jobId}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Audit details are dynamically typed per operation
export async function getAuditDetail(jobId: string): Promise<any> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API returns dynamic detail data
    const response = await apiClient.get<any>(
      `/property-tax/operations/audit/${jobId}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch audit detail",
        "Get audit detail failed"
      );
    }
    return response.data;
  } catch (error) {
    logger.error("Error fetching audit detail", undefined, error);
    throw error;
  }
}

/**
 * Fetch Excel import template columns and metadata.
 * API: GET /property-tax/operations/import-template
 */
export async function getImportTemplate(): Promise<ImportTemplateResponse> {
  try {
    const response = await apiClient.get<ImportTemplateResponse>("/property-tax/operations/import-template");
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch import template",
        "Get import template failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    return response.data;
  } catch (error) {
    logger.error("Error fetching import template", undefined, error);
    throw error;
  }
}
