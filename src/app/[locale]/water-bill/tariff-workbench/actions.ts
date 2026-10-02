'use server';

import { getTranslations } from 'next-intl/server';
import {
  createTariffWorkbench,
  updateTariffWorkbench,
  purgeTariffWorkbench,
} from '@/lib/api/waterBill/tariffWorkbench.service';
import {
  validateTariffInput,
  mapToCreateTariffDto,
  mapToUpdateTariffDto,
} from '@/lib/services/water-bill/tariffWorkbenchMapper';
import { logger } from '@/lib/utils/server-logger';
import { verifyServerActionAccess } from '@/lib/utils/server-access-guard';
import { revalidateModulePaths } from '@/lib/server/revalidation-helper';
import type {
  TariffWorkbenchFormState,
  TariffWorkbenchInput,
} from '@/types/waterBill/tariffWorkbench.types';

const BASE_PATH = '/[locale]/water-bill/tariff-workbench';

function getSafeActionError(
  t: (key: string) => string,
  defaultKey: string,
  responseError?: string | null,
  statusCode?: number
): string {
  if (statusCode === 403 || responseError === 'errors.forbidden') {
    return t('errors.forbidden');
  }
  if (statusCode === 404 || responseError === 'errors.notFound') {
    return t('errors.notFound');
  }
  return t(defaultKey);
}

export async function createTariffWorkbenchAction(
  _prevState: TariffWorkbenchFormState,
  input: TariffWorkbenchInput
): Promise<TariffWorkbenchFormState> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'edit');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.forbidden'),
    };
  }

  const validation = validateTariffInput(input, (key, values) => t(key, values));
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  const dto = mapToCreateTariffDto(validation.data);

  try {
    const response = await createTariffWorkbench(dto);

    if (response.success && response.data) {
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.createSuccess'),
        data: response.data,
      };
    }

    logger.warn('createTariffWorkbenchAction backend failure', {
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.createFailed', response.error, response.statusCode),
    };
  } catch (err: unknown) {
    logger.error('Error in createTariffWorkbenchAction', {}, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.createFailed'),
    };
  }
}

export async function updateTariffWorkbenchAction(
  id: number,
  _prevState: TariffWorkbenchFormState,
  input: TariffWorkbenchInput
): Promise<TariffWorkbenchFormState> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'edit');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.forbidden'),
    };
  }

  const validation = validateTariffInput(input, (key, values) => t(key, values));
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  const dto = mapToUpdateTariffDto(id, validation.data);

  try {
    const response = await updateTariffWorkbench(id, dto);

    if (response.success && response.data) {
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.updateSuccess'),
        data: response.data,
      };
    }

    logger.warn('updateTariffWorkbenchAction backend failure', {
      id,
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.updateFailed', response.error, response.statusCode),
    };
  } catch (err: unknown) {
    logger.error('Error in updateTariffWorkbenchAction', { id }, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.updateFailed'),
    };
  }
}

export async function deleteTariffWorkbenchAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const t = await getTranslations('tariffWorkbench');
  const hasAccess = await verifyServerActionAccess('WATERBILL.TARIFFMASTER', 'delete');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.noDeleteAction'),
    };
  }

  try {
    const response = await purgeTariffWorkbench(id);

    if (response.success) {
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.deleteSuccess'),
      };
    }

    logger.warn('deleteTariffWorkbenchAction backend failure', {
      id,
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.deleteFailed', response.error, response.statusCode),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    logger.error('Error in deleteTariffWorkbenchAction', { id }, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.deleteFailed'),
    };
  }
}
