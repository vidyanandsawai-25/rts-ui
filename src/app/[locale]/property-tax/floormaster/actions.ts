"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";

import {
  getFloorPaged,
  createFloor,
  updateFloor,
  deleteFloor,
  getSubFloorPaged,
  createSubFloor,
  updateSubFloor,
  deleteSubFloor,
  ApiError,
} from "@/lib/api/floor.services";

import type {
  Floor,
  FloorFormModel,
  SubFloor,
  SubFloorFormModel,
  PagedResponse,
} from "@/types/floor.types";

/* ============================================================
   FLOOR PAGED (SEARCH + SORT)
============================================================ */
export async function fetchFloorPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<Floor>> {
  try {
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
      throw new Error("Invalid pagination parameters");
    }

    // ✅ allowed sorting columns
    const allowedSortColumns = ["floorCode", "description", "sequenceNo"];

    const validSortBy = sortBy && allowedSortColumns.includes(sortBy)
      ? sortBy
      : undefined;

    const validSortOrder =
      sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase())
        ? sortOrder.toLowerCase()
        : undefined;

    return await getFloorPaged(
      pageNumber,
      pageSize,
      searchTerm,
      validSortBy,
      validSortOrder
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchFloorPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchFloorPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error("[fetchFloorPagedServerAction] Unknown error:", error);
    }

    throw error;
  }
}

/* ============================================================
   CREATE FLOOR
============================================================ */
export async function createFloorAction(
  data: FloorFormModel
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {
  try {
    await createFloor(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/floor`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create floor" };
  }
}

/* ============================================================
   UPDATE FLOOR
============================================================ */
export async function updateFloorAction(
  data: FloorFormModel
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {
  try {
    await updateFloor(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/floor`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update floor" };
  }
}

/* ============================================================
   DELETE FLOOR
============================================================ */
export async function deleteFloorAction(
  floorId: number
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {

  if (!floorId || floorId <= 0) {
    return {
      success: false,
      messageKey: "messages.validFloorIdRequired",
      statusCode: 400,
    };
  }

  try {
    await deleteFloor(floorId);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/floor`, "page");
    }

    return {
      success: true,
      messageKey: "messages.deleteSuccess",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      messageKey: "messages.deleteFailed",
    };
  }
}

/* ============================================================
   SUBFLOOR PAGED
============================================================ */
export async function fetchSubFloorPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<SubFloor>> {
  try {
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
      throw new Error("Invalid pagination parameters");
    }

    const allowedSortColumns = ["subFloorCode", "description"];

    const validSortBy =
      sortBy && allowedSortColumns.includes(sortBy)
        ? sortBy
        : undefined;

    const validSortOrder =
      sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase())
        ? sortOrder.toLowerCase()
        : undefined;

    return await getSubFloorPaged(
      pageNumber,
      pageSize,
      searchTerm,
      validSortBy,
      validSortOrder
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchSubFloorPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchSubFloorPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error("[fetchSubFloorPagedServerAction] Unknown error:", error);
    }

    throw error;
  }
}

/* ============================================================
   CREATE SUBFLOOR
============================================================ */
export async function createSubFloorAction(
  data: SubFloorFormModel
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {
  try {
    await createSubFloor(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/subfloor`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create subfloor" };
  }
}

/* ============================================================
   UPDATE SUBFLOOR
============================================================ */
export async function updateSubFloorAction(
  data: SubFloorFormModel
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {
  try {
    await updateSubFloor(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/subfloor`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update subfloor" };
  }
}

/* ============================================================
   DELETE SUBFLOOR
============================================================ */
export async function deleteSubFloorAction(
  subFloorId: number
): Promise<{ success: boolean; message?: string; messageKey?: string; statusCode?: number }> {

  if (!subFloorId || subFloorId <= 0) {
    return {
      success: false,
      messageKey: "messages.validSubFloorIdRequired",
      statusCode: 400,
    };
  }

  try {
    await deleteSubFloor(subFloorId);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/floormaster/subfloor`, "page");
    }

    return {
      success: true,
      messageKey: "messages.deleteSuccess",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      messageKey: "messages.deleteFailed",
    };
  }
}