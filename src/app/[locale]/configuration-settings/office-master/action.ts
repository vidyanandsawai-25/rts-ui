"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { createOffice, deleteOffice, getOfficesPaged, getOfficeById, updateOffice } from "@/lib/api/office-crud.service";
import { ApiError } from "@/lib/utils/api";
import { Office, OfficeFormModel } from "@/types/office.types";
import { PagedResponse } from "@/types/common.types";

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
    return result;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        const currentLocale = await getLocale();
        redirect(`/${currentLocale}/login`);
      }
      console.error(`[fetchOfficePagedServerAction] API Error ${error.statusCode}:`, error.responseText);
    } else if (error instanceof Error) {
      if (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.includes("NEXT_REDIRECT")) throw error;
      console.error("[fetchOfficePagedServerAction] Error:", error.message);
    }
    throw error;
  }
}

export async function createOfficeAction(
  data: OfficeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await createOffice(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create office" };
  }
}

export async function updateOfficeAction(
  data: OfficeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await updateOffice(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/office-master`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update office" };
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
    if (error instanceof ApiError) {
      console.error(`[getOfficeByIdAction] API Error ${error.statusCode}:`, error.responseText);
    } else {
      console.error("[getOfficeByIdAction] Error:", error);
    }
    throw error;
  }
}
