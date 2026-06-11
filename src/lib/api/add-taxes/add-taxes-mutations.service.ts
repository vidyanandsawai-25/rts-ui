import 'server-only';
import { apiClient } from '@/services/api.service';
import { getTranslations } from 'next-intl/server';
import { ApiError } from '@/lib/utils/api';
import { ExecuteRequest, ExecuteResult } from '@/types/add-taxes.types';

export async function executeOperationServer(request: ExecuteRequest): Promise<ExecuteResult> {
  const response = await apiClient.post<{ data: ExecuteResult }>(
    '/property-tax/operations/execute',
    request,
  );
  if (!response.success || !response.data) {
    const t = await getTranslations('addTaxes');
    throw new ApiError(
      response.statusCode ?? 500,
      response.error ?? t('messages.executeFailed'),
      'executeOperationServer',
    );
  }
  // Backend wraps in ApiResponse<ExecuteOperationResponseDto> with Items field
  const raw = response.data as unknown as Record<string, unknown>;
  const inner = (raw.items ?? raw.data ?? raw) as ExecuteResult;
  return inner;
}
