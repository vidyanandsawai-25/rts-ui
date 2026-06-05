'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldConfig } from '@/types/rule-engine.types';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Input } from '@/components/common';

interface MultiSelectValueInputProps {
  config: FieldConfig;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  disabled: boolean;
  apiLoading: boolean;
  effectiveOptions: { label: string; value: string }[];
  loadingPlaceholder: string;
  error?: string;
}

export default function MultiSelectValueInput({
  config,
  value,
  onChange,
  disabled,
  apiLoading,
  effectiveOptions,
  loadingPlaceholder,
  error,
}: MultiSelectValueInputProps) {
  const t = useTranslations('ruleEngine');
  const [isCustom, setIsCustom] = React.useState(false);

  const activeList = Array.isArray(value) ? value : value ? [value] : [];
  const activeScalar = activeList[0] || '';

  React.useEffect(() => {
    if (apiLoading || config.sourceType === 'API') return;
    const hasOptions = effectiveOptions.length > 0;
    if (!hasOptions) return;
    if (activeScalar && !effectiveOptions.find((o) => String(o.value) === String(activeScalar))) {
      Promise.resolve().then(() => {
        setIsCustom(true);
      });
    }
  }, [effectiveOptions, activeScalar, apiLoading, config.sourceType]);

  if (isCustom && config.sourceType !== 'API') {
    const isNumeric = config.dataType === 'INTEGER' || config.dataType === 'DECIMAL';
    return (
      <div className="flex flex-col gap-1 w-full">
        <Input
          type={isNumeric ? 'number' : 'text'}
          value={activeScalar}
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
            onChange([]);
          }}
          className="self-start text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          {t('valueInput.pickFromList')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <MultiSelect
        options={effectiveOptions}
        value={activeList}
        onChange={(selected) => onChange(selected)}
        placeholder={loadingPlaceholder}
        disabled={disabled || apiLoading}
        error={!!error}
      />
    </div>
  );
}
