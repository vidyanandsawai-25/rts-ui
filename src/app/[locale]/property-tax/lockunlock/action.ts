"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import {
  getLockUnlockScreens,
  getLockUnlockProperties,
  getLockUnlockPropertiesByCategory,
  bulkLockUnlockProperties,
  bulkLockUnlockByCategory
} from "@/lib/api/lockunlock/lockunlock.service";
import { getLockUnlockModules } from "@/lib/api/lockunlock/lockunlock-queries.service";
import {
  LockedScreen,
  LockUnlockPropertiesQueryParams,
  LockUnlockPropertiesResponse,
  BulkLockUnlockPayload,
  LockUnlockPropertyItem,
  ModuleItem,
} from "@/types/lockunlock.types";

/**
 * Server Action to fetch all lock/unlock modules.
 */
export async function getLockUnlockModulesAction(pageNumber?: number, pageSize?: number): Promise<ModuleItem[]> {
  try {
    return await getLockUnlockModules(pageNumber, pageSize);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Server Action to fetch all lockable screen configurations.
 */
export async function getLockUnlockScreensAction(moduleId?: number): Promise<LockedScreen[]> {
  try {
    return await getLockUnlockScreens(moduleId);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Server Action to fetch properties by criteria (Ward, range, search, pagination).
 */
export async function fetchLockUnlockPropertiesPagedAction(
  params: LockUnlockPropertiesQueryParams
): Promise<LockUnlockPropertiesResponse> {
  try {
    return await getLockUnlockProperties(params);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Server Action to fetch properties by category (SearchCategory, Ward, range, search, pagination).
 */
export async function fetchLockUnlockPropertiesByCategoryAction(
  params: LockUnlockPropertiesQueryParams
): Promise<LockUnlockPropertiesResponse> {
  try {
    return await getLockUnlockPropertiesByCategory(params);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Server Action to submit a bulk lock/unlock request.
 * Supports select-all mode by resolving all matching property IDs server-side
 * when selectAll is true, then passing the resolved IDs to the legacy API.
 */
export async function bulkLockUnlockPropertiesAction(
  payload: BulkLockUnlockPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const resolvedPayload: {
      propertyIds: number[];
      screenIds: number[];
      action: "lock" | "unlock";
    } = { propertyIds: [], screenIds: payload.screenIds, action: payload.action };
    const t = await getTranslations("lockUnlock");

    if (payload.selectAll && payload.filters) {
      const queryParams: LockUnlockPropertiesQueryParams = {
        SearchCategory: 4,
        WardId: payload.filters.wardId,
        PropertyFrom: payload.filters.fromProperty,
        PropertyTo: payload.filters.toProperty,
        PartitionNo: payload.filters.partitionNo,
        Search: payload.filters.search,
        PageNumber: 1,
        PageSize: -1,
      };

      const allProperties = await getLockUnlockPropertiesByCategory(queryParams);

      if (!allProperties || !allProperties.items || allProperties.items.length === 0) {
        return {
          success: false,
          error: t("messages.noPropertiesFoundFilters"),
        };
      }

      const allPropertyIds = allProperties.items.map((p: LockUnlockPropertyItem) => p.propertyId);
      const excludedIds = payload.excludedPropertyIds ?? [];

      resolvedPayload.propertyIds = allPropertyIds.filter(
        (id: number) => !excludedIds.includes(id)
      );

      if (resolvedPayload.propertyIds.length === 0) {
        return {
          success: false,
          error: t("messages.noPropertiesSelectedExclusions"),
        };
      }
    } else {
      resolvedPayload.propertyIds = payload.propertyIds ?? [];
    }

    if (resolvedPayload.propertyIds.length === 0) {
      return {
        success: false,
        error: t("messages.atLeastOnePropertyRequired"),
      };
    }

    const result = await bulkLockUnlockProperties(resolvedPayload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/lockunlock`, "page");
    }

    if (result.success === false) {
      return {
        success: false,
        error: result.message || t("messages.bulkFailed"),
      };
    }

    return {
      success: true,
      message: result.message || t("messages.bulkSuccess"),
    };
  } catch (error: unknown) {
    const t = await getTranslations("lockUnlock");
    if (error instanceof ApiError) {
      return { success: false, error: error.responseText };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: t("messages.unexpectedErrorBulk") };
  }
}

/**
 * Server Action to submit a bulk lock/unlock request by category scope.
 */
export async function bulkLockUnlockByCategoryAction(
  payload: {
    scope: {
      searchCategory: number;
      zoneId?: number;
      wardId?: number;
      propertyNo?: string;
      propertyFrom?: string;
      propertyTo?: string;
      partitionNo?: string;
    };
    screenIds: number[];
    action: "lock" | "unlock";
    excludedPropertyIds?: number[];
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const t = await getTranslations("lockUnlock");
    const excludedIds = payload.excludedPropertyIds ?? [];

    if (excludedIds.length === 0) {
      const result = await bulkLockUnlockByCategory({
        scope: payload.scope,
        screenIds: payload.screenIds,
        action: payload.action,
      });

      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/lockunlock`, "page");
      }
      return { success: true, message: result.message };
    }

    const queryParams: LockUnlockPropertiesQueryParams = {
      SearchCategory: payload.scope.searchCategory,
      PageNumber: 1,
      PageSize: -1,
    };
    if (payload.scope.searchCategory === 1) {
      queryParams.ZoneId = payload.scope.zoneId;
    } else if (payload.scope.searchCategory === 2) {
      queryParams.WardId = payload.scope.wardId;
    } else if (payload.scope.searchCategory === 3) {
      queryParams.WardId = payload.scope.wardId;
      queryParams.PropertyNo = payload.scope.propertyNo;
    } else if (payload.scope.searchCategory === 4) {
      queryParams.WardId = payload.scope.wardId;
      queryParams.PropertyFrom = payload.scope.propertyFrom;
      queryParams.PropertyTo = payload.scope.propertyTo;
    }
    
    if (payload.scope.partitionNo) {
      queryParams.PartitionNo = payload.scope.partitionNo;
    }

    const allProperties = await getLockUnlockPropertiesByCategory(queryParams);

    if (!allProperties || !allProperties.items || allProperties.items.length === 0) {
      return { success: false, error: t("messages.noPropertiesFoundFilters") };
    }

    const allPropertyIds = allProperties.items.map((p: LockUnlockPropertyItem) => p.propertyId);
    const finalPropertyIds = allPropertyIds.filter((id: number) => !excludedIds.includes(id));

    if (finalPropertyIds.length === 0) {
      return { success: false, error: t("messages.noPropertiesSelectedExclusions") };
    }

    const result = await bulkLockUnlockProperties({
      propertyIds: finalPropertyIds,
      screenIds: payload.screenIds,
      action: payload.action,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/lockunlock`, "page");
    }

    if (result.success === false) {
      return { success: false, error: result.message || t("messages.bulkFailed") };
    }

    return { success: true, message: result.message || t("messages.bulkSuccess") };
  } catch (error: unknown) {
    const t = await getTranslations("lockUnlock");
    if (error instanceof ApiError) {
      return { success: false, error: error.responseText };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: t("messages.unexpectedErrorBulk") };
  }
}