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

export async function fetchCertificateTemplatesPageDataAction(): Promise<{
  templates: RTSCertificateTemplate[];
  services: { id: string; name: string; departmentName?: string }[];
}> {
  try {
    const [templates, services] = await Promise.all([
      getAllCertificateTemplates(),
      getAllRtsServices(),
    ]);

    return {
      templates,
      services: services.map((s) => ({
        id: String(s.id),
        name: s.serviceName,
        departmentName: s.departmentName ?? undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching certificate templates page data:", error);
    return { templates: [], services: [] };
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
    return { success: false, error: error?.message || "Failed to save certificate template" };
  }
}

export async function deleteCertificateTemplateAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await deleteCertificateTemplate(id);
    if (success) {
      revalidatePath("/[locale]/rts/configuration-settings/rts-certificates", "page");
    }
    return { success };
  } catch (error: any) {
    console.error("Error deleting certificate template:", error);
    return { success: false, error: error?.message || "Failed to delete certificate template" };
  }
}
