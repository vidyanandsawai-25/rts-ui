'use server';

import {
  getTypeOfUseGroup,
  getAssessmentYearRange,
  getAssessmentYearRangeCV,
  getTaxApplicability,
  updateTaxApplicability,
} from '@/lib/api/ptis/applicable-taxes/applicable-taxes.service';
import type {
  AssessmentYearRangeItem,
  TypeOfUseGroupItem,
  PagedResponse,
  TaxApplicabilityData
} from '@/types/applicable-taxes.types';
import type { ActionResult } from '@/types/common.types';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { ApiError } from '@/lib/utils/api';

async function getActionErrorMessage(error: unknown): Promise<string> {
  const t = await getTranslations("applicableTaxes");
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
      return t('errors.failedToConnect.description') || "Failed to connect to the server";
    }
    return error.message;
  }
  return t('errors.unexpectedError') || "An unexpected error occurred";
}

export async function getAssessmentYearsAction(
  valuationTab?: string,
  pageNumber: number = 1,
  pageSize: number = -1
): Promise<ActionResult<PagedResponse<AssessmentYearRangeItem>>> {
  const t = await getTranslations("applicableTaxes");
  try {
    const isCV = valuationTab === 'capital';
    const response = isCV
      ? await getAssessmentYearRangeCV(pageNumber, pageSize)
      : await getAssessmentYearRange(pageNumber, pageSize);

    if (!response.success) {
      return {
        success: false,
        error: response.error
          ? `${t("errors.fetchAssessmentYears")}: ${response.error}`
          : t("errors.fetchAssessmentYears")
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: await getActionErrorMessage(error) };
  }
}

export async function getUseGroupsAction(
  pageNumber: number = 1,
  pageSize: number = -1
): Promise<ActionResult<PagedResponse<TypeOfUseGroupItem>>> {
  const t = await getTranslations("applicableTaxes");
  try {
    const response = await getTypeOfUseGroup(pageNumber, pageSize);
    if (!response.success) {
      return {
        success: false,
        error: response.error
          ? `${t("errors.fetchUseGroups")}: ${response.error}`
          : t("errors.fetchUseGroups")
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: await getActionErrorMessage(error) };
  }
}

export async function getTaxApplicabilityAction(params: {
  propertyId: number;
  financialYearId: number;
  typeOfUseGroupId: number;
  rvOrCv: 'RV' | 'CV';
  pageNumber?: number;
  pageSize?: number;
}): Promise<ActionResult<PagedResponse<TaxApplicabilityData>>> {
  const t = await getTranslations("applicableTaxes");
  try {
    const response = await getTaxApplicability(params);

    if (!response.success) {
      return {
        success: false,
        error: response.error
          ? `${t("errors.fetchTaxApplicability")}: ${response.error}`
          : t("errors.fetchTaxApplicability")
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: await getActionErrorMessage(error) };
  }
}

export const updateTaxApplicabilityAction = async (
  locale: string,
  payload: {
    propertyId: number;
    taxes: Array<{
      taxId: number;
      isApplicable: boolean;
    }>;
    userId: number;
  }
): Promise<ActionResult<null>> => {
  try {
    const result = await updateTaxApplicability(payload);

    if (!result.success) {
      return result;
    }

    revalidatePath(`/${locale}/property-tax/ptis/applicable-taxes/applicable`, "page");
    revalidatePath(`/${locale}/property-tax/ptis/applicable-taxes/exempted`, "page");

    return result;

  } catch (error) {
    return { success: false, error: await getActionErrorMessage(error) };
  }
};