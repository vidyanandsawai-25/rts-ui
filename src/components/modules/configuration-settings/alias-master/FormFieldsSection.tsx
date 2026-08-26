"use client";

import React from "react";
import { Input, ValidationMessage } from "@/components/common";
import type { AliasMasterFormModel } from "@/types/alias-master.types";

interface FormFieldsSectionProps {
  formData: AliasMasterFormModel;
  errors: Partial<Record<keyof AliasMasterFormModel, string>>;
  showError: (field: keyof AliasMasterFormModel) => boolean;
  isEdit: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export interface FormFieldsSectionRef {
  fieldNameRef: React.RefObject<HTMLInputElement | null>;
}

export const FormFieldsSection = React.forwardRef<FormFieldsSectionRef, FormFieldsSectionProps>(
  ({
    formData,
    errors,
    showError,
    isEdit,
    onChange,
    onBlur,
    t,
  }, ref) => {
    const fieldNameRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => ({
      fieldNameRef,
    }));

    return (
      <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
        <Input
          ref={fieldNameRef}
          name="fieldName"
          label={t("form.fields.fieldName.label")}
          required
          disabled={isEdit}
          value={formData.fieldName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.fieldName.placeholder")}
          fullWidth
        />
        <ValidationMessage message={errors.fieldName} visible={showError("fieldName")} />

        <Input
          name="labelName"
          label={t("form.fields.labelName.label")}
          required
          value={formData.labelName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.labelName.placeholder")}
          fullWidth
        />
        <ValidationMessage message={errors.labelName} visible={showError("labelName")} />

        <Input
          name="englishName"
          label={t("form.fields.englishName.label")}
          value={formData.englishName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.englishName.placeholder")}
          fullWidth
        />
        <ValidationMessage message={errors.englishName} visible={showError("englishName")} />

        <Input
          name="regionalName"
          label={t("form.fields.regionalName.label")}
          value={formData.regionalName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.regionalName.placeholder")}
          fullWidth
        />
        <ValidationMessage message={errors.regionalName} visible={showError("regionalName")} />

        <Input
          name="hindiName"
          label={t("form.fields.hindiName.label")}
          value={formData.hindiName}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={t("form.fields.hindiName.placeholder")}
          fullWidth
        />
        <ValidationMessage message={errors.hindiName} visible={showError("hindiName")} />
      </div>
    );
  }
);

FormFieldsSection.displayName = "FormFieldsSection";
