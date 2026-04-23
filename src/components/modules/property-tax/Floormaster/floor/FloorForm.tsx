'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '@/components/common/Drawer';
import {
  CancelButton,
  SaveButton,
} from '@/components/common';

import {
  createFloorAction,
  updateFloorAction,
} from '@/app/[locale]/property-tax/floormaster/actions';

import { FloorFormModel, Floor } from '@/types/floor.types';
import { FloorFormFields } from './FloorFormFields';
import type React from 'react';
import { getApiErrorMessage } from '../form-errors';
import { StatusToggleField } from '../StatusToggleField';
import { MandatoryFieldsNotice } from '../MandatoryFieldsNotice';
import {
  validateFloorForm,
  sanitizeFloorCode,
  sanitizeDescription,
} from './validation';

/* ================= PROPS ================= */
export interface FloorFormProps {
  id: number | null;
  initialData?: Floor;
}

/* ================= MAIN ================= */
export default function FloorForm({ id, initialData }: Readonly<FloorFormProps>) {
  const router = useRouter();
  const t = useTranslations('floor.floor');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(id);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<FloorFormModel>({
    id: initialData?.id,
    floorCode: initialData?.floorCode ?? '',
    description: initialData?.description ?? '',
    sequenceNo: initialData?.sequenceNo ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FloorFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const locale = useLocale();
  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(`/${locale}/property-tax/floormaster/floor`);
  }, [router, locale, setOpen]);

  /* ================= VALIDATION ================= */
  const validate = useCallback(
    (data: FloorFormModel): Partial<Record<keyof FloorFormModel, string>> => {
      return validateFloorForm(data, t, isEdit);
    },
    [isEdit, t]
  );

  const showError = (field: keyof FloorFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field];

  /* ================= CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'description') {
      newValue = sanitizeDescription(newValue);
    }

    if (name === 'floorCode') {
      newValue = sanitizeFloorCode(newValue);
    }

    setFormData((p) => ({
      ...p,
      [name]: name === 'sequenceNo' ? Number(newValue) : newValue,
    }));
  };

  /* ================= BLUR ================= */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({
      ...formData,
      [name]: name === 'sequenceNo' ? Number(value) : value,
    });

    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof FloorFormModel;

      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }

      return newErrors;
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit ? await updateFloorAction(formData) : await createFloorAction(formData);

      if (!result.success) {
        toast.error(getApiErrorMessage(result, { t, tCommon }));
        return;
      }

      const successMessage = isEdit
        ? t('messages.updateSuccess', { code: formData.floorCode })
        : t('messages.createSuccess', { code: formData.floorCode });

      toast.success(successMessage);
      handleClose();
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message ? error.message : t('apiErrors.operationFailed');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (): void => {
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
            form="form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
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

        <FloorFormFields
          formData={formData}
          errors={errors}
          showError={showError}
          onChange={handleChange}
          onBlur={handleBlur}
          labels={{
            floorCode: t('form.floorCode'),
            floorCodePlaceholder: t('form.floorCodePlaceholder'),
            description: t('form.description'),
            descriptionPlaceholder: t('form.descriptionPlaceholder'),
            sequenceNo: t('form.sequenceNo'),
          }}
        />

        <MandatoryFieldsNotice message={tCommon('note.mandatory')} />
      </form>
    </Drawer>
  );
}
