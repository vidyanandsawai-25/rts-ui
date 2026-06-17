import { apiClient } from '@/services/api.service';
import type {
  AssessmentYearRangeItem,
  TypeOfUseGroupItem,
  PagedResponse,
  TaxApplicabilityData,
  TaxApplicabilityWrapper
} from '@/types/applicable-taxes.types';
import { handleApiResponse } from '@/lib/utils/api';
import { getTranslations } from 'next-intl/server';
import type { ActionResult } from '@/types/common.types';

export async function getTypeOfUseGroup(
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<{ success: boolean; data?: PagedResponse<TypeOfUseGroupItem>; error?: string }> {
  const res = await apiClient.get<PagedResponse<TypeOfUseGroupItem>>(`/TypeOfUseGroup?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  if (res.success && res.data) {
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error || 'Failed to fetch Type of Use Groups' };
}

export async function getAssessmentYearRange(
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<{ success: boolean; data?: PagedResponse<AssessmentYearRangeItem>; error?: string }> {
  const res = await apiClient.get<PagedResponse<AssessmentYearRangeItem>>(`/AssessmentYearRange?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  if (res.success && res.data) {
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error || 'Failed to fetch Assessment Year Range' };
}

export async function getAssessmentYearRangeCV(
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<{ success: boolean; data?: PagedResponse<AssessmentYearRangeItem>; error?: string }> {
  const res = await apiClient.get<PagedResponse<AssessmentYearRangeItem>>(`/AssessmentYearRangeCV?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  if (res.success && res.data) {
    return { success: true, data: res.data };
  }
  return { success: false, error: res.error || 'Failed to fetch Assessment Year Range CV' };
}

export async function getTaxApplicability(params: {
  propertyId: number;
  financialYearId: number;
  typeOfUseGroupId: number; rvOrCv: 'RV' | 'CV';
}): Promise<{ success: boolean; data?: TaxApplicabilityData; error?: string }> {
  const { propertyId, financialYearId, typeOfUseGroupId, rvOrCv } = params;
  const res = await apiClient.get<TaxApplicabilityWrapper>(
    `/TaxApplicability?PropertyId=${propertyId}&FinancialYearId=${financialYearId}&TypeOfUseGroupId=${typeOfUseGroupId}&RvOrCv=${rvOrCv}`
  );

  if (res.success && res.data && res.data.items) {
    return { success: true, data: res.data.items };
  }
  return { success: false, error: res.error || 'Failed to fetch Tax Applicability' };
}

export async function updateTaxApplicability(payload: {
  propertyId: number;
  taxes: Array<{
    taxId: number;
    isApplicable: boolean;
  }>;
  userId: number;
}): Promise<ActionResult<null>> {
  const response = await apiClient.post<ActionResult<null>>('/TaxApplicability', payload);
  const t = await getTranslations("applicableTaxes");
  return handleApiResponse(response, t("errors.updateTaxApplicability"));
}