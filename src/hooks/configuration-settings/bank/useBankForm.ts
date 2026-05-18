'use client';

import { useCallback, useEffect, useMemo, useRef, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  createBankAction,
  updateBankAction,
} from '@/app/[locale]/configuration-settings/bank-master/actions';
import type { BankMasterData } from '@/types/bank-master.types';
import {
  validateBankMaster,
  normalizeBankData,
  getValidationCount,
} from '@/lib/api/configuration-settings/bank/bank-master.validator';
import { useBankFormState } from './useBankFormState';
import { useBankFormHandlers } from './useBankFormHandlers';

const REDIRECT_DELAY_MS = 400;
const BANK_MASTER_LIST_PATH = '/configuration-settings/bank-master';

interface UseBankFormProps {
  id: string | null;
  initialData?: BankMasterData;
}

export function useBankForm({ id, initialData }: UseBankFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [, startTransition] = useTransition();

  const t = useTranslations('bankMaster');
  const tCommon = useTranslations('common');

  const bankId = id?.trim() || null;
  const isEdit = Boolean(bankId);

  const { formData, setFormData, errors, setErrors, isSubmitting, setIsSubmitting, open, setOpen } =
    useBankFormState(initialData);

  const { handleChange, handleBlur, handleToggleStatus } = useBankFormHandlers({
    formData,
    setFormData,
    setErrors,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  const listRoute = useMemo(() => `/${locale}${BANK_MASTER_LIST_PATH}`, [locale]);

  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    clearNavigationTimeout();

    timeoutRef.current = setTimeout(() => {
      router.push(listRoute);
      timeoutRef.current = null;
    }, REDIRECT_DELAY_MS);
  }, [clearNavigationTimeout, listRoute, router, setOpen]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearNavigationTimeout();
    };
  }, [clearNavigationTimeout]);

  const handleCancel = useCallback(() => {
    closeAndRoute();
  }, [closeAndRoute]);

  const handleSubmit = useCallback(
    async (e: FormEvent): Promise<void> => {
      e.preventDefault();

      if (isSubmitting || isSubmittingRef.current) {
        return;
      }

      const normalizedData = normalizeBankData(formData);
      const validationErrors = validateBankMaster(normalizedData);

      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        toast.error(t('messages.validationError'));
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const response = bankId
          ? await updateBankAction(bankId, normalizedData)
          : await createBankAction(normalizedData);

        if (!isMountedRef.current) {
          return;
        }

        if (!response.success) {
          const errorKey = response.error || 'messages.errorOccurred';

          toast.error(
            t(errorKey, {
              count: response.error ? getValidationCount(response.error) : 0,
            })
          );

          return;
        }

        toast.success(t(isEdit ? 'messages.updateSuccess' : 'messages.createSuccess'));

        startTransition(() => {
          router.refresh();
          closeAndRoute();
        });
      } catch {
        if (isMountedRef.current) {
          toast.error(t('messages.errorOccurred'));
        }
      } finally {
        isSubmittingRef.current = false;

        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [bankId, closeAndRoute, formData, isEdit, isSubmitting, router, setErrors, setIsSubmitting, t]
  );

  return {
    formData,
    errors,
    isSubmitting,
    open,
    setOpen,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    t,
    tCommon,
    isEdit,
  };
}
