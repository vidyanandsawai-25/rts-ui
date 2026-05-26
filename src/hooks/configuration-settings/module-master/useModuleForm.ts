'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  createModuleMasterAction,
  updateModuleMasterAction,
  getModuleMastersSummaryAction,
} from '@/app/[locale]/configuration-settings/module-master/actions';
import type { ModuleMaster } from '@/types/moduleMaster.types';
import {
  validateModuleMaster,
  normalizeModuleData,
  getValidationCount,
  checkModuleDuplicates,
} from '@/lib/api/configuration-settings/module-master/module-master.validator';
import { useModuleFormState } from './useModuleFormState';
import { useModuleFormHandlers } from './useModuleFormHandlers';

const REDIRECT_DELAY_MS = 400;
const MODULE_MASTER_LIST_PATH = '/configuration-settings/module-master';

interface UseModuleFormProps {
  id: number | null;
  initialData?: ModuleMaster;
  initialExistingModules?: ModuleMaster[];
}

export function useModuleForm({ id, initialData, initialExistingModules }: UseModuleFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [, startTransition] = useTransition();

  const t = useTranslations('moduleMaster');
  const tCommon = useTranslations('common');

  const moduleId = id || null;
  const isEdit = Boolean(moduleId);

  const [existingModules, setExistingModules] = useState<ModuleMaster[]>(
    initialExistingModules || []
  );

  useEffect(() => {
    if (initialExistingModules !== undefined) {
      return;
    }

    getModuleMastersSummaryAction()
      .then((res) => {
        if (res.success && res.data) {
          setExistingModules(res.data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch existing modules:', error);
      });
  }, [initialExistingModules]);

  const { formData, setFormData, errors, setErrors, isSubmitting, setIsSubmitting, open, setOpen } =
    useModuleFormState(initialData);

  const { handleChange, handleSelectChange, handleBlur, handleToggleStatus } =
    useModuleFormHandlers({
      formData,
      setFormData,
      setErrors,
      existingModules,
      isEdit,
      moduleId,
    });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  const listRoute = useMemo(() => `/${locale}${MODULE_MASTER_LIST_PATH}`, [locale]);

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
      if (isSubmitting || isSubmittingRef.current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      const normalizedData = normalizeModuleData(formData);
      const validationErrors = validateModuleMaster(normalizedData);

      // Perform duplicate checks using shared helper
      const { codeExists, nameExists } = checkModuleDuplicates({
        moduleCode: normalizedData.moduleCode,
        moduleName: normalizedData.moduleName,
        existingModules,
        isEdit,
        moduleId,
      });

      if (codeExists) {
        validationErrors.moduleCode = 'moduleCodeExists';
      }
      if (nameExists) {
        validationErrors.moduleName = 'moduleNameExists';
      }

      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        toast.error(t('messages.validationError'));
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const response = moduleId
          ? await updateModuleMasterAction(moduleId, normalizedData)
          : await createModuleMasterAction(normalizedData);

        if (!isMountedRef.current) {
          return;
        }

        if (!response.success) {
          const errorKey = response.error || 'messages.errorOccurred';
          const isTranslationKey =
            errorKey.includes('.') &&
            !errorKey.trim().startsWith('{') &&
            !errorKey.includes(' ') &&
            !errorKey.includes('"');
          const errorMessage = isTranslationKey
            ? t(errorKey, {
                count: response.error ? getValidationCount(response.error) : 0,
              })
            : errorKey;

          toast.error(errorMessage);

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
    [
      moduleId,
      closeAndRoute,
      formData,
      isEdit,
      isSubmitting,
      router,
      setErrors,
      setIsSubmitting,
      t,
      existingModules,
    ]
  );

  return {
    formData,
    errors,
    isSubmitting,
    open,
    setOpen,
    handleChange,
    handleSelectChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    t,
    tCommon,
    isEdit,
  };
}
