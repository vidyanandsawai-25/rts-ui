"use server";

import {
  getCertificateTypesWithStatus,
  replaceCertificateDocument,
  deleteCertificateDocument,
  bulkSaveCertificates,
} from "@/lib/api/building.service";
import { 
  PropertyCertificateWithStatusDto, 
  PropertyCertificateUploadResponseDto, 
  PropertyCertificateBulkSaveDto 
} from "@/types/building-permission.types";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types/common.types";
import { logger } from "@/lib/utils/logger";
import { getTranslations } from "next-intl/server";
import {
  parseJsonApiError,
  handleActionError,
} from "@/lib/utils/action-error-helpers";

/**
 * Building-specific error cleaner: extends common patterns with
 * certificate-specific error messages (semicolons, prefixes, domain errors).
 */
async function cleanBuildingApiError(
  err: string | undefined | null,
  locale: string,
  _namespace = "quickDataEntry"
): Promise<string> {
  const t = await getTranslations({ locale, namespace: "quickDataEntry" });
  if (!err) return t("building.saveError") || "An unexpected error occurred";

  const str = String(err).trim();

  const jsonResult = await parseJsonApiError(str, locale, "quickDataEntry");
  if (jsonResult) return jsonResult;

  if (str.includes(";")) {
    const parts = str.split(";").map(p => p.trim()).filter(Boolean);
    const cleaned = await Promise.all(parts.map(p => cleanBuildingApiError(p, locale)));
    return cleaned.join("; ");
  }

  const match = str.match(/^(Certificate Type \d+):\s*(.*)$/i);
  if (match) {
    const prefix = match[1];
    const inner = match[2];
    return `${prefix}: ${await cleanBuildingApiError(inner, locale)}`;
  }

  const lower = str.toLowerCase();
  if (lower.includes("without an issue date"))
    return t("building.errors.cannotEnableWithoutDate") || "Cannot enable document without an issue date.";
  if (lower.includes("without a certificate number"))
    return t("building.errors.cannotEnableWithoutNumber") || "Cannot enable document without a document number.";
  if (lower.includes("cannot be in the future"))
    return t("building.errors.futureDate") || "Issue date cannot be in the future.";
  if (lower.includes("cannot exceed 100 characters"))
    return t("building.errors.numberExceedsLimit") || "Document number cannot exceed 100 characters.";
  if (lower.includes("not found"))
    return t("building.errors.notFound") || "Document not found.";
  if (lower.includes("could not be converted") || lower.includes("system.nullable"))
    return t("common.validation.invalidDate") || "Value format is invalid.";
  if (lower.includes("dto field is required"))
    return t("common.validation.documentRequired") || "Required information is missing.";

  return str;
}

export async function getBuildingPermissionsAction(
  propertyId: string
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
  try {
    return await getCertificateTypesWithStatus(propertyId);
  } catch (error: unknown) {
    logger.error("getBuildingPermissionsAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function replaceCertificateDocumentAction(
  propertyCertificateId: number,
  formData: FormData,
  locale: string,
  propertyId: string
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
  try {
    const file = formData.get("File") as File | null;
    const certTypeId = Number(formData.get("CertificateTypeId") || "0");
    const propIdNum = Number(formData.get("PropertyId") || propertyId || "0");
    if (!file) return { success: false, error: "No file provided" };

    const result = await replaceCertificateDocument(propertyCertificateId, file, propIdNum, certTypeId);
    if (result.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return result;
  } catch (error: unknown) {
    logger.error("replaceCertificateDocumentAction failed", { propertyCertificateId, error: error as Error });
    return handleActionError(error, "building.uploadError", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function saveBuildingPermissionsAction(
  locale: string,
  propertyId: string,
  formData: FormData,
  skipRevalidate?: boolean
): Promise<ApiResponse<void>> {
  try {
    const payloadStr = formData.get("certificates") as string;
    const payload = JSON.parse(payloadStr) as PropertyCertificateBulkSaveDto;

    const initialResponse = await getCertificateTypesWithStatus(propertyId);
    const initialCerts = initialResponse.success && initialResponse.data ? initialResponse.data : [];

    // Delete any removed documents
    for (const cert of payload.certificates) {
      const initialCert = initialCerts.find(c => c.certificateTypeId === cert.certificateTypeId);
      const oldGuid = initialCert?.documentGuid;
      const file = formData.get(`file_${cert.certificateTypeId}`) as File | null;

      if (oldGuid && !file && (cert.markedForDeletion || !cert.isEnabled || !cert.existingDocumentGuid)) {
        await deleteCertificateDocument(oldGuid);
      }
    }

    const response = await bulkSaveCertificates(payload);
    if (!response.success || !response.data?.updatedCertificates) {
      return { success: false, error: await cleanBuildingApiError(response.error, locale) };
    }

    const updatedCerts = response.data.updatedCertificates;

    for (const cert of payload.certificates) {
      const file = formData.get(`file_${cert.certificateTypeId}`) as File | null;
      if (file) {
        const match = updatedCerts.find(c => c.certificateTypeId === cert.certificateTypeId);
        const propertyCertificateId = match?.propertyCertificateId || cert.propertyCertificateId;
        if (!propertyCertificateId) {
          throw new Error("Certificate not initialized or found.");
        }
        const uploadResult = await replaceCertificateDocument(
          propertyCertificateId,
          file,
          Number(propertyId),
          cert.certificateTypeId
        );
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Upload failed");
        }
      }
    }

    if (!skipRevalidate) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return { success: true };
  } catch (error: unknown) {
    logger.error("saveBuildingPermissionsAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.saveError", locale, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function deleteCertificateDocumentAction(
  documentGuid: string,
  locale: string,
  propertyId: string
): Promise<ApiResponse<void>> {
  try {
    const result = await deleteCertificateDocument(documentGuid);
    if (result.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return result;
  } catch (error: unknown) {
    logger.error("deleteCertificateDocumentAction failed", { documentGuid, error: error as Error });
    return handleActionError(error, "building.deleteError", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}