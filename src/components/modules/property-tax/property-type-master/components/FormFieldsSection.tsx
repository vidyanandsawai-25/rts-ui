"use client";

import { Input, ValidationMessage, Select } from "@/components/common";
import { PropertyTypeFormModel } from "@/types/property-type.types";
import { PropertyTypeCategory } from "@/types/property-type-category.types";
import type React from "react";

interface FormFieldsSectionProps {
  formData: PropertyTypeFormModel;
  searchSequenceValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleCategoryChange: (value: string) => void;
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
  errors,
  showError,
  categories,
  t,
}: FormFieldsSectionProps) => {
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

      <Input
        name="type"
        label={t("form.fields.type.label")}
        required
        placeholder={t("form.fields.type.placeholder")}
        value={formData.type}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.type}
        visible={showError("type")}
      />

      <Input
        name="propertyTypeGroup"
        label={t("form.fields.propertyTypeGroup.label")}
        required
        placeholder={t("form.fields.propertyTypeGroup.placeholder")}
        value={formData.propertyTypeGroup}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.propertyTypeGroup}
        visible={showError("propertyTypeGroup")}
      />

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
        type="number"
        min={0}
        value={searchSequenceValue}
        onChange={handleChange}
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
