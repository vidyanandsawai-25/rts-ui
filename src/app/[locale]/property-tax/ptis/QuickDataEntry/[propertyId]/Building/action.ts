"use server";

import {
  getCertificateTypesWithStatus,
  replaceCertificateDocument,
  deleteCertificateDocument,
  bulkSaveCertificates,
  getFloorCertificates,
  saveCertificate,
  deletePropertyCertificate,
} from "@/lib/api/building.service";
import { 
  PropertyCertificateWithStatusDto, 
  PropertyCertificateUploadResponseDto, 
  PropertyCertificateBulkSaveDto,
  FloorCertificatesResponseDto,
  SaveCertificateResponseDto,
  SaveCertificateRequestDto
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
  propertyId: string,
  propertyDetailsId?: number | null
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
  try {
    return await getCertificateTypesWithStatus(propertyId, propertyDetailsId);
  } catch (error: unknown) {
    logger.error("getBuildingPermissionsAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function getFloorCertificatesAction(
  propertyId: string,
  selectedPropertyDetailsId?: number | null
): Promise<ApiResponse<FloorCertificatesResponseDto>> {
  try {
    return await getFloorCertificates(propertyId, selectedPropertyDetailsId);
  } catch (error: unknown) {
    logger.error("getFloorCertificatesAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function saveCertificateAction(
  locale: string,
  propertyId: string,
  data: SaveCertificateRequestDto
): Promise<ApiResponse<SaveCertificateResponseDto>> {
  try {
    const result = await saveCertificate(data);
    if (result.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return result;
  } catch (error: unknown) {
    logger.error("saveCertificateAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.saveError", undefined, "quickDataEntry", cleanBuildingApiError);
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

    // Group certificates by propertyDetailsId to fetch their baseline statuses concurrently
    const detailsIds = Array.from(new Set(payload.certificates.map(c => c.propertyDetailsId ?? null)));
    const initialCertsMap = new Map<number | null, PropertyCertificateWithStatusDto[]>();
    const statusResponses = await Promise.all(
      detailsIds.map(dId => getCertificateTypesWithStatus(propertyId, dId))
    );
    detailsIds.forEach((dId, idx) => {
      const res = statusResponses[idx];
      if (res.success && res.data) {
        initialCertsMap.set(dId, res.data);
      }
    });

    // Process removals in parallel
    const deleteTasks: Promise<unknown>[] = [];
    const certificatesToSave = [];
    for (const cert of payload.certificates) {
      const scopedCerts = initialCertsMap.get(cert.propertyDetailsId ?? null) || [];
      const initialCert = scopedCerts.find(c => c.certificateTypeId === cert.certificateTypeId);
      const oldGuid = initialCert?.documentGuid;
      const certId = initialCert?.propertyCertificateId;
      const file = formData.get(`file_${cert.certificateTypeId}`) as File | null;

      if (cert.markedForDeletion || !cert.isEnabled) {
        if (certId) {
          deleteTasks.push(deletePropertyCertificate(Number(propertyId), cert.certificateTypeId, cert.propertyDetailsId ?? null));
          continue;
        } else if (oldGuid) {
          deleteTasks.push(deleteCertificateDocument(oldGuid));
        }
      } else if (!file && !cert.existingDocumentGuid && oldGuid) {
        deleteTasks.push(deleteCertificateDocument(oldGuid));
      }
      certificatesToSave.push(cert);
    }

    if (deleteTasks.length > 0) {
      await Promise.all(deleteTasks);
    }

    payload.certificates = certificatesToSave;

    if (payload.certificates.length > 0) {
      const response = await bulkSaveCertificates(payload);
      if (!response.success || !response.data?.updatedCertificates) {
        const rawErr = response.error || response.message || "An error occurred while saving the certificate";
        const cleaned = await cleanBuildingApiError(rawErr, locale);
        return {
          success: false,
          error: cleaned,
          message: cleaned,
          statusCode: response.statusCode || 500
        };
      }

      // Build a lookup map from the bulk save response to avoid N+1 re-fetches
      const certLookup = new Map<number, number>();
      for (const updated of response.data.updatedCertificates) {
        if (updated.certificateTypeId && updated.propertyCertificateId) {
          certLookup.set(updated.certificateTypeId, updated.propertyCertificateId);
        }
      }

      // Upload files concurrently
      const uploadTasks = payload.certificates.map(async (cert) => {
        const file = formData.get(`file_${cert.certificateTypeId}`) as File | null;
        if (file) {
          let propertyCertificateId: number | null = certLookup.get(cert.certificateTypeId) ?? null;

          // Fallback: fetch only if lookup map didn't contain the ID
          if (!propertyCertificateId) {
            const detailRes = await getCertificateTypesWithStatus(propertyId, cert.propertyDetailsId);
            if (detailRes.success && detailRes.data) {
              const scopedMatch = detailRes.data.find(c => c.certificateTypeId === cert.certificateTypeId);
              propertyCertificateId = scopedMatch?.propertyCertificateId || null;
            }
          }

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
      });

      if (uploadTasks.length > 0) {
        await Promise.all(uploadTasks);
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

export async function deletePropertyCertificateAction(
  propertyId: number,
  certificateTypeId: number,
  propertyDetailsId: number | null,
  locale: string,
  frontendPropertyIdString: string
): Promise<ApiResponse<void>> {
  try {
    const result = await deletePropertyCertificate(propertyId, certificateTypeId, propertyDetailsId);
    if (result.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${frontendPropertyIdString}/Building`, 'page');
    }
    return result;
  } catch (error: unknown) {
    logger.error("deletePropertyCertificateAction failed", { propertyId, certificateTypeId, error: error as Error });
    return handleActionError(error, "building.deleteError", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}