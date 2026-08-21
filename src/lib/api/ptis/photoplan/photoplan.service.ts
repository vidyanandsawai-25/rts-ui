import 'server-only';

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
import { getAppConfig } from "@/config/app.config";

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
    _displayOrder?: number,
    remarks?: string,
    photoTypeCode?: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    try {
      const isNew = propertyPhotoId <= 0 || propertyPhotoId === 9998 || propertyPhotoId === 9999;

      const uploadParams: DocumentUploadParams = {
        departmentId: DEPARTMENT_ID.PTIS,
        moduleId: MODULE_ID.PropertyPhoto,
        bindingPurpose: remarks || "Photo",
        documentType: photoTypeCode || String(photoTypeId),
        isPrimaryDocument: true,
        referenceTableName: REFERENCE_TABLE.PropertyPhoto
      };

      if (!isNew) {
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
    remarks?: string,
    photoTypeCode?: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    try {
      // Determine if this propertyPhotoId looks like a real PropertyPhoto row
      // or if it's actually the propertyId / a placeholder.
      const isLikelyPropertyId = propertyPhotoId === propertyId
        || propertyPhotoId <= 0
        || propertyPhotoId === 9998
        || propertyPhotoId === 9999;

      const uploadParams: DocumentUploadParams = {
        departmentId: DEPARTMENT_ID.PTIS,
        moduleId: MODULE_ID.PropertyPhoto,
        referenceTableName: REFERENCE_TABLE.PropertyPhoto,
        bindingPurpose: remarks || "Photo",
        documentType: photoTypeCode || DOCUMENT_TYPE.Photo,
        isPrimaryDocument: true
      };

      if (isLikelyPropertyId) {
        // The stored propertyPhotoId is actually a propertyId or placeholder.
        // Use PropertyId reference so the backend's OnAfterUploadAsync
        // dynamically creates the PropertyPhoto row.
        uploadParams.referenceTableId = propertyId;
        uploadParams.referencePropertyName = "PropertyId";
      } else {
        // Looks like a real PropertyPhotoId — try it first.
        uploadParams.referenceTableId = propertyPhotoId;
        uploadParams.referencePropertyName = "PropertyPhotoId";
      }

      let uploadResponse;
      try {
        uploadResponse = await uploadDocument(file, uploadParams);
      } catch (firstError: unknown) {
        // If the PropertyPhotoId reference failed (row doesn't exist),
        // fall back to PropertyId reference.
        const errMsg = firstError instanceof Error ? firstError.message : String(firstError);
        const isNotFoundError = errMsg.includes("not found")
          || errMsg.includes("does not exist")
          || errMsg.includes("No '")
          || errMsg.includes("row exists");

        if (!isLikelyPropertyId && isNotFoundError) {
          uploadParams.referenceTableId = propertyId;
          uploadParams.referencePropertyName = "PropertyId";
          uploadResponse = await uploadDocument(file, uploadParams);
        } else {
          throw firstError;
        }
      }

      if (!uploadResponse.documentGuid) {
        throw new Error("Failed to retrieve document GUID from upload.");
      }

      // Best-effort cleanup of the old document
      if (oldDocumentGuid && oldDocumentGuid !== uploadResponse.documentGuid) {
        try {
          await deleteDocument(oldDocumentGuid);
        } catch {
          // Non-critical: old document cleanup can fail silently
        }
      }

      // Best-effort: try to find the newly created/updated photo to get the
      // real PropertyPhotoId. If this lookup fails, we still return success
      // using the upload response data directly.
      let resolvedPropertyPhotoId = propertyPhotoId;
      let resolvedPhotoTypeId = _photoTypeId;
      let resolvedDisplayOrder: number | undefined;
      let resolvedRemarks = remarks || "";
      let resolvedDocumentBindingId = uploadResponse.documentBindingId || 0;
      let resolvedDocumentGuid = uploadResponse.documentGuid;

      try {
        const photosResponse = await this.getPhotosByProperty(propertyId);
        if (photosResponse.success && photosResponse.data) {
          // Try multiple matching strategies
          const newPhoto = photosResponse.data.find(
            (p) => p.documentGuid === uploadResponse.documentGuid
          ) || photosResponse.data.find(
            (p) => uploadResponse.documentBindingId && p.documentBindingId === uploadResponse.documentBindingId
          ) || photosResponse.data.find(
            (p) => p.photoTypeId === _photoTypeId
              && p.propertyPhotoId !== propertyPhotoId
              && p.documentGuid
          );

          if (newPhoto) {
            resolvedPropertyPhotoId = newPhoto.propertyPhotoId;
            resolvedPhotoTypeId = newPhoto.photoTypeId;
            resolvedDisplayOrder = newPhoto.displayOrder;
            resolvedRemarks = newPhoto.remarks || remarks || "";
            resolvedDocumentBindingId = newPhoto.documentBindingId || resolvedDocumentBindingId;
            resolvedDocumentGuid = newPhoto.documentGuid || resolvedDocumentGuid;
          }
        }
      } catch {
        // Lookup failure is non-critical — the upload already succeeded.
      }

      return {
        success: true,
        data: {
          propertyPhotoId: resolvedPropertyPhotoId,
          documentGuid: resolvedDocumentGuid,
          documentId: uploadResponse.documentId,
          documentBindingId: resolvedDocumentBindingId,
          propertyId: propertyId,
          photoTypeId: resolvedPhotoTypeId,
          displayOrder: resolvedDisplayOrder,
          remarks: resolvedRemarks,
          fileName: file.name,
          fileSizeBytes: file.size,
          storagePath: uploadResponse.storagePath ?? "",
          viewUrl: `/api/documents/${resolvedDocumentGuid}/view`,
          downloadUrl: `/api/documents/${resolvedDocumentGuid}/download`
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
  },

  // 10. GET - Authenticate and launch the CAD drawing tool
  async launchDrawingTool(params: {
    propertyId: number;
    councilName: string;
    returnUrl: string;
    ptisUsername?: string;
    ptisDisplayName?: string;
    ptisUserId?: string;
    wardNo?: string;
    propertyNo?: string;
    partitionNo?: string | null;
    ptisBackendUri?: string;
  }): Promise<{ success: boolean; launchUrl?: string; error?: string }> {
    try {
      const { propertyId, councilName: _councilName, returnUrl, ptisUsername, ptisDisplayName, ptisUserId, wardNo, propertyNo, partitionNo, ptisBackendUri } = params;

      let cookieUsername = '';
      let cookieDisplayName = '';
      let cookieUserId = '';

      if (typeof window === 'undefined') {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          cookieUsername = cookieStore.get('login_username')?.value || cookieStore.get('username')?.value || cookieStore.get('user_name')?.value || '';
          const rawDisplayName = cookieStore.get('user_name')?.value || cookieStore.get('display_name')?.value || '';
          cookieDisplayName = rawDisplayName ? decodeURIComponent(rawDisplayName.replace(/\+/g, ' ')) : '';
          cookieUserId = cookieStore.get('user_id')?.value || '';
        } catch {
          // Cookies store unavailable in non-request contexts
        }
      }

      const safeDecode = (val?: string) => {
        if (!val) return '';
        try {
          return decodeURIComponent(val.replace(/\+/g, ' '));
        } catch {
          return val;
        }
      };

      const finalPtisUsername = safeDecode(ptisUsername || cookieUsername || 'tejas');
      const finalPtisDisplayName = safeDecode(ptisDisplayName || cookieDisplayName || 'Tejas Kishor');
      const finalPtisUserId = safeDecode(ptisUserId || cookieUserId || '42');

      const apiCouncilName = 'THANE_Survey';

      // 1. Authenticate user with static credentials
      const authBody = {
        username: 'tejas.d',
        password: '123456',
        councilName: 'THANE_Survey'
      };

      let loginRes = await fetch('https://apiptisplanapp.tabamc.in/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authBody)
      });

      if (!loginRes.ok) {
        loginRes = await fetch('https://apiptisplanapp.tabamc.in/api/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(authBody)
        });
      }

      if (!loginRes.ok) {
        throw new Error(`Failed to authenticate drawing tool API: ${loginRes.status}`);
      }
      const loginData = await loginRes.json();
      const token = loginData.token || loginData.access_token || (loginData.data && loginData.data.token);

      if (!token) {
         throw new Error('Failed to retrieve authentication token.');
      }

      // 2. Retrieve launch URL for property from /api/plans/ptis/launch
      const isProd = process.env.NODE_ENV === 'production';
      const defaultReturnBase = isProd
        ? (process.env.PHOTO_PLAN_PROD_RETURN_URL || 'https://ptisthane.scipl.info')
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

      let safeReturnUrl = returnUrl;
      if (!safeReturnUrl) {
        safeReturnUrl = `${defaultReturnBase}/en/property-tax/ptis`;
      } else if (safeReturnUrl.startsWith('/')) {
        safeReturnUrl = `${defaultReturnBase}${safeReturnUrl}`;
      }

      const envBackendUrl = process.env.RUNTIME_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || getAppConfig().api.baseUrl || 'https://ptisthaneapi.scipl.info.in/api';
      const resolvedPtisBackendUri = (ptisBackendUri || envBackendUrl).replace(/\/api\/?$/, '') || 'https://ptisthaneapi.scipl.info.in';

      const cleanPartition = (!partitionNo || partitionNo.trim() === '' || partitionNo.trim() === '-' || partitionNo.trim() === '0' || partitionNo.trim() === 'null')
        ? null
        : partitionNo.trim();

      const launchPayload = {
        councilName: apiCouncilName,
        wardNo: wardNo || '',
        propertyNo: propertyNo || '',
        partitionNo: cleanPartition,
        mode: 'draw',
        returnUrl: safeReturnUrl,
        ptisBackendUri: resolvedPtisBackendUri,
        ptisUsername: finalPtisUsername,
        ptisDisplayName: finalPtisDisplayName,
        ptisUserId: String(finalPtisUserId),
        propertyId: propertyId ? String(propertyId) : undefined,
      };

      // Send JSON object payload to the drawing tool launch API
      let launchRes = await fetch('https://apiptisplanapp.tabamc.in/api/plans/ptis/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(launchPayload)
      });

      // Fallback to GET with query parameters if POST endpoint returns 405/404
      if (!launchRes.ok && (launchRes.status === 405 || launchRes.status === 404)) {
        const queryParams = new URLSearchParams();
        Object.entries(launchPayload).forEach(([key, val]) => {
          if (val !== null && val !== undefined) {
            queryParams.set(key, String(val));
          }
        });
        if (cleanPartition === null) {
          queryParams.set('partitionNo', 'null');
        }

        launchRes = await fetch(`https://apiptisplanapp.tabamc.in/api/plans/ptis/launch?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (!launchRes.ok) {
        let errMsg = `Failed to launch drawing tool API: ${launchRes.status}`;
        try {
          const errData = await launchRes.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          } else if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch {}
        throw new Error(errMsg);
      }
      const launchData = await launchRes.json();
      const launchUrl = launchData.launchUrl || launchData.url || (launchData.data && launchData.data.launchUrl);

      if (!launchUrl) {
        throw new Error('Launch URL not found in response.');
      }

      return { success: true, launchUrl };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while launching drawing tool.',
      };
    }
  }
};
