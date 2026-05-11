import { IRateCreate } from "@/types/RVRateMaster";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { getTranslations } from 'next-intl/server';

/**
 * Bulk create rate master records (POST /Rate/Bulk)
 * Backend expects an array of rate objects directly
 */
export async function bulkCreateRateMaster(payload: IRateCreate[]): Promise<void> {
  try {
    const response = await apiClient.post<{ data?: unknown }>(`/Rate/Bulk`, payload);
    if (!response.success) {
      const t = await getTranslations('rvRateMasterErrors');
      throw new ApiError(response.statusCode ?? 500, response.error || t('errorsResponse.bulkCreateFailed'), 'Bulk create rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('rvRateMasterErrors');
    throw new ApiError(500, error instanceof Error ? error.message : t('errorsResponse.unknownError'), 'Bulk create rate master failed');
  }
}

/**
 * Bulk update rate master records (PUT /Rate/Bulk)
 * Accepts array of { id, data } objects as required by backend
 */
export async function bulkUpdateRateMaster(payload: Array<{ id: number, data: Record<string, unknown> }>): Promise<void> {
  try {
    const response = await apiClient.put<{ data?: unknown }>(`/Rate/Bulk`, payload);
    if (!response.success) {
      const t = await getTranslations('rvRateMasterErrors');
      throw new ApiError(response.statusCode ?? 500, response.error || t('errorsResponse.bulkUpdateFailed'), 'Bulk update rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('rvRateMasterErrors');
    throw new ApiError(500, error instanceof Error ? error.message : t('errorsResponse.unknownError'), 'Bulk update rate master failed');
  }
}

/**
 * Bulk purge rate master records (DELETE /Rate/Bulk/purge)
 */
export async function bulkPurgeRateMaster(ids: number[]): Promise<void> {  
  try {
    const response = await apiClient.delete<unknown>(`/Rate/Bulk/purge`, {
      body: JSON.stringify(ids),
    });
    if (!response.success) {
      const t = await getTranslations('rvRateMasterErrors');
      throw new ApiError(response.statusCode ?? 500, response.error || t('errorsResponse.bulkPurgeFailed'), 'Bulk purge rate master failed');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const t = await getTranslations('rvRateMasterErrors');
    throw new ApiError(500, error instanceof Error ? error.message : t('errorsResponse.unknownError'), 'Bulk purge rate master failed');
  }
}
