'use client';

import React, { useId, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/common';
import { Label } from '@/components/common/label';

import type { UseLoginFormReturn } from '@/hooks/useLoginForm';
import type { LoginFormCopy } from '@/types/login.types';

import {
  AUTH_CONSTRAINTS,
  LOGIN_PRIMARY_SUBMIT_CLASS,
  LOGIN_FIELD_INPUT_CLASS,
  LOGIN_PASSWORD_INPUT_CLASS,
  LOGIN_FIELD_ICON_CLASS,
  LOGIN_USERNAME_ICON_ACCENT,
  LOGIN_PASSWORD_ICON_ACCENT,
} from './constants';

// Re-export for consumers that import from this file
export { LOGIN_PRIMARY_SUBMIT_CLASS };
export { useLoginErrorMessages } from '@/hooks/useLoginErrorMessages';

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
 * Full-form loading overlay while the server action is in flight (useFormStatus).
 * Must be rendered inside a <form>.
 */
export function FormLoadingOverlay() {
  const { pending } = useFormStatus();
  const t = useTranslations('common.login');

  if (!pending) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t('pageLoading.message')}</span>
      <Loader2 className="h-8 w-8 shrink-0 animate-spin text-cyan-600" aria-hidden />
    </div>
  );
}

/**
 * Login credential input fields — uses {@link useLoginForm} for state and validation.
 */
export function LoginCredentialFields({
  loginForm,
  locale,
  copy,
}: {
  loginForm: UseLoginFormReturn;
  locale: string;
  copy: LoginFormCopy;
}) {
  const { formData, errors, handleChange, handleBlur, showError } = loginForm;
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
              className={`${LOGIN_FIELD_ICON_CLASS} ${LOGIN_USERNAME_ICON_ACCENT} transition-all duration-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] group-focus-within:text-cyan-500`}
            />
            <Input
              id={usernameId}
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={copy.usernamePlaceholder}
              maxLength={AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH}
              className={LOGIN_FIELD_INPUT_CLASS}
              error={showError('username') ? errors.username : undefined}
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
              className={`${LOGIN_FIELD_ICON_CLASS} ${LOGIN_PASSWORD_ICON_ACCENT} transition-all duration-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)] group-focus-within:text-amber-500`}
            />
            <Input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={copy.passwordPlaceholder}
              maxLength={AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH}
              className={LOGIN_PASSWORD_INPUT_CLASS}
              error={showError('password') ? errors.password : undefined}
              fullWidth
              autoComplete="current-password"
            />
            {formData.password.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                className="absolute right-1 top-[22px] z-10 -translate-y-1/2 p-1 text-gray-400 hover:text-cyan-600"
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
