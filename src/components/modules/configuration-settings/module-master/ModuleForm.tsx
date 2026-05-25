'use client';

import { Briefcase } from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { ModuleMaster } from '@/types/moduleMaster.types';
import { useModuleForm } from '@/hooks/configuration-settings/module-master/useModuleForm';
import { ModuleBasicDetails } from './components/ModuleBasicDetails';
import { ModuleStatusToggle } from './components/ModuleStatusToggle';
import { ModuleFormFooter } from './components/ModuleFormFooter';

interface ModuleFormProps {
  id: number | null;
  initialData?: ModuleMaster;
  departmentOptions: { label: string; value: string; disabled?: boolean }[];
  existingModules?: ModuleMaster[];
}

export function ModuleForm({
  id,
  initialData,
  departmentOptions,
  existingModules,
}: ModuleFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleSelectChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    t,
    tCommon,
    isEdit,
  } = useModuleForm({
    id,
    initialData,
    initialExistingModules: existingModules,
  });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? t('drawer.editTitle') : t('drawer.addTitle')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{t('drawer.subtitle')}</p>
          </div>
        </div>
      }
      footer={
        <ModuleFormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          moduleName={formData.moduleName}
          onCancel={handleCancel}
          t={t}
          tCommon={tCommon}
        />
      }
    >
      <form
        id="module-form"
        onSubmit={handleSubmit}
        noValidate
        className="p-5 space-y-4 bg-gray-50/50 animate-in fade-in duration-200"
      >
        <ModuleBasicDetails
          config={{
            formData,
            errors,
            departmentOptions,
            t,
            handlers: {
              handleChange,
              handleSelectChange,
              handleBlur,
            },
          }}
        />

        {isEdit && (
          <ModuleStatusToggle
            isActive={formData.isActive}
            onChange={handleToggleStatus}
            t={t}
            tCommon={tCommon}
          />
        )}
      </form>
    </Drawer>
  );
}
