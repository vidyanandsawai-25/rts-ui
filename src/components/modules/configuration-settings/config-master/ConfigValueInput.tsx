'use client';

import { Input, Select, ToggleSwitch } from '@/components/common';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { ConfigItem } from '@/types/configMaster.types';

interface ConfigValueInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedKey?: ConfigItem | { controlType?: string; dataType?: string; options?: string[] };
  controlType?: string;
  dataType?: string;
  options?: string[];
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function ConfigValueInput({
  value,
  onChange,
  selectedKey,
  controlType: propControlType,
  dataType: propDataType,
  options: propOptions,
  disabled,
  error,
  className,
}: ConfigValueInputProps) {
  const t = useTranslations('configMaster');
  
  const controlType = (propControlType || (selectedKey as { controlType?: string })?.controlType || '').toLowerCase();
  const dataType = (propDataType || (selectedKey as { dataType?: string })?.dataType || '').toLowerCase();
  const options = propOptions || (selectedKey as { options?: string[] })?.options || [];

  // 1. Toggle/Checkbox
  if (
    controlType === 'checkbox' ||
    controlType === 'toggle' ||
    dataType === 'boolean' ||
    dataType === 'bool'
  ) {
    const isChecked = value === 'true';
    return (
      <div className={cn("flex items-center gap-3 h-11 px-4 bg-slate-50 rounded-xl border border-slate-200", className)}>
        <ToggleSwitch
          checked={isChecked}
          onChange={(checked) => onChange(checked ? 'true' : 'false')}
          disabled={disabled}
          showPopup={false}
        />
        <span className="text-sm font-medium text-slate-600">
          {isChecked
            ? t('modals.departmentConfig.enabled')
            : t('modals.departmentConfig.disabled')}
        </span>
      </div>
    );
  }

  // 2. Dropdown
  if (controlType === 'dropdown' || controlType === 'select') {
    const selectOptions =
      options && options.length > 0
        ? options.map((o: string) => ({ value: o, label: o }))
        : [{ value: value || '', label: value || 'Select...' }];

    return (
      <Select
        value={value || ''}
        onChange={(_, val) => onChange(val)}
        options={selectOptions}
        disabled={disabled}
        className={cn("h-11 text-sm rounded-xl w-full cursor-pointer [&_button]:cursor-pointer", className)}
      />
    );
  }

  // 3. Calendar/Date
  if (controlType === 'calendar' || controlType === 'date' || dataType === 'datetime') {
    return (
      <Input
        type={dataType === 'datetime' ? 'datetime-local' : 'date'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error ? 'border-red-500' : '', className)}
        disabled={disabled}
      />
    );
  }

  // 4. Default: Text/Number
  const isNumericType = controlType === 'number' || dataType === 'int' || dataType === 'number';
  const isDecimalType = dataType === 'decimal';
  return (
    <Input
      placeholder={t('modals.addValue.form.placeholders.value')}
      value={value}
      onChange={(e) => {
        let val = e.target.value;
        if (isNumericType) {
          val = val.replace(/[^0-9]/g, '');
        } else if (isDecimalType) {
          val = val.replace(/[^0-9.]/g, '').replace(/(\.[^.]*)\./g, '$1');
        }
        onChange(val);
      }}
      type={isNumericType ? 'number' : isDecimalType ? 'number' : 'text'}
      min={isNumericType ? 1 : isDecimalType ? 0.01 : undefined}
      step={isDecimalType ? 'any' : isNumericType ? 1 : undefined}
      onKeyDown={(e) => {
        if (isNumericType && /^[eE+\-.,]$/.test(e.key)) {
          e.preventDefault();
        }
        if (isDecimalType && /^[eE+\-]$/.test(e.key)) {
          e.preventDefault();
        }
      }}
      className={cn(error ? 'border-red-500' : '', className)}
      disabled={disabled}
    />
  );
}
