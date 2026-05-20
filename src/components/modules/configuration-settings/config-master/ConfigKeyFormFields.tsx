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
  { value: 'textbox', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'dropdown', label: 'Dropdown Select' },
  { value: 'calendar', label: 'Date Picker' },
  { value: 'checkbox', label: 'Checkbox/Toggle' },
];

const DATA_TYPES: Option[] = [
  { value: 'string', label: 'String' },
  { value: 'int', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'boolean', label: 'Boolean' },
];

const BOOLEAN_OPTIONS: Option[] = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
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
          onChange={(e) => onFieldChange('configCode', e.target.value)}
          placeholder={t('modals.addKey.form.placeholders.code')}
          className={errors.configCode ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={50}
        />
        <ValidationMessage message={errors.configCode} visible={!!errors.configCode} />
      </div>

      {/* Config Name */}
      <div className="space-y-2">
        <Label htmlFor="configName" required>
          {t('modals.addKey.form.name')}
        </Label>
        <TextArea
          id="configName"
          defaultValue={formData.configName || ''}
          onChange={(e) => onFieldChange('configName', e.target.value)}
          placeholder={t('modals.addKey.form.placeholders.name')}
          className={errors.configName ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={100}
          rows={2}
        />
        <ValidationMessage message={errors.configName} visible={!!errors.configName} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('modals.addKey.form.description')}</Label>
        <TextArea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder={t('modals.addKey.form.placeholders.description')}
          rows={2}
          disabled={isPending}
          maxLength={255}
        />
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
        />
      </div>

      {/* Default Value */}
      <div className="space-y-2">
        <Label htmlFor="defaultValue">{t('modals.addKey.form.defaultValue')}</Label>
        {formData.dataType === 'boolean' ? (
          <Select options={BOOLEAN_OPTIONS}
            value={formData.defaultValue}
            onChange={(_, value) => onFieldChange('defaultValue', value)}
            placeholder={t('modals.addKey.form.placeholders.defaultValue')}
            disabled={isPending}
          />
        ) : (
          <Input
            id="defaultValue"
            type={
              formData.dataType === 'int' || formData.dataType === 'decimal'
                ? 'number'
                : formData.dataType === 'datetime'
                  ? 'datetime-local'
                  : 'text'
            }
            step={formData.dataType === 'decimal' ? 'any' : undefined}
            value={formData.defaultValue || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (formData.dataType === 'int') {
                const numericVal = val.replace(/[^0-9]/g, '');
                if (val !== numericVal) return;
                onFieldChange('defaultValue', numericVal);
              } else {
                onFieldChange('defaultValue', val);
              }
            }}
            onKeyDown={(e) => {
              if (formData.dataType === 'int' && /^[eE+\-.,]$/.test(e.key)) e.preventDefault();
              if (formData.dataType === 'decimal' && /^[eE+\-]$/.test(e.key)) e.preventDefault();
            }}
            placeholder={t('modals.addKey.form.placeholders.defaultValue')}
            disabled={isPending}
            maxLength={100}
          />
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
        />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <StatusToggleCard
          isActive={formData.isActive}
          onToggle={(checked) => onFieldChange('isActive', checked)}
          activeLabel={t('modals.addKey.form.active')}
          inactiveLabel={t('modals.addKey.form.inactive')}
          statusLabel={t('modals.addKey.form.status')}
          description={formData.isActive ? t('modals.addKey.form.activeDescription') : t('modals.addKey.form.inactiveDescription')}
          disabled={isPending}
        />
      )}
    </div>
  );
}

