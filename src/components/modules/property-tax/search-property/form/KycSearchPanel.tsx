"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input, Label, ValidationMessage } from "@/components/common";
import type {
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { COMPACT_INPUT_CLASS, COMPACT_LABEL_CLASS } from "../form-field-styles";
import {
  KYC_COMPACT_FIELDS,
  KYC_WIDE_FIELDS,
} from "../search-field-groups";
import { cn } from "@/lib/utils/cn";
import { PROPERTY_SEARCH_FIELD_LIMITS } from "@/lib/validations/property-search-field-rules";

interface KycSearchPanelProps {
  formState: SearchCriteria;
  fieldErrors: SearchFieldErrorMap;
  disabled: boolean;
  onInputChange: (
    field: keyof SearchCriteria
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur: (
    field: keyof SearchCriteria
  ) => (e: React.FocusEvent<HTMLInputElement>) => void;
}

function KycField({
  field,
  formState,
  fieldErrors,
  disabled,
  onInputChange,
  onInputBlur,
  label,
  placeholder,
  tooltip,
  maxLength,
}: {
  field: keyof SearchCriteria;
  formState: SearchCriteria;
  fieldErrors: SearchFieldErrorMap;
  disabled: boolean;
  onInputChange: KycSearchPanelProps["onInputChange"];
  onInputBlur: KycSearchPanelProps["onInputBlur"];
  label: string;
  placeholder: string;
  tooltip: string;
  maxLength?: number;
}) {
  const error = fieldErrors[field];

  return (
    <div className="flex min-w-0 flex-col w-full">
      <Label htmlFor={field} className={COMPACT_LABEL_CLASS} title={tooltip}>
        {label}
      </Label>
      <Input
        id={field}
        placeholder={placeholder}
        value={String(formState[field] ?? "")}
        onChange={onInputChange(field)}
        onBlur={onInputBlur(field)}
        disabled={disabled}
        maxLength={maxLength}
        fullWidth
        className={cn(
          COMPACT_INPUT_CLASS,
          error && "!border-red-500 focus:!ring-red-500"
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field}-error` : undefined}
      />
      <ValidationMessage
        id={`${field}-error`}
        message={error}
        visible={Boolean(error)}
        type="error"
      />
    </div>
  );
}

export function KycSearchPanel({
  formState,
  fieldErrors,
  disabled,
  onInputChange,
  onInputBlur,
}: KycSearchPanelProps) {
  const t = useTranslations("propertySearch.form");

  const renderField = (field: keyof SearchCriteria) => (
    <KycField
      key={field}
      field={field}
      formState={formState}
      fieldErrors={fieldErrors}
      disabled={disabled}
      onInputChange={onInputChange}
      onInputBlur={onInputBlur}
      label={t(`fields.${field}`)}
      placeholder={t(`placeholders.${field}`)}
      tooltip={t(`tooltips.${field}`)}
      maxLength={PROPERTY_SEARCH_FIELD_LIMITS[field as keyof typeof PROPERTY_SEARCH_FIELD_LIMITS]}
    />
  );

  return (
    <div className="space-y-1.5 pb-1 pt-0.5">
      <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-3">
        {KYC_COMPACT_FIELDS.map(renderField)}
      </div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
        {KYC_WIDE_FIELDS.map(renderField)}
      </div>
    </div>
  );
}
