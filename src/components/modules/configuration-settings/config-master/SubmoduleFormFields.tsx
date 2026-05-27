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
          onChange={(e) => {
            const val = e.target.value.replace(/[^A-Za-z0-9]/g, '');
            onChange('moduleCode', val);
          }}
          placeholder={t('modals.addSubmodule.form.placeholders.code')}
          className={errors.moduleCode ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={50}
          aria-invalid={errors.moduleCode ? 'true' : 'false'}
          aria-describedby={errors.moduleCode ? 'moduleCode-error' : undefined}
        />
        <ValidationMessage id="moduleCode-error" message={errors.moduleCode} visible={!!errors.moduleCode} />
      </div>

      {/* Module Name */}
      <div className="space-y-2">
        <Label htmlFor="moduleName" required>
          {t('modals.addSubmodule.form.name')}
        </Label>
        <Input
          id="moduleName"
          value={formData.moduleName || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
            onChange('moduleName', val);
          }}
          placeholder={t('modals.addSubmodule.form.placeholders.name')}
          className={errors.moduleName ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={100}
          aria-invalid={errors.moduleName ? 'true' : 'false'}
          aria-describedby={errors.moduleName ? 'moduleName-error' : undefined}
        />
        <ValidationMessage id="moduleName-error" message={errors.moduleName} visible={!!errors.moduleName} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="moduleDescription">{t('modals.addSubmodule.form.description')}</Label>
        <TextArea
          id="moduleDescription"
          value={formData.moduleDescription || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
            onChange('moduleDescription', val);
          }}
          placeholder={t('modals.addSubmodule.form.placeholders.description')}
          className={errors.moduleDescription ? 'border-red-500' : ''}
          rows={3}
          disabled={isPending}
          maxLength={255}
          aria-invalid={errors.moduleDescription ? 'true' : 'false'}
          aria-describedby={errors.moduleDescription ? 'moduleDescription-error' : undefined}
        />
        <ValidationMessage id="moduleDescription-error" message={errors.moduleDescription} visible={!!errors.moduleDescription} />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <div
          onClick={(e) => {
            if (isPending) return;
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            onChange('isActive', !formData.isActive);
          }}
          className="cursor-pointer"
        >
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={(checked) => onChange('isActive', checked)}
            statusLabel={t('modals.addSubmodule.form.status')}
            description={formData.isActive ? t('modals.addSubmodule.form.activeDescription') : t('modals.addSubmodule.form.inactiveDescription')}
            activeLabel={t('modals.addSubmodule.form.active')}
            inactiveLabel={t('modals.addSubmodule.form.inactive')}
            disabled={isPending}
          />
        </div>
      )}
    </div>
  );
}
