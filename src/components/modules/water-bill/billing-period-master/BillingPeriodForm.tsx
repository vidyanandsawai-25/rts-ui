"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";

import {
  Drawer,
  CancelButton,
  SaveButton,
} from "@/components/common";
import type {
  CreateBillingPeriodDto,
  BillingPeriodInput,
  BillingPeriodFormProps,
} from "@/types/waterBill/billingPeriodMaster.types";
import { BillingPeriodFormFields } from "./BillingPeriodFormFields";

const formatDateInputValue = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

export function BillingPeriodForm({
  open,
  initialData,
  financialYearOptions = [],
  billingFrequencyOptions = [],
  isSubmitting = false,
  onClose,
  onSubmit,
}: BillingPeriodFormProps) {
  const t = useTranslations("billingPeriodMaster");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initialData);

  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<BillingPeriodInput>({
    billingPeriodCode: initialData?.billingPeriodCode ?? "",
    financialYearId: initialData?.financialYearId !== undefined && initialData?.financialYearId !== null ? String(initialData.financialYearId) : "",
    billingFrequencyId: initialData?.billingFrequencyId !== undefined && initialData?.billingFrequencyId !== null ? String(initialData.billingFrequencyId) : "",
    periodFromDate: formatDateInputValue(initialData?.periodFromDate),
    periodToDate: formatDateInputValue(initialData?.periodToDate),
    billGenerationDate: formatDateInputValue(initialData?.billGenerationDate),
    dueDate: formatDateInputValue(initialData?.dueDate),
    graceDays: initialData?.graceDays !== undefined && initialData?.graceDays !== null ? initialData.graceDays : "",
    currentPenaltyStartDate: formatDateInputValue(initialData?.currentPenaltyStartDate),
    currentPenaltyEndDate: formatDateInputValue(initialData?.currentPenaltyEndDate),
    pendingPenaltyStartDate: formatDateInputValue(initialData?.pendingPenaltyStartDate),
    pendingPenaltyEndDate: formatDateInputValue(initialData?.pendingPenaltyEndDate),
    isReadingApprovalRequired: initialData?.isReadingApprovalRequired ?? false,
    sequenceNo: initialData?.sequenceNo !== undefined && initialData?.sequenceNo !== null ? initialData.sequenceNo : "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof BillingPeriodInput, boolean>>>({});

  const validate = useCallback(
    (data: BillingPeriodInput) => {
      const errs: Partial<Record<keyof BillingPeriodInput, string>> = {};

      const fyId = Number(data.financialYearId);
      if (!fyId || isNaN(fyId) || fyId <= 0) {
        errs.financialYearId = t("validation.financialYearRequired");
      }

      const bfId = Number(data.billingFrequencyId);
      if (!bfId || isNaN(bfId) || bfId <= 0) {
        errs.billingFrequencyId = t("validation.billingFrequencyRequired");
      }

      if (!data.periodFromDate) {
        errs.periodFromDate = t("validation.periodFromDateRequired");
      }

      if (!data.periodToDate) {
        errs.periodToDate = t("validation.periodToDateRequired");
      } else if (data.periodFromDate && new Date(data.periodToDate) <= new Date(data.periodFromDate)) {
        errs.periodToDate = t("validation.periodToDateAfterFromDate");
      }

      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof BillingPeriodInput) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof BillingPeriodInput, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof BillingPeriodInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (Object.keys(validate(formData)).length > 0) return;

    const toIsoOrNull = (dateStr?: string | null) => (dateStr && dateStr.trim() ? new Date(dateStr).toISOString() : null);

    const selectedFy = financialYearOptions.find((o) => o.value === String(formData.financialYearId))?.label || "FY";
    const selectedBf = billingFrequencyOptions.find((o) => o.value === String(formData.billingFrequencyId))?.label || "BP";
    const seq = formData.sequenceNo ? `-${formData.sequenceNo}` : "";
    const generatedCode = initialData?.billingPeriodCode || `${selectedFy}-${selectedBf}${seq}`.replace(/\s+/g, "").toUpperCase();

    const submissionData: CreateBillingPeriodDto = {
      billingPeriodCode: generatedCode,
      financialYearId: Number(formData.financialYearId),
      billingFrequencyId: Number(formData.billingFrequencyId),
      periodFromDate: new Date(formData.periodFromDate).toISOString(),
      periodToDate: new Date(formData.periodToDate).toISOString(),
      billGenerationDate: toIsoOrNull(formData.billGenerationDate),
      dueDate: toIsoOrNull(formData.dueDate),
      graceDays: Number(formData.graceDays) || 0,
      currentPenaltyStartDate: toIsoOrNull(formData.currentPenaltyStartDate),
      currentPenaltyEndDate: toIsoOrNull(formData.currentPenaltyEndDate),
      pendingPenaltyStartDate: toIsoOrNull(formData.pendingPenaltyStartDate),
      pendingPenaltyEndDate: toIsoOrNull(formData.pendingPenaltyEndDate),
      isReadingApprovalRequired: Boolean(formData.isReadingApprovalRequired),
      sequenceNo: Number(formData.sequenceNo) || 1,
      isActive: Boolean(formData.isActive),
    };
    onSubmit(submissionData);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <CalendarDays size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("editTitle") : t("addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("editSubtitle") : t("addSubtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={onClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={t("form.saveRecord")}
            type="submit"
            form="billing-period-form"
            isLoading={isSubmitting}
          />
        </div>
      }
    >
      <form id="billing-period-form" onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
        <BillingPeriodFormFields
          formData={formData}
          errors={errors}
          showError={showError}
          handleChange={handleChange}
          handleBlur={handleBlur}
          financialYearOptions={financialYearOptions}
          billingFrequencyOptions={billingFrequencyOptions}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
        />
      </form>
    </Drawer>
  );
}
