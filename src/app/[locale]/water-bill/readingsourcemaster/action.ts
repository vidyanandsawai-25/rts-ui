"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getReadingSourcesPaged,
  getReadingSourceById,
  createReadingSource,
  updateReadingSource,
  deleteReadingSource,
} from "@/lib/api/water-bill/reading-source-master.service";
import { ApiError } from "@/lib/utils/api";
import { ReadingSource, ReadingSourceFormModel } from "@/types/water-bill/reading-source-master.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchReadingSourcesPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<ReadingSource>> {
  try {
    return await getReadingSourcesPaged(pageNumber, pageSize, searchTerm, sortBy, sortOrder);
  } catch (error: unknown) {
    console.error("[fetchReadingSourcesPagedServerAction] Error:", error);
    return {
      items: [],
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      totalCount: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }
}

export async function createReadingSourceAction(
  data: ReadingSourceFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.createdBy = userId;

    await createReadingSource(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/readingsourcemaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to create reading source" };
  }
}

export async function updateReadingSourceAction(
  data: ReadingSourceFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.updatedBy = userId;

    await updateReadingSource(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/readingsourcemaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to update reading source" };
  }
}

export async function deleteReadingSourceAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await deleteReadingSource(id);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/readingsourcemaster`, "page");
    }
    return { success: true, message: "Reading source deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete reading source" };
  }
}

export async function getReadingSourceByIdAction(id: number): Promise<ReadingSource | null> {
  return await getReadingSourceById(id);
}
