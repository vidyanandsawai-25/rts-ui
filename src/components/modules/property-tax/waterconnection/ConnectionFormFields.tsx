import React from "react";
import { Input, Select, ValidationMessage } from "@/components/common";
import type { WaterConnectionFormModel } from "@/types/waterconnection.types";

interface ConnectionFormFieldsProps {
  formData: WaterConnectionFormModel;
  errors: Record<string, string>;
  showError: (field: keyof WaterConnectionFormModel) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export function ConnectionFormFields({
  formData,
  errors,
  showError,
  onChange,
  onSelectChange,
  onBlur,
  t,
}: ConnectionFormFieldsProps) {
  const typeOptions = [
    { value: "Domestic", label: t("form.fields.type.domestic") },
    { value: "Commercial", label: t("form.fields.type.commercial") },
  ];

  const tapSizeOptions = [
    { value: "15 Inch", label: t("form.fields.tapSize.15Inch") },
    { value: "20 Inch", label: t("form.fields.tapSize.20Inch") },
    { value: "25 Inch", label: t("form.fields.tapSize.25Inch") },
    { value: "32 Inch", label: t("form.fields.tapSize.32Inch") },
  ];

  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      {/* Row 1: Connection No | Meter No */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            name="connectionNo"
            label={t("form.fields.connectionNo.label")}
            required
            value={formData.connectionNo}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={t("form.fields.connectionNo.placeholder")}
            fullWidth
          />
          <ValidationMessage
            message={errors.connectionNo}
            visible={showError("connectionNo")}
          />
        </div>
        <div>
          <Input
            name="meterNo"
            label={t("form.fields.meterNo.label")}
            required
            value={formData.meterNo}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={t("form.fields.meterNo.placeholder")}
            fullWidth
          />
          <ValidationMessage
            message={errors.meterNo}
            visible={showError("meterNo")}
          />
        </div>
      </div>

      {/* Row 2: Type | Install Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            name="type"
            label={t("form.fields.type.label")}
            required
            options={typeOptions}
            value={formData.type}
            onChange={(_, val) => onSelectChange("type", val)}
            placeholder={t("form.fields.type.placeholder")}
            error={showError("type") ? errors.type : undefined}
          />
        </div>
        <div>
          <Input
            name="installDate"
            type="date"
            label={t("form.fields.installDate.label")}
            required
            value={formData.installDate}
            onChange={onChange}
            onBlur={onBlur}
            fullWidth
          />
          <ValidationMessage
            message={errors.installDate}
            visible={showError("installDate")}
          />
        </div>
      </div>

      {/* Row 3: Tap Size | Applicable Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            name="tapSize"
            label={t("form.fields.tapSize.label")}
            required
            options={tapSizeOptions}
            value={formData.tapSize}
            onChange={(_, val) => onSelectChange("tapSize", val)}
            placeholder={t("form.fields.tapSize.placeholder")}
            error={showError("tapSize") ? errors.tapSize : undefined}
          />
        </div>
        <div>
          <Input
            name="applicableRate"
            type="number"
            label={t("form.fields.applicableRate.label")}
            value={String(formData.applicableRate || "")}
            onChange={onChange}
            fullWidth
            disabled
            helperText={t("form.fields.applicableRate.autoCalculated")}
          />
        </div>
      </div>
    </div>
  );
}
