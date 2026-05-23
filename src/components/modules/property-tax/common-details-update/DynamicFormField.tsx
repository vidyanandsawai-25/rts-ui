"use client";

import { useMemo } from "react";
import { Input, Select, ValidationMessage, TextArea } from "@/components/common";
import { Label } from "@/components/common/label";
import { Checkbox } from "@/components/common/checkbox";
import { BulkUpdateFieldConfig, SelectOption } from "@/types/common-details-update/common-details-update.types";
import { useLocale, useTranslations } from "next-intl";

interface DynamicFormFieldProps {
  config: BulkUpdateFieldConfig;
  value: string | number | boolean;
  onChange: (fieldName: string, value: string | number | boolean) => void;
  submitted: boolean;
  dropdownOptions?: SelectOption[];
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: SelectOption[] = Array.from(
  { length: currentYear - 1900 + 6 },
  (_, i) => {
    const year = String(currentYear + 5 - i);
    return { label: year, value: year };
  }
);

export const DynamicFormField = ({
  config,
  value,
  onChange,
  submitted,
  dropdownOptions = [],
}: DynamicFormFieldProps) => {
  const locale = useLocale();
  const tCommon = useTranslations("common");

  const displayName =
    locale === "mr" && config.displayNameMarathi
      ? config.displayNameMarathi
      : config.displayName;

  const placeholder = config.placeholder ?? "";
  // Check for required fields - treat 0 as valid, only empty/null/undefined as invalid
  const isInvalid =
    submitted &&
    config.isRequired &&
    (value === "" || value === null || value === undefined);

  const fieldElement = useMemo(() => {
    switch (config.controlType) {
      case "textarea":
        return (
          <TextArea
            value={String(value ?? "")}
            onChange={(e) => onChange(config.fieldName, e.target.value)}
            placeholder={placeholder}
            maxLength={config.maxLength ?? undefined}
            readOnly={config.isReadonly}
            rows={3}
          />
        );

      case "dropdown":
        return (
          <Select
            value={String(value ?? "")}
            onChange={(_, val) => onChange(config.fieldName, val)}
            options={dropdownOptions}
            placeholder={placeholder || `Select ${displayName}`}
            disabled={config.isReadonly}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(config.fieldName, checked)}
              disabled={config.isReadonly}
            />
            <span className="text-sm text-gray-700">{displayName}</span>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={String(value ?? "")}
            onChange={(e) => onChange(config.fieldName, e.target.value)}
            placeholder={placeholder}
            maxLength={config.maxLength ?? undefined}
            readOnly={config.isReadonly}
          />
        );

      case "year":
        return (
          <Select
            value={String(value ?? "")}
            onChange={(_, val) => onChange(config.fieldName, val)}
            options={YEAR_OPTIONS}
            placeholder={placeholder || "Select year"}
            disabled={config.isReadonly}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={String(value ?? "")}
            onChange={(e) => onChange(config.fieldName, e.target.value)}
            readOnly={config.isReadonly}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            accept={config.validationRegex ? undefined : "image/*,.pdf"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(config.fieldName, file?.name ?? "");
            }}
            readOnly={config.isReadonly}
          />
        );

      default:
        return (
          <Input
            value={String(value ?? "")}
            onChange={(e) => onChange(config.fieldName, e.target.value)}
            placeholder={placeholder}
            maxLength={config.maxLength ?? undefined}
            readOnly={config.isReadonly}
          />
        );
    }
  }, [config, value, onChange, placeholder, dropdownOptions, displayName]);

  if (config.controlType === "checkbox") {
    return <div className="py-1">{fieldElement}</div>;
  }

  return (
    <div>
      <Label required={config.isRequired} className="text-xs">
        {displayName}
      </Label>
      {fieldElement}
      <ValidationMessage
        visible={isInvalid}
        message={tCommon("validation.fieldRequired", { field: displayName })}
      />
    </div>
  );
};
