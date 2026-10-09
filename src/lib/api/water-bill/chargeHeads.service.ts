import { getTranslations } from 'next-intl/server';
import { apiClient } from '@/services/api.service';
import { parseApiBoolean, normalizePagedResponse } from '@/lib/api/utils';
import type { ApiResponse } from '@/types/common.types';
import type {
  ChargeHead,
  CreateChargeHeadDto,
  UpdateChargeHeadDto,
  ChargeHeadsPagedResponse,
  ChargeHeadsQueryParameters,
} from '@/types/water-bill/chargeHeads.types';

const BASE_ENDPOINT = '/ChargeHeadMaster';

export { parseApiBoolean };

export function normalizeChargeHead(data: unknown): ChargeHead {
  if (!data || typeof data !== 'object') {
    return {
      id: 0,
      chargeHeadCode: '',
      chargeHeadName: '',
      code: '',
      name: '',
      chargeHeadNameLocal: '',
      chargeType: '',
      isRefundable: false,
      sequenceNo: 1,
      description: '',
      isRegularPay: false,
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
    obj.chargeHeadCode ??
    obj.ChargeHeadCode ??
    obj.code ??
    obj.Code ??
    obj.chargeCode ??
    obj.ChargeCode ??
    '';
  const chargeHeadCode = String(codeVal).trim();

  const nameVal =
    obj.chargeHeadName ??
    obj.ChargeHeadName ??
    obj.name ??
    obj.Name ??
    obj.chargeName ??
    obj.ChargeName ??
    '';
  const chargeHeadName = String(nameVal).trim();

  const chargeHeadNameLocalVal =
    obj.chargeHeadNameLocal ??
    obj.ChargeHeadNameLocal ??
    obj.chargeHeadNameMar ??
    obj.ChargeHeadNameMar ??
    obj.chargeHeadName_Local ??
    obj.ChargeHeadName_Local ??
    obj.nameLocal ??
    obj.NameLocal ??
    '';
  const chargeHeadNameLocal = String(chargeHeadNameLocalVal).trim();

  const chargeTypeVal = obj.chargeType ?? obj.ChargeType ?? obj.type ?? obj.Type ?? '';
  const chargeType = String(chargeTypeVal).trim();

  const isRefundableVal = obj.isRefundable ?? obj.IsRefundable ?? obj.refundable ?? obj.Refundable;
  const isRefundable = parseApiBoolean(isRefundableVal, false);

  const sequenceNoVal = obj.sequenceNo ?? obj.SequenceNo;
  const sequenceNo = Number.isFinite(Number(sequenceNoVal)) ? Number(sequenceNoVal) : 1;

  const descriptionVal =
    obj.description ??
    obj.Description ??
    obj.remark ??
    obj.Remark ??
    obj.remarks ??
    obj.Remarks ??
    '';
  const description = String(descriptionVal).trim();

  const isRegularPayVal =
    obj.isRegularPay ?? obj.IsRegularPay ?? obj.isRegularPayment ?? obj.IsRegularPayment;
  const isRegularPay = parseApiBoolean(isRegularPayVal, false);

  const isActiveVal =
    obj.isActive ?? obj.IsActive ?? obj.active ?? obj.Active ?? obj.status ?? obj.Status;
  const isActive = parseApiBoolean(isActiveVal, true);

  return {
    id,
    chargeHeadCode,
    chargeHeadName,
    code: chargeHeadCode,
    name: chargeHeadName,
    chargeHeadNameLocal: chargeHeadNameLocal || undefined,
    chargeType,
    isRefundable,
    sequenceNo,
    description: description || undefined,
    isRegularPay,
    isActive,
  };
}

export async function getChargeHeadsPaged(
  params?: ChargeHeadsQueryParameters
): Promise<ApiResponse<ChargeHeadsPagedResponse>> {
  try {
    const query = new URLSearchParams();

    if (params?.id) query.append('Id', params.id.toString());
    if (params?.pageNumber) query.append('PageNumber', params.pageNumber.toString());
    if (params?.pageSize) query.append('PageSize', params.pageSize.toString());
    if (params?.searchTerm?.trim()) query.append('SearchTerm', params.searchTerm.trim());
    if (params?.sortBy) query.append('SortBy', params.sortBy);
    if (params?.sortOrder) query.append('SortOrder', params.sortOrder);
    if (params?.filterLogic) query.append('FilterLogic', params.filterLogic);

    const url = query.toString() ? `${BASE_ENDPOINT}?${query.toString()}` : BASE_ENDPOINT;

    const response = await apiClient.get<unknown>(url);

    if (response.success && response.data) {
      let paged = normalizePagedResponse(response.data, normalizeChargeHead, params);

      if (params?.searchTerm?.trim()) {
        const term = params.searchTerm.trim().toLowerCase();
        const termNoSpecial = term.replace(/[_-\s]/g, '');

        const filteredItems = paged.items.filter((item) => {
          const rawCode = String(item.chargeHeadCode || item.code || '').toLowerCase();

          const codeMatch =
            rawCode.includes(term) ||
            (termNoSpecial !== '' && rawCode.replace(/[_-\s]/g, '').includes(termNoSpecial));

          const nameMatch = String(item.chargeHeadName || item.name || '')
            .toLowerCase()
            .includes(term);

          const localNameMatch = item.chargeHeadNameLocal
            ? String(item.chargeHeadNameLocal).toLowerCase().includes(term)
            : false;

          const typeMatch = String(item.chargeType || '')
            .toLowerCase()
            .includes(term);

          const descMatch = item.description
            ? String(item.description).toLowerCase().includes(term)
            : false;

          return codeMatch || nameMatch || localNameMatch || typeMatch || descMatch;
        });

        if (filteredItems.length <= paged.items.length) {
          const pageSize = paged.pageSize || 10;
          const totalCount = filteredItems.length;
          const totalPages = Math.ceil(totalCount / pageSize) || 1;

          paged = {
            ...paged,
            items: filteredItems,
            totalCount,
            totalPages,
            hasNextPage: paged.pageNumber < totalPages,
            hasPreviousPage: paged.pageNumber > 1,
          };
        }
      }

      return {
        success: true,
        statusCode: response.statusCode,
        data: paged,
      };
    }

    return response as ApiResponse<ChargeHeadsPagedResponse>;
  } catch (err: unknown) {
    const t = await getTranslations('chargeHeads');

    return {
      success: false,
      error: err instanceof Error ? err.message : t('errors.fetchFailed'),
      statusCode: 500,
    };
  }
}

export async function getChargeHeadById(id: number): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations('chargeHeads');

    const response = await apiClient.get<unknown>(`${BASE_ENDPOINT}/${id}`);

    if (response.success && response.data) {
      let rawObj = response.data as Record<string, unknown>;

      if (rawObj.data && typeof rawObj.data === 'object' && !Array.isArray(rawObj.data)) {
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
      error: response.error || t('errors.notFound'),
      statusCode: response.statusCode || 404,
    };
  } catch (err: unknown) {
    const t = await getTranslations('chargeHeads');

    return {
      success: false,
      error: err instanceof Error ? err.message : t('errors.fetchFailed'),
      statusCode: 500,
    };
  }
}

export async function createChargeHead(dto: CreateChargeHeadDto): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations('chargeHeads');

    const codeVal =
      dto.chargeHeadCode || ((dto as unknown as Record<string, unknown>).code as string) || '';

    const nameVal =
      dto.chargeHeadName || ((dto as unknown as Record<string, unknown>).name as string) || '';

    const rawLocal =
      (dto as unknown as Record<string, unknown>).chargeHeadNameLocal ??
      (dto as unknown as Record<string, unknown>).ChargeHeadNameLocal ??
      (dto as unknown as Record<string, unknown>).chargeHeadNameMar ??
      (dto as unknown as Record<string, unknown>).nameLocal;

    const localVal =
      typeof rawLocal === 'string' && rawLocal.trim() !== '' ? rawLocal.trim() : null;

    const rawDesc =
      (dto as unknown as Record<string, unknown>).description ??
      (dto as unknown as Record<string, unknown>).Description ??
      (dto as unknown as Record<string, unknown>).remark;

    const descVal = typeof rawDesc === 'string' && rawDesc.trim() !== '' ? rawDesc.trim() : null;

    const payload: Record<string, unknown> = {
      chargeHeadCode: codeVal,
      ChargeHeadCode: codeVal,
      chargeHeadName: nameVal,
      ChargeHeadName: nameVal,
      code: codeVal,
      name: nameVal,

      chargeHeadNameLocal: localVal,
      ChargeHeadNameLocal: localVal,
      chargeHeadNameMar: localVal,
      ChargeHeadNameMar: localVal,
      chargeHeadName_Local: localVal,
      ChargeHeadName_Local: localVal,
      nameLocal: localVal,
      NameLocal: localVal,

      chargeType: dto.chargeType,
      ChargeType: dto.chargeType,
      isRefundable: dto.isRefundable ?? false,
      IsRefundable: dto.isRefundable ?? false,
      sequenceNo: dto.sequenceNo ?? 1,
      SequenceNo: dto.sequenceNo ?? 1,

      description: descVal,
      Description: descVal,
      remark: descVal,
      Remark: descVal,
      remarks: descVal,
      Remarks: descVal,

      isRegularPay: dto.isRegularPay ?? false,
      IsRegularPay: dto.isRegularPay ?? false,
      isActive: dto.isActive ?? true,
      IsActive: dto.isActive ?? true,

      createdBy: 1,
      CreatedBy: 1,
      updatedBy: 1,
      UpdatedBy: 1,
    };

    const response = await apiClient.post<unknown>(BASE_ENDPOINT, payload);

    if (response.success) {
      let rawObj = (response.data as Record<string, unknown>) ?? {};

      if (rawObj.data && typeof rawObj.data === 'object' && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      } else if (rawObj.items && typeof rawObj.items === 'object' && !Array.isArray(rawObj.items)) {
        rawObj = rawObj.items as Record<string, unknown>;
      }

      const normalized = normalizeChargeHead(
        rawObj.id || rawObj.chargeHeadCode || rawObj.code
          ? rawObj
          : { ...dto, id: Number(rawObj.id) || 0 }
      );

      return {
        success: true,
        statusCode: response.statusCode,
        data: normalized,
      };
    }

    return {
      success: false,
      error: response.error || t('errors.createFailed'),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations('chargeHeads');

    return {
      success: false,
      error: err instanceof Error ? err.message : t('errors.createFailed'),
      statusCode: 500,
    };
  }
}

export async function updateChargeHead(
  id: number,
  dto: UpdateChargeHeadDto
): Promise<ApiResponse<ChargeHead>> {
  try {
    const t = await getTranslations('chargeHeads');

    const codeVal =
      dto.chargeHeadCode || ((dto as unknown as Record<string, unknown>).code as string) || '';

    const nameVal =
      dto.chargeHeadName || ((dto as unknown as Record<string, unknown>).name as string) || '';

    const rawLocal =
      (dto as unknown as Record<string, unknown>).chargeHeadNameLocal ??
      (dto as unknown as Record<string, unknown>).ChargeHeadNameLocal ??
      (dto as unknown as Record<string, unknown>).chargeHeadNameMar ??
      (dto as unknown as Record<string, unknown>).nameLocal;

    const localVal =
      typeof rawLocal === 'string' && rawLocal.trim() !== '' ? rawLocal.trim() : null;

    const rawDesc =
      (dto as unknown as Record<string, unknown>).description ??
      (dto as unknown as Record<string, unknown>).Description ??
      (dto as unknown as Record<string, unknown>).remark;

    const descVal = typeof rawDesc === 'string' && rawDesc.trim() !== '' ? rawDesc.trim() : null;

    const payload: Record<string, unknown> = {
      id,
      Id: id,

      chargeHeadCode: codeVal,
      ChargeHeadCode: codeVal,
      chargeHeadName: nameVal,
      ChargeHeadName: nameVal,
      code: codeVal,
      name: nameVal,

      chargeHeadNameLocal: localVal,
      ChargeHeadNameLocal: localVal,
      chargeHeadNameMar: localVal,
      ChargeHeadNameMar: localVal,
      chargeHeadName_Local: localVal,
      ChargeHeadName_Local: localVal,
      nameLocal: localVal,
      NameLocal: localVal,

      chargeType: dto.chargeType,
      ChargeType: dto.chargeType,
      isRefundable: dto.isRefundable ?? false,
      IsRefundable: dto.isRefundable ?? false,
      sequenceNo: dto.sequenceNo ?? 1,
      SequenceNo: dto.sequenceNo ?? 1,

      description: descVal,
      Description: descVal,
      remark: descVal,
      Remark: descVal,
      remarks: descVal,
      Remarks: descVal,

      isRegularPay: dto.isRegularPay ?? false,
      IsRegularPay: dto.isRegularPay ?? false,
      isActive: dto.isActive ?? true,
      IsActive: dto.isActive ?? true,

      createdBy: 1,
      CreatedBy: 1,
      updatedBy: 1,
      UpdatedBy: 1,
    };

    const response = await apiClient.put<unknown>(
      `${BASE_ENDPOINT}/${encodeURIComponent(String(id))}`,
      payload
    );

    if (response.success) {
      let rawObj = (response.data as Record<string, unknown>) ?? {};

      if (rawObj.data && typeof rawObj.data === 'object' && !Array.isArray(rawObj.data)) {
        rawObj = rawObj.data as Record<string, unknown>;
      } else if (rawObj.items && typeof rawObj.items === 'object' && !Array.isArray(rawObj.items)) {
        rawObj = rawObj.items as Record<string, unknown>;
      }

      const normalized = normalizeChargeHead(
        rawObj.id || rawObj.chargeHeadCode || rawObj.code ? rawObj : { ...payload }
      );

      return {
        success: true,
        statusCode: response.statusCode,
        data: normalized,
      };
    }

    return {
      success: false,
      error: response.error || t('errors.updateFailed'),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations('chargeHeads');

    return {
      success: false,
      error: err instanceof Error ? err.message : t('errors.updateFailed'),
      statusCode: 500,
    };
  }
}

export async function deleteChargeHead(id: number): Promise<ApiResponse<void>> {
  try {
    const t = await getTranslations('chargeHeads');

    let response = await apiClient.delete<unknown>(
      `${BASE_ENDPOINT}/${encodeURIComponent(String(id))}/purge`
    );

    if (!response.success) {
      response = await apiClient.delete<unknown>(
        `${BASE_ENDPOINT}/${encodeURIComponent(String(id))}`
      );
    }

    if (response.success) {
      return {
        success: true,
        statusCode: response.statusCode,
        message: response.message,
      };
    }

    return {
      success: false,
      error: response.error || t('errors.deleteFailed'),
      statusCode: response.statusCode || 400,
    };
  } catch (err: unknown) {
    const t = await getTranslations('chargeHeads');

    return {
      success: false,
      error: err instanceof Error ? err.message : t('errors.deleteFailed'),
      statusCode: 500,
    };
  }
}

export async function purgeChargeHead(id: number): Promise<ApiResponse<void>> {
  return deleteChargeHead(id);
}
