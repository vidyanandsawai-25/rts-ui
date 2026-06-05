"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import {
  getLockUnlockScreens,
  getLockUnlockProperties,
  bulkLockUnlockProperties
} from "@/lib/api/lockunlock/lockunlock.service";
import {
  LockedScreen,
  LockUnlockPropertiesQueryParams,
  LockUnlockPropertiesResponse,
  BulkLockUnlockPayload
} from "@/types/loackunlock.types";

/**
 * Server Action to fetch all lockable screen configurations.
 */
export async function getLockUnlockScreensAction(): Promise<LockedScreen[]> {
  try {
    return await getLockUnlockScreens();
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
 * Server Action to submit a bulk lock/unlock request.
 */
export async function bulkLockUnlockPropertiesAction(
  payload: BulkLockUnlockPayload
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const result = await bulkLockUnlockProperties(payload);

    // Revalidate paths for all supported locale configurations
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/lockunlock`, "page");
    }

    if (result.success === false) {
      return {
        success: false,
        error: result.message || "Failed to complete bulk lock/unlock operation"
      };
    }

    return {
      success: true,
      message: result.message || "Bulk lock/unlock action completed successfully"
    };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, error: error.responseText };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred during bulk operation" };
  }
}
