"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import {
  getUseFactorCVMasterWithParams,
  updateUseFactorCVMaster,
  createUseFactorCVMaster,
  bulkCreateUseFactorCVMaster,
  bulkUpdateUseFactorCVMaster,
  getTypeOfUseWithParams,
} from "@/lib/api/useCategoryCvFactor.service";
import { ApiError } from "@/lib/utils/api";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  UseFactorCVMaster,
  UseFactorCVMasterCreate,
  UseFactorCVMasterUpdate,
  PagedResponse,
  BulkUseFactorCVMasterCreate,
  BulkUseFactorCVMasterUpdate,
  TypeOfUseQueryParams,
  UseType,
} from "@/types/useCategoryCvFactor.types";


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
    const MAX_PAGE_SIZE = 1000; // Increased limit
    const MAX_PAGE_NUMBER = 10000;
    
    // Handle potential "undefined" string or NaN
    const safeTypeOfUseId = (typeOfUseId && !isNaN(typeOfUseId)) ? typeOfUseId : undefined;
    const safeSubTypeOfUseId = (subTypeOfUseId && !isNaN(subTypeOfUseId)) ? subTypeOfUseId : undefined;

    if (
      pageNumber <= 0 ||
      (pageSize <= 0 && pageSize !== -1) ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new Error("Invalid pagination parameters");
    }

    const parsedYearRange =
      selectedYearRange && selectedYearRange.trim() !== "" && selectedYearRange !== "undefined"
        ? Number(selectedYearRange.trim()) 
        : undefined;

    const yearRangeParam =
      parsedYearRange !== undefined && Number.isFinite(parsedYearRange)
        ? parsedYearRange
        : undefined;

    const response = await getUseFactorCVMasterWithParams({
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeCVId: yearRangeParam,
      typeOfUseId: safeTypeOfUseId,
      subTypeOfUseId: safeSubTypeOfUseId
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
    }
    throw error;
  }
}

/**
 * Update UseFactorCVMaster record
 */
export async function updateUseFactorCVMasterAction(
  id: number,
  payload: Omit<UseFactorCVMasterUpdate, 'updatedBy'>
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const userId = getUserIdFromCookies(await cookies()) || 1;
    
    const finalPayload: UseFactorCVMasterUpdate = {
      ...payload,
      updatedBy: userId
    };

    await updateUseFactorCVMaster(id, finalPayload);

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
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update record",
      statusCode: 500,
    };
  }
}

/**
 * Create UseFactorCVMaster record
 */
export async function createUseFactorCVMasterAction(
  payload: Omit<UseFactorCVMasterCreate, 'createdBy'>
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const userId = getUserIdFromCookies(await cookies()) || 1;
    
    const finalPayload: UseFactorCVMasterCreate = {
      ...payload,
      createdBy: userId
    };

    const response = await createUseFactorCVMaster(finalPayload);
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
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error', statusCode: 500 };
  }
}

/**
 * Bulk Create UseFactorCVMaster records
 */
export async function bulkCreateUseFactorCVMasterAction(
  payload: Array<Omit<UseFactorCVMasterCreate, 'createdBy'>>
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const userId = getUserIdFromCookies(await cookies()) || 1;
    
    const finalPayload: BulkUseFactorCVMasterCreate = payload.map(item => ({
      ...item,
      createdBy: userId
    }));

    const response = await bulkCreateUseFactorCVMaster(finalPayload);
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
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error', statusCode: 500 };
  }
}

/**
 * Bulk Update UseFactorCVMaster records
 */
export async function bulkUpdateUseFactorCVMasterAction(
  payload: Array<{ id: number; data: Omit<UseFactorCVMasterUpdate, 'updatedBy'> }>
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const userId = getUserIdFromCookies(await cookies()) || 1;
    
    const finalPayload: BulkUseFactorCVMasterUpdate = payload.map(item => ({
      id: item.id,
      data: {
        ...item.data,
        updatedBy: userId
      }
    }));

    await bulkUpdateUseFactorCVMaster(finalPayload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master/sub-type-weightage`, "page");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText || 'API Error occurred', statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to bulk update", statusCode: 500 };
  }
}

/**
 * Fetch paginated TypeOfUse records with filtering and sorting
 */
export async function fetchTypeOfUsePaged(
  params: TypeOfUseQueryParams
): Promise<PagedResponse<UseType>> {
  try {
    // Params are passed directly to service

    const response = await getTypeOfUseWithParams(params);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch TypeOfUse records");
    }

    // Map API response to UseType interface
    const mappedItems: UseType[] = response.data.items.map((item) => ({
      id: item.id,
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
      ...response.data,
      items: mappedItems
    };
  } catch (error: unknown) {
    console.error("[fetchTypeOfUsePaged] Error:", error);
    throw error;
  }
}
