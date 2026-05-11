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
  WaterConnectionTypeLookup,
  WaterConnectionSizeLookup,
  WaterConnectionStatusLookup,
  WaterRateMasterLookup,
} from "@/types/waterconnection.types";
import {
  saveWaterConnectionAction,
  getConnectionLookupsAction,
} from "@/app/[locale]/property-tax/waterconnection/action";
import { StatusToggleCard } from "../taxzonemaster/StatusToggleCard";
import { MandatoryFieldsNotice } from "../taxzonemaster/MandatoryFieldsNotice";
import { ConnectionFormFields } from "./ConnectionFormFields";
import { findApplicableRate } from "./applicableRateHelper";

function makeEmptyForm(propertyId: number): WaterConnectionFormModel {
  return {
    propertyId,
    connectionNo: "",
    meterNo: "",
    waterConnectionTypeId: "",
    waterConnectionSizeId: "",
    installDate: new Date().toISOString().slice(0, 10),
    isActive: true,
    applicableRate: null,
  };
}

interface AddConnectionDrawerProps {
  open: boolean;
  propertyId: number;
  editingConnection: WaterConnection | null;
  typeOptions: WaterConnectionTypeLookup[];
  sizeOptions: WaterConnectionSizeLookup[];
  statusOptions: WaterConnectionStatusLookup[];
  rateMasters: WaterRateMasterLookup[];
  onClose: () => void;
  onSaved: () => void;
}

export function AddConnectionDrawer({
  open,
  propertyId,
  editingConnection,
  typeOptions: initialTypeOptions,
  sizeOptions: initialSizeOptions,
  statusOptions: initialStatusOptions,
  rateMasters: initialRateMasters,
  onClose,
  onSaved,
}: AddConnectionDrawerProps) {
  const isEdit = editingConnection != null;
  const t = useTranslations("waterConnection");
  const tCommon = useTranslations("common");

  const [typeOptions, setTypeOptions] = useState(initialTypeOptions);
  const [sizeOptions, setSizeOptions] = useState(initialSizeOptions);
  const [statusOptions, setStatusOptions] = useState(initialStatusOptions);
  const [rateMasters, setRateMasters] = useState(initialRateMasters);

  const [formData, setFormData] = useState<WaterConnectionFormModel>(() => makeEmptyForm(propertyId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getConnectionLookupsAction().then(({ typeOptions: t, sizeOptions: s, statusOptions: st, rateMasters: rm }) => {
      setTypeOptions(t);
      setSizeOptions(s);
      setStatusOptions(st);
      setRateMasters(rm);
    });
  }, [open]);

  // Auto-compute applicable rate whenever type or size selection changes
  useEffect(() => {
    const { rate, notFound } = findApplicableRate(
      formData.waterConnectionTypeId,
      formData.waterConnectionSizeId,
      rateMasters
    );
    setFormData((prev) => ({ ...prev, applicableRate: rate }));
    setRateError(notFound ? t("form.validation.rateNotFound") : null);
  }, [formData.waterConnectionTypeId, formData.waterConnectionSizeId, rateMasters, t]);

  useEffect(() => {
    if (editingConnection) {
      setFormData({
        id: editingConnection.id,
        propertyId,
        connectionNo: editingConnection.connectionNo,
        meterNo: editingConnection.meterNo ?? "",
        waterConnectionTypeId: editingConnection.waterConnectionTypeId,
        waterConnectionSizeId: editingConnection.waterConnectionSizeId,
        waterConnectionStatusId: editingConnection.waterConnectionStatusId ?? null,
        installDate: editingConnection.installDate ?? editingConnection.connectionStartDate ?? "",
        isActive: editingConnection.isActive,
        applicableRate: editingConnection.applicableRate ?? null,
      });
    } else {
      setFormData(makeEmptyForm(propertyId));
    }
    setErrors({});
    setTouched({});
    setRateError(null);
  }, [editingConnection, open, propertyId]);

  const validate = useCallback(
    (data: WaterConnectionFormModel): Record<string, string> => {
      const e: Record<string, string> = {};
      if (!data.connectionNo.trim())
        e.connectionNo = t("form.validation.connectionNoRequired");
      if (!data.waterConnectionTypeId)
        e.waterConnectionTypeId = t("form.validation.typeRequired");
      if (!data.waterConnectionSizeId)
        e.waterConnectionSizeId = t("form.validation.tapSizeRequired");
      if (!data.installDate)
        e.installDate = t("form.validation.installDateRequired");
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === "waterConnectionStatusId"
        ? (value === "" ? null : Number(value))
        : (name === "waterConnectionTypeId" || name === "waterConnectionSizeId")
          ? (value === "" ? "" : Number(value))
          : value,
    }));
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
    setTouched({
      connectionNo: true,
      waterConnectionTypeId: true,
      waterConnectionSizeId: true,
      installDate: true,
    });
    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length) {
      toast.error(t("form.validation.fixErrors"));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await saveWaterConnectionAction(formData);
      if (!result.ok) {
        toast.error(result.error ?? t("form.messages.error"));
        return;
      }
      toast.success(isEdit ? t("form.messages.updateSuccess") : t("form.messages.createSuccess"));
      onSaved();
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
          typeOptions={typeOptions}
          sizeOptions={sizeOptions}
          statusOptions={statusOptions}
          applicableRate={formData.applicableRate ?? null}
          rateError={rateError}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
