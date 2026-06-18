"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { ValueFilterGroup } from "./ValueFilterGroup";
import type { Option } from "@/components/common";
import { Button } from "@/components/common";
import { Search, RotateCcw } from "lucide-react";
import { SEARCH_BRAND_BUTTON, SEARCH_RESET_BUTTON } from "../form-field-styles";

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
  searchPending: boolean;
  isSubmitDisabled: boolean;
  onReset: () => void;
}

export function ValuesDuesPanel({
  formState,
  fieldErrors,
  disabled,
  onSelectChange,
  onInputChange,
  onInputBlur,
  searchPending,
  isSubmitDisabled,
  onReset,
}: ValuesDuesPanelProps) {
  const t = useTranslations("propertySearch.form");
  const tCommon = useTranslations("common");

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
        <div className="flex flex-col">
          <div className="mb-1 h-[18px] flex items-center"></div>
          <div className="flex items-center gap-1.5 h-8">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Search}
              disabled={searchPending || isSubmitDisabled}
              className={`${SEARCH_BRAND_BUTTON} cursor-pointer disabled:cursor-not-allowed`}
            >
              {tCommon("actions.search")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={onReset}
              disabled={searchPending}
              className={`${SEARCH_RESET_BUTTON} cursor-pointer disabled:cursor-not-allowed`}
            >
              {tCommon("actions.reset")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
