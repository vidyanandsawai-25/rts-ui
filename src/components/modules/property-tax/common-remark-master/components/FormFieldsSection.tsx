"use client";

import React from "react";
import { Select, TextArea, Input } from "@/components/common";
import type { CommonRemarkFormModel } from "@/types/common-remark-master/common-remark.types";

interface FormFieldsSectionProps {
  formData: CommonRemarkFormModel;
  customRemarkType: string;
  categories: { id: number; categoryCode: string; categoryName: string }[];
  errors: Record<string, string>;
  showError: (field: string) => boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  handleCustomTypeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  t: (key: string) => string;
}

export function FormFieldsSection({
  formData,
  customRemarkType,
  categories,
  errors,
  showError,
  handleChange,
  handleSelectChange,
  handleCustomTypeChange,
  handleBlur,
  t,
}: FormFieldsSectionProps) {
  const remarkTypeOptions = [
    ...categories.map((c) => ({ label: c.categoryName, value: String(c.id) })),
    { label: t("form.otherRemarkType") || "Other", value: "Other" },
  ];

  return (
    <div className="space-y-4">
      <Select
        label={t("form.remarkType")}
        options={remarkTypeOptions}
        value={formData.remarkType}
        name="remarkType"
        placeholder={t("form.remarkTypePlaceholder")}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        required
        error={showError("remarkType") ? errors.remarkType : undefined}
      />

      {formData.remarkType === "Other" && (
        <Input
          label={t("form.customRemarkType") || "Custom Remark Type"}
          value={customRemarkType}
          name="customRemarkType"
          placeholder={t("form.customRemarkTypePlaceholder") || "Enter custom remark type..."}
          onChange={handleCustomTypeChange}
          onBlur={handleBlur}
          required
          error={showError("customRemarkType") ? errors.customRemarkType : undefined}
        />
      )}

      <TextArea
        label={t("form.remark")}
        value={formData.remark}
        name="remark"
        placeholder={t("form.remarkPlaceholder")}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={300}
        showCharCount
        required
        error={showError("remark")}
        errorMessage={showError("remark") ? errors.remark : undefined}
      />
    </div>
  );
}
