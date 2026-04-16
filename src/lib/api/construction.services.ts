import {
  ConstructionType,
  ConstructionTypeCreatePayload,
  ConstructionTypeFormModel,
} from "@/types/construction.types";
import { ApiError } from "@/lib/utils/api";
import { apiClient } from "@/services/api.service";
import { PagedResponse } from "@/types/common.types";

/**
 * Type guard for PagedResponse<ConstructionType>
 */
function isPagedResponse(value: unknown): value is PagedResponse<ConstructionType> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.items) &&
    typeof obj.totalCount === "number" &&
    typeof obj.pageNumber === "number" &&
    typeof obj.pageSize === "number" &&
    typeof obj.totalPages === "number" &&
    typeof obj.hasPrevious === "boolean" &&
    typeof obj.hasNext === "boolean"
  );
}

/**
 * Type guard for ConstructionType - validates structure before normalization
 * Note: This is a loose guard; use normalizeConstructionType for strict validation
 */
function isConstructionTypeShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;

  // Must have a valid ID field (> 0)
  if (!("constructionTypeId" in obj)) {
    return false;
  }
  const { constructionTypeId } = obj;
  return typeof constructionTypeId === "number" && Number.isFinite(constructionTypeId) && constructionTypeId > 0;
}

/**
 * Normalizes and validates a construction type object
 * @throws ApiError if required fields are missing or invalid
 */
function normalizeConstructionType(data: Record<string, unknown>): ConstructionType {
  // Validate required ID field
  const constructionTypeId = Number(data.constructionTypeId);
  if (!Number.isFinite(constructionTypeId) || constructionTypeId <= 0) {
    throw new ApiError(
      500,
      "Invalid data received from server",
      `Invalid constructionTypeId: ${data.constructionTypeId}`
    );
  }

  // Validate required string fields
  const constructionCode = String(data.constructionCode ?? "").trim();
  if (!constructionCode) {
    throw new ApiError(
      500,
      "Invalid data received from server",
      "Missing required field: constructionCode"
    );
  }

  const description = String(data.description ?? "").trim();
  if (!description) {
    throw new ApiError(
      500,
      "Invalid data received from server",
      "Missing required field: description"
    );
  }

  // Normalize optional fields with safe defaults
  const searchSequence = Number(data.searchSequence);

  // Validate createdDate - it's required from the backend
  const createdDateStr = String(data.createdDate ?? "").trim();
  if (!createdDateStr) {
    throw new ApiError(
      500,
      "Invalid data received from server",
      "Missing required field: createdDate"
    );
  }

  return {
    constructionTypeId,
    constructionCode,
    description,
    searchSequence: Number.isFinite(searchSequence) ? searchSequence : 0,
    isActive: Boolean(data.isActive),
    createdDate: createdDateStr,
    updatedDate: data.updatedDate != null ? String(data.updatedDate) : null,
  };
}
/**
 * Fetches all construction types from the API
 *
 * @returns Promise resolving to array of ConstructionType objects
 * @throws ApiError if API request fails or data is invalid
 *
 * @example
 * const types = await getConstruction();
 * if (types.length === 0) console.log("No construction types found");
 */
export async function getConstruction(): Promise<ConstructionType[]> {
  try {
    const response = await apiClient.get<unknown>("/ConstructionType");

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "Failed to fetch construction types",
        "Fetch construction types failed"
      );
    }

    const data = response.data;

    // ✅ Supports API responses that return either:
    // 1) a direct array of construction types
    // 2) a paginated response with `items`
    let items: unknown[];

    if (Array.isArray(data)) {
      items = data;
    } else if (isPagedResponse(data)) {
      items = data.items;
    } else {
      throw new ApiError(
        500,
        "Invalid response format",
        "Expected array or PagedResponse but received unexpected format"
      );
    }

    // Filter and normalize items
    const validItems = items.filter(isConstructionTypeShape);
    return validItems.map(normalizeConstructionType);
  } catch (error) {
    console.error("Error fetching construction types:", error);
    throw error;
  }
}

export async function getConstructionPaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<ConstructionType>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (typeof searchTerm === "string") {
      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.length > 0) {
        const MAX_SEARCH_TERM_LENGTH = 100;
        const safeSearchTerm = trimmedSearchTerm.slice(0, MAX_SEARCH_TERM_LENGTH);
        params.append("SearchTerm", safeSearchTerm);
      }
    }

    // Add sort parameters if provided
    if (typeof sortBy === "string" && sortBy.trim()) {
      params.append("SortBy", sortBy.trim());
    }
    if (typeof sortOrder === "string" && sortOrder.trim()) {
      params.append("SortOrder", sortOrder.trim());
    }

    const response = await apiClient.get<PagedResponse<ConstructionType>>(
      `/ConstructionType?${params.toString()}`
    );

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "Failed to fetch construction types",
        "Fetch construction types (paged) failed"
      );
    }

    const data = response.data;

    if (!isPagedResponse(data)) {
      throw new ApiError(
        500,
        "Invalid response format",
        "Expected PagedResponse but received unexpected format"
      );
    }

    // Normalize and validate each item for type safety
    // This ensures the items conform to ConstructionType structure regardless of backend changes
    const validItems = data.items.filter(isConstructionTypeShape);
    const normalizedItems = validItems.map(normalizeConstructionType);

    return {
      ...data,
      items: normalizedItems,
    };
  } catch (error) {
    console.error("Error fetching paged construction types:", error);
    throw error;
  }
}
/**
 * Fetches a single construction type by ID
 *
 * @param constructionId The construction type ID (must be a positive number)
 * @returns Promise resolving to a ConstructionType object
 * @throws ApiError if ID is invalid, not found, or fetch fails
 *
 * @example
 * try {
 *   const type = await getConstructionTypeById(5);
 * } catch (error) {
 *   if (error instanceof ApiError && error.statusCode === 404) {
 *     console.log("Type not found");
 *   }
 * }
 */

export async function getConstructionTypeById(
  constructionId: number
): Promise<ConstructionType> {
  try {
    // ✅ Correct validation for number ID
    if (!Number.isFinite(constructionId) || constructionId <= 0) {
      throw new ApiError(
        400,
        "Valid Construction ID is required",
        "Invalid construction ID"
      );
    }

    const response = await apiClient.get<unknown>(
      `/ConstructionType/${encodeURIComponent(String(constructionId))}`
    );

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "Failed to fetch construction type",
        `Fetch construction type ${constructionId} failed`
      );
    }

    const data = response.data;

    if (!isConstructionTypeShape(data)) {
      throw new ApiError(
        500,
        "Invalid response format",
        "Expected ConstructionType but received unexpected format"
      );
    }

    // Normalize and validate the data
    return normalizeConstructionType(data);
  } catch (error) {
    console.error(
      `Error fetching construction type ${constructionId}:`,
      error
    );
    throw error;
  }
}

/**
 * Creates a new construction type
 *
 * @param data Form data containing construction type details
 * @throws Error if validation fails (missing required fields)
 * @throws ApiError if API request fails
 *
 * @example
 * await createConstructionType({
 *   constructionCode: "CT001",
 *   description: "Wood Frame",
 *   searchSequence: 1,
 *   isActive: true
 * });
 */
export async function createConstructionType(
  data: ConstructionTypeFormModel
): Promise<void> {
  try {
    // Validate required fields
    if (!data.constructionCode?.trim()) {
      throw new Error("constructionCode is required");
    }
    if (!data.description?.trim()) {
      throw new Error("description is required");
    }

    // Build payload - Backend handles: constructionId, createdDate, updatedDate
    const payload: ConstructionTypeCreatePayload = {
      constructionCode: data.constructionCode.trim(),
      description: data.description.trim(),
      searchSequence: Number(data.searchSequence) || 0,
      isActive: data.isActive,
      createdBy: 1, // TODO: Get from auth context - getCurrentUserId(),
    };

    const response = await apiClient.post<unknown>("/ConstructionType", payload);

    if (!response.success) {
      // Detect duplicate error from backend message
      const errorMsg = response.error || "";
      const isDuplicate =
        errorMsg.toLowerCase().includes("already exists") ||
        errorMsg.toLowerCase().includes("duplicate");

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || "Failed to create construction type",
        "Create construction type failed"
      );
    }

    // Check if response data contains error (backend returns 200 with error in message)
    const responseData = response.data as Record<string, unknown> | null;
    if (responseData && typeof responseData === 'object') {
      const { message: rawMessage, error: rawError } = responseData as {
        message?: unknown;
        error?: unknown;
      };
      const messageValue = rawMessage ?? rawError;
      
      if (typeof messageValue === 'string' && messageValue) {
        const message = messageValue;
        const lowerMsg = message.toLowerCase();

        // Only throw error if message indicates an actual error
        const isErrorMessage =
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("duplicate") ||
          lowerMsg.includes("error") ||
          lowerMsg.includes("failed") ||
          lowerMsg.includes("invalid") ||
          lowerMsg.includes("not found");

        // Skip success messages like "Record inserted successfully"
        const isSuccessMessage =
          lowerMsg.includes("success") ||
          lowerMsg.includes("created") ||
          lowerMsg.includes("inserted");

        if (isErrorMessage && !isSuccessMessage) {
          const isDuplicate =
            lowerMsg.includes("already exists") ||
            lowerMsg.includes("duplicate");

          throw new ApiError(
            isDuplicate ? 409 : 400,
            message,
            "Create construction type failed"
          );
        }
      }
    }
  } catch (error) {
    console.error("Error creating construction type:", error);
    throw error;
  }
}

/**
 * Updates an existing construction type
 *
 * @param data Form data with updated details (must include valid id)
 * @throws Error if ID is missing, invalid, or required fields are empty
 * @throws ApiError if API request fails
 *
 * @example
 * await updateConstructionType({
 *   constructionTypeId: 5,
 *   constructionCode: "CT001",
 *   description: "Steel Frame",
 *   searchSequence: 2,
 *   isActive: true
 * });
 */

export async function updateConstructionType(
  data: ConstructionTypeFormModel
): Promise<void> {
  try {
    // Validate required fields
    if (!data.constructionTypeId || data.constructionTypeId <= 0) {
      throw new Error("Construction ID is required for update");
    }
    if (!data.constructionCode?.trim()) {
      throw new Error("constructionCode is required");
    }
    if (!data.description?.trim()) {
      throw new Error("description is required");
    }

    const payload = {
      constructionTypeId: data.constructionTypeId,
      constructionCode: data.constructionCode.trim(),
      description: data.description.trim(),
      searchSequence: Number(data.searchSequence) || 0,
      isActive: data.isActive,

      // REQUIRED BY BACKEND
      updatedBy: data.updatedBy ?? 1, // TODO: Get from auth context
    };

    const response = await apiClient.put<unknown>(
      `/ConstructionType/${encodeURIComponent(String(data.constructionTypeId))}`,
      payload
    );

    if (!response.success) {
      // Detect duplicate error from backend message
      const errorMsg = response.error || "";
      const isDuplicate =
        errorMsg.toLowerCase().includes("already exists") ||
        errorMsg.toLowerCase().includes("duplicate");

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || "Failed to update construction type",
        "Update construction type failed"
      );
    }

    // Check if response data contains error (backend returns 200 with error in message)
    const responseData = response.data as Record<string, unknown> | null;
    if (responseData && typeof responseData === 'object') {
      const { message: rawMessage, error: rawError } = responseData as {
        message?: unknown;
        error?: unknown;
      };
      const messageValue = rawMessage ?? rawError;
      
      if (typeof messageValue === 'string' && messageValue) {
        const message = messageValue;
        const lowerMsg = message.toLowerCase();

        // Only throw error if message indicates an actual error
        const isErrorMessage =
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("duplicate") ||
          lowerMsg.includes("error") ||
          lowerMsg.includes("failed") ||
          lowerMsg.includes("invalid") ||
          lowerMsg.includes("not found");

        // Skip success messages like "Record updated successfully"
        const isSuccessMessage =
          lowerMsg.includes("success") ||
          lowerMsg.includes("updated") ||
          lowerMsg.includes("modified");

        if (isErrorMessage && !isSuccessMessage) {
          const isDuplicate =
            lowerMsg.includes("already exists") ||
            lowerMsg.includes("duplicate");

          throw new ApiError(
            isDuplicate ? 409 : 400,
            message,
            "Update construction type failed"
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating construction type:", error);
    throw error;
  }
}

/**
 * Deletes a construction type by ID
 *
 * @param constructionTypeId The numeric ID of the construction type to delete
 * @throws Error if ID is missing or empty
 * @throws ApiError if API request fails
 *
 * @example
 * await deleteConstructionType(1);
 */
export async function deleteConstructionType(
  constructionTypeId: number
): Promise<void> {
  try {
    if (constructionTypeId <= 0) {
      throw new Error("Valid constructionTypeId is required");
    }

    const response = await apiClient.delete<void>(
      `/ConstructionType/${encodeURIComponent(String(constructionTypeId))}`
    );

    if (!response.success) {
      // Infer status code from error message to provide accurate error handling
      const errorMsg = (response.error || "").toLowerCase();
      let statusCode = 500; // Default to server error

      if (errorMsg.includes("not found") || errorMsg.includes("does not exist")) {
        statusCode = 404; // Not Found
      } else if (
        errorMsg.includes("in use") ||
        errorMsg.includes("linked") ||
        errorMsg.includes("referenced") ||
        errorMsg.includes("associated") ||
        errorMsg.includes("cannot delete")
      ) {
        statusCode = 409; // Conflict - record in use
      } else if (
        errorMsg.includes("invalid") ||
        errorMsg.includes("bad request")
      ) {
        statusCode = 400; // Bad Request
      }

      throw new ApiError(
        statusCode,
        response.error || "Failed to delete construction type",
        `Delete construction type ${constructionTypeId} failed`
      );
    }
  } catch (error) {
    console.error(
      `Error deleting construction type ${constructionTypeId}:`,
      error
    );
    throw error;
  }
}

/**
 * Searches construction types by construction ID or description (client-side)
 *
 * @param query Search term to match
 * @returns Promise resolving to filtered array of matching ConstructionType objects
 * @throws ApiError if API request fails
 *
 * @example
 * const results = await searchConstructionTypes("wood");
 */
export async function searchConstructionTypes(
  query: string
): Promise<ConstructionType[]> {
  // Validate input
  if (!query?.trim()) {
    return [];
  }

  const list = await getConstruction();
  const searchQuery = query.toLowerCase();

  return list.filter(
    (item) =>
      item.constructionCode?.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery)
  );
}

