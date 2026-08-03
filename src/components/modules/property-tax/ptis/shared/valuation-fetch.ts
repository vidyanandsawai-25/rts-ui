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
 * Localizes raw backend exception messages case-insensitively.
 */
export function localizeBackendError(rawError: string, t: PtisTranslationFunction): string {
  const errUpper = rawError.toUpperCase();
  if (
    errUpper.includes('PROPERTYDETAILSNOTFOUND') || 
    errUpper.includes('PROPERTY DETAILS NOT FOUND') ||
    (errUpper.includes('PROPERTYDETAILS') && errUpper.includes('NOT FOUND')) ||
    (errUpper.includes('PROPERTY DETAILS') && errUpper.includes('NOT FOUND'))
  ) {
    return t.has('error.propertyDetailsNotFound') ? t('error.propertyDetailsNotFound') : rawError;
  }
  if (
    errUpper.includes('INVALIDPROPERTYDATA') || 
    errUpper.includes('INVALID PROPERTY DATA') ||
    (errUpper.includes('INVALID') && errUpper.includes('PROPERTY DATA'))
  ) {
    return t.has('error.invalidPropertyData') ? t('error.invalidPropertyData') : rawError;
  }
  if (
    errUpper.includes('TYPEOFUSEGROUPNOTFOUND') || 
    errUpper.includes('TYPE OF USE GROUP NOT FOUND') ||
    (errUpper.includes('TYPEOFUSEGROUP') && errUpper.includes('NOT FOUND')) ||
    (errUpper.includes('TYPE OF USE GROUP') && errUpper.includes('NOT FOUND'))
  ) {
    return t.has('error.typeOfUseGroupNotFound') ? t('error.typeOfUseGroupNotFound') : rawError;
  }
  if (
    errUpper.includes('YEARRANGENOTFOUND') || 
    errUpper.includes('YEAR RANGE NOT FOUND') ||
    (errUpper.includes('YEARRANGE') && errUpper.includes('NOT FOUND')) ||
    (errUpper.includes('YEAR RANGE') && errUpper.includes('NOT FOUND'))
  ) {
    return t.has('error.yearRangeNotFound') ? t('error.yearRangeNotFound') : rawError;
  }
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
    if (t) {
      return localizeBackendError(rawError, t);
    }
    return rawError;
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
