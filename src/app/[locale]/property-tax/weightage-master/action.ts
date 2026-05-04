
"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getFloorFactorCVMasterWithPagination,
  updateFloorFactorCVMaster,
  bulkCreateFloorWeightageCv,
  bulkUpdateFloorFactorCVMaster,
} from "@/lib/api/floor-cv-weightageMaster.service";
import { ApiError } from "@/lib/utils/api";
import {
  FloorFactorCVMaster,
  FloorFactorCVMasterCreate,
  FloorFactorCVMasterUpdate,
  BulkFloorFactorCVMasterCreate,
  BulkFloorFactorCVMasterUpdate,
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
  payload: FloorFactorCVMasterUpdate
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

    await updateFloorFactorCVMaster(id, payload);
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
  payload: FloorFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const response = await createFloorWeightageCv(payload);
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
  payload: BulkFloorFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
      const response = await bulkCreateFloorWeightageCv(payload);
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
  payload: BulkFloorFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await bulkUpdateFloorFactorCVMaster(payload);

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