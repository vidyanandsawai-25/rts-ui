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

// Get building permissions (certificate types with status)
export async function getBuildingPermissionsAction(
  propertyId: string
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
  try {
    const response = await getCertificateTypesWithStatus(propertyId);
    return response;
  } catch (error: unknown) {
    logger.error("getBuildingPermissionsAction failed", { propertyId, error: error as Error });
    const message = error instanceof Error ? error.message : "Failed to load certificates";
    return { success: false, data: undefined, error: message };
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
    
    if (!Number.isFinite(propertyId)) {
      return { success: false, error: "Invalid Property ID" };
    }
    if (!Number.isFinite(certificateTypeId)) {
      return { success: false, error: "Invalid Certificate Type ID" };
    }

    const response = await uploadCertificateDocument(
      file,
      propertyId,
      certificateTypeId,
      certificateNo || undefined,
      issueDate || undefined
    );

    return response;
  } catch (error: unknown) {
    logger.error("uploadCertificateDocumentAction failed", { error: error as Error });
    const message = error instanceof Error ? error.message : "Failed to upload document";
    return { success: false, data: undefined, error: message };
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

    const response = await replaceCertificateDocument(propertyCertificateId, file);
    return response;
  } catch (error: unknown) {
    logger.error("replaceCertificateDocumentAction failed", { propertyCertificateId, error: error as Error });
    const message = error instanceof Error ? error.message : "Failed to replace document";
    return { success: false, data: undefined, error: message };
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
    }
    return response;
  } catch (error: unknown) {
    logger.error("saveBuildingPermissionsAction failed", { propertyId, error: error as Error });
    const message = error instanceof Error ? error.message : "Failed to save certificates";
    return { success: false, data: undefined, error: message };
  }
}