'use server';

import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import {
  MappedPropertyApiResponse,
  SearchOldPropertiesApiResponse,
  SearchOldPropertiesParams,
} from "@/types/property-mapping";

export interface SavePropertyMappingPayload {
  newPropertyNo: string;
  oldPropertyNos: string[];
  mappingType: string;
  remark: string;
}

export interface PropertyMergeSinglePayload {
  propertyId: number;
  propertyOldId: number;
  latitude?: string;
  longitude?: string;
  location?: string;
  CreatedBy?: number;
}

export interface PropertyMergePayload {
  propertyId: number;
  propertyOldIds: number[];
  latitude?: string;
  longitude?: string;
  location?: string;
  CreatedBy?: number;
}

export interface PropertyUnmergeSinglePayload {
  isActive: boolean;
  updatedBy: number;
  propertyOldId: number;
  propertyId: number;
  isPreviousDataUpdate: boolean;
}

export interface PropertyUnmergeMultiplePayload {
  isActive: boolean;
  updatedBy: number;
  propertyId: number;
  propertyOldIds: number[];
  isPreviousDataUpdate: boolean;
}

/**
 * Service API call to fetch mapped property details by PropertyId.
 * API: GET /api/PropertyMapMaster/mapped-properties?PropertyId={PropertyId}&PageSize={pageSize}
 */
export async function getMappedProperties(propertyId: number, pageSize: number = -1): Promise<MappedPropertyApiResponse | null> {
  try {
    const response = await apiClient.get<MappedPropertyApiResponse>(
      `/PropertyMapMaster/mapped-properties?PropertyId=${propertyId}&PageSize=${pageSize}`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Service API call to search old property candidates by structured query parameters or search term.
 * API: GET /api/PropertyMapMaster/search?...
 */
export async function searchOldProperties(params: SearchOldPropertiesParams): Promise<SearchOldPropertiesApiResponse | null> {
  try {
    const queryParts: string[] = [];
    if (params.searchTerm) queryParts.push(`SearchTerm=${encodeURIComponent(params.searchTerm)}`);
    if (params.oldOwnerName) queryParts.push(`OldOwnerName=${encodeURIComponent(params.oldOwnerName)}`);
    if (params.oldOwnerNameEnglish) queryParts.push(`OldOwnerNameEnglish=${encodeURIComponent(params.oldOwnerNameEnglish)}`);
    if (params.oldMobileNo) queryParts.push(`OldMobileNo=${encodeURIComponent(params.oldMobileNo)}`);
    if (params.oldAddress) queryParts.push(`OldAddress=${encodeURIComponent(params.oldAddress)}`);
    if (params.oldSocietyName) queryParts.push(`OldSocietyName=${encodeURIComponent(params.oldSocietyName)}`);
    if (params.oldOccupierName) queryParts.push(`OldOccupierName=${encodeURIComponent(params.oldOccupierName)}`);
    if (params.oldBuilderName) queryParts.push(`OldBuilderName=${encodeURIComponent(params.oldBuilderName)}`);
    if (params.oldConstructionYear) queryParts.push(`OldConstructionYear=${encodeURIComponent(params.oldConstructionYear)}`);

    const pageSize = params.pageSize ?? -1;
    queryParts.push(`PageSize=${pageSize}`);
    if (params.pageNumber !== undefined) queryParts.push(`PageNumber=${params.pageNumber}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const response = await apiClient.get<SearchOldPropertiesApiResponse>(
      `/PropertyMapMaster/search${queryString}`
    );
    return handleApiResponse(response, `Search old properties failed`);
  } catch {
    return null;
  }
}

/**
 * Service API call to save/confirm a property mapping link or unmapped status.
 * API: POST /api/PropertyMapMaster/save-mapping
 */
export async function savePropertyMapping(payload: SavePropertyMappingPayload): Promise<{ success: boolean; message?: string } | null> {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/PropertyMapMaster/save-mapping`,
      payload
    );
    return handleApiResponse(response, `Save property mapping for ${payload.newPropertyNo} failed`);
  } catch {
    return null;
  }
}

// Aliases for backward compatibility
export const getMappedPropertiesAction = getMappedProperties;
export const searchOldPropertiesAction = searchOldProperties;

/**
 * Service API call to merge exactly 1 New Property and 1 Old Property.
 * API: POST /PropertyMergeSingle
 */
export async function mergeSingleProperty(payload: PropertyMergeSinglePayload): Promise<{ success: boolean; message?: string; items?: { success: boolean; message?: string } } | null> {
  try {
    // Build request payload — only include lat/lng/location if they have real values
    const requestPayload: Record<string, unknown> = {
      propertyId: payload.propertyId,
      propertyOldId: payload.propertyOldId,
    };
    if (payload.CreatedBy) requestPayload.CreatedBy = payload.CreatedBy;
    if (payload.latitude && payload.latitude !== "0") requestPayload.latitude = payload.latitude;
    if (payload.longitude && payload.longitude !== "0") requestPayload.longitude = payload.longitude;
    if (payload.location && payload.location !== "Default") requestPayload.location = payload.location;

    const response = await apiClient.post<{ success: boolean; message?: string; items?: { success: boolean; message?: string } }>(
      `/PropertyMergeSingle`,
      requestPayload
    );
    return handleApiResponse(response, `Merge single property failed`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Merge single property failed";
    return { success: false, message: msg };
  }
}

/**
 * Service API call to merge 1 New Property to Multiple Old Properties.
 * API: POST /PropertyMerge
 */
export async function mergeMultipleProperties(payload: PropertyMergePayload): Promise<{ success: boolean; message?: string; items?: { success: boolean; message?: string } } | null> {
  try {
    const requestPayload: Record<string, unknown> = {
      propertyId: payload.propertyId,
      PropertyOldIds: payload.propertyOldIds,
      CreatedBy: payload.CreatedBy
    };
    
    if (payload.latitude && payload.latitude !== "0") requestPayload.latitude = payload.latitude;
    if (payload.longitude && payload.longitude !== "0") requestPayload.longitude = payload.longitude;
    if (payload.location && payload.location !== "Default") requestPayload.location = payload.location;

    const response = await apiClient.post<{ success: boolean; message?: string; items?: { success: boolean; message?: string } }>(`/PropertyMerge`, requestPayload);
    return handleApiResponse(response, `Merge multiple properties failed`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Merge multiple properties failed";
    return { success: false, message: msg };
  }
}

/**
 * Service API call to unmerge 1 New Property and 1 Old Property.
 * API: PUT /PropertyMergeSingle
 */
export async function unmergeSingleProperty(payload: PropertyUnmergeSinglePayload): Promise<{ success: boolean; message?: string; items?: { success: boolean; message?: string } } | null> {
  try {
    const response = await apiClient.put<{ success: boolean; message?: string; items?: { success: boolean; message?: string } }>(
      `/PropertyMergeSingle`,
      payload
    );
    return handleApiResponse(response, `Unmerge single property failed`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unmerge single property failed";
    return { success: false, message: msg };
  }
}

/**
 * Service API call to unmerge 1 New Property and Multiple Old Properties.
 * API: PUT /PropertyMerge
 */
export async function unmergeMultipleProperties(payload: PropertyUnmergeMultiplePayload): Promise<{ success: boolean; message?: string; items?: { success: boolean; message?: string } } | null> {
  try {
    const response = await apiClient.put<{ success: boolean; message?: string; items?: { success: boolean; message?: string } }>(
      `/PropertyMerge`,
      payload
    );
    return handleApiResponse(response, `Unmerge multiple properties failed`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unmerge multiple properties failed";
    return { success: false, message: msg };
  }
}
