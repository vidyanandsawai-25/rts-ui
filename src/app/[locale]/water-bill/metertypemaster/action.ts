"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getMeterTypesPaged,
  getMeterTypeById,
  createMeterType,
  updateMeterType,
  deleteMeterType,
} from "@/lib/api/water-bill/meter-type-master.service";
import { ApiError } from "@/lib/utils/api";
import { MeterType, MeterTypeFormModel } from "@/types/water-bill/meter-type-master.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchMeterTypesPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<MeterType>> {
  try {
    return await getMeterTypesPaged(pageNumber, pageSize, searchTerm, sortBy, sortOrder);
  } catch (error: unknown) {
    console.error("[fetchMeterTypesPagedServerAction] Error:", error);
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

export async function createMeterTypeAction(
  data: MeterTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.createdBy = userId;

    await createMeterType(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/metertypemaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to create meter type" };
  }
}

export async function updateMeterTypeAction(
  data: MeterTypeFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (userId) data.updatedBy = userId;

    await updateMeterType(data);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/metertypemaster`, "page");
    }
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: error instanceof Error ? error.message : "Failed to update meter type" };
  }
}

export async function deleteMeterTypeAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    await deleteMeterType(id);
    for (const locale of locales) {
      revalidatePath(`/${locale}/water-bill/metertypemaster`, "page");
    }
    return { success: true, message: "Meter type deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete meter type" };
  }
}

export async function getMeterTypeByIdAction(id: number): Promise<MeterType | null> {
  return await getMeterTypeById(id);
}
