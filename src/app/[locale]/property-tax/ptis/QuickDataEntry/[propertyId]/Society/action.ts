'use server';

import { getPropertySocietyDetails, updatePropertySocietyDetails } from '@/lib/api/property-society.service';
import { UpdatePropertySocietyDetailsDto } from '@/types/property-Society-details.types';
import { revalidatePath } from 'next/cache';

/**
 * Action to update property society details
 */
export async function updatePropertySocietyDetailsAction(locale: string, propertyId: number, payload: UpdatePropertySocietyDetailsDto) {
  try {
    const response = await updatePropertySocietyDetails(propertyId, payload);
    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Society`, "page");
    return response;
  } catch (error) {
    console.error('Action error updating society details:', error);
    throw error;
  }
}

/**
 * Action to fetch property society details
 */
export async function getPropertySocietyDetailsAction(propertyId: number) {
  try {
    return await getPropertySocietyDetails(propertyId);
  } catch (error) {
    console.error('Action error fetching society details:', error);
    return null;
  }
}
