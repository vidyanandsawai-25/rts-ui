"use client";

import { useEffect, useRef } from "react";
import { Briefcase as DesignationIcon } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common";
import { StatusToggleCard } from "./StatusToggleCard";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import { DesignationFormFields } from "./DesignationFormFields";
import type { Designation, OwningDepartment } from "@/types/asset-masters/designation.types";
import { useDesignationForm } from "@/hooks/asset-masters/designation/useDesignationForm";

export interface DesignationFormProps {
  id: number | null;
  initialData?: Designation;
  departments: OwningDepartment[];
}

export default function DesignationForm({
  id,
  initialData,
  departments,
}: DesignationFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    isActive,
    open,
    handleChange,
    handleBlur,
    handleSelectChange,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  } = useDesignationForm({
    id,
    initialData,
  });

  const statusToggleRef = useRef<HTMLButtonElement>(null);
  const designationCodeRef = useRef<HTMLInputElement>(null);

  const departmentOptions = departments.map((dept) => ({
    label: dept.owningDepartmentName,
    value: String(dept.id),
  }));

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (isEdit && statusToggleRef.current) {
          statusToggleRef.current.focus();
        } else if (!isEdit && designationCodeRef.current) {
          designationCodeRef.current.focus();
        }
      }, 150);
    }
  }, [open, isEdit]);

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <DesignationIcon size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") : t("form.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("form.editSubtitle") : t("form.subtitle")}
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
            label={isEdit ? t("form.actions.update") : t("form.actions.save")}
            type="submit"
            form="form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            statusToggleRef={statusToggleRef}
            isActive={isActive}
            handleToggleStatus={handleToggleStatus}
            statusLabel={t("form.status.label")}
            statusDescription={t("form.status.description")}
            activeText={tCommon("status.active")}
            inactiveText={tCommon("status.inactive")}
            errorMessage={errors.isActive}
          />
        )}

        <DesignationFormFields
          designationCodeRef={designationCodeRef}
          formData={formData}
          errors={errors}
          showError={showError}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSelectChange={handleSelectChange}
          departmentOptions={departmentOptions}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
