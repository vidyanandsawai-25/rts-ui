"use server";

import {
  getBulkUpdateMenuServer,
  getBulkUpdateFieldConfigServer,
  getPropertiesForFilterServer,
  getWardsPagedServer,
  getWingsForWardServer,
  executeBulkUpdateServer,
  getPropertiesByWardServer,
  getAllWingsServer,
} from "@/lib/api/common-details-update/common-details-update.service";
import type { PropertyItem, WingItem } from "@/lib/api/common-details-update/common-details-update.service";
import { getWards } from "@/lib/api/ward.services";
import { getTranslations } from "next-intl/server";
import { ApiError } from "@/lib/utils/api";
import { PagedResponse } from "@/types/common.types";
import {
  ActionResult,
  BulkUpdateFieldConfig,
  BulkUpdateMaster,
  BulkUpdatePayload,
  BulkUpdateResponse,
  PropertyFilterParams,
  PropertyPreviewRow,
  WardOption,
  WingOption,
} from "@/types/common-details-update/common-details-update.types";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("CommonDetailsUpdateActions");

export async function getMenuItemsAction(): Promise<BulkUpdateMaster[]> {
  try {
    return await getBulkUpdateMenuServer();
  } catch (error) {
    logger.error("Failed to fetch menu items", {}, error);
    if (error instanceof ApiError) throw error;
    const t = await getTranslations("commonDetailsUpdate");
    throw new ApiError(500, t("messages.fetchMenuFailed"), "getMenuItemsAction");
  }
}

export async function getFieldConfigsAction(
  updateCode: string
): Promise<ActionResult<BulkUpdateFieldConfig[]>> {
  try {
    const data = await getBulkUpdateFieldConfigServer(updateCode);
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch field configs", { updateCode }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.fetchFieldConfigFailed"), statusCode: 500 };
  }
}

export async function getFilteredPropertiesAction(
  params: PropertyFilterParams
): Promise<ActionResult<PagedResponse<PropertyPreviewRow>>> {
  try {
    logger.info("getFilteredPropertiesAction: Called with params", { params });
    const data = await getPropertiesForFilterServer(params);
    logger.info("getFilteredPropertiesAction: Success", { itemCount: data?.items?.length || 0 });
    return { success: true, data };
  } catch (error) {
    logger.error("getFilteredPropertiesAction: Failed", { params, error: error as Error });
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.fetchPropertiesFailed"), statusCode: 500 };
  }
}

export async function fetchWardsAction(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<WardOption>> {
  try {
    return await getWardsPagedServer(pageNumber, pageSize);
  } catch (error) {
    logger.error("Failed to fetch wards", { pageNumber, pageSize }, error);
    if (error instanceof ApiError) throw error;
    const t = await getTranslations("commonDetailsUpdate");
    throw new ApiError(500, t("messages.fetchWardsFailed"), "fetchWardsAction");
  }
}

export async function getWingsAction(
  wardId: number
): Promise<ActionResult<WingOption[]>> {
  try {
    const data = await getWingsForWardServer(wardId);
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch wings", { wardId }, error);
    return { success: true, data: [] };
  }
}

export async function executeBulkUpdateAction(
  payload: BulkUpdatePayload & { apiRoute?: string }
): Promise<ActionResult<BulkUpdateResponse>> {
  const { apiRoute, ...rest } = payload;
  try {
    const result = await executeBulkUpdateServer(apiRoute ?? "/CommonDetails/update", rest as BulkUpdatePayload);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Bulk update execution failed", { apiRoute }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.updateFailed"), statusCode: 500 };
  }
}

/**
 * Fetches all wards using the ward service.
 * Used for populating Ward Number dropdown.
 */
export async function getAllWardsAction(): Promise<ActionResult<PagedResponse<{ id: number; wardNo: string }>>> {
  try {
    const data = await getWards(1, -1); // PageSize=-1 to get all wards
    return { 
      success: true, 
      data: {
        items: data.items.map(ward => ({ id: ward.id, wardNo: ward.wardNo })),
        totalCount: data.totalCount,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasPrevious: data.hasPrevious,
        hasNext: data.hasNext
      }
    };
  } catch (error) {
    logger.error("Failed to fetch wards", { error: error as Error });
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.fetchWardsFailed"), statusCode: 500 };
  }
}

/**
 * Fetches properties by ward ID for From/To Property dropdowns.
 * Uses GET /Property?WardId={wardId}
 */
export async function getPropertiesByWardAction(
  wardId: number
): Promise<ActionResult<PagedResponse<PropertyItem>>> {
  try {
    const data = await getPropertiesByWardServer(wardId);
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch properties by ward", { wardId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.fetchPropertiesFailed"), statusCode: 500 };
  }
}

/**
 * Fetches all wings for the Wing dropdown.
 * Uses GET /Wing?PageSize=-1
 */
export async function getAllWingsAction(): Promise<ActionResult<PagedResponse<WingItem>>> {
  try {
    const data = await getAllWingsServer();
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch all wings", {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.fetchWingsFailed"), statusCode: 500 };
  }
}
