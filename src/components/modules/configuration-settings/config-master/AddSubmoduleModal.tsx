'use client';

import { Layers } from 'lucide-react';
import { Drawer } from '@/components/common';
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
  const isEdit = !!initialData;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="md"
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
    >
      {isOpen && (
        <SubmoduleForm
          key={isOpen ? `open-${initialData?.moduleId || 'new'}` : 'closed'}
          initialData={initialData}
          departmentId={departmentId}
          onSuccess={onSuccess}
          onClose={onClose}
          isEdit={isEdit}
        />
      )}
    </Drawer>
  );
}
