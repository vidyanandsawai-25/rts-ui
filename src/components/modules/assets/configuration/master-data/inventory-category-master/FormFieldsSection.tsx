


import { Input } from "@/components/common/Input";
import { TextArea } from "@/components/common/Textarea";
import type { FormFieldsSectionProps } from "@/types/asset-masters/inventory-category.types";

export function FormFieldsSection({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
  t,
}: FormFieldsSectionProps) {
  return (
    <div className="space-y-6">


      <Input
        name="code"
        label={t("labels.code")}
        required
        value={formData.code}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={t("placeholders.code")}
        maxLength={15}
        error={showError("code") ? errors.code : undefined}
        className="placeholder:text-slate-500 placeholder:text-[13px] text-[13px] text-slate-700"
      />

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

      <Input
        name="depreciationRate"
        label={t("labels.depreciationRate")}
        required
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={formData.depreciationRate ?? ""}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "-" || e.key === "e") {
            e.preventDefault();
          }
        }}
        onBlur={onBlur}
        placeholder={t("placeholders.depreciationRate")}
        error={showError("depreciationRate") ? errors.depreciationRate : undefined}
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
