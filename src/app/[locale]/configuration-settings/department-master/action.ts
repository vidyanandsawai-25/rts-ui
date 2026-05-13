"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { createDepartmentMaster, updateDepartmentMaster, deleteDepartmentMaster, getDepartmentMastersPaged, getDepartmentById } from "@/lib/api/configuration-settings/department-master/departmentMaster.service";
import { DepartmentMasterFormModel, DepartmentMaster } from "@/types/departmentMaster.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/auth-session";


export async function fetchDepartmentsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
) {
  try {
    return await getDepartmentMastersPaged(pageNumber, pageSize, searchTerm);
  } catch (error) {
    console.error("fetchDepartmentsPagedAction error:", error);
    throw error;
  }
}

export async function getDepartmentByIdAction(id: number): Promise<DepartmentMaster> {
  try {
    const result = await getDepartmentById(id);
    if (!result) throw new Error("Department not found");
    return result;
  } catch (error) {
    console.error("getDepartmentByIdAction error:", error);
    throw error;
  }
}

export async function saveDepartmentMasterAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("departmentId") ? Number(formData.get("departmentId")) : undefined;
    const data: DepartmentMasterFormModel = {
      departmentId: id,
      departmentCode: formData.get("departmentCode") as string,
      departmentName: formData.get("departmentName") as string,
      departmentNameLocal: formData.get("departmentNameLocal") as string,
      departmentIcon: formData.get("departmentIcon") as string,
      departmentDescription: formData.get("departmentDescription") as string,
      isActive: formData.get("isActive") === "true",
    };

    if (id) {
      await updateDepartmentMaster(data, userId);
    } else {
      await createDepartmentMaster(data, userId);
    }

    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/department-master`, "page");
    }

    return { success: true, message: id ? "Department updated successfully" : "Department created successfully" };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save department" };
  }
}

export async function deleteDepartmentAction(
  departmentId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await deleteDepartmentMaster(departmentId);
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/department-master`, "page");
    }
    return { success: true, message: "Department deleted successfully" };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete department" };
  }
}
