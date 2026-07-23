"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getRtsFieldDefinitionsPaged,
  createRtsFieldDefinition,
  updateRtsFieldDefinition,
  deleteRtsFieldDefinition,
} from "@/lib/api/rts/rtsfield-crud.service";
import { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

export async function fetchRtsFieldsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<RtsFieldDefinitionApiItem>> {
  try {
    return await getRtsFieldDefinitionsPaged({
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm,
    });
  } catch (error) {
    console.error("[fetchRtsFieldsPagedAction] Error:", error);
    throw error;
  }
}

export async function createRtsFieldAction(payload: {
  departmentId: number;
  serviceId: number;
  fieldCode: string;
  fieldLabel: string;
  fieldLabelLocal?: string;
  fieldType: string;
  fieldGroup?: string;
  displayOrder?: number;
  isRequired?: boolean;
  validationRules?: string;
  isActive: boolean;
}): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const createdBy = userId ? Number(userId) : undefined;

    await createRtsFieldDefinition({
      ...payload,
      isRequired: payload.isRequired ?? false,
      createdBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/fields`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create RTS field definition",
    };
  }
}

export async function updateRtsFieldAction(
  id: number,
  payload: {
    id: number;
    departmentId: number;
    serviceId: number;
    fieldCode: string;
    fieldLabel: string;
    fieldLabelLocal?: string;
    fieldType: string;
    fieldGroup?: string;
    displayOrder?: number;
    isRequired?: boolean;
    validationRules?: string;
    isActive: boolean;
  }
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    const updatedBy = userId ? Number(userId) : undefined;

    await updateRtsFieldDefinition(id, {
      ...payload,
      isRequired: payload.isRequired ?? false,
      updatedBy,
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/fields`, "page");
    }
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update RTS field definition",
    };
  }
}

export async function deleteRtsFieldAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const rawId = formData.get("id");
  const id = typeof rawId === "string" ? parseInt(rawId, 10) : 0;

  if (!id || id <= 0) {
    return {
      success: false,
      message: "Valid Field ID is required",
      statusCode: 400,
    };
  }

  try {
    await deleteRtsFieldDefinition(id);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/fields`, "page");
    }
    return {
      success: true,
      message: "RTS Field Definition deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete RTS field definition",
    };
  }
}
