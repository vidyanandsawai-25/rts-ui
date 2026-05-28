"use client";

import React from "react";
import { Button, Label, Select } from "@/components/common";
import type { Option } from "@/components/common";
import { COMPACT_LABEL_CLASS } from "../form-field-styles";

interface FilterSelectProps {
  label: string;
  options: Option[];
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  disabled?: boolean;
  clearLabel?: string;
}

export function FilterSelect({
  label,
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  clearLabel = "Clear",
}: FilterSelectProps) {
  const handleClear = () => {
    const event = {
      target: { name: "", value: "" },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event, "");
  };

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between gap-1">
        <Label className={COMPACT_LABEL_CLASS}>{label}</Label>
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="!h-auto !min-h-0 !px-0 !py-0 text-xs text-[#004c8c] hover:!bg-transparent hover:underline"
          >
            {clearLabel}
          </Button>
        )}
      </div>
      <Select
        options={options}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        selectSize="sm"
        ariaLabel={label}
      />
    </div>
  );
}
