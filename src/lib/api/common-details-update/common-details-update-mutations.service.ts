import { apiClient } from "@/services/api.service";
import { getTranslations } from "next-intl/server";
import { ApiError } from "@/lib/utils/api";
import { BulkUpdatePayload, BulkUpdateResponse } from "@/types/common-details-update/common-details-update.types";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("BulkUpdateMutations");

export async function executeBulkUpdateServer(
  apiRoute: string,
  payload: BulkUpdatePayload
): Promise<BulkUpdateResponse> {
  // Use provided apiRoute or default to /CommonDetails/update
  const endpoint = apiRoute || "/CommonDetails/update";
  
  logger.info("executeBulkUpdateServer: Starting bulk update", { 
    updateCode: payload.updateCode, 
    propertyCount: payload.propertyIds.length,
    endpoint 
  });

  const response = await apiClient.put<BulkUpdateResponse>(endpoint, payload);

  if (!response.success) {
    const t = await getTranslations("commonDetailsUpdate");
    logger.error("executeBulkUpdateServer: Failed", { 
      statusCode: response.statusCode, 
      error: response.error 
    });
    throw new ApiError(
      response.statusCode || 500,
      response.error || t("messages.updateFailed"),
      "executeBulkUpdateServer"
    );
  }

  // Handle wrapped response format
  const data = response.data as unknown as Record<string, unknown>;
  if (data && data.success === true) {
    logger.info("executeBulkUpdateServer: Success", { 
      message: data.message,
      items: data.items 
    });
    return {
      success: true,
      message: String(data.message || ""),
      items: data.items as BulkUpdateResponse["items"],
      errors: data.errors as string[] | null,
      correlationId: data.correlationId as string | null,
    };
  }

  const t = await getTranslations("commonDetailsUpdate");
  throw new ApiError(
    500,
    t("messages.updateFailed"),
    "executeBulkUpdateServer"
  );
}
