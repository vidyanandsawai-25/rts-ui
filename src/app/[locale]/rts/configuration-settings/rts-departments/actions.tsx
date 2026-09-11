"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import {
  createRtsDepartment,
  deleteRtsDepartment,
  getAllRtsDepartments,
  updateRtsDepartment,
} from "@/lib/api/rts/rtsdepartment.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

type ConfigDepartment = {
  id: string;
  name: string;
  localName: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
};

function toConfigDepartment(department: {
  id: number;
  departmentName: string;
  departmentNameLocal?: string | null;
  departmentIcon?: string | null;
  displayOrder?: number;
  isActive: boolean;
}): ConfigDepartment {
  return {
    id: String(department.id),
    name: department.departmentName,
    localName: department.departmentNameLocal ?? null,
    icon: department.departmentIcon ?? null,
    displayOrder: department.displayOrder ?? 0,
    isActive: department.isActive,
  };
}

function revalidateDepartmentConfigPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-departments`, "page");
    revalidatePath(`/${locale}/rts/departments`, "page");
  }
}

export async function getRtsDepartmentConfigData() {
  const departments = await getAllRtsDepartments();

  return {
    departments: departments.map(toConfigDepartment),
  };
}

export interface SaveDepartmentInput {
  name: string;
  localName?: string | null;
  icon?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export async function saveRtsDepartmentConfigAction(input: string | SaveDepartmentInput) {
  try {
    const payload: SaveDepartmentInput = typeof input === "string" ? { name: input } : input;
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const department = await createRtsDepartment({
      departmentName: payload.name,
      departmentNameLocal: payload.localName ?? undefined,
      departmentIcon: payload.icon ?? undefined,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive ?? true,
      createdBy: userId ?? undefined,
    });

    revalidateDepartmentConfigPages();

    return { success: true, department: toConfigDepartment(department) };
  } catch {
    return { success: false };
  }
}

export async function updateRtsDepartmentConfigAction(id: string, input: string | SaveDepartmentInput) {
  try {
    const departmentId = parseInt(id, 10);
    if (!Number.isFinite(departmentId) || departmentId <= 0) {
      return { success: false };
    }

    const payload: SaveDepartmentInput = typeof input === "string" ? { name: input } : input;
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const department = await updateRtsDepartment(departmentId, {
      id: departmentId,
      departmentName: payload.name,
      departmentNameLocal: payload.localName ?? undefined,
      departmentIcon: payload.icon ?? undefined,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive ?? true,
      updatedBy: userId ?? undefined,
    });

    revalidateDepartmentConfigPages();

    return { success: true, department: toConfigDepartment(department) };
  } catch {
    return { success: false };
  }
}

export async function deleteRtsDepartmentConfigAction(id: string) {
  try {
    const departmentId = parseInt(id, 10);
    if (!Number.isFinite(departmentId) || departmentId <= 0) {
      return { success: false };
    }

    await deleteRtsDepartment(departmentId);
    revalidateDepartmentConfigPages();

    return { success: true };
  } catch {
    return { success: false };
  }
}
