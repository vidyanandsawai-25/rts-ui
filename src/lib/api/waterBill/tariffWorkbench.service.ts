import { getTranslations } from "next-intl/server";
import { apiClient } from "@/services/api.service";
import { parseApiBoolean, normalizePagedResponse } from "@/lib/api/utils";
import type { ApiResponse } from "@/types/common.types";
import type {
  TariffWorkbench,
  CreateTariffWorkbenchDto,
  UpdateTariffWorkbenchDto,
  TariffWorkbenchPagedResponse,
  TariffWorkbenchQueryParameters,
} from "@/types/waterBill/tariffWorkbench.types";

const BASE_ENDPOINT = "/TariffMaster";

export { parseApiBoolean };

export function normalizeTariffWorkbench(data: unknown): TariffWorkbench {
  if (!data || typeof data !== "object") {
    return {
      id: 0,
      tariffCode: "",
      tariffName: "",
      financialYearId: 0,
      connectionTypeId: null,
      connectionCategoryId: null,
      billingMethod: "",
      effectiveFrom: "",
      effectiveTo: null,
      versionNo: 0,
      status: "",
      description: null,
      isActive: false,
    };
  }

  const obj = data as Record<string, unknown>;

  const idVal =
    obj.id ??
    obj.Id ??
    obj.tariffId ??
    obj.TariffId ??
    obj.tariffMasterId ??
    obj.TariffMasterId;
  const numId = Number(idVal);
  const id = Number.isFinite(numId) ? numId : 0;

  const codeVal =
    obj.tariffCode ??
    obj.TariffCode ??
    obj.code ??
    obj.Code ??
    "";
  const tariffCode = String(codeVal).trim();

  const nameVal =
    obj.tariffName ??
    obj.TariffName ??
    obj.name ??
    obj.Name ??
    "";
  const tariffName = String(nameVal).trim();

  const financialYearId = Number(obj.financialYearId ?? obj.FinancialYearId) || 0;
  const financialYearCode =
    ((obj.financialYearCode ?? obj.FinancialYearCode) as string | undefined)?.trim() || undefined;

  const connectionTypeId = obj.connectionTypeId ?? obj.ConnectionTypeId;
  const connTypeIdNum = connectionTypeId !== null && connectionTypeId !== undefined ? Number(connectionTypeId) : null;
  const connectionTypeName =
    ((obj.connectionTypeName ?? obj.ConnectionTypeName) as string | undefined)?.trim() || undefined;

  const connectionCategoryId = obj.connectionCategoryId ?? obj.ConnectionCategoryId;
  const connCatIdNum = connectionCategoryId !== null && connectionCategoryId !== undefined ? Number(connectionCategoryId) : null;
  const connectionCategoryName =
    ((obj.connectionCategoryName ?? obj.ConnectionCategoryName) as string | undefined)?.trim() || undefined;

  const billingMethod = String(obj.billingMethod ?? obj.BillingMethod ?? "").trim();
  const effectiveFromRaw = String(obj.effectiveFrom ?? obj.EffectiveFrom ?? "").trim();
  const effectiveFrom = effectiveFromRaw ? effectiveFromRaw.split("T")[0] : "";

  const effectiveToRaw = (obj.effectiveTo ?? obj.EffectiveTo) ? String(obj.effectiveTo ?? obj.EffectiveTo).trim() : null;
  const effectiveTo = effectiveToRaw ? effectiveToRaw.split("T")[0] : null;

  const versionNoRaw = obj.versionNo ?? obj.VersionNo;
  const versionNo = versionNoRaw !== undefined && versionNoRaw !== null ? Number(versionNoRaw) || 0 : 0;
  const status = String(obj.status ?? obj.Status ?? "").trim();
  const description = (obj.description ?? obj.Description) ? String(obj.description ?? obj.Description).trim() : null;

  const isActiveVal = obj.isActive ?? obj.IsActive ?? obj.active ?? obj.Active ?? obj.status ?? obj.Status;
  const isActive = parseApiBoolean(isActiveVal, false);

  return {
    id,
    tariffCode,
    tariffName,
    financialYearId,
    financialYearCode,
    connectionTypeId: connTypeIdNum,
    connectionTypeName,
    connectionCategoryId: connCatIdNum,
    connectionCategoryName,
    billingMethod,
    effectiveFrom,
    effectiveTo,
    versionNo,
    status,
    description,
    isActive,
  };
}

/**
 * Fetch paginated tariff workbenches with query parameters
 */
export async function getTariffWorkbenchesPaged(
  params?: TariffWorkbenchQueryParameters
): Promise<ApiResponse<TariffWorkbenchPagedResponse>> {
  try {
    const query = new URLSearchParams();

    if (params?.id) query.append("Id", params.id.toString());
    if (params?.pageNumber) query.append("PageNumber", params.pageNumber.toString());
    if (params?.pageSize) query.append("PageSize", params.pageSize.toString());
    if (params?.searchTerm?.trim()) query.append("SearchTerm", params.searchTerm.trim());
    if (params?.sortBy) query.append("SortBy", params.sortBy);
    if (params?.sortOrder) query.append("SortOrder", params.sortOrder);
    if (params?.filterLogic) query.append("FilterLogic", params.filterLogic);

    const url = query.toString() ? `${BASE_ENDPOINT}?${query.toString()}` : BASE_ENDPOINT;
    const response = await apiClient.get<unknown>(url);

    if (response.success && response.data) {
      const paged = normalizePagedResponse(response.data, normalizeTariffWorkbench, params);
      return {
        success: true,
        data: paged,
        statusCode: response.statusCode,
      };
    }

    return response as ApiResponse<TariffWorkbenchPagedResponse>;
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchListFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Fetch a single tariff workbench by ID
 */
export async function getTariffWorkbenchById(
  id: number
): Promise<ApiResponse<TariffWorkbench>> {
  try {
    const t = await getTranslations("tariffWorkbench");

    const singleResp = await apiClient.get<unknown>(`${BASE_ENDPOINT}/${id}`);
    if (singleResp.success && singleResp.data) {
      let rawObj = singleResp.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      } else if (rawObj.result && typeof rawObj.result === "object" && !Array.isArray(rawObj.result)) {
        rawObj = rawObj.result as Record<string, unknown>;
      }

      const normalized = normalizeTariffWorkbench(rawObj);
      if (Number(normalized.id) === Number(id) || normalized.tariffCode) {
        return {
          success: true,
          data: normalized,
          statusCode: singleResp.statusCode,
        };
      }
    }

    return {
      success: false,
      error: singleResp.error || t("errors.notFound"),
      statusCode: singleResp.statusCode || 404,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchItemFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Create a new tariff workbench
 */
export async function createTariffWorkbench(
  dto: CreateTariffWorkbenchDto
): Promise<ApiResponse<TariffWorkbench>> {
  try {
    const t = await getTranslations("tariffWorkbench");

    const fromDateOnly = dto.effectiveFrom ? dto.effectiveFrom.split("T")[0] : dto.effectiveFrom;
    const toDateOnly = dto.effectiveTo ? dto.effectiveTo.split("T")[0] : dto.effectiveTo;

    const payload = {
      tariffCode: dto.tariffCode,
      tariffName: dto.tariffName,
      financialYearId: dto.financialYearId,
      connectionTypeId: dto.connectionTypeId ?? null,
      connectionCategoryId: dto.connectionCategoryId ?? null,
      billingMethod: dto.billingMethod,
      effectiveFrom: fromDateOnly,
      effectiveTo: toDateOnly || null,
      versionNo: dto.versionNo ?? 1,
      status: dto.status || "Draft",
      description: dto.description || null,
      isActive: dto.isActive,
    };

    const response = await apiClient.post<unknown>(BASE_ENDPOINT, payload);

    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      }
      const normalizedData = normalizeTariffWorkbench(rawObj);
      return {
        success: true,
        data: normalizedData,
        statusCode: response.statusCode,
      };
    }
    return {
      success: false,
      error: response.error || t("errors.createFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.createFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Update an existing tariff workbench
 */
export async function updateTariffWorkbench(
  id: number,
  dto: UpdateTariffWorkbenchDto
): Promise<ApiResponse<TariffWorkbench>> {
  try {
    const t = await getTranslations("tariffWorkbench");

    const fromDateOnly = dto.effectiveFrom ? dto.effectiveFrom.split("T")[0] : dto.effectiveFrom;
    const toDateOnly = dto.effectiveTo ? dto.effectiveTo.split("T")[0] : dto.effectiveTo;

    const payload = {
      id,
      tariffCode: dto.tariffCode,
      tariffName: dto.tariffName,
      financialYearId: dto.financialYearId,
      connectionTypeId: dto.connectionTypeId ?? null,
      connectionCategoryId: dto.connectionCategoryId ?? null,
      billingMethod: dto.billingMethod,
      effectiveFrom: fromDateOnly,
      effectiveTo: toDateOnly || null,
      versionNo: dto.versionNo ?? 1,
      status: dto.status || "Draft",
      description: dto.description || null,
      isActive: dto.isActive,
    };

    const response = await apiClient.put<unknown>(`${BASE_ENDPOINT}/${id}`, payload);

    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      }
      const normalizedData = normalizeTariffWorkbench(rawObj);
      return {
        success: true,
        data: normalizedData,
        statusCode: response.statusCode,
      };
    }
    return {
      success: false,
      error: response.error || t("errors.updateFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.updateFailed"),
      statusCode: 500,
    };
  }
}

/**
 * Permanently delete (purge) a tariff workbench
 */
export async function purgeTariffWorkbench(
  id: number
): Promise<ApiResponse<void>> {
  try {
    const t = await getTranslations("tariffWorkbench");
    const response = await apiClient.delete<void>(`${BASE_ENDPOINT}/${id}`);
    if (response.success) {
      return response;
    }
    return {
      success: false,
      error: response.error || t("errors.deleteFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("tariffWorkbench");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.deleteFailed"),
      statusCode: 500,
    };
  }
}
