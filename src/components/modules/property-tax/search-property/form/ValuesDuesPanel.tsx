"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Label } from "@/components/common";
import { SearchSelect } from "@/components/common/SearchSelect";
import type {
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { COMPACT_LABEL_CLASS } from "../form-field-styles";
import type { Option } from "@/components/common";
import { ValueFilterGroup } from "./ValueFilterGroup";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const valuationOptions: Option[] = [
    { label: t("options.valuation.rv"), value: "Rateable Value (RV)" },
    { label: t("options.valuation.cv"), value: "Capital Value (CV)" },
  ];

  const filterTypeOptions: Option[] = [
    { label: t("options.filterType.exact"), value: "exact" },
    { label: t("options.filterType.moreThan"), value: "moreThan" },
    { label: t("options.filterType.lessThan"), value: "lessThan" },
    { label: t("options.filterType.between"), value: "between" },
    { label: t("options.filterType.top"), value: "top" },
  ];

  const handleValuationMethodChange = (
    name: string,
    value: string
  ) => {
    // 1. Update form draft state in parent immediately
    const syntheticEvent = {
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>;
    onSelectChange("valuationMethod")(syntheticEvent, value);

    // 2. Perform URL navigation to update URL and clear filters
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("valuationMethod", value);
    } else {
      params.delete("valuationMethod");
    }
    params.delete("rateableValueFilter");
    params.delete("rateableValueFrom");
    params.delete("rateableValueTo");
    params.delete("capitalValueFilter");
    params.delete("capitalValueFrom");
    params.delete("capitalValueTo");

    const cleaned = new URLSearchParams();
    params.forEach((val, key) => {
      if (val.trim() !== "") {
        cleaned.set(key, val);
      }
    });
    const qs = cleaned.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    
    router.push(nextUrl);
  };

  const handleValuesDuesSelect =
    (field: keyof SearchCriteria) => (name: string, value: string) => {
      const syntheticEvent = {
        target: { name, value },
      } as React.ChangeEvent<HTMLSelectElement>;
      onSelectChange(field)(syntheticEvent, value);
    };

  return (
    <div className="overflow-visible pb-1 pt-0.5">
      <div className="flex flex-wrap items-start gap-x-1.5 gap-y-2">
        {/* Valuation Method */}
        <div className="flex min-w-0 flex-col w-44 shrink-0">
          <Label htmlFor="valuationMethod" className={COMPACT_LABEL_CLASS}>
            {t("placeholders.valuationMethod")}
          </Label>
          <SearchSelect
            key={`valuationMethod-${formState.valuationMethod}`}
            id="valuationMethod"
            name="valuationMethod"
            options={valuationOptions}
            placeholder={t("placeholders.valuationMethod")}
            value={formState.valuationMethod}
            onChange={handleValuationMethodChange}
            disabled={disabled}
            className="!h-8 !min-h-8 !py-0 !px-2.5 !text-xs !rounded-md !leading-8"
          />
        </div>

        {/* Rateable Value (RV) inline group */}
        {formState.valuationMethod === "Rateable Value (RV)" && (
          <ValueFilterGroup
            title={t("options.valuation.rv")}
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
        )}

        {/* Capital Value (CV) inline group */}
        {formState.valuationMethod === "Capital Value (CV)" && (
          <ValueFilterGroup
            title={t("options.valuation.cv")}
            filterField="capitalValueFilter"
            fromField="capitalValueFrom"
            toField="capitalValueTo"
            formState={formState}
            fieldErrors={fieldErrors}
            disabled={disabled}
            filterTypeOptions={filterTypeOptions}
            onSelectChange={handleValuesDuesSelect}
            onInputChange={onInputChange}
            onInputBlur={onInputBlur}
          />
        )}
      </div>
    </div>
  );
}
