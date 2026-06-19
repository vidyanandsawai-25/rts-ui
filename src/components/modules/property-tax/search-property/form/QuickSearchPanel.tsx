"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, RotateCcw } from "lucide-react";
import type {
  LookupOptions,
  SearchCriteria,
  SearchFieldErrorMap,
} from "@/types/property-search.types";
import { LookupInput } from "./LookupInput";
import { PROPERTY_SEARCH_FIELD_LIMITS } from "@/lib/validations/property-search-field-rules";
import { Button } from "@/components/common";
import { SEARCH_BRAND_BUTTON, SEARCH_RESET_BUTTON } from "../form-field-styles";

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
  searchPending: boolean;
  isSubmitDisabled: boolean;
  onReset: () => void;
}

export function QuickSearchPanel({
  formState,
  lookupOptions,
  propertyNoToOptions,
  fieldErrors,
  disabled,
  setField,
  onFieldBlur,
  searchPending,
  isSubmitDisabled,
  onReset,
}: QuickSearchPanelProps) {
  const t = useTranslations("propertySearch.form");
  const tCommon = useTranslations("common");

  return (
    <div className="overflow-x-auto px-2 pb-1 pt-1.5">
      <div className="grid min-w-[62rem] max-w-[72rem] grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-start gap-x-1.5 gap-y-1">
        <LookupInput
          id="scanQR"
          label={t("fields.scanQR")}
          tooltip={t("fields.scanQR")}
          placeholder={t("placeholders.scanQR")}
          value={formState.scanQR}
          options={[]}
          error={fieldErrors.scanQR}
          onChange={(v) => setField("scanQR", v)}
          onBlur={onFieldBlur("scanQR")}
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
          maxLength={PROPERTY_SEARCH_FIELD_LIMITS.upicId}
        />
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
        <div className="flex flex-col w-full">
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
