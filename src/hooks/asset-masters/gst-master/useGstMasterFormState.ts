"use client";

import { useState, useMemo } from "react";
import type { GstMaster, GstMasterFormModel } from "@/types/asset-masters/gst-master.types";

interface UseGstMasterFormStateProps {
  initialData: GstMaster | null;
}

export function useGstMasterFormState({ initialData }: UseGstMasterFormStateProps) {
  const isEdit = initialData?.id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [open, setOpen] = useState(true);

  const initialFormData = useMemo<GstMasterFormModel>(() => ({
    id: initialData?.id ?? null,
    taxCode: initialData?.taxCode ?? "",
    taxName: initialData?.taxName ?? "",
    taxPercentage: initialData?.taxPercentage ?? "",
    effectiveFromDate: initialData?.effectiveFromDate?.slice(0, 10) ?? "",
    effectiveToDate: initialData?.effectiveToDate?.slice(0, 10) ?? "",
    isActive: initialData?.isActive ?? true,
  }), [initialData]);

  const [formData, setFormData] = useState<GstMasterFormModel>({
    ...initialFormData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GstMasterFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    setIsSubmitting,
    submittedOnce,
    setSubmittedOnce,
    open,
    setOpen,
    isEdit,
    initialFormData,
  };
}
