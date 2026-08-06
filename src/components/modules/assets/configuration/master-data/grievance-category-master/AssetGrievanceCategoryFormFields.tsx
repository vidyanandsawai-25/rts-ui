import React from "react";
import { Input, TextArea, ValidationMessage } from "@/components/common";
import { AssetGrievanceCategoryFormModel } from "@/types/asset-masters/asset-grievance-category.types";

interface AssetGrievanceCategoryFormFieldsProps {
  categoryNameRef: React.RefObject<HTMLInputElement | null>;
  formData: AssetGrievanceCategoryFormModel;
  slaValue: string;
  errors: Partial<Record<keyof AssetGrievanceCategoryFormModel, string>>;
  showError: (field: keyof AssetGrievanceCategoryFormModel) => boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export function AssetGrievanceCategoryFormFields({
  categoryNameRef,
  formData,
  slaValue,
  errors,
  showError,
  handleChange,
  handleBlur,
  t,
}: AssetGrievanceCategoryFormFieldsProps) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <Input
        ref={categoryNameRef}
        name="categoryName"
        label={t("form.fields.name")}
        required
        placeholder={t("form.fields.namePlaceholder")}
        value={formData.categoryName}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.categoryName}
        visible={showError("categoryName")}
      />

      <Input
        name="resolutionSlaDays"
        label={t("form.fields.sla")}
        type="number"
        required
        min={1}
        max={365}
        placeholder={t("form.fields.slaPlaceholder")}
        value={slaValue}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.resolutionSlaDays}
        visible={showError("resolutionSlaDays")}
      />

      <TextArea
        name="description"
        label={t("form.fields.description")}
        placeholder={t("form.fields.descPlaceholder")}
        value={formData.description}
        onChange={handleChange}
        onBlur={handleBlur}
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.description}
        visible={showError("description")}
      />
    </div>
  );
}
