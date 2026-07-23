'use server';

import { photoPlanService } from '@/lib/api/ptis/photoplan/photoplan.service';
import { ActionResult } from '@/types/common.types';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

export async function getPhotoSlotsAction(
  propertyId: number
): Promise<ActionResult<PropertyPhotoTypeWithStatusDto[]>> {
  try {
    const photoSlotsRes = await photoPlanService.getPhotoTypesWithStatus(propertyId);
    if (!photoSlotsRes.success) {
      return { success: false, error: photoSlotsRes.error || 'Failed to fetch photo types' };
    }
    return { success: true, data: photoSlotsRes.data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve photo types',
    };
  }
}

export async function getPropertyPhotosAction(
  propertyId: number
): Promise<ActionResult<PropertyPhotoDto[]>> {
  try {
    const photosRes = await photoPlanService.getPhotosByProperty(propertyId);
    if (!photosRes.success) {
      return { success: false, error: photosRes.error || 'Failed to fetch photos' };
    }
    return { success: true, data: photosRes.data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve photos',
    };
  }
}
