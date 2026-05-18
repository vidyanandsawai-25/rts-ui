"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import {
  getCombinePropertiesPaged,
  getPropertyCombineDetails,
  createCombineProperty,
} from "@/lib/api/combine-property.service";
import {
  CombinePropertyParams,
  CombinePropertyItem,
  CombinePropertyPayload,
  GetPropertyCombineDetailsParams,
  PropertyCombineDetails,
} from "@/types/combine-property.types";
import { PagedResponse } from "@/types/common.types";

/* ================================================================
   GET ALL (Paged)
   Mandatory: pageNumber, pageSize
   Optional : taxZoneId, wardId, propertyNo, partitionNo,
              searchTerm, sortBy, sortOrder, filterLogic
================================================================ */
export async function fetchCombinePropertiesPagedAction(
  params: CombinePropertyParams
): Promise<PagedResponse<CombinePropertyItem>> {
  try {
    const MAX_PAGE_SIZE = 5000;
    const MAX_PAGE_NUMBER = 10000;

    // pageSize = -1 is a valid special value meaning "return all records"
    const isAllRecords = params.pageSize === -1;

    if (
      !Number.isFinite(params.pageNumber) ||
      !Number.isFinite(params.pageSize) ||
      params.pageNumber <= 0 ||
      (!isAllRecords && (params.pageSize <= 0 || params.pageSize > MAX_PAGE_SIZE)) ||
      params.pageNumber > MAX_PAGE_NUMBER
    ) {
      console.error("[fetchCombinePropertiesPagedAction] Invalid pagination parameters");
      return { items: [], totalCount: 0, pageNumber: params.pageNumber, pageSize: params.pageSize, totalPages: 0, hasPrevious: false, hasNext: false };
    }

    const result = await getCombinePropertiesPaged(params);
    return result;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchCombinePropertiesPagedAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error("[fetchCombinePropertiesPagedAction] Error:", error.message);
    } else {
      console.error("[fetchCombinePropertiesPagedAction] Unknown error:", error);
    }
    // Return empty result instead of throwing so the page doesn't crash
    return { items: [], totalCount: 0, pageNumber: params.pageNumber, pageSize: params.pageSize, totalPages: 0, hasPrevious: false, hasNext: false };
  }
}

/* ================================================================
   GET PROPERTY COMBINE DETAILS
   Mandatory: wardId, propertyNo, partitionNo
================================================================ */
export async function   fetchPropertyCombineDetailsAction(
  params: GetPropertyCombineDetailsParams
): Promise<PropertyCombineDetails[]> {
  try {
    if (!Number.isFinite(params.wardId) || params.wardId <= 0) {
      throw new ApiError(400, "Valid Ward ID is required", "Validation failed");
    }
    if (!params.propertyNo?.trim()) {
      throw new ApiError(400, "Property No is required", "Validation failed");
    }
    if (!params.partitionNo?.trim()) {
      throw new ApiError(400, "Partition No is required", "Validation failed");
    }

    const result = await getPropertyCombineDetails(params);
    return result;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchPropertyCombineDetailsAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else if (error instanceof Error) {
      console.error("[fetchPropertyCombineDetailsAction] Error:", error.message);
    } else {
      console.error("[fetchPropertyCombineDetailsAction] Unknown error:", error);
    }
    throw error;
  }
}

/* ================================================================
   POST – COMBINE PROPERTIES
   All fields required:
     mainPropertyId   : number
     combinePropertyIds : comma-separated string of property IDs
     remark           : string
     createdBy        : number
================================================================ */
export async function createCombinePropertyAction(
  payload: CombinePropertyPayload
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: any }> {
  try {
    // Validate required fields
    if (!Number.isFinite(payload.mainPropertyId) || payload.mainPropertyId <= 0) {
      return { success: false, message: "Valid Main Property ID is required", statusCode: 400 };
    }
    if (!payload.combinePropertyIds?.trim()) {
      return { success: false, message: "Combine Property IDs are required", statusCode: 400 };
    }
    if (!Number.isFinite(payload.createdBy) || payload.createdBy <= 0) {
      return { success: false, message: "Valid Created By user ID is required", statusCode: 400 };
    }

    const result = await createCombineProperty(payload) as any;

    // Revalidate all locale variants of the combine property page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/combineproperty`, "page");
    }

    return { success: true, message: result?.message || result?.items?.message, data: result };
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
    return { success: false, message: "Failed to combine properties" };
  }
}
