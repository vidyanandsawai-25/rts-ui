import { apiClient } from "@/services/api.service";
import { ZonePropertyItem, ZonePropertyListResponse } from "@/types/zone-master/properties/zoneProperty.types";
import { CreatePropertyPayload, BulkCreatePropertyPayload } from "@/types/property-category.types";
import { PropertyRangeCreatePayload, PropertyRangeCreateResponse } from "@/types/zone-master/properties/property-range.types";
import { BulkPropertyItem, BulkPropertyCreateResponse } from "@/types/zone-master/properties/property-bulk.types";
import { BuildingListItem } from "@/types/zone-master/properties/building-list.types";
import { SocietyWingDetailsResponse, SocietyWingDetailItem } from "@/types/zone-master/properties/society-wing-details.types";
import { ApiError } from "@/lib/utils/api";

/**
 * Fetches paginated properties for a specific ward.
 * Used by zone-master to list properties under a ward.
 * @param pageNumber - Page number (1-based)
 * @param pageSize - Number of items per page
 * @param searchTerm - Optional search term (searches by propertyNo or partitionNo)
 * @param wardId - Required ward ID to filter properties
 * @throws ApiError on failure so Next.js error boundary can catch it.
 */
export async function getPropertiesByWard(
  pageNumber: number,
  pageSize: number,
  wardId: number,
  searchTerm?: string
): Promise<ZonePropertyListResponse> {
  const params = new URLSearchParams();
  params.set("PageNumber", pageNumber.toString());
  params.set("PageSize", pageSize.toString());
  params.set("WardId", wardId.toString());

  if (searchTerm) {
    // Search by PropertyNo or PartitionNo
    params.set("SearchTerm", searchTerm);
  }

  const response = await apiClient.get<ZonePropertyListResponse>(`/Property?${params.toString()}`);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch properties",
      "Get properties failed"
    );
  }

  return response.data;
}

/**
 * Fetches a single property by its ID.
 * @param id - The numeric property ID
 */
export async function getPropertyById(id: number | string): Promise<ZonePropertyItem | null> {
  const response = await apiClient.get<ZonePropertyItem>(`/Property/${id}`);

  if (!response.success || !response.data) return null;

  return response.data;
}

/**
 * Fetches total count of properties for a specific ward.
 * @param wardId - Ward ID to get property count for
 */
export async function getPropertyCountByWard(wardId: number): Promise<number> {
  const params = new URLSearchParams();
  params.set("PageNumber", "1");
  params.set("PageSize", "1");
  params.set("WardId", wardId.toString());

  const response = await apiClient.get<ZonePropertyListResponse>(`/Property?${params.toString()}`);

  if (!response.success || !response.data) {
    return 0;
  }

  return response.data.totalCount;
}

/**
 * Creates a single property.
 * @param payload - Property creation data
 * @returns The created property ID
 */
export async function createProperty(payload: CreatePropertyPayload): Promise<{ id: number }> {
  const response = await apiClient.post<{ id: number }>("/Property", payload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to create property",
      "Create property failed"
    );
  }

  return response.data ?? { id: 0 };
}

/**
 * Creates multiple properties in bulk.
 * @param payload - Bulk property creation data with from/to property numbers
 * @returns The count of created properties
 */
export async function createBulkProperties(payload: BulkCreatePropertyPayload): Promise<{ count: number }> {
  const response = await apiClient.post<{ count: number }>("/Property/bulk", payload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to create properties in bulk",
      "Bulk create properties failed"
    );
  }

  return response.data ?? { count: 0 };
}

/**
 * Creates properties using the Range API.
 * For single property: rangeFrom === rangeTo (same value)
 * For bulk properties: rangeFrom < rangeTo (creates multiple)
 * @param payload - Property range creation data with template
 * @returns Response with success/failed counts and results array
 */
export async function createPropertyRange(
  payload: PropertyRangeCreatePayload
): Promise<PropertyRangeCreateResponse> {
  const response = await apiClient.post<PropertyRangeCreateResponse>("/Property/Range", payload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to create properties via range",
      "Property range creation failed"
    );
  }

  return response.data ?? { successCount: 0, failedCount: 0, results: [] };
}

/**
 * Gets the next available property number for a ward.
 * Fetches the property with highest PropertySeqNo and returns the next propertyNo.
 * @param wardId - Ward ID to get next property number for
 * @returns Next property number string (parsed from propertyNo + 1), or "1" if no properties exist
 */
export async function getNextPropertyNumber(wardId: number): Promise<string> {
  const params = new URLSearchParams();
  params.set("WardId", wardId.toString());
  params.set("PageNumber", "1");
  params.set("PageSize", "1");
  params.set("SortBy", "PropertySeqNo");
  params.set("SortOrder", "desc");

  const response = await apiClient.get<ZonePropertyListResponse>(`/Property?${params.toString()}`);

  // If no properties exist or API fails, start from "1"
  if (!response.success || !response.data || response.data.items.length === 0) {
    return "1";
  }

  const highestProperty = response.data.items[0];
  const currentPropertyNo = highestProperty.propertyNo || "0";
  
  // Try to parse and increment the property number
  // Handle numeric strings like "123" -> "124"
  const numericValue = parseInt(currentPropertyNo, 10);
  if (!isNaN(numericValue)) {
    return String(numericValue + 1);
  }
  
  // If propertyNo is not purely numeric, try to extract trailing numbers
  // e.g., "PROP-123" -> "124" (just the incremented number part)
  const trailingNumberMatch = currentPropertyNo.match(/(\d+)$/);
  if (trailingNumberMatch) {
    const trailingNumber = parseInt(trailingNumberMatch[1], 10);
    return String(trailingNumber + 1);
  }
  
  // Fallback to "1" if no numeric pattern found
  return "1";
}

/**
 * Creates building structure properties in bulk.
 * Used for generating properties from building structure preview.
 * @param payload - Array of property items to create
 * @returns Response with success/failed counts and results array
 */
export async function createBulkBuildingProperties(
  payload: BulkPropertyItem[]
): Promise<BulkPropertyCreateResponse> {
  const response = await apiClient.post<BulkPropertyCreateResponse>("/Property/Bulk", payload);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to create building properties in bulk",
      "Bulk building property creation failed"
    );
  }

  return response.data ?? { 
    successCount: 0, 
    failedCount: 0, 
    results: [], 
    errors: null, 
    hasFailures: true, 
    allSucceeded: false 
  };
}
/**
 * Fetches building list for a ward.
 * Returns properties with propertyNo and category name for dropdown display.
 * Used in PropertyPartitionForm for Main Property No selection.
 * @param wardId - Ward ID to get building list for
 * @returns Array of BuildingListItem with propertyId, wardNo, propertyNo, catPropertyCategoryName, partitionNo
 */
export async function getBuildingListByWard(wardId: number): Promise<BuildingListItem[]> {
  const response = await apiClient.get<BuildingListItem[]>(`/Property/${wardId}/Building-list`);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch building list",
      "Get building list failed"
    );
  }

  return response.data;
}

/**
 * Fetches society wing details for a property.
 * Returns wing information including property counts and amenity counts.
 * Used in PropertyPartitionForm to show wing summary with amenity counts.
 * @param propertyId - Property ID to get wing details for
 * @returns Array of SocietyWingDetailItem with wing and amenity information
 */
export async function getSocietyWingDetails(propertyId: number): Promise<SocietyWingDetailItem[]> {
  const response = await apiClient.get<SocietyWingDetailsResponse>(`/Property/${propertyId}/society-wing-details`);
  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch society wing details",
      "Get society wing details failed"
    );
  }

  if (response.data.success === false) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.data.message || "Failed to fetch society wing details",
      "Get society wing details failed"
    );
  }

  return response.data.items || [];
}
