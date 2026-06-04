"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { ValueFilterGroup } from "./ValueFilterGroup";
import type { Option } from "@/components/common";

interface ValuesDuesPanelProps {
  formState: SearchCriteria;
  fieldErrors: SearchFieldErrorMap;
  disabled: boolean;
  onSelectChange: (
    field: keyof SearchCriteria
  ) => (_: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  onInputChange: (
    field: keyof SearchCriteria
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur: (
    field: keyof SearchCriteria
  ) => (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function ValuesDuesPanel({
  formState,
  fieldErrors,
  disabled,
  onSelectChange,
  onInputChange,
  onInputBlur,
}: ValuesDuesPanelProps) {
  const t = useTranslations("propertySearch.form");

  const filterTypeOptions: Option[] = [
    { label: t("options.filterType.exact"), value: "exact" },
    { label: t("options.filterType.moreThan"), value: "moreThan" },
    { label: t("options.filterType.lessThan"), value: "lessThan" },
    { label: t("options.filterType.between"), value: "between" },
    { label: t("options.filterType.top"), value: "top" },
  ];

  const handleValuesDuesSelect =
    (field: keyof SearchCriteria) => (name: string, value: string) => {
      const syntheticEvent = {
        target: { name, value },
      } as React.ChangeEvent<HTMLSelectElement>;
      onSelectChange(field)(syntheticEvent, value);
    };

  return (
    <div className="overflow-visible pb-1 pt-1.5">
      <div className="flex flex-wrap items-start gap-x-1.5 gap-y-2">
        <ValueFilterGroup
          title={t("fields.filters")}
          filterField="rateableValueFilter"
          fromField="rateableValueFrom"
          toField="rateableValueTo"
          formState={formState}
          fieldErrors={fieldErrors}
          disabled={disabled}
          filterTypeOptions={filterTypeOptions}
          onSelectChange={handleValuesDuesSelect}
          onInputChange={onInputChange}
          onInputBlur={onInputBlur}
        />
      </div>
    </div>
  );
}
