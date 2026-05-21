'use server';

import { revalidatePath } from 'next/cache';
import { deleteGrievanceCategory } from '@/lib/api/configuration-settings/grievance-category-master/grievanceCategory.service';
import { locales } from '@/i18n/config';
import { logger } from '@/lib/utils/logger';
import { getCurrentUserId } from './utils';

/**
 * Delete Grievance Category Action
 */
export async function deleteGrievanceCategoryAction(
  id: number,
  locale: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'unauthorized' };
  }

  if (!locales.includes(locale as (typeof locales)[number])) {
    return { success: false, error: 'Invalid locale' };
  }

  if (!id || !Number.isInteger(id) || id <= 0) {
    return { success: false, error: 'Invalid record ID' };
  }

  try {
    // Pass userId for audit trail and permission verification
    logger.info('Deleting grievance category', { id, userId, locale });

    const response = await deleteGrievanceCategory(id);
    if (response.success) {
      logger.info('Successfully deleted grievance category', { id, userId });

      // Revalidate the list page to ensure fresh data
      revalidatePath(`/[locale]/configuration-settings/grievance-category-master`, 'page');

      return {
        success: true,
        message: response.message || 'Deleted successfully',
      };
    } else {
      logger.warn('Failed to delete grievance category', {
        id,
        userId,
        errorMessage: response.error,
      });
      return {
        success: false,
        error: response.error || response.message || 'Failed to delete',
      };
    }
  } catch (error) {
    logger.error('Failed to delete grievance category:', {
      error: error instanceof Error ? error : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      id,
      userId,
      locale,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete',
    };
  }
}
