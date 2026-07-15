/**
 * Tax Calculation Guideline – API Service Layer
 * Handles GET, POST and PUT operations against the backend tax guideline endpoint.
 */
import 'server-only';
import { apiClient } from '@/services/api.service';
import { ApiError } from '@/lib/utils/api';
import type { PagedResponse } from '@/types/common.types';
import type { TaxCalculationGuidelineDto } from '@/types/tax-calculation-guideline.types';

const ENDPOINT = 'TaxCalculationGuideline';
const CONTEXT = 'Tax Calculation Guideline';

/**
 * Fetch the current tax calculation guideline configuration.
 * Returns `null` when the record does not yet exist (or list is empty).
 */
export async function getTaxCalculationGuideline(): Promise<TaxCalculationGuidelineDto | null> {
  const response = await apiClient.get<PagedResponse<TaxCalculationGuidelineDto>>(ENDPOINT);
  if (!response.success) {
    if (response.statusCode === 404) return null;
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? 'Unknown error',
      `Failed to fetch ${CONTEXT}`
    );
  }
  return response.data?.items?.[0] ?? null;
}

/**
 * Create a new tax calculation guideline configuration.
 */
export async function createTaxCalculationGuideline(
  payload: TaxCalculationGuidelineDto
): Promise<TaxCalculationGuidelineDto> {
  const response = await apiClient.post<TaxCalculationGuidelineDto>(ENDPOINT, payload);
  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? 'Unknown error',
      `Failed to create ${CONTEXT}`
    );
  }
  return response.data;
}

/**
 * Update an existing tax calculation guideline configuration.
 */
export async function updateTaxCalculationGuideline(
  id: number,
  payload: TaxCalculationGuidelineDto
): Promise<TaxCalculationGuidelineDto> {
  const response = await apiClient.put<TaxCalculationGuidelineDto>(`${ENDPOINT}/${id}`, payload);
  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? 'Unknown error',
      `Failed to update ${CONTEXT}`
    );
  }
  return response.data;
}

/**
 * Upsert (create or update) the tax calculation guideline configuration.
 * Uses PUT when `payload.id` is present, otherwise POST.
 */
export async function saveTaxCalculationGuideline(
  payload: TaxCalculationGuidelineDto
): Promise<TaxCalculationGuidelineDto> {
  return payload.id
    ? updateTaxCalculationGuideline(payload.id, payload)
    : createTaxCalculationGuideline(payload);
}
