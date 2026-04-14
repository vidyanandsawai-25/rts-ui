"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getNatureFactorCVMasterWithPagination,
  updateNatureFactorCVMaster,
  createNatureFactorCVMaster,
  bulkCreateNatureFactorCVMaster,
  bulkUpdateNatureFactorCVMaster,
} from "@/lib/api/weightageMaster.service";
import { ApiError } from "@/lib/utils/api";
import {
  NatureFactorCVMaster,
  NatureFactorCVMasterCreate,
  NatureFactorCVMasterUpdate,
  PagedResponse,
  BulkNatureFactorCVMasterCreate,
  BulkNatureFactorCVMasterUpdate,
} from "@/types/weightageMaster.types";

/**
 * Fetch paginated NatureFactorCVMaster records with filtering and sorting
 */
export async function fetchNatureFactorCVMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  selectedYearRange?: string,
  constructionTypeId?: string
): Promise<PagedResponse<NatureFactorCVMaster>> {
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

    return await getNatureFactorCVMasterWithPagination(
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeParam, // Pass undefined if no year is selected
      constructionTypeId
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchNatureFactorCVMasterPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchNatureFactorCVMasterPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error(
        "[fetchNatureFactorCVMasterPagedServerAction] Unknown error:",
        error
      );
    }
    throw error;
  }
}

/**
 * Update NatureFactorCVMaster record
 */
export async function updateNatureFactorCVMasterAction(
  id: number,
  payload: NatureFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    console.log('[updateNatureFactorCVMasterAction] Starting update for ID:', id);
    console.log('[updateNatureFactorCVMasterAction] Payload:', payload);
    
    // Validate inputs before calling service
    if (!id || id <= 0) {
      console.error('[updateNatureFactorCVMasterAction] Invalid ID:', id);
      return {
        success: false,
        message: 'Invalid Nature Factor CV Master ID',
        statusCode: 400,
      };
    }

    await updateNatureFactorCVMaster(id, payload);

    console.log('[updateNatureFactorCVMasterAction] Update successful, revalidating paths');
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
    }
    console.log('[updateNatureFactorCVMasterAction] Completed successfully');
    return { success: true };
  } catch (error: unknown) {
    console.error('[updateNatureFactorCVMasterAction] Error occurred:', error);
    if (error instanceof ApiError) {
      console.error(
        `[updateNatureFactorCVMasterAction] API Error ${error.statusCode}:`,
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
        '[updateNatureFactorCVMasterAction] Error:',
        error.message
      );
      return { 
        success: false, 
        message: error.message,
        statusCode: 500,
      };
    }
    console.error('[updateNatureFactorCVMasterAction] Unknown error type');
    return { 
      success: false, 
      message: "Failed to update NatureFactorCVMaster",
      statusCode: 500,
    };
  }
}

/**
 * Create NatureFactorCVMaster record
 */
export async function createNatureFactorCVMasterAction(
  payload: NatureFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    console.log('[createNatureFactorCVMasterAction] Payload:', payload);
    const response = await createNatureFactorCVMaster(payload);
    if (response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.error || 'Failed to create record', statusCode: 500 };
    }
  } catch (error: unknown) {
    console.error('[createNatureFactorCVMasterAction] Error occurred:', error);
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
 * Bulk Create NatureFactorCVMaster records
 */
export async function bulkCreateNatureFactorCVMasterAction(
  payload: BulkNatureFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    console.log('[bulkCreateNatureFactorCVMasterAction] Payload:', payload);
    const response = await bulkCreateNatureFactorCVMaster(payload);
    if (response && response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      }
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response?.error || 'Failed to bulk create records', statusCode: 500 };
    }
  } catch (error: unknown) {
    console.error('[bulkCreateNatureFactorCVMasterAction] Error occurred:', error);
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
 * Bulk Update NatureFactorCVMaster records
 */
export async function bulkUpdateNatureFactorCVMasterAction(
  payload: BulkNatureFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    console.log('[bulkUpdateNatureFactorCVMasterAction] Starting bulk update');
    console.log('[bulkUpdateNatureFactorCVMasterAction] Payload:', payload);
    
    await bulkUpdateNatureFactorCVMaster(payload);

    console.log('[bulkUpdateNatureFactorCVMasterAction] Bulk update successful, revalidating paths');
    
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
    }
    
    console.log('[bulkUpdateNatureFactorCVMasterAction] Completed successfully');
    return { success: true };
  } catch (error: unknown) {
    console.error('[bulkUpdateNatureFactorCVMasterAction] Error occurred:', error);
    
    if (error instanceof ApiError) {
      console.error(
        `[bulkUpdateNatureFactorCVMasterAction] API Error ${error.statusCode}:`,
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
        '[bulkUpdateNatureFactorCVMasterAction] Error:',
        error.message
      );
      return { 
        success: false, 
        message: error.message,
        statusCode: 500,
      };
    }
    
    console.error('[bulkUpdateNatureFactorCVMasterAction] Unknown error type');
    return { 
      success: false, 
      message: "Failed to bulk update NatureFactorCVMaster",
      statusCode: 500,
    };
  }
}
