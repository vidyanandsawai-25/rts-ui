import { apiClient } from "@/services/api.service";
import {
  Floor,
  FloorFormModel,
  SubFloor,
  SubFloorFormModel,
  PagedResponse,
} from "@/types/floor.types";

/* ============================================================
   API ERROR (SINGLE)
============================================================ */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public responseText: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ============================================================
   TYPE GUARDS
============================================================ */

function isPagedResponse<T>(value: unknown): value is PagedResponse<T> {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    Array.isArray(obj.items) &&
    typeof obj.totalCount === "number" &&
    typeof obj.pageNumber === "number" &&
    typeof obj.pageSize === "number"
  );
}

function isFloorShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "floorId" in value;
}

function isSubFloorShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "subFloorId" in value;
}

/* ============================================================
   NORMALIZERS
============================================================ */

function normalizeFloor(data: Record<string, unknown>): Floor {
  const floorId = Number(data.floorId);

  if (!Number.isFinite(floorId) || floorId <= 0) {
    throw new ApiError(500, "Invalid data", "Invalid floorId");
  }

  const floorCode = typeof data.floorCode === "string" ? data.floorCode.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";

  if (!floorCode) {
    throw new ApiError(500, "Invalid data", "Missing floorCode");
  }

  return {
    floorId,
    floorCode,
    description,
    sequenceNo: Number(data.sequenceNo) || 0,
    isActive: Boolean(data.isActive),
    createdDate: typeof data.createdDate === "string" ? data.createdDate : "",
    updatedDate: typeof data.updatedDate === "string" ? data.updatedDate : null,
  };
}

function normalizeSubFloor(data: Record<string, unknown>): SubFloor {
  const subFloorId = Number(data.subFloorId);

  if (!Number.isFinite(subFloorId) || subFloorId <= 0) {
    throw new ApiError(500, "Invalid data", "Invalid subFloorId");
  }

  const subFloorCode = typeof data.subFloorCode === "string" ? data.subFloorCode.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";

  if (!subFloorCode) {
    throw new ApiError(500, "Invalid data", "Missing subFloorCode");
  }

  return {
    subFloorId,
    subFloorCode,
    description,
    isActive: Boolean(data.isActive),
    createdDate: typeof data.createdDate === "string" ? data.createdDate : "",
    updatedDate: typeof data.updatedDate === "string" ? data.updatedDate : null,
  };
}

/* ============================================================
   FLOOR APIs
============================================================ */

export async function getFloorPaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<Floor>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) {
      params.append("SearchTerm", searchTerm.trim().slice(0, 100));
    }

    if (sortBy?.trim()) params.append("SortBy", sortBy.trim());
    if (sortOrder?.trim()) params.append("SortOrder", sortOrder.trim());

    const response = await apiClient.get<unknown>(
      `/Floor?${params.toString()}`
    );

    if (!response.success) {
      throw new ApiError(500, response.error || "", "Fetch floor failed");
    }

    if (!isPagedResponse<Floor>(response.data)) {
      throw new ApiError(500, "Invalid format", "Invalid floor response");
    }

    const items = response.data.items
      .filter(isFloorShape)
      .map(normalizeFloor);

    return { ...response.data, items };
  } catch (err) {
    console.error("Error fetching floors:", err);
    throw err;
  }
}

export async function getFloorById(floorId: number): Promise<Floor> {
  try {
    if (!floorId || floorId <= 0) {
      throw new Error("Valid Floor ID is required");
    }

    const response = await apiClient.get<unknown>(`/Floor/${floorId}`);

    if (!response.success) {
      throw new ApiError(500, response.error || "", "Fetch floor by ID failed");
    }

    if (!isFloorShape(response.data)) {
      throw new ApiError(500, "Invalid format", "Invalid floor response");
    }

    return normalizeFloor(response.data);
  } catch (err) {
    console.error("Error fetching floor by ID:", err);
    throw err;
  }
}

export async function createFloor(data: FloorFormModel): Promise<void> {
  try {
    if (!data.floorCode?.trim()) throw new Error("floorCode required");
    if (!data.description?.trim()) throw new Error("description required");

    const payload = {
      floorCode: data.floorCode.trim(),
      description: data.description.trim(),
      sequenceNo: Number(data.sequenceNo) || 0,
      isActive: data.isActive,
      createdBy: 1,
    };

    const response = await apiClient.post("/Floor", payload);

    if (!response.success) {
      const msg = (response.error || "").toLowerCase();
      throw new ApiError(
        msg.includes("duplicate") ? 409 : 500,
        response.error || "",
        "Create floor failed"
      );
    }
  } catch (err) {
    console.error("Create floor error:", err);
    throw err;
  }
}

export async function updateFloor(data: FloorFormModel): Promise<void> {
  try {
    if (!data.floorId || data.floorId <= 0) {
      throw new Error("Floor ID required");
    }

    const payload = {
      floorId: data.floorId,
      floorCode: data.floorCode.trim(),
      description: data.description.trim(),
      sequenceNo: Number(data.sequenceNo) || 0,
      isActive: data.isActive,
      updatedBy: 1,
    };

    const response = await apiClient.put(
      `/Floor/${data.floorId}`,
      payload
    );

    if (!response.success) {
      throw new ApiError(500, response.error || "", "Update floor failed");
    }
  } catch (err) {
    console.error("Update floor error:", err);
    throw err;
  }
}

export async function deleteFloor(floorId: number): Promise<void> {
  try {
    if (floorId <= 0) throw new Error("Valid Floor ID required");

    const response = await apiClient.delete(`/Floor/${floorId}`);

    if (!response.success) {
      const msg = (response.error || "").toLowerCase();

      let code = 500;
      if (msg.includes("not found")) code = 404;
      if (msg.includes("in use")) code = 409;

      throw new ApiError(code, response.error || "", "Delete floor failed");
    }
  } catch (err) {
    console.error("Delete floor error:", err);
    throw err;
  }
}

/* ============================================================
   SUBFLOOR APIs
============================================================ */

export async function getSubFloorPaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<SubFloor>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (searchTerm?.trim()) {
      params.append("SearchTerm", searchTerm.trim().slice(0, 100));
    }

    if (sortBy?.trim()) params.append("SortBy", sortBy.trim());
    if (sortOrder?.trim()) params.append("SortOrder", sortOrder.trim());

    const response = await apiClient.get<unknown>(
      `/SubFloor?${params.toString()}`
    );

    if (!response.success) {
      throw new ApiError(500, response.error || "", "Fetch subfloor failed");
    }

    if (!isPagedResponse<SubFloor>(response.data)) {
      throw new ApiError(500, "Invalid format", "Invalid subfloor response");
    }

    const items = response.data.items
      .filter(isSubFloorShape)
      .map(normalizeSubFloor);

    return { ...response.data, items };
  } catch (err) {
    console.error("Error fetching subfloors:", err);
    throw err;
  }
}

export async function getSubFloorById(subFloorId: number): Promise<SubFloor> {
  try {
    if (!subFloorId || subFloorId <= 0) {
      throw new Error("Valid SubFloor ID is required");
    }

    const response = await apiClient.get<unknown>(`/SubFloor/${subFloorId}`);

    if (!response.success) {
      throw new ApiError(500, response.error || "", "Fetch subfloor by ID failed");
    }

    if (!isSubFloorShape(response.data)) {
      throw new ApiError(500, "Invalid format", "Invalid subfloor response");
    }

    return normalizeSubFloor(response.data);
  } catch (err) {
    console.error("Error fetching subfloor by ID:", err);
    throw err;
  }
}

export async function createSubFloor(data: SubFloorFormModel): Promise<void> {
  try {
    if (!data.subFloorCode?.trim()) {
      throw new Error("subFloorCode required");
    }
    if (!data.description?.trim()) {
      throw new Error("description required");
    }

    const payload = {
      subFloorCode: data.subFloorCode.trim(),
      description: data.description.trim(),
      isActive: data.isActive,
      createdBy: 1,
    };

    const response = await apiClient.post("/SubFloor", payload);

    if (!response.success) {
      const msg = (response.error || "").toLowerCase();
      throw new ApiError(
        msg.includes("duplicate") ? 409 : 500,
        response.error || "",
        "Create subfloor failed"
      );
    }
  } catch (err) {
    console.error("Create subfloor error:", err);
    throw err;
  }
}

export async function updateSubFloor(
  data: SubFloorFormModel
): Promise<void> {
  try {
    if (!data.subFloorId || data.subFloorId <= 0) {
      throw new Error("SubFloor ID required");
    }

    const payload = {
      subFloorId: data.subFloorId,
      subFloorCode: data.subFloorCode.trim(),
      description: data.description.trim(),
      isActive: data.isActive,
      updatedBy: 1,
    };

    const response = await apiClient.put(
      `/SubFloor/${data.subFloorId}`,
      payload
    );

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "",
        "Update subfloor failed"
      );
    }
  } catch (err) {
    console.error("Update subfloor error:", err);
    throw err;
  }
}

export async function deleteSubFloor(
  subFloorId: number
): Promise<void> {
  try {
    if (subFloorId <= 0) {
      throw new Error("Valid SubFloor ID required");
    }

    const response = await apiClient.delete(
      `/SubFloor/${subFloorId}`
    );

    if (!response.success) {
      const msg = (response.error || "").toLowerCase();

      let code = 500;
      if (msg.includes("not found")) code = 404;
      if (msg.includes("in use")) code = 409;

      throw new ApiError(
        code,
        response.error || "",
        "Delete subfloor failed"
      );
    }
  } catch (err) {
    console.error("Delete subfloor error:", err);
    throw err;
  }
}