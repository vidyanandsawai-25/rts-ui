'use client';

import { Select } from '@/components/common';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/Textarea';
import { ModuleMasterFormData } from '@/types/moduleMaster.types';
import { ModuleMasterErrors } from '@/lib/api/configuration-settings/module-master/module-master.validator';
import * as CONST from '@/lib/api/configuration-settings/module-master/module-master.constants';

interface ModuleBasicDetailsProps {
  config: {
    formData: ModuleMasterFormData;
    errors: ModuleMasterErrors;
    departmentOptions: { label: string; value: string; disabled?: boolean }[];
    handlers: {
      handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
      handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
      handleBlur: (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => void;
    };
    t: (key: string, values?: Record<string, string | number | Date>) => string;
  };
}

export function ModuleBasicDetails({ config }: ModuleBasicDetailsProps) {
  const { formData, errors, departmentOptions, t, handlers } = config;
  const { handleChange, handleSelectChange, handleBlur } = handlers;
  const getFieldError = (fieldName: keyof ModuleMasterFormData, errorCode?: string) => {
    if (!errorCode) return undefined;

    if (errorCode.endsWith('Length')) {
      const limits: Record<string, number> = {
        moduleCode: CONST.MODULE_CODE_MAX,
        moduleName: CONST.MODULE_NAME_MAX,
        moduleNameLocal: CONST.MODULE_NAME_LOCAL_MAX,
        moduleIcon: CONST.MODULE_ICON_MAX,
        moduleLabel: CONST.MODULE_LABEL_MAX,
        moduleDescription: CONST.MODULE_DESCRIPTION_MAX,
      };
      return t(`validation.${errorCode}`, { count: limits[fieldName] || 0 });
    }

    return t(`validation.${errorCode}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 text-sm">{t('drawer.sections.basicDetails')}</h3>
      </div>

      <div className="p-5 space-y-4">
        <Select
          label={t('form.fields.departmentId')}
          required={true}
          options={departmentOptions}
          value={formData.departmentId ? String(formData.departmentId) : ''}
          onChange={handleSelectChange}
          error={getFieldError('departmentId', errors.departmentId)}
          onBlur={handleBlur}
          name="departmentId"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="moduleCode"
            label={t('form.fields.moduleCode')}
            placeholder={t('form.fields.moduleCodePlaceholder')}
            required={true}
            value={formData.moduleCode}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={CONST.MODULE_CODE_MAX}
            error={getFieldError('moduleCode', errors.moduleCode)}
          />

          <Input
            name="moduleName"
            label={t('form.fields.moduleName')}
            placeholder={t('form.fields.moduleNamePlaceholder')}
            required={true}
            value={formData.moduleName}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={CONST.MODULE_NAME_MAX}
            error={getFieldError('moduleName', errors.moduleName)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="moduleNameLocal"
            label={t('form.fields.moduleNameLocal')}
            placeholder={t('form.fields.moduleNameLocalPlaceholder')}
            value={formData.moduleNameLocal}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={CONST.MODULE_NAME_LOCAL_MAX}
            error={getFieldError('moduleNameLocal', errors.moduleNameLocal)}
          />
        </div>

        <div className="[&_label]:text-gray-700 [&_label]:dark:text-gray-700 [&_textarea]:text-gray-900 [&_textarea]:placeholder:text-gray-400">
          <TextArea
            name="moduleDescription"
            label={t('form.fields.moduleDescription')}
            placeholder={t('form.fields.moduleDescriptionPlaceholder')}
            value={formData.moduleDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(errors.moduleDescription)}
            errorMessage={getFieldError('moduleDescription', errors.moduleDescription)}
            rows={3}
            maxLength={CONST.MODULE_DESCRIPTION_MAX}
            className="text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
