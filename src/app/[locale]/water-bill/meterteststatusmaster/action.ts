"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getMeterTestStatusesPaged,
  getMeterTestStatusById,
  createMeterTestStatus,
  updateMeterTestStatus,
  deleteMeterTestStatus,
} from "@/lib/api/water-bill/meter-test-status-master.service";
import { ApiError } from "@/lib/utils/api";
import { MeterTestStatus, MeterTestStatusFormModel } from "@/types/water-bill/meter-test-status-master.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchMeterTestStatusesPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<MeterTestStatus>> {
  try {
    return await getMeterTestStatusesPaged(pageNumber, pageSize, searchTerm, sortBy, sortOrder);
  } catch (error: unknown) {
    console.error("[fetchMeterTestStatusesPagedServerAction] Error:", error);
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

export async function createMeterTestStatusAction(
  data: MeterTestStatusFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.createdBy = userId;

    await createMeterTestStatus(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/meterteststatusmaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to create meter test status" };
  }
}

export async function updateMeterTestStatusAction(
  data: MeterTestStatusFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.updatedBy = userId;

    await updateMeterTestStatus(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/meterteststatusmaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to update meter test status" };
  }
}

export async function deleteMeterTestStatusAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await deleteMeterTestStatus(id);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/meterteststatusmaster`, "page");
    }
    return { success: true, message: "Meter test status deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete meter test status" };
  }
}

export async function getMeterTestStatusByIdAction(id: number): Promise<MeterTestStatus | null> {
  return await getMeterTestStatusById(id);
}
