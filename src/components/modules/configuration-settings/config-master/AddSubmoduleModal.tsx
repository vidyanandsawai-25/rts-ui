'use client';

import { useState, useRef, useCallback } from 'react';
import { Layers } from 'lucide-react';
import { Button, Drawer, useConfirm } from '@/components/common';
import { useTranslations } from 'next-intl';
import { SubmoduleForm } from './SubmoduleForm';

interface AddSubmoduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: number;
  departmentName?: string;
  onSuccess?: () => void;
  initialData?: {
    moduleId: number;
    moduleCode: string;
    moduleName: string;
    moduleDescription: string;
    isActive: boolean;
  } | null;
}

export default function AddSubmoduleModal({
  isOpen,
  onClose,
  departmentId,
  departmentName,
  onSuccess,
  initialData,
}: AddSubmoduleModalProps) {
  const t = useTranslations('configMaster');
  const tCommon = useTranslations('common');
  const { confirm } = useConfirm();
  const isEdit = !!initialData;

  const [formState, setFormState] = useState({ isDirty: false, isPending: false });
  const formRef = useRef<{ handleClose: () => void }>(null);

  const handleStateChange = useCallback((state: { isDirty: boolean; isPending: boolean }) => {
    setFormState(state);
  }, []);

  const handleClose = () => {
    if (formState.isPending) return;
    if (formState.isDirty) {
      confirm({
        variant: 'warning',
        title: t('confirm.discard.title'),
        description: t('confirm.discard.description'),
        confirmText: t('confirm.discard.confirm'),
        cancelText: t('confirm.discard.cancel'),
        onConfirm: () => {
          formRef.current?.handleClose();
        },
      });
      return;
    }
    formRef.current?.handleClose();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      width="md"
      className="config-drawer"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500 rounded-lg shadow-sm shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              {isEdit ? t('modals.editSubmodule.title') : t('modals.addSubmodule.title')}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit ? t('modals.editSubmodule.subtitle') : departmentName ? `${t('modals.addSubmodule.subtitle')} for ${departmentName}` : t('modals.addSubmodule.subtitle')}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-center gap-3 w-full">
          <Button variant="secondary" onClick={handleClose} disabled={formState.isPending} className="cursor-pointer">
            {tCommon('actions.cancel')}
          </Button>
          <Button 
            type="submit"
            form="submodule-form"
            variant="primary" 
            disabled={formState.isPending || (isEdit && !formState.isDirty)} 
            isLoading={formState.isPending} 
            className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
          >
            {formState.isPending 
              ? (isEdit ? t('modals.editSubmodule.buttons.saving') : t('modals.addSubmodule.buttons.creating')) 
              : (isEdit ? t('modals.editSubmodule.buttons.save') : t('modals.addSubmodule.buttons.create'))}
          </Button>
        </div>
      }
    >
      {isOpen && (
        <SubmoduleForm
          ref={formRef}
          initialData={initialData}
          departmentId={departmentId}
          onSuccess={onSuccess}
          onClose={onClose}
          isEdit={isEdit}
          onStateChange={handleStateChange}
        />
      )}
    </Drawer>
  );
}
