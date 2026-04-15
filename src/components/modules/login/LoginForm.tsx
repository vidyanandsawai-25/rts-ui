'use client';

import React, { useState, useActionState, useCallback, useId } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Eye, EyeOff, User, Lock, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  ValidationMessage,
} from '@/components/common';
import { Label } from '@/components/common/label';
import { useTranslations } from 'next-intl';

import { loginCredentialsFormAction } from '@/app/[locale]/login/actions';
import type { LoginFormProps } from '@/types/login.types';
import type { UlbMaster } from '@/types/master.types';

const LOGIN_PRIMARY_SUBMIT_CLASS =
  'w-full max-w-[280px] bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 text-lg rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300';

/** Same idea as `HeaderCouncilLogo`: `next/image`, error → Landmark fallback (login card has no letter fallback). */
function LoginFormCouncilLogo({ logoSrc, title }: { logoSrc: string; title: string }) {
  const [logoHasError, setLogoHasError] = useState(false);
  if (logoHasError) {
    return (
      <div
        className="flex h-full w-full items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50/80 text-cyan-600"
        aria-hidden
      >
        <Landmark className="h-14 w-14 opacity-90" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <Image
      src={logoSrc}
      alt={title ? `${title} Logo` : 'Logo'}
      width={96}
      height={112}
      className="h-full w-full object-contain drop-shadow-md"
      onError={() => setLogoHasError(true)}
      unoptimized
    />
  );
}

function useLoginT() {
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

type LoginT = ReturnType<typeof useLoginT>;

function LoginCredentialFields({
  initialUsername,
  locale,
  t,
}: {
  initialUsername: string;
  locale: string;
  t: LoginT;
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
            {t('username')}
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
              placeholder={t('usernamePlaceholder')}
              className="rounded-xl border-gray-200 bg-gray-50/50 py-2.5 pl-10 transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              fullWidth
              autoComplete="username"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={passwordId} className="ml-1 text-sm font-semibold text-gray-700">
            {t('password')}
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
              placeholder={t('passwordPlaceholder')}
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
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
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
        <FormSubmitButton className={LOGIN_PRIMARY_SUBMIT_CLASS}>{t('signIn')}</FormSubmitButton>
      </motion.div>
    </>
  );
}

export const LoginForm = ({
  username,
  locale,
  errorMessage = '',
  infoMessage = '',
  ulbData,
}: LoginFormProps) => {
  const t = useLoginT();
  const commonT = useTranslations('common');

  const ulb = ulbData as (UlbMaster & { logoUrl?: string }) | undefined;
  const logoSrc = (ulb?.logoUrl || ulb?.ulbLogo || '').trim();
  const title = (ulbData?.ulbName ?? '').trim();
  const subTitle = (ulbData?.ulbNameLocal ?? '').trim();

  const [credState, credAction] = useActionState(loginCredentialsFormAction, null);

  const credentialFieldsKey = credState?.resetKey ?? 'idle';
  const initialUsernameForFields = credState?.message ? '' : (username ?? '');

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

  const displayError = getLocalizedError(credState?.message) || errorMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
        <CardHeader className="flex flex-col items-center space-y-1 pb-2 pt-8 text-center">
          <motion.div whileHover={{ scale: 1.05 }} className="relative mb-6 drop-shadow-lg">
            <div className="relative flex h-28 w-24 items-center justify-center">
              {logoSrc ? (
                <LoginFormCouncilLogo key={logoSrc} logoSrc={logoSrc} title={title} />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-xl border border-cyan-200/60 bg-cyan-50/80 text-cyan-600"
                  aria-hidden
                >
                  <Landmark className="h-14 w-14 opacity-90" strokeWidth={1.25} />
                </div>
              )}
            </div>
          </motion.div>

          {title ? (
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          ) : null}
          {subTitle ? (
            <h2 className="text-lg font-medium text-gray-600">{subTitle}</h2>
          ) : null}

          <div className="flex w-full items-center justify-center gap-2 py-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          <div className="pt-1 text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
            {t('title')}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10 pt-4">
          <AnimatePresence mode="wait">
            {infoMessage ? (
              <motion.div
                key="login-info"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ValidationMessage
                  type="info"
                  message={infoMessage}
                  visible
                  className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium !border-emerald-200 !bg-emerald-50 !text-emerald-800"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {displayError ? (
              <motion.div
                key="login-error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <ValidationMessage
                  type="error"
                  message={displayError}
                  visible
                  className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium [&_svg]:shrink-0"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            action={credAction}
            className="space-y-4"
          >
            <LoginCredentialFields
              key={credentialFieldsKey}
              initialUsername={initialUsernameForFields}
              locale={locale}
              t={t}
            />
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
