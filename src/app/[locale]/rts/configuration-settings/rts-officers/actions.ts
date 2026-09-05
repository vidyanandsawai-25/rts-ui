"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { apiClient } from "@/services/api.service";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import {
  getAllServiceOfficers,
  createServiceOfficer,
  updateServiceOfficer,
  type RtsServiceOfficerAllocationItem,
  type CreateServiceOfficerPayload,
  type UpdateServiceOfficerPayload,
} from "@/lib/api/rts/rts-service-officer.service";

export type OfficerAllocationConfig = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameLocal: string | null;
  zoneId: number;
  zoneName: string;
  zoneNameLocal: string | null;
  officerName: string;
  officerNameLocal: string | null;
  designation: string;
  designationLocal: string | null;
  mobileNo: string;
  email: string | null;
  officeAddress: string | null;
  officeAddressLocal: string | null;
  officerRole: string;
  displayOrder: number;
  isActive: boolean;
};

export type OfficerServiceOption = {
  id: string;
  name: string;
  nameLocal: string | null;
};

export type OfficerZoneOption = {
  id: number;
  name: string;
  nameLocal: string | null;
};

function toConfigAllocation(item: RtsServiceOfficerAllocationItem): OfficerAllocationConfig {
  return {
    id: String(item.id),
    serviceId: String(item.serviceId),
    serviceName: item.serviceName || `Service #${item.serviceId}`,
    serviceNameLocal: item.serviceNameLocal ?? null,
    zoneId: item.zoneId ?? 1,
    zoneName: item.zoneName,
    zoneNameLocal: item.zoneNameLocal ?? null,
    officerName: item.officerName,
    officerNameLocal: item.officerNameLocal ?? null,
    designation: item.designation,
    designationLocal: item.designationLocal ?? null,
    mobileNo: item.mobileNo,
    email: item.email ?? null,
    officeAddress: item.officeAddress ?? null,
    officeAddressLocal: item.officeAddressLocal ?? null,
    officerRole: item.officerRole,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
  };
}

function revalidateOfficerPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-officers`, "page");
    revalidatePath(`/${locale}/service/dashboard`, "page");
  }
}

export async function getRtsOfficerAllocationsDataAction() {
  const [servicesRes, allocationsRes, zonesRes] = await Promise.all([
    getAllRtsServices().catch(() => []),
    getAllServiceOfficers().catch(() => []),
    apiClient.get<any>("/api/Zone?PageSize=-1").catch(() => null),
  ]);

  const services = Array.isArray(servicesRes) ? servicesRes : [];
  const allocations = Array.isArray(allocationsRes) ? allocationsRes : [];

  const serviceMap = new Map<number, { serviceName: string; serviceNameLocal?: string | null }>();
  services.forEach((s) => {
    serviceMap.set(s.id, { serviceName: s.serviceName, serviceNameLocal: s.serviceNameLocal });
  });

  const enrichedAllocations = allocations.map((a) => {
    if (serviceMap.has(a.serviceId)) {
      const mapped = serviceMap.get(a.serviceId)!;
      if (!a.serviceName) a.serviceName = mapped.serviceName;
      if (!a.serviceNameLocal) a.serviceNameLocal = mapped.serviceNameLocal;
    }
    return toConfigAllocation(a);
  });

  const zoneMap = new Map<number, OfficerZoneOption>();
  if (zonesRes?.success && zonesRes.data) {
    const rawZones = Array.isArray(zonesRes.data)
      ? zonesRes.data
      : (zonesRes.data.items || []);
    rawZones.forEach((z: any) => {
      const zid = Number(z.id);
      if (zid > 0) {
        zoneMap.set(zid, {
          id: zid,
          name: z.zoneNo ? `${z.description || z.name || 'Zone'} (${z.zoneNo})` : (z.description || z.name || `Zone ${zid}`),
          nameLocal: z.description || z.nameLocal || null,
        });
      }
    });
  }

  // Also collect any zones existing on allocations if zone master didn't have them
  enrichedAllocations.forEach((a) => {
    if (a.zoneId && !zoneMap.has(a.zoneId)) {
      zoneMap.set(a.zoneId, {
        id: a.zoneId,
        name: a.zoneName || `Zone ${a.zoneId}`,
        nameLocal: a.zoneNameLocal || null,
      });
    }
  });

  const zoneOptions = Array.from(zoneMap.values()).sort((a, b) => a.id - b.id);

  const serviceOptions: OfficerServiceOption[] = services.map((s) => ({
    id: String(s.id),
    name: s.serviceName,
    nameLocal: s.serviceNameLocal ?? null,
  }));

  return {
    allocations: enrichedAllocations,
    services: serviceOptions,
    zones: zoneOptions,
  };
}

export async function saveRtsOfficerAllocationAction(data: {
  serviceId: string;
  zoneId: number;
  zoneName: string;
  zoneNameLocal?: string;
  officerName: string;
  officerNameLocal?: string;
  designation: string;
  designationLocal?: string;
  mobileNo: string;
  email?: string;
  officeAddress?: string;
  officeAddressLocal?: string;
  officerRole?: string;
  isActive?: boolean;
}) {
  try {
    const parsedServiceId = parseInt(data.serviceId, 10);
    if (!Number.isFinite(parsedServiceId) || parsedServiceId <= 0) {
      return { success: false, error: "Invalid Service ID" };
    }

    const payload: CreateServiceOfficerPayload = {
      serviceId: parsedServiceId,
      zoneId: data.zoneId,
      zoneName: data.zoneName,
      zoneNameLocal: data.zoneNameLocal,
      officerName: data.officerName,
      officerNameLocal: data.officerNameLocal,
      designation: data.designation,
      designationLocal: data.designationLocal,
      mobileNo: data.mobileNo,
      email: data.email,
      officeAddress: data.officeAddress,
      officeAddressLocal: data.officeAddressLocal,
      officerRole: data.officerRole || "DesignatedOfficer",
      displayOrder: data.zoneId,
      isActive: data.isActive !== false,
    };

    const created = await createServiceOfficer(payload);
    revalidateOfficerPages();

    return { success: true, allocation: toConfigAllocation(created) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create officer allocation",
    };
  }
}

export async function updateRtsOfficerAllocationAction(
  id: string,
  data: {
    zoneId: number;
    zoneName: string;
    zoneNameLocal?: string;
    officerName: string;
    officerNameLocal?: string;
    designation: string;
    designationLocal?: string;
    mobileNo: string;
    email?: string;
    officeAddress?: string;
    officeAddressLocal?: string;
    officerRole?: string;
    isActive: boolean;
  }
) {
  try {
    const parsedId = parseInt(id, 10);
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      return { success: false, error: "Invalid allocation ID" };
    }

    const payload: UpdateServiceOfficerPayload = {
      zoneId: data.zoneId,
      zoneName: data.zoneName,
      zoneNameLocal: data.zoneNameLocal,
      officerName: data.officerName,
      officerNameLocal: data.officerNameLocal,
      designation: data.designation,
      designationLocal: data.designationLocal,
      mobileNo: data.mobileNo,
      email: data.email,
      officeAddress: data.officeAddress,
      officeAddressLocal: data.officeAddressLocal,
      officerRole: data.officerRole || "DesignatedOfficer",
      displayOrder: data.zoneId,
      isActive: data.isActive,
    };

    const updated = await updateServiceOfficer(parsedId, payload);
    revalidateOfficerPages();

    return { success: true, allocation: toConfigAllocation(updated) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update officer allocation",
    };
  }
}
