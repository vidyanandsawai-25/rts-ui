"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, X, Calendar, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/common/Input";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { AssessmentYearRV, AssessmentYearFormRVProps } from "@/types/assessmentYearMaster.types";
import { cn } from "@/lib/utils/cn";
import { CancelButton, Drawer, SaveButton } from "@/components/common";
import { createAssessmentYearAction, updateAssessmentYearAction, checkAssessmentYearOverlap } from "@/app/[locale]/property-tax/assessment-year-range/rateablevalue/action";

export default function AssessmentYearForm({ open, onClose, onSuccess, initialData }: AssessmentYearFormRVProps) {
  const router = useRouter();
  const t = useTranslations("AssessmentYearMasterRV");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData;

  const initial = useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        fromYear: initialData.fromYear,
        toYear: initialData.toYear,
        isActive: initialData.isActive
      };
    }
    return {
      fromYear: undefined,
      toYear: undefined,
      isActive: true
    };
  }, [initialData]);

  const [formData, setFormData] = useState<Partial<AssessmentYearRV>>(initial);

  useEffect(() => {
    setFormData(initial);
    setErrors({});
  }, [initial]);

  const validate = async () => {
    const newErrors: Record<string, string> = {};
    const yearRegex = /^\d{4}$/;

    if (!formData.fromYear) {
      newErrors.fromYear = t("fromYearRequired");
    } else if (!yearRegex.test(formData.fromYear.toString())) {
      newErrors.fromYear = t("fromYearFourDigits");
    }

    if (!formData.toYear) {
      newErrors.toYear = t("toYearRequired");
    } else if (!yearRegex.test(formData.toYear.toString())) {
      newErrors.toYear = t("toYearFourDigits");
    }

    if (formData.fromYear && formData.toYear && !newErrors.fromYear && !newErrors.toYear) {
        if (formData.fromYear >= formData.toYear) {
            newErrors.toYear = t("toYearGreater");
        } else {
             // Overlap Check (Server Action)
             const result = await checkAssessmentYearOverlap(
                formData.fromYear,
                formData.toYear,
                initialData?.yearId
             );

             if (result.hasOverlap) {
                 newErrors.fromYear = t("overlapError");
                 newErrors.toYear = t("overlapError");
             }
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate first (async)
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      const result = isEdit 
        ? await updateAssessmentYearAction(formData as AssessmentYearRV)
        : await createAssessmentYearAction(formData);

      if (result.success) {
        toast.success(isEdit ? t("recordUpdated") : t("recordInserted"));
        onSuccess?.();
        handleClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center 
        bg-gradient-to-br from-blue-500 to-blue-600 
        rounded-lg text-white">
            <Calendar size={20} />
          </div>

          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("formTitleEdit") : t("formTitleAdd")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("formSubtitleEdit") : t("formSubtitleAdd")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label={t("cancel")} onClick={handleClose} />
          <SaveButton
            label={isEdit ? t("update") : t("save")}
            type="submit"
            form="assessment-year-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="assessment-year-form" onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
         {/* Form Fields */}
         <div className="space-y-4 p-6">        
              {isEdit && (
                <div className="rounded-xl border border-[#DCEAFF] bg-white p-4 mb-4">
                  <div
                    className={cn(
                      "rounded-xl p-2 flex items-center justify-between transition-colors",
                      formData.isActive
                        ? "border border-blue-200 bg-[#F0F6FF]"
                        : "border border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          formData.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-500"
                        )}
                      >
                        {formData.isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                      </div>

                      <div>
                        <div className={cn("font-medium", formData.isActive ? "text-[#1E3A8A]" : "text-gray-700")}>
                          {t("activeStatusLabel")}
                        </div>
                        <div className={cn("text-sm", formData.isActive ? "text-gray-500" : "text-gray-400")}>
                          {formData.isActive ? t("activeNow") : t("inactiveNow")}
                        </div>
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={!!formData.isActive}
                      onChange={() => setFormData((prev: Partial<AssessmentYearRV>) => ({ ...prev, isActive: !prev.isActive }))}
                      showPopup={false}
                    />

                    
                  </div>
                </div>
              )}

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("fromYearLabel")} <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  name="fromYear"
                  value={formData.fromYear?.toString() ?? ""}
                  onChange={(e) => setFormData({...formData, fromYear: e.target.value === "" ? undefined : Number(e.target.value)})}
                  error={errors.fromYear}
                  placeholder={t("fromYearPlaceholder")}
                  fullWidth
                />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("toYearLabel")} <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  name="toYear"
                  value={formData.toYear?.toString() ?? ""}
                  onChange={(e) => setFormData({...formData, toYear: e.target.value === "" ? undefined : Number(e.target.value)})}
                  error={errors.toYear}
                  placeholder={t("toYearPlaceholder")}
                  fullWidth
                />
             </div>

               <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 mb-4">
              <AlertCircle size={16} />
              <span>{t("requiredFieldsNote")}</span>
            </div>
         </div>
      </form>
    </Drawer>
  );
}
