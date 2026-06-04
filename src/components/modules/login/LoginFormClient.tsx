'use client';

import {
  useActionState,
  useEffect,
  useState,
  type FormEvent,
  type ComponentProps,
} from 'react';
import { clearLegacyAuthClientStorage } from '@/lib/utils/legacy-auth-storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ValidationMessage, Button } from '@/components/common';

import { loginCredentialsFormAction } from '@/app/[locale]/login/actions';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useLoginErrorMessages } from '@/hooks/useLoginErrorMessages';
import {
  AUTH_ERROR_CODES,
  RATE_LIMIT_COUNTDOWN_INITIAL_SECONDS,
} from '@/components/modules/login/constants';
import type { LoginFormProps } from '@/types/login.types';

import { FormLoadingOverlay, LoginCredentialFields } from './LoginFormParts';

function LoginRateLimitHint() {
  const t = useTranslations('common.login');
  const [seconds, setSeconds] = useState(RATE_LIMIT_COUNTDOWN_INITIAL_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="mt-1 text-center text-xs font-medium text-amber-800" aria-live="polite">
      {t('errors.retryInSeconds', { seconds })}
    </p>
  );
}

/**
 * Renders the credentials form; remount when {@link loginCredentialsFormAction} returns
 * a new `resetKey` so the hook state clears (including the password) after a failed sign-in.
 */
type LoginFormElementProps = ComponentProps<'form'>;

function LoginFormCredentialsBody({
  initialUsername,
  locale,
  copy,
  formAction,
}: {
  initialUsername: string;
  locale: string;
  copy: LoginFormProps['copy'];
  formAction: NonNullable<LoginFormElementProps['action']>;
}) {
  const login = useLoginForm({ initialUsername });

  return (
    <motion.form
      id="login-credentials-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      action={formAction}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        if (!login.validateForm()) e.preventDefault();
      }}
      className="relative space-y-4"
    >
      <FormLoadingOverlay />
      <LoginCredentialFields loginForm={login} locale={locale} copy={copy} />
    </motion.form>
  );
}

/** Client island: progressive enhancement for login action state, field interactivity, and motion. */
export function LoginFormClient({
  username,
  locale,
  errorMessage = '',
  infoMessage = '',
  copy,
}: LoginFormProps) {
  const { getLocalizedError } = useLoginErrorMessages();
  const t = useTranslations('common.login');

  const [credState, credAction] = useActionState(loginCredentialsFormAction, null);

  useEffect(() => {
    clearLegacyAuthClientStorage();
  }, []);

  const credentialFieldsKey = credState?.resetKey ?? 'idle';
  const initialUsernameForFields = credState?.message ? '' : (username ?? '');

  const displayError = getLocalizedError(credState?.message) || errorMessage;
  const lastErrorCode = credState?.message;
  const showRateLimit = lastErrorCode === AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS;
  const showTimeoutRetry = lastErrorCode === AUTH_ERROR_CODES.REQUEST_TIMEOUT;

  return (
    <>
      <AnimatePresence mode="wait">
        {infoMessage ? (
          <motion.div
            key="login-info"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
            aria-live="polite"
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
            role="status"
            aria-live="polite"
          >
            <ValidationMessage
              type="error"
              message={displayError}
              visible
              className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium [&_svg]:shrink-0"
            />
            {showRateLimit && credState?.resetKey ? (
              <LoginRateLimitHint key={credState.resetKey} />
            ) : null}
            {showTimeoutRetry ? (
              <div className="mt-3 flex justify-center">
                <Button
                  type="submit"
                  form="login-credentials-form"
                  variant="secondary"
                  size="sm"
                  className="font-medium"
                >
                  {t('pageError.tryAgain')}
                </Button>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LoginFormCredentialsBody
        key={credentialFieldsKey}
        initialUsername={initialUsernameForFields}
        formAction={credAction}
        locale={locale}
        copy={copy}
      />
    </>
  );
}
