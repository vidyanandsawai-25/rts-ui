"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getUseFactorCVMasterWithParams,
  updateUseFactorCVMaster,
  createUseFactorCVMaster,
  bulkCreateUseFactorCVMaster,
  bulkUpdateUseFactorCVMaster,
  getTypeOfUseWithParams,
} from "@/lib/api/weightageMaster.service";
import { ApiError } from "@/lib/utils/api";
import {
  UseFactorCVMaster,
  UseFactorCVMasterCreate,
  UseFactorCVMasterUpdate,
  PagedResponse,
  BulkUseFactorCVMasterCreate,
  BulkUseFactorCVMasterUpdate,
  TypeOfUseQueryParams,
} from "@/types/weightageMaster.types";
import { UseType } from "@/types/typeOfUse.types";

/**
 * Fetch paginated UseFactorCVMaster records with filtering and sorting
 */
export async function fetchUseFactorCVMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  selectedYearRange?: string,
  typeOfUseId?: number,
  subTypeOfUseId?: number
): Promise<PagedResponse<UseFactorCVMaster>> {
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

    const response = await getUseFactorCVMasterWithParams({
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeCVId: yearRangeParam,
      typeOfUseId,
      subTypeOfUseId
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch UseFactorCVMaster records");
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchUseFactorCVMasterPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error(
        "[fetchUseFactorCVMasterPagedServerAction] Error:",
        error.message
      );
    } else {
      console.error(
        "[fetchUseFactorCVMasterPagedServerAction] Unknown error:",
        error
      );
    }
    throw error;
  }
}

/**
 * Update UseFactorCVMaster record
 */
export async function updateUseFactorCVMasterAction(
  id: number,
  payload: UseFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    console.log('[updateUseFactorCVMasterAction] Starting update for ID:', id);
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid Use Factor CV Master ID',
        statusCode: 400,
      };
    }

    await updateUseFactorCVMaster(id, payload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master/sub-type-weightage`, "page");
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
      message: "Failed to update UseFactorCVMaster",
      statusCode: 500,
    };
  }
}

/**
 * Create UseFactorCVMaster record
 */
export async function createUseFactorCVMasterAction(
  payload: UseFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const response = await createUseFactorCVMaster(payload);
    if (response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master/sub-type-weightage`, "page");
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
 * Bulk Create UseFactorCVMaster records
 */
export async function bulkCreateUseFactorCVMasterAction(
  payload: BulkUseFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const response = await bulkCreateUseFactorCVMaster(payload);
    if (response && response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master/sub-type-weightage`, "page");
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
 * Bulk Update UseFactorCVMaster records
 */
export async function bulkUpdateUseFactorCVMasterAction(
  payload: BulkUseFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await bulkUpdateUseFactorCVMaster(payload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master/sub-type-weightage`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message, statusCode: 500 };
    }

    return { success: false, message: "Failed to bulk update UseFactorCVMaster", statusCode: 500 };
  }
}

/**
 * Fetch paginated TypeOfUse records with filtering and sorting
 * @param params Query parameters including pagination, filters, and sorting
 * @returns Promise resolving to PagedResponse of UseType
 */
export async function fetchTypeOfUsePaged(
  params: TypeOfUseQueryParams
): Promise<PagedResponse<UseType>> {
  try {
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 10;

    if (
      pageNumber <= 0 ||
      pageSize < -1 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new Error("Invalid pagination parameters");
    }

    const response = await getTypeOfUseWithParams(params);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch TypeOfUse records");
    }

    // Map API response to UseType interface
    const mappedItems: UseType[] = response.data.items.map((item) => ({
      typeOfUseId: item.typeOfUseId,
      typeOfUseGroupId: item.typeOfUseGroupId || 0,
      typeOfUseCode: item.typeOfUseCode,
      description: item.description,
      isActive: item.isActive,
      type: item.type || '',
      searchKey: item.searchKey || '',
      searchSequence: item.searchSequence || 0,
      createdDate: item.createdDate,
      updatedDate: item.updatedDate,
    }));

    return {
      items: mappedItems,
      totalCount: response.data.totalCount,
      pageNumber: response.data.pageNumber,
      pageSize: response.data.pageSize,
      totalPages: response.data.totalPages,
      hasPrevious: response.data.hasPrevious,
      hasNext: response.data.hasNext,
    };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchTypeOfUsePaged] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error("[fetchTypeOfUsePaged] Error:", error.message);
    } else {
      console.error("[fetchTypeOfUsePaged] Unknown error:", error);
    }
    throw error;
  }
}
