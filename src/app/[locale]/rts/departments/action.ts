"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getRtsDepartmentsPaged,
  createRtsDepartment,
  updateRtsDepartment,
  deleteRtsDepartment,
} from "@/lib/api/rts/rtsdepartment.service";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchRtsDepartmentsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<RtsDepartmentApiItem>> {
  try {
    return await getRtsDepartmentsPaged({
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm,
    });
  } catch (error) {
    console.error("[fetchRtsDepartmentsPagedAction] Error:", error);
    throw error;
  }
}

export async function createRtsDepartmentAction(payload: {
  departmentName: string;
  departmentNameLocal?: string;
  departmentIcon?: string;
  displayOrder?: number;
  isActive: boolean;
}): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const createdBy = userId ? Number(userId) : undefined;

    await createRtsDepartment({
      ...payload,
      createdBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/departments`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create RTS department",
    };
  }
}

export async function updateRtsDepartmentAction(
  id: number,
  payload: {
    id: number;
    departmentName: string;
    departmentNameLocal?: string;
    departmentIcon?: string;
    displayOrder?: number;
    isActive: boolean;
  }
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const updatedBy = userId ? Number(userId) : undefined;

    await updateRtsDepartment(id, {
      ...payload,
      updatedBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/departments`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update RTS department",
    };
  }
}

export async function deleteRtsDepartmentAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const rawId = formData.get("id");
  const id = typeof rawId === "string" ? parseInt(rawId, 10) : 0;

  if (!id || id <= 0) {
    return {
      success: false,
      message: "Valid Department ID is required",
      statusCode: 400,
    };
  }

  try {
    await deleteRtsDepartment(id);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/departments`, "page");
    }
    return {
      success: true,
      message: "RTS Department deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete RTS department",
    };
  }
}
