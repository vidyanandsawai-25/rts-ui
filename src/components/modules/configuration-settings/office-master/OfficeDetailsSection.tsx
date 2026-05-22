import React from "react";
import { Input, Select } from "@/components/common";
import type { OfficeFormModel } from "@/types/office.types";
import { getOfficeTypeOptions } from "@/config/office-master.config";

interface OfficeDetailsSectionProps {
  formData: OfficeFormModel;
  errors: Partial<Record<keyof OfficeFormModel, string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showError: (name: keyof OfficeFormModel) => boolean;
  t: (key: string) => string;
}

export function OfficeDetailsSection({ 
  formData, 
  errors, 
  handleChange, 
  handleBlur, 
  showError, 
  t 
}: OfficeDetailsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 dark:bg-slate-800/10 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800">{t("form.detailsSection")}</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("form.fields.officeCode.label")}
            required
            name="officeCode"
            value={formData.officeCode || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("officeCode") ? errors.officeCode : undefined}
            placeholder={t("form.fields.officeCode.placeholder")}
            maxLength={6}
          />

          <Input
            label={t("form.fields.officeName.label")}
            required
            name="officeName"
            value={formData.officeName || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("officeName") ? errors.officeName : undefined}
            placeholder={t("form.fields.officeName.placeholder")}
            maxLength={100}
          />

          <Select
            label={t("form.fields.type.label")}
            name="type"
            value={formData.type || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("type") ? errors.type : undefined}
            options={getOfficeTypeOptions(t)}
            placeholder={t("form.fields.type.placeholder")}
          />

          <Input
            type="text"
            label={t("form.fields.establishedDate.label")}
            name="establishedDate"
            value={formData.establishedDate || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("establishedDate") ? errors.establishedDate : undefined}
            placeholder="DD-MM-YYYY"
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );
}
