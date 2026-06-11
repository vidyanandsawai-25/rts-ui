'use server';

import { photoPlanService } from '@/lib/api/ptis/photoplan/photoplan.service';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/types/common.types';
import type { 
  PropertyPhotoDto, 
  PropertyPhotoUploadResponseDto,
  PropertyPhotoGalleryDto
} from '@/types/photoplan.types';
import { z } from 'zod';

const idSchema = z.number().positive();

export async function getGroupedPhotosAction(
  propertyId: number
): Promise<ActionResult<PropertyPhotoGalleryDto>> {
  try {
    const validated = idSchema.parse(propertyId);
    const result = await photoPlanService.getGroupedPhotosByProperty(validated);
    if (result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || 'Failed to retrieve grouped photos' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve grouped photos',
    };
  }
}

export async function getPhotosByCategoryAction(
  propertyId: number,
  photoTypeId: number
): Promise<ActionResult<PropertyPhotoDto[]>> {
  try {
    const validatedPropertyId = idSchema.parse(propertyId);
    const validatedPhotoTypeId = idSchema.parse(photoTypeId);
    const result = await photoPlanService.getPhotosByProperty(validatedPropertyId);
    if (result.success && result.data) {
      const filtered = result.data.filter(p => p.photoTypeId === validatedPhotoTypeId);
      return { success: true, data: filtered };
    }
    return { success: false, error: result.error || 'Failed to retrieve photos' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve category photos',
    };
  }
}

export async function uploadPropertyPhotoAction(
  formData: FormData
): Promise<ActionResult<PropertyPhotoUploadResponseDto>> {
  try {
    const file = formData.get('File') as File;
    const propertyId = Number(formData.get('PropertyId'));
    const photoTypeId = Number(formData.get('PhotoTypeId'));
    const displayOrder = Number(formData.get('DisplayOrder') || '0');
    const remarks = String(formData.get('Remarks') || '');

    if (!file || file.size === 0) {
      return { success: false, error: 'File is required' };
    }
    if (!propertyId || isNaN(propertyId)) {
      return { success: false, error: 'Valid PropertyId is required' };
    }
    if (!photoTypeId || isNaN(photoTypeId)) {
      return { success: false, error: 'Valid PhotoTypeId is required' };
    }

    const result = await photoPlanService.uploadPropertyPhoto(
      file,
      propertyId,
      photoTypeId,
      displayOrder,
      remarks
    );

    if (result.success && result.data) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: result.data, message: 'Photo uploaded successfully' };
    }
    return { success: false, error: result.error || 'Upload failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload photo',
    };
  }
}

export async function replacePropertyPhotoAction(
  propertyPhotoId: number,
  formData: FormData
): Promise<ActionResult<PropertyPhotoUploadResponseDto>> {
  try {
    const file = formData.get('File') as File;
    const remarks = String(formData.get('Remarks') || '');

    if (!propertyPhotoId || isNaN(propertyPhotoId)) {
      return { success: false, error: 'Valid PropertyPhotoId is required' };
    }
    if (!file || file.size === 0) {
      return { success: false, error: 'File is required' };
    }

    const result = await photoPlanService.replacePropertyPhoto(
      propertyPhotoId,
      file,
      remarks
    );

    if (result.success && result.data) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: result.data, message: 'Photo replaced successfully' };
    }
    return { success: false, error: result.error || 'Replace failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to replace photo',
    };
  }
}

export async function deletePropertyPhotoAction(
  propertyPhotoId: number
): Promise<ActionResult<object>> {
  try {
    if (!propertyPhotoId || isNaN(propertyPhotoId)) {
      return { success: false, error: 'Valid PropertyPhotoId is required' };
    }

    const result = await photoPlanService.deletePropertyPhoto(propertyPhotoId);

    if (result.success) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: {}, message: 'Photo deleted successfully' };
    }
    return { success: false, error: result.error || 'Delete failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete photo',
    };
  }
}

export async function updatePropertyPhotoTypeAction(
  id: number,
  photoTypeCode: string,
  photoTypeName: string
): Promise<ActionResult<object>> {
  try {
    const result = await photoPlanService.updatePropertyPhotoType(id, photoTypeCode, photoTypeName);
    if (result.success) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: {}, message: 'Photo plan name updated successfully' };
    }
    return { success: false, error: result.error || 'Failed to rename photo plan' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rename photo plan',
    };
  }
}


