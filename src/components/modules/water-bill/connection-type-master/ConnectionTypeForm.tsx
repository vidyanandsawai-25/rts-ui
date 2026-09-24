"use client";

import { Droplets } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common/ActionButtons";
import { Input } from "@/components/common/Input";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, X } from "lucide-react";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import { useConnectionTypeForm } from "@/hooks/water-bill/connection-type-master";
import type { ConnectionType } from "@/types/waterBill/connectionTypeMaster.types";

export interface ConnectionTypeFormProps {
  id: number | null;
  initialData?: ConnectionType;
}

export function ConnectionTypeForm({ id, initialData }: Readonly<ConnectionTypeFormProps>) {
  const {
    isEdit,
    open,
    isSubmitting,
    formData,
    errors,
    showError,
    handleChange,
    handleBlur,
    handleClose,
    handleSubmit,
    t,
    tCommon
  } = useConnectionTypeForm(id, initialData);

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Droplets size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("drawer.editTitle") : t("drawer.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("drawer.editSubtitle") : t("drawer.addSubtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? tCommon("buttons.edit") : tCommon("buttons.save")}
            type="submit"
            form="connection-type-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="connection-type-form"
        onSubmit={handleSubmit}
        className="space-y-5 bg-[#F8FAFF] p-5"
        noValidate
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#DCEAFF] bg-white p-4">
            <div
              className={cn(
                "rounded-xl p-3 flex items-center justify-between",
                formData.isActive
                  ? "border border-blue-200 bg-[#F0F6FF]"
                  : "border border-gray-200 bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-full",
                    formData.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-900"
                  )}
                >
                  {formData.isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {t("form.connectionStatusTitle") || "Connection Status"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.isActive 
                      ? t("form.activeStatusOn") || "Active - Connection is enabled"
                      : t("form.activeStatusOff") || "Inactive - Connection is disabled"}
                  </div>
                </div>
              </div>
              <ToggleSwitch
                checked={formData.isActive}
                onChange={(checked) => handleChange("isActive", checked)}
                showPopup={false}
              />
            </div>
            <ValidationMessage
              message={errors.isActive}
              visible={!!errors.isActive}
            />
          </div>

          <div>
            <Input
              label={t("form.connectionTypeCode.label") || "Connection Type Code"}
              required
              id="connection-type-code"
              maxLength={30}
              value={formData.connectionTypeCode ?? ""}
              onChange={(e) => handleChange("connectionTypeCode", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("connectionTypeCode")}
              placeholder={t("form.connectionTypeCode.placeholder") || "e.g., RES"}
              aria-invalid={showError("connectionTypeCode") ? "true" : "false"}
              aria-describedby={showError("connectionTypeCode") ? "connection-type-code-error" : undefined}
            />
            <ValidationMessage
              id="connection-type-code-error"
              message={errors.connectionTypeCode}
              visible={showError("connectionTypeCode")}
            />
          </div>

          <div>
            <Input
              label={t("form.connectionType.label") || "Connection Type"}
              required
              id="connection-type"
              maxLength={100}
              value={formData.connectionType}
              onChange={(e) => handleChange("connectionType", e.target.value)}
              onBlur={() => handleBlur("connectionType")}
              placeholder={t("form.connectionType.placeholder") || "e.g., Residential"}
              aria-invalid={showError("connectionType") ? "true" : "false"}
              aria-describedby={showError("connectionType") ? "connection-type-error" : undefined}
            />
            <ValidationMessage
              id="connection-type-error"
              message={errors.connectionType}
              visible={showError("connectionType")}
            />
          </div>

          <div>
            <Input
              label={t("form.description.label") || "Description"}
              required
              id="description"
              maxLength={300}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder={t("form.description.placeholder") || "e.g., Standard home connection"}
              aria-invalid={showError("description") ? "true" : "false"}
              aria-describedby={showError("description") ? "description-error" : undefined}
            />
            <ValidationMessage
              id="description-error"
              message={errors.description}
              visible={showError("description")}
            />
          </div>
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory") || "* Indicates mandatory fields"} />
      </form>
    </Drawer>
  );
}
