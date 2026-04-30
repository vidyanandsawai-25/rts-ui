import type { ActionResult } from '@/types/common.types';

interface ResolveValuationDataOptions<T> {
  propertyId?: number;
  initialData?: T | null;
  initialError?: string;
  hasFetchedInitialData?: boolean;
  fetcher: (propertyId: number) => Promise<ActionResult<T>>;
  fallbackUserMessage: string;
}

interface ResolveValuationDataResult<T> {
  data: T | null;
  error?: string;
}

export const PTIS_VALUATION_ERROR_MESSAGES = {
  notFound: 'Requested PTIS valuation data was not found.',
  unauthorized: 'You are not authorized to access this PTIS valuation data.',
  invalidRequest: 'Invalid request. Please verify property details and try again.',
  serverIssue: 'Unable to load PTIS valuation data due to a server issue. Please try again.',
  networkIssue: 'Unable to connect to PTIS services right now. Please try again.',
} as const;

/**
 * Converts raw API/action errors into user-safe messages for PTIS valuation modules.
 * Prioritizes rawError if it exists, otherwise falls back to status-based or predefined messages.
 */
export function getPtisUserSafeErrorMessage(
  rawError: string | undefined,
  statusCode: number | undefined,
  fallbackUserMessage: string
): string {
  if (rawError?.trim()) {
    return rawError;
  }

  if (statusCode === 404) {
    return PTIS_VALUATION_ERROR_MESSAGES.notFound;
  }

  if (statusCode === 401 || statusCode === 403) {
    return PTIS_VALUATION_ERROR_MESSAGES.unauthorized;
  }

  if (statusCode === 400) {
    return PTIS_VALUATION_ERROR_MESSAGES.invalidRequest;
  }

  if (statusCode != null && statusCode >= 500) {
    return PTIS_VALUATION_ERROR_MESSAGES.serverIssue;
  }

  return fallbackUserMessage;
}

/**
 * Reusable fetch resolver for valuation sections (Rateable, Capital).
 */
export async function resolveValuationData<T>({
  propertyId,
  initialData,
  initialError,
  hasFetchedInitialData = false,
  fetcher,
  fallbackUserMessage,
}: ResolveValuationDataOptions<T>): Promise<ResolveValuationDataResult<T>> {
  if (initialData != null) {
    return { data: initialData };
  }

  if (initialError) {
    return {
      data: null,
      error: getPtisUserSafeErrorMessage(initialError, undefined, fallbackUserMessage),
    };
  }

  if (hasFetchedInitialData) {
    return { data: null };
  }

  if (!propertyId) {
    return { data: null };
  }

  const result = await fetcher(propertyId);
  if (result.success) {
    return { data: result.data ?? null };
  }

  return {
    data: null,
    error: result.error || getPtisUserSafeErrorMessage(undefined, result.statusCode, fallbackUserMessage),
  };
}
