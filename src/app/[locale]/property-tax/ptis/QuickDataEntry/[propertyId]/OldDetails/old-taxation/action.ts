"use server";
//  Action to fetch property old details

import { getPropertyOldDetails, updatePropertyOldDetails } from "@/lib/api/property-old-details.service";
import { PropertyOldDetailsApiItem, PropertyOldDetailsResponse } from "@/types/property-old-details.types";
import { revalidatePath } from "next/cache";

export async function getPropertyOldDetailsAction(propertyId: number): Promise<PropertyOldDetailsApiItem | null> {
  try {
    return await getPropertyOldDetails(propertyId);
  } catch (error) {
    console.error('Error fetching property old details:', error);
    throw error;
  }
}

export async function updatePropertyOldDetailsAction(propertyId: number, data: Partial<PropertyOldDetailsApiItem>, locale: string): Promise<PropertyOldDetailsResponse> {
  try {
    const result = await updatePropertyOldDetails(propertyId, data);
    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/old-taxation`);
    return result;
  } catch (error) {
    console.error('Error updating property old details:', error);
    throw error;
  }
}
