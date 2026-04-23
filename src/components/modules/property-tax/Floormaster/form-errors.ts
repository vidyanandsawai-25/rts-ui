/**
 * Shared utility for handling API error messages in Floor/SubFloor forms
 */

interface ApiErrorResult {
  statusCode?: number;
  message?: string;
}

interface TranslationFunctions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: Record<string, any>) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tCommon: (key: string, params?: Record<string, any>) => string;
}

/**
 * Converts API error responses to user-friendly translated messages
 * Handles 409 (duplicate), 400, 404, 401/403, and 500+ errors
 */
export function getApiErrorMessage(
  result: ApiErrorResult,
  translations: TranslationFunctions
): string {
  const { t, tCommon } = translations;

  // First check the actual message content for duplicates
  const msg = result.message?.toLowerCase() || '';
  if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('same details')) {
    // Return the backend message directly for duplicate errors
    return result.message || t('apiErrors.duplicateRecord');
  }

  // Then check status codes
  if (result.statusCode === 409) return t('apiErrors.duplicateRecord');
  if (result.statusCode === 400) return result.message || t('apiErrors.invalidData');
  if (result.statusCode === 404) return t('apiErrors.notFound');
  if (result.statusCode === 401 || result.statusCode === 403) {
    return tCommon('errors.unauthorized');
  }
  if (result.statusCode && result.statusCode >= 500) {
    return tCommon('errors.serverError');
  }

  // Return backend message if available, otherwise generic error
  return result.message || t('apiErrors.operationFailed');
}
