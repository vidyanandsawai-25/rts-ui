"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
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
}

export function useConnectionForm({
  open,
  propertyId,
  editingConnection,
  initialTypeOptions,
  initialSizeOptions,
  initialStatusOptions,
  initialRateMasters,
  t,
  onSaved,
  onClose,
}: UseConnectionFormParams) {
  const isEdit = editingConnection != null;

  const [typeOptions, setTypeOptions] = useState(initialTypeOptions);
  const [sizeOptions, setSizeOptions] = useState(initialSizeOptions);
  const [statusOptions, setStatusOptions] = useState(initialStatusOptions);
  const [rateMasters, setRateMasters] = useState(initialRateMasters);

  const [formData, setFormData] = useState<WaterConnectionFormModel>(() => makeEmptyForm(propertyId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch fresh lookups each time the drawer opens
  useEffect(() => {
    if (!open) return;
    getConnectionLookupsAction().then(({ typeOptions: t, sizeOptions: s, statusOptions: st, rateMasters: rm }) => {
      setTypeOptions(t);
      setSizeOptions(s);
      setStatusOptions(st);
      setRateMasters(rm);
    });
  }, [open]);

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
      if (!data.connectionNo.trim())
        e.connectionNo = t("form.validation.connectionNoRequired");
      else if (/[@#$%^&*()_]/.test(data.connectionNo))
        e.connectionNo = t("form.validation.connectionNoInvalidChars");
      if (!data.meterNo.trim())
        e.meterNo = t("form.validation.meterNoRequired");
      else if (/[@#$%^&*()_]/.test(data.meterNo))
        e.meterNo = t("form.validation.meterNoInvalidChars");
      if (!data.waterConnectionTypeId)
        e.waterConnectionTypeId = t("form.validation.typeRequired");
      if (!data.waterConnectionSizeId)
        e.waterConnectionSizeId = t("form.validation.tapSizeRequired");
      if (!data.waterConnectionStatusId)
        e.waterConnectionStatusId = t("form.validation.statusRequired");
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
    let sanitizedValue = value;
    if (name === "connectionNo" || name === "meterNo") {
      sanitizedValue = value.replace(/[@#$%^&*()_]/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
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
