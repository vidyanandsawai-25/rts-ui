import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { uploadDocument, deleteDocument } from "../../document.service";
import { DocumentUploadParams } from "@/types/document.types";
import { DEPARTMENT_ID, MODULE_ID, REFERENCE_TABLE, DOCUMENT_TYPE } from "../../../constants/document.constants";
import type { 
  PropertyPhotoDto, 
  PropertyPhotoTypeWithStatusDto, 
  PropertyPhotoUploadResponseDto,
  PropertyPhotoGalleryDto
} from "@/types/photoplan.types";

interface BackendApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  items: T;
  errors?: string[];
}

export const photoPlanService = {
  // 1. GET - All current photos for a property
  async getPhotosByProperty(propertyId: number): Promise<ApiResponse<PropertyPhotoDto[]>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoDto[]>>(`/property-photos/property/${propertyId}`, { cache: 'no-store' });
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 1b. GET - All grouped photos for a property (nested by category)
  async getGroupedPhotosByProperty(propertyId: number): Promise<ApiResponse<PropertyPhotoGalleryDto>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoGalleryDto>>(`/property-photos/property/${propertyId}/grouped`, { cache: 'no-store' });
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 2. GET - All active photo types with status for a property
  async getPhotoTypesWithStatus(propertyId: number): Promise<ApiResponse<PropertyPhotoTypeWithStatusDto[]>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoTypeWithStatusDto[]>>(`/property-photos/types-with-status/${propertyId}`, { cache: 'no-store' });
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  async uploadPhotoViaGlobalApi(
    file: File,
    propertyId: number,
    photoTypeId: number,
    propertyPhotoId: number,
    _referenceTableIdGuid?: string,
    remarks?: string,
    photoTypeCode?: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    try {
      const uploadParams: DocumentUploadParams = {
        departmentId: DEPARTMENT_ID.PTIS,
        moduleId: MODULE_ID.PropertyPhoto,
        bindingPurpose: remarks || "Photo",
        documentType: photoTypeCode || String(photoTypeId),
        isPrimaryDocument: true
      };

      uploadParams.referenceTableName = REFERENCE_TABLE.PropertyPhoto;

      if (propertyPhotoId > 0 && propertyPhotoId !== 9998 && propertyPhotoId !== 9999) {
        uploadParams.referenceTableId = propertyPhotoId;
        uploadParams.referencePropertyName = "PropertyPhotoId";
      } else {
        uploadParams.referenceTableId = propertyId;
        uploadParams.referencePropertyName = "PropertyId";
      }

      const uploadResponse = await uploadDocument(file, uploadParams);

      if (!uploadResponse.documentGuid) {
        throw new Error("Failed to retrieve document GUID from upload.");
      }

      // Fetch the updated photos for the property to retrieve the new PropertyPhotoId
      const photosResponse = await this.getPhotosByProperty(propertyId);
      if (!photosResponse.success || !photosResponse.data) {
        throw new Error(photosResponse.error || "Failed to retrieve photos list to identify the new photo ID.");
      }

      const newPhoto = photosResponse.data.find(
        (p) => p.documentGuid === uploadResponse.documentGuid || p.documentBindingId === uploadResponse.documentBindingId
      );

      if (!newPhoto) {
        throw new Error("Uploaded photo not found in property photo records.");
      }

      return {
        success: true,
        data: {
          propertyPhotoId: newPhoto.propertyPhotoId,
          documentGuid: newPhoto.documentGuid || uploadResponse.documentGuid,
          documentId: uploadResponse.documentId,
          documentBindingId: newPhoto.documentBindingId || uploadResponse.documentBindingId || 0,
          propertyId: newPhoto.propertyId,
          photoTypeId: newPhoto.photoTypeId,
          displayOrder: newPhoto.displayOrder,
          remarks: newPhoto.remarks || remarks || "",
          fileName: file.name,
          fileSizeBytes: file.size,
          storagePath: uploadResponse.storagePath ?? "",
          viewUrl: `/api/documents/${newPhoto.documentGuid || uploadResponse.documentGuid}/view`,
          downloadUrl: `/api/documents/${newPhoto.documentGuid || uploadResponse.documentGuid}/download`
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // 4. POST - Replace an existing photo using the global document API
  async replacePhotoViaGlobalApi(
    file: File,
    oldDocumentGuid: string,
    propertyId: number,
    _photoTypeId: number,
    propertyPhotoId: number,
    _referenceTableIdGuid?: string,
    remarks?: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    try {
      const uploadParams: DocumentUploadParams = {
        departmentId: DEPARTMENT_ID.PTIS,
        moduleId: MODULE_ID.PropertyPhoto,
        referenceTableName: REFERENCE_TABLE.PropertyPhoto,
        referencePropertyName: "PropertyPhotoId",
        referenceTableId: propertyPhotoId,
        bindingPurpose: remarks || "Photo",
        documentType: DOCUMENT_TYPE.Photo,
        isPrimaryDocument: true
      };

      const uploadResponse = await uploadDocument(file, uploadParams);

      if (!uploadResponse.documentGuid) {
        throw new Error("Failed to retrieve document GUID from upload.");
      }

      if (oldDocumentGuid && oldDocumentGuid !== uploadResponse.documentGuid) {
        // Best-effort cleanup of the replaced document.
        await deleteDocument(oldDocumentGuid);
      }

      // Fetch the updated photos for the property to retrieve the new PropertyPhotoId
      const photosResponse = await this.getPhotosByProperty(propertyId);
      if (!photosResponse.success || !photosResponse.data) {
        throw new Error(photosResponse.error || "Failed to retrieve photos list to identify the new photo ID.");
      }

      const newPhoto = photosResponse.data.find(
        (p) => p.documentGuid === uploadResponse.documentGuid || p.documentBindingId === uploadResponse.documentBindingId
      );

      if (!newPhoto) {
        throw new Error("Replaced photo not found in property photo records.");
      }

      return {
        success: true,
        data: {
          propertyPhotoId: newPhoto.propertyPhotoId,
          documentGuid: newPhoto.documentGuid || uploadResponse.documentGuid,
          documentId: uploadResponse.documentId,
          documentBindingId: newPhoto.documentBindingId || uploadResponse.documentBindingId || 0,
          propertyId: newPhoto.propertyId,
          photoTypeId: newPhoto.photoTypeId,
          displayOrder: newPhoto.displayOrder,
          remarks: newPhoto.remarks || remarks || "",
          fileName: file.name,
          fileSizeBytes: file.size,
          storagePath: uploadResponse.storagePath ?? "",
          viewUrl: `/api/documents/${newPhoto.documentGuid || uploadResponse.documentGuid}/view`,
          downloadUrl: `/api/documents/${newPhoto.documentGuid || uploadResponse.documentGuid}/download`
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // 6. PUT - Update a photo type name (rename slot)
  async updatePropertyPhotoType(
    id: number,
    photoTypeCode: string,
    photoTypeName: string
  ): Promise<ApiResponse<object>> {
    const response = await apiClient.put<BackendApiResponseWrapper<object>>(
      `/PropertyPhotoType/${id}`,
      { photoTypeCode, photoTypeName, isActive: true }
    );
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 7. POST - Create a new photo type (category slot)
  async createPropertyPhotoType(
    photoTypeCode: string,
    photoTypeName: string,
    displayOrder?: number,
    description?: string
  ): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post<BackendApiResponseWrapper<{ id: number }>>(
      '/PropertyPhotoType',
      { photoTypeCode, photoTypeName, displayOrder, description, isActive: true }
    );
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 8. DELETE - Delete a photo type
  async deletePropertyPhotoType(id: number): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<BackendApiResponseWrapper<object>>(`/PropertyPhotoType/${id}`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 9. DELETE - Purge a photo type and all its associated photos
  async purgePropertyPhotoType(id: number): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<BackendApiResponseWrapper<object>>(`/PropertyPhotoType/${id}/purge`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  }
};
