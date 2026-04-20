'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, Layers } from 'lucide-react';
import { toast } from 'sonner';

import { Drawer } from '@/components/common/Drawer';
import {
  Input,
  CancelButton,
  SaveButton,
  ValidationMessage,
} from '@/components/common';

import {
  createSubFloorAction,
  updateSubFloorAction,
} from '@/app/[locale]/property-tax/floormaster/actions';

import { SubFloorFormModel, SubFloor } from '@/types/floor.types';
import { SubFloorFormFields } from './SubFloorFormFields';
import { StatusToggleField } from '../StatusToggleField';
import { cn } from '@/lib/utils/cn';

import type React from 'react';
import {
  CODE_REGEX,
  CODE_SANITIZE,
  DESCRIPTION_REGEX,
  DESCRIPTION_SANITIZE,
  commonValidations,
} from '@/lib/utils/validation';

/* ================= CONSTANTS ================= */
const CODE_MAX = 10;
const DESCRIPTION_MAX = 100;

/* ================= PROPS ================= */
export interface SubFloorFormProps {
  subFloorId: number | null;
  initialData?: SubFloor;
}

/* ================= MAIN ================= */
export default function SubFloorForm({ subFloorId, initialData }: Readonly<SubFloorFormProps>) {
  const router = useRouter();
  const t = useTranslations('floor.subfloor');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(subFloorId);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<SubFloorFormModel>({
    subFloorId: initialData?.subFloorId,
    subFloorCode: initialData?.subFloorCode ?? '',
    description: initialData?.description ?? '',
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SubFloorFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const locale = useLocale();

  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(`/${locale}/property-tax/floormaster/subfloor`);
  }, [router, locale]);

  /* ================= VALIDATION ================= */
  const validate = useCallback(
    (data: SubFloorFormModel) => {
      const e: Partial<Record<keyof SubFloorFormModel, string>> = {};

      const code = data.subFloorCode.trim();
      const description = data.description.trim();

      if (!code) {
        e.subFloorCode = t('form.validation.codeRequired');
      } else if (code.length > CODE_MAX) {
        e.subFloorCode = t('form.validation.codeMaxLength', { count: CODE_MAX });
      } else if (!CODE_REGEX.test(code)) {
        e.subFloorCode = t('form.validation.codeFormat');
      }

      if (!description) {
        e.description = t('form.validation.descriptionRequired');
      } else if (description.length > DESCRIPTION_MAX) {
        e.description = t('form.validation.descriptionMaxLength', { count: DESCRIPTION_MAX });
      } else if (!DESCRIPTION_REGEX.test(description)) {
        e.description = t('form.validation.descriptionFormat');
      }

      // Use commonValidations.masterActiveStatus for isActive validation
      const isActiveError = commonValidations.masterActiveStatus(t, isEdit)(data.isActive);
      if (isActiveError) {
        e.isActive = isActiveError;
      }

      return e;
    },
    [isEdit, t]
  );

  const showError = (field: keyof SubFloorFormModel) =>
    (submittedOnce || touched[field]) && !!errors[field];

  /* ================= CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'description') {
      newValue = newValue.replace(DESCRIPTION_SANITIZE, '');
      if (newValue.length > DESCRIPTION_MAX) {
        newValue = newValue.substring(0, DESCRIPTION_MAX);
      }
    }

    if (name === 'subFloorCode') {
      newValue = newValue.replace(CODE_SANITIZE, '');
      if (newValue.length > CODE_MAX) {
        newValue = newValue.substring(0, CODE_MAX);
      }
    }

    setFormData((p) => ({
      ...p,
      [name]: newValue,
    }));
  };

  /* ================= BLUR ================= */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({
      ...formData,
      [name]: value,
    });

    setErrors((p) => {
      const newErrors = { ...p };
      const key = name as keyof SubFloorFormModel;

      if (fieldErrors[key]) newErrors[key] = fieldErrors[key];
      else delete newErrors[key];

      return newErrors;
    });
  };

  /* ================= ERROR HELPER ================= */
  const getErrorMessage = (result: { statusCode?: number; message?: string }) => {
    if (result.statusCode === 409) return t('apiErrors.duplicateRecord');
    if (result.statusCode === 400) return t('apiErrors.invalidData');
    if (result.statusCode === 404) return t('apiErrors.notFound');
    if (result.statusCode === 401 || result.statusCode === 403)
      return tCommon('errors.unauthorized');
    if (result.statusCode && result.statusCode >= 500) return tCommon('errors.serverError');
    return result.message || t('apiErrors.operationFailed');
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) return;

    setIsSubmitting(true);

    try {
      const result = isEdit
        ? await updateSubFloorAction(formData)
        : await createSubFloorAction(formData);

      if (!result.success) {
        toast.error(getErrorMessage(result));
        return;
      }

      toast.success(
        isEdit
          ?t('messages.updateSuccess', { code: formData.subFloorCode })
          : t('messages.createSuccess', { code: formData.subFloorCode })
      );

      handleClose();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('apiErrors.operationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = () => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  };

  /* ================= UI ================= */
  return (
    <Drawer
      open={open}
      onClose={handleClose}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t('form.editTitle') : t('form.addTitle')}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t('form.editSubtitle') : t('form.addSubtitle')}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={tCommon('buttons.cancel')}
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? tCommon('actions.update') : tCommon('actions.save')}
            type="submit"
            form="subfloor-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="subfloor-form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleField
            isActive={formData.isActive}
            onChange={handleToggleStatus}
            error={errors.isActive}
            labels={{
              title: t('form.activeStatusTitle'),
              activeText: t('form.activeStatusOn'),
              inactiveText: t('form.activeStatusOff'),
            }}
          />
        )}
        <SubFloorFormFields
          formData={formData}
          errors={errors}
          showError={showError}
          onChange={handleChange}
          onBlur={handleBlur}
          labels={{
            code: t('form.code'),
            codePlaceholder: t('form.codePlaceholder'),
            description: t('form.description'),
            descriptionPlaceholder: t('form.descriptionPlaceholder'),
          }}
        />
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {' '}
          <AlertCircle size={16} /> <span> {t('note.mandatory')} </span>{' '}
        </div>{' '}
      </form>
   
    </Drawer>
  );
}
