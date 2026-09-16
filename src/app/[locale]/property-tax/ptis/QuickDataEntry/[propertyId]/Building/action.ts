"use server";

import {
  getCertificateTypesWithStatus,
  getCertificateTypeMaster,
  getWingsByProperty,
  getUnitsByProperty,
  replaceCertificateDocument,
  deleteCertificateDocument,
  bulkSaveCertificates,
  getFloorCertificates,
  saveCertificate,
  deletePropertyCertificate,
  deletePropertyCertificateByDocumentId,
  getSocietyWingTypesWithStatus,
  postApartmentQcCertificateRecord,
} from "@/lib/api/building.service";
import { getDocumentDetails } from "@/lib/api/document.service";
import { fetchApartmentQcCertificateGrid } from "@/lib/api/ptis/apartment/apartment-qc-top-section.service";

import { 
  PropertyCertificateWithStatusDto, 
  PropertyCertificateUploadResponseDto, 
  PropertyCertificateBulkSaveDto,
  FloorCertificatesResponseDto,
  SaveCertificateResponseDto,
  SaveCertificateRequestDto,
  CreateCertificateRecordResponseDto
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
  if (lower.includes("taskcanceledexception") || lower.includes("task was canceled") || lower.includes("timeout"))
    return t("building.errors.timeoutError") || "The server took too long to process retrospective tax calculations. The certificate record was saved, but calculation is processing in the background.";
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

export async function getSocietyWingTypesWithStatusAction(
  societyDetailId?: number | null,
  wingDetailId?: number | null
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
  try { 
    return await getSocietyWingTypesWithStatus(societyDetailId, wingDetailId);
  } catch (error: unknown) {
    logger.error("getSocietyWingTypesWithStatusAction failed", { societyDetailId, wingDetailId, error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function getCertificateTypeMasterAction(): Promise<ApiResponse<unknown[]>> {
  try {
    return await getCertificateTypeMaster();
  } catch (error: unknown) {
    logger.error("getCertificateTypeMasterAction failed", { error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function getWingsByPropertyAction(propertyId: string): Promise<ApiResponse<unknown[]>> {
  try {
    return await getWingsByProperty(propertyId);
  } catch (error: unknown) {
    logger.error("getWingsByPropertyAction failed", { propertyId, error: error as Error });
    return handleActionError(error, "building.errors.notFound", undefined, "quickDataEntry", cleanBuildingApiError);
  }
}

export async function getUnitsByPropertyAction(
  propertyId: string,
  wingDetailId?: number | null,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<unknown[]> & { totalCount?: number }> {
  try {
    return await getUnitsByProperty(propertyId, wingDetailId, pageNumber, pageSize);
  } catch (error: unknown) {
    logger.error("getUnitsByPropertyAction failed", { propertyId, wingDetailId, pageNumber, pageSize, error: error as Error });
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

export async function getApartmentQcCertificateGridAction(
  propertyId?: string | number | null,
  wingDetailsId?: number | string | null,
  societyId?: number | string | null
): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetchApartmentQcCertificateGrid({
      propertyId,
      wingDetailsId,
      societyId,
    });
    if (res.success && res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to fetch certificate grid' };
  } catch (error: unknown) {
    logger.error("getApartmentQcCertificateGridAction failed", { propertyId, wingDetailsId, societyId, error: error as Error });
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

export async function postApartmentQcCertificateRecordAction(
  locale: string,
  propertyId: string,
  formData: FormData
): Promise<ApiResponse<CreateCertificateRecordResponseDto>> {
  try {
    const payloadStr = formData.get("payload") as string;
    if (!payloadStr) {
      return { success: false, error: "Missing payload data" };
    }
    const payload = JSON.parse(payloadStr) as {
      level: "Apartment" | "Wing" | "Unit";
      selectedWingDetailId: number | null;
      selectedUnitIds: number[];
      isAllUnitsSelected?: boolean;
      certificateTypeId: number;
      certificateDate: string;
      certificateNumber: string;
      status?: string;
      societyDetailId?: number | null;
    };
    const attachedFile = formData.get("file") as File | null;
    const certNo = payload.certificateNumber?.trim() || "";
    const issueDate = payload.certificateDate || "";
    const status = payload.status || "Active";

    const validSocietyDetailId = (payload.societyDetailId && payload.societyDetailId > 0) ? payload.societyDetailId : undefined;

    let res: ApiResponse<CreateCertificateRecordResponseDto>;

    if (payload.level === "Apartment") {
      // Apartment → level 0
      res = await postApartmentQcCertificateRecord({
        level: 0,
        ...(validSocietyDetailId ? { societyId: validSocietyDetailId, societyDetailId: validSocietyDetailId } : {}),
        certificateTypeId: payload.certificateTypeId,
        certificateNo: certNo,
        certificateIssueDate: issueDate,
        status,
      });
    } else if (payload.level === "Wing" || (payload.level === "Unit" && payload.isAllUnitsSelected)) {
      // Wing (or Unit-level-all-selected) → level 1
      res = await postApartmentQcCertificateRecord({
        level: 1,
        ...(validSocietyDetailId ? { societyId: validSocietyDetailId, societyDetailId: validSocietyDetailId } : {}),
        wingDetailId: payload.selectedWingDetailId,
        certificateTypeId: payload.certificateTypeId,
        certificateNo: certNo,
        certificateIssueDate: issueDate,
        status,
      });
    } else {
      // Unit level → level 2 with unitPropertyIds array
      const selectedIds = payload.selectedUnitIds.length > 0 ? payload.selectedUnitIds : [];
      res = await postApartmentQcCertificateRecord({
        level: 2,
        ...(validSocietyDetailId ? { societyId: validSocietyDetailId, societyDetailId: validSocietyDetailId } : {}),
        wingDetailId: payload.selectedWingDetailId,
        unitPropertyIds: selectedIds,
        certificateTypeId: payload.certificateTypeId,
        certificateNo: certNo,
        certificateIssueDate: issueDate,
        status,
      });
    }

    if (!res.success) return res;

    // If a document was attached, upload it for every created/updated PropertyCertificate record
    const rawData = res.data as unknown as Record<string, unknown> | undefined;
    let createdCertIds: number[] = [];
    if (rawData) {
      const rawIds = rawData.propertyCertificateIds ?? rawData.PropertyCertificateIds;
      if (Array.isArray(rawIds)) {
        createdCertIds = rawIds.map(Number).filter((n) => !isNaN(n) && n > 0);
      } else if (typeof rawData.propertyCertificateId === 'number' && rawData.propertyCertificateId > 0) {
        createdCertIds = [rawData.propertyCertificateId];
      } else if (typeof rawData.PropertyCertificateId === 'number' && rawData.PropertyCertificateId > 0) {
        createdCertIds = [rawData.PropertyCertificateId];
      }
    }

    // Robust Fallback: if createdCertIds is empty and we have an attachedFile, query to resolve the certificate ID
    if (attachedFile && createdCertIds.length === 0) {
      try {
        if (payload.level === 'Wing' && payload.selectedWingDetailId) {
          const wingCertsRes = await getSocietyWingTypesWithStatusAction(payload.societyDetailId, payload.selectedWingDetailId);
          if (wingCertsRes.success && wingCertsRes.data) {
            const match = wingCertsRes.data.find((c) => c.certificateTypeId === payload.certificateTypeId);
            if (match?.propertyCertificateId && match.propertyCertificateId > 0) {
              createdCertIds = [match.propertyCertificateId];
            }
          }
        } else if (payload.level === 'Apartment' && payload.societyDetailId) {
          const socCertsRes = await getSocietyWingTypesWithStatusAction(payload.societyDetailId, null);
          if (socCertsRes.success && socCertsRes.data) {
            const match = socCertsRes.data.find((c) => c.certificateTypeId === payload.certificateTypeId);
            if (match?.propertyCertificateId && match.propertyCertificateId > 0) {
              createdCertIds = [match.propertyCertificateId];
            }
          }
        } else if (payload.level === 'Unit' && payload.selectedUnitIds.length > 0) {
          for (const uPropId of payload.selectedUnitIds) {
            const unitCertsRes = await getBuildingPermissionsAction(String(uPropId));
            if (unitCertsRes.success && unitCertsRes.data) {
              const match = unitCertsRes.data.find((c) => c.certificateTypeId === payload.certificateTypeId);
              if (match?.propertyCertificateId && match.propertyCertificateId > 0 && !createdCertIds.includes(match.propertyCertificateId)) {
                createdCertIds.push(match.propertyCertificateId);
              }
            }
          }
        }
      } catch (fallbackErr) {
        logger.warn('Could not resolve created certificate ID via fallback', { error: fallbackErr as Error });
      }
    }

    if (attachedFile) {
      if (createdCertIds.length === 0) {
        return {
          success: false,
          error: 'Certificate was saved, but the certificate ID could not be identified to attach the document. Please try re-attaching the file.',
        };
      }

      const uploadTasks = createdCertIds.map((certId) =>
        replaceCertificateDocument(
          certId,
          attachedFile,
          Number(propertyId),
          payload.certificateTypeId
        )
      );
      const uploadResults = await Promise.all(uploadTasks);
      const failedUpload = uploadResults.find((r) => !r.success);
      if (failedUpload) {
        logger.error('Document binding upload encountered issue', {
          propertyId,
          error: failedUpload.error ? new Error(failedUpload.error) : undefined,
        });
        return {
          success: false,
          error: failedUpload.error || 'Certificate metadata was saved, but document upload failed. Please try re-attaching the document.',
        };
      }
    }

    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    return {
      success: true,
      data: res.data,
      message: res.message || 'Certificate saved successfully',
    };
  } catch (error: unknown) {
    logger.error('postApartmentQcCertificateRecordAction failed', { propertyId, error: error as Error });
    return handleActionError(error, 'building.saveError', locale, 'quickDataEntry', cleanBuildingApiError);
  }
}

export interface DeletePropertyCertificateRecordParams {
  certificateTypeId: number;
  documentGuid?: string | null;
  documentId?: number | null;
  propertyCertificateId?: number | null;
  level?: "Apartment" | "Wing" | "Unit" | string;
  selectedWingDetailId?: number | null;
  selectedUnitIds?: number[];
  societyDetailId?: number | null;
}

export async function deletePropertyCertificateRecordAction(
  locale: string,
  propertyId: string,
  params: DeletePropertyCertificateRecordParams
): Promise<ApiResponse<void>> {
  try {
    let docId = params.documentId;

    // If documentGuid is provided but not documentId, resolve DocumentId via getDocumentDetails
    if (!docId && params.documentGuid && params.documentGuid.trim().length > 0 && params.documentGuid !== "pending") {
      try {
        const docRes = await getDocumentDetails(params.documentGuid);
        if (docRes.success && docRes.data) {
          const raw = docRes.data as unknown as Record<string, unknown>;
          const items = raw?.items as Record<string, unknown> | undefined;
          const resolvedId = (items?.id ?? raw?.id ?? docRes.data.id) as number | undefined;
          if (typeof resolvedId === "number" && resolvedId > 0) {
            docId = resolvedId;
          }
        }
      } catch (err) {
        logger.warn("Could not resolve document details for delete", { documentGuid: params.documentGuid, err });
      }
    }

    if (docId && docId > 0) {
      // Primary soft delete: DELETE /api/property-certificates/by-document/{documentId}
      const res = await deletePropertyCertificateByDocumentId(docId);
      if (res.success) {
        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
        return {
          success: true,
          message: res.message || "Certificate and attached document deleted successfully",
        };
      }
      logger.warn("deletePropertyCertificateByDocumentId returned unsuccessful, attempting fallback", {
        docId,
        error: res.error ? new Error(res.error) : undefined,
      });
    }


    // Fallback if documentGuid exists
    if (params.documentGuid && params.documentGuid.trim().length > 0 && params.documentGuid !== "pending") {
      await deleteCertificateDocument(params.documentGuid);
    }

    // Fallback delete by propertyId & certificateTypeId
    if (params.certificateTypeId) {
      const propIdNum = parseInt(propertyId);
      const unitDetailsId = params.selectedUnitIds && params.selectedUnitIds.length > 0 ? params.selectedUnitIds[0] : null;
      await deletePropertyCertificate(propIdNum, params.certificateTypeId, unitDetailsId);
    }

    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    return {
      success: true,
      message: "Certificate deleted successfully",
    };
  } catch (error: unknown) {
    logger.error("deletePropertyCertificateRecordAction failed", { propertyId, params, error: error as Error });
    return handleActionError(error, "building.deleteError", locale, "quickDataEntry", cleanBuildingApiError);
  }
}