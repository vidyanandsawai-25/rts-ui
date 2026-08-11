import React from "react";
import { Label } from "@/components/common/label";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/select";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { TextArea } from "@/components/common/Textarea";

import type { InventoryNameFormFieldsSectionProps } from "@/types/asset-masters/inventory-name.types";

interface ExtendedFormFieldsSectionProps extends InventoryNameFormFieldsSectionProps {
  codeRef?: React.RefObject<HTMLInputElement | null>;
}

export function FormFieldsSection({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
  onSelectChange,
  t,
  categoryOptions,
  codeRef,
}: ExtendedFormFieldsSectionProps) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <div className="space-y-1">
        <Label className="block text-sm font-medium text-slate-700">
          {t("configuration.masterData.form.labels.category")} <span className="text-red-500">*</span>
        </Label>
        <Select
          options={categoryOptions}
          value={String(formData.inventoryItemCategoryId ?? "")}
          onChange={(_, v) => onSelectChange("inventoryItemCategoryId", String(v))}
          placeholder={t("configuration.masterData.form.placeholders.category")}
          error={showError("inventoryItemCategoryId") ? " " : undefined}
          className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        <ValidationMessage message={errors.inventoryItemCategoryId} visible={showError("inventoryItemCategoryId")} />
      </div>

      <div>
        <Input
          ref={codeRef}
          name="subTypeCode"
          label={t("configuration.masterData.form.labels.code")}
          required
          value={formData.subTypeCode}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("configuration.masterData.form.placeholders.code")}
          maxLength={15}
          error={showError("subTypeCode") ? " " : undefined}
          className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        <ValidationMessage message={errors.subTypeCode} visible={showError("subTypeCode")} />
      </div>

      <div>
        <Input
          name="subTypeName"
          label={t("configuration.masterData.form.labels.name")}
          required
          value={formData.subTypeName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("configuration.masterData.form.placeholders.name")}
          maxLength={50}
          error={showError("subTypeName") ? " " : undefined}
          className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        <ValidationMessage message={errors.subTypeName} visible={showError("subTypeName")} />
      </div>

      <div>
        <TextArea
          name="description"
          label={t("configuration.masterData.form.labels.description")}
          rows={4}
          value={formData.description}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("configuration.masterData.form.placeholders.description")}
          maxLength={500}
          error={showError("description") ? true : false}
          className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        <ValidationMessage message={errors.description} visible={showError("description")} />
      </div>
    </div>
  );
}

