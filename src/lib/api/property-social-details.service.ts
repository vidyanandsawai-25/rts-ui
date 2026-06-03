import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import {
    PropertySocialInfoApiResponse,
    UpsertPropertySocialInfoDto,
    UpsertPropertySocialInfoApiResponse
} from "@/types/property-social-details.types";

/**
 * Get social information for a given property
 */
export async function getPropertySocialInfo(propertyId: string): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
    const response = await apiClient.get<PropertySocialInfoApiResponse>(`/PropertySocialDetails/property/${propertyId}/social-info`);
    return response;
}

/**
 * Upsert social details
 */
export async function upsertPropertySocialInfo(payload: UpsertPropertySocialInfoDto): Promise<ApiResponse<UpsertPropertySocialInfoApiResponse>> {
    const response = await apiClient.put<UpsertPropertySocialInfoApiResponse>("/PropertySocialDetails/upsert", payload);
    return response;
}
