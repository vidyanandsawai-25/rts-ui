"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  LookupOptions,
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { LookupInput } from "./LookupInput";
import { PropertyNoRangeInput } from "./PropertyNoRangeInput";

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
    <div className="overflow-x-auto pb-1 pt-0.5">
      <div className="grid min-w-[68rem] grid-cols-6 items-start gap-x-1.5 gap-y-1">
        <PropertyNoRangeInput
          label={t("fields.propertyNo")}
          tooltip={t("tooltips.propertyNo")}
          fromPlaceholder={t("placeholders.propertyNoFrom")}
          toPlaceholder={t("placeholders.propertyNoTo")}
          fromValue={formState.propertyNoFrom}
          toValue={formState.propertyNoTo}
          fromOptions={lookupOptions.propertyNos}
          toOptions={propertyNoToOptions}
          fromError={fieldErrors.propertyNoFrom}
          toError={fieldErrors.propertyNoTo}
          onFromChange={(v) => setField("propertyNoFrom", v)}
          onToChange={(v) => setField("propertyNoTo", v)}
          onFromBlur={onFieldBlur("propertyNoFrom")}
          onToBlur={onFieldBlur("propertyNoTo")}
          disabled={disabled}
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
        />
      </div>
    </div>
  );
}
