'use server';

import { getTranslations } from 'next-intl/server';
import {
  createChargeHead,
  updateChargeHead,
  deleteChargeHead,
  normalizeChargeHead,
} from '@/lib/api/waterBill/chargeHeads.service';
import { validateChargeHeadInput } from '@/lib/services/water-bill/chargeHeadsMapper';
import { logger } from '@/lib/utils/server-logger';
import { verifyServerActionAccess } from '@/lib/utils/server-access-guard';
import { revalidateModulePaths } from '@/lib/server/revalidation-helper';
import type {
  CreateChargeHeadDto,
  ChargeHeadFormState,
} from '@/types/waterBill/chargeHeads.types';

const BASE_PATH = '/[locale]/water-bill/charge-heads';

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

export async function createChargeHeadAction(
  _prevState: ChargeHeadFormState,
  input: CreateChargeHeadDto
): Promise<ChargeHeadFormState> {
  const t = await getTranslations('chargeHeads');
  const hasAccess = await verifyServerActionAccess('WATERBILL.CHARGEHEADMASTER', 'edit');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.forbidden'),
    };
  }

  const validation = validateChargeHeadInput(input, (key, values) => t(key, values));
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      message: t('errors.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const response = await createChargeHead(validation.data);

    if (response.success && response.data) {
      const norm = normalizeChargeHead(response.data);
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.createSuccess'),
        data: norm,
      };
    }

    logger.warn('createChargeHeadAction backend failure', {
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.createFailed', response.error, response.statusCode),
    };
  } catch (err: unknown) {
    logger.error('Error in createChargeHeadAction', {}, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.createFailed'),
    };
  }
}

export async function updateChargeHeadAction(
  id: number,
  _prevState: ChargeHeadFormState,
  input: CreateChargeHeadDto
): Promise<ChargeHeadFormState> {
  const t = await getTranslations('chargeHeads');
  const hasAccess = await verifyServerActionAccess('WATERBILL.CHARGEHEADMASTER', 'edit');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.forbidden'),
    };
  }

  const validation = validateChargeHeadInput(input, (key, values) => t(key, values));
  if (!validation.isValid || !validation.data) {
    return {
      success: false,
      message: t('errors.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const response = await updateChargeHead(id, { ...validation.data, id });

    if (response.success && response.data) {
      const norm = normalizeChargeHead(response.data);
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.updateSuccess'),
        data: norm,
      };
    }

    logger.warn('updateChargeHeadAction backend failure', {
      id,
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.updateFailed', response.error, response.statusCode),
    };
  } catch (err: unknown) {
    logger.error('Error in updateChargeHeadAction', { id }, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.updateFailed'),
    };
  }
}

export async function deleteChargeHeadAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const t = await getTranslations('chargeHeads');
  const hasAccess = await verifyServerActionAccess('WATERBILL.CHARGEHEADMASTER', 'delete');
  if (!hasAccess) {
    return {
      success: false,
      message: t('errors.noDeleteAction'),
    };
  }
  const targetId = Number(id);

  try {
    const response = await deleteChargeHead(targetId);

    if (response.success) {
      revalidateModulePaths(BASE_PATH);
      return {
        success: true,
        message: t('messages.deleteSuccess'),
      };
    }

    logger.warn('deleteChargeHeadAction backend failure', {
      id: targetId,
      statusCode: response.statusCode,
      error: response.error,
    });

    return {
      success: false,
      message: getSafeActionError(t, 'errors.deleteFailed', response.error, response.statusCode),
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    logger.error('Error in deleteChargeHeadAction', { id: targetId }, err);
    return {
      success: false,
      message: getSafeActionError(t, 'errors.deleteFailed'),
    };
  }
}
