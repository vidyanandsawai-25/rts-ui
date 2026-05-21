'use client';

import { Label } from '@/components/common/label';
import { Input, ValidationMessage, RequiredFieldsNote, StatusToggleCard } from '@/components/common';
import { TextArea } from '@/components/common/Textarea';
import { useTranslations } from 'next-intl';

interface FormState {
  moduleCode: string;
  moduleName: string;
  moduleDescription: string;
  isActive: boolean;
}

interface SubmoduleFormFieldsProps {
  formData: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  isPending: boolean;
  isEdit: boolean;
  onChange: (field: keyof FormState, value: string | boolean) => void;
}

export function SubmoduleFormFields({
  formData,
  errors,
  isPending,
  isEdit,
  onChange,
}: SubmoduleFormFieldsProps) {
  const t = useTranslations('configMaster');

  return (
    <div className="p-6 space-y-4">
      <RequiredFieldsNote text={t('modals.addSubmodule.form.requiredFields')} />
      
      {/* Module Code */}
      <div className="space-y-2">
        <Label htmlFor="moduleCode" required>
          {t('modals.addSubmodule.form.code')}
        </Label>
        <Input
          id="moduleCode"
          value={formData.moduleCode || ''}
          onChange={(e) => onChange('moduleCode', e.target.value)}
          placeholder={t('modals.addSubmodule.form.placeholders.code')}
          className={errors.moduleCode ? 'border-red-500' : ''}
          disabled={isPending}
        />
        <ValidationMessage message={errors.moduleCode} visible={!!errors.moduleCode} />
      </div>

      {/* Module Name */}
      <div className="space-y-2">
        <Label htmlFor="moduleName" required>
          {t('modals.addSubmodule.form.name')}
        </Label>
        <Input
          id="moduleName"
          value={formData.moduleName || ''}
          onChange={(e) => onChange('moduleName', e.target.value)}
          placeholder={t('modals.addSubmodule.form.placeholders.name')}
          className={errors.moduleName ? 'border-red-500' : ''}
          disabled={isPending}
        />
        <ValidationMessage message={errors.moduleName} visible={!!errors.moduleName} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="moduleDescription">{t('modals.addSubmodule.form.description')}</Label>
        <TextArea
          id="moduleDescription"
          value={formData.moduleDescription || ''}
          onChange={(e) => onChange('moduleDescription', e.target.value)}
          placeholder={t('modals.addSubmodule.form.placeholders.description')}
          rows={3}
          disabled={isPending}
        />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <StatusToggleCard
          isActive={formData.isActive}
          onToggle={(checked) => onChange('isActive', checked)}
          statusLabel={t('modals.addSubmodule.form.status')}
          description={formData.isActive ? t('modals.addSubmodule.form.activeDescription') : t('modals.addSubmodule.form.inactiveDescription')}
          activeLabel={t('modals.addSubmodule.form.active')}
          inactiveLabel={t('modals.addSubmodule.form.inactive')}
          disabled={isPending}
        />
      )}
    </div>
  );
}
