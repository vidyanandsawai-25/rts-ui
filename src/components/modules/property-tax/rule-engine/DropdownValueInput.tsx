'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldConfig } from '@/types/rule-engine.types';
import { Select, Input } from '@/components/common';

interface DropdownValueInputProps {
  config: FieldConfig;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  apiLoading: boolean;
  effectiveOptions: { label: string; value: string }[];
  loadingPlaceholder: string;
  error?: string;
}

export default function DropdownValueInput({
  config,
  value,
  onChange,
  disabled,
  apiLoading,
  effectiveOptions,
  loadingPlaceholder,
  error,
}: DropdownValueInputProps) {
  const t = useTranslations('ruleEngine');
  const [isCustom, setIsCustom] = React.useState(false);

  React.useEffect(() => {
    if (apiLoading || config.sourceType === 'API') return;
    const hasOptions = effectiveOptions.length > 0;
    if (!hasOptions) return;
    if (value && !effectiveOptions.find((o) => String(o.value) === String(value))) {
      Promise.resolve().then(() => {
        setIsCustom(true);
      });
    }
  }, [effectiveOptions, value, apiLoading, config.sourceType]);

  if (isCustom && config.sourceType !== 'API') {
    const isNumeric = config.dataType === 'INTEGER' || config.dataType === 'DECIMAL';
    return (
      <div className="flex flex-col gap-1 w-full">
        <Input
          type={isNumeric ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${config.fieldId} value`}
          disabled={disabled}
          error={error}
          min={config.numericMin}
          max={config.numericMax}
        />
        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            onChange('');
          }}
          className="self-start text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          {t('valueInput.pickFromList')}
        </button>
      </div>
    );
  }

  if (config.sourceType === 'API') {
    return (
      <div className="flex flex-col gap-1 w-full">
        <Select
          options={effectiveOptions}
          value={value}
          onChange={(_, val) => onChange(val)}
          placeholder={loadingPlaceholder}
          disabled={disabled || apiLoading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Select
        options={effectiveOptions}
        value={value}
        onChange={(_, val) => onChange(val)}
        placeholder={loadingPlaceholder}
        disabled={disabled || apiLoading}
        error={error}
      />
      {!apiLoading && effectiveOptions.length > 0 && (
        <button
          type="button"
          onClick={() => setIsCustom(true)}
          className="self-start text-[11px] font-semibold text-gray-400 hover:text-blue-600 hover:underline transition-colors"
        >
          {t('valueInput.enterCustomValue')}
        </button>
      )}
    </div>
  );
}
