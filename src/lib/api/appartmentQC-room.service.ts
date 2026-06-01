/**
 * ApartmentQC Room Service
 * 
 * API services for Room Wise Submission and Room Wise Minus (Offset) operations
 * for the Apartment QC module.
 * 
 * Endpoints:
 * - GET    /api/RoomWiseSubmission?PropertyId={}&PropertyDetailsId={}
 * - POST   /api/RoomWiseSubmission
 * - PUT    /api/RoomWiseSubmission/{id}
 * - DELETE /api/RoomWiseSubmission/{id}
 * - PUT    /api/RoomWiseMinus/{id}
 * - DELETE /api/RoomWiseMinus/{id}
 */

import { apiClient } from "@/services/api.service";
import { ApiError, handleApiResponse } from "@/lib/utils/api";

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/* ============================================================
   TYPES / INTERFACES
============================================================ */

// Room Wise Submission types
export interface RoomWiseMinusData {
  id?: number;
  roomWiseSubmissionId?: number;
  lengthMtr?: number;
  widthMtr?: number;
  heightMtr?: number;
  areaSqMtr?: number;
  shape?: string;
  base1Mtr?: number;
  base2Mtr?: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  operation?: string;  // 'add' or 'subtract'
  remark?: string;     // 'ADD' or 'SUB' - stored in backend
}

export interface RoomWiseSubmissionData {
  id?: number;
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
  roomTypeId?: number;  // API expects numeric ID for room type
  shape?: string;
  outerYesNo?: boolean;
  minusYesNo?: boolean;
  submissionType?: string;
  base1Mtr?: number;
  base2Mtr?: number;
  isActive?: boolean;
  createdBy?: number;
  updatedBy?: number;
  roomWiseMinusData?: RoomWiseMinusData[];
}

export interface RoomWiseSubmissionCreatePayload {
  isActive: boolean;
  createdBy: number;
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
  roomTypeId?: number;  // API expects numeric ID for room type
  shape?: string;
  outerYesNo?: boolean;
  minusYesNo?: boolean;
  submissionType?: string;
  base1Mtr?: number;
  base2Mtr?: number;
  roomWiseMinusData?: Array<{
    isActive: boolean;
    createdBy: number;
    roomWiseSubmissionId?: number;
    lengthMtr?: number;
    widthMtr?: number;
    heightMtr?: number;
    areaSqMtr?: number;
    shape?: string;
    operation?: string;  // ADD or SUB
    remark?: string;     // Stores operation type
    base1Mtr?: number;
    base2Mtr?: number;
  }>;
}

export interface RoomWiseSubmissionUpdatePayload {
  isActive: boolean;
  updatedBy: number;
  id: number;
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
  roomTypeId?: number;  // API expects numeric ID for room type
  shape?: string;
  outerYesNo?: boolean;
  minusYesNo?: boolean;
  submissionType?: string;
  base1Mtr?: number;
  base2Mtr?: number;
  roomWiseMinusData?: Array<{
    isActive: boolean;
    createdBy?: number;  // For new offsets
    updatedBy?: number;  // For existing offsets
    id?: number;
    roomWiseSubmissionId?: number;
    lengthMtr?: number;
    widthMtr?: number;
    heightMtr?: number;
    areaSqMtr?: number;
    shape?: string;
    operation?: string;  // ADD or SUB
    remark?: string;     // Stores operation type
    base1Mtr?: number;
    base2Mtr?: number;
  }>;
}

export interface RoomWiseMinusUpdatePayload {
  isActive: boolean;
  updatedBy: number;
  id: number;
  roomWiseSubmissionId?: number;
  lengthMtr?: number;
  widthMtr?: number;
  heightMtr?: number;
  areaSqMtr?: number;
  shape?: string;
  base1Mtr?: number;
  base2Mtr?: number;
}

/* ============================================================
   API FUNCTIONS
============================================================ */

/**
 * GET Room Wise Submissions
 * Fetch room submissions filtered by propertyId and/or propertyDetailsId (pdnId)
 */
export async function getRoomWiseSubmissions(params: {
  propertyId?: number;
  propertyDetailsId?: number;
  pageNumber?: number;
  pageSize?: number;
}): Promise<RoomWiseSubmissionData[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.propertyId) queryParams.set("PropertyId", String(params.propertyId));
    if (params.propertyDetailsId) queryParams.set("PropertyDetailsId", String(params.propertyDetailsId));
    if (params.pageNumber) queryParams.set("PageNumber", String(params.pageNumber));
    if (params.pageSize) queryParams.set("PageSize", String(params.pageSize));

    const url = `/RoomWiseSubmission?${queryParams.toString()}`;
    const response = await apiClient.get<{ items?: RoomWiseSubmissionData[]; data?: RoomWiseSubmissionData[] } | RoomWiseSubmissionData[]>(url);
    
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch room submissions",
        "Get room submissions failed"
      );
    }
    
    const data = handleApiResponse(response, "Failed to fetch room submissions");
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    }
    return data.items || data.data || [];
  } catch (error) {
    console.error('[appartmentQC-room.service] Error fetching room submissions:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to fetch room submissions"
    );
  }
}

/**
 * Safe wrapper for getRoomWiseSubmissions - never throws
 */
export async function getRoomWiseSubmissionsSafe(params: {
  propertyId?: number;
  propertyDetailsId?: number;
  pageNumber?: number;
  pageSize?: number;
}): Promise<RoomWiseSubmissionData[]> {
  try {
    return await getRoomWiseSubmissions(params);
  } catch (error) {
    console.error("[getRoomWiseSubmissionsSafe] Error:", getErrorMessage(error));
    return [];
  }
}

/**
 * POST - Create a new Room Wise Submission
 */
export async function createRoomWiseSubmission(
  payload: RoomWiseSubmissionCreatePayload
): Promise<RoomWiseSubmissionData> {
  try {
    const response = await apiClient.post<RoomWiseSubmissionData>("/RoomWiseSubmission", payload);
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to create room submission",
        "Create room submission failed"
      );
    }
    return handleApiResponse(response, "Failed to create room submission");
  } catch (error) {
    console.error('[appartmentQC-room.service] Error creating room submission:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to create room submission"
    );
  }
}

/**
 * Safe wrapper for createRoomWiseSubmission
 */
export async function createRoomWiseSubmissionSafe(
  payload: RoomWiseSubmissionCreatePayload
): Promise<{ success: boolean; data?: RoomWiseSubmissionData; error?: string }> {
  try {
    const data = await createRoomWiseSubmission(payload);
    return { success: true, data };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[createRoomWiseSubmissionSafe] Error:", message);
    return { success: false, error: message };
  }
}

/**
 * PUT - Update an existing Room Wise Submission
 */
export async function updateRoomWiseSubmission(
  id: number,
  payload: RoomWiseSubmissionUpdatePayload
): Promise<RoomWiseSubmissionData> {
  try {
    const response = await apiClient.put<RoomWiseSubmissionData>(`/RoomWiseSubmission/${id}`, payload);
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to update room submission",
        "Update room submission failed"
      );
    }
    return handleApiResponse(response, "Failed to update room submission");
  } catch (error) {
    console.error('[appartmentQC-room.service] Error updating room submission:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to update room submission"
    );
  }
}

/**
 * Safe wrapper for updateRoomWiseSubmission
 */
export async function updateRoomWiseSubmissionSafe(
  id: number,
  payload: RoomWiseSubmissionUpdatePayload
): Promise<{ success: boolean; data?: RoomWiseSubmissionData; error?: string }> {
  try {
    const data = await updateRoomWiseSubmission(id, payload);
    return { success: true, data };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[updateRoomWiseSubmissionSafe] Error:", message);
    return { success: false, error: message };
  }
}

/**
 * DELETE - Delete a Room Wise Submission
 */
export async function deleteRoomWiseSubmission(id: number): Promise<void> {
  try {
    await apiClient.delete(`/RoomWiseSubmission/${id}`);
  } catch (error) {
    console.error('[appartmentQC-room.service] Error deleting room submission:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to delete room submission"
    );
  }
}

/**
 * Safe wrapper for deleteRoomWiseSubmission
 */
export async function deleteRoomWiseSubmissionSafe(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteRoomWiseSubmission(id);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[deleteRoomWiseSubmissionSafe] Error:", message);
    return { success: false, error: message };
  }
}

/**
 * PUT - Update a Room Wise Minus (Offset)
 */
export async function updateRoomWiseMinus(
  id: number,
  payload: RoomWiseMinusUpdatePayload
): Promise<RoomWiseMinusData> {
  try {
    const response = await apiClient.put<RoomWiseMinusData>(`/RoomWiseMinus/${id}`, payload);
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to update room offset",
        "Update room offset failed"
      );
    }
    return handleApiResponse(response, "Failed to update room offset");
  } catch (error) {
    console.error('[appartmentQC-room.service] Error updating room offset:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to update room offset"
    );
  }
}

/**
 * Safe wrapper for updateRoomWiseMinus
 */
export async function updateRoomWiseMinusSafe(
  id: number,
  payload: RoomWiseMinusUpdatePayload
): Promise<{ success: boolean; data?: RoomWiseMinusData; error?: string }> {
  try {
    const data = await updateRoomWiseMinus(id, payload);
    return { success: true, data };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[updateRoomWiseMinusSafe] Error:", message);
    return { success: false, error: message };
  }
}

/**
 * POST - Create a new Room Wise Minus (Offset)
 */
export interface RoomWiseMinusCreatePayload {
  isActive: boolean;
  createdBy: number;
  roomWiseSubmissionId: number;
  lengthMtr?: number;
  widthMtr?: number;
  heightMtr?: number;
  areaSqMtr?: number;
  shape?: string;
  operation?: string;  // 'add' or 'subtract'
  remark?: string;     // 'ADD' or 'SUB'
  base1Mtr?: number;
  base2Mtr?: number;
}

export async function createRoomWiseMinus(
  payload: RoomWiseMinusCreatePayload
): Promise<RoomWiseMinusData> {
  try {
    const response = await apiClient.post<RoomWiseMinusData>(`/RoomWiseMinus`, payload);
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to create room offset",
        "Create room offset failed"
      );
    }
    return handleApiResponse(response, "Failed to create room offset");
  } catch (error) {
    console.error('[appartmentQC-room.service] Error creating room offset:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to create room offset"
    );
  }
}

/**
 * Safe wrapper for createRoomWiseMinus
 */
export async function createRoomWiseMinusSafe(
  payload: RoomWiseMinusCreatePayload
): Promise<{ success: boolean; data?: RoomWiseMinusData; error?: string }> {
  try {
    const data = await createRoomWiseMinus(payload);
    return { success: true, data };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[createRoomWiseMinusSafe] Error:", message);
    return { success: false, error: message };
  }
}

/**
 * DELETE - Delete a Room Wise Minus (Offset)
 */
export async function deleteRoomWiseMinus(id: number): Promise<void> {
  try {
    await apiClient.delete(`/RoomWiseMinus/${id}`);
  } catch (error) {
    console.error('[appartmentQC-room.service] Error deleting room offset:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error instanceof Error ? error.message : String(error),
      "Failed to delete room offset"
    );
  }
}

/**
 * Safe wrapper for deleteRoomWiseMinus
 */
export async function deleteRoomWiseMinusSafe(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteRoomWiseMinus(id);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[deleteRoomWiseMinusSafe] Error:", message);
    return { success: false, error: message };
  }
}
