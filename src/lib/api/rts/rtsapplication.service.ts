import 'server-only';

import { apiClient } from '@/services/api.service';
import type {
  CreateRtsApplicationPayload,
  CreateRtsApplicationResponse,
  CreateRtsApplicationResponseItem,
} from '@/types/rts/rts-application.types';

export type {
  CreateRtsApplicationPayload,
  CreateRtsApplicationResponse,
  CreateRtsApplicationResponseItem,
} from '@/types/rts/rts-application.types';

/** Creates a citizen RTS application after documents have been uploaded. */
export async function createRtsApplication(
  payload: CreateRtsApplicationPayload
): Promise<CreateRtsApplicationResponse> {
  const response = await apiClient.post<CreateRtsApplicationResponse>('/RTSApplication', payload, {
    cache: 'no-store',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create RTS application');
  }

  return response.data;
}

/** Retrieves a submitted application by its RTS application number. */
export async function getRtsApplicationByNo(
  applicationNo: string
): Promise<CreateRtsApplicationResponseItem> {
  const response = await apiClient.get<CreateRtsApplicationResponseItem>(
    `/RTSApplication/${encodeURIComponent(applicationNo)}`,
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS application ${applicationNo}`);
  }

  return response.data;
}

/** Compatibility for the existing process-page route while it migrates to application-number lookup. */
export async function getRtsApplicationById(id: number | string): Promise<CreateRtsApplicationResponseItem> {
  return getRtsApplicationByNo(String(id));
}
