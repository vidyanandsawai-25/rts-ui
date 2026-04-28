import { apiClient } from "@/services/api.service";
import {
  SectionItem,
  RateSectionDetailsPagedResponse,
  UpdateWardStatusPayload,
  RateSectionDetailsBatchPayload,
  RateSectionDetailsBatchResponse,
  RateSectionDetailsPayload,
} from "@/types/rateSectionMaster.types";

export type { RateSectionDetailsPayload };

/* =========================
   RATE SECTION DETAILS SERVICES
========================= */

/**
 * Assign a Ward to a Rate Section (Create Detail).
 */
export async function createRateSectionDetail(payload: RateSectionDetailsPayload): Promise<{ success: boolean; error?: string }> {
  const response = await apiClient.post(`/RateSectionDetails`, payload);
  return response.success 
    ? { success: true } 
    : { success: false, error: response.error || "Failed to create RateSectionDetail" };
}

/**
 * Delete a Rate Section Detail (ward assignment).
 */
export async function deleteRateSectionDetail(id: number): Promise<{ success: boolean; error?: string }> {
  const response = await apiClient.delete(`/RateSectionDetails/${id}`);
  return response.success 
    ? { success: true } 
    : { success: false, error: response.error || "Failed to delete rate section detail" };
}

/**
 * Get the total count of assigned wards (Rate Section Details).
 */
export async function getWardTotalCount(): Promise<number> {
  const response = await apiClient.get<{ totalCount?: number; TotalCount?: number; count?: number; items?: unknown[] }>(`/RateSectionDetails?PageSize=1&PageNumber=1`);
  if (!response.success || !response.data) return 0;
  const data = response.data;
  return data?.totalCount ?? data?.TotalCount ?? data?.count ?? (Array.isArray(data?.items) ? data.items.length : 0);
}

/**
 * Fetch all Rate Section Details (Assigned Wards) across all pages.
 * Use this when you need a full list of all assignments.
 */
export async function getAllRateSectionDetails(): Promise<SectionItem[]> {
  let allItems: SectionItem[] = [];
  let page = 1;
  const pageSize = 500;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      PageNumber: page.toString(),
      PageSize: pageSize.toString(),
    });

    const response = await apiClient.get<RateSectionDetailsPagedResponse>(`/RateSectionDetails?${params.toString()}`);
    
    if (!response.success || !response.data) break;

    const data = response.data;
    const dataObj = data as unknown as Record<string, unknown>;
    const items = (data.items ?? dataObj.Items ?? []) as SectionItem[];

    // If we get an empty array but expected more, stop
    if (items.length === 0) break;

    allItems = [...allItems, ...items];

    const totalCount = (data.totalCount ?? dataObj.TotalCount ?? dataObj.count ?? 0) as number;
    if (items.length < pageSize || allItems.length >= totalCount || page >= 50) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allItems;
}

/**
 * Update the status (Active/Inactive) of a Ward assignment.
 */
export async function updateWardStatus(payload: UpdateWardStatusPayload): Promise<SectionItem | null> {
  const response = await apiClient.put<SectionItem>(`/RateSectionDetails/UpdateStatus`, payload);
  return response.success && response.data ? response.data : null;
}

/**
 * Fetch paginated list of Rate Section Details (Assigned Wards).
 */
export async function getRateSectionDetailsPaged(
  pageNumber: number,
  pageSize: number,
  rateSectionNo?: string,
  searchTerm?: string
): Promise<RateSectionDetailsPagedResponse> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });
  if (rateSectionNo) params.append("rateSectionNo", rateSectionNo);
  if (searchTerm) params.append("SearchTerm", searchTerm);
  const response = await apiClient.get<RateSectionDetailsPagedResponse>(`/RateSectionDetails?${params.toString()}`);
  return response.success && response.data ? response.data : {
    items: [], totalCount: 0, pageNumber: 1, pageSize: 10
  };
}

/**
 * Fetch paginated Rate Section Details with optional filters.
 */
export async function getWardPagedServer(
  pageNumber: number,
  pageSize: number,
  zoneId?: number,
  searchTerm?: string
): Promise<RateSectionDetailsPagedResponse> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });
  if (zoneId) params.append("ZoneId", zoneId.toString());
  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());
  const response = await apiClient.get<RateSectionDetailsPagedResponse>(`/RateSectionDetails?${params.toString()}`);
  return response.success && response.data ? response.data : {
    items: [], totalCount: 0, pageNumber: 1, pageSize: 10
  };
}

/**
 * Batch create Rate Section Details (Multiple Ward Assignments).
 */
export async function createRateSectionDetailsBatch(
  payload: RateSectionDetailsBatchPayload[]
): Promise<RateSectionDetailsBatchResponse> {
  const response = await apiClient.post<RateSectionDetailsBatchResponse>(`/RateSectionDetails/Batch`, payload);
  return response.success && response.data ? response.data : {
    success: false,
    message: response.error || "Failed to create batch rate section details",
    items: { successCount: 0, failedCount: 0, results: [], errors: [], hasFailures: true, allSucceeded: false },
    errors: null,
  };
}

/**
 * Get a single Rate Section Detail by its ID.
 */
export async function getRateSectionDetailById(id: number): Promise<SectionItem | null> {
  const response = await apiClient.get<SectionItem>(`/RateSectionDetails/${id}`);
  return response.success && response.data ? response.data : null;
}

/**
 * Update a Rate Section Detail.
 */
export async function updateRateSectionDetail(
  id: number,
  payload: Partial<SectionItem>
): Promise<{ success: boolean; error?: string }> {
  const response = await apiClient.put(`/RateSectionDetails/${id}`, payload);
  return response.success 
    ? { success: true } 
    : { success: false, error: response.error || "Failed to update rate section detail" };
}

/**
 * Fetch wards associated with a specific Rate Section.
 */
export async function getWardsByRateSection(
  rateSectionNo: string,
  pageSize: number = 1000
): Promise<SectionItem[]> {
  if (!rateSectionNo?.trim()) return [];
  const params = new URLSearchParams({ rateSectionNo, PageSize: pageSize.toString() });
  const response = await apiClient.get<SectionItem[] | { items?: SectionItem[]; data?: SectionItem[]; rateSectionDetails?: SectionItem[] }>(`/RateSectionDetails?${params.toString()}`);
  if (!response.success || !response.data) return [];
  const data = response.data;
  return Array.isArray(data) ? data 
    : Array.isArray(data.rateSectionDetails) ? data.rateSectionDetails
    : Array.isArray(data.items) ? data.items 
    : Array.isArray(data.data) ? data.data : [];
}

export const getWardsByRate = getWardsByRateSection;
