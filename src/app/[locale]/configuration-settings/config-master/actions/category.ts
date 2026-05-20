'use server';

import { revalidatePath } from 'next/cache';
import { configMasterService } from '@/lib/api/configuration-settings/config-master/configMaster.service';
import {
  CreateConfigCategorySchema,
  UpdateConfigCategorySchema,
} from '@/lib/validations/config-master.schema';
import type { 
  UpdateConfigCategoryRequest, 
  BackendMutationResponse, 
  ConfigCategoryMaster,
  DeleteResponse
} from '@/types/configMaster.types';
import { verifySession, getLocaleFromHeaders, tConfigMessage } from './utils';
import type { ActionResult } from '@/types/common.types';
import { logError } from '@/lib/utils/logger';
import { sanitizeTextInput } from '@/lib/utils/input-sanitization';


/**
 * Create a new Category
 */
export async function createConfigCategoryAction(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await verifySession();

    const rawData = {
      categoryCode: sanitizeTextInput(formData.get('categoryCode') as string),
      categoryName: sanitizeTextInput(formData.get('categoryName') as string),
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
      isActive: formData.get('isActive') === 'true',
    };

    const validation = CreateConfigCategorySchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: await tConfigMessage('unexpectedError', 'Validation failed'),
        validationErrors: validation.error.flatten().fieldErrors,
      };
    }

    const result = await configMasterService.createConfigCategory({
      ...validation.data,
      createdBy: userId,
    });

    if (result.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
      const backendMessage = (result.data as BackendMutationResponse<ConfigCategoryMaster>)?.message;
      return { 
        success: true, 
        message: (typeof backendMessage === 'string' ? backendMessage : undefined) || await tConfigMessage('categoryCreated', 'Category created successfully') 
      };
    }

    return {
      success: false,
      error: result.error || await tConfigMessage('unexpectedError', 'Failed to create category'),
    };
  } catch (err) {
    logError('createConfigCategoryAction failed', { error: err instanceof Error ? err : undefined });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while creating category'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update Category
 */
export async function updateConfigCategoryAction(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await verifySession();

    const rawData = {
      categoryCode: sanitizeTextInput(formData.get('categoryCode') as string),
      categoryName: sanitizeTextInput(formData.get('categoryName') as string),
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
      isActive: formData.get('isActive') === 'true',
    };

    const validation = UpdateConfigCategorySchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: await tConfigMessage('unexpectedError', 'Validation failed'),
        validationErrors: validation.error.flatten().fieldErrors,
      };
    }

    const result = await configMasterService.updateConfigCategory(id, {
      ...validation.data,
      updatedBy: userId,
    });

    if (result.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
      const backendMessage = (result.data as BackendMutationResponse<ConfigCategoryMaster>)?.message;
      return { 
        success: true, 
        message: (typeof backendMessage === 'string' ? backendMessage : undefined) || await tConfigMessage('categoryUpdated', 'Category updated successfully') 
      };
    }

    return {
      success: false,
      error: result.error || await tConfigMessage('unexpectedError', 'Failed to update category'),
    };
  } catch (err) {
    logError('updateConfigCategoryAction failed', { error: err instanceof Error ? err : undefined, id });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while updating category'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update Category Status
 */
export async function updateConfigCategoryStatusAction(
  id: number,
  isActive: boolean,
  currentData: { code: string; name: string; displayOrder: number }
): Promise<ActionResult> {
  try {
    const userId = await verifySession();

    const payload: UpdateConfigCategoryRequest = {
      categoryCode: currentData.code,
      categoryName: currentData.name,
      displayOrder: currentData.displayOrder,
      isActive: isActive,
      updatedBy: userId,
    };

    const result = await configMasterService.updateConfigCategory(id, payload);

    if (result.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
      const backendMessage = (result.data as BackendMutationResponse<ConfigCategoryMaster>)?.message;
      return {
        success: true,
        message: (typeof backendMessage === 'string' ? backendMessage : undefined) || await tConfigMessage(isActive ? 'categoryEnabled' : 'categoryDisabled', `Category ${isActive ? 'enabled' : 'disabled'} successfully`),
      };
    }
    return { success: false, error: result.error || await tConfigMessage('unexpectedError', 'Failed to update category status') };
  } catch (err) {
    logError('updateConfigCategoryStatusAction failed', { error: err instanceof Error ? err : undefined, id, isActive });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while updating category status'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete Category
 */
export async function deleteConfigCategoryAction(id: number): Promise<ActionResult> {
  try {
    await verifySession();
    
    const res = await configMasterService.deleteConfigCategory(id);
    if (res.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
    }
    const backendMessage = (res.data as DeleteResponse)?.message;
    return {
      success: res.success,
      error: res.error,
      message: res.success ? ((typeof backendMessage === 'string' ? backendMessage : undefined) || await tConfigMessage('categoryDeleted', 'Category deleted successfully')) : undefined,
    };
  } catch (err) {
    logError('deleteConfigCategoryAction failed', { error: err instanceof Error ? err : undefined, id });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while deleting category'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

