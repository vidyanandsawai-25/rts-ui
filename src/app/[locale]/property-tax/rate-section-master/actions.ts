"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getRateSectionTotalCount,
  queryRateSections,
  getRateSectionById,
  createRateSection,
  updateRateSection,
} from "@/lib/api/rateSection.services";
import {
  getAllRateSectionDetails,
  createRateSectionDetailsBatch,
  getWardTotalCount,
  getWardPagedServer,
} from "@/lib/api/rateSectionDetails.services";
import { getWards, getWardById } from "@/lib/api/ward.services";
import {
  ActionResponse,
  SectionItem,
  RateItem,
  ActionResult,
  RateSectionDetailPayload,
} from "@/types/rateSectionMaster.types";
import type { WardItem } from "@/types/wardMaster.types";
import { apiClient } from "@/services/api.service";


/* ------------------------------------------------------------------ */
/* READ: ALL rate sectionS (MASTER + DETAILS) */
/* ------------------------------------------------------------------ */

/**
 * Fetches all rate sections from backend API
 * Source: GET /api/RateSection
 */
export async function getRateSectionsAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
) {
  try {
    const data = await queryRateSections({
      pageNumber: pageNumber,
      pageSize: pageSize,
      searchTerm: searchTerm || undefined
    });
    return {
      items: data.rateSectionMaster || [],
      totalCount: data.totalCount || 0,
      pageNumber: data.pageNumber || pageNumber,
      pageSize: data.pageSize || pageSize,
      totalPages: data.totalPages || 0
    };
  } catch (error) {
    throw error;
  }
}

export async function getRateSectionTotalCountAction(): Promise<
  ActionResponse<number>
> {
  try {
    const totalCount = await getRateSectionTotalCount();
    return { success: true, data: totalCount };
  } catch (error) {
    throw error;
  }
}

export async function getWardsByRateAction(
  rateSectionId: number,
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<{ success: boolean; data: unknown[]; totalCount: number; error?: string }> {
  try {
    if (!Number.isFinite(rateSectionId) || rateSectionId <= 0) {
      return { success: false, data: [], totalCount: 0, error: "Valid Rate Section ID is required" };
    }

    const params = new URLSearchParams({
      RateSectionId: rateSectionId.toString(),
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString()
    });
    if (searchTerm?.trim()) {
      params.append("SearchTerm", searchTerm.trim());
    }

    const response = await apiClient.get<{ items?: unknown[]; totalCount?: number }>(`/RateSectionDetails?${params.toString()}`);
    
    if (!response.success || !response.data) {
      return { success: false, data: [], totalCount: 0, error: response.error || "Failed to fetch wards" };
    }

    return {
      success: true,
      data: response.data.items ?? [],
      totalCount: response.data.totalCount ?? 0
    };
  } catch (error) {
    throw error;
  }
}


export async function getRateSectionByNoAction(
  rateSectionNo: string
): Promise<RateItem | null> {
  try {
    if (!rateSectionNo?.trim()) {
      return null;
    }

    const response = await apiClient.get<RateItem>(`/RateSection/GetByNo/${encodeURIComponent(rateSectionNo.trim())}`);
    
    if (!response.success || !response.data) return null;

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches a single rate section by its numeric ID.
 * Used for SSR in Edit Rate Section page.
 * @param rateSectionId - The numeric rate section ID
 */
export async function getRateSectionByIdAction(
  rateSectionId: number
): Promise<{ success: boolean; data?: RateItem; error?: string; statusCode?: number }> {
  try {
    if (!Number.isFinite(rateSectionId) || rateSectionId <= 0) {
      return { success: false, error: "Valid Rate Section ID is required", statusCode: 400 };
    }

    const data = await getRateSectionById(String(rateSectionId));
    
    if (!data) {
      return { success: false, error: "Rate section not found", statusCode: 404 };
    }

    return { success: true, data };
  } catch (error) {
    throw error;
  }
}
/**
 * Fetches ALL ward assignments across all rate sections.
 * Source: GET /api/RateSectionDetails
 */
export async function getAllRateSectionDetailsAction(): Promise<ActionResponse<SectionItem[]>> {
  try {
    const data = await getAllRateSectionDetails();
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to fetch all ward assignments" };
  }
}

/**
 * Fetches rate section details by id and wardId.
 * Used for SSR when editing a specific ward assignment.
 */
export async function getRateSectionDetailsByIdAction(
  id: string,
  wardId: string
): Promise<ActionResponse<SectionItem[]>> {
  try {
    const data = await getWardPagedServer(1, 100);
    const filtered = (data.items ?? []).filter(
      (item: SectionItem) =>
        String(item.id) === id ||
        String(item.wardId) === wardId
    );
    return { success: true, data: filtered };
  } catch (_error) {
    return { success: false, error: "Failed to fetch rate section details", data: [] };
  }
}

export async function getWardTotalCountAction(): Promise<
  ActionResponse<number>
> {
  try {
    return {
      success: true,
      data: await getWardTotalCount(),
    };
  } catch (_error) {
    return {
      success: false,
      error: "Failed to fetch ward total count",
    };
  }
}

/* ------------------------------------------------------------------ */
/* UPDATE: rate section */
/* ------------------------------------------------------------------ */
export async function updateRateSectionAction(
  id: number,
  payload: {
    rateSectionNo: string;
    description: string;
    isActive: boolean;
  }
): Promise<{ success: boolean; message?: string; statusCode?: number; error?: string }> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, message: "Valid Rate Section ID is required", statusCode: 400 };
    }

    if (!payload.rateSectionNo?.trim()) {
      return { success: false, message: "Rate Section No is required", statusCode: 400 };
    }

    if (!payload.description?.trim()) {
      return { success: false, message: "Description is required", statusCode: 400 };
    }

    const result = await updateRateSection(String(id), {
      zoneCode: payload.rateSectionNo,
      zoneEnglish: payload.rateSectionNo,
      zoneRegional: payload.description,
      description: payload.description,
      isActive: payload.isActive,
      wards: []
    });

    if (!result.success) {
      return { success: false, message: result.error || "Failed to update rate section" };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }

    return { success: true, message: "Rate section updated successfully" };
  } catch (_error) {
    return { success: false, message: "Failed to update rate section" };
  }
}

export async function deleteRateSectionAction(
  id: number
): Promise<{ success: boolean; message?: string; error?: string; statusCode?: number }> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, message: "Valid Rate Section ID is required", statusCode: 400 };
    }

    const response = await apiClient.delete(`/RateSection/${id}/purge`);

    if (!response.success) {
      return { success: false, error: response.error || "Failed to delete rate section" };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }

    return { success: true, message: "Rate section deleted successfully" };
  } catch (_error) {
    return { success: false, error: "Failed to delete rate section" };
  }
}


export async function createRateSectionAction(payload: {
  rateSectionNo: string;
  description: string;
  isActive: boolean;
}): Promise<{ success: boolean; message?: string; error?: string; statusCode?: number; data?: unknown }> {
  try {
    if (!payload.rateSectionNo?.trim()) {
      return { success: false, message: "Rate Section No is required", statusCode: 400 };
    }

    if (!payload.description?.trim()) {
      return { success: false, message: "Description is required", statusCode: 400 };
    }

    const result = await createRateSection({
      zoneCode: payload.rateSectionNo.trim(),
      zoneEnglish: payload.rateSectionNo.trim(),
      zoneRegional: payload.description.trim(),
      description: payload.description.trim(),
      isActive: payload.isActive,
      wards: []
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to create rate section", statusCode: 400 };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }

    return { success: true, message: "Rate section created successfully" };
  } catch (_error) {
    return { success: false, error: "Failed to create rate section" };
  }
}

/* ------------------------------------------------------------------ */
/* WARD MASTER - PAGED FETCH (for AddWard SSR)                        */
/* ------------------------------------------------------------------ */

/**
 * Fetches ALL wards with PageSize=-1 in a single API call.
 * Used for SSR pre-fetching in Link Ward drawer.
 * Supports optional searchTerm for server-side filtering.
 */
export async function getAllWardsForLinkAction(searchTerm?: string): Promise<{
  success: boolean;
  data?: { id: string; wardNo: string; name: string }[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const data = await getWards(1, -1, searchTerm || undefined);
    
    // Transform to simplified format for AddWard
    const items = (data.items || []).map((w) => ({
      id: String(w.id),
      wardNo: w.wardNo,
      name: w.description ?? w.wardNo
    }));

    return {
      success: true,
      data: items,
      totalCount: data.totalCount || items.length
    };
  } catch (_error) {
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
  data?: { id: string; wardNo: string; name: string }[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    const data = await getWards(pageNumber, pageSize, searchTerm || undefined);
    
    // Transform to simplified format for AddWard
    const items = (data.items || []).map((w) => ({
      id: String(w.id),
      wardNo: w.wardNo,
      name: w.description ?? w.wardNo
    }));

    return {
      success: true,
      data: items,
      totalCount: data.totalCount || items.length,
      pageNumber: data.pageNumber || pageNumber,
      pageSize: data.pageSize || pageSize,
      totalPages: data.totalPages || Math.ceil((data.totalCount || 0) / pageSize)
    };
  } catch (_error) {
    return { success: false, error: "Failed to fetch wards" };
  }
}

/**
 * Link wards to a rate section - server-side only.
 * Takes rateSectionId and wardNos, fetches ward IDs server-side,
 * then creates the batch payload and makes the API call.
 * This hides the full payload from the client.
 */
export async function linkWardsToRateSectionAction(
  rateSectionId: number,
  wardNos: string[]
): Promise<{
  success: boolean;
  data?: { successCount: number; failedCount: number; hasFailures: boolean };
  error?: string;
  statusCode?: number;
}> {
  try {
    if (!Number.isFinite(rateSectionId) || rateSectionId <= 0) {
      return { success: false, error: "Valid Rate Section ID is required", statusCode: 400 };
    }

    if (!Array.isArray(wardNos) || wardNos.length === 0) {
      return { success: false, error: "At least one ward is required", statusCode: 400 };
    }

    // Fetch all wards to get their IDs
    const wardsData = await getWards(1, -1);
    const allWards = wardsData.items || [];

    // Build wardNo to wardId map
    const wardNoToId: Record<string, number> = {};
    allWards.forEach((w) => {
      wardNoToId[w.wardNo] = w.id;
    });

    // Build batch payload server-side
    const batchPayload = wardNos
      .filter(wardNo => wardNoToId[wardNo])
      .map(wardNo => ({
        rateSectionId,
        wardId: wardNoToId[wardNo],
        isActive: true,
        createdBy: 0
      }));

    if (batchPayload.length === 0) {
      return { success: false, error: "No valid wards to link", statusCode: 400 };
    }

    // Make the batch API call
    const result = await createRateSectionDetailsBatch(batchPayload);
    
    return {
      success: true,
      data: {
        successCount: result.items?.successCount || batchPayload.length,
        failedCount: result.items?.failedCount || 0,
        hasFailures: result.items?.hasFailures || false
      }
    };
  } catch (_error) {
    return { success: false, error: "Failed to link wards" };
  }
}

/**
 * Fetches wards assigned to a specific rate section with count.
 * Used for SSR in the "Wards in Rate Section" panel of AddWard drawer.
 * API: GET /api/RateSectionDetails?RateSectionId={id}
 * Returns only wardNo array and count - no IDs exposed to client.
 */
export async function getSelectedWardsWithCountAction(rateSectionId: number): Promise<{
  success: boolean;
  wardNos: string[];
  totalCount: number;
  error?: string;
}> {
  try {
    if (!rateSectionId) {
      return { success: false, wardNos: [], totalCount: 0, error: "Rate section ID is required" };
    }

    const params = new URLSearchParams({
      RateSectionId: rateSectionId.toString(),
      PageNumber: "1",
      PageSize: "1000"
    });

    const response = await apiClient.get<{ items?: { wardNo?: string }[]; totalCount?: number }>(`/RateSectionDetails?${params.toString()}`);
    
    if (!response.success || !response.data) {
      return { success: false, wardNos: [], totalCount: 0, error: response.error || "Failed to fetch" };
    }

    // Extract only wardNo values - don't expose IDs to client
    const wardNos = (response.data.items || []).map((item) => item.wardNo || "").filter(Boolean);

    return {
      success: true,
      wardNos,
      totalCount: response.data.totalCount || wardNos.length
    };
  } catch (_error) {
    return { success: false, wardNos: [], totalCount: 0, error: "Failed to fetch selected wards" };
  }
}

/**
 * Refreshes selected wards for a rate section with PageSize=-1.
 * Used after batch operations to get the updated list.
 * API: GET /api/RateSectionDetails?RateSectionId={id}&PageSize=-1
 * Returns minimal data to client - only wardNo array and count.
 */
export async function refreshSelectedWardsAction(rateSectionId: number): Promise<{
  success: boolean;
  wardNos: string[];
  totalCount: number;
  error?: string;
}> {
  try {
    if (!rateSectionId) {
      return { success: false, wardNos: [], totalCount: 0, error: "Rate section ID is required" };
    }

    const params = new URLSearchParams({
      RateSectionId: rateSectionId.toString(),
      PageSize: "-1"
    });

    const response = await apiClient.get<{ items?: { wardNo?: string }[]; totalCount?: number }>(`/RateSectionDetails?${params.toString()}`);
    
    if (!response.success || !response.data) {
      return { success: false, wardNos: [], totalCount: 0, error: response.error || "Failed to fetch" };
    }

    // Extract only wardNo values - don't expose IDs to client
    const wardNos = (response.data.items || []).map((item) => item.wardNo || "").filter(Boolean);

    return {
      success: true,
      wardNos,
      totalCount: response.data.totalCount || wardNos.length
    };
  } catch (_error) {
    return { success: false, wardNos: [], totalCount: 0, error: "Failed to fetch selected wards" };
  }
}

/**
 * Deletes selected wards from a rate section by their ward numbers.
 * Looks up id server-side to avoid exposing IDs to client.
 * API: DELETE /api/RateSectionDetails/batch/purge
 */
export async function deleteSelectedWardsAction(rateSectionId: number, wardNos: string[]): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    if (!rateSectionId || wardNos.length === 0) {
      return { success: false, deletedCount: 0, error: "Invalid parameters" };
    }

    // Fetch all rate section details to get the IDs for the selected wardNos
    const params = new URLSearchParams({
      RateSectionId: rateSectionId.toString(),
      PageSize: "-1"
    });

    const response = await apiClient.get<{ items?: { wardNo?: string; id?: number }[] }>(`/RateSectionDetails?${params.toString()}`);
    
    if (!response.success || !response.data) {
      return { success: false, deletedCount: 0, error: "Failed to fetch details" };
    }

    // Build wardNo to id map
    const wardNoToId: Record<string, number> = {};
    (response.data.items || []).forEach((item) => {
      if (item.wardNo && item.id) {
        wardNoToId[item.wardNo] = item.id;
      }
    });

    // Get IDs to delete
    const idsToDelete = wardNos
      .map(wardNo => wardNoToId[wardNo])
      .filter((id): id is number => id !== undefined);

    if (idsToDelete.length === 0) {
      return { success: false, deletedCount: 0, error: "No matching wards found" };
    }

    // Call batch purge delete API
    const deleteResponse = await apiClient.delete<{ items?: { successCount?: number } }>(`/RateSectionDetails/batch/purge`, { body: JSON.stringify(idsToDelete) });

    if (!deleteResponse.success) {
      return { success: false, deletedCount: 0, error: deleteResponse.error || "Delete failed" };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }
    
    return {
      success: true,
      deletedCount: deleteResponse.data?.items?.successCount || idsToDelete.length
    };
  } catch (_error) {
    return { success: false, deletedCount: 0, error: "Failed to delete wards" };
  }
}

/* ================================================================== */
/* WARD-SPECIFIC ACTIONS (Rate Section Details CRUD)                 */
/* ================================================================== */

/**
 * Fetches a single ward by its ID from Ward Master.
 * Used in SSR for displaying ward details in edit pages.
 * @param wardId - Numeric or string ward ID
 * @returns Ward item with full details or error
 */
export async function getWardByIdAction(
  wardId: number | string
): Promise<ActionResult<WardItem>> {
  try {
    const numericWardId = typeof wardId === "string" ? parseInt(wardId, 10) : wardId;
    if (!Number.isFinite(numericWardId) || numericWardId <= 0) {
      return { success: false, message: "Valid Ward ID is required", statusCode: 400 };
    }

    const data = await getWardById(numericWardId);
    
    if (!data) {
      return { success: false, message: "Ward not found" };
    }

    return { success: true, data };
  } catch (_error) {
    return { success: false, message: "Failed to fetch ward" };
  }
}

/**
 * Updates a rate section detail (ward assignment) by its ID.
 * Used when editing ward properties like status, wardNo, or description.
 * API: PUT /api/RateSectionDetails/{id}
 * @param id - Rate section detail ID
 * @param payload - Update payload with ward and rate section references
 * @returns Success status with optional data
 */
export async function updateRateSectionDetailAction(
  id: number,
  payload: RateSectionDetailPayload
): Promise<ActionResult> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return { success: false, message: "Valid Rate Section Detail ID is required", statusCode: 400 };
    }

    if (!Number.isFinite(payload.rateSectionId) || payload.rateSectionId <= 0) {
      return { success: false, message: "Valid Rate Section ID is required", statusCode: 400 };
    }

    if (!Number.isFinite(payload.wardId) || payload.wardId <= 0) {
      return { success: false, message: "Valid Ward ID is required", statusCode: 400 };
    }

    const response = await apiClient.put(`/RateSectionDetails/${id}`, payload);

    if (!response.success) {
      return { success: false, message: response.error || "Failed to update rate section detail" };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }

    return { success: true, data: response.data, message: "Rate section detail updated successfully" };
  } catch (_error) {
    return { success: false, message: "Failed to update rate section detail" };
  }
}

/**
 * purge deletes a rate section detail (ward assignment) by its ID.
 * Permanently removes the ward from the rate section.
 * API: DELETE /api/RateSectionDetails/{id}/purge
 * @param rateSectionDetailId - Rate section detail ID to delete
 * @returns Success status with message
 */
export async function deleteRateSectionDetailAction(
  rateSectionDetailId: number
): Promise<ActionResult> {
  const id = rateSectionDetailId;

  if (!id || id <= 0) {
    return { success: false, message: "Valid Rate Section Detail ID is required", statusCode: 400 };
  }

  try {
    const response = await apiClient.delete(`/RateSectionDetails/${id}/purge`);

    if (!response.success) {
      return { success: false, message: response.error || "Failed to delete rate section detail" };
    }

    // Revalidate all locale variants
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/rate-section-master`, "page");
    }

    return { success: true, message: "Rate section detail deleted successfully" };
  } catch (_error) {
    return { success: false, message: "Failed to delete rate section detail" };
  }
}
