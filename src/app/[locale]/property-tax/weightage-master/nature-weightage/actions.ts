"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import { getTranslations } from "next-intl/server";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  getNatureFactorCVMasterWithPagination,
  updateNatureFactorCVMaster,
  createNatureFactorCVMaster,
  bulkCreateNatureFactorCVMaster,
  bulkUpdateNatureFactorCVMaster,
} from "@/lib/api/natureofbuilding-cv-weightageMaster.service";
import { ApiError } from "@/lib/utils/api";
import {
  NatureFactorCVMaster,
  NatureFactorCVMasterCreate,
  NatureFactorCVMasterUpdate,
  BulkNatureFactorCVMasterCreate,
  BulkNatureFactorCVMasterUpdate,
} from "@/types/natureofbuilding-cv-weightageMaster.types";
import { PagedResponse } from "@/types/common.types";

/**
 * Fetch paginated NatureFactorCVMaster records with filtering and sorting
 */
export async function fetchNatureFactorCVMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  selectedYearRange?: string,
  constructionTypeId?: string
): Promise<PagedResponse<NatureFactorCVMaster>> {
  try {
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    if (
      pageNumber <= 0 ||
      (pageSize <= 0 && pageSize !== -1) ||
      (pageSize > MAX_PAGE_SIZE && pageSize !== -1) ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      const t = await getTranslations('common');
      throw new Error(t('errors.apiValidationFailed'));
    }

    // Ensure selectedYearRange is not passed if empty
    const yearRangeParam =
      selectedYearRange && selectedYearRange.trim() !== "" ? selectedYearRange : undefined;

    return await getNatureFactorCVMasterWithPagination(
      pageNumber,
      pageSize,
      searchTerm,
      yearRangeParam,
      constructionTypeId
    );
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error(
        `[fetchNatureFactorCVMasterPagedServerAction] API Error ${error.statusCode}:`,
        error.responseText
      );
    } else {
      console.error("[fetchNatureFactorCVMasterPagedServerAction] Error:", error);
    }
    throw error;
  }
}

/**
 * Update NatureFactorCVMaster record
 */
export async function updateNatureFactorCVMasterAction(
  id: number,
  payload: NatureFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    if (!id || id <= 0) {
      const t = await getTranslations('natureFactorCVMaster');
      return {
        success: false,
        message: t('errors.invalidNatureFactorCVId'),
        statusCode: 400,
      };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const updatePayload = {
      ...payload,
      updatedBy: userId
    };

    await updateNatureFactorCVMaster(id, updatePayload);

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      revalidatePath(`/${locale}/property-tax/weightage-master/nature-weightage`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const t = await getTranslations('common');
      return {
        success: false,
        message: error.responseText || t('errors.serverError'),
        statusCode: error.statusCode,
      };
    }
    const t = await getTranslations('common');
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.generic'),
      statusCode: 500,
    };
  }
}

/**
 * Create NatureFactorCVMaster record
 */
export async function createNatureFactorCVMasterAction(
  payload: NatureFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const createPayload = {
      ...payload,
      createdBy: userId
    };

    const response = await createNatureFactorCVMaster(createPayload);
    if (response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
        revalidatePath(`/${locale}/property-tax/weightage-master/nature-weightage`, "page");
      }
      return { success: true, data: response.data };
    } else {
      const t = await getTranslations('natureFactorCVMaster');
      return { success: false, message: response.error || t('errors.createFailed'), statusCode: 500 };
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const t = await getTranslations('common');
      return {
        success: false,
        message: error.responseText || t('errors.serverError'),
        statusCode: error.statusCode,
      };
    }
    const t = await getTranslations('common');
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.generic'),
      statusCode: 500,
    };
  }
}

/**
 * Bulk Create NatureFactorCVMaster records
 */
export async function bulkCreateNatureFactorCVMasterAction(
  payload: BulkNatureFactorCVMasterCreate
): Promise<{ success: boolean; message?: string; statusCode?: number; data?: unknown }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const bulkCreatePayload = payload.map(item => ({
      ...item,
      createdBy: userId
    }));

    const response = await bulkCreateNatureFactorCVMaster(bulkCreatePayload);
    if (response && response.success) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
        revalidatePath(`/${locale}/property-tax/weightage-master/nature-weightage`, "page");
      }
      return { success: true, data: response.data };
    } else {
      const t = await getTranslations('natureFactorCVMaster');
      return { success: false, message: response?.error || t('errors.bulkCreateFailed'), statusCode: 500 };
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const t = await getTranslations('common');
      return {
        success: false,
        message: error.responseText || t('errors.serverError'),
        statusCode: error.statusCode,
      };
    }
    const t = await getTranslations('common');
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.generic'),
      statusCode: 500,
    };
  }
}

/**
 * Bulk Update NatureFactorCVMaster records
 */
export async function bulkUpdateNatureFactorCVMasterAction(
  payload: BulkNatureFactorCVMasterUpdate
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;
    const bulkUpdatePayload = payload.map(item => ({
      ...item,
      data: {
        ...item.data,
        updatedBy: userId
      }
    }));

    await bulkUpdateNatureFactorCVMaster(bulkUpdatePayload);
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/weightage-master`, "page");
      revalidatePath(`/${locale}/property-tax/weightage-master/nature-weightage`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      const t = await getTranslations('common');
      return {
        success: false,
        message: error.responseText || t('errors.serverError'),
        statusCode: error.statusCode,
      };
    }
    const t = await getTranslations('common');
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.generic'),
      statusCode: 500,
    };
  }
}
