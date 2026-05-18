"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { createOffice, deleteOffice, getOfficesPaged, getOfficeById, updateOffice } from "@/lib/api/office-crud.service";
import { ApiError } from "@/lib/utils/api";
import { Office, OfficeFormModel } from "@/types/office.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/auth-session";
import { logger } from "@/lib/utils/logger";

function parseOfficeActionError(error: unknown, operation: string) {
  if (error instanceof ApiError) {
    const errors: Record<string, string> = {};
    const lowerMsg = error.responseText.toLowerCase();
    if (lowerMsg.includes("office code") || lowerMsg.includes("already exists")) {
      errors.officeCode = error.responseText;
    }
    return { success: false, message: error.responseText, statusCode: error.statusCode, errors };
  }
  if (error instanceof Error) {
    return { success: false, message: error.message };
  }
  return { success: false, message: `Failed to ${operation} office` };
}

export async function fetchOfficePagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string,
  type?: string,
  status?: string
): Promise<PagedResponse<Office>> {
  try {
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    if (
      !Number.isFinite(pageNumber) ||
      !Number.isFinite(pageSize) ||
      pageNumber <= 0 ||
      pageSize <= 0 ||
      pageSize > MAX_PAGE_SIZE ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
    }

    const allowedSortColumns = ["officeCode", "officeName", "type"];
    const validSortBy = sortBy && allowedSortColumns.includes(sortBy) ? sortBy : undefined;
    const validSortOrder = sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : undefined;

    const result = await getOfficesPaged(pageNumber, pageSize, searchTerm, validSortBy, validSortOrder, type, status);
    
    // Apply smart search ranking server-side if search is active
    if (searchTerm && result.items && result.items.length > 0) {
      result.items = applySearchRanking(result.items, searchTerm);
    }
    
    return result;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        const currentLocale = await getLocale();
        redirect(`/${currentLocale}/login`);
      }
    } else if (error instanceof Error) {
      if (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.includes("NEXT_REDIRECT")) throw error;
    }
    throw error;
  }
}

export async function createOfficeAction(
  data: OfficeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number; errors?: Record<string, string> }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    
    if (!userId) {
      throw new ApiError(401, "Unauthorized", "User session expired");
    }

    await createOffice(data, userId);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    return parseOfficeActionError(error, "create");
  }
}

export async function updateOfficeAction(
  data: OfficeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number; errors?: Record<string, string> }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    if (!userId) {
      throw new ApiError(401, "Unauthorized", "User session expired");
    }

    await updateOffice(data, userId);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    return parseOfficeActionError(error, "update");
  }
}

export async function deleteOfficeAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const rawOfficeId = formData.get("officeId");
  const officeId = typeof rawOfficeId === "string" ? parseInt(rawOfficeId, 10) : 0;

  if (!officeId || officeId <= 0) {
    return { success: false, message: "Valid Office ID is required", statusCode: 400 };
  }

  try {
    await deleteOffice(officeId);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, "page");
    }
    return { success: true, message: "Office deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete office" };
  }
}

export async function getOfficeByIdAction(
  officeId: number
): Promise<Office> {
  try {
    if (!officeId || officeId <= 0) {
      throw new ApiError(400, "Valid Office ID is required", "Validation failed");
    }
    const result = await getOfficeById(officeId);
    if (!result) {
      throw new ApiError(404, "Office not found", "Not Found");
    }
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchOfficeStatsServerAction() {
  try {
    const [headOffices, activeOffices, inactiveOffices] = await Promise.all([
      getOfficesPaged(1, 1, undefined, undefined, undefined, "Head Office", undefined),
      getOfficesPaged(1, 1, undefined, undefined, undefined, undefined, "true"),
      getOfficesPaged(1, 1, undefined, undefined, undefined, undefined, "false"),
    ]);

    return {
      headOfficesCount: headOffices.totalCount,
      activeOfficesCount: activeOffices.totalCount,
      inactiveOfficesCount: inactiveOffices.totalCount,
    };
  } catch (error) {
    logger.error("Failed to fetch office statistics", {
      error: error instanceof Error ? error : new Error(String(error)),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return {
      headOfficesCount: 0,
      activeOfficesCount: 0,
      inactiveOfficesCount: 0,
      error: true,
    };
  }
}

/**
 * Applies a smart match-position priority search ranking to items.
 */
function applySearchRanking(items: Office[], searchTerm: string): Office[] {
  const s = searchTerm.toLowerCase();
  
  const scored = items.map((item) => ({
    item,
    score: getMatchScore(item, s),
  }));
  
  scored.sort((a, b) => a.score - b.score);
  return scored.map((scored) => scored.item);
}

/**
 * Calculates a match score for an office based on search term position.
 */
function getMatchScore(item: Office, searchTerm: string): number {
  const code = (item.officeCode || "").toLowerCase();
  const name = (item.officeName || "").toLowerCase();
  
  const getStrScore = (str: string): number => {
    if (!str.includes(searchTerm)) return 999;
    if (str.startsWith(searchTerm)) return 1;
    if (str.endsWith(searchTerm)) return 3;
    return 2;
  };
  
  return Math.min(getStrScore(code), getStrScore(name));
}
