import { apiClient } from "@/services/api.service";
import { getTranslations } from "next-intl/server";
import { ApiError } from "@/lib/utils/api";
import { BulkLockUnlockPayload } from "@/types/lockunlock.types";

/**
 * Submits bulk lock or unlock request for property IDs and screen IDs.
 * PUT /api/LockUnlock/bulk
 */
export async function bulkLockUnlockProperties(
  payload: BulkLockUnlockPayload
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    "/LockUnlock/bulk",
    payload
  );

  if (!response.success || !response.data) {
    const t = await getTranslations("lockUnlock");
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || t("messages.bulkActionFailed"),
      "Bulk lock/unlock failed"
    );
  }

  return response.data;
}