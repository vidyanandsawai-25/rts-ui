"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Input } from "@/components/common";
import { StatusToggle } from "@/components/common/StatusToggle";
import { RtsServiceApiItem } from "@/types/rts/service.types";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { useRtsServiceForm } from "@/hooks/rts/services/useRtsServiceForm";

export interface RtsServiceFormProps {
  editingService: RtsServiceApiItem | null;
  departments: RtsDepartmentApiItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RtsServiceForm({
  editingService,
  departments,
  onSuccess,
  onCancel,
}: RtsServiceFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleToggleFees,
    handleCancel,
    showError,
    isEdit,
  } = useRtsServiceForm({
    editingService,
    onSuccess,
    onClose: onCancel,
  });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#10B981]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-emerald-500 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-950">
              {isEdit ? "Edit RTS Service" : "Add RTS Service"}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? "Modify SLA, Fees and Service details" : "Add a new dynamic form service"}
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
            form="rts-service-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="rts-service-form" onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
        <div className="flex gap-4 items-center">
          <StatusToggle
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            label="Service Status"
            activeText="Active"
            inactiveText="Inactive"
          />
          <StatusToggle
            isActive={formData.isFeesRequired}
            onToggle={handleToggleFees}
            label="Fees Required"
            activeText="Paid Service"
            inactiveText="Free Service"
          />
        </div>

        <div className="space-y-4">
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
              <option value="">-- Choose Department --</option>
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

          <Input
            label="Service Name (English)"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError("serviceName") ? errors.serviceName : undefined}
            required
            placeholder="e.g. Issuance of Birth Certificate"
          />

          <Input
            label="Service Name (Marathi/Local)"
            name="serviceNameLocal"
            value={formData.serviceNameLocal}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="उदा. जन्म प्रमाणपत्र देणे"
          />

          <Input
            label="Service Code (URL Path Segment)"
            name="serviceUrl"
            value={formData.serviceUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. birth-certificate"
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Brief details about the service"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SLA Limit (Days)"
              name="sla"
              type="number"
              value={String(formData.sla)}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="15"
            />

            <Input
              label="Service Fee (INR)"
              name="fees"
              type="number"
              value={String(formData.fees)}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!formData.isFeesRequired}
              placeholder="0"
            />
          </div>

          <Input
            label="Service Icon (Lucide Icon Name)"
            name="serviceIcon"
            value={formData.serviceIcon}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Sparkles, FileText, ClipboardList"
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
