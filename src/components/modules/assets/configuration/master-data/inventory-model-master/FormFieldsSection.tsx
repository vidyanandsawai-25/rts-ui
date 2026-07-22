import { Label } from "@/components/common/label";


import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/select";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { TextArea } from "@/components/common/Textarea";
import type { FormFieldsSectionProps } from "@/types/asset-masters/inventory-model.types";

export function FormFieldsSection({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
  onSelectChange,
  t,
  categoryOptions,
}: FormFieldsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label className="block text-sm font-medium text-slate-700">
          {t("labels.itemName")} <span className="text-red-500">*</span>
        </Label>
        <Select
          options={categoryOptions}
          value={String(formData.group ?? "")}
          onChange={(_, v) => onSelectChange("group", String(v))}
          placeholder={t("placeholders.itemName")}
          className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
        />
        {showError("group") && <ValidationMessage message={errors.group} />}
      </div>

      <Input
        name="name"
        label={t("labels.name")}
        required
        value={formData.name}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={t("placeholders.name")}
        maxLength={40}
        error={showError("name") ? errors.name : undefined}
        className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />

      <TextArea
        name="description"
        label={t("labels.description")}
        rows={3}
        value={formData.description}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={t("placeholders.description")}
        maxLength={500}
        error={showError("description") ? true : false}
        errorMessage={showError("description") ? errors.description : undefined}
        className="w-full placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />
    </div>
  );
}
