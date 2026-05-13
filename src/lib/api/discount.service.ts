import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { DiscountApiResponse, DiscountDetailsItem } from "@/types/discount.types";

/**
 * Get discount details for a given property
 */
export async function getDiscountDetails(propertyId: string): Promise<ApiResponse<DiscountApiResponse>> {
    const response = await apiClient.get<DiscountApiResponse>(`/Property/${propertyId}/discountinformation-details`);
    return response;
}

/**
 * Update discount details for a given property
 */
export async function updateDiscountDetails(propertyId: string, data: Partial<DiscountDetailsItem>): Promise<ApiResponse<DiscountApiResponse>> {
    const response = await apiClient.put<DiscountApiResponse>(`/Property/${propertyId}/discountinformation-details`, data);
    return response;
}

