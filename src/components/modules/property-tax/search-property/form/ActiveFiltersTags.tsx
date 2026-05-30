"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  SearchCriteria,
  ZoneOption,
  WardOption,
  PropertyDescriptionOption,
} from "@/types/property-search.types";
import type { PropertyAssessmentStatusOption } from "@/types/property-assessment-status.types";

interface ActiveFiltersTagsProps {
  formState: SearchCriteria;
  propertyTypeOptions: PropertyAssessmentStatusOption[];
  zoneOptions: ZoneOption[];
  wardOptions: WardOption[];
  propertyDescriptionOptions: PropertyDescriptionOption[];
  onClearField: (field: keyof SearchCriteria) => void;
}

const formatTagValue = (label: string): string => {
  const trimmed = label.trim();
  if (/^[a-zA-Z\s]+$/.test(trimmed)) {
    return trimmed.toLowerCase().replace(/\s+/g, "-");
  }
  return trimmed;
};

export function ActiveFiltersTags({
  formState,
  propertyTypeOptions,
  zoneOptions,
  wardOptions,
  propertyDescriptionOptions,
  onClearField,
}: ActiveFiltersTagsProps) {
  const t = useTranslations("propertySearch.form");

  const activeTags: {
    key: string;
    label: string;
    value: string;
    onClear: () => void;
  }[] = [];

  if (formState.propertyType) {
    const optLabel = propertyTypeOptions.find(
      (opt) => String(opt.id) === formState.propertyType
    )?.label;
    if (optLabel) {
      activeTags.push({
        key: "propertyType",
        label: t("fields.propertyType"),
        value: formatTagValue(optLabel),
        onClear: () => onClearField("propertyType"),
      });
    }
  }

  if (formState.typeFilter) {
    activeTags.push({
      key: "typeFilter",
      label: t("fields.typeFilter"),
      value: formatTagValue(t(`options.typeFilter.${formState.typeFilter}`)),
      onClear: () => onClearField("typeFilter"),
    });
  }

  if (formState.propertyDescription) {
    const optLabel = propertyDescriptionOptions.find(
      (opt) => String(opt.id) === formState.propertyDescription
    )?.label;
    if (optLabel) {
      activeTags.push({
        key: "propertyDescription",
        label: t("fields.propertyDescription"),
        value: formatTagValue(optLabel),
        onClear: () => onClearField("propertyDescription"),
      });
    }
  }

  if (formState.zoneId > 0) {
    const optLabel = zoneOptions.find((opt) => opt.id === formState.zoneId)?.label;
    if (optLabel) {
      activeTags.push({
        key: "zoneId",
        label: t("fields.zone"),
        value: formatTagValue(optLabel),
        onClear: () => onClearField("zoneId"),
      });
    }
  }

  if (formState.wardId > 0) {
    const optLabel = wardOptions.find((opt) => opt.id === formState.wardId)?.label;
    if (optLabel) {
      activeTags.push({
        key: "wardId",
        label: t("fields.ward"),
        value: formatTagValue(optLabel),
        onClear: () => onClearField("wardId"),
      });
    }
  }


  if (activeTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 px-1.5 animate-in fade-in duration-200">
      {activeTags.map((tag) => (
        <div
          key={tag.key}
          className="inline-flex items-center gap-1 bg-blue-50/90 border border-blue-100/80 rounded-md px-2.5 py-0.5 text-sm text-[#004c8c] font-bold transition-all duration-150 hover:bg-blue-100/60"
        >
          <span>{tag.label}:</span>
          <span className="font-bold">{tag.value}</span>
          <button
            type="button"
            onClick={tag.onClear}
            className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200/50 hover:text-blue-900 transition-colors flex items-center justify-center cursor-pointer"
            aria-label={`Clear ${tag.label} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
