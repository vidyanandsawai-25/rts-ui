'use server';

import { revalidatePath } from 'next/cache';
import { configMasterService } from '@/lib/api/configMaster.service';
import {
  CreateConfigKeySchema,
  UpdateConfigKeySchema,
} from '@/lib/validations/config-master.schema';
import type {
  ConfigItem,
  UpdateConfigKeyRequest,
} from '@/types/configMaster.types';
import type { ActionResult } from '@/types/common.types';
import { verifySession, getLocaleFromHeaders, tConfigMessage } from './utils';
import { logError } from '@/lib/utils/logger';

/**
 * Fetch config items by category
 */
export async function getConfigItemsByCategoryAction(
  categoryId: string
): Promise<ActionResult<ConfigItem[]>> {
  try {
    await verifySession();
    const response = await configMasterService.getItemsByCategory(categoryId);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.error };
  } catch (err) {
    logError('getConfigItemsByCategoryAction failed', { error: err instanceof Error ? err : undefined, categoryId });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while fetching items'
      : (err instanceof Error ? err.message : 'Failed to fetch items');
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch all config items (across all categories)
 */
export async function getAllConfigItemsAction(): Promise<ActionResult<ConfigItem[]>> {
  try {
    await verifySession();
    // Cap pageSize at a reasonable limit for performance (Section 10 Compliance)
    const response = await configMasterService.getAllConfigKeys({ pageNumber: 1, pageSize: 200 });
    
    if (response.success && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response.error };
  } catch (error) {
    logError('getAllConfigItemsAction failed', { error: error instanceof Error ? error : undefined });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while searching items'
      : (error instanceof Error ? error.message : 'Failed to search all items');
    return {
      success: false,
      error: errorMessage,
    };
  }
}


/**
 * Create a new Config Key
 */
export async function createConfigKeyAction(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await verifySession();

    const rawData = {
      categoryId: parseInt(formData.get('categoryId') as string),
      configCode: formData.get('configCode'),
      configName: formData.get('configName'),
      description: formData.get('description'),
      dataType: formData.get('dataType'),
      controlType: formData.get('controlType'),
      defaultValue: formData.get('defaultValue'),
      isActive: formData.get('isActive') === 'true',
    };

    const validation = CreateConfigKeySchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: await tConfigMessage('unexpectedError', 'Validation failed'),
        validationErrors: validation.error.flatten().fieldErrors,
      };
    }

    const result = await configMasterService.createConfigKey({
      ...validation.data,
      description: validation.data.description ?? '',
      defaultValue: validation.data.defaultValue ?? '',
      createdBy: userId,
    });

    if (result.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
      return { success: true, message: await tConfigMessage('keyCreated', 'Config Key created successfully') };
    }

    return {
      success: false,
      error: result.error || await tConfigMessage('keyCreateFailed', 'Failed to create config key'),
    };
  } catch (err) {
    logError('createConfigKeyAction failed', { error: err instanceof Error ? err : undefined });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while creating config key'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update Config Key
 */
export async function updateConfigKeyAction(
  keyId: number,
  data: Partial<UpdateConfigKeyRequest>
): Promise<ActionResult> {
  try {
    const userId = await verifySession();

    const validation = UpdateConfigKeySchema.safeParse({
      ...data,
      updatedBy: userId,
    });

    if (!validation.success) {
      return {
        success: false,
        error: await tConfigMessage('unexpectedError', 'Validation failed'),
        validationErrors: validation.error.flatten().fieldErrors,
      };
    }

    const res = await configMasterService.updateConfigKey(keyId, {
      ...validation.data,
      description: validation.data.description ?? '',
      defaultValue: validation.data.defaultValue ?? '',
      updatedBy: userId,
    });
    if (res.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
      return { success: true, message: await tConfigMessage('keyUpdated', 'Configuration key updated successfully') };
    }

    return { success: false, error: res.error || await tConfigMessage('keyUpdateFailed', 'Failed to update config key') };
  } catch (err) {
    logError('updateConfigKeyAction failed', { error: err instanceof Error ? err : undefined, keyId });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while updating config key'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete Key
 */
export async function deleteConfigKeyAction(id: number): Promise<ActionResult> {
  try {
    await verifySession();
    
    const res = await configMasterService.deleteConfigKey(id);
    if (res.success) {
      const locale = await getLocaleFromHeaders();
      revalidatePath(`/${locale}/configuration-settings/config-master`, 'page');
    }
    return {
      success: res.success,
      error: res.error,
      message: res.success ? await tConfigMessage('keyDeleted', 'Configuration key deleted successfully') : undefined,
    };
  } catch (err) {
    logError('deleteConfigKeyAction failed', { error: err instanceof Error ? err : undefined, id });
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while deleting config key'
      : (err instanceof Error ? err.message : 'An unexpected error occurred');
    return {
      success: false,
      error: errorMessage,
    };
  }
}
