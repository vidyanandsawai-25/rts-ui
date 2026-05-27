'use client';

import { Label } from '@/components/common/label';
import { Input, Select, ValidationMessage, TextArea, RequiredFieldsNote, StatusToggleCard } from '@/components/common';
import type { Option } from '@/components/common';
import { useTranslations } from 'next-intl';
import type { FormState } from '@/types/configMaster.types';


interface ConfigKeyFormFieldsProps {
  formData: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  categoryOptions: Option[];
  isPending: boolean;
  isEdit: boolean;
  onFieldChange: (field: keyof FormState, value: string | number | boolean | null) => void;
  onDataTypeChange: (value: string) => void;
}

const CONTROL_TYPES: Option[] = [
  { value: 'textbox', label: 'Text Input' }, { value: 'number', label: 'Number Input' },
  { value: 'dropdown', label: 'Dropdown Select' }, { value: 'calendar', label: 'Date Picker' },
  { value: 'checkbox', label: 'Checkbox/Toggle' }
];

const DATA_TYPES: Option[] = [
  { value: 'string', label: 'String' }, { value: 'int', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' }, { value: 'datetime', label: 'DateTime' },
  { value: 'boolean', label: 'Boolean' }
];

const BOOLEAN_OPTIONS: Option[] = [
  { value: 'true', label: 'True' }, { value: 'false', label: 'False' }
];

export function ConfigKeyFormFields({
  formData,
  errors,
  categoryOptions,
  isPending,
  isEdit,
  onFieldChange,
  onDataTypeChange,
}: ConfigKeyFormFieldsProps) {
  const t = useTranslations('configMaster');

  return (
    <div className="p-6 space-y-5">
      <RequiredFieldsNote text={t('modals.addKey.form.requiredFields')} />

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="categoryId" required>
          {t('modals.addKey.form.category')}
        </Label>
        <Select options={categoryOptions}
          value={formData.categoryId}
          onChange={(_, value) => onFieldChange('categoryId', value)}
          placeholder={t('modals.addKey.form.placeholders.category')}
          error={errors.categoryId}
          disabled={isPending}
          className="cursor-pointer [&_button]:cursor-pointer"
        />
      </div>

      {/* Config Code */}
      <div className="space-y-2">
        <Label htmlFor="configCode" required>
          {t('modals.addKey.form.code')}
        </Label>
        <Input
          id="configCode"
          value={formData.configCode || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^A-Za-z0-9]/g, '');
            onFieldChange('configCode', sanitized);
          }}
          placeholder={t('modals.addKey.form.placeholders.code')}
          className={errors.configCode ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={50}
          aria-invalid={errors.configCode ? 'true' : 'false'}
          aria-describedby={errors.configCode ? 'configCode-error' : undefined}
        />
        <ValidationMessage id="configCode-error" message={errors.configCode} visible={!!errors.configCode} />
      </div>

      {/* Config Name */}
      <div className="space-y-2">
        <Label htmlFor="configName" required>
          {t('modals.addKey.form.name')}
        </Label>
        <TextArea
          id="configName"
          value={formData.configName || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
            onFieldChange('configName', sanitized);
          }}
          placeholder={t('modals.addKey.form.placeholders.name')}
          className={errors.configName ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={100}
          rows={2}
          aria-invalid={errors.configName ? 'true' : 'false'}
          aria-describedby={errors.configName ? 'configName-error' : undefined}
        />
        <ValidationMessage id="configName-error" message={errors.configName} visible={!!errors.configName} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('modals.addKey.form.description')}</Label>
        <TextArea
          id="description"
          value={formData.description || ''}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '');
            onFieldChange('description', sanitized);
          }}
          placeholder={t('modals.addKey.form.placeholders.description')}
          className={errors.description ? 'border-red-500' : ''}
          rows={2}
          disabled={isPending}
          maxLength={255}
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        <ValidationMessage id="description-error" message={errors.description} visible={!!errors.description} />
      </div>

      {/* Data Type */}
      <div className="space-y-2">
        <Label htmlFor="dataType" required>
          {t('modals.addKey.form.dataType')}
        </Label>
        <Select options={DATA_TYPES}
          value={formData.dataType}
          onChange={(_, value) => onDataTypeChange(value)}
          placeholder={t('modals.addKey.form.placeholders.dataType')}
          disabled={isPending}
          error={errors.dataType}
          className="cursor-pointer [&_button]:cursor-pointer"
        />
      </div>

      {/* Default Value */}
      <div className="space-y-2">
        <Label htmlFor="defaultValue">{t('modals.addKey.form.defaultValue')}</Label>
        {formData.dataType === 'boolean' ? (
          <>
            <Select options={BOOLEAN_OPTIONS}
              value={formData.defaultValue}
              onChange={(_, value) => onFieldChange('defaultValue', value)}
              placeholder={t('modals.addKey.form.placeholders.defaultValue')}
              disabled={isPending}
              error={errors.defaultValue}
              className="cursor-pointer [&_button]:cursor-pointer"
            />
            <ValidationMessage id="defaultValue-error" message={errors.defaultValue} visible={!!errors.defaultValue} />
          </>
        ) : (
          <>
            <Input
              id="defaultValue"
              type={
                formData.dataType === 'int' || formData.dataType === 'decimal'
                  ? 'number'
                  : formData.dataType === 'datetime'
                    ? 'datetime-local'
                    : 'text'
              }
              min={formData.dataType === 'int' ? 1 : formData.dataType === 'decimal' ? 0.01 : undefined}
              step={formData.dataType === 'decimal' ? 'any' : formData.dataType === 'int' ? 1 : undefined}
              value={formData.defaultValue || ''}
              onChange={(e) => {
                const sanitized = formData.dataType === 'string'
                  ? e.target.value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
                  : e.target.value;
                onFieldChange('defaultValue', sanitized);
              }}
              onKeyDown={(e) => {
                if (formData.dataType === 'int' && /^[eE+\-.,]$/.test(e.key)) e.preventDefault();
                if (formData.dataType === 'decimal' && /^[eE+\-]$/.test(e.key)) e.preventDefault();
              }}
              placeholder={t('modals.addKey.form.placeholders.defaultValue')}
              className={errors.defaultValue ? 'border-red-500' : ''}
              disabled={isPending}
              maxLength={100}
              aria-invalid={errors.defaultValue ? 'true' : 'false'}
              aria-describedby={errors.defaultValue ? 'defaultValue-error' : undefined}
            />
            <ValidationMessage id="defaultValue-error" message={errors.defaultValue} visible={!!errors.defaultValue} />
          </>
        )}
      </div>

      {/* Control Type */}
      <div className="space-y-2">
        <Label htmlFor="controlType">{t('modals.addKey.form.controlType')}</Label>
        <Select options={CONTROL_TYPES}
          value={formData.controlType}
          onChange={(_, value) => onFieldChange('controlType', value)}
          placeholder={t('modals.addKey.form.placeholders.controlType')}
          disabled={isPending}
          error={errors.controlType}
          className="cursor-pointer [&_button]:cursor-pointer"
        />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <div
          onClick={(e) => {
            if (isPending) return;
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            onFieldChange('isActive', !formData.isActive);
          }}
          className="cursor-pointer"
        >
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={(checked) => onFieldChange('isActive', checked)}
            activeLabel={t('modals.addKey.form.active')}
            inactiveLabel={t('modals.addKey.form.inactive')}
            statusLabel={t('modals.addKey.form.status')}
            description={formData.isActive ? t('modals.addKey.form.activeDescription') : t('modals.addKey.form.inactiveDescription')}
            disabled={isPending}
            className="cursor-pointer [&_button]:cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

