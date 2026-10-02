import { getTranslations } from "next-intl/server";
import { apiClient } from "@/services/api.service";
import { parseApiBoolean, normalizePagedResponse } from "@/lib/api/utils";
import type { ApiResponse } from "@/types/common.types";
import type {
  ChargeHead,
  CreateChargeHeadDto,
  UpdateChargeHeadDto,
  ChargeHeadsPagedResponse,
  ChargeHeadsQueryParameters,
} from "@/types/waterBill/chargeHeads.types";

const BASE_ENDPOINT = "/ChargeHeadMaster";

export { parseApiBoolean };

export function normalizeChargeHead(data: unknown): ChargeHead {
  if (!data || typeof data !== "object") {
    return {
      id: 0,
      code: "",
      name: "",
      chargeType: "",
      isTax: false,
      isPenalty: false,
      isRefundable: false,
      isActive: false,
    };
  }

  const obj = data as Record<string, unknown>;

  const idVal =
    obj.id ??
    obj.Id ??
    obj.chargeHeadId ??
    obj.ChargeHeadId ??
    obj.chargeHeadMasterId ??
    obj.ChargeHeadMasterId;
  const numId = Number(idVal);
  const id = Number.isFinite(numId) ? numId : 0;

  const codeVal =
    obj.code ??
    obj.Code ??
    obj.chargeHeadCode ??
    obj.ChargeHeadCode ??
    obj.chargeCode ??
    obj.ChargeCode ??
    "";
  const code = String(codeVal).trim();

  const nameVal =
    obj.name ??
    obj.Name ??
    obj.chargeHeadName ??
    obj.ChargeHeadName ??
    obj.chargeName ??
    obj.ChargeName ??
    "";
  const name = String(nameVal).trim();

  const chargeTypeVal =
    obj.chargeType ??
    obj.ChargeType ??
    obj.type ??
    obj.Type ??
    "";
  const chargeType = String(chargeTypeVal).trim();

  const isTaxVal = obj.isTax ?? obj.IsTax ?? obj.tax ?? obj.Tax;
  const isTax = parseApiBoolean(isTaxVal, false);

  const isPenaltyVal = obj.isPenalty ?? obj.IsPenalty ?? obj.penalty ?? obj.Penalty;
  const isPenalty = parseApiBoolean(isPenaltyVal, false);

  const isRefundableVal = obj.isRefundable ?? obj.IsRefundable ?? obj.refundable ?? obj.Refundable;
  const isRefundable = parseApiBoolean(isRefundableVal, false);

  const isActiveVal = obj.isActive ?? obj.IsActive ?? obj.active ?? obj.Active ?? obj.status ?? obj.Status;
  const isActive = parseApiBoolean(isActiveVal, true);

  return {
    id,
    code,
    name,
    chargeType,
    isTax,
    isPenalty,
    isRefundable,
    isActive,
  };
}

export async function getChargeHeadsPaged(
  params?: ChargeHeadsQueryParameters
): Promise<ApiResponse<ChargeHeadsPagedResponse>> {
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
      const paged = normalizePagedResponse(response.data, normalizeChargeHead, params);
      return {
        success: true,
        statusCode: response.statusCode,
        data: paged,
      };
    }

    return response as ApiResponse<ChargeHeadsPagedResponse>;
  } catch (err: unknown) {
    const t = await getTranslations("chargeHeads");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchFailed"),
      statusCode: 500,
    };
  }
}

export async function getChargeHeadById(
  id: number
): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations("chargeHeads");
    const response = await apiClient.get<unknown>(`${BASE_ENDPOINT}/${id}`);
    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      }

      const normalized = normalizeChargeHead(rawObj);
      return {
        success: true,
        statusCode: response.statusCode,
        data: normalized,
      };
    }
    return {
      success: false,
      error: response.error || t("errors.notFound"),
      statusCode: response.statusCode || 404,
    };
  } catch (err: unknown) {
    const t = await getTranslations("chargeHeads");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.fetchFailed"),
      statusCode: 500,
    };
  }
}

export async function createChargeHead(
  dto: CreateChargeHeadDto
): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations("chargeHeads");
    const payload = {
      code: dto.code,
      name: dto.name,
      chargeType: dto.chargeType,
      isTax: dto.isTax,
      isPenalty: dto.isPenalty,
      isRefundable: dto.isRefundable,
      isActive: dto.isActive,
    };

    const response = await apiClient.post<unknown>(BASE_ENDPOINT, payload);

    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      }

      const normalized = normalizeChargeHead(rawObj);
      return {
        success: true,
        statusCode: response.statusCode,
        data: normalized,
      };
    }
    return {
      success: false,
      error: response.error || t("errors.createFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("chargeHeads");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.createFailed"),
      statusCode: 500,
    };
  }
}

export async function updateChargeHead(
  id: number,
  dto: UpdateChargeHeadDto
): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations("chargeHeads");
    const payload = {
      id: id,
      code: dto.code,
      name: dto.name,
      chargeType: dto.chargeType,
      isTax: dto.isTax,
      isPenalty: dto.isPenalty,
      isRefundable: dto.isRefundable,
      isActive: dto.isActive,
    };

    const response = await apiClient.put<unknown>(`${BASE_ENDPOINT}/${id}`, payload);

    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;
      if (rawObj.data && typeof rawObj.data === "object" && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      }

      const normalized = normalizeChargeHead(rawObj);
      return {
        success: true,
        statusCode: response.statusCode,
        data: normalized,
      };
    }
    return {
      success: false,
      error: response.error || t("errors.updateFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("chargeHeads");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.updateFailed"),
      statusCode: 500,
    };
  }
}

export async function deleteChargeHead(
  id: number
): Promise<ApiResponse<void>> {
  try {
    const t = await getTranslations("chargeHeads");
    const response = await apiClient.delete<unknown>(`${BASE_ENDPOINT}/${id}`);
    if (response.success) {
      return { success: true, statusCode: response.statusCode, message: response.message };
    }
    return {
      success: false,
      error: response.error || t("errors.deleteFailed"),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations("chargeHeads");
    return {
      success: false,
      error: err instanceof Error ? err.message : t("errors.deleteFailed"),
      statusCode: 500,
    };
  }
}

export async function purgeChargeHead(
  id: number
): Promise<ApiResponse<void>> {
  return deleteChargeHead(id);
}
