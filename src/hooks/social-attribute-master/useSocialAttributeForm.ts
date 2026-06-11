'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import {
  createSocialAttributeAction,
  updateSocialAttributeAction,
} from '@/app/[locale]/property-tax/social-attribute-master/action';
import { SocialAttributeFormModel, SocialAttribute } from '@/types/social-attribute.types';
import { CODE_SANITIZE, validateForm, commonValidations } from '@/lib/utils/validation';
import {
  SOCIAL_ATTRIBUTE_CODE_MAX,
  SOCIAL_ATTRIBUTE_NAME_MAX,
  UNIT_MAX,
} from '@/components/modules/property-tax/social-attribute-master/constants';

interface UseSocialAttributeFormProps {
  id: number | null;
  initialData?: SocialAttribute;
  onSuccess: () => void;
  onCancel: () => void;
}

export function useSocialAttributeForm({
  id,
  initialData,
  onSuccess,
  onCancel,
}: UseSocialAttributeFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('socialAttribute');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<SocialAttributeFormModel>({
    id: id ?? initialData?.id,
    socialAttributeCode: initialData?.socialAttributeCode ?? '',
    socialAttributeName: initialData?.socialAttributeName ?? '',
    dataType: initialData?.dataType ?? '',
    unit: initialData?.unit ?? '',
    displayOrder: initialData?.displayOrder ?? null,
    parentAttributeId: initialData?.parentAttributeId ?? null,
    isRequiredWhenParentTrue: initialData?.isRequiredWhenParentTrue ?? false,
    isDiscountApplicable: initialData?.isDiscountApplicable ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [isChild, setIsChild] = useState(initialData?.parentAttributeId != null);
  const [errors, setErrors] = useState<Partial<Record<keyof SocialAttributeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleToggleIsChild = useCallback((): void => {
    setIsChild((prev) => {
      const newValue = !prev;
      setFormData((p) => ({
        ...p,
        parentAttributeId: newValue ? p.parentAttributeId : null,
        isRequiredWhenParentTrue: newValue ? p.isRequiredWhenParentTrue : false,
      }));
      return newValue;
    });
  }, []);

  const validate = useCallback(
    (data: SocialAttributeFormModel): Partial<Record<keyof SocialAttributeFormModel, string>> => {
      const schema: Record<string, (val: unknown) => string | undefined> = {
        socialAttributeCode: commonValidations.masterCode(t, SOCIAL_ATTRIBUTE_CODE_MAX, {
          required: 'form.validation.codeRequired',
          format: 'form.validation.codeFormat',
          maxLength: 'form.validation.codeMaxLength',
        }),
        socialAttributeName: commonValidations.masterDescription(t, SOCIAL_ATTRIBUTE_NAME_MAX, {
          required: 'form.validation.nameRequired',
          format: 'form.validation.nameFormat',
          maxLength: 'form.validation.nameMaxLength',
        }),
        dataType: (val: unknown) => {
          const strVal = String(val ?? '').trim();
          if (!strVal) return t('form.validation.dataTypeRequired');
          return undefined;
        },
        unit: (val: unknown) => {
          const strVal = String(val ?? '').trim();
          if (strVal && !/^[\p{L}\p{M}\p{N}]+$/u.test(strVal)) {
            return t('form.validation.unitFormat');
          }
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof SocialAttributeFormModel): boolean =>
      (submittedOnce || touched[field as string]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;

      let sanitizedValue = value;
      if (name === 'socialAttributeName') {
        sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s\-]/gu, '');
        if (sanitizedValue.length > SOCIAL_ATTRIBUTE_NAME_MAX) {
          sanitizedValue = sanitizedValue.substring(0, SOCIAL_ATTRIBUTE_NAME_MAX);
        }
      } else if (name === 'socialAttributeCode') {
        sanitizedValue = value.replace(CODE_SANITIZE, '').toUpperCase();
        if (sanitizedValue.length > SOCIAL_ATTRIBUTE_CODE_MAX) {
          sanitizedValue = sanitizedValue.substring(0, SOCIAL_ATTRIBUTE_CODE_MAX);
        }
      } else if (name === 'unit') {
        sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}]/gu, '');
        if (sanitizedValue.length > UNIT_MAX) {
          sanitizedValue = sanitizedValue.substring(0, UNIT_MAX);
        }
      }

      if (name === 'parentAttributeId') {
        setFormData((p) => ({
          ...p,
          parentAttributeId: value === '' ? null : Number(value),
          isRequiredWhenParentTrue: value === '' ? false : p.isRequiredWhenParentTrue,
        }));
        return;
      }

      setFormData((p) => ({
        ...p,
        [name]: sanitizedValue,
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;
      setTouched((p) => ({ ...p, [name]: true }));

      const updatedFormData = {
        ...formData,
        [name]: name === 'parentAttributeId' ? (value === '' ? null : Number(value)) : value,
      };

      setFormData(updatedFormData);

      const fieldErrors = validate(updatedFormData);
      setErrors((p) => {
        const newErrors = { ...p };
        const fieldName = name as keyof SocialAttributeFormModel;

        if (fieldErrors[fieldName]) {
          newErrors[fieldName] = fieldErrors[fieldName];
        } else {
          delete newErrors[fieldName];
        }

        return newErrors;
      });
    },
    [formData, validate]
  );

  const mapApiError = useCallback(
    (result: { statusCode?: number; message?: string }) => {
      const errorMap: Record<number, string> = {
        409: t('apiErrors.duplicateRecord'),
        404: t('apiErrors.notFound'),
        401: tCommon('errors.unauthorized'),
        403: tCommon('errors.unauthorized'),
      };

      const code = result.statusCode ?? 0;
      if (errorMap[code]) return errorMap[code];

      if (code === 400) {
        const msg = result.message?.toLowerCase() || '';
        if (msg.includes('duplicate') || msg.includes('already exists')) {
          return t('apiErrors.duplicateRecord');
        }
        return result.message || t('apiErrors.invalidData');
      }

      if (code >= 500) return tCommon('errors.serverError');
      return result.message || t('apiErrors.operationFailed');
    },
    [t, tCommon]
  );

  const [open, setOpen] = useState(true);
  const [, startTransition] = React.useTransition();

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/social-attribute-master`);
      });
    }, 400);
  }, [router, locale]);

  const handleCancel = useCallback(() => {
    onCancel();
    closeAndRoute();
  }, [onCancel, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateSocialAttributeAction(formData)
        : await createSocialAttributeAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(
        isEdit
          ? t('success.updated', { code: formData.socialAttributeCode })
          : t('success.created', { code: formData.socialAttributeCode })
      );

      onSuccess();
      startTransition(() => {
        router.refresh();
        closeAndRoute();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((): void => {
    setIsActive((prev) => {
      const newValue = !prev;
      setFormData((p) => ({ ...p, isActive: newValue }));
      return newValue;
    });
  }, []);

  const handleToggleIsRequiredWhenParentTrue = useCallback((): void => {
    setFormData((p) => ({
      ...p,
      isRequiredWhenParentTrue: !p.isRequiredWhenParentTrue,
    }));
  }, []);

  const handleToggleIsDiscountApplicable = useCallback((): void => {
    setFormData((p) => ({
      ...p,
      isDiscountApplicable: !p.isDiscountApplicable,
    }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    isActive,
    isChild,
    open,
    setOpen,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleToggleIsChild,
    handleToggleIsRequiredWhenParentTrue,
    handleToggleIsDiscountApplicable,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  };
}
