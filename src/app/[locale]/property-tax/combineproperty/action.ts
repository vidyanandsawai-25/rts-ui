"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { createLogger } from "@/lib/utils/server-logger";
import {
  getCombinePropertiesPaged,
  getPropertyCombineDetails,
  createCombineProperty,
} from "@/lib/api/combine-property/combine-property.service";
import {
  CombinePropertyParams,
  CombinePropertyItem,
  CombinePropertyPayload,
  GetPropertyCombineDetailsParams,
  PropertyCombineDetails,
} from "@/types/combine-property.types";
import { PagedResponse } from "@/types/common.types";

const logger = createLogger("CombinePropertyAction");

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
      logger.warn("Invalid pagination parameters", { pageNumber: params.pageNumber, pageSize: params.pageSize });
      return { items: [], totalCount: 0, pageNumber: params.pageNumber, pageSize: params.pageSize, totalPages: 0, hasPrevious: false, hasNext: false };
    }

    const result = await getCombinePropertiesPaged(params);
    return result;
  } catch (error: unknown) {
    logger.error("Error fetching paged combine properties", undefined, error);
    // Re-throw so error boundary can render and users see the actual failure
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error fetching paged combine properties");
  }
}

/* ================================================================
   GET PROPERTY COMBINE DETAILS
   Mandatory: wardId, propertyNo, partitionNo
================================================================ */
export async function fetchPropertyCombineDetailsAction(
  params: GetPropertyCombineDetailsParams
): Promise<PropertyCombineDetails[]> {
  try {
    if (!Number.isFinite(params.wardId) || params.wardId <= 0) {
      logger.warn("Invalid Ward ID", { wardId: params.wardId });
      return [];
    }
    if (!params.propertyNo?.trim()) {
      logger.warn("Property No is required");
      return [];
    }
    if (!params.partitionNo?.trim()) {
      logger.warn("Partition No is required");
      return [];
    }

    const result = await getPropertyCombineDetails(params);
    return result;
  } catch (error: unknown) {
    logger.error("Error fetching property combine details", undefined, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to fetch property combine details", "Fetch property combine details failed");
  }
}

/* ================================================================
   POST – COMBINE PROPERTIES
   Required from client:
     mainPropertyId     : number
     combinePropertyIds : comma-separated string of property IDs
     remark             : string
   createdBy is read from cookies (userId)
================================================================ */
export async function createCombinePropertyAction(
  payload: Omit<CombinePropertyPayload, "createdBy">
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    // Get userId from cookies
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      logger.warn("Unauthorized: userId not found in cookies");
      return { success: false, message: "Unauthorized", statusCode: 401 };
    }

    // Validate required fields
    if (!Number.isFinite(payload.mainPropertyId) || payload.mainPropertyId <= 0) {
      return { success: false, message: "Valid Main Property ID is required", statusCode: 400 };
    }
    if (!payload.combinePropertyIds?.trim()) {
      return { success: false, message: "Combine Property IDs are required", statusCode: 400 };
    }

    const fullPayload: CombinePropertyPayload = {
      ...payload,
      createdBy: userId,
    };

    const result = (await createCombineProperty(fullPayload)) as Record<string, unknown>;

    // Check if the API returned an explicit failure
    if (result.success === false) {
      const errorMessage = typeof result.message === 'string' ? result.message : 'Combine operation failed';
      return { success: false, message: errorMessage };
    }

    // Revalidate all locale variants of the combine property page
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/combineproperty`, "page");
    }

    const resultData = result as { message?: string; items?: { message?: string } };
    return { success: true, message: resultData?.message || resultData?.items?.message, data: result };
  } catch (error: unknown) {
    logger.error("Error combining properties", undefined, error);
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
