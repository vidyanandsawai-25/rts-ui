'use server';

import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';
import type { ApiResponse } from '@/types/common.types';
import type {
  TaxCalculationGuidelineDto,
  TaxCalculationGuidelineFormData,
} from '@/types/tax-calculation-guideline.types';
import {
  getTaxCalculationGuideline,
  saveTaxCalculationGuideline,
} from '@/lib/api/configuration-settings/tax-calculation-guideline/tax-calculation-guideline.service';
import { mapFormDataToDto } from '@/lib/api/configuration-settings/tax-calculation-guideline/tax-calculation-guideline.mapper';

/**
 * Server action – load the tax calculation guideline for SSR.
 */
export async function getTaxCalculationGuidelineAction(): Promise<
  ApiResponse<TaxCalculationGuidelineDto | TaxCalculationGuidelineDto[] | null>
> {
  try {
    const data = await getTaxCalculationGuideline();
    return { success: true, statusCode: 200, data };
  } catch (err) {
    const apiErr = err as { name?: string; statusCode?: number; responseText?: string; message?: string };
    const statusCode = apiErr.name === 'ApiError' && typeof apiErr.statusCode === 'number'
      ? apiErr.statusCode
      : 500;
    const message =
      apiErr.name === 'ApiError'
        ? (apiErr.responseText || apiErr.message || 'Failed to load tax calculation guideline')
        : err instanceof Error
        ? err.message
        : 'Failed to load tax calculation guideline';
    return { success: false, statusCode, error: message };
  }
}

/**
 * Server action – persist the tax calculation guideline.
 */
export async function saveTaxCalculationGuidelineAction(
  formData: TaxCalculationGuidelineFormData,
  baseDto?: TaxCalculationGuidelineDto | TaxCalculationGuidelineDto[] | null
): Promise<ApiResponse<TaxCalculationGuidelineDto | TaxCalculationGuidelineDto[]> & { message?: string }> {
  try {
    let activeDto = baseDto;

    // Self-healing fallback: if the client state is in "create" mode but a record
    // already exists in the database, automatically fetch it and perform an update.
    const isCreateMode = !activeDto || (Array.isArray(activeDto) && activeDto.length === 0) || (!Array.isArray(activeDto) && !activeDto.id);
    if (isCreateMode) {
      const existing = await getTaxCalculationGuideline();
      if (existing) {
        activeDto = existing;
      }
    }

    const payload = mapFormDataToDto(formData, activeDto);
    const saved = await saveTaxCalculationGuideline(payload);

    // Revalidate for all locales to ensure cached pages are refreshed
    for (const locale of locales) {
      revalidatePath(`/${locale}/configuration-settings/tax-calculation-guideline`, 'page');
    }

    const isUpdate = Array.isArray(activeDto)
      ? activeDto.length > 0 && activeDto.some((item) => !!item.id)
      : !!activeDto?.id;

    return {
      success: true,
      statusCode: 200,
      data: saved,
      message: isUpdate
        ? 'Tax calculation guideline updated successfully'
        : 'Tax calculation guideline created successfully',
    };
  } catch (err) {
    const apiErr = err as { name?: string; statusCode?: number; responseText?: string; message?: string };
    const statusCode = apiErr.name === 'ApiError' && typeof apiErr.statusCode === 'number'
      ? apiErr.statusCode
      : 500;
    const message =
      apiErr.name === 'ApiError'
        ? (apiErr.responseText || apiErr.message || 'Failed to save tax calculation guideline')
        : err instanceof Error
        ? err.message
        : 'Failed to save tax calculation guideline';
    return { success: false, statusCode, error: message };
  }
}
