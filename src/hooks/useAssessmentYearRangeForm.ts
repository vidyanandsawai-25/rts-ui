"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  AssessmentYearRange,
  AssessmentYearRangeConfig,
  AssessmentYearRangeFormModel,
  getAssessmentYearRangeId,
} from "@/types/assessment-year-range.types";

interface UseAssessmentYearRangeFormProps {
  config: AssessmentYearRangeConfig;
  id: number | null;
  initialData?: AssessmentYearRange;
  createAction: (data: AssessmentYearRangeFormModel) => Promise<{ success: boolean; message?: string; statusCode?: number }>;
  updateAction: (data: AssessmentYearRangeFormModel) => Promise<{ success: boolean; message?: string; statusCode?: number }>;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function useAssessmentYearRangeForm({
  config,
  id,
  initialData,
  createAction,
  updateAction,
}: UseAssessmentYearRangeFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations(config.translationNamespace);
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const getInitialId = (): number | undefined => {
    if (id) return id;
    if (initialData) return getAssessmentYearRangeId(initialData);
    return undefined;
  };

  const [formData, setFormData] = useState<AssessmentYearRangeFormModel>({
    id: getInitialId(),
    fromYear: initialData?.fromYear ?? "",
    toYear: initialData?.toYear ?? "",
    isActive: initialData?.isActive ?? true,
    updatedBy: 1,
  });

  const [fromYearValue, setFromYearValue] = useState<string>(
    initialData?.fromYear?.toString() ?? ""
  );
  const [toYearValue, setToYearValue] = useState<string>(
    initialData?.toYear?.toString() ?? ""
  );

  const [errors, setErrors] = useState<Partial<Record<keyof AssessmentYearRangeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssessmentYearRangeFormModel): Partial<Record<keyof AssessmentYearRangeFormModel, string>> => {
      const newErrors: Partial<Record<keyof AssessmentYearRangeFormModel, string>> = {};
      const fromYear = Number(data.fromYear);
      const toYear = Number(data.toYear);

      // From Year validation
      if (!data.fromYear && data.fromYear !== 0) {
        newErrors.fromYear = t("form.validation.fromYearRequired");
      } else if (!Number.isFinite(fromYear) || !/^\d{4}$/.test(String(data.fromYear))) {
        newErrors.fromYear = t("form.validation.yearFormat");
      } else if (fromYear < MIN_YEAR || fromYear > MAX_YEAR) {
        newErrors.fromYear = t("form.validation.yearRange", { min: MIN_YEAR, max: MAX_YEAR });
      }

      // To Year validation
      if (!data.toYear && data.toYear !== 0) {
        newErrors.toYear = t("form.validation.toYearRequired");
      } else if (!Number.isFinite(toYear) || !/^\d{4}$/.test(String(data.toYear))) {
        newErrors.toYear = t("form.validation.yearFormat");
      } else if (toYear < MIN_YEAR || toYear > MAX_YEAR) {
        newErrors.toYear = t("form.validation.yearRange", { min: MIN_YEAR, max: MAX_YEAR });
      }

      // Cross-field validation: fromYear <= toYear
      if (!newErrors.fromYear && !newErrors.toYear && fromYear > toYear) {
        newErrors.fromYear = t("form.validation.fromYearGreaterThanToYear");
      }

      // Active status validation for new records
      if (!isEdit && !data.isActive) {
        newErrors.isActive = t("form.validation.mustBeActive");
      }

      return newErrors;
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof AssessmentYearRangeFormModel): boolean =>
      (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleYearChange = useCallback((field: "fromYear" | "toYear", value: string): void => {
    // Only allow digits and limit to 4 characters
    const sanitized = value.replace(/\D/g, "").slice(0, 4);
    
    if (field === "fromYear") {
      setFromYearValue(sanitized);
      setFormData((p) => ({
        ...p,
        fromYear: sanitized === "" ? "" : Number(sanitized),
      }));
    } else {
      setToYearValue(sanitized);
      setFormData((p) => ({
        ...p,
        toYear: sanitized === "" ? "" : Number(sanitized),
      }));
    }
  }, []);

  const handleBlur = useCallback(
    (field: "fromYear" | "toYear"): void => {
      setTouched((p) => ({ ...p, [field]: true }));

      const updatedFormData = { ...formData };
      const fieldErrors = validate(updatedFormData);
      
      setErrors((p) => {
        const newErrors = { ...p };
        if (fieldErrors[field]) {
          newErrors[field] = fieldErrors[field];
        } else {
          delete newErrors[field];
        }
        // Also update cross-field errors
        if (field === "toYear" && fieldErrors.fromYear) {
          newErrors.fromYear = fieldErrors.fromYear;
        }
        return newErrors;
      });
    },
    [formData, validate]
  );

  const mapApiError = useCallback(
    (result: { statusCode?: number; message?: string }) => {
      const errorMap: Record<number, string> = {
        409: t("apiErrors.duplicateRecord"),
        404: t("apiErrors.notFound"),
        401: tCommon("errors.unauthorized"),
        403: tCommon("errors.unauthorized"),
      };

      const code = result.statusCode ?? 0;
      if (errorMap[code]) return errorMap[code];

      if (code === 400) {
        const msg = result.message?.toLowerCase() || "";
        if (msg.includes("duplicate") || msg.includes("already exists") || msg.includes("overlap")) {
          return t("apiErrors.duplicateRecord");
        }
        return result.message || t("apiErrors.invalidData");
      }

      if (code >= 500) return tCommon("errors.serverError");
      return result.message || t("apiErrors.operationFailed");
    },
    [t, tCommon]
  );

  const [open, setOpen] = useState(true);
  const [, startTransition] = React.useTransition();

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}${config.routePath}`);
      });
    }, 400);
  }, [router, locale, config.routePath]);

  const handleCancel = useCallback(() => {
    closeAndRoute();
  }, [closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateAction(formData)
        : await createAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(
        isEdit
          ? t("success.updated", { fromYear: formData.fromYear, toYear: formData.toYear })
          : t("success.created", { fromYear: formData.fromYear, toYear: formData.toYear })
      );

      startTransition(() => {
        router.refresh();
        closeAndRoute();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((): void => {
    setIsActive((prev) => {
      const newValue = !prev;
      setFormData((p) => ({ ...p, isActive: newValue }));
      return newValue;
    });
  }, []);

  return {
    formData,
    fromYearValue,
    toYearValue,
    errors,
    isSubmitting,
    isActive,
    open,
    setOpen,
    handleYearChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  };
}
