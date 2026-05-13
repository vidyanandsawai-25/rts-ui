'use client';

import { useState, useMemo, useTransition } from 'react';
import { Button, useConfirm, useToast } from '@/components/common';
import {
  createConfigKeyAction,
  updateConfigKeyAction,
} from '@/app/[locale]/configuration-settings/config-master/actions';
import type { AddConfigKeyModalProps, FormState } from '@/types/configMaster.types';
import { useTranslations } from 'next-intl';
import { ConfigKeyFormFields } from './ConfigKeyFormFields';

const initialFormState: FormState = {
  categoryId: '',
  configCode: '',
  configName: '',
  description: '',
  dataType: 'string',
  controlType: 'textbox',
  defaultValue: '',
  isActive: true,
};

/**
 * FORM CONTENT COMPONENT
 * Handles its own state to avoid useEffect reset patterns that trigger linting errors.
 * Re-mounts via key={isOpen} in the parent to naturally reset state.
 */
export function ConfigKeyForm({
  initialData,
  categoryId,
  categories,
  onSuccess,
  onClose,
  isEdit,
}: Omit<AddConfigKeyModalProps, 'isOpen'> & { isEdit: boolean }) {
  const t = useTranslations('configMaster');
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { confirm } = useConfirm();
  const { success: toastSuccess, error: toastError } = useToast();

  const derivedFormState = useMemo(() => {
    if (!isEdit || !initialData) {
      return {
        ...initialFormState,
        categoryId: categoryId?.toString() || '',
      };
    }
    return {
      categoryId: initialData.categoryId?.toString() || categoryId?.toString() || '',
      configCode: initialData.configCode || '',
      configName: initialData.name || '',
      description: initialData.description || '',
      dataType: initialData.dataType || 'string',
      controlType: initialData.controlType || 'textbox',
      defaultValue: initialData.defaultValue?.toString() || '',
      isActive: initialData.isEnabled ?? true,
    };
  }, [isEdit, initialData, categoryId]);

  const [formData, setFormData] = useState<FormState>(derivedFormState);

  const isDirty = useMemo(() => 
    JSON.stringify(formData) !== JSON.stringify(derivedFormState), 
  [formData, derivedFormState]);

  const handleDataTypeChange = (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      dataType: value,
      defaultValue: '',
      controlType: value === 'int' ? 'number' : value === 'boolean' ? 'checkbox' : 'textbox',
    }));
  };

  const handleClose = (): void => {
    if (isPending) return;
    if (isDirty) {
      confirm({
        variant: 'warning',
        title: t('confirm.discard.title'),
        description: t('confirm.discard.description'),
        confirmText: t('confirm.discard.confirm'),
        cancelText: t('confirm.discard.cancel'),
        onConfirm: onClose,
      });
      return;
    }
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formData.categoryId) newErrors.categoryId = t('modals.addKey.form.validation.categoryRequired');
    if (!formData.configCode.trim()) newErrors.configCode = t('modals.addKey.form.validation.codeRequired');
    if (!formData.configName.trim()) newErrors.configName = t('modals.addKey.form.validation.nameRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    if (isEdit && !isDirty) {
      onClose();
      return;
    }
    
    startTransition(async () => {
      try {
        const parsedCategoryId = parseInt(formData.categoryId, 10);
        if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
          toastError(t('modals.addKey.form.validation.categoryRequired'));
          return;
        }
        
        const submitData = new FormData();
        Object.entries(formData).forEach(([k, v]) => submitData.append(k, v.toString()));

        const result = isEdit && initialData
          ? await updateConfigKeyAction(initialData.configKeyId, { 
              ...formData, 
              categoryId: parsedCategoryId 
            })
          : await createConfigKeyAction(submitData);

        if (result.success) {
          toastSuccess(isEdit ? t('messages.keyUpdated') : t('messages.keyCreated'));
          onSuccess?.();
        } else {
          toastError(result.error || (isEdit ? t('messages.keyUpdateFailed') : t('messages.keyCreateFailed')));
        }
      } catch {
        toastError(t('messages.unexpectedError'));
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <ConfigKeyFormFields
            formData={formData}
            errors={errors}
            categoryOptions={(categories ?? []).map(c => ({ value: c.id, label: c.name }))}
            isPending={isPending}
            isEdit={isEdit}
            onFieldChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))}
            onDataTypeChange={handleDataTypeChange}
          />
        </form>
      </div>
      <div className="border-t border-slate-100 p-6 flex items-center justify-end gap-3 bg-slate-50/50">
        <Button variant="secondary" onClick={handleClose} disabled={isPending} className="cursor-pointer">
          {t('modals.addKey.buttons.cancel')}
        </Button>
        <Button 
          variant="success" 
          onClick={handleSubmit} 
          disabled={isPending || (isEdit && !isDirty)} 
          isLoading={isPending} 
          className="cursor-pointer"
        >
          {isPending 
            ? (isEdit ? t('modals.editKey.buttons.saving') : t('modals.addKey.buttons.creating')) 
            : (isEdit ? t('modals.editKey.buttons.save') : t('modals.addKey.buttons.create'))}
        </Button>
      </div>
    </div>
  );
}
