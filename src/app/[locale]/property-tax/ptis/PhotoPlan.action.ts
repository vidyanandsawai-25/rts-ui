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
import { getTranslations } from 'next-intl/server';

const idSchema = z.number().positive();

export async function getGroupedPhotosAction(
  propertyId: number,
  locale?: string
): Promise<ActionResult<PropertyPhotoGalleryDto>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    const validated = idSchema.parse(propertyId);
    const result = await photoPlanService.getGroupedPhotosByProperty(validated);
    if (result.success && result.data) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || t('media.failedToRetrieveGrouped') || 'Failed to retrieve grouped photos' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToRetrieveGrouped') || 'Failed to retrieve grouped photos'),
    };
  }
}

export async function getPhotosByCategoryAction(
  propertyId: number,
  photoTypeId: number,
  locale?: string
): Promise<ActionResult<PropertyPhotoDto[]>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    const validatedPropertyId = idSchema.parse(propertyId);
    const validatedPhotoTypeId = idSchema.parse(photoTypeId);
    const result = await photoPlanService.getPhotosByProperty(validatedPropertyId);
    if (result.success && result.data) {
      const filtered = result.data.filter(p => p.photoTypeId === validatedPhotoTypeId);
      return { success: true, data: filtered };
    }
    return { success: false, error: result.error || t('media.failedToRetrieveCategory') || 'Failed to retrieve photos' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToRetrieveCategory') || 'Failed to retrieve category photos'),
    };
  }
}

export async function uploadPropertyPhotoAction(
  formData: FormData,
  locale?: string
): Promise<ActionResult<PropertyPhotoUploadResponseDto>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    const file = formData.get('File') as File;
    const propertyId = Number(formData.get('PropertyId'));
    const photoTypeId = Number(formData.get('PhotoTypeId'));
    const displayOrder = Number(formData.get('DisplayOrder') || '0');
    const remarks = String(formData.get('Remarks') || '');

    if (!file || file.size === 0) {
      return { success: false, error: t('media.fileRequired') || 'File is required' };
    }
    if (!propertyId || isNaN(propertyId)) {
      return { success: false, error: t('media.propertyIdRequired') || 'Valid PropertyId is required' };
    }
    if (!photoTypeId || isNaN(photoTypeId)) {
      return { success: false, error: t('media.photoTypeIdRequired') || 'Valid PhotoTypeId is required' };
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
      return { success: true, data: result.data, message: t('media.photoUploadedSuccess') || 'Photo uploaded successfully' };
    }
    return { success: false, error: result.error || t('media.failedToUpload') || 'Upload failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToUpload') || 'Failed to upload photo'),
    };
  }
}

export async function replacePropertyPhotoAction(
  propertyPhotoId: number,
  formData: FormData,
  locale?: string
): Promise<ActionResult<PropertyPhotoUploadResponseDto>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    const file = formData.get('File') as File;
    const remarks = String(formData.get('Remarks') || '');

    if (!propertyPhotoId || isNaN(propertyPhotoId)) {
      return { success: false, error: t('media.propertyPhotoIdRequired') || 'Valid PropertyPhotoId is required' };
    }
    if (!file || file.size === 0) {
      return { success: false, error: t('media.fileRequired') || 'File is required' };
    }

    const result = await photoPlanService.replacePropertyPhoto(
      propertyPhotoId,
      file,
      remarks
    );

    if (result.success && result.data) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: result.data, message: t('media.photoReplacedSuccess') || 'Photo replaced successfully' };
    }
    return { success: false, error: result.error || t('media.failedToReplace') || 'Replace failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToReplace') || 'Failed to replace photo'),
    };
  }
}

export async function deletePropertyPhotoAction(
  propertyPhotoId: number,
  locale?: string
): Promise<ActionResult<object>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    if (!propertyPhotoId || isNaN(propertyPhotoId)) {
      return { success: false, error: t('media.propertyPhotoIdRequired') || 'Valid PropertyPhotoId is required' };
    }

    const result = await photoPlanService.deletePropertyPhoto(propertyPhotoId);

    if (result.success) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: {}, message: t('media.photoDeletedSuccess') || 'Photo deleted successfully' };
    }
    return { success: false, error: result.error || t('media.failedToDelete') || 'Delete failed' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToDelete') || 'Failed to delete photo'),
    };
  }
}

export async function updatePropertyPhotoTypeAction(
  id: number,
  photoTypeCode: string,
  photoTypeName: string,
  locale?: string
): Promise<ActionResult<object>> {
  const t = await getTranslations({ locale: locale || 'en', namespace: 'ptis' });
  try {
    const result = await photoPlanService.updatePropertyPhotoType(id, photoTypeCode, photoTypeName);
    if (result.success) {
      revalidatePath('/[locale]/property-tax/ptis', 'page');
      return { success: true, data: {}, message: t('media.renameSuccess') || 'Photo plan name updated successfully' };
    }
    return { success: false, error: result.error || t('media.failedToRename') || 'Failed to rename photo plan' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : (t('media.failedToRename') || 'Failed to rename photo plan'),
    };
  }
}


