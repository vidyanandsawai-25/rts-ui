import React from "react";
import { Input } from "@/components/common";
import type { Office, OfficeFormModel } from "@/types/office.types";

interface OfficeAdditionalSectionProps {
  formData: OfficeFormModel;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  t: (key: string) => string;
}

export function OfficeAdditionalSection({ 
  formData, 
  handleChange, 
  t 
}: OfficeAdditionalSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 dark:bg-slate-800/10 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800">{t("form.additionalSection")}</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label={t("form.fields.officeIncharge.label")}
            name="officeIncharge"
            value={formData.officeIncharge ? String(formData.officeIncharge) : ""}
            onChange={handleChange}
            placeholder={t("form.fields.officeIncharge.placeholder")}
          />

          <Input
            type="number"
            label={t("form.fields.designationMasterId.label")}
            name="designationMasterId"
            value={formData.designationMasterId ? String(formData.designationMasterId) : ""}
            onChange={handleChange}
            placeholder={t("form.fields.designationMasterId.placeholder")}
          />
        </div>
      </div>
    </div>
  );
}
