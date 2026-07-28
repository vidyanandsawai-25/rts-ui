'use client';

import { useState, useMemo, useTransition, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common';
import {
  createModuleAction,
  updateModuleAction,
} from '@/app/[locale]/configuration-settings/config-master/actions';
import { useTranslations } from 'next-intl';
import { SubmoduleFormFields } from './SubmoduleFormFields';
import { CreateModuleMasterSchema, UpdateModuleMasterSchema } from '@/lib/validations/config-master.schema';

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
  onStateChange: (state: { isDirty: boolean; isPending: boolean }) => void;
}

export const SubmoduleForm = forwardRef<{ handleClose: () => void }, SubmoduleFormProps>(
  function SubmoduleForm({
    initialData,
    departmentId,
    onSuccess,
    onClose,
    isEdit,
    onStateChange,
  }, ref) {
    const t = useTranslations('configMaster');
    const router = useRouter();
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

    useEffect(() => {
      onStateChange({ isDirty, isPending });
    }, [isDirty, isPending, onStateChange]);

    const validateForm = (): boolean => {
      const validationData = {
        ...formData,
        departmentId,
        moduleNameLocal: null,
        moduleIcon: null,
        moduleLabel: null,
      };
      const schema = isEdit ? UpdateModuleMasterSchema : CreateModuleMasterSchema;
      const validation = schema.safeParse(validationData);
      if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors;
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        Object.entries(fieldErrors).forEach(([key, msgs]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            newErrors[key as keyof FormState] = msgs[0];
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
      if (isEdit && !isDirty) {
        onClose();
        return;
      }
      
      startTransition(async () => {
        try {
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
            if (result.validationErrors) {
              const mappedErrors: Partial<Record<keyof FormState, string>> = {};
              Object.entries(result.validationErrors).forEach(([key, msgs]) => {
                if (Array.isArray(msgs) && msgs.length > 0) {
                  mappedErrors[key as keyof FormState] = msgs[0];
                }
              });
              setErrors(mappedErrors);
            }
            toastError(result.error || (isEdit ? t('messages.submoduleUpdateFailed') : t('messages.submoduleCreateFailed')));
          }
        } catch {
          toastError(t('messages.unexpectedError'));
        }
      });
    };

    useImperativeHandle(ref, () => ({
      handleClose: () => {
        setFormData(derivedFormState);
        setErrors({});
        onClose();
      }
    }));

    return (
      <form id="submodule-form" onSubmit={handleSubmit} className="light">
        <SubmoduleFormFields 
          formData={formData} 
          errors={errors} 
          isPending={isPending} 
          isEdit={isEdit}
          onChange={(f, v) => setFormData(p => ({ ...p, [f]: v }))} 
        />
      </form>
    );
  }
);
