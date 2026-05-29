'use client';

import React from 'react';
import { FieldConfig } from '@/types/rule-engine.types';
import { RadioGroup, RadioGroupItem, Input } from '@/components/common';

interface RadioValueInputProps {
  config: FieldConfig;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  apiLoading: boolean;
  effectiveOptions: { label: string; value: string }[];
  error?: string;
}

export default function RadioValueInput({
  config,
  value,
  onChange,
  disabled,
  apiLoading,
  effectiveOptions,
  error,
}: RadioValueInputProps) {
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
          ← Pick from list
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val)}
        disabled={disabled || apiLoading}
        className="flex flex-row flex-wrap gap-4"
      >
        {effectiveOptions.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={`radio-${config.fieldId}-${opt.value}`} />
            <label
              htmlFor={`radio-${config.fieldId}-${opt.value}`}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </RadioGroup>
      {apiLoading && <span className="text-xs text-blue-500 font-medium">Loading options…</span>}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      {!apiLoading && config.sourceType !== 'API' && (
        <button
          type="button"
          onClick={() => setIsCustom(true)}
          className="self-start text-[11px] font-semibold text-gray-400 hover:text-blue-600 hover:underline transition-colors"
        >
          Enter custom value →
        </button>
      )}
    </div>
  );
}
