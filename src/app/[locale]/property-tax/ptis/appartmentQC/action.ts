"use server";

import { revalidatePath } from "next/cache";
import type { ApartmentQCDetail, ApartmentQCSearchParams } from "@/types/apartmentQC.types";
import {
  getApartmentQCDetailsLocalized,
  getApartmentQCDetailsSafe,
  updateApartmentQCDetailsLocalized,
} from "@/lib/api/appartmentQC.service";
import { ApiError } from "@/lib/utils/api";

/* ============================================================
   ACTION RESULT TYPE
 ============================================================ */

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

/* ============================================================
   ERROR HELPERS
 ============================================================ */

/**
 * Convert translation keys or error messages to user-facing strings.
 * If the input looks like a translation key (e.g., "ptis.apartmentQC.errors.fetchFailed"),
 * convert it to a human-readable message as a fallback.
 */
function toUserFacingErrorMessage(messageOrKey: string): string {
  const value = messageOrKey.trim();
  if (!value) {
    return "An unexpected error occurred.";
  }

  // Check if it looks like a translation key (dotted notation)
  const looksLikeTranslationKey = /^[a-z0-9]+(?:\.[a-z0-9]+)+$/i.test(value);
  
  if (!looksLikeTranslationKey) {
    // Already a plain message, return as-is
    return value;
  }

  // Extract the last segment and convert camelCase/PascalCase to readable text
  const fallbackMessage = value
    .split(".")
    .pop()
    ?.replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!fallbackMessage) {
    return "An unexpected error occurred.";
  }

  // Capitalize first letter
  return fallbackMessage.charAt(0).toUpperCase() + fallbackMessage.slice(1);
}

function handleActionError(error: unknown, defaultKey: string): { success: false; error: string } {
  console.error(`[appartmentQC.action] ${defaultKey}:`, error);
  if (error instanceof ApiError) {
    return {
      success: false,
      error: toUserFacingErrorMessage(error.contextMessage || defaultKey),
    };
  }
  return { success: false, error: toUserFacingErrorMessage(defaultKey) };
}

/* ============================================================
   SEARCH / FETCH ACTIONS
 ============================================================ */

/**
 * Fetch apartment QC detail records for the given search parameters.
 */
export async function fetchApartmentQCDetailsAction(
  params: ApartmentQCSearchParams
): Promise<ActionResult<ApartmentQCDetail[]>> {
  try {
    const data = await getApartmentQCDetailsLocalized(params);
    // data.items is PagedResponse<ApartmentQCDetail>; extract the flat items array
    return {
      success: true,
      data: data.items?.items ?? [],
      message: data.message,
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch apartment QC details");
  }
}

/**
 * Fetch apartment QC detail records with full pagination response metadata.
 */
export async function fetchApartmentQCDetailsPagedAction(
  params: ApartmentQCSearchParams
): Promise<ActionResult<{
  items: ApartmentQCDetail[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}>> {
  try {
    const data = await getApartmentQCDetailsLocalized(params);
    // data.items is PagedResponse<ApartmentQCDetail> (the nested object from the API)
    const pagedItems = data.items;
    return {
      success: true,
      data: {
        items: pagedItems?.items ?? [],
        totalCount: pagedItems?.totalCount ?? pagedItems?.items?.length ?? 0,
        totalPages: pagedItems?.totalPages ?? 1,
        pageNumber: pagedItems?.pageNumber ?? 1,
        pageSize: pagedItems?.pageSize ?? (pagedItems?.items?.length || 10),
        hasNext: !!pagedItems?.hasNext,
        hasPrevious: !!pagedItems?.hasPrevious,
      },
      message: data.message,
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch apartment QC details with pagination");
  }
}

/**
 * Safe variant — always resolves; returns an empty array on API failure.
 */
export async function fetchApartmentQCDetailsSafeAction(
  params: ApartmentQCSearchParams
): Promise<ApartmentQCDetail[]> {
  try {
    return await getApartmentQCDetailsSafe(params);
  } catch {
    return [];
  }
}

/**
 * Update apartment QC property details.
 */
export async function updateApartmentQCAction(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ActionResult<ApartmentQCDetail>> {
  try {
    const data = await updateApartmentQCDetailsLocalized(propertyDetailsId, payload);
    // Revalidate for all locales by using the base path pattern
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return {
      success: true,
      data,
      message: "Apartment QC details updated successfully",
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update apartment QC details");
  }
}

/**
 * Fetch details by WardId only.
 */
export async function fetchApartmentQCByWardAction(
  wardId: number | string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  return fetchApartmentQCDetailsAction({ wardId });
}

/**
 * Fetch details by WardId + PropertyNo.
 */
export async function fetchApartmentQCByPropertyAction(
  wardId: number | string,
  propertyNo: number | string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  return fetchApartmentQCDetailsAction({ wardId, propertyNo: String(propertyNo) });
}

/* ============================================================
   REVALIDATION HELPER
 ============================================================ */

export async function revalidateApartmentQCAction(): Promise<ActionResult> {
  try {
    // Revalidate for all locales by using the base path pattern
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, message: "Apartment QC data refreshed" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to refresh apartment QC data");
  }
}

/* ============================================================
   FLOOR QC DROPDOWN DATA ACTIONS
 ============================================================ */

/**
 * Fetch all floors for Floor QC dropdown (paginated fetch all pages)
 */
export async function fetchAllFloorsAction(): Promise<ActionResult<Array<{ value: string; label: string }>>> {
  try {
    const { getFloorPaged } = await import("@/lib/api/floor.service");
    const pageSize = 1000;
    let page = 1;
    let all: Array<{ value: string; label: string }> = [];
    let hasMore = true;
    
    while (hasMore) {
      const res = await getFloorPaged(page, pageSize);
      const items = res.items ?? [];
      all = [...all, ...items.map((f: { id: number | string; description?: string; floorCode?: string }) => ({ value: String(f.id), label: f.description || f.floorCode || '' }))];
      if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
      else page++;
    }
    
    return { success: true, data: all };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch floors");
  }
}

/**
 * Fetch all construction types for Floor QC dropdown (paginated fetch all pages)
 */
export async function fetchAllConstructionTypesAction(): Promise<ActionResult<Array<{ value: string; label: string }>>> {
  try {
    const { getConstructionPaged } = await import("@/lib/api/constructiontypemaster/construction-crud.service");
    const pageSize = 1000;
    let page = 1;
    let all: Array<{ value: string; label: string }> = [];
    let hasMore = true;
    
    while (hasMore) {
      const res = await getConstructionPaged(page, pageSize);
      const items = res.items ?? [];
      all = [...all, ...items.map((c: { id: number | string; description?: string; constructionCode?: string }) => ({ value: String(c.id), label: c.description || c.constructionCode || '' }))];
      if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
      else page++;
    }
    
    return { success: true, data: all };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch construction types");
  }
}

/**
 * Fetch all use types for Floor QC dropdown (paginated fetch all pages)
 */
export async function fetchAllUseTypesAction(): Promise<ActionResult<Array<{ value: string; label: string }>>> {
  try {
    const { getUseTypesPagedServer } = await import("@/lib/api/typeofusemaster.service");
    const pageSize = 5000;
    let page = 1;
    let all: Array<{ value: string; label: string }> = [];
    let hasMore = true;
    
    while (hasMore) {
      const res = await getUseTypesPagedServer({ pageNumber: page, pageSize });
      const items = res.items ?? [];
      all = [...all, ...items.map(u => ({ value: String(u.typeOfUseId), label: u.description || u.typeOfUseCode }))];
      if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
      else page++;
    }
    
    return { success: true, data: all };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch use types");
  }
}

/**
 * Fetch all sub-types for Floor QC dropdown (paginated fetch all pages)
 */
export async function fetchAllSubTypesAction(): Promise<ActionResult<Array<{ value: string; label: string; typeOfUseId: string }>>> {
  try {
    const { getSubTypesPagedServer } = await import("@/lib/api/typeofusemaster.service");
    const pageSize = 5000;
    let page = 1;
    let all: Array<{ value: string; label: string; typeOfUseId: string }> = [];
    let hasMore = true;
    
    while (hasMore) {
      const res = await getSubTypesPagedServer({ pageNumber: page, pageSize });
      const items = res.items ?? [];
      all = [...all, ...items.map(s => ({ 
        value: String(s.subTypeOfUseId), 
        label: s.description,
        typeOfUseId: String(s.typeOfUseId)
      }))];
      if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
      else page++;
    }
    
    return { success: true, data: all };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch sub-types");
  }
}

/* ============================================================
   FLOOR QC DATA ACTIONS
   New API endpoint: GET /Property/apartmentQC-details/{propertyId}?type={type}
   Fetches all floor records for a property filtered by type
 ============================================================ */

/**
 * Fetch Floor QC data by propertyId and type.
 * Uses the new endpoint: /Property/apartmentQC-details/{propertyId}?type={type}
 * Returns all floor records for the property.
 * 
 * @param propertyId - The property ID (e.g., 549357)
 * @param type - The type filter: 'rateable', 'capital', or 'dual'
 * @returns ActionResult with array of ApartmentQCDetail items (floor records)
 */
export async function fetchFloorQCByPropertyIdAction(
  propertyId: number | string,
  type: 'rateable' | 'capital' | 'dual' | string
): Promise<ActionResult<ApartmentQCDetail[]>> {
  try {
    const { getFloorQCByPropertyIdLocalized } = await import("@/lib/api/appartmentQC.service");
    const data = await getFloorQCByPropertyIdLocalized(propertyId, type);
    // data.items is PagedResponse<ApartmentQCDetail>; extract the flat items array
    return {
      success: true,
      data: data.items?.items ?? [],
      message: data.message,
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch floor QC details");
  }
}

/**
 * Safe variant of fetchFloorQCByPropertyIdAction — always resolves with an array.
 * Returns empty array on failure instead of throwing an error.
 * 
 * @param propertyId - The property ID (e.g., 549357)
 * @param type - The type filter: 'rateable', 'capital', or 'dual'
 * @returns Array of ApartmentQCDetail items (floor records)
 */
export async function fetchFloorQCByPropertyIdSafeAction(
  propertyId: number | string,
  type: 'rateable' | 'capital' | 'dual' | string
): Promise<ApartmentQCDetail[]> {
  try {
    const { getFloorQCByPropertyIdSafe } = await import("@/lib/api/appartmentQC.service");
    return await getFloorQCByPropertyIdSafe(propertyId, type);
  } catch {
    return [];
  }
}

/* ============================================================
   FLOOR QC UPDATE ACTION
   Endpoint: PATCH /Property/apartmentQC-details/{propertyId}/detail/{detailId}
   Updates a specific floor detail record
 ============================================================ */

/**
 * Payload for updating a floor QC detail record
 */
export interface FloorQCUpdatePayload {
  floorId?: number;
  constructionTypeId?: number;
  typeOfUseId?: number;
  subTypeOfUseId?: number;
  updatedBy?: number;
  constructionYear?: string;
  assessmentYear?: string;
}

/**
 * Update a Floor QC detail record by propertyId and detailId.
 * Uses the PATCH endpoint: /Property/apartmentQC-details/{propertyId}/detail/{detailId}
 * 
 * @param propertyId - The property ID (e.g., 550299)
 * @param detailId - The detail ID / pdnId (e.g., 206147)
 * @param payload - The fields to update
 * @returns ActionResult indicating success or failure
 */
export async function updateFloorQCDetailAction(
  propertyId: number | string,
  detailId: number | string,
  payload: FloorQCUpdatePayload
): Promise<ActionResult> {
  try {
    const { updateFloorQCDetailLocalized } = await import("@/lib/api/appartmentQC.service");
    await updateFloorQCDetailLocalized(propertyId, detailId, payload);
    // Revalidate the apartment QC pages to reflect changes
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return {
      success: true,
      message: "Floor QC detail updated successfully",
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update floor QC detail");
  }
}

/* ============================================================
   FLOOR QC BULK UPDATE ACTION
   Endpoint: PATCH /Property/apartmentQC-details/{propertyId}/details
   Updates multiple floor detail records at once
 ============================================================ */

/**
 * Payload item for bulk updating floor QC detail records
 */
export interface FloorQCBulkUpdateItem extends FloorQCUpdatePayload {
  detailId: number; // The pdnId of the floor detail to update
}

/**
 * Bulk update Floor QC detail records by propertyId.
 * Uses the PATCH endpoint: /Property/apartmentQC-details/{propertyId}/details
 * 
 * @param propertyId - The property ID (e.g., 550299)
 * @param items - Array of floor detail updates with detailId for each
 * @returns ActionResult indicating success or failure
 */
export async function updateFloorQCDetailsBulkAction(
  propertyId: number | string,
  items: FloorQCBulkUpdateItem[]
): Promise<ActionResult> {
  try {
    const { updateFloorQCDetailsBulkLocalized } = await import("@/lib/api/appartmentQC.service");
    await updateFloorQCDetailsBulkLocalized(propertyId, items);
    // Revalidate the apartment QC pages to reflect changes
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return {
      success: true,
      message: "Floor QC details updated successfully",
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update floor QC details");
  }
}

/* ============================================================
   BASIC DETAILS UPDATE ACTION
   Endpoint: PATCH /Property/apartmentQC-details/{propertyId}/basic-details
   Updates the basic information of a property
 ============================================================ */

/**
 * Payload for updating basic details of a property
 */
export interface BasicDetailsUpdatePayload {
  ownerName?: string;
  occupierName?: string;
  renterName?: string;
  propertyType?: number;
  bhk?: string;
  mobileNo?: string;
  emailId?: string;
  wing?: string;
  flatOrShopNo?: string;
  flatOrShopName?: string;
  oldPropertyNo?: string;
  updatedBy?: number;
}

/**
 * Update basic details of a property by propertyId.
 * Uses the PATCH endpoint: /Property/apartmentQC-details/{propertyId}/basic-details
 * 
 * @param propertyId - The property ID (e.g., 549357)
 * @param payload - The fields to update
 * @returns ActionResult indicating success or failure
 */
export async function updateBasicDetailsAction(
  propertyId: number | string,
  payload: BasicDetailsUpdatePayload
): Promise<ActionResult> {
  try {
    const { updateBasicDetailsLocalized } = await import("@/lib/api/appartmentQC.service");
    await updateBasicDetailsLocalized(propertyId, payload);
    // Revalidate the apartment QC pages to reflect changes
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return {
      success: true,
      message: "Basic details updated successfully",
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update basic details");
  }
}

/**
 * Fetch all property types for dropdown
 */
export async function fetchAllPropertyTypesAction(): Promise<ActionResult<Array<{ value: string; label: string }>>> {
  try {
    const { getPropertyTypesPaged } = await import("@/lib/api/property-type-crud.service");
    const pageSize = 1000;
    let page = 1;
    let all: Array<{ value: string; label: string }> = [];
    let hasMore = true;
    
    while (hasMore) {
      const res = await getPropertyTypesPaged(page, pageSize);
      const items = res.items ?? [];
      all = [...all, ...items.map((pt) => ({ 
        value: String(pt.id), 
        label: pt.propertyDescription || pt.type 
      }))];
      if (items.length === 0 || all.length >= res.totalCount) hasMore = false;
      else page++;
    }
    
    return { success: true, data: all };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch property types");
  }
}

/* ============================================================
   ROOM WISE SUBMISSION CRUD ACTIONS
   API: /api/RoomWiseSubmission
============================================================ */

/**
 * Fetch room types with IDs for dropdown mapping
 */
export async function fetchRoomTypesAction(): Promise<ActionResult<Array<{ id: number; code: string; name: string; description: string }>>> {
  try {
    const { getRoomTypeData } = await import("@/lib/api/ptis/floorSubmission/floor-lookup.service");
    const data = await getRoomTypeData();
    return {
      success: true,
      data: data.map((item: { roomTypeId?: number; id?: number; roomTypeCode?: string; roomTypeName?: string; description?: string }) => ({
        id: item.roomTypeId || item.id || 0,
        code: item.roomTypeCode || String(item.roomTypeId || item.id || 0),
        name: item.roomTypeName || '',
        description: item.description || ''
      }))
    };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch room types");
  }
}

/**
 * Fetch room wise submissions by propertyId and propertyDetailsId (pdnId)
 */
export async function fetchRoomWiseSubmissionsAction(params: {
  propertyId?: number;
  propertyDetailsId?: number;
}): Promise<ActionResult<unknown[]>> {
  try {
    const { getRoomWiseSubmissionsSafe } = await import("@/lib/api/appartmentQC-room.service");
    const data = await getRoomWiseSubmissionsSafe(params);
    return { success: true, data };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to fetch room submissions");
  }
}

/**
 * Fetch room wise submissions with typed result (alternative to fetchRoomWiseSubmissionsAction)
 * This version returns RoomWiseSubmissionData[] for better type safety
 */
export async function getRoomWiseSubmissionsAction(params: {
  propertyId: number;
  propertyDetailsId: number;
}): Promise<{ success: boolean; data?: import("@/lib/api/appartmentQC-room.service").RoomWiseSubmissionData[]; error?: string }> {
  try {
    const { getRoomWiseSubmissionsSafe } = await import("@/lib/api/appartmentQC-room.service");
    const data = await getRoomWiseSubmissionsSafe({
      propertyId: params.propertyId,
      propertyDetailsId: params.propertyDetailsId,
    });
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[getRoomWiseSubmissionsAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch room submissions',
    };
  }
}

/**
 * Create a new room wise submission
 */
export async function createRoomWiseSubmissionAction(payload: {
  propertyDetailsId: number;
  propertyId: number;
  lengthMtr?: number;
  widthMtr?: number;
  heightMtr?: number;
  areaSqMtr?: number;
  noOfRooms?: number;
  totalAreaSqMtr?: number;
  roomNo?: string;
  roomType?: string;
  roomTypeId?: number;  // API expects numeric ID
  shape?: string;
  outerYesNo?: boolean;
  minusYesNo?: boolean;
  submissionType?: string;
  base1Mtr?: number;
  base2Mtr?: number;
  roomWiseMinusData?: Array<{
    id?: number;
    roomWiseSubmissionId?: number;
    lengthMtr?: number;
    widthMtr?: number;
    heightMtr?: number;
    areaSqMtr?: number;
    shape?: string;
    base1Mtr?: number;
    base2Mtr?: number;
    operation?: string;
    remark?: string;
  }>;
}): Promise<ActionResult<unknown>> {
  try {
    const { createRoomWiseSubmissionSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await createRoomWiseSubmissionSafe({
      isActive: true,
      createdBy: 1, // TODO: Get from auth context
      ...payload,
      roomWiseMinusData: payload.roomWiseMinusData?.map(offset => ({
        isActive: true,
        createdBy: 1,
        ...offset
      }))
    });
    if (!result.success) {
      return { success: false, error: result.error || "Failed to create room" };
    }
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, data: result.data, message: "Room created successfully" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to create room");
  }
}

/**
 * Update an existing room wise submission
 */
export async function updateRoomWiseSubmissionAction(
  id: number,
  payload: {
    propertyDetailsId?: number;
    propertyId?: number;
    lengthMtr?: number;
    widthMtr?: number;
    heightMtr?: number;
    areaSqMtr?: number;
    noOfRooms?: number;
    totalAreaSqMtr?: number;
    roomNo?: string;
    roomType?: string;
    roomTypeId?: number;  // API expects numeric ID
    shape?: string;
    outerYesNo?: boolean;
    minusYesNo?: boolean;
    submissionType?: string;
    base1Mtr?: number;
    base2Mtr?: number;
    roomWiseMinusData?: Array<{
      id?: number;
      roomWiseSubmissionId?: number;
      lengthMtr?: number;
      widthMtr?: number;
      heightMtr?: number;
      areaSqMtr?: number;
      shape?: string;
      base1Mtr?: number;
      base2Mtr?: number;
      operation?: string;
      remark?: string;
    }>;
  }
): Promise<ActionResult<unknown>> {
  try {
    const { updateRoomWiseSubmissionSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await updateRoomWiseSubmissionSafe(id, {
      isActive: true,
      updatedBy: 1, // TODO: Get from auth context
      id,
      ...payload,
      roomWiseMinusData: payload.roomWiseMinusData?.map(offset => ({
        isActive: true,
        updatedBy: 1,
        roomWiseSubmissionId: id,
        ...offset
      }))
    });
    if (!result.success) {
      return { success: false, error: result.error || "Failed to update room" };
    }
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, data: result.data, message: "Room updated successfully" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to update room");
  }
}

/**
 * Delete a room wise submission
 */
export async function deleteRoomWiseSubmissionAction(id: number): Promise<ActionResult<void>> {
  try {
    const { deleteRoomWiseSubmissionSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await deleteRoomWiseSubmissionSafe(id);
    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete room" };
    }
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, data: undefined, message: "Room deleted successfully" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to delete room");
  }
}

/**
 * Delete a room wise minus (offset)
 */
export async function deleteRoomWiseMinusAction(id: number): Promise<ActionResult<void>> {
  try {
    const { deleteRoomWiseMinusSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await deleteRoomWiseMinusSafe(id);
    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete offset" };
    }
    revalidatePath("/[locale]/property-tax/ptis/appartmentQC", "page");
    return { success: true, data: undefined, message: "Offset deleted successfully" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to delete offset");
  }
}

/**
 * Create a new room wise minus (offset)
 */
export async function createRoomWiseMinusAction(payload: {
  isActive: boolean;
  createdBy: number;
  roomWiseSubmissionId: number;
  lengthMtr?: number;
  widthMtr?: number;
  heightMtr?: number;
  areaSqMtr?: number;
  shape?: string;
  operation?: string;
  remark?: string;
  base1Mtr?: number;
  base2Mtr?: number;
}): Promise<ActionResult<{ id: number }>> {
  try {
    const { createRoomWiseMinusSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await createRoomWiseMinusSafe(payload);
    if (!result.success) {
      return { success: false, error: result.error || "Failed to create offset" };
    }
    return { success: true, data: { id: result.data?.id || 0 }, message: "Offset created successfully" };
  } catch (error: unknown) {
    return handleActionError(error, "Failed to create offset");
  }
}

/**
 * Delete room submission without redirect (for hook compatibility)
 */
export async function deleteRoomSubmissionNoRedirectAction(roomId: number | string): Promise<ActionResult<void>> {
  try {
    const { deleteRoomWiseSubmissionSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await deleteRoomWiseSubmissionSafe(Number(roomId));
    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete room" };
    }
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete room" };
  }
}

/**
 * Delete offset submission without redirect (for hook compatibility)
 */
export async function deleteOffsetSubmissionNoRedirectAction(offsetId: number | string): Promise<ActionResult<void>> {
  try {
    const { deleteRoomWiseMinusSafe } = await import("@/lib/api/appartmentQC-room.service");
    const result = await deleteRoomWiseMinusSafe(Number(offsetId));
    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete offset" };
    }
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete offset" };
  }
}

/* ============================================================
   OLD PROPERTY DATA ACTION
   Fetches historical data for an old property number
 ============================================================ */

/**
 * Fetch old property data by old property number.
 * 
 * @param oldPropertyNo - The old property number (e.g., "22")
 * @returns ActionResult with old property data
 */
export async function fetchOldPropertyDataAction(
  oldPropertyNo: string
): Promise<ActionResult<import("@/lib/api/appartmentQC.service").OldPropertyData>> {
  try {
    if (!oldPropertyNo || oldPropertyNo.trim() === "") {
      return { success: false, error: "Old property number is required" };
    }

    const { getOldPropertyDataLocalized } = await import("@/lib/api/appartmentQC.service");
    const data = await getOldPropertyDataLocalized(oldPropertyNo.trim());
    
    return {
      success: true,
      data,
      message: "Old property data fetched successfully"
    };
  } catch (error) {
    return handleActionError(error, "ptis.apartmentQC.errors.fetchOldPropertyFailed");
  }
}

/* ============================================================
   SYNC ROOMS ACTION
   Fires POST /ApartmentQC/{propertyDetailsId}/sync-rooms after a
   successful RoomWiseSubmission PUT to recompute aggregates.
 ============================================================ */

export async function syncRoomsForPropertyDetailsAction(
  propertyDetailsId: number | string
): Promise<ActionResult<void>> {
  try {
    const { syncRoomsForPropertyDetailsLocalized } = await import("@/lib/api/appartmentQC.service");
    await syncRoomsForPropertyDetailsLocalized(propertyDetailsId);
    return { success: true, message: "Rooms synced successfully" };
  } catch (error) {
    return handleActionError(error, "Failed to sync rooms");
  }
}
