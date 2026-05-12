"use server";

import { getZones, createZone, updateZone, deleteZone, getZoneById } from "@/lib/api/zone.services";
import { getWards, createWard, updateWard, deleteWard, getWardById, createWardBatch, createWardRange, bulkUpdateWards } from "@/lib/api/ward.services";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { ZoneItem, ZoneListResponse, CreateZonePayload, UpdateZonePayload } from "@/types/zoneMaster.types";
import { WardItem, WardListResponse, CreateWardPayload, UpdateWardPayload, BatchWardCreatePayload, BatchRangeWardCreatePayload, BulkWardUpdateItem } from "@/types/wardMaster.types";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { isBackendErrorMessage, getErrorStatusCode } from "@/lib/utils/backend-error-detection";
import { createLogger } from "@/lib/utils/server-logger";

  const logger = createLogger("property-tax/zone-master/actions");
/* ===================================================================================
   HELPER FUNCTIONS
   =================================================================================== */

async function getCurrentUserId(): Promise<number> {
  const cookieStore = await cookies();
  return getUserIdFromCookies(cookieStore) ?? 0;
}

/* ===================================================================================
   ZONE ACTIONS
   =================================================================================== */

/**
 * Fetches paginated zones with optional search.
 * Used by page.tsx for SSR data fetching.
 */
export async function fetchZonesPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<ZoneListResponse> {
  try {
    // Basic validation with upper bounds
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    
    if (
      !Number.isFinite(pageNumber) ||
      !Number.isFinite(pageSize) ||
      pageNumber <= 0 ||
      pageSize <= 0 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
    }

    const result = await getZones(pageNumber, pageSize, searchTerm);
    return result;
  } catch (error: unknown) {
    // Log the error for debugging using centralized logger
    if (error instanceof ApiError) {
      logger.error(`[fetchZonesPagedAction] API Error ${error.statusCode}`, {
        error,
        statusCode: error.statusCode,
        responseText: error.responseText,
        contextMessage: error.contextMessage,
      });
    } else if (error instanceof Error) {
      logger.error("[fetchZonesPagedAction] Error", {
        error,
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("[fetchZonesPagedAction] Unknown error", {
        error: error as Error,
      });
    }
    // Re-throw the error so Next.js error boundary can catch it
    throw error;
  }
}

export async function fetchZonesAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
) {
  return await getZones(pageNumber, pageSize, searchTerm);
}

export async function createZoneAction(data: Partial<ZoneItem>) {
  try {
    const userId = await getCurrentUserId();
    const payload: CreateZonePayload = {
      zoneNo: data.zoneNo ?? "",
      description: data.description ?? "",
      sequenceNo: typeof data.sequenceNo === "number" ? data.sequenceNo : undefined,
      isActive: data.isActive ?? true,
      createdBy: userId,
    };

    const apiResponse = await createZone(payload);

    if (apiResponse && apiResponse.success === false) {
      const firstError = Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to create zone";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: apiResponse.items };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create zone" };
  }
}

export async function updateZoneAction(id: number | string, data: Partial<ZoneItem>) {
  try {
    const userId = await getCurrentUserId();
    const payload: UpdateZonePayload = {
      zoneNo: data.zoneNo ?? "",
      description: data.description ?? "",
      sequenceNo: typeof data.sequenceNo === "number" ? data.sequenceNo : undefined,
      isActive: data.isActive ?? true,
      updatedBy: userId,
    };

    const apiResponse = await updateZone(id, payload);

    if (apiResponse && apiResponse.success === false) {
      const firstError = Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to update zone";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: apiResponse.items };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update zone" };
  }
}

export async function deleteZoneAction(id: number | string) {
  try {
    const apiResponse = await deleteZone(id);

    if (apiResponse && apiResponse.success === false) {
      const firstError = Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to delete zone";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: apiResponse };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete zone" };
  }
}

export async function getZoneTotalCountAction() {
    try {
        const res = await getZones(1, 1);
        return { success: true, data: res.totalCount };
    } catch (_) {
        return { success: false, data: 0 };
    }
}

export async function getZoneByIdAction(id: number | string) {
    try {
        const result = await getZoneById(id);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof ApiError) {
            const statusCode = isBackendErrorMessage(error.responseText) 
                ? getErrorStatusCode(error.responseText) 
                : error.statusCode;
            return {
                success: false,
                error: error.responseText,
                statusCode
            };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Failed to fetch zone" };
    }
}


/* ===================================================================================
   WARD ACTIONS
   =================================================================================== */

/**
 * Fetches paginated wards with optional search and zone filter.
 * Used by page.tsx for SSR data fetching.
 */
export async function fetchWardsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  zoneId?: number
): Promise<WardListResponse> {
  try {
    // Basic validation with upper bounds
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;

    if (
      !Number.isFinite(pageNumber) ||
      !Number.isFinite(pageSize) ||
      pageNumber <= 0 ||
      pageSize <= 0 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
    }

    const result = await getWards(pageNumber, pageSize, searchTerm, zoneId);
    return result;
  } catch (error: unknown) {
    // Log the error for debugging using centralized logger
    if (error instanceof ApiError) {
      logger.error(`[fetchWardsPagedAction] API Error ${error.statusCode}`, {
        error,
        statusCode: error.statusCode,
        responseText: error.responseText,
        contextMessage: error.contextMessage,
      });
    } else if (error instanceof Error) {
      logger.error("[fetchWardsPagedAction] Error", {
        error,
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("[fetchWardsPagedAction] Unknown error", {
        error: error as Error,
      });
    }

    // Re-throw the error so Next.js error boundary can catch it
    throw error;
  }
}

export async function getAllWardsAction({ page = 1, pageSize = 10, searchTerm = "" } = {}) {
  try {
    const result = await getWards(page, pageSize, searchTerm || undefined);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch wards." };
  }
}

export async function getWardsByZoneAction({ 
  id, 
  page = 1, 
  pageSize = 10, 
  searchTerm = "" 
}: { 
  id: number; 
  page?: number; 
  pageSize?: number; 
  searchTerm?: string; 
}) {
  try {
    const result = await getWards(page, pageSize, searchTerm || undefined, id);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch wards." };
  }
}

export async function getWardByIdAction(wardId: number | string) {
    try {
        const result = await getWardById(wardId);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof ApiError) {
            const statusCode = isBackendErrorMessage(error.responseText) 
                ? getErrorStatusCode(error.responseText) 
                : error.statusCode;
            return {
                success: false,
                error: error.responseText,
                statusCode
            };
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Failed to fetch ward" };
    }
}

export async function createWardAction(data: Partial<WardItem>) {
  try {
    const userId = await getCurrentUserId();
    const payload: CreateWardPayload = {
      wardNo: data.wardNo ?? "",
      zoneId: data.zoneId ?? 0,
      description: data.description ?? "",
      sequenceNo: typeof data.sequenceNo === "number" ? data.sequenceNo : undefined,
      isActive: data.isActive ?? true,
      createdBy: userId,
    };

    const apiResponse = await createWard(payload);

    if (apiResponse && apiResponse.success === false) {
      const firstError = Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to create ward";
      return { success: false, error: errorMessage };
    }

    // Revalidate all locale paths to ensure fresh data
    revalidatePath("/en/property-tax/zone-master", "page");
    revalidatePath("/hi/property-tax/zone-master", "page");
    revalidatePath("/mr/property-tax/zone-master", "page");
    revalidatePath("/[locale]/property-tax/zone-master", "page");
    
    return { success: true, data: apiResponse.items };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create ward" };
  }
}

export async function updateWardAction(wardId: number | string, data: Partial<WardItem>) {
  try {
    const userId = await getCurrentUserId();
    const payload: UpdateWardPayload = {
      wardNo: data.wardNo ?? "",
      zoneId: data.zoneId ?? 0,
      description: data.description ?? "",
      sequenceNo: typeof data.sequenceNo === "number" ? data.sequenceNo : undefined,
      isActive: data.isActive ?? true,
      updatedBy: userId,
    };

    const apiResponse = await updateWard(wardId, payload);

    if (apiResponse && apiResponse.success === false) {
      const firstError = Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to update ward";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: apiResponse.items };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update ward" };
  }
}

export async function bulkAssignWardsToZoneAction(zoneId: number, wardIds: number[]) {
  try {
    const userId = await getCurrentUserId();
    const uniqueWardIds = Array.from(new Set(wardIds.filter(id => id > 0)));

    if (uniqueWardIds.length === 0) {
      return { success: true, data: null };
    }

    // First, fetch the ward details to get their current data
    const results = await Promise.all(
      uniqueWardIds.map(async (wardId) => {
        try {
          const wardData = await getWardById(wardId);
          if (!wardData) {
            return { id: wardId, apiResponse: { success: false, message: "Ward not found", items: null, errors: null } };
          }
          const payload: UpdateWardPayload = {
            wardNo: wardData.wardNo,
            zoneId: zoneId,
            description: wardData.description ?? "",
            sequenceNo: wardData.sequenceNo ?? undefined,
            isActive: wardData.isActive,
            updatedBy: userId,
          };
          const apiResponse = await updateWard(wardId, payload);
          return { id: wardId, apiResponse };
        } catch (error) {
          return { id: wardId, apiResponse: { success: false, message: error instanceof Error ? error.message : "Failed to update ward", items: null, errors: null } };
        }
      })
    );

    const failed = results.find(r => r.apiResponse && r.apiResponse.success === false);

    if (failed && failed.apiResponse) {
      const firstError =
        Array.isArray(failed.apiResponse.errors)
          ? failed.apiResponse.errors[0]
          : failed.apiResponse.errors || "";
      const errorMessage =
        failed.apiResponse.message || firstError || "Failed to update ward";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update wards" };
  }
}

export async function deleteWardAction(wardId: number | string) {
  try {
    const apiResponse = await deleteWard(wardId);

    if (apiResponse && apiResponse.success === false) {
      const firstError =
        Array.isArray(apiResponse.errors) ? apiResponse.errors[0] : apiResponse.errors || "";
      const errorMessage = apiResponse.message || firstError || "Failed to delete ward";
      return { success: false, error: errorMessage };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");
    return { success: true, data: apiResponse };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete ward" };
  }
}

export async function getWardTotalCountAction() {
    try {
        const res = await getWards(1, 1);
        return { success: true, data: res.totalCount };
    } catch (_) {
        return { success: false, data: 0 };
    }
}

/**
 * Creates multiple wards in batch using a range.
 * Uses the /Ward/batch/range endpoint.
 * @param fromValue - Starting ward number (e.g., "DI15")
 * @param toValue - Ending ward number (e.g., "DI24")
 * @param id - Zone ID to assign the wards
 * @param isActive - Whether the wards should be active
 */
export async function createWardBatchAction(
  fromValue: string,
  toValue: string,
  zoneId: number,
  isActive: boolean = true
): Promise<{
  success: boolean;
  message?: string;
  count?: number;
  error?: string;
  statusCode?: number;
}> {
  try {
    const userId = await getCurrentUserId();
    const payload: BatchWardCreatePayload = {
      fromValue,
      toValue,
      rangePropertyName: "wardno,description",
      template: {
        isActive,
        createdBy: userId,
        wardNo: "null",
        zoneId,
        description: "",
      },
    };

    const apiResponse = await createWardBatch(payload);

    if (!apiResponse.success) {
      return {
        success: false,
        error: apiResponse.message || "Failed to create wards in batch",
      };
    }

    // Revalidate all locale paths to ensure fresh data
    revalidatePath("/en/property-tax/zone-master", "page");
    revalidatePath("/hi/property-tax/zone-master", "page");
    revalidatePath("/mr/property-tax/zone-master", "page");
    revalidatePath("/[locale]/property-tax/zone-master", "page");

    return {
      success: true,
      message: apiResponse.message || "Records created successfully",
      count: apiResponse.items?.successCount ?? 0,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create wards in batch" };
  }
}

/**
 * Creates multiple wards in batch using the new Range endpoint.
 * @param rangeFrom - Starting number string
 * @param rangeTo - Ending number string
 * @param prefix - Prefix string
 * @param suffix - Suffix string
 * @param zoneId - Zone ID
 * @param isActive - Active status
 */
export async function createWardRangeAction(
  rangeFrom: string,
  rangeTo: string,
  prefix: string,
  zoneId: number,
  isActive: boolean = true
): Promise<{
  success: boolean;
  message?: string;
  count?: number;
  error?: string;
  statusCode?: number;
}> {
  try {
    const userId = await getCurrentUserId();
    const payload: BatchRangeWardCreatePayload = {
      rangeFrom,
      rangeTo,
      prefix,
      suffix: "",
      startSequenceNo: 0,
      template: {
        isActive,
        createdBy: userId,
        wardNo: "string",
        zoneId,
        description: "",
      },
    };

    const apiResponse = await createWardRange(payload);

    if (!apiResponse.success) {
      return {
        success: false,
        error: apiResponse.message || "Failed to create wards in range",
      };
    }

    // Check if all wards were created successfully
    const allSucceeded = apiResponse.items?.allSucceeded ?? false;
    const successCount = apiResponse.items?.successCount ?? 0;
    const failedCount = apiResponse.items?.failedCount ?? 0;

    revalidatePath("/[locale]/property-tax/zone-master", "page");

    if (!allSucceeded && failedCount > 0) {
      return {
        success: false,
        message: `Partial success: ${successCount} created, ${failedCount} failed`,
        count: successCount,
        error: apiResponse.items?.errors ? (Array.isArray(apiResponse.items.errors) ? apiResponse.items.errors.join(", ") : apiResponse.items.errors) : "Some wards failed to create",
      };
    }

    return {
      success: true,
      message: apiResponse.message || "Records created successfully",
      count: successCount,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const statusCode = isBackendErrorMessage(error.responseText) 
        ? getErrorStatusCode(error.responseText) 
        : error.statusCode;
      return {
        success: false,
        error: error.responseText,
        statusCode
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create wards in range" };
  }
}

/* ===================================================================================
   SSR ACTIONS FOR LINK WARD DRAWER
   =================================================================================== */

/**
 * Fetches ALL wards with PageSize=-1 in a single API call.
 * Used for SSR pre-fetching in Link Ward drawer.
 * Uses apiClient which includes auth headers.
 */
export async function getAllWardsForLinkAction(searchTerm?: string): Promise<{
  success: boolean;
  data?: WardItem[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    params.set("PageSize", "-1");
    if (searchTerm) {
      params.set("SearchTerm", searchTerm);
    }
    const response = await apiClient.get<{ items?: WardItem[]; totalCount?: number }>(`/Ward?${params.toString()}`);

    if (!response.success || !response.data) {
      return { success: false, error: response.error || "Failed to fetch wards" };
    }

    const items = response.data.items || [];

    return {
      success: true,
      data: items,
      totalCount: response.data.totalCount || items.length
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.responseText
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch wards" };
  }
}

/**
 * Fetches wards with pagination and search for View All tab.
 * API: GET /api/Ward?PageNumber={page}&PageSize={size}&SearchTerm={term}
 */
export async function getWardsPagedWithSearchAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<{
  success: boolean;
  data?: WardItem[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    params.set("PageNumber", pageNumber.toString());
    params.set("PageSize", pageSize.toString());
    if (searchTerm) {
      params.set("SearchTerm", searchTerm);
    }

    const response = await apiClient.get<{ items?: WardItem[]; totalCount?: number, pageNumber?: number, pageSize?: number, totalPages?: number }>(`/Ward?${params.toString()}`);
    
    if (!response.success || !response.data) {
      return { success: false, error: response.error || "Failed to fetch wards" };
    }

    return {
      success: true,
      data: response.data.items || [],
      totalCount: response.data.totalCount || (response.data.items || []).length,
      pageNumber: response.data.pageNumber || pageNumber,
      pageSize: response.data.pageSize || pageSize,
      totalPages: response.data.totalPages || Math.ceil((response.data.totalCount || 0) / pageSize)
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.responseText };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch wards" };
  }
}

/**
 * Fetches ALL zones with PageSize=-1 in a single API call.
 * Used for SSR pre-fetching in Link Ward drawer (for zone labels).
 * Uses apiClient which includes auth headers.
 */
export async function getAllZonesForLinkAction(): Promise<{
  success: boolean;
  data?: ZoneItem[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const response = await apiClient.get<{ items?: ZoneItem[]; totalCount?: number }>(`/Zone?PageSize=-1`);

    if (!response.success || !response.data) {
      return { success: false, error: response.error || "Failed to fetch zones" };
    }

    const items = response.data.items || [];

    return {
      success: true,
      data: items,
      totalCount: response.data.totalCount || items.length
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.responseText
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch zones" };
  }
}

/**
 * Link wards to a zone using Ward/Bulk API.
 * Takes zoneId and wardNos, builds bulk update payload,
 * and calls PUT /Ward/Bulk endpoint.
 */
export async function linkWardsToZoneAction(
  zoneId: number,
  wardNos: string[]
): Promise<{
  success: boolean;
  data?: { successCount: number; failedCount: number };
  error?: string;
}> {
  try {
    if (!zoneId || wardNos.length === 0) {
      return { success: false, error: "Invalid parameters" };
    }

    const userId = await getCurrentUserId();
    
    // Fetch all wards to get their current data
    const wardsRes = await apiClient.get<{ items?: WardItem[] }>(`/Ward?PageSize=-1`);

    if (!wardsRes.success || !wardsRes.data) {
      return { success: false, error: "Failed to fetch wards" };
    }

    const allWards = wardsRes.data.items || [];

    // Build bulk update payload
    const bulkPayload: BulkWardUpdateItem[] = [];
    
    for (const wardNo of wardNos) {
      const ward = allWards.find((w: WardItem) => w.wardNo === wardNo);
      if (!ward?.id) continue;

      bulkPayload.push({
        id: ward.id,
        data: {
          isActive: ward.isActive,
          updatedBy: userId,
          wardNo: ward.wardNo,
          zoneId: zoneId,
          description: ward.description ?? "",
          sequenceNo: ward.sequenceNo,
        }
      });
    }

    if (bulkPayload.length === 0) {
      return { success: false, error: "No valid wards found to update" };
    }

    // Call bulk update API
    const result = await bulkUpdateWards(bulkPayload);

    if (!result.success) {
      return { success: false, error: result.message || "Failed to update wards" };
    }

    revalidatePath("/[locale]/property-tax/zone-master", "page");

    return {
      success: true,
      data: { 
        successCount: result.items?.successCount ?? 0, 
        failedCount: result.items?.failedCount ?? 0 
      }
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.responseText
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to link wards to zone" };
  }
}
