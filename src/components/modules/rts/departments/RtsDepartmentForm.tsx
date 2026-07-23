"use client";

import { Building2 } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Input, StatusToggle } from "@/components/common";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { useRtsDepartmentForm } from "@/hooks/rts/departments/useRtsDepartmentForm";

export interface RtsDepartmentFormProps {
  editingDepartment: RtsDepartmentApiItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RtsDepartmentForm({
  editingDepartment,
  onSuccess,
  onCancel,
}: RtsDepartmentFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    isEdit,
  } = useRtsDepartmentForm({
    editingDepartment,
    onSuccess,
    onClose: onCancel,
  });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#3B82F6]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-blue-500 rounded-lg text-white">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? "Edit RTS Department" : "Add RTS Department"}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? "Modify Department details" : "Create new dynamic form department"}
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
            form="rts-dept-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="rts-dept-form" onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
        <div>
          <StatusToggle
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            label="Department Status"
            activeText="Active"
            inactiveText="Inactive"
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Department Name (English)"
            name="departmentName"
            value={formData.departmentName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("departmentName") ? errors.departmentName : undefined}
            required
            placeholder="e.g. Health & Sanitation"
          />

          <Input
            label="Department Name (Marathi/Local)"
            name="departmentNameLocal"
            value={formData.departmentNameLocal}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="उदा. आरोग्य विभाग"
          />

          <Input
            label="Department Icon (Lucide Icon Name)"
            name="departmentIcon"
            value={formData.departmentIcon}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Heart, Baby, ShieldAlert"
          />

          <Input
            label="Display Order"
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
