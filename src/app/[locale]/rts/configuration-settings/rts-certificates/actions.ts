"use server";

import { revalidatePath } from "next/cache";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import {
  createCertificateLibraryTemplate,
  createCertificateTemplate,
  deleteCertificateLibraryTemplate,
  deleteCertificateTemplate,
  getAllCertificateLibraryTemplates,
  getAllCertificateTemplates,
  getAvailableTagsForService,
  updateCertificateLibraryTemplate,
  updateCertificateTemplate,
} from "@/lib/api/rts/rtscertificate.service";
import { getUlbMaster } from "@/lib/api/configuration-settings/ulb-configuration/ulb-master.services";
import type {
  CertificateAvailableTag,
  CreateRTSCertificateLibraryTemplateInput,
  CreateRTSCertificateTemplateInput,
  RTSCertificateDepartmentOption,
  RTSCertificateLibraryTemplate,
  RTSCertificateServiceOption,
  RTSCertificateTemplate,
  UpdateRTSCertificateTemplateInput,
  UpdateRTSCertificateLibraryTemplateInput,
} from "@/types/rts/certificate.types";
import { getRtsFieldDefinitionsByServiceId } from "@/lib/api/rts/rtsfielddefinition.service";
import type { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";

export type CertificateTemplateFormData = {
  id?: number;
  serviceId: string;
  templateName: string;
  templateCode: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  designJson?: string | null;
  defaultConditions?: string[];
  officerFields?: {
    fieldKey: string;
    fieldLabelMarathi: string;
    fieldLabelEnglish: string;
    fieldType: "text" | "textarea" | "number" | "date" | "select";
    isMandatory: boolean;
  }[];
  isActive: boolean;
};

export type CertificateLibraryTemplateFormData = {
  id?: number;
  templateName: string;
  templateCode: string;
  description?: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
  designJson?: string | null;
  isActive: boolean;
};

export interface CertificateUlbInfo {
  ulbName: string;
  ulbNameLocal: string;
  ulbAddress: string;
  emailId: string;
  websiteUrl: string;
  mobileNo: string;
  ulbLogo: string;
}

import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";

export async function fetchCertificateTemplatesPageDataAction(): Promise<{
  templates: RTSCertificateTemplate[];
  libraryTemplates: RTSCertificateLibraryTemplate[];
  departments: RTSCertificateDepartmentOption[];
  services: RTSCertificateServiceOption[];
  ulbInfo: CertificateUlbInfo;
}> {
  const defaultUlbInfo: CertificateUlbInfo = {
    ulbName: "Akola Municipal Corporation, Akola",
    ulbNameLocal: "अकोला महानगरपालिका, अकोला",
    ulbAddress: "गांधी रोड, अकोला- ४४४००१",
    emailId: "amc.akola@maharashtra.gov.in tpamcakola@rediffmail.com",
    websiteUrl: "onesolutionakola.tabamc.in",
    mobileNo: "0724-2434412",
    ulbLogo: "/images/logo.png",
  };

  try {
    const [templates, libraryTemplates, services, ulbMaster, departments] = await Promise.all([
      getAllCertificateTemplates().catch(() => []),
      getAllCertificateLibraryTemplates().catch(() => []),
      getAllRtsServices().catch(() => []),
      getUlbMaster().catch(() => null),
      getAllRtsDepartments().catch(() => []),
    ]);

    const deptMap = new Map<number, { name: string; nameLocal: string }>();
    for (const d of departments) {
      if (d.id) {
        deptMap.set(d.id, {
          name: d.departmentName || `Department ${d.id}`,
          nameLocal: d.departmentNameLocal || d.departmentName || `विभाग ${d.id}`,
        });
      }
    }

    // Filter strictly to services where serviceUrl is NULL or EMPTY (excluding any with '#' or redirect URLs)
    const certificateEligibleServices = services.filter((s) => {
      const rawUrl = s.serviceUrl;
      if (rawUrl === null || rawUrl === undefined) return true;
      const url = String(rawUrl).trim();
      return url === "" || url === "null" || url === "undefined";
    });

    const ulbInfo: CertificateUlbInfo = {
      ulbName: ulbMaster?.ulbName || defaultUlbInfo.ulbName,
      ulbNameLocal: ulbMaster?.ulbNameLocal || defaultUlbInfo.ulbNameLocal,
      ulbAddress: ulbMaster?.ulbAddress || defaultUlbInfo.ulbAddress,
      emailId: ulbMaster?.emailId || defaultUlbInfo.emailId,
      websiteUrl: ulbMaster?.websiteUrl || defaultUlbInfo.websiteUrl,
      mobileNo: ulbMaster?.mobileNo || defaultUlbInfo.mobileNo,
      ulbLogo: ulbMaster?.ulbLogo || defaultUlbInfo.ulbLogo,
    };

    return {
      templates,
      libraryTemplates,
      departments: departments
        .filter((department) => department.id !== null && department.id !== undefined)
        .map((department) => ({
          id: String(department.id),
          name: department.departmentName || `Department ${department.id}`,
          nameLocal: department.departmentNameLocal || department.departmentName || `विभाग ${department.id}`,
        })),
      services: certificateEligibleServices.map((s) => {
        const deptInfo = deptMap.get(s.departmentId);
        return {
          id: String(s.id),
          name: s.serviceName,
          nameLocal: s.serviceNameLocal || s.serviceName,
          departmentId: s.departmentId,
          departmentName: s.departmentName || deptInfo?.name || "General Administration",
          departmentNameLocal:
            (typeof s.departmentNameLocal === "string" ? s.departmentNameLocal : "") ||
            deptInfo?.nameLocal ||
            s.departmentName ||
            "सामान्य प्रशासन",
        };
      }),
      ulbInfo,
    };
  } catch (error) {
    console.error("Error fetching certificate templates page data:", error);
    return { templates: [], libraryTemplates: [], departments: [], services: [], ulbInfo: defaultUlbInfo };
  }
}

export async function fetchAvailableTagsAction(serviceId: number): Promise<CertificateAvailableTag[]> {
  try {
    return await getAvailableTagsForService(serviceId);
  } catch (error) {
    console.error("Error fetching available tags:", error);
    return [];
  }
}

export async function fetchCertificateServiceFieldsAction(
  serviceId: number,
  departmentId?: number
): Promise<RtsFieldDefinitionApiItem[]> {
  try {
    return await getRtsFieldDefinitionsByServiceId(serviceId, departmentId);
  } catch (error) {
    console.error("Error fetching certificate service fields:", error);
    return [];
  }
}

export async function saveCertificateTemplateAction(
  formData: CertificateTemplateFormData
): Promise<{ success: boolean; error?: string; template?: RTSCertificateTemplate }> {
  try {
    const defaultConditionsJson =
      formData.defaultConditions && formData.defaultConditions.length > 0
        ? JSON.stringify(formData.defaultConditions)
        : undefined;

    const officerFieldsConfigJson =
      formData.officerFields && formData.officerFields.length > 0
        ? JSON.stringify(formData.officerFields)
        : undefined;

    let savedTemplate: RTSCertificateTemplate;

    if (formData.id) {
      const updatePayload: UpdateRTSCertificateTemplateInput = {
        id: formData.id,
        serviceId: Number(formData.serviceId),
        templateName: formData.templateName,
        templateCode: formData.templateCode,
        headerContent: formData.headerContent,
        bodyContent: formData.bodyContent,
        footerContent: formData.footerContent,
        designJson: formData.designJson,
        defaultConditionsJson,
        officerFieldsConfigJson,
        isActive: formData.isActive,
      };
      savedTemplate = await updateCertificateTemplate(formData.id, updatePayload);
    } else {
      const createPayload: CreateRTSCertificateTemplateInput = {
        serviceId: Number(formData.serviceId),
        templateName: formData.templateName,
        templateCode: formData.templateCode,
        headerContent: formData.headerContent,
        bodyContent: formData.bodyContent,
        footerContent: formData.footerContent,
        designJson: formData.designJson,
        defaultConditionsJson,
        officerFieldsConfigJson,
        isActive: formData.isActive,
      };
      savedTemplate = await createCertificateTemplate(createPayload);
    }

    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success: true, template: savedTemplate };
  } catch (error: unknown) {
    console.error("Error saving certificate template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save template",
    };
  }
}

export async function deleteCertificateTemplateAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteCertificateTemplate(id);
    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success: res };
  } catch (error: unknown) {
    console.error("Error deleting certificate template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete template",
    };
  }
}

export async function saveCertificateLibraryTemplateAction(
  formData: CertificateLibraryTemplateFormData
): Promise<{ success: boolean; error?: string; template?: RTSCertificateLibraryTemplate }> {
  try {
    let savedTemplate: RTSCertificateLibraryTemplate;
    if (formData.id) {
      const payload: UpdateRTSCertificateLibraryTemplateInput = {
        ...formData,
        id: formData.id,
      };
      savedTemplate = await updateCertificateLibraryTemplate(formData.id, payload);
    } else {
      const payload: CreateRTSCertificateLibraryTemplateInput = formData;
      savedTemplate = await createCertificateLibraryTemplate(payload);
    }

    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success: true, template: savedTemplate };
  } catch (error: unknown) {
    console.error("Error saving reusable certificate template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save reusable template",
    };
  }
}

export async function deleteCertificateLibraryTemplateAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await deleteCertificateLibraryTemplate(id);
    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success };
  } catch (error: unknown) {
    console.error("Error deleting reusable certificate template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete reusable template",
    };
  }
}
