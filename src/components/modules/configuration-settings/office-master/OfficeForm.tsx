"use client";

import { 
  CancelButton, 
  SaveButton, 
  Input, 
  Select, 
  TextArea, 
  Drawer,
  ToggleSwitch,
  ValidationMessage
} from "@/components/common";
import { CheckCircle2, X, AlertCircle, Building2 } from "lucide-react";
import { Office } from "@/types/office.types";
import { useOfficeForm } from "@/hooks/useOfficeForm";
import { cn } from "@/lib/utils/cn";

export interface OfficeFormProps {
  officeId: number | null;
  initialData?: Office;
}

export default function OfficeForm({
  officeId,
  initialData,
}: OfficeFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    isActive,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  } = useOfficeForm({
    officeId,
    initialData,
    onSuccess: () => {},
    onCancel: () => {},
  });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") || "Edit Office" : t("form.addTitle") || "Add Office"}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("form.editSubtitle") || "Update details" : t("form.subtitle") || "Create a new office"}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleCancel}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? t("form.actions.update") || "Update" : t("form.actions.save") || "Save"}
            type="submit"
            form="form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <div className="rounded-xl border border-blue-100 bg-slate-50 p-4 transition-all duration-300">
            <div
              className={cn(
                "rounded-xl p-3 flex items-center justify-between transition-all duration-300",
                isActive
                  ? "border border-blue-200 bg-blue-50/50 shadow-sm"
                  : "border border-gray-200 bg-gray-50 shadow-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-300",
                    isActive
                      ? "bg-blue-100 text-blue-600 shadow-inner"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isActive ? <CheckCircle2 size={20} /> : <X size={20} />}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{t("form.status.label") || "Status"}</div>
                  <div className="text-sm text-gray-500">
                    {t("form.status.description") || "Set the office as active or inactive."}
                    <span className={cn(
                      "ml-1 font-medium",
                      isActive ? "text-blue-600" : "text-gray-600"
                    )}>
                      {isActive ? tCommon("status.active") : tCommon("status.inactive")}
                    </span>
                  </div>
                </div>
              </div>

              <ToggleSwitch
                checked={isActive}
                onChange={handleToggleStatus}
                showPopup={false}
              />
            </div>

            {errors.isActive && (
              <ValidationMessage
                message={errors.isActive}
                visible={!!errors.isActive}
                className="mt-3"
              />
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 dark:bg-slate-800/10 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800">{t("form.detailsSection") || "Office Details"}</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("form.fields.officeCode.label") || "Office Code"}
                required
                name="officeCode"
                value={formData.officeCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("officeCode") ? errors.officeCode : undefined}
                placeholder={t("form.fields.officeCode.placeholder") || "e.g. ZON01"}
              />

              <Input
                label={t("form.fields.officeName.label") || "Office Name"}
                required
                name="officeName"
                value={formData.officeName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("officeName") ? errors.officeName : undefined}
                placeholder={t("form.fields.officeName.placeholder") || "Enter office name"}
              />

              <Select
                label={t("form.fields.type.label") || "Type"}
                value={formData.type || ""}
                onChange={(value) => handleChange({ target: { name: "type", value } } as React.ChangeEvent<HTMLSelectElement>)}
                onBlur={() => handleBlur({ target: { name: "type" } } as React.FocusEvent<HTMLSelectElement>)}
                error={showError("type") ? errors.type : undefined}
                options={[
                  { label: t("form.fields.type.options.mainOffice") || "Main Office", value: "Main Office" },
                  { label: t("form.fields.type.options.zonalOffice") || "Zonal Office", value: "Zonal Office" },
                  { label: t("form.fields.type.options.departmentOffice") || "Department Office", value: "Department Office" },
                  { label: t("form.fields.type.options.wardOffice") || "Ward Office", value: "Ward Office" },
                  { label: t("form.fields.type.options.subOffice") || "Sub Office", value: "Sub Office" },
                  { label: t("form.fields.type.options.headOffice") || "Head Office", value: "Head Office" },
                  { label: t("form.fields.type.options.regionalOffice") || "Regional Office", value: "Regional Office" },
                  { label: t("form.fields.type.options.branchOffice") || "Branch Office", value: "Branch Office" },
                ]}
                placeholder={t("form.fields.type.placeholder") || "Select Type"}
              />

              <Input
                type="email"
                label={t("form.fields.emailId.label") || "Email ID"}
                name="emailId"
                value={formData.emailId || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("emailId") ? errors.emailId : undefined}
                placeholder={t("form.fields.emailId.placeholder") || "test@example.com"}
              />

              <Input
                type="tel"
                label={t("form.fields.phone.label") || "Phone"}
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("phone") ? errors.phone : undefined}
                placeholder={t("form.fields.phone.placeholder") || "Phone number"}
              />
              
              <Input
                label={t("form.fields.city.label") || "City"}
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("city") ? errors.city : undefined}
                placeholder={t("form.fields.city.placeholder") || "Enter city"}
              />

              <Input
                label={t("form.fields.pincode.label") || "Pincode"}
                name="pincode"
                value={formData.pincode || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("pincode") ? errors.pincode : undefined}
                placeholder={t("form.fields.pincode.placeholder") || "6-digit pincode"}
              />

              <Input
                type="date"
                label={t("form.fields.establishedDate.label") || "Established Date"}
                name="establishedDate"
                value={formData.establishedDate ? formData.establishedDate.split("T")[0] : ""}
                onChange={handleChange}
              />

              <Input
                type="number"
                label={t("form.fields.officeIncharge.label") || "Office Incharge"}
                name="officeIncharge"
                value={formData.officeIncharge ? String(formData.officeIncharge) : ""}
                onChange={handleChange}
                placeholder={t("form.fields.officeIncharge.placeholder") || "Enter Incharge ID"}
              />

              <Input
                type="number"
                label={t("form.fields.designationMasterId.label") || "Designation"}
                name="designationMasterId"
                value={formData.designationMasterId ? String(formData.designationMasterId) : ""}
                onChange={handleChange}
                placeholder={t("form.fields.designationMasterId.placeholder") || "Enter Designation ID"}
              />
            </div>

            <TextArea
              label={t("form.fields.address.label") || "Address"}
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder={t("form.fields.address.placeholder") || "Full office address..."}
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium">{tCommon("note.mandatory") || "Fields marked with * are mandatory"}</span>
        </div>
      </form>
    </Drawer>
  );
}
