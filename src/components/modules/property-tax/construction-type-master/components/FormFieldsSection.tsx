"use client";

import { Input, ValidationMessage } from "@/components/common";
import { ConstructionTypeFormModel } from "@/types/construction.types";
import type React from "react";

interface FormFieldsSectionProps {
  formData: ConstructionTypeFormModel;
  searchSequenceValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  errors: Partial<Record<keyof ConstructionTypeFormModel, string>>;
  showError: (field: keyof ConstructionTypeFormModel) => boolean;
  t: (key: string) => string;
}

export const FormFieldsSection = ({
  formData,
  searchSequenceValue,
  handleChange,
  handleBlur,
  errors,
  showError,
  t,
}: FormFieldsSectionProps) => {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <Input
        name="constructionCode"
        label={t("form.fields.constructionCode.label")}
        required
        placeholder={t("form.fields.constructionCode.placeholder")}
        value={formData.constructionCode}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.constructionCode}
        visible={showError("constructionCode")}
      />

      <Input
        name="description"
        label={t("form.fields.description.label")}
        required={true}
        placeholder={t("form.fields.description.placeholder")}
        value={formData.description}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.description}
        visible={showError("description")}
      />

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
