'use client';

import React, { useCallback, useState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Input, Button } from '@/components/common';
import { Label } from '@/components/common/label';

import type { LoginFormCopy } from '@/types/login.types';

// Import centralized constants for validation and sanitization
import {
  AUTH_CONSTRAINTS,
  USERNAME_SANITIZE,
  PASSWORD_SANITIZE,
  AUTH_ERROR_CODES,
  LOGIN_PRIMARY_SUBMIT_CLASS,
} from './constants';

// ---------------------------------------------------------------------------
// Translation Helpers
// ---------------------------------------------------------------------------

/**
 * Hook to access login-specific translations with a `login.` prefix.
 */
export function useLoginT() {
  const tc = useTranslations('common');
  return useCallback(
    (key: string, values?: Record<string, string | number | Date>) => {
      return (tc as (fullKey: string, v?: Record<string, string | number | Date>) => string)(
        `login.${key}`,
        values
      );
    },
    [tc]
  );
}

/**
 * Hook providing localized error message lookup for login errors.
 * Uses centralized error codes for consistent error handling.
 */
export function useLoginFormHelpers() {
  const t = useLoginT();
  const commonT = useTranslations('common');

  const getLocalizedError = useCallback(
    (errorCode: string | undefined): string => {
      if (!errorCode) return '';
      
      // Comprehensive error code mapping using centralized constants
      const errorKeyMap: Record<string, string> = {
        // Credential errors
        [AUTH_ERROR_CODES.USERNAME_REQUIRED]: 'errors.USERNAME_REQUIRED',
        [AUTH_ERROR_CODES.PASSWORD_REQUIRED]: 'errors.PASSWORD_REQUIRED',
        [AUTH_ERROR_CODES.CREDENTIALS_REQUIRED]: 'errors.credentialsRequired',
        [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'errors.invalidCredentials',
        [AUTH_ERROR_CODES.USERNAME_TOO_SHORT]: 'errors.USERNAME_TOO_SHORT',
        [AUTH_ERROR_CODES.USERNAME_TOO_LONG]: 'errors.USERNAME_TOO_LONG',
        [AUTH_ERROR_CODES.PASSWORD_TOO_LONG]: 'errors.PASSWORD_TOO_LONG',
        
        // Account status errors
        [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'errors.Auth_UserNotFound',
        [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'errors.Auth_AccountLocked_Temporary',
        [AUTH_ERROR_CODES.ACCOUNT_INACTIVE]: 'errors.accountInactive',
        [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'errors.sessionExpired',
        [AUTH_ERROR_CODES.PASSWORD_CHANGE_REQUIRED]: 'errors.passwordChangeRequired',
        
        // Rate limiting
        [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: 'errors.tooManyAttempts',
        
        // Service errors
        [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: 'errors.serviceUnavailable',
        [AUTH_ERROR_CODES.REQUEST_TIMEOUT]: 'errors.requestTimeout',
        [AUTH_ERROR_CODES.LOGIN_FAILED]: 'errors.LOGIN_FAILED',
        
        // Verification errors
        [AUTH_ERROR_CODES.INVALID_OTP_FORMAT]: 'errors.enterValidToken',
        [AUTH_ERROR_CODES.VERIFICATION_FAILED]: 'errors.VERIFICATION_FAILED',
        [AUTH_ERROR_CODES.RESEND_FAILED]: 'errors.RESEND_FAILED',
        [AUTH_ERROR_CODES.RESET_FAILED]: 'errors.RESET_FAILED',
        
        // Legacy mappings for backward compatibility
        'PASSWORDS_MISMATCH': 'errors.passwordsMismatch',
      };
      
      const translationKey = errorKeyMap[errorCode];
      if (translationKey) {
        try {
          return t(translationKey);
        } catch {
          // Fall through to dynamic lookup
        }
      }
      
      // Try dynamic key lookup
      const dynamicKey = `login.errors.${errorCode}`;
      try {
        return commonT(dynamicKey);
      } catch {
        // Fall through to generic error
      }
      
      // Final fallback
      try {
        return commonT('errors.generic');
      } catch {
        return errorCode;
      }
    },
    [t, commonT]
  );

  return { getLocalizedError };
}

// Re-export for backward compatibility
export { LOGIN_PRIMARY_SUBMIT_CLASS };

// ---------------------------------------------------------------------------
// Form Components
// ---------------------------------------------------------------------------

/**
 * Submit button that integrates with React form status.
 * Shows loading state during form submission.
 */
function FormSubmitButton({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={disabled || pending} className={className}>
      {children}
    </Button>
  );
}

/**
 * Login credential input fields with sanitization.
 * Implements input validation patterns from Construction Type Master.
 * 
 * Features:
 * - Username sanitization (removes invalid characters)
 * - Password sanitization (removes zero-width/control characters)
 * - Max length enforcement
 * - Password visibility toggle
 */
export function LoginCredentialFields({
  initialUsername,
  locale,
  copy,
}: {
  initialUsername: string;
  locale: string;
  copy: LoginFormCopy;
}) {
  const [password, setPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState(initialUsername);
  const [showPassword, setShowPassword] = useState(false);
  const usernameId = useId();
  const passwordId = useId();

  /**
   * Handles username input with sanitization.
   * Removes invalid characters and enforces max length.
   */
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Sanitize: remove characters not allowed in usernames
    value = value.replace(USERNAME_SANITIZE, '');
    
    // Enforce max length
    if (value.length > AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH) {
      value = value.slice(0, AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH);
    }
    
    setUsernameInput(value);
  }, []);

  /**
   * Handles password input with sanitization.
   * Removes zero-width and control characters that could cause issues.
   */
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Sanitize: remove zero-width and control characters
    value = value.replace(PASSWORD_SANITIZE, '');
    
    // Enforce max length
    if (value.length > AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH) {
      value = value.slice(0, AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH);
    }
    
    setPassword(value);
  }, []);

  return (
    <>
      <Input type="hidden" name="locale" value={locale} />
      <div className="space-y-5">
        {/* Username Field */}
        <div className="space-y-1.5">
          <Label htmlFor={usernameId} className="ml-1 text-sm font-semibold text-gray-700">
            {copy.username}
          </Label>
          <div className="group relative w-full">
            <User
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-cyan-600/80 transition-all duration-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] group-focus-within:text-cyan-500"
            />
            <Input
              id={usernameId}
              name="username"
              value={usernameInput}
              onChange={handleUsernameChange}
              placeholder={copy.usernamePlaceholder}
              maxLength={AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH}
              className="rounded-xl border-gray-200 bg-gray-50/50 py-2.5 pl-10 transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              fullWidth
              autoComplete="username"
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor={passwordId} className="ml-1 text-sm font-semibold text-gray-700">
            {copy.password}
          </Label>
          <div className="group relative w-full">
            <Lock
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-amber-600/80 transition-all duration-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)] group-focus-within:text-amber-500"
            />
            <Input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder={copy.passwordPlaceholder}
              maxLength={AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH}
              className="rounded-xl border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-11 transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              fullWidth
              autoComplete="current-password"
            />
            {password.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-400 hover:text-cyan-600"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-cyan-600" />
                ) : (
                  <Eye size={20} className="text-cyan-500" />
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex justify-center pt-4"
      >
        <FormSubmitButton className={LOGIN_PRIMARY_SUBMIT_CLASS}>{copy.signIn}</FormSubmitButton>
      </motion.div>
    </>
  );
}
