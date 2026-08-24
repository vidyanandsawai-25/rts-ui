import type { ActionResult } from '@/types/common.types';

export interface PtisTranslationFunction {
  (key: string, values?: Record<string, string | number | Date>): string;
  has(key: string): boolean;
}

interface ResolveValuationDataOptions<T> {
  propertyId?: number;
  initialData?: T | null;
  initialError?: string;
  hasFetchedInitialData?: boolean;
  fetcher: (propertyId: number) => Promise<ActionResult<T>>;
  fallbackUserMessage: string;
  t?: PtisTranslationFunction;
}

interface ResolveValuationDataResult<T> {
  data: T | null;
  error?: string;
  message?: string;
  warning?: string;
}

export const PTIS_VALUATION_ERROR_MESSAGES = {
  notFound: 'Requested PTIS valuation data was not found.',
  unauthorized: 'You are not authorized to access this PTIS valuation data.',
  invalidRequest: 'Invalid request. Please verify property details and try again.',
  serverIssue: 'Unable to load PTIS valuation data due to a server issue. Please try again.',
  networkIssue: 'Unable to connect to PTIS services right now. Please try again.',
} as const;

/**
 * Localizes raw backend exception messages case-insensitively while preserving exact backend detail strings.
 */
export function localizeBackendError(rawError: string, _t?: PtisTranslationFunction): string {
  // Always return the exact raw backend error message so detailed criteria
  // (e.g. MoujaId, CSN, AssessmentYear, TypeOfUseGroupId, FloorGroupId) are presented as returned by the API
  return rawError;
}

/**
 * Converts raw API/action errors into user-safe messages for PTIS valuation modules.
 * Prioritizes rawError if it exists, otherwise falls back to status-based or predefined messages.
 */
export function getPtisUserSafeErrorMessage(
  rawError: string | undefined,
  statusCode: number | undefined,
  fallbackUserMessage: string,
  t?: PtisTranslationFunction
): string {
  if (rawError?.trim()) {
    return rawError.trim();
  }

  if (statusCode === 404) {
    return t?.has('error.notFound') ? t('error.notFound') : PTIS_VALUATION_ERROR_MESSAGES.notFound;
  }

  if (statusCode === 401 || statusCode === 403) {
    return t?.has('error.unauthorized') ? t('error.unauthorized') : PTIS_VALUATION_ERROR_MESSAGES.unauthorized;
  }

  if (statusCode === 400) {
    return t?.has('error.invalidRequest') ? t('error.invalidRequest') : PTIS_VALUATION_ERROR_MESSAGES.invalidRequest;
  }

  if (statusCode != null && statusCode >= 500) {
    return t?.has('error.serverError') ? t('error.serverError') : PTIS_VALUATION_ERROR_MESSAGES.serverIssue;
  }

  return fallbackUserMessage;
}

/**
 * Helper to determine if an error string or status code indicates missing data / empty valuation state
 * (e.g. newly created property with no CV or RV records).
 */
export function isMissingValuationDataError(rawError?: string, statusCode?: number): boolean {
  if (statusCode === 404) return true;
  if (!rawError?.trim()) return false;

  const errUpper = rawError.toUpperCase();
  return (
    errUpper.includes('NOT FOUND') ||
    errUpper.includes('NOTFOUND') ||
    errUpper.includes('NO CAPITAL') ||
    errUpper.includes('NO RATEABLE') ||
    errUpper.includes('NO DATA') ||
    errUpper.includes('DOES NOT EXIST') ||
    errUpper.includes('EMPTY') ||
    errUpper === '404'
  );
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
  t,
}: ResolveValuationDataOptions<T>): Promise<ResolveValuationDataResult<T>> {
  if (initialData != null) {
    return { data: initialData };
  }

  if (initialError) {
    return {
      data: null,
      error: getPtisUserSafeErrorMessage(initialError, undefined, fallbackUserMessage, t),
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
    return {
      data: result.data ?? null,
      message: result.message,
      warning: result.error ? getPtisUserSafeErrorMessage(result.error, undefined, '', t) : undefined,
    };
  }

  return {
    data: null,
    error: getPtisUserSafeErrorMessage(result.error, result.statusCode, fallbackUserMessage, t),
  };
}
