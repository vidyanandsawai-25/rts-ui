"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  getAgeFactorCVMasterWithParams,
  updateAgeFactorCVMaster,
  createAgeFactorCVMaster,
  bulkCreateAgeFactorCVMaster,
  bulkUpdateAgeFactorCVMaster,
  deleteAgeFactorCVMaster,
  bulkDeleteAgeFactorCVMaster,
} from "@/lib/api/weightageMaster.service";

import { ApiError } from "@/lib/utils/api";
import {
  AgeFactorCVMaster,
  AgeFactorCVMasterCreate,
  AgeFactorCVMasterUpdate,
  BulkAgeFactorCVMasterCreate,
  BulkAgeFactorCVMasterUpdate,
  PagedResponse as MasterPagedResponse,
} from "@/types/ageFactorCv.types";
import { ConstructionType } from "@/types/construction.types";
import { getConstructionPaged } from "@/lib/api/construction-crud.service";
import { PagedResponse } from "@/types/common.types";


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
  } catch (_error) {
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
  constructionTypeId?: number,
  sortBy?: string,
  sortOrder?: string
): Promise<MasterPagedResponse<AgeFactorCVMaster>> {
  try {
    // Sanitize and clamp pagination parameters to prevent SSR crashes or bad API requests
    const normalizedPageNumber = Math.max(1, Number(pageNumber) || 1);
    const normalizedPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));

    const yearRangeParam =
      selectedYearRange && selectedYearRange.trim() !== "" ? Number(selectedYearRange.trim()) : undefined;

    const response = await getAgeFactorCVMasterWithParams({
      pageNumber: normalizedPageNumber,
      pageSize: normalizedPageSize,
      searchTerm,
      yearRangeCVId: yearRangeParam,
      constructionTypeId,
      sortBy: sortBy?.trim() || undefined,
      sortOrder: sortOrder?.trim() || undefined,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch AgeFactorCVMaster records");
    }

    return response.data;
  } catch (error: unknown) {
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
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid Age Factor CV Master ID',
        statusCode: 400,
      };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return {
        success: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }
    const updatePayload = {
      ...payload,
      updatedBy: userId
    };

    await updateAgeFactorCVMaster(id, updatePayload);

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
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return {
        success: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }
    const createPayload = {
      ...payload,
      createdBy: userId
    };

    const response = await createAgeFactorCVMaster(createPayload);
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
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return {
        success: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }
    const bulkCreatePayload = payload.map(item => ({
      ...item,
      createdBy: userId
    }));

    const response = await bulkCreateAgeFactorCVMaster(bulkCreatePayload);
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
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return {
        success: false,
        message: 'Authentication required',
        statusCode: 401,
      };
    }
    const bulkUpdatePayload = payload.map(item => ({
      ...item,
      data: {
        ...item.data,
        updatedBy: userId
      }
    }));

    await bulkUpdateAgeFactorCVMaster(bulkUpdatePayload);

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
): Promise<PagedResponse<ConstructionType>> {
  try {
    return await getConstructionPaged(pageNumber, pageSize, searchTerm);
  } catch (error: unknown) {
    throw error;
  }
}
