"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";
import {
  createRtsService,
  deleteRtsService,
  getAllRtsServices,
  updateRtsService,
} from "@/lib/api/rts/rtsservices.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

type ConfigDepartment = {
  id: string;
  name: string;
};

type ConfigService = {
  id: string;
  name: string;
  departmentId: string;
};

function toConfigDepartment(department: {
  id: number;
  departmentName: string;
}): ConfigDepartment {
  return {
    id: String(department.id),
    name: department.departmentName,
  };
}

function toConfigService(service: {
  id: number;
  serviceName: string;
  departmentId: number;
}): ConfigService {
  return {
    id: String(service.id),
    name: service.serviceName,
    departmentId: String(service.departmentId),
  };
}

function revalidateServiceConfigPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-services`, "page");
    revalidatePath(`/${locale}/rts/services`, "page");
  }
}

export async function getRtsServiceConfigData() {
  const [departments, services] = await Promise.all([
    getAllRtsDepartments(),
    getAllRtsServices(),
  ]);

  return {
    departments: departments.map(toConfigDepartment),
    services: services.map(toConfigService),
  };
}

export async function saveRtsServiceConfigAction(name: string, departmentId: string) {
  try {
    const parsedDepartmentId = parseInt(departmentId, 10);
    if (!Number.isFinite(parsedDepartmentId) || parsedDepartmentId <= 0) {
      return { success: false };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const service = await createRtsService({
      departmentId: parsedDepartmentId,
      serviceName: name,
      isActive: true,
      createdBy: userId ?? undefined,
    });

    revalidateServiceConfigPages();

    return { success: true, service: toConfigService(service) };
  } catch {
    return { success: false };
  }
}

export async function updateRtsServiceConfigAction(
  id: string,
  name: string,
  departmentId: string
) {
  try {
    const serviceId = parseInt(id, 10);
    const parsedDepartmentId = parseInt(departmentId, 10);
    if (!Number.isFinite(serviceId) || serviceId <= 0 || !Number.isFinite(parsedDepartmentId) || parsedDepartmentId <= 0) {
      return { success: false };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const service = await updateRtsService(serviceId, {
      id: serviceId,
      departmentId: parsedDepartmentId,
      serviceName: name,
      isActive: true,
      updatedBy: userId ?? undefined,
    });

    revalidateServiceConfigPages();

    return { success: true, service: toConfigService(service) };
  } catch {
    return { success: false };
  }
}

export async function deleteRtsServiceConfigAction(id: string) {
  try {
    const serviceId = parseInt(id, 10);
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return { success: false };
    }

    await deleteRtsService(serviceId);
    revalidateServiceConfigPages();

    return { success: true };
  } catch {
    return { success: false };
  }
}
