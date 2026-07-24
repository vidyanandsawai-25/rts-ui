"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getRtsServicesPaged,
  createRtsService,
  updateRtsService,
  deleteRtsService,
} from "@/lib/api/rts/rtsservices.service";
import { RtsServiceApiItem } from "@/types/rts/service.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchRtsServicesPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<RtsServiceApiItem>> {
  try {
    return await getRtsServicesPaged({
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm,
    });
  } catch (error) {
    console.error("[fetchRtsServicesPagedAction] Error:", error);
    throw error;
  }
}

export async function createRtsServiceAction(payload: {
  departmentId: number;
  serviceName: string;
  serviceNameLocal?: string;
  description?: string;
  serviceUrl?: string;
  serviceIcon?: string;
  sla?: number;
  fees?: number;
  isFeesRequired?: boolean;
  displayOrder?: number;
  isActive: boolean;
}): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const createdBy = userId ? Number(userId) : undefined;

    await createRtsService({
      ...payload,
      createdBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/services`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create RTS service",
    };
  }
}

export async function updateRtsServiceAction(
  id: number,
  payload: {
    id: number;
    departmentId: number;
    serviceName: string;
    serviceNameLocal?: string;
    description?: string;
    serviceUrl?: string;
    serviceIcon?: string;
    sla?: number;
    fees?: number;
    isFeesRequired?: boolean;
    displayOrder?: number;
    isActive: boolean;
  }
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const updatedBy = userId ? Number(userId) : undefined;

    await updateRtsService(id, {
      ...payload,
      updatedBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/services`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update RTS service",
    };
  }
}

export async function deleteRtsServiceAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const rawId = formData.get("id");
  const id = typeof rawId === "string" ? parseInt(rawId, 10) : 0;

  if (!id || id <= 0) {
    return {
      success: false,
      message: "Valid Service ID is required",
      statusCode: 400,
    };
  }

  try {
    await deleteRtsService(id);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/services`, "page");
    }
    return {
      success: true,
      message: "RTS Service deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete RTS service",
    };
  }
}

export async function fetchRtsServicesByDeptAction(
  departmentId: number
): Promise<RtsServiceApiItem[]> {
  try {
    const res = await getRtsServicesPaged({
      DepartmentId: departmentId,
      PageSize: 100,
    });
    return res.items || [];
  } catch (error) {
    console.error("[fetchRtsServicesByDeptAction] Error:", error);
    return [];
  }
}
