"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label, Input, ValidationMessage } from "@/components/common";
import { SearchSelect } from "@/components/common/SearchSelect";
import type { Option } from "@/components/common";
import type {
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { COMPACT_INPUT_CLASS, COMPACT_LABEL_CLASS } from "../form-field-styles";
import { cn } from "@/lib/utils/cn";

interface ValueFilterGroupProps {
  title: string;
  filterField: keyof SearchCriteria;
  fromField: keyof SearchCriteria;
  toField: keyof SearchCriteria;
  formState: SearchCriteria;
  fieldErrors: SearchFieldErrorMap;
  disabled: boolean;
  filterTypeOptions: Option[];
  onSelectChange: (
    field: keyof SearchCriteria
  ) => (name: string, value: string) => void;
  onInputChange: (
    field: keyof SearchCriteria
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur: (
    field: keyof SearchCriteria
  ) => (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function ValueFilterGroup({
  title,
  filterField,
  fromField,
  toField,
  formState,
  fieldErrors,
  disabled,
  filterTypeOptions,
  onSelectChange,
  onInputChange,
  onInputBlur,
}: ValueFilterGroupProps) {
  const t = useTranslations("propertySearch.form");

  const filterValue = String(formState[filterField] ?? "");
  const isBetween = filterValue === "between";
  const isTop = filterValue === "top";
  const fromError = fieldErrors[fromField];
  const toError = fieldErrors[toField];
  const amountLabel = isTop
    ? t("placeholders.topCount")
    : t("placeholders.amount");
  const amountPlaceholder = isTop
    ? t("placeholders.topCount")
    : t("placeholders.amount");

  return (
    <div className="flex items-start gap-x-1.5">
      {/* Filter Type dropdown */}
      <div className="flex min-w-0 flex-col w-44 shrink-0">
        <Label htmlFor={String(filterField)} className={COMPACT_LABEL_CLASS}>
          {title}
        </Label>
        <SearchSelect
          key={`${String(filterField)}-${filterValue}`}
          id={String(filterField)}
          name={String(filterField)}
          options={filterTypeOptions}
          placeholder={t("placeholders.filterType")}
          value={filterValue}
          onChange={onSelectChange(filterField)}
          disabled={disabled}
          className="!h-8 !min-h-8 !py-0 !px-2.5 !text-xs !rounded-md !leading-8"
        />
      </div>

      {/* Amount / Top Count */}
      <div className="flex min-w-0 flex-col w-36 shrink-0">
        <Label htmlFor={String(fromField)} className={COMPACT_LABEL_CLASS}>
          {amountLabel}
        </Label>
        <Input
          id={String(fromField)}
          type="text"
          inputMode="numeric"
          placeholder={amountPlaceholder}
          value={String(formState[fromField] ?? "")}
          onChange={onInputChange(fromField)}
          onBlur={onInputBlur(fromField)}
          disabled={disabled}
          fullWidth
          className={cn(
            COMPACT_INPUT_CLASS,
            fromError && "!border-red-500 focus:!ring-red-500"
          )}
          aria-invalid={Boolean(fromError)}
          aria-describedby={
            fromError ? `${String(fromField)}-error` : undefined
          }
        />
        <ValidationMessage
          id={`${String(fromField)}-error`}
          message={fromError}
          visible={Boolean(fromError)}
          type="error"
        />
      </div>

      {/* To Amount — only when "between" */}
      {isBetween && (
        <div className="flex min-w-0 flex-col w-36 shrink-0">
          <Label htmlFor={String(toField)} className={COMPACT_LABEL_CLASS}>
            {t("placeholders.toAmount")}
          </Label>
          <Input
            id={String(toField)}
            type="text"
            inputMode="numeric"
            placeholder={t("placeholders.toAmount")}
            value={String(formState[toField] ?? "")}
            onChange={onInputChange(toField)}
            onBlur={onInputBlur(toField)}
            disabled={disabled}
            fullWidth
            className={cn(
              COMPACT_INPUT_CLASS,
              toError && "!border-red-500 focus:!ring-red-500"
            )}
            aria-invalid={Boolean(toError)}
            aria-describedby={
              toError ? `${String(toField)}-error` : undefined
            }
          />
          <ValidationMessage
            id={`${String(toField)}-error`}
            message={toError}
            visible={Boolean(toError)}
            type="error"
          />
        </div>
      )}
    </div>
  );
}
