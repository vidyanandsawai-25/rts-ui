import { apiClient } from "@/services/api.service";
import { PropertyTypeCategory } from "@/types/property-type-category.types";
import { PagedResponse } from "@/types/common.types";
import { ApiError } from "@/lib/utils/api";

/**
 * Fetches all active property type categories from the API
 * Used for populating dropdowns in property type forms
 */
export async function getPropertyTypeCategories(): Promise<PropertyTypeCategory[]> {
  try {
    const response = await apiClient.get<PagedResponse<PropertyTypeCategory>>("/PropertyTypeCategory");
    
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch property type categories",
        "Get property type categories failed"
      );
    }
    
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }
    
    const items = response.data.items ?? [];
    
    // Filter only active categories and validate structure (including date fields)
    return items.filter((item): item is PropertyTypeCategory => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.propertyTypeCategory === "string" &&
        item.isActive === true &&
        typeof item.createdDate === "string" &&
        (typeof item.updatedDate === "string" || item.updatedDate === null)
      );
    });
  } catch (error) {
    console.error("Error fetching property type categories:", error);
    throw error;
  }
}

/**
 * Fetches a single property type category by ID
 */
export async function getPropertyTypeCategoryById(id: number): Promise<PropertyTypeCategory | null> {
  try {
    if (!id || id <= 0) {
      throw new ApiError(400, "Valid Property Type Category ID is required", "Invalid category ID");
    }
    
    const response = await apiClient.get<PropertyTypeCategory>(
      `/PropertyTypeCategory/${encodeURIComponent(String(id))}`
    );
    
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch property type category",
        `Get property type category ${id} failed`
      );
    }
    
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching property type category ${id}:`, error);
    throw error;
  }
}
