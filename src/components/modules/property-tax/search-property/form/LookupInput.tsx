"use client";

import { Input, Label, ValidationMessage } from "@/components/common";
import type { LookupInputProps } from "@/types/property-search.types";
import { COMPACT_INPUT_CLASS, COMPACT_LABEL_CLASS } from "../form-field-styles";
import { cn } from "@/lib/utils/cn";

export function LookupInput({
  id,
  label,
  placeholder,
  tooltip,
  value,
  options,
  error,
  onChange,
  onBlur,
  disabled,
  maxLength,
}: LookupInputProps) {
  const listId = `${id}-datalist`;

  return (
    <div className="flex flex-col w-full">
      <Label
        htmlFor={id}
        className={COMPACT_LABEL_CLASS}
        title={tooltip ?? (typeof label === "string" ? label : undefined)}
      >
        {label}
      </Label>
      <Input
        id={id}
        fullWidth
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        list={options.length > 0 ? listId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        className={cn(
          COMPACT_INPUT_CLASS,
          error && "!border-red-500 focus:!ring-red-500"
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <ValidationMessage
        id={`${id}-error`}
        message={error}
        visible={Boolean(error)}
        type="error"
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  );
}
