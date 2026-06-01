"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { Option } from "@/components/common";
import type { PropertyAssessmentStatusOption } from "@/types/property-assessment-status.types";
import type {
  PropertyDescriptionOption,
  SearchCriteria,
  WardOption,
  ZoneOption,
} from "@/types/property-search.types";
import { TYPE_FILTER_OPTIONS } from "../constants";
import { FilterSelect } from "./FilterSelect";

interface TopFilterRowProps {
  formState: SearchCriteria;
  propertyTypeOptions: PropertyAssessmentStatusOption[];
  zoneOptions: ZoneOption[];
  wardOptions: WardOption[];
  propertyDescriptionOptions: PropertyDescriptionOption[];
  disabled: boolean;
  onSelectChange: (
    field: keyof SearchCriteria
  ) => (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  onZoneChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    value: string
  ) => void;
  onWardChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    value: string
  ) => void;
}

const toOption = <T extends { id: number | string; label: string }>(
  item: T
): Option => ({ label: item.label, value: String(item.id) });

export function TopFilterRow({
  formState,
  propertyTypeOptions,
  zoneOptions,
  wardOptions,
  propertyDescriptionOptions,
  disabled,
  onSelectChange,
  onZoneChange,
  onWardChange,
}: TopFilterRowProps) {
  const t = useTranslations("propertySearch.form");

  const propertyTypeSelectOptions: Option[] = propertyTypeOptions.map(toOption);
  const typeFilterSelectOptions: Option[] = TYPE_FILTER_OPTIONS.map((key) => ({
    label: t(`options.typeFilter.${key}`),
    value: key,
  }));
  const propertyDescriptionSelectOptions: Option[] =
    propertyDescriptionOptions.map(toOption);
  const zoneSelectOptions: Option[] = zoneOptions.map(toOption);
  const wardSelectOptions: Option[] = wardOptions.map(toOption);

  const wardPlaceholder =
    formState.zoneId <= 0
      ? t("placeholders.wardSelectZoneFirst")
      : t("placeholders.ward");

  const clearLabel = t("actions.clear");

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 items-end">
      <FilterSelect
        label={t("fields.propertyType")}
        options={propertyTypeSelectOptions}
        placeholder={t("placeholders.propertyType")}
        value={formState.propertyType}
        onChange={onSelectChange("propertyType")}
        disabled={disabled}
        clearLabel={clearLabel}
      />
      <FilterSelect
        label={t("fields.typeFilter")}
        options={typeFilterSelectOptions}
        placeholder={t("placeholders.typeFilter")}
        value={formState.typeFilter}
        onChange={onSelectChange("typeFilter")}
        disabled={disabled}
        clearLabel={clearLabel}
      />
      <FilterSelect
        label={t("fields.propertyDescription")}
        options={propertyDescriptionSelectOptions}
        placeholder={t("placeholders.propertyDescription")}
        value={formState.propertyDescription}
        onChange={onSelectChange("propertyDescription")}
        disabled={disabled}
        clearLabel={clearLabel}
      />
      <FilterSelect
        label={t("fields.zone")}
        options={zoneSelectOptions}
        placeholder={t("placeholders.zone")}
        value={formState.zoneId > 0 ? String(formState.zoneId) : ""}
        onChange={onZoneChange}
        disabled={disabled}
        clearLabel={clearLabel}
      />
      <FilterSelect
        key={`ward-select-${formState.zoneId}`}
        label={t("fields.ward")}
        options={wardSelectOptions}
        placeholder={wardPlaceholder}
        value={formState.wardId > 0 ? String(formState.wardId) : ""}
        onChange={onWardChange}
        disabled={disabled || formState.zoneId <= 0}
        clearLabel={clearLabel}
      />
    </div>
  );
}
