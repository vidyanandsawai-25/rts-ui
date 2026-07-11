"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type {
  WaterConnection,
  WaterConnectionFormModel,
  WaterConnectionTypeLookup,
  WaterConnectionSizeLookup,
  WaterConnectionStatusLookup,
  WaterRateMasterLookup,
} from "@/types/waterconnection.types";
import { findApplicableRate } from "./applicableRateHelper";

function makeEmptyForm(propertyId: number): WaterConnectionFormModel {
  return {
    propertyId,
    connectionNo: "",
    meterNo: "",
    waterConnectionTypeId: "",
    waterConnectionSizeId: "",
    waterConnectionStatusId: null,
    installDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  };
}

interface UseConnectionFormParams {
  open: boolean;
  propertyId: number;
  editingConnection: WaterConnection | null;
  initialTypeOptions: WaterConnectionTypeLookup[];
  initialSizeOptions: WaterConnectionSizeLookup[];
  initialStatusOptions: WaterConnectionStatusLookup[];
  initialRateMasters: WaterRateMasterLookup[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onSaved: () => void;
  onClose: () => void;
  saveWaterConnectionAction: (data: WaterConnectionFormModel) => Promise<{ ok: boolean; error?: string }>;
}

export function useConnectionForm({
  open,
  propertyId,
  editingConnection,
  initialTypeOptions: typeOptions,
  initialSizeOptions: sizeOptions,
  initialStatusOptions: statusOptions,
  initialRateMasters: rateMasters,
  t,
  onSaved,
  onClose,
  saveWaterConnectionAction,
}: UseConnectionFormParams) {
  const isEdit = editingConnection != null;

  const [formData, setFormData] = useState<WaterConnectionFormModel>(() => {
    if (editingConnection) {
      return {
        id: editingConnection.id,
        propertyId,
        connectionNo: editingConnection.connectionNo,
        meterNo: editingConnection.meterNo ?? "",
        waterConnectionTypeId: editingConnection.waterConnectionTypeId,
        waterConnectionSizeId: editingConnection.waterConnectionSizeId,
        waterConnectionStatusId: editingConnection.waterConnectionStatusId ?? null,
        installDate: editingConnection.installDate ?? editingConnection.connectionStartDate ?? "",
        isActive: editingConnection.isActive,
      };
    }
    return makeEmptyForm(propertyId);
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Re-initialise the form whenever the target connection or open state changes
  const formInitKey = `${editingConnection?.id ?? "new"}-${String(open)}-${propertyId}`;
  const [prevFormInitKey, setPrevFormInitKey] = useState(formInitKey);
  if (prevFormInitKey !== formInitKey) {
    setPrevFormInitKey(formInitKey);
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
      });
    } else {
      setFormData(makeEmptyForm(propertyId));
    }
    setErrors({});
    setTouched({});
  }

  // applicableRate is display-only
  const { rate: applicableRate, notFound: rateNotFound } = useMemo(
    () => findApplicableRate(formData.waterConnectionTypeId, formData.waterConnectionSizeId, rateMasters),
    [formData.waterConnectionTypeId, formData.waterConnectionSizeId, rateMasters]
  );
  const rateError = rateNotFound ? t("form.validation.rateNotFound") : null;

  const validate = useCallback(
    (data: WaterConnectionFormModel): Record<string, string> => {
      const e: Record<string, string> = {};
      if (!data.connectionNo.trim()) {
        e.connectionNo = t("form.validation.connectionNoRequired");
      } else if (/[a-z]/.test(data.connectionNo)) {
        e.connectionNo = "Only uppercase letters (A–Z) are allowed.";
      } else if (!/^[A-Z0-9\-]+$/.test(data.connectionNo)) {
        e.connectionNo = t("form.validation.connectionNoInvalidChars");
      } else if (data.connectionNo.trim().length > 20) {
        e.connectionNo = t("form.validation.connectionNoMaxLength");
      }

      if (!data.meterNo.trim()) {
        e.meterNo = t("form.validation.meterNoRequired");
      } else if (/[a-z]/.test(data.meterNo)) {
        e.meterNo = "Only uppercase letters (A–Z) are allowed.";
      } else if (!/^[A-Z0-9\-]+$/.test(data.meterNo)) {
        e.meterNo = t("form.validation.meterNoInvalidChars");
      } else if (data.meterNo.trim().length > 20) {
        e.meterNo = t("form.validation.meterNoMaxLength");
      }

      if (!data.waterConnectionTypeId)
        e.waterConnectionTypeId = t("form.validation.typeRequired");
      if (!data.waterConnectionSizeId)
        e.waterConnectionSizeId = t("form.validation.tapSizeRequired");
      if (!data.waterConnectionStatusId)
        e.waterConnectionStatusId = t("form.validation.statusRequired");
      if (!data.installDate) {
        e.installDate = t("form.validation.installDateRequired");
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;
        if (data.installDate > todayStr) {
          e.installDate = "Install Date cannot be in the future";
        }
      }
      return e;
    },
    [t]
  );

  const showError = (field: keyof WaterConnectionFormModel) =>
    !!touched[field] && !!errors[field];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === "connectionNo" || name === "meterNo") {
      // Allow only alphanumeric and dash
      sanitizedValue = value.replace(/[^a-zA-Z0-9\-]/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    if (name === "connectionNo" || name === "meterNo") {
      if (/[a-z]/.test(sanitizedValue)) {
        setErrors((prev) => ({ ...prev, [name]: "Only uppercase letters (A–Z) are allowed." }));
        setTouched((prev) => ({ ...prev, [name]: true }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return {
    isEdit,
    formData,
    errors,
    isSubmitting,
    typeOptions,
    sizeOptions,
    statusOptions,
    applicableRate,
    rateError,
    showError,
    handleChange,
    handleSelectChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
  };
}
