"use server";
//  Action to fetch property old details

import { getPropertyOldDetails, updatePropertyOldDetails } from "@/lib/api/property-old-details.service";
import { PropertyOldDetailsApiItem } from "@/types/property-old-details.types";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common.types";

export async function getPropertyOldDetailsAction(propertyId: number): Promise<ActionResult<PropertyOldDetailsApiItem | null>> {
  try {
    const data = await getPropertyOldDetails(propertyId);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch property old details'
    };
  }
}

export async function updatePropertyOldDetailsAction(propertyId: number, data: Partial<PropertyOldDetailsApiItem>, locale: string): Promise<ActionResult<PropertyOldDetailsApiItem>> {
  try {
    const result = await updatePropertyOldDetails(propertyId, data);
    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/old-taxation`);
    return {
      success: true,
      data: result.items
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update property old details'
    };
  }
}
