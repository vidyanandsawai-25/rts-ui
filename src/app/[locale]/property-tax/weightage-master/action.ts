
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  getFloorFactorCVMasterWithPagination,
  updateFloorFactorCVMaster,
  bulkCreateFloorWeightageCv,
  bulkUpdateFloorFactorCVMaster,
} from "@/lib/api/floor-cv-weightageMaster.service";
import { ApiError } from "@/lib/utils/api";
import {
  FloorFactorCVMaster,
  FloorFactorCVMasterCreateAction,
  FloorFactorCVMasterUpdateAction,
  BulkFloorFactorCVMasterCreateAction,
  BulkFloorFactorCVMasterUpdateAction,
} from "@/types/floor-cv-weightageMaster.types";
import { createFloorWeightageCv } from '@/lib/api/floor-cv-weightageMaster.service';
import { PagedResponse } from "@/types/common.types";

/**
 * Fetch paginated FloorFactorCVMaster records with filtering and sorting
 */
export async function fetchFloorFactorCVMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  selectedYearRange?: string
): Promise<PagedResponse<FloorFactorCVMaster>> {
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

    // Ensure selectedYearRange is not passed if empty
    const yearRangeParam =
      selectedYearRange && selectedYearRange.trim() !== "" ? selectedYearRange : undefined;

    return await getFloorFactorCVMasterWithPagination(
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeParam
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchFloorFactorCVMasterPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchFloorFactorCVMasterPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error(
        "[fetchFloorFactorCVMasterPagedServerAction] Unknown error:",
        error
      );
    }
    throw error;
  }
}

/**
 * Update FloorFactorCVMaster record
 */
export async function updateFloorFactorCVMasterAction(
  id: number,
  payload: FloorFactorCVMasterUpdateAction
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
 
    
    // Validate inputs before calling service
    if (!id || id <= 0) {
      console.error('[updateFloorFactorCVMasterAction] Invalid ID:', id);
      return {
        success: false,
        message: 'Invalid Floor Factor CV Master ID',
        statusCode: 400,
      };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const updatePayload = {
      ...payload,
      updatedBy: userId
    };

    await updateFloorFactorCVMaster(id, updatePayload);
    // Revalidate all locale variants of the weightage master page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
    }
    
   
    return { success: true };
  } catch (error: unknown) {
   
    
    if (error instanceof ApiError) {
      console.error(
        `[updateFloorFactorCVMasterAction] API Error ${error.statusCode}:`,
        error.responseText
      );
      return {
        success: false,
        message: error.responseText || 'API Error occurred',
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      console.error(
        '[updateFloorFactorCVMasterAction] Error:',
        error.message
      );
      return { 
        success: false, 
        message: error.message,
        statusCode: 500,
      };
    }
    
    console.error('[updateFloorFactorCVMasterAction] Unknown error type');
    return { 
      success: false, 
      message: "Failed to update FloorFactorCVMaster",
      statusCode: 500,
    };
  }
}

/**
 * Create FloorFactorCVMaster record
 */
export async function createFloorFactorCVMasterAction(
  payload: FloorFactorCVMasterCreateAction
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const createPayload = {
      ...payload,
      createdBy: userId
    };

    const response = await createFloorWeightageCv(createPayload);
    if (response.success) {
      // Optionally revalidate paths if needed
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.error || 'Failed to create record', statusCode: 500 };
    }
  } catch (error: unknown) {
    console.error('[createFloorFactorCVMasterAction] Error occurred:', error);
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
      message: 'Unknown error',
      statusCode: 500,
    };
  }
}

/**
 * Bulk Create FloorFactorCVMaster records
 */
export async function bulkCreateFloorFactorCVMasterAction(
  payload: BulkFloorFactorCVMasterCreateAction
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
      const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const bulkCreatePayload = payload.map(item => ({
      ...item,
      createdBy: userId
    }));

    const response = await bulkCreateFloorWeightageCv(bulkCreatePayload);
    if (response && response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response?.error || 'Failed to bulk create records', statusCode: 500 };
    }
  } catch (error: unknown) {
    console.error('[bulkCreateFloorFactorCVMasterAction] Error occurred:', error);
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
      message: 'Unknown error',
      statusCode: 500,
    };
  }
}

/**
 * Bulk Update FloorFactorCVMaster records
 */
export async function bulkUpdateFloorFactorCVMasterAction(
  payload: BulkFloorFactorCVMasterUpdateAction
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const bulkUpdatePayload = payload.map(item => ({
      ...item,
      data: {
        ...item.data,
        updatedBy: userId
      }
    }));

    await bulkUpdateFloorFactorCVMaster(bulkUpdatePayload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
    }
    
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateFloorFactorCVMasterAction] Error occurred:', error);
    
    if (error instanceof ApiError) {
      console.error(
        `[bulkUpdateFloorFactorCVMasterAction] API Error ${error.statusCode}:`,
        error.responseText
      );
      return {
        success: false,
        message: error.responseText || 'API Error occurred',
        statusCode: error.statusCode,
      };
    }
    if (error instanceof Error) {
      console.error(
        '[bulkUpdateFloorFactorCVMasterAction] Error:',
        error.message
      );
      return { 
        success: false, 
        message: error.message,
        statusCode: 500,
      };
    }
    
    console.error('[bulkUpdateFloorFactorCVMasterAction] Unknown error type');
    return { 
      success: false, 
      message: "Failed to bulk update FloorFactorCVMaster",
      statusCode: 500,
    };
  }
}