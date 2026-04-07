/* ---------------- PROPERTY SOCIETY DETAILS ---------------- */

import { apiClient } from "@/services/api.service";
import {
    PropertySocietyDetailsApiItem,
    PropertySocietyDetailsResponse,
    UpdatePropertySocietyDetailsDto
} from "../../types/property-Society-details.type";

import { ActionResult } from "@/types/property-basic-details.types";

export async function getPropertySocietyDetails(propertyId: number): Promise<PropertySocietyDetailsApiItem | null> {
    const response = await apiClient.get<PropertySocietyDetailsResponse>(`/Property/${propertyId}/society-details`);

    if (!response.success || !response.data) return null;
    return response.data.items;
}

/* ---------------- UPDATE PROPERTY SOCIETY DETAILS ---------------- */

export async function updatePropertySocietyDetails(propertyId: number, payload: UpdatePropertySocietyDetailsDto): Promise<ActionResult> {
    const response = await apiClient.put<ActionResult>(`/Property/${propertyId}/society-details`, payload);

    if (!response.success || !response.data) {
        throw new Error(String(response.error || "Failed to update property society details"));
    }

    return response.data;
}
