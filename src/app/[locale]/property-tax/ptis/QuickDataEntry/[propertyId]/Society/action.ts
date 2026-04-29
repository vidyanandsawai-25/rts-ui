'use server';

import { getPropertySocietyDetails, updatePropertySocietyDetails } from '@/lib/api/property-society.service';
import { UpdatePropertySocietyDetailsDto } from '@/types/property-society-details.types';
import { ActionResult } from '@/types/common.types';
import { revalidatePath } from 'next/cache';

function getActionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

/** Action to update property society details */
export async function updatePropertySocietyDetailsAction(
  locale: string,
  propertyId: number,
  payload: UpdatePropertySocietyDetailsDto
): Promise<ActionResult<Awaited<ReturnType<typeof updatePropertySocietyDetails>>>> {
  try {
    const response = await updatePropertySocietyDetails(propertyId, payload);
    if (!response.success) {
      return response;
    }
    revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Society`, "page");
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: getActionErrorMessage(error) };
  }
}

/** Action to fetch property society details */
export async function getPropertySocietyDetailsAction(
  propertyId: number
): Promise<ActionResult<Awaited<ReturnType<typeof getPropertySocietyDetails>>>> {
  try {
    const response = await getPropertySocietyDetails(propertyId);
    return { success: true, data: response };
  } catch (error) {   
    return { success: false, error: getActionErrorMessage(error) };
  }
}