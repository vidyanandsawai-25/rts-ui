'use server';

import { revalidatePath } from 'next/cache';
import {
  getBillingFrequenciesPaged,
  getBillingFrequencyById,
  createBillingFrequency,
  updateBillingFrequency,
  purgeBillingFrequency,
} from '@/lib/api/waterBill/billingFrequencyMaster.service';
import { getTranslations } from 'next-intl/server';
import {
  validateBillingFrequencyInput,
  mapToCreateBillingFrequencyDto,
  mapToUpdateBillingFrequencyDto,
  BillingFrequencyInput,
} from '@/hooks/water-bill/billing-frequency-master/useBillingFrequencyServer';
import {
  BillingFrequencyFormState,
  BillingFrequencyMaster,
  BillingFrequencyMasterPagedResponse,
  BillingFrequencyMasterQueryParameters,
} from '@/types/waterBill/billingFrequencyMaster.types';

export async function fetchBillingFrequenciesAction(
  params?: BillingFrequencyMasterQueryParameters
): Promise<BillingFrequencyMasterPagedResponse> {
  try {
    const response = await getBillingFrequenciesPaged(params);
    if (response.success && response.data) {
      return response.data;
    }
    return {
      items: [],
      totalCount: 0,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  } catch {
    return {
      items: [],
      totalCount: 0,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
}

export async function fetchBillingFrequencyByIdAction(id: number): Promise<BillingFrequencyMaster | null> {
  try {
    const response = await getBillingFrequencyById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createBillingFrequencyAction(
  _prevState: BillingFrequencyFormState,
  input: BillingFrequencyInput
): Promise<BillingFrequencyFormState> {
  const t = await getTranslations('billingFrequencyMaster');
  const validation = validateBillingFrequencyInput(input, (key, values) => t(key, values));
  if (!validation.isValid) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const dto = mapToCreateBillingFrequencyDto(input);
    const response = await createBillingFrequency(dto);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.createFailed'),
      };
    }

    revalidatePath('/[locale]/water-bill/billing-frequency-master', 'page');
    return {
      success: true,
      message: t('messages.createSuccess'),
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.unexpectedError'),
    };
  }
}

export async function updateBillingFrequencyAction(
  id: number,
  _prevState: BillingFrequencyFormState,
  input: BillingFrequencyInput
): Promise<BillingFrequencyFormState> {
  const t = await getTranslations('billingFrequencyMaster');
  const validation = validateBillingFrequencyInput(input, (key, values) => t(key, values));
  if (!validation.isValid) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const dto = mapToUpdateBillingFrequencyDto(id, input);
    const response = await updateBillingFrequency(id, dto);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.updateFailed'),
      };
    }

    revalidatePath('/[locale]/water-bill/billing-frequency-master', 'page');
    return {
      success: true,
      message: t('messages.updateSuccess'),
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.unexpectedError'),
    };
  }
}

export async function deleteBillingFrequencyAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const t = await getTranslations('billingFrequencyMaster');
  try {
    const response = await purgeBillingFrequency(id);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.deleteFailed'),
        statusCode: response.statusCode,
      };
    }

    revalidatePath('/[locale]/water-bill/billing-frequency-master', 'page');
    return {
      success: true,
      message: t('messages.deleteSuccess'),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : t('errors.unexpectedError'),
    };
  }
}
