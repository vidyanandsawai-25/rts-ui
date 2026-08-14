'use server';

import {
  MappedPropertyApiResponse,
  SearchOldPropertiesApiResponse,
  SearchOldPropertiesParams,
} from "@/types/property-mapping";
import {
  getMappedProperties,
  searchOldProperties,
  savePropertyMapping,
  SavePropertyMappingPayload,
} from "@/lib/api/property-mapping/property-mapping.service";

/**
 * Server action to fetch mapped property details by PropertyId.
 * Delegates to property-mapping service layer.
 */
export async function getMappedPropertiesAction(
  propertyId: number,
  pageSize: number = -1
): Promise<MappedPropertyApiResponse | null> {
  return await getMappedProperties(propertyId, pageSize);
}

/**
 * Server action to search old property candidates by structured query parameters or search term.
 * Delegates to property-mapping service layer.
 */
export async function searchOldPropertiesAction(
  params: SearchOldPropertiesParams
): Promise<SearchOldPropertiesApiResponse | null> {
  return await searchOldProperties(params);
}

/**
 * Server action to save/confirm a property mapping link or unmapped status.
 * Delegates to property-mapping service layer.
 */
export async function savePropertyMappingAction(
  payload: SavePropertyMappingPayload
): Promise<{ success: boolean; message?: string } | null> {
  return await savePropertyMapping(payload);
}
