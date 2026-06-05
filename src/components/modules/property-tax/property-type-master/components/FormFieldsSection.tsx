"use client";

import { Input, ValidationMessage, Select } from "@/components/common";
import { PropertyTypeFormModel } from "@/types/property-type.types";
import { PropertyTypeCategory } from "@/types/property-type-category.types";
import { POSITIVE_INTEGER_REGEX } from "@/lib/utils/validation-rules";
import type React from "react";

interface FormFieldsSectionProps {
  formData: PropertyTypeFormModel;
  searchSequenceValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleCategoryChange: (value: string) => void;
  handleTypeChange: (value: string) => void;
  errors: Partial<Record<keyof PropertyTypeFormModel, string>>;
  showError: (field: keyof PropertyTypeFormModel) => boolean;
  categories: PropertyTypeCategory[];
  t: (key: string) => string;
}

export const FormFieldsSection = ({
  formData,
  searchSequenceValue,
  handleChange,
  handleBlur,
  handleCategoryChange,
  handleTypeChange,
  errors,
  showError,
  categories,
  t,
}: FormFieldsSectionProps) => {
  const sanitizeNumber = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <Input
        name="propertyDescription"
        label={t("form.fields.propertyDescription.label")}
        required
        placeholder={t("form.fields.propertyDescription.placeholder")}
        value={formData.propertyDescription}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.propertyDescription}
        visible={showError("propertyDescription")}
      />

      <div>
        <Select
          label={t("form.fields.type.label")}
          required
          value={formData.type || ""}
          onChange={(_, value) => handleTypeChange(value)}
          options={[
            { label: t("form.fields.type.placeholder"), value: "", disabled: true },
            { label: "R", value: "R" },
            { label: "C", value: "C" },
            { label: "I", value: "I" },
            { label: "N", value: "N" },
            { label: "R-C", value: "R-C" },
            { label: "I-C", value: "I-C" },
          ]}
          placeholder={t("form.fields.type.placeholder")}
          className="text-gray-700"
          ariaLabel={t("form.fields.type.label")}
        />
        <ValidationMessage
          message={errors.type}
          visible={showError("type")}
        />
      </div>

      <div>
        <Select
          label={t("form.fields.category.label")}
          required
          value={formData.propertyTypeCategoryId && formData.propertyTypeCategoryId !== 0 ? String(formData.propertyTypeCategoryId) : ""}
          onChange={(_, value) => handleCategoryChange(value)}
          options={[
            { label: t("form.fields.category.placeholder"), value: "", disabled: true },
            ...categories.map((cat) => ({
              label: cat.propertyTypeCategory,
              value: String(cat.id),
            })),
          ]}
          placeholder={t("form.fields.category.placeholder")}
          className="text-gray-700"
          ariaLabel={t("form.fields.category.label")}
        />
        <ValidationMessage
          message={errors.propertyTypeCategoryId}
          visible={showError("propertyTypeCategoryId")}
        />
      </div>

      <Input
        name="searchSequence"
        label={t("form.fields.searchSequence.label")}
        maxLength={3}
        value={searchSequenceValue}
        onChange={(e) => {
          const sanitized = sanitizeNumber(e.target.value);
          // Only accept if it matches POSITIVE_INTEGER_REGEX and is <= 999
          if (sanitized === "" || (POSITIVE_INTEGER_REGEX.test(sanitized) && parseInt(sanitized, 10) <= 999)) {
            // Create synthetic event with sanitized value
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: sanitized, name: "searchSequence" }
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }
        }}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.searchSequence}
        visible={showError("searchSequence")}
      />
    </div>
  );
};
