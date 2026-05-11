"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Droplets } from "lucide-react";
import { toast } from "sonner";
import { CancelButton, SaveButton } from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations } from "next-intl";
import type {
  WaterConnection,
  WaterConnectionFormModel,
  TapSizeValue,
  ConnectionType,
} from "@/types/waterconnection.types";
import { TAP_SIZE_RATES } from "@/types/waterconnection.types";
import { StatusToggleCard } from "../taxzonemaster/StatusToggleCard";
import { MandatoryFieldsNotice } from "../taxzonemaster/MandatoryFieldsNotice";
import { ConnectionFormFields } from "./ConnectionFormFields";

const EMPTY_FORM: WaterConnectionFormModel = {
  connectionNo: "",
  meterNo: "",
  type: "Domestic",
  tapSize: "15 Inch",
  applicableRate: TAP_SIZE_RATES["15 Inch"],
  installDate: new Date().toISOString().slice(0, 10),
  isActive: true,
};

interface AddConnectionDrawerProps {
  open: boolean;
  editingConnection: WaterConnection | null;
  onClose: () => void;
  onSave: (data: WaterConnectionFormModel) => void;
}

export function AddConnectionDrawer({
  open,
  editingConnection,
  onClose,
  onSave,
}: AddConnectionDrawerProps) {
  const isEdit = editingConnection != null;
  const t = useTranslations("waterConnection");
  const tCommon = useTranslations("common");

  const [formData, setFormData] = useState<WaterConnectionFormModel>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing connection changes
  useEffect(() => {
    if (editingConnection) {
      setFormData({
        id: editingConnection.id,
        connectionNo: editingConnection.connectionNo,
        meterNo: editingConnection.meterNo,
        type: editingConnection.type as ConnectionType,
        tapSize: editingConnection.tapSize as TapSizeValue,
        applicableRate: editingConnection.applicableRate,
        installDate: editingConnection.installDate,
        isActive: editingConnection.isActive,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    setTouched({});
  }, [editingConnection, open]);

  const validate = useCallback(
    (data: WaterConnectionFormModel): Record<string, string> => {
      const e: Record<string, string> = {};
      if (!data.connectionNo.trim())
        e.connectionNo = t("form.validation.connectionNoRequired");
      if (!data.meterNo.trim())
        e.meterNo = t("form.validation.meterNoRequired");
      if (!data.type) e.type = t("form.validation.typeRequired");
      if (!data.tapSize) e.tapSize = t("form.validation.tapSizeRequired");
      if (!data.installDate) e.installDate = t("form.validation.installDateRequired");
      return e;
    },
    [t]
  );

  const showError = (field: keyof WaterConnectionFormModel) =>
    !!touched[field] && !!errors[field];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "tapSize") {
        updated.applicableRate = TAP_SIZE_RATES[value as TapSizeValue] ?? 0;
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate({ ...formData, [name]: value } as WaterConnectionFormModel);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] ?? "" }));
  };

  const handleToggleStatus = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ connectionNo: true, meterNo: true, type: true, tapSize: true, installDate: true });
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length) {
      toast.error(t("form.validation.fixErrors"));
      return;
    }
    setIsSubmitting(true);
    try {
      onSave(formData);
      toast.success(isEdit ? t("form.messages.updateSuccess") : t("form.messages.createSuccess"));
      onClose();
    } catch {
      toast.error(t("form.messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      className="border-l-4 border-[#4F6A94]"
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <Droplets size={20} />
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
          <CancelButton label={t("form.actions.cancel")} onClick={onClose} />
          <SaveButton
            label={isEdit ? t("form.actions.update") : t("form.actions.add")}
            type="submit"
            form="wc-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="wc-form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            activeLabel={t("form.status.active")}
            inactiveLabel={t("form.status.inactive")}
            statusLabel={t("form.status.label")}
          />
        )}

        <ConnectionFormFields
          formData={formData}
          errors={errors}
          showError={showError}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          onBlur={handleBlur}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
