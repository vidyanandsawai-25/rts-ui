"use client";

import { Input, Label, ValidationMessage } from "@/components/common";
import type { PropertyNoRangeInputProps } from "@/types/property-search.types";
import { COMPACT_INPUT_CLASS, COMPACT_LABEL_CLASS } from "../form-field-styles";
import { cn } from "@/lib/utils/cn";

const FROM_LIST_ID = "propertyNoFrom-datalist";
const TO_LIST_ID = "propertyNoTo-datalist";

export function PropertyNoRangeInput({
  label,
  tooltip,
  fromPlaceholder,
  toPlaceholder,
  fromValue,
  toValue,
  fromOptions,
  toOptions,
  fromError,
  toError,
  onFromChange,
  onToChange,
  onFromBlur,
  onToBlur,
  disabled,
}: PropertyNoRangeInputProps) {
  return (
    <div className="flex flex-col w-full">
      <Label
        htmlFor="propertyNoFrom"
        className={COMPACT_LABEL_CLASS}
        title={tooltip ?? label}
      >
        {label}
      </Label>
      <div className="flex gap-1">
        <div className="min-w-0 flex-1">
          <Input
            id="propertyNoFrom"
            fullWidth
            placeholder={fromPlaceholder}
            value={fromValue}
            disabled={disabled}
            list={fromOptions.length > 0 ? FROM_LIST_ID : undefined}
            onChange={(e) => onFromChange(e.target.value)}
            onBlur={onFromBlur}
            className={cn(
              COMPACT_INPUT_CLASS,
              fromError && "!border-red-500 focus:!ring-red-500"
            )}
            aria-invalid={Boolean(fromError)}
            aria-describedby={fromError ? "propertyNoFrom-error" : undefined}
          />
          <ValidationMessage
            id="propertyNoFrom-error"
            message={fromError}
            visible={Boolean(fromError)}
            type="error"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Input
            id="propertyNoTo"
            fullWidth
            placeholder={toPlaceholder}
            value={toValue}
            disabled={disabled}
            list={toOptions.length > 0 ? TO_LIST_ID : undefined}
            onChange={(e) => onToChange(e.target.value)}
            onBlur={onToBlur}
            className={cn(
              COMPACT_INPUT_CLASS,
              toError && "!border-red-500 focus:!ring-red-500"
            )}
            aria-invalid={Boolean(toError)}
            aria-describedby={toError ? "propertyNoTo-error" : undefined}
          />
          <ValidationMessage
            id="propertyNoTo-error"
            message={toError}
            visible={Boolean(toError)}
            type="error"
          />
        </div>
      </div>
      {fromOptions.length > 0 && (
        <datalist id={FROM_LIST_ID}>
          {fromOptions.map((opt) => (
            <option key={`from-${opt}`} value={opt} />
          ))}
        </datalist>
      )}
      {toOptions.length > 0 && (
        <datalist id={TO_LIST_ID}>
          {toOptions.map((opt) => (
            <option key={`to-${opt}`} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  );
}
