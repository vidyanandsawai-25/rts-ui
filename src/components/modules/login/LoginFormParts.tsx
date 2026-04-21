'use client';

import React, { useCallback, useState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Input, Button } from '@/components/common';
import { Label } from '@/components/common/label';

import type { LoginFormCopy } from '@/types/login.types';

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

export function useLoginFormHelpers() {
  const t = useLoginT();
  const commonT = useTranslations('common');

  const getLocalizedError = useCallback(
    (errorCode: string | undefined): string => {
      if (!errorCode) return '';
      const errorKeyMap: Record<string, string> = {
        USERNAME_REQUIRED: 'errors.USERNAME_REQUIRED',
        CREDENTIALS_REQUIRED: 'errors.credentialsRequired',
        INVALID_OTP_FORMAT: 'errors.enterValidToken',
        INVALID_CREDENTIALS: 'errors.invalidCredentials',
        SESSION_EXPIRED: 'errors.sessionExpired',
        USER_NOT_FOUND: 'errors.Auth_UserNotFound',
        ACCOUNT_LOCKED: 'errors.Auth_AccountLocked_Temporary',
        PASSWORDS_MISMATCH: 'errors.passwordsMismatch',
        SERVICE_UNAVAILABLE: 'errors.serviceUnavailable',
        RESET_FAILED: 'errors.RESET_FAILED',
        LOGIN_FAILED: 'errors.LOGIN_FAILED',
        RESEND_FAILED: 'errors.RESEND_FAILED',
        VERIFICATION_FAILED: 'errors.VERIFICATION_FAILED',
      };
      const translationKey = errorKeyMap[errorCode];
      if (translationKey) {
        return t(translationKey);
      }
      const dynamicKey = `login.errors.${errorCode}`;
      try {
        return commonT(dynamicKey);
      } catch {
        try {
          return commonT('errors.generic');
        } catch {
          return errorCode;
        }
      }
    },
    [t, commonT]
  );

  return { getLocalizedError };
}

export const LOGIN_PRIMARY_SUBMIT_CLASS =
  'w-full max-w-[280px] bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 text-lg rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300';

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

  return (
    <>
      <Input type="hidden" name="locale" value={locale} />
      <div className="space-y-5">
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
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder={copy.usernamePlaceholder}
              className="rounded-xl border-gray-200 bg-gray-50/50 py-2.5 pl-10 transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              fullWidth
              autoComplete="username"
            />
          </div>
        </div>
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.passwordPlaceholder}
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
