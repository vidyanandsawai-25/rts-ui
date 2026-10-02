import 'server-only';
import { getTariffWorkbenchesPaged, getTariffWorkbenchById } from "@/lib/api/waterBill/tariffWorkbench.service";
import { getFinancialYearsPaged } from "@/lib/api/financial-year.service";
import { getConnectionTypePaged } from "@/lib/api/water-bill/connectionTypeMaster.service";
import { getConnectionCategoryPaged } from "@/lib/api/water-bill/connectionCategoryMaster.service";
import { sanitizePagedQuery } from "@/lib/api/utils";
import { logger } from "@/lib/utils/server-logger";
import type {
  TariffWorkbench,
  TariffWorkbenchPagedResponse,
  TariffWorkbenchQueryParameters,
} from "@/types/waterBill/tariffWorkbench.types";

const ALLOWED_SORT_FIELDS = new Set([
  "id",
  "tariffcode",
  "tariffname",
  "financialyearid",
  "connectiontypeid",
  "connectioncategoryid",
  "billingmethod",
  "effectivefrom",
  "effectiveto",
  "versionno",
  "status",
  "isactive",
]);

export function sanitizeTariffQueryParams(
  params?: TariffWorkbenchQueryParameters
): TariffWorkbenchQueryParameters {
  return sanitizePagedQuery(params, ALLOWED_SORT_FIELDS) as TariffWorkbenchQueryParameters;
}

export async function fetchTariffWorkbenchesServer(
  params?: TariffWorkbenchQueryParameters
): Promise<TariffWorkbenchPagedResponse> {
  const sanitized = sanitizeTariffQueryParams(params);

  const response = await getTariffWorkbenchesPaged(sanitized);
  if (response.success && response.data && Array.isArray(response.data.items)) {
    return response.data;
  }

  logger.error("Failed to fetch tariff workbenches list from server API", {
    sanitized,
    statusCode: response.statusCode,
    error: response.error,
  });

  throw new Error(response.error ? `Failed to fetch tariff workbenches - ${response.error}` : "Failed to fetch tariff workbenches from API");
}

export async function fetchTariffWorkbenchByIdServer(id: number): Promise<TariffWorkbench | null> {
  const targetId = Number(id);
  if (!Number.isFinite(targetId) || targetId <= 0) return null;

  const response = await getTariffWorkbenchById(targetId);
  if (response.success && response.data && Number(response.data.id) === targetId) {
    return response.data;
  }

  if (response.statusCode === 404) {
    return null;
  }

  logger.error("Non-404 error in fetchTariffWorkbenchByIdServer", {
    targetId,
    statusCode: response.statusCode,
    error: response.error,
  });

  throw new Error(response.error ? `Failed to fetch tariff workbench - ${response.error}` : `Failed to fetch tariff workbench with ID ${targetId}`);
}

export interface TariffFormLookups {
  financialYearOptions: { value: string; label: string }[];
  connectionTypeOptions: { value: string; label: string }[];
  connectionCategoryOptions: { value: string; label: string }[];
}

export async function getTariffFormLookups(): Promise<TariffFormLookups> {
  const [fyResult, ctResult, ccResult] = await Promise.allSettled([
    getFinancialYearsPaged(1, 2000),
    getConnectionTypePaged(1, 2000),
    getConnectionCategoryPaged(1, 2000),
  ]);

  if (fyResult.status === "rejected") {
    logger.error("Failed to load required Financial Year master data", {
      reason: fyResult.reason,
    });
    throw new Error("Failed to load required Financial Year master data");
  }

  if (ctResult.status === "rejected") {
    logger.error("Failed to load required Connection Type master data", {
      reason: ctResult.reason,
    });
    throw new Error("Failed to load required Connection Type master data");
  }

  if (ccResult.status === "rejected") {
    logger.error("Failed to load required Connection Category master data", {
      reason: ccResult.reason,
    });
    throw new Error("Failed to load required Connection Category master data");
  }

  const financialYearOptions = (fyResult.value?.items || []).map((fy) => ({
    value: String(fy.id),
    label: fy.yearCode || String(fy.year),
  }));

  const connectionTypeOptions = (ctResult.value?.items || []).map((ct): { value: string; label: string } => ({
    value: String(ct.id),
    label: String(ct.connectionType || ct.connectionTypeCode || ct.name || ct.code || ct.id),
  }));

  const connectionCategoryOptions = (ccResult.value?.items || []).map((cc): { value: string; label: string } => ({
    value: String(cc.id),
    label: String(cc.connectionCategory || cc.connectionCategoryCode || cc.categoryName || cc.categoryCode || cc.id),
  }));

  return {
    financialYearOptions,
    connectionTypeOptions,
    connectionCategoryOptions,
  };
}
