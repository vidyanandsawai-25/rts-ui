import 'server-only';
import { getChargeHeadsPaged, getChargeHeadById } from "@/lib/api/waterBill/chargeHeads.service";
import { sanitizePagedQuery } from "@/lib/api/utils";
import { logger } from "@/lib/utils/server-logger";
import type {
  ChargeHead,
  ChargeHeadsPagedResponse,
  ChargeHeadsQueryParameters,
} from "@/types/waterBill/chargeHeads.types";

const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "code",
  "name",
  "chargetype",
  "istax",
  "ispenalty",
  "isrefundable",
  "isactive",
]);

export function sanitizeChargeHeadsQueryParams(
  params?: ChargeHeadsQueryParameters
): ChargeHeadsQueryParameters {
  return sanitizePagedQuery(params, ALLOWED_SORT_FIELDS) as ChargeHeadsQueryParameters;
}

export async function fetchChargeHeadsServer(
  params?: ChargeHeadsQueryParameters
): Promise<ChargeHeadsPagedResponse> {
  const sanitized = sanitizeChargeHeadsQueryParams(params);

  const response = await getChargeHeadsPaged(sanitized);
  if (response.success && response.data && Array.isArray(response.data.items)) {
    return response.data;
  }

  logger.error("Failed to fetch charge heads list from server API", {
    sanitized,
    statusCode: response.statusCode,
    error: response.error,
  });

  throw new Error(response.error ? `Failed to fetch charge heads - ${response.error}` : "Failed to fetch charge heads from API");
}

export async function fetchChargeHeadByIdServer(id: number): Promise<ChargeHead | null> {
  const targetId = Number(id);
  if (!Number.isFinite(targetId) || targetId <= 0) return null;

  const response = await getChargeHeadById(targetId);
  if (response.success && response.data && Number(response.data.id) === targetId) {
    return response.data;
  }

  if (response.statusCode === 404) {
    return null;
  }

  logger.error("Non-404 error in fetchChargeHeadByIdServer", {
    targetId,
    statusCode: response.statusCode,
    error: response.error,
  });

  throw new Error(response.error ? `Failed to fetch charge head - ${response.error}` : `Failed to fetch charge head with ID ${targetId}`);
}
