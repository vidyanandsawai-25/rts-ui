"use server";

import {
  getCertificateTypesWithStatus,
  uploadCertificateDocument,
  replaceCertificateDocument,
  bulkSaveCertificates,
} from "@/lib/api/building.service";
import { 
  PropertyCertificateWithStatusDto, 
  PropertyCertificateUploadResponseDto, 
  PropertyCertificateBulkSaveDto, 
  PropertyCertificateBulkSaveResponseDto 
} from "@/types/building-permission.types";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types/common.types";
import { logger } from "@/lib/utils/logger";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

async function getLocaleFromHeaders(): Promise<string> {
  try {
    const headersList = await headers();
    const referer = headersList.get("referer");
    if (referer) {
      const url = new URL(referer);
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length > 0 && ["en", "hi", "mr"].includes(pathParts[0])) {
        return pathParts[0];
      }
    }
  } catch {}
  return "en";
}

async function handleActionError<T>(error: unknown, fallbackKey: string, locale?: string): Promise<ApiResponse<T>> {
  const loc = locale || await getLocaleFromHeaders();
  const t = await getTranslations({ locale: loc, namespace: "quickDataEntry" });
  const msg = error instanceof Error ? error.message : (t(fallbackKey) || "An error occurred");
  return { success: false, error: await cleanApiError(msg, loc) };
}

async function cleanApiError(err: string | undefined | null, locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: "quickDataEntry" });
  if (!err) return t("building.saveError") || "An unexpected error occurred";
  const str = String(err).trim();
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      const errors = parsed.errors;
      if (errors && typeof errors === "object" && !Array.isArray(errors)) {
        for (const key of Object.keys(errors).filter(k => k !== "General" && k !== "dto")) {
          const val = errors[key];
          const msg = Array.isArray(val) ? val[0] : val;
          if (typeof msg === "string" && msg.trim()) return await cleanApiError(msg, locale);
        }
      }
      const msg = parsed.message || parsed.title;
      if (msg) return await cleanApiError(msg, locale);
    } catch {}
  }
  
  if (str.includes(";")) {
    const parts = str.split(";").map(p => p.trim()).filter(Boolean);
    const cleanedParts = await Promise.all(parts.map(p => cleanApiError(p, locale)));
    return cleanedParts.join("; ");
  }

  const match = str.match(/^(Certificate Type \d+):\s*(.*)$/i);
  if (match) {
    const prefix = match[1];
    const inner = match[2];
    const cleanedInner = await cleanApiError(inner, locale);
    return `${prefix}: ${cleanedInner}`;
  }

  const cleanMsg = str.toLowerCase();
  if (cleanMsg.includes("without an issue date")) {
    return t("building.errors.cannotEnableWithoutDate") || "Cannot enable certificate without an issue date.";
  }
  if (cleanMsg.includes("without a certificate number")) {
    return t("building.errors.cannotEnableWithoutNumber") || "Cannot enable certificate without a certificate number.";
  }
  if (cleanMsg.includes("cannot be in the future")) {
    return t("building.errors.futureDate") || "Issue date cannot be in the future.";
  }
  if (cleanMsg.includes("cannot exceed 100 characters")) {
    return t("building.errors.numberExceedsLimit") || "Certificate number cannot exceed 100 characters.";
  }
  if (cleanMsg.includes("not found")) {
    return t("building.errors.notFound") || "Certificate not found.";
  }
  if (cleanMsg.includes("could not be converted") || cleanMsg.includes("system.nullable")) {
    return t("common.validation.invalidDate") || "Value format is invalid.";
  }
  if (cleanMsg.includes("dto field is required")) {
    return t("common.validation.documentRequired") || "Required information is missing.";
  }
  return str;
}

// Get building permissions (certificate types with status)
export async function getBuildingPermissionsAction(
  propertyId: string
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
  try {
    const response = await getCertificateTypesWithStatus(propertyId);
    return response;
  } catch (error: unknown) {
    logger.error("getBuildingPermissionsAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.errors.notFound");
  }
}

// Upload a certificate document
export async function uploadCertificateDocumentAction(
  formData: FormData
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
  try {
    const file = formData.get("File") as File | null;
    const propertyIdStr = formData.get("PropertyId") as string | null;
    const certificateTypeIdStr = formData.get("CertificateTypeId") as string | null;
    const certificateNo = formData.get("CertificateNo") as string | null;
    const issueDate = formData.get("IssueDate") as string | null;

    if (!file) return { success: false, error: "No file provided" };
    if (!propertyIdStr) return { success: false, error: "Property ID is required" };
    if (!certificateTypeIdStr) return { success: false, error: "Certificate Type ID is required" };

    const propertyId = parseInt(propertyIdStr);
    const certificateTypeId = parseInt(certificateTypeIdStr);
    
    if (!Number.isFinite(propertyId)) return { success: false, error: "Invalid Property ID" };
    if (!Number.isFinite(certificateTypeId)) return { success: false, error: "Invalid Certificate Type ID" };

    return await uploadCertificateDocument(
      file,
      propertyId,
      certificateTypeId,
      certificateNo || undefined,
      issueDate || undefined
    );
  } catch (error: unknown) {
    logger.error("uploadCertificateDocumentAction failed", { error: error as Error });
    return handleActionError(error, "building.uploadError");
  }
}

// Replace a certificate document
export async function replaceCertificateDocumentAction(
  propertyCertificateId: number,
  formData: FormData
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
  try {
    const file = formData.get("File") as File | null;
    if (!file) return { success: false, error: "No file provided" };

    return await replaceCertificateDocument(propertyCertificateId, file);
  } catch (error: unknown) {
    logger.error("replaceCertificateDocumentAction failed", { propertyCertificateId, error: error as Error });
    return handleActionError(error, "building.uploadError");
  }
}

// Save all certificates (bulk save)
export async function saveBuildingPermissionsAction(
  locale: string,
  propertyId: string,
  payload: PropertyCertificateBulkSaveDto
): Promise<ApiResponse<PropertyCertificateBulkSaveResponseDto>> {
  try {
    const response = await bulkSaveCertificates(payload);
    if (response.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
      return response;
    }
    return {
      ...response,
      error: await cleanApiError(response.error, locale)
    };
  } catch (error: unknown) {
    logger.error("saveBuildingPermissionsAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.saveError", locale);
  }
}