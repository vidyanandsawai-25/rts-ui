'use client';

import { useActionState, useState, type FormEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { AnimatedDigitInput, Button, ValidationMessage } from '@/components/common';

import {
  verifyTwoFactorFormAction,
  cancelTwoFactorChallengeAction,
} from '@/app/[locale]/login/actions';
import { useLoginErrorMessages } from '@/hooks/useLoginErrorMessages';
import { LOGIN_PRIMARY_SUBMIT_CLASS } from '@/components/modules/login/constants';

const TOTP_LENGTH = 6;
const RECOVERY_CODE_LENGTH = 11; // "ABCDE-FGHJK"
const TOTP_PATTERN = /^[0-9]$/;
const RECOVERY_CODE_PATTERN = /^[A-Za-z0-9-]$/;

function VerifySubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={LOGIN_PRIMARY_SUBMIT_CLASS}>
      {pending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden /> : children}
    </Button>
  );
}

export function VerifyTwoFactorFormClient({
  locale,
  method = 'totp',
}: {
  locale: string;
  method?: 'totp' | 'otp';
}) {
  const t = useTranslations('login');
  const { getLocalizedError } = useLoginErrorMessages();
  const [state, formAction] = useActionState(verifyTwoFactorFormAction, null);
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const isOtp = method === 'otp';

  const displayError = getLocalizedError(state?.message);
  const maxLength = useRecoveryCode ? RECOVERY_CODE_LENGTH : TOTP_LENGTH;

  return (
    <form
      key={state?.resetKey ?? 'idle'}
      action={formAction}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        if (code.trim().length === 0) {
          e.preventDefault();
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="useRecoveryCode" value={useRecoveryCode ? 'true' : 'false'} />

      <AnimatePresence mode="wait">
        {displayError ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            role="status"
            aria-live="polite"
          >
            <ValidationMessage
              type="error"
              message={displayError}
              visible
              className="!mt-0 w-full justify-center rounded-lg px-3 py-3 text-center text-sm font-medium"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="text-center text-sm text-gray-600">
        {isOtp ? t('enterOtp') : useRecoveryCode ? t('enterRecoveryCode') : t('enterAuthenticatorCode')}
      </p>

      <AnimatedDigitInput
        key={useRecoveryCode ? 'recovery' : 'totp'}
        name="code"
        value={code}
        onChange={setCode}
        maxLength={maxLength}
        allowedPattern={useRecoveryCode ? RECOVERY_CODE_PATTERN : TOTP_PATTERN}
        placeholder={useRecoveryCode ? 'ABCDE-FGHJK' : '••••••'}
        inputMode={useRecoveryCode ? 'text' : 'numeric'}
        autoFocus
        className="h-14 text-center text-lg"
        charClassName="text-xl"
      />

      <div className="flex justify-center pt-2">
        <VerifySubmitButton>{t('verifyToken')}</VerifySubmitButton>
      </div>

      <div className="flex flex-col items-center gap-2 pt-1 text-sm">
        {!isOtp ? (
          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode((v) => !v);
              setCode('');
            }}
            className="font-medium text-cyan-700 hover:text-cyan-900 hover:underline"
          >
            {useRecoveryCode ? t('useAuthenticatorInstead') : t('useRecoveryCodeInstead')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => cancelTwoFactorChallengeAction(locale)}
          className="text-gray-500 hover:text-gray-700 hover:underline"
        >
          {t('backToLogin')}
        </button>
      </div>
    </form>
  );
}
