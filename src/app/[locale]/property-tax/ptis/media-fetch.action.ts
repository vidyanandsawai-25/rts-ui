'use server';

import { photoPlanService } from '@/lib/api/ptis/photoplan/photoplan.service';
import { ActionResult } from '@/types/common.types';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

export interface PropertyMediaFetchResult {
  photoSlots: PropertyPhotoTypeWithStatusDto[];
  photos: PropertyPhotoDto[];
}

/**
 * Server action to fetch property photos and photo slots in parallel.
 * This is used for on-demand fetching when the Photo Plan side panel is opened.
 */
export async function getPropertyMediaDataAction(
  propertyId: number
): Promise<ActionResult<PropertyMediaFetchResult>> {
  try {
    const [photoSlotsRes, photosRes] = await Promise.all([
      photoPlanService.getPhotoTypesWithStatus(propertyId),
      photoPlanService.getPhotosByProperty(propertyId),
    ]);

    if (!photoSlotsRes.success) {
      return { success: false, error: photoSlotsRes.error || 'Failed to fetch photo types' };
    }
    if (!photosRes.success) {
      return { success: false, error: photosRes.error || 'Failed to fetch photos' };
    }

    return {
      success: true,
      data: {
        photoSlots: photoSlotsRes.data || [],
        photos: photosRes.data || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve media data',
    };
  }
}
