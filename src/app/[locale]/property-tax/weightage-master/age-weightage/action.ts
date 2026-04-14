"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getAgeFactorCVMasterWithParams,
  updateAgeFactorCVMaster,
  createAgeFactorCVMaster,
  bulkCreateAgeFactorCVMaster,
  bulkUpdateAgeFactorCVMaster,
  deleteAgeFactorCVMaster,
  bulkDeleteAgeFactorCVMaster,
} from "@/lib/api/weightageMaster.service";
import { getConstructionPaged } from "@/lib/api/construction.services";
import { ApiError } from "@/lib/utils/api";
import {
  AgeFactorCVMaster,
  AgeFactorCVMasterCreate,
  AgeFactorCVMasterUpdate,
  BulkAgeFactorCVMasterCreate,
  BulkAgeFactorCVMasterUpdate,
  PagedResponse as MasterPagedResponse,
} from "@/types/weightageMaster.types";
import { ConstructionType, PagedResponse as ConstructionPagedResponse } from "@/types/construction.types";

/**
 * Fetch all AgeFactorCVMaster records to extract unique age ranges
 */
export async function fetchAllAgeFactorsAction(): Promise<AgeFactorCVMaster[]> {
  try {
    // Request a large page size to ensure we get all records for the missing records detection logic
    const response = await getAgeFactorCVMasterWithParams({ pageNumber: 1, pageSize: 10000 });
    if (response && response.success && response.data) {
      return response.data.items;
    }
    return [];
  } catch (error) {
    console.error("Error fetching all age factors:", error);
    return [];
  }
}

/**
 * Fetch paginated AgeFactorCVMaster records with filtering and sorting
 */
export async function fetchAgeFactorCVMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  selectedYearRange?: string,
  constructionTypeId?: number
): Promise<MasterPagedResponse<AgeFactorCVMaster>> {
  try {
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    if (
      pageNumber <= 0 ||
      pageSize <= 0 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new Error("Invalid pagination parameters");
    }

    const yearRangeParam =
      selectedYearRange && selectedYearRange.trim() !== "" ? Number(selectedYearRange.trim()) : undefined;

    const response = await getAgeFactorCVMasterWithParams({
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeCVId: yearRangeParam,
      constructionTypeId,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch AgeFactorCVMaster records");
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchAgeFactorCVMasterPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchAgeFactorCVMasterPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error(
        "[fetchAgeFactorCVMasterPagedServerAction] Unknown error:",
        error
      );
    }
    throw error;
  }
}

/**
 * Update AgeFactorCVMaster record
 */
export async function updateAgeFactorCVMasterAction(
  id: number,
  payload: AgeFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    console.log('[updateAgeFactorCVMasterAction] Starting update for ID:', id);
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid Age Factor CV Master ID',
        statusCode: 400,
      };
    }

    await updateAgeFactorCVMaster(id, payload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.responseText || 'API Error occurred',
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      return { 
        success: false, 
        message: error.message,
        statusCode: 500,
      };
    }
    return { 
      success: false, 
      message: "Failed to update AgeFactorCVMaster",
      statusCode: 500,
    };
  }
}

/**
 * Create AgeFactorCVMaster record
 */
export async function createAgeFactorCVMasterAction(
  payload: AgeFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const response = await createAgeFactorCVMaster(payload);
    if (response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.error || 'Failed to create record', statusCode: 500 };
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
    return { success: false, message: 'Unknown error', statusCode: 500 };
  }
}

/**
 * Bulk Create AgeFactorCVMaster records
 */
export async function bulkCreateAgeFactorCVMasterAction(
  payload: BulkAgeFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const response = await bulkCreateAgeFactorCVMaster(payload);
    if (response && response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response?.error || 'Failed to bulk create records', statusCode: 500 };
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
    return { success: false, message: 'Unknown error', statusCode: 500 };
  }
}

/**
 * Bulk Update AgeFactorCVMaster records
 */
export async function bulkUpdateAgeFactorCVMasterAction(
  payload: BulkAgeFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await bulkUpdateAgeFactorCVMaster(payload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
    }
    
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message, statusCode: 500 };
    }
    
    return { success: false, message: "Failed to bulk update AgeFactorCVMaster", statusCode: 500 };
  }
}

/**
 * Delete AgeFactorCVMaster record
 */
export async function deleteAgeFactorCVMasterAction(
    id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    try {
        const response = await deleteAgeFactorCVMaster(id);
        if (response.success) {
            for (const locale of locales) {
                revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
            }
            return { success: true };
        } else {
            return { success: false, message: response.error || 'Failed to delete record', statusCode: 500 };
        }
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
        }
        if (error instanceof Error) {
            return { success: false, message: error.message, statusCode: 500 };
        }
        return { success: false, message: 'Unknown error', statusCode: 500 };
    }
}

/**
 * Bulk Delete AgeFactorCVMaster records
 */
export async function bulkDeleteAgeFactorCVMasterAction(
    ids: number[]
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    try {
        const response = await bulkDeleteAgeFactorCVMaster(ids);
        if (response.success) {
            for (const locale of locales) {
                revalidatePath(`/${locale}/property-tax/weightage-master/age-weightage`, "page");
            }
            return { success: true };
        } else {
            return { success: false, message: response.error || 'Failed to bulk delete records', statusCode: 500 };
        }
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
        }
        if (error instanceof Error) {
            return { success: false, message: error.message, statusCode: 500 };
        }
        return { success: false, message: 'Unknown error', statusCode: 500 };
    }
}


/**
 * Fetch paginated ConstructionType records
 */
export async function fetchConstructionTypePagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<ConstructionPagedResponse<ConstructionType>> {
  try {
    return await getConstructionPaged(pageNumber, pageSize, searchTerm);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchConstructionTypePagedAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error("[fetchConstructionTypePagedAction] Error:", error.message);
    }
    throw error;
  }
}
