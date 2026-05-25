'use client';

import { useState, useTransition, useMemo } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button, Drawer, useConfirm, useToast } from '@/components/common';
import {
  createConfigCategoryAction,
  updateConfigCategoryAction,
} from '@/app/[locale]/configuration-settings/config-master/actions';
import { useTranslations } from 'next-intl';
import type { ConfigCategory } from '@/types/configMaster.types';
import { CategoryFormFields } from './CategoryFormFields';
import { CreateConfigCategorySchema, UpdateConfigCategorySchema } from '@/lib/validations/config-master.schema';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ConfigCategory | null;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddCategoryModalProps) {
  const t = useTranslations('configMaster');
  const [isPending, startTransition] = useTransition();
  const { success: toastSuccess, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    categoryCode: initialData?.code || '',
    categoryName: initialData?.name || '',
    displayOrder: initialData?.displayOrder?.toString() || '1',
    isActive: initialData?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = useMemo(() => {
    return (
      formData.categoryCode !== (initialData?.code || '') ||
      formData.categoryName !== (initialData?.name || '') ||
      formData.displayOrder !== (initialData?.displayOrder?.toString() || '1') ||
      formData.isActive !== (initialData?.isActive ?? true)
    );
  }, [formData, initialData]);

  const handleChange = (field: string, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const parsedDisplayOrder = parseInt(formData.displayOrder, 10);
    const validationData = {
      ...formData,
      displayOrder: isNaN(parsedDisplayOrder) ? 0 : parsedDisplayOrder,
    };
    const schema = isEdit ? UpdateConfigCategorySchema : CreateConfigCategorySchema;
    const validation = schema.safeParse(validationData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const newErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, msgs]) => {
        if (Array.isArray(msgs) && msgs.length > 0) {
          newErrors[key] = msgs[0];
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!validateForm()) return;

    // Prevent API call if no changes were made in edit mode
    if (isEdit && !isDirty) {
      onClose();
      return;
    }

    startTransition(async () => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value.toString()));

      try {
        const result = isEdit && initialData?.id
          ? await updateConfigCategoryAction(parseInt(initialData.id), form)
          : await createConfigCategoryAction(form);

        if (result.success) {
          toastSuccess(result.message || (isEdit ? t('messages.categoryUpdated') : t('messages.categoryCreated')));
          onSuccess();
        } else {
          if (result.validationErrors) {
            const mappedErrors: Record<string, string> = {};
            Object.entries(result.validationErrors).forEach(([key, msgs]) => {
              if (Array.isArray(msgs) && msgs.length > 0) {
                mappedErrors[key] = msgs[0];
              }
            });
            setErrors(mappedErrors);
          }
          toastError(result.message || result.error || t('messages.unexpectedError'));
        }
      } catch {
        toastError(t('messages.unexpectedError'));
      }
    });
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

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      width="sm"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm shrink-0">
            <FolderPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              {isEdit ? t('modals.editCategory.title') : t('modals.addCategory.title')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {isEdit ? t('modals.editCategory.subtitle') : t('modals.addCategory.subtitle')}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row items-center justify-end gap-3 w-full border-t border-slate-100 dark:border-slate-800 p-4">
          <Button variant="secondary" onClick={handleClose} disabled={isPending} className="flex-1 sm:flex-none sm:px-6 cursor-pointer">
            {t('modals.addCategory.buttons.cancel')}
          </Button>
          <Button variant="primary" onClick={() => handleSubmit()} disabled={isPending || (isEdit && !isDirty)} isLoading={isPending} className="cursor-pointer">
            {isPending ? (isEdit ? t('modals.editCategory.buttons.saving') : t('modals.addCategory.buttons.creating')) : (isEdit ? t('modals.editCategory.buttons.save') : t('modals.addCategory.buttons.create'))}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <CategoryFormFields formData={formData} errors={errors} isPending={isPending} isEdit={isEdit} onChange={handleChange} />
      </form>
    </Drawer>
  );
}
