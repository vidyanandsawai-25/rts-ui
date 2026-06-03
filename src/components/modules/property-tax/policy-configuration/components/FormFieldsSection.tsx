import { Input, TextArea, ValidationMessage, Select } from "@/components/common";
import type { PolicyConfigurationFormModel } from "@/types/policy-configuration.types";
import {
  POLICY_DATA_TYPES,
  POLICY_CATEGORIES,
  getPlaceholderForDataType,
  getInputTypeForDataType,
} from "@/lib/validations/policy-configuration-datatype";

interface FormFieldsSectionProps {
  formData: PolicyConfigurationFormModel;
  errors: Record<string, string>;
  showError: (field: keyof PolicyConfigurationFormModel) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
  t: (key: string) => string;
}

export function FormFieldsSection({
  formData,
  errors,
  showError,
  onChange,
  onSelectChange,
  onBlur,
  onSelectBlur,
  t,
}: FormFieldsSectionProps) {
  // Get dynamic placeholders based on selected data type
  const valuePlaceholder = formData.dataType
    ? getPlaceholderForDataType(formData.dataType)
    : t("form.fields.policyValue.placeholder");
  const defaultValuePlaceholder = formData.dataType
    ? getPlaceholderForDataType(formData.dataType)
    : t("form.fields.defaultValue.placeholder");
  const inputType = getInputTypeForDataType(formData.dataType);

  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">

      {/* Row 1: Policy Code + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            name="policyCode"
            label={t("form.fields.policyCode.label")}
            required
            value={formData.policyCode}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={t("form.fields.policyCode.placeholder")}
            fullWidth
          />
          <ValidationMessage
            message={errors.policyCode}
            visible={showError("policyCode")}
          />
        </div>

        <div>
          <Select
            name="category"
            label={t("form.fields.category.label")}
            required
            options={POLICY_CATEGORIES}
            value={formData.category}
            onChange={onSelectChange}
            onBlur={onSelectBlur}
            placeholder={t("form.fields.category.placeholder")}
            error={showError("category") ? errors.category : undefined}
          />
          <ValidationMessage
            message={errors.category}
            visible={showError("category")}
          />
        </div>
      </div>

      {/* Row 2: Display Name */}
      <div>
        <Input
          name="displayName"
          label={t("form.fields.displayName.label")}
          required
          value={formData.displayName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.displayName.placeholder")}
          fullWidth
        />
        <ValidationMessage
          message={errors.displayName}
          visible={showError("displayName")}
        />
      </div>

      {/* Row 3: Description (Textarea) */}
      <div>
        <TextArea
          name="description"
          label={t("form.fields.description.label")}
          required
          value={formData.description}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.description.placeholder")}
          rows={3}
          error={showError("description")}
          errorMessage={errors.description}
        />
      </div>

      {/* Row 4: Data Type + Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select
            name="dataType"
            label={t("form.fields.dataType.label")}
            required
            options={POLICY_DATA_TYPES}
            value={formData.dataType}
            onChange={onSelectChange}
            onBlur={onSelectBlur}
            placeholder={t("form.fields.dataType.placeholder")}
            error={showError("dataType") ? errors.dataType : undefined}
          />
          <ValidationMessage
            message={errors.dataType}
            visible={showError("dataType")}
          />
        </div>

        <div>
          <Input
            name="unit"
            label={t("form.fields.unit.label")}
            required
            value={formData.unit}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={t("form.fields.unit.placeholder")}
            fullWidth
          />
          <ValidationMessage
            message={errors.unit}
            visible={showError("unit")}
          />
        </div>
      </div>

      {/* Row 5: Policy Value + Default Value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            name="policyValue"
            label={t("form.fields.policyValue.label")}
            required
            type={inputType}
            value={formData.policyValue}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={valuePlaceholder}
            fullWidth
          />
          <ValidationMessage
            message={errors.policyValue}
            visible={showError("policyValue")}
          />
        </div>

        <div>
          <Input
            name="defaultValue"
            label={t("form.fields.defaultValue.label")}
            required
            type={inputType}
            value={formData.defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={defaultValuePlaceholder}
            fullWidth
          />
          <ValidationMessage
            message={errors.defaultValue}
            visible={showError("defaultValue")}
          />
        </div>
      </div>

      {/* Row 6: Effective From + Effective To */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            name="effectiveFrom"
            label={t("form.fields.effectiveFrom.label")}
            required
            type="date"
            value={formData.effectiveFrom ? formData.effectiveFrom.split("T")[0] : ""}
            onChange={onChange}
            onBlur={onBlur}
            fullWidth
          />
          <ValidationMessage
            message={errors.effectiveFrom}
            visible={showError("effectiveFrom")}
          />
        </div>

        <div>
          <Input
            name="effectiveTo"
            label={t("form.fields.effectiveTo.label")}
            type="date"
            value={formData.effectiveTo ? formData.effectiveTo.split("T")[0] : ""}
            onChange={onChange}
            onBlur={onBlur}
            fullWidth
          />
        </div>
      </div>

    </div>
  );
}
