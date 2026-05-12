'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useLoading } from '@/hooks/useLoading';

interface ActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  validationErrors?: Record<string, string>;
}

interface UseBaseFormProps<T> {
  initialData?: Partial<T>;
  validationSchema: Record<
    string,
    (
      val: unknown,
      data: Partial<T>,
      t: (key: string) => string,
      tCommon: (key: string) => string
    ) => string | undefined
  >;
  saveAction: (data: Partial<T>) => Promise<ActionResponse<unknown>>;
  successMessageKey: string;
  redirectPath: string;
  translationNamespace?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UI_TRANSITION_DURATION = 300;

export function useBaseForm<T extends { isActive?: boolean }>({
  initialData,
  validationSchema,
  saveAction,
  successMessageKey,
  redirectPath,
  translationNamespace = 'screenAccess',
  onSuccess,
  onCancel,
}: UseBaseFormProps<T>) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations(translationNamespace);
  const tCommon = useTranslations('common');

  const { isLoading: isSubmitting, startLoading, stopLoading } = useLoading();
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>({
    ...initialData,
    isActive: (initialData?.isActive ?? true) as T['isActive'],
  } as Partial<T>);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(true);

  const validate = useCallback(
    (data: Partial<T>) => {
      const vErrors: Record<string, string> = {};
      Object.keys(validationSchema).forEach((key) => {
        const validator = validationSchema[key];
        const error = validator(data[key as keyof T], data, t, tCommon);
        if (error) vErrors[key] = error;
      });
      return vErrors;
    },
    [validationSchema, t, tCommon]
  );

  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      const fieldName = field as string;
      const shouldValidate = touched[fieldName];

      setFormData((prev) => {
        const nextData = { ...prev, [field]: value };
        if (shouldValidate) {
          const fieldErrors = validate(nextData);
          setErrors((prevErrors) => {
            const nextErrors = { ...prevErrors };
            const error = fieldErrors[fieldName];
            if (error) {
              nextErrors[fieldName] = error;
            } else {
              delete nextErrors[fieldName];
            }
            return nextErrors;
          });
        }

        return nextData;
      });
    },
    [touched, validate]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      const fieldName = field as string;
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      setFormData((prev) => {
        const fieldErrors = validate(prev);
        setErrors((prevErrors) => {
          const nextErrors = { ...prevErrors };
          const error = fieldErrors[fieldName];
          if (error) {
            nextErrors[fieldName] = error;
          } else {
            delete nextErrors[fieldName];
          }
          return nextErrors;
        });
        return prev;
      });
    },
    [validate]
  );

  const showError = useCallback(
    (field: keyof T): boolean =>
      (submittedOnce || touched[field as string]) && !!errors[field as string],
    [submittedOnce, touched, errors]
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
    setOpen(false);
    setTimeout(() => router.push(`/${locale}${redirectPath}`), UI_TRANSITION_DURATION);
  }, [onCancel, router, locale, redirectPath]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setSubmittedOnce(true);
    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(tCommon('errors.fixValidation'));
      return;
    }

    startLoading();
    try {
      const response = await saveAction(formData);
      if (response.success) {
        const name =
          (formData as Record<string, unknown>).screenName ||
          (formData as Record<string, unknown>).screenGroupName ||
          '';
        toast.success(t(successMessageKey, { name: String(name) }));
        onSuccess?.();
        router.refresh();
        handleCancel();
      } else {
        const errorMsg = response.message ? t(response.message) : tCommon('errors.saveFailed');
        toast.error(errorMsg);
        if (response.validationErrors) setErrors(response.validationErrors);
      }
    } catch {
      toast.error(tCommon('errors.generic'));
    } finally {
      stopLoading();
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel,
    showError,
    t,
    tCommon,
  };
}
