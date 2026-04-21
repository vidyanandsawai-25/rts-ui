'use client';

import { useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ValidationMessage } from '@/components/common';

import { loginCredentialsFormAction } from '@/app/[locale]/login/actions';
import type { LoginFormProps } from '@/types/login.types';

import { useLoginFormHelpers, LoginCredentialFields } from './LoginFormParts';

/** Client island: progressive enhancement for login action state, field interactivity, and motion. */
export function LoginFormClient({
  username,
  locale,
  errorMessage = '',
  infoMessage = '',
  copy,
}: LoginFormProps) {
  const { getLocalizedError } = useLoginFormHelpers();

  const [credState, credAction] = useActionState(loginCredentialsFormAction, null);

  const credentialFieldsKey = credState?.resetKey ?? 'idle';
  const initialUsernameForFields = credState?.message ? '' : (username ?? '');

  const displayError = getLocalizedError(credState?.message) || errorMessage;

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
          copy={copy}
        />
      </motion.form>
    </>
  );
}
