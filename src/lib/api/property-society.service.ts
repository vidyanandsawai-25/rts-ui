/* ---------------- PROPERTY SOCIETY DETAILS ---------------- */

import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import {
    PropertySocietyDetailsApiItem,
    PropertySocietyDetailsResponse,
    UpdatePropertySocietyDetailsDto
} from "@/types/property-society-details.types";
import { ActionResult } from "@/types/common.types";

//  get Property Society details
export async function getPropertySocietyDetails(propertyId: number): Promise<PropertySocietyDetailsApiItem | null> {
    const response = await apiClient.get<PropertySocietyDetailsResponse>(`/Property/${propertyId}/society-details`);
    return handleApiResponse(response, "Failed to fetch property society details").items;
}

/* ---------------- UPDATE PROPERTY SOCIETY DETAILS ---------------- */
export async function updatePropertySocietyDetails(propertyId: number, payload: UpdatePropertySocietyDetailsDto): Promise<ActionResult> {
    const response = await apiClient.put<ActionResult>(`/Property/${propertyId}/society-details`, payload);
    return handleApiResponse(response, "Failed to update property society details");
}