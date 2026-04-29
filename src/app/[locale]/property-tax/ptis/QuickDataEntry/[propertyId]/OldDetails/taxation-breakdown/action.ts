"use server"

import { getOldTaxesDetails, saveOldTaxesDetails } from "@/lib/api/property-old-details.service";
import { OldTaxesDetails } from "@/types/property-old-details.types";
import { revalidatePath } from "next/cache";

/**
 * Server Action to fetch old taxes details for a property.
 * @param propertyId The ID of the property.
 */
export async function getOldTaxesDetailsAction(propertyId: number) {
  try {
    const response = await getOldTaxesDetails(propertyId);
    return {
      success: true,
      data: response.items
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch old taxes details";
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Server Action to save old taxes details for a property.
 * @param propertyId The ID of the property.
 * @param data The taxation breakdown data to save.
 * @param locale The current locale for revalidation.
 */
export async function saveOldTaxesDetailsAction(propertyId: number, data: OldTaxesDetails, locale: string) {
  try {
    const response = await saveOldTaxesDetails(propertyId, data);
    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/taxation-breakdown`);
    return {
      success: true,
      data: response
    };
  } catch (_error) {
    return {
      success: false,
      error: "Failed to save old taxes details"
    };
  }
}
