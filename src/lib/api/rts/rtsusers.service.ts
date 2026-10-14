import 'server-only';

import { apiClient } from '@/services/api.service';
import type { RtsUserLookupPage, RtsUserLookupQueryParams } from '@/types/rts/rts-users.types';

const RTS_USERS_ENDPOINT = '/RtsUsers';
export const RTS_WORKFLOW_USERS_DEPARTMENT_ID = 5;

/** Retrieves profile-only RTS users without department, module, or role allocations. */
export async function getRtsUsers(
  params: RtsUserLookupQueryParams = {}
): Promise<RtsUserLookupPage> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }

  const response = await apiClient.get<RtsUserLookupPage>(
    `${RTS_USERS_ENDPOINT}${query.size ? `?${query}` : ''}`,
    { cache: 'no-store' }
  );
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch RTS users.');
  }
  return response.data;
}

/** Retrieves workflow officers from the configured department only. */
export async function getWorkflowRtsUsers(
  params: Omit<RtsUserLookupQueryParams, 'DepartmentId'> = {}
): Promise<RtsUserLookupPage> {
  return getRtsUsers({ ...params, DepartmentId: RTS_WORKFLOW_USERS_DEPARTMENT_ID });
}
