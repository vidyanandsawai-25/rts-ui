"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  LookupOptions,
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { LookupInput } from "./LookupInput";
import { PROPERTY_SEARCH_FIELD_LIMITS } from "@/lib/validations/property-search-field-rules";

interface QuickSearchPanelProps {
  formState: SearchCriteria;
  lookupOptions: LookupOptions;
  propertyNoToOptions: string[];
  fieldErrors: SearchFieldErrorMap;
  disabled: boolean;
  setField: (field: keyof SearchCriteria, value: string | number) => void;
  onFieldBlur: (
    field: keyof SearchCriteria
  ) => (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function QuickSearchPanel({
  formState,
  lookupOptions,
  propertyNoToOptions,
  fieldErrors,
  disabled,
  setField,
  onFieldBlur,
}: QuickSearchPanelProps) {
  const t = useTranslations("propertySearch.form");

  return (
    <div className="overflow-x-auto pb-1 pt-1.5">
      <div className="grid min-w-[78rem] grid-cols-7 items-start gap-x-1.5 gap-y-1">
        <LookupInput
          id="propertyNoFrom"
          label={t("fields.propertyNoFrom")}
          tooltip={t("tooltips.propertyNoFrom")}
          placeholder={t("placeholders.propertyNoFrom")}
          value={formState.propertyNoFrom}
          options={lookupOptions.propertyNos}
          error={fieldErrors.propertyNoFrom}
          onChange={(v) => setField("propertyNoFrom", v)}
          onBlur={onFieldBlur("propertyNoFrom")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.propertyNo}
        />
        <LookupInput
          id="propertyNoTo"
          label={t("fields.propertyNoTo")}
          tooltip={t("tooltips.propertyNoTo")}
          placeholder={t("placeholders.propertyNoTo")}
          value={formState.propertyNoTo}
          options={propertyNoToOptions}
          error={fieldErrors.propertyNoTo}
          onChange={(v) => setField("propertyNoTo", v)}
          onBlur={onFieldBlur("propertyNoTo")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.propertyNo}
        />
        <LookupInput
          id="oldPropertyNo"
          label={t("fields.oldPropertyNo")}
          tooltip={t("tooltips.oldPropertyNo")}
          placeholder={t("placeholders.oldPropertyNo")}
          value={formState.oldPropertyNo}
          options={lookupOptions.oldPropertyNos}
          error={fieldErrors.oldPropertyNo}
          onChange={(v) => setField("oldPropertyNo", v)}
          onBlur={onFieldBlur("oldPropertyNo")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.oldPropertyNo}
        />
        <LookupInput
          id="upicId"
          label={t("fields.upicId")}
          tooltip={t("tooltips.upicId")}
          placeholder={t("placeholders.upicId")}
          value={formState.upicId}
          options={lookupOptions.upicIds}
          error={fieldErrors.upicId}
          onChange={(v) => setField("upicId", v)}
          onBlur={onFieldBlur("upicId")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.upicId}
        />
        <LookupInput
          id="citySurveyNo"
          label={t("fields.citySurveyNo")}
          tooltip={t("tooltips.citySurveyNo")}
          placeholder={t("placeholders.citySurveyNo")}
          value={formState.citySurveyNo}
          options={lookupOptions.csns}
          error={fieldErrors.citySurveyNo}
          onChange={(v) => setField("citySurveyNo", v)}
          onBlur={onFieldBlur("citySurveyNo")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.citySurveyNo}
        />
        <LookupInput
          id="subZoneNo"
          label={t("fields.subZoneNo")}
          tooltip={t("tooltips.subZoneNo")}
          placeholder={t("placeholders.subZoneNo")}
          value={formState.subZoneNo}
          options={lookupOptions.subZoneNos}
          error={fieldErrors.subZoneNo}
          onChange={(v) => setField("subZoneNo", v)}
          onBlur={onFieldBlur("subZoneNo")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.subZoneNo}
        />
        <LookupInput
          id="plotNo"
          label={t("fields.plotNo")}
          tooltip={t("tooltips.plotNo")}
          placeholder={t("placeholders.plotNo")}
          value={formState.plotNo}
          options={[]}
          error={fieldErrors.plotNo}
          onChange={(v) => setField("plotNo", v)}
          onBlur={onFieldBlur("plotNo")}
          disabled={disabled}
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.plotNo}
        />
      </div>
    </div>
  );
}
