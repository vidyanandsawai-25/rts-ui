"use server";

import { revalidatePath } from "next/cache";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import {
  createCertificateTemplate,
  deleteCertificateTemplate,
  getAllCertificateTemplates,
  getAvailableTagsForService,
  updateCertificateTemplate,
} from "@/lib/api/rts/rtscertificate.service";
import { getUlbMaster } from "@/lib/api/configuration-settings/ulb-configuration/ulb-master.services";
import type {
  CertificateAvailableTag,
  CreateRTSCertificateTemplateInput,
  RTSCertificateTemplate,
  UpdateRTSCertificateTemplateInput,
} from "@/types/rts/certificate.types";

export type CertificateTemplateFormData = {
  id?: number;
  serviceId: string;
  templateName: string;
  templateCode: string;
  headerContent?: string;
  bodyContent: string;
  footerContent?: string;
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
  services: { id: string; name: string; departmentName?: string }[];
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
    const [templates, services, ulbMaster, departments] = await Promise.all([
      getAllCertificateTemplates().catch(() => []),
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

    // Filter services based on IsCertificateRequired column from ServiceMaster (Default is true if null/undefined)
    const certificateEligibleServices = services.filter((s) => {
      return s.isCertificateRequired !== false;
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
      services: certificateEligibleServices.map((s) => {
        const deptInfo = deptMap.get(s.departmentId);
        return {
          id: String(s.id),
          name: s.serviceName,
          nameLocal: s.serviceNameLocal || s.serviceName,
          departmentId: s.departmentId,
          departmentName: s.departmentName || deptInfo?.name || "General Administration",
          departmentNameLocal: s.departmentNameLocal || deptInfo?.nameLocal || s.departmentName || "सामान्य प्रशासन",
        };
      }),
      ulbInfo,
    };
  } catch (error) {
    console.error("Error fetching certificate templates page data:", error);
    return { templates: [], services: [], ulbInfo: defaultUlbInfo };
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
        defaultConditionsJson,
        officerFieldsConfigJson,
        isActive: formData.isActive,
      };
      savedTemplate = await createCertificateTemplate(createPayload);
    }

    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success: true, template: savedTemplate };
  } catch (error: any) {
    console.error("Error saving certificate template:", error);
    return { success: false, error: error.message || "Failed to save template" };
  }
}

export async function deleteCertificateTemplateAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await deleteCertificateTemplate(id);
    revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    return { success: res };
  } catch (error: any) {
    console.error("Error deleting certificate template:", error);
    return { success: false, error: error.message || "Failed to delete template" };
  }
}
