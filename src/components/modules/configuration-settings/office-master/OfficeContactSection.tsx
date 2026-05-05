import React from "react";
import { Input, TextArea } from "@/components/common";
import type { OfficeFormModel } from "@/types/office.types";

interface OfficeContactSectionProps {
  formData: OfficeFormModel;
  errors: Partial<Record<keyof OfficeFormModel, string>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showError: (name: keyof OfficeFormModel) => boolean;
  t: (key: string) => string;
}

export function OfficeContactSection({ 
  formData, 
  errors, 
  handleChange, 
  handleBlur, 
  showError, 
  t 
}: OfficeContactSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 dark:bg-slate-800/10 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800">{t("form.contactSection")}</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="email"
            label={t("form.fields.emailId.label")}
            name="emailId"
            value={formData.emailId || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("emailId") ? errors.emailId : undefined}
            placeholder={t("form.fields.emailId.placeholder")}
          />

          <Input
            type="tel"
            label={t("form.fields.phone.label")}
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("phone") ? errors.phone : undefined}
            placeholder={t("form.fields.phone.placeholder")}
          />
          
          <Input
            label={t("form.fields.city.label")}
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("city") ? errors.city : undefined}
            placeholder={t("form.fields.city.placeholder")}
          />

          <Input
            label={t("form.fields.pincode.label")}
            name="pincode"
            value={formData.pincode || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("pincode") ? errors.pincode : undefined}
            placeholder={t("form.fields.pincode.placeholder")}
          />
        </div>

        <TextArea
          label={t("form.fields.address.label")}
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          placeholder={t("form.fields.address.placeholder")}
          rows={3}
        />
      </div>
    </div>
  );
}
