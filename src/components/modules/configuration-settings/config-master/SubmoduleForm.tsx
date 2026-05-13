'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, useConfirm, useToast } from '@/components/common';
import {
  createModuleAction,
  updateModuleAction,
} from '@/app/[locale]/configuration-settings/config-master/actions';
import { useTranslations } from 'next-intl';
import { SubmoduleFormFields } from './SubmoduleFormFields';

interface FormState {
  moduleCode: string;
  moduleName: string;
  moduleDescription: string;
  isActive: boolean;
}

const initialFormState: FormState = {
  moduleCode: '',
  moduleName: '',
  moduleDescription: '',
  isActive: true,
};

interface SubmoduleFormProps {
  departmentId: number;
  onSuccess?: () => void;
  onClose: () => void;
  initialData?: {
    moduleId: number;
    moduleCode: string;
    moduleName: string;
    moduleDescription: string;
    isActive: boolean;
  } | null;
  isEdit: boolean;
}

/**
 * FORM CONTENT COMPONENT
 * Handles its own state to avoid useEffect reset patterns that trigger linting errors.
 * Re-mounts via key={isOpen} in the parent to naturally reset state.
 */
export function SubmoduleForm({
  initialData,
  departmentId,
  onSuccess,
  onClose,
  isEdit,
}: SubmoduleFormProps) {
  const t = useTranslations('configMaster');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { confirm } = useConfirm();
  const { success: toastSuccess, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const derivedFormState = useMemo(() => {
    if (!isEdit || !initialData) return initialFormState;
    return {
      moduleCode: initialData.moduleCode,
      moduleName: initialData.moduleName,
      moduleDescription: initialData.moduleDescription,
      isActive: initialData.isActive,
    };
  }, [isEdit, initialData]);

  const [formData, setFormData] = useState<FormState>(derivedFormState);

  const isDirty = useMemo(() => 
    JSON.stringify(formData) !== JSON.stringify(derivedFormState), 
  [formData, derivedFormState]);

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
    if (!formData.moduleCode.trim()) newErrors.moduleCode = t('modals.addSubmodule.form.validation.codeRequired');
    if (!formData.moduleName.trim()) newErrors.moduleName = t('modals.addSubmodule.form.validation.nameRequired');
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
        // Only send form fields + departmentId - audit fields (createdBy/updatedBy) are set server-side
        const payload = { 
          ...formData, 
          departmentId,
          moduleNameLocal: null, 
          moduleIcon: null, 
          moduleLabel: null 
        };
        const result = isEdit && initialData 
          ? await updateModuleAction(initialData.moduleId, payload) 
          : await createModuleAction(payload);

        if (result.success) {
          toastSuccess(isEdit ? t('messages.submoduleUpdated') : t('messages.submoduleCreated'));
          router.refresh();
          onSuccess?.();
          onClose();
        } else {
          toastError(result.error || (isEdit ? t('messages.submoduleUpdateFailed') : t('messages.submoduleCreateFailed')));
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
          <SubmoduleFormFields 
            formData={formData} 
            errors={errors} 
            isPending={isPending} 
            isEdit={isEdit}
            onChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} 
          />
        </form>
      </div>
      <div className="border-t border-slate-100 p-6 flex items-center justify-end gap-3 bg-slate-50/50">
        <Button variant="secondary" onClick={handleClose} disabled={isPending} className="cursor-pointer">
          {tCommon('actions.cancel')}
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={isPending || (isEdit && !isDirty)} 
          isLoading={isPending} 
          className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
        >
          {isPending 
            ? (isEdit ? t('modals.editSubmodule.buttons.saving') : t('modals.addSubmodule.buttons.creating')) 
            : (isEdit ? t('modals.editSubmodule.buttons.save') : t('modals.addSubmodule.buttons.create'))}
        </Button>
      </div>
    </div>
  );
}
