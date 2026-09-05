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
  nameLocal?: string | null;
};

export type ConfigService = {
  id: string;
  name: string;
  departmentId: string;
  localName: string | null;
  govtServiceCode: number | null;
  serviceCode: string | null;
  description: string | null;
  serviceUrl: string | null;
  serviceIcon: string | null;
  sla: string | number | null;
  fees: number | null;
  feesRequired: boolean;
  certificateType: number;
  isCertificateRequired: boolean;
  isSmsEnabled: boolean;
  displayOrder: number;
  isActive: boolean;
};

export type SaveServiceInput = {
  name: string;
  departmentId: string;
  localName?: string | null;
  govtServiceCode?: number | null;
  serviceCode?: string | null;
  description?: string | null;
  serviceUrl?: string | null;
  serviceIcon?: string | null;
  sla?: string | number | null;
  fees?: number | null;
  feesRequired?: boolean;
  certificateType: number;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  displayOrder?: number;
  isActive?: boolean;
};

function toConfigDepartment(department: {
  id: number;
  departmentName: string;
  departmentNameLocal?: string | null;
}): ConfigDepartment {
  return {
    id: String(department.id),
    name: department.departmentName,
    nameLocal: department.departmentNameLocal ?? null,
  };
}

function toConfigService(service: {
  id: number;
  serviceName: string;
  departmentId: number;
  serviceNameLocal?: string | null;
  govtServiceCode?: number | null;
  serviceCode?: string | null;
  description?: string | null;
  serviceUrl?: string | null;
  serviceIcon?: string | null;
  sla?: string | number | null;
  fees?: number | null;
  feesRequired?: boolean | null;
  isFeesRequired?: boolean | null;
  certificateType?: number | null;
  isCertificateRequired?: boolean | null;
  isSmsEnabled?: boolean | null;
  displayOrder?: number;
  isActive: boolean;
}): ConfigService {
  const certType = Number(service.certificateType ?? (service.isCertificateRequired !== false ? 1 : 0));
  return {
    id: String(service.id),
    name: service.serviceName,
    departmentId: String(service.departmentId),
    localName: service.serviceNameLocal ?? null,
    govtServiceCode: service.govtServiceCode ?? null,
    serviceCode: service.serviceCode ?? null,
    description: service.description ?? null,
    serviceUrl: service.serviceUrl ?? null,
    serviceIcon: service.serviceIcon ?? null,
    sla: service.sla ?? null,
    fees: service.fees ?? null,
    feesRequired: Boolean(service.feesRequired ?? service.isFeesRequired),
    certificateType: certType,
    isCertificateRequired: certType > 0,
    isSmsEnabled: service.isSmsEnabled !== false,
    displayOrder: service.displayOrder ?? 0,
    isActive: service.isActive,
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

export async function saveRtsServiceConfigAction(
  nameOrInput: string | SaveServiceInput,
  depId?: string,
  certType: number = 0
) {
  try {
    const input: SaveServiceInput = typeof nameOrInput === "string"
      ? {
          name: nameOrInput,
          departmentId: depId ?? "",
          certificateType: certType,
        }
      : nameOrInput;

    const parsedDepartmentId = parseInt(input.departmentId, 10);
    if (!Number.isFinite(parsedDepartmentId) || parsedDepartmentId <= 0) {
      return { success: false, error: "Invalid department ID" };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const certificateType = Number(input.certificateType ?? 0);
    const fees = input.fees !== undefined && input.fees !== null && !isNaN(Number(input.fees)) ? Number(input.fees) : undefined;
    const govtCode = input.govtServiceCode !== undefined && input.govtServiceCode !== null && !isNaN(Number(input.govtServiceCode))
      ? Number(input.govtServiceCode)
      : undefined;

    const service = await createRtsService({
      departmentId: parsedDepartmentId,
      serviceName: input.name,
      serviceNameLocal: input.localName ?? undefined,
      govtServiceCode: govtCode,
      serviceCode: input.serviceCode ?? undefined,
      description: input.description ?? undefined,
      serviceUrl: input.serviceUrl ?? undefined,
      serviceIcon: input.serviceIcon ?? undefined,
      displayOrder: input.displayOrder ?? 1,
      sla: input.sla !== undefined && input.sla !== null ? String(input.sla) : undefined,
      fees: fees,
      feesRequired: Boolean(input.feesRequired ?? (fees && fees > 0)),
      certificateType: certificateType,
      isCertificateRequired: certificateType > 0,
      isSmsEnabled: input.isSmsEnabled !== false,
      isActive: input.isActive !== false,
      createdBy: userId ?? undefined,
    });

    revalidateServiceConfigPages();

    return { success: true, service: toConfigService(service) };
  } catch (error) {
    console.error("saveRtsServiceConfigAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Save failed" };
  }
}

export async function updateRtsServiceConfigAction(
  id: string,
  nameOrInput: string | SaveServiceInput,
  depId?: string,
  certType: number = 0
) {
  try {
    const serviceId = parseInt(id, 10);
    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      return { success: false, error: "Invalid Service ID" };
    }

    const input: SaveServiceInput = typeof nameOrInput === "string"
      ? {
          name: nameOrInput,
          departmentId: depId ?? "",
          certificateType: certType,
        }
      : nameOrInput;

    const parsedDepartmentId = parseInt(input.departmentId, 10);
    if (!Number.isFinite(parsedDepartmentId) || parsedDepartmentId <= 0) {
      return { success: false, error: "Invalid Department ID" };
    }

    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);

    const certificateType = Number(input.certificateType ?? 0);
    const fees = input.fees !== undefined && input.fees !== null && !isNaN(Number(input.fees)) ? Number(input.fees) : undefined;
    const govtCode = input.govtServiceCode !== undefined && input.govtServiceCode !== null && !isNaN(Number(input.govtServiceCode))
      ? Number(input.govtServiceCode)
      : undefined;

    const service = await updateRtsService(serviceId, {
      id: serviceId,
      departmentId: parsedDepartmentId,
      serviceName: input.name,
      serviceNameLocal: input.localName ?? undefined,
      govtServiceCode: govtCode,
      serviceCode: input.serviceCode ?? undefined,
      description: input.description ?? undefined,
      serviceUrl: input.serviceUrl ?? undefined,
      serviceIcon: input.serviceIcon ?? undefined,
      displayOrder: input.displayOrder ?? 1,
      sla: input.sla !== undefined && input.sla !== null ? String(input.sla) : undefined,
      fees: fees,
      feesRequired: Boolean(input.feesRequired ?? (fees && fees > 0)),
      certificateType: certificateType,
      isCertificateRequired: certificateType > 0,
      isSmsEnabled: input.isSmsEnabled !== false,
      isActive: input.isActive !== false,
      updatedBy: userId ?? undefined,
    });

    revalidateServiceConfigPages();

    return { success: true, service: toConfigService(service) };
  } catch (error) {
    console.error("updateRtsServiceConfigAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
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
