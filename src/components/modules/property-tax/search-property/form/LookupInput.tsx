"use client";

import { Input, Label, ValidationMessage } from "@/components/common";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("propertySearch.form");

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mb-1 flex items-center justify-between gap-1">
        <Label
          htmlFor={id}
          className={COMPACT_LABEL_CLASS}
          title={tooltip ?? (typeof label === "string" ? label : undefined)}
        >
          {label}
        </Label>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-[#004c8c] hover:underline cursor-pointer leading-none"
          >
            {t("actions.clear")}
          </button>
        )}
      </div>
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
