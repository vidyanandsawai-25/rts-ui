'use server';

import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import {
  MappedPropertyApiResponse,
  SearchOldPropertiesApiResponse,
  SearchOldPropertiesParams,
} from "@/types/property-mapping";

/**
 * Fetches mapped property details by PropertyId.
 * API: GET /api/PropertyMapMaster/mapped-properties?PropertyId={PropertyId}
 */
export async function getMappedPropertiesAction(propertyId: number): Promise<MappedPropertyApiResponse | null> {
  try {
    const response = await apiClient.get<MappedPropertyApiResponse>(
      `/PropertyMapMaster/mapped-properties?PropertyId=${propertyId}`
    );
    return handleApiResponse(response, `Fetch mapped properties for ${propertyId} failed`);
  } catch (error) {
    console.error("getMappedPropertiesAction failed:", error);
    return null;
  }
}

/**
 * Searches old property candidates by structured query parameters or search term.
 * API: GET /api/PropertyMapMaster/search?...
 */
export async function searchOldPropertiesAction(params: SearchOldPropertiesParams): Promise<SearchOldPropertiesApiResponse | null> {
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

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const response = await apiClient.get<SearchOldPropertiesApiResponse>(
      `/PropertyMapMaster/search${queryString}`
    );
    return handleApiResponse(response, `Search old properties failed`);
  } catch (error) {
    console.error("searchOldPropertiesAction failed:", error);
    return null;
  }
}

/**
 * Saves/Confirms a property mapping link or unmapped status to the server.
 * API: POST /api/PropertyMapMaster/save-mapping
 */
export async function savePropertyMappingAction(payload: {
  newPropertyNo: string;
  oldPropertyNos: string[];
  mappingType: string;
  remark: string;
}): Promise<{ success: boolean; message?: string } | null> {
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/PropertyMapMaster/save-mapping`,
      payload
    );
    return handleApiResponse(response, `Save property mapping for ${payload.newPropertyNo} failed`);
  } catch (error) {
    console.error("savePropertyMappingAction failed:", error);
    return null;
  }
}
