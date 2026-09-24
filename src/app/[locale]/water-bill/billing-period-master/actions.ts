'use server';

import { revalidatePath } from 'next/cache';
import {
  getBillingPeriodsPaged,
  getBillingPeriodById,
  createBillingPeriod,
  updateBillingPeriod,
  purgeBillingPeriod,
  getFinancialYearDropdownOptions,
  getBillingFrequencyDropdownOptions,
} from '@/lib/api/waterBill/billingPeriodMaster.service';
import { getTranslations } from 'next-intl/server';
import {
  validateBillingPeriodInput,
  mapToCreateBillingPeriodDto,
  mapToUpdateBillingPeriodDto,
  BillingPeriodInput,
} from '@/hooks/water-bill/billing-period-master/useBillingPeriodServer';
import {
  BillingPeriodFormState,
  BillingPeriodMaster,
  BillingPeriodPagedResponse,
  BillingPeriodQueryParameters,
  DropdownOption,
} from '@/types/waterBill/billingPeriodMaster.types';

export async function fetchBillingPeriodsAction(
  params?: BillingPeriodQueryParameters
): Promise<BillingPeriodPagedResponse> {
  try {
    const response = await getBillingPeriodsPaged(params);
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

export async function fetchBillingPeriodByIdAction(id: number): Promise<BillingPeriodMaster | null> {
  try {
    const response = await getBillingPeriodById(id);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchFinancialYearsDropdownAction(): Promise<DropdownOption[]> {
  return await getFinancialYearDropdownOptions();
}

export async function fetchBillingFrequenciesDropdownAction(): Promise<DropdownOption[]> {
  return await getBillingFrequencyDropdownOptions();
}

export async function createBillingPeriodAction(
  _prevState: BillingPeriodFormState,
  input: BillingPeriodInput
): Promise<BillingPeriodFormState> {
  const t = await getTranslations('billingPeriodMaster');
  const validation = validateBillingPeriodInput(input, (key, values) => t(key, values));
  if (!validation.isValid) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const dto = mapToCreateBillingPeriodDto(input);
    const response = await createBillingPeriod(dto);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.createFailed'),
      };
    }

    revalidatePath('/[locale]/water-bill/billing-period-master', 'page');
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

export async function updateBillingPeriodAction(
  id: number,
  _prevState: BillingPeriodFormState,
  input: BillingPeriodInput
): Promise<BillingPeriodFormState> {
  const t = await getTranslations('billingPeriodMaster');
  const validation = validateBillingPeriodInput(input, (key, values) => t(key, values));
  if (!validation.isValid) {
    return {
      success: false,
      message: t('validation.validationFailed'),
      errors: validation.errors,
    };
  }

  try {
    const dto = mapToUpdateBillingPeriodDto(id, input);
    const response = await updateBillingPeriod(id, dto);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.updateFailed'),
      };
    }

    revalidatePath('/[locale]/water-bill/billing-period-master', 'page');
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

export async function deleteBillingPeriodAction(
  id: number
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const t = await getTranslations('billingPeriodMaster');
  try {
    const response = await purgeBillingPeriod(id);

    if (!response.success) {
      return {
        success: false,
        message: response.error || t('messages.deleteFailed'),
        statusCode: response.statusCode,
      };
    }

    revalidatePath('/[locale]/water-bill/billing-period-master', 'page');
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
