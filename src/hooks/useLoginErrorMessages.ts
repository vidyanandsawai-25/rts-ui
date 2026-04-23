'use client';

/**
 * Maps API/auth error codes to localized strings for the login flow.
 * Kept separate from {@link useLoginForm} to keep the form hook under review size limits.
 *
 * @module useLoginErrorMessages
 */

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AUTH_ERROR_CODES } from '@/components/modules/login/constants';

// ---------------------------------------------------------------------------
// Error code → `common.login.errors` key (when the key differs from the code)
// ---------------------------------------------------------------------------

const AUTH_ERROR_TO_LOGIN_I18N_KEY: Record<string, string> = {
  [AUTH_ERROR_CODES.CREDENTIALS_REQUIRED]: 'credentialsRequired',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'invalidCredentials',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'Auth_AccountLocked_Temporary',
  [AUTH_ERROR_CODES.ACCOUNT_INACTIVE]: 'ACCOUNT_INACTIVE',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'Auth_UserNotFound',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'SESSION_EXPIRED',
  [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: 'TOO_MANY_ATTEMPTS',
  [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: 'serviceUnavailable',
  [AUTH_ERROR_CODES.REQUEST_TIMEOUT]: 'REQUEST_TIMEOUT',
  [AUTH_ERROR_CODES.LOGIN_FAILED]: 'LOGIN_FAILED',
  [AUTH_ERROR_CODES.PASSWORD_CHANGE_REQUIRED]: 'passwordChangeRequired',
  [AUTH_ERROR_CODES.INVALID_OTP_FORMAT]: 'enterValidToken',
  [AUTH_ERROR_CODES.VERIFICATION_FAILED]: 'VERIFICATION_FAILED',
  [AUTH_ERROR_CODES.RESEND_FAILED]: 'RESEND_FAILED',
  [AUTH_ERROR_CODES.RESET_FAILED]: 'RESET_FAILED',
  [AUTH_ERROR_CODES.INVALID_REQUEST]: 'INVALID_REQUEST',
  PASSWORDS_MISMATCH: 'passwordsMismatch',
};

/**
 * Hook to convert error codes to localized messages.
 * Separated for reuse in components that don't need full form management.
 */
export function useLoginErrorMessages() {
  const t = useTranslations('common.login');

  const getLocalizedError = useCallback(
    (errorCode: string | undefined): string => {
      if (!errorCode) return '';

      const suffix = AUTH_ERROR_TO_LOGIN_I18N_KEY[errorCode] ?? errorCode;
      const primary = `errors.${suffix}`;

      if (typeof t.has === 'function' && t.has(primary)) {
        return t(primary);
      }

      const fallbackCode = `errors.${errorCode}`;
      if (typeof t.has === 'function' && t.has(fallbackCode)) {
        return t(fallbackCode);
      }

      try {
        return t(primary);
      } catch {
        try {
          return t(fallbackCode);
        } catch {
          try {
            return t('errors.LOGIN_FAILED');
          } catch {
            return errorCode;
          }
        }
      }
    },
    [t]
  );

  return { getLocalizedError };
}
