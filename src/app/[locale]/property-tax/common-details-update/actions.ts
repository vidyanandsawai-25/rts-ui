"use server";

import {
  getBulkUpdateMenuServer,
  getBulkUpdateFieldConfigServer,
  getPropertiesForFilterServer,
  getWardsPagedServer,
  getWingsForWardServer,
  executeBulkUpdateServer,
  getAllWingsServer,
  getFieldRegistrySchemasServer,
  getFieldRegistryTablesServer,
  getFieldRegistryColumnsServer,
  addFieldRegistryServer,
  getScopeOptionsServer,
  getScopeCategoryOptionsServer,
  importExcelServer,
  exportExcelServer,
} from "@/lib/api/common-details-update/common-details-update.service";
import type { WingItem, ScopeOption } from "@/lib/api/common-details-update/common-details-update.service";
import { getWards } from "@/lib/api/ward.services";
import { getZones } from "@/lib/api/zone.services";
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
  CreateFieldRegistryDto,
  FieldRegistrySchema,
  FieldRegistryTable,
  FieldRegistryColumn,
  ExcelImportResponse,
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
    logger.error("getFilteredPropertiesAction: Failed", { params }, error);
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
export async function getAllWardsAction(zoneId?: number): Promise<ActionResult<PagedResponse<{ id: number; wardNo: string }>>> {
  try {
    const data = await getWards(1, -1, undefined, zoneId); // PageSize=-1 to get all wards
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

export async function getAllZonesAction(): Promise<ActionResult<PagedResponse<{ id: number; zoneNo: string }>>> {
  try {
    const data = await getZones(1, -1); // PageSize=-1 to get all zones
    return { 
      success: true, 
      data: {
        items: data.items.map(zone => ({ id: zone.id, zoneNo: zone.zoneNo })),
        totalCount: data.totalCount,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasPrevious: data.hasPrevious,
        hasNext: data.hasNext
      }
    };
  } catch (error) {
    logger.error("Failed to fetch zones", { error: error as Error });
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch zones", statusCode: 500 };
  }
}

/**
 * Fetches properties by ward ID for From/To Property dropdowns.
 * Uses GET /Property?WardId={wardId}
 */
export async function getPropertiesByWardAction(
  wardId: number,
  updateCode: string
): Promise<ActionResult<PagedResponse<PropertyPreviewRow>>> {
  try {
    const data = await getPropertiesForFilterServer({
      wardId: String(wardId),
      updateCode,
      page: 1,
      pageSize: 1000
    });
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

export async function getFieldRegistrySchemasAction(): Promise<ActionResult<FieldRegistrySchema[]>> {
  try {
    const data = await getFieldRegistrySchemasServer();
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch field registry schemas", {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch schemas", statusCode: 500 };
  }
}

export async function getFieldRegistryTablesAction(
  schemaName: string
): Promise<ActionResult<FieldRegistryTable[]>> {
  try {
    const data = await getFieldRegistryTablesServer(schemaName);
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch field registry tables", { schemaName }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch tables", statusCode: 500 };
  }
}

export async function getFieldRegistryColumnsAction(
  schemaName: string,
  tableName: string
): Promise<ActionResult<FieldRegistryColumn[]>> {
  try {
    const data = await getFieldRegistryColumnsServer(schemaName, tableName);
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch field registry columns", { schemaName, tableName }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch columns", statusCode: 500 };
  }
}

export async function addFieldRegistryAction(
  payload: CreateFieldRegistryDto
): Promise<ActionResult<unknown>> {
  try {
    return await addFieldRegistryServer(payload);
  } catch (error) {
    logger.error("Failed to add field to registry", { payload }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to add field to registry", statusCode: 500 };
  }
}

export async function getScopeOptionsAction(): Promise<ActionResult<ScopeOption[]>> {
  try {
    const data = await getScopeOptionsServer();
    return { success: true, data };
  } catch (error) {
    logger.error("Failed to fetch scope options", {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch scope options", statusCode: 500 };
  }
}

export async function getScopeCategoryOptionsAction(
  categoryId: number
): Promise<ActionResult<ScopeOption>> {
  try {
    const data = await getScopeCategoryOptionsServer(categoryId);
    if (data) {
      return { success: true, data };
    }
    return { success: false, error: "Scope category not found", statusCode: 404 };
  } catch (error) {
    logger.error("Failed to fetch scope category options", { categoryId }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    return { success: false, error: "Failed to fetch scope category options", statusCode: 500 };
  }
}

export async function importExcelAction(
  formData: FormData
): Promise<ActionResult<ExcelImportResponse>> {
  try {
    const result = await importExcelServer(formData);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Excel import execution failed", {}, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.somethingWrong"), statusCode: 500 };
  }
}

export async function exportExcelAction(
  wardId: string,
  updateCode: string,
  fromPropertyNo?: string,
  toPropertyNo?: string
): Promise<ActionResult<string>> {
  try {
    const base64 = await exportExcelServer(wardId, updateCode, fromPropertyNo, toPropertyNo);
    return { success: true, data: base64 };
  } catch (error) {
    logger.error("Excel export execution failed", { wardId, updateCode }, error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.statusCode };
    }
    const t = await getTranslations("commonDetailsUpdate");
    return { success: false, error: t("messages.somethingWrong"), statusCode: 500 };
  }
}



