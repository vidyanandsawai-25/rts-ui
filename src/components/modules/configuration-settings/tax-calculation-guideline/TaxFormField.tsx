'use client';

import { Input, Select, Label, ValidationMessage } from '@/components/common';
import type { InputProps } from '@/components/common';
import type { Option } from '@/components/common/select';
import { cn } from '@/lib/utils/cn';

const BASE_INPUT = 'h-9 bg-white border-slate-200/80 text-sm font-medium';
const BASE_SELECT = 'h-9';

// ─── TaxInput ──────────────────────────────────────────────────────────────

interface TaxInputProps extends InputProps {
  label?: string;
  error?: string;
  required?: boolean;
}

/** Thin wrapper around the shared `Input` component with an optional label. */
export function TaxInput({ label, error, required, className, ...rest }: TaxInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <Input
        className={cn(BASE_INPUT, error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...rest}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}

// ─── TaxSelect ────────────────────────────────────────────────────────────

interface TaxSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Thin wrapper around the shared `Select` component. */
export function TaxSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  error,
  required,
  className,
}: TaxSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", disabled && "opacity-60 pointer-events-none")}>
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <Select
        selectSize="sm"
        options={options}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        onChange={(_e, val) => onChange(val)}
        className={cn(BASE_SELECT, className)}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}

// ─── TaxNumberInput ────────────────────────────────────────────────────────

interface TaxNumberInputProps {
  label?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/** Numeric input with label, clamped to [min, max]. */
export function TaxNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  className,
  error,
  required,
  disabled,
}: TaxNumberInputProps) {
  return (
    <div className={cn("flex flex-col gap-1", disabled && "opacity-60 pointer-events-none")}>
      {label && (
        <Label required={required} className="text-xs font-medium text-slate-700">
          {label}
        </Label>
      )}
      <Input
        type="number"
        inputMode="decimal"
        value={value !== undefined && !isNaN(value) ? String(value) : ''}
        min={String(min)}
        max={String(max)}
        step={String(step)}
        disabled={disabled}
        onChange={(e) => {
          const valStr = e.target.value;
          if (valStr === '') {
            onChange(undefined);
          } else {
            const raw = parseFloat(valStr);
            if (!isNaN(raw)) {
              onChange(Math.min(Math.max(raw, min), max));
            }
          }
        }}
        className={cn(BASE_INPUT, error && 'border-red-500', className)}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
}
