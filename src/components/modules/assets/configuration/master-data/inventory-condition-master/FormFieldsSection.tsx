import { Label } from "@/components/common/label";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/select";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { TextArea } from "@/components/common/Textarea";

import type { InventoryConditionFormFieldsSectionProps } from "@/types/asset-masters/inventory-condition.types";

interface ExtendedFormFieldsSectionProps extends InventoryConditionFormFieldsSectionProps {
  conditionTypeOptions: { label: string; value: string }[];
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
  conditionTypeOptions,
  isLoadingCategories,
}: ExtendedFormFieldsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Condition Category Type: Asset or Inventory */}
      <div className="space-y-1">
        <Label className="block text-sm font-medium text-slate-700">
          {t("configuration.masterData.form.labels.conditionType")} <span className="text-red-500">*</span>
        </Label>
        <Select
          options={conditionTypeOptions}
          value={formData.conditionType ?? ""}
          onChange={(_, v) => onSelectChange("conditionType", String(v))}
          placeholder={t("configuration.masterData.form.placeholders.conditionType")}
          className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        {showError("conditionType") && <ValidationMessage message={errors.conditionType} />}
      </div>

      {/* Category dropdown — populated based on selected conditionType */}
      <div className="space-y-1">
        <Label className="block text-sm font-medium text-slate-700">
          {t("configuration.masterData.form.labels.category")} <span className="text-red-500">*</span>
        </Label>
        <Select
          options={categoryOptions}
          value={String(formData.inventoryItemCategoryId ?? "")}
          onChange={(_, v) => onSelectChange("inventoryItemCategoryId", String(v))}
          placeholder={
            isLoadingCategories
              ? "Loading..."
              : t("configuration.masterData.form.placeholders.category")
          }
          className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
          disabled={isLoadingCategories || !formData.conditionType}
        />
        {showError("inventoryItemCategoryId") && <ValidationMessage message={errors.inventoryItemCategoryId} />}
      </div>

      <Input
        name="conditionName"
        label={t("configuration.masterData.form.labels.name")}
        required
        value={formData.conditionName}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={t("configuration.masterData.form.placeholders.name")}
        maxLength={50}
        error={showError("conditionName") ? errors.conditionName : undefined}
        className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />

      <Input
        name="conditionFactor"
        label={t("configuration.masterData.form.labels.conditionFactor")}
        required
        type="number"
        min={0}
        max={1}
        step={0.01}
        value={formData.conditionFactor ?? ""}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "-" || e.key === "e") {
            e.preventDefault();
          }
        }}
        onBlur={onBlur}
        placeholder={t("configuration.masterData.form.placeholders.conditionFactor")}
        error={showError("conditionFactor") ? errors.conditionFactor : undefined}
        className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />

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
        errorMessage={showError("description") ? errors.description : undefined}
        className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />
    </div>
  );
}
