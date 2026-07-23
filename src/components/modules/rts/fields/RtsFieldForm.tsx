"use client";

import { Sliders } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Input, StatusToggle } from "@/components/common";
import { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { useRtsFieldForm } from "@/hooks/rts/fields/useRtsFieldForm";

export interface RtsFieldFormProps {
  editingField: RtsFieldDefinitionApiItem | null;
  departments: RtsDepartmentApiItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RtsFieldForm({
  editingField,
  departments,
  onSuccess,
  onCancel,
}: RtsFieldFormProps) {
  const {
    formData,
    services,
    loadingServices,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleToggleRequired,
    handleCancel,
    showError,
    isEdit,
  } = useRtsFieldForm({
    editingField,
    onSuccess,
    onCancel,
  });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#3B82F6]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-blue-500 rounded-lg text-white">
            <Sliders size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-950">
              {isEdit ? "Edit Form Field" : "Add Form Field"}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? "Modify dynamic schema field" : "Configure new dynamic entry field"}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label="Cancel" onClick={handleCancel} disabled={isSubmitting} />
          <SaveButton
            label={isEdit ? "Update" : "Save"}
            type="submit"
            form="rts-field-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="rts-field-form" onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
        <div className="flex gap-4 items-center">
          <StatusToggle
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            label="Field Status"
            activeText="Active"
            inactiveText="Inactive"
          />
          <StatusToggle
            isActive={formData.isRequired}
            onToggle={handleToggleRequired}
            label="Requirement"
            activeText="Mandatory"
            inactiveText="Optional"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                onBlur={handleBlur}
                className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
              {showError("departmentId") && (
                <span className="text-[10px] font-bold text-red-500 mt-1">{errors.departmentId}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loadingServices || !formData.departmentId}
                className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
              >
                <option value="">-- Service --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.serviceName}
                  </option>
                ))}
              </select>
              {showError("serviceId") && (
                <span className="text-[10px] font-bold text-red-500 mt-1">{errors.serviceId}</span>
              )}
            </div>
          </div>

          <Input
            label="Field Code (Database Unique Key)"
            name="fieldCode"
            value={formData.fieldCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("fieldCode") ? errors.fieldCode : undefined}
            required
            placeholder="e.g. applicantMobileNo"
          />

          <Input
            label="Field Label (English)"
            name="fieldLabel"
            value={formData.fieldLabel}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("fieldLabel") ? errors.fieldLabel : undefined}
            required
            placeholder="e.g. Mobile Number"
          />

          <Input
            label="Field Label (Marathi/Local)"
            name="fieldLabelLocal"
            value={formData.fieldLabelLocal}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="उदा. मोबाईल क्रमांक"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Field Input Type
              </label>
              <select
                name="fieldType"
                value={formData.fieldType}
                onChange={handleChange}
                onBlur={handleBlur}
                className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="text">Text Box</option>
                <option value="number">Number Field</option>
                <option value="select">Dropdown (Select)</option>
                <option value="date">Date Picker</option>
                <option value="file">File Upload</option>
                <option value="textarea">Textarea (Multiline)</option>
              </select>
            </div>

            <Input
              label="Section Group (Field Group)"
              name="fieldGroup"
              value={formData.fieldGroup}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Personal Details"
            />
          </div>

          <Input
            label="Validation Rules (e.g. required, email, pattern:^[0-9]$)"
            name="validationRules"
            value={formData.validationRules}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="required|maxLength:10|minLength:10"
          />

          <Input
            label="Display Order (Sorting)"
            name="displayOrder"
            type="number"
            value={String(formData.displayOrder)}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0"
          />
        </div>
      </form>
    </Drawer>
  );
}
