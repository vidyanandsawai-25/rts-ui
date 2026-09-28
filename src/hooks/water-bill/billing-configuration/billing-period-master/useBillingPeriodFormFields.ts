import { useTranslations } from "next-intl";
import { useToast } from "@/components/common";
import type {
  BillingPeriodInput,
  BillingPeriodMaster,
  DropdownOption,
} from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";
import {
  MAX_GRACE_DAYS,
  addDays,
  diffDays,
  getFrequencyPeriodsPerYear,
  calculatePeriodToDate,
  calculateNextPeriodFromDate,
  calculateBillingPeriodSequenceNo,
} from "../../../../lib/utils/water-bill/billing-configuration/billingPeriodCalculation.utils";
import { useBillingPeriodPenaltyHandlers } from "./useBillingPeriodPenaltyHandlers";

export {
  MAX_GRACE_DAYS,
  addDays,
  diffDays,
  getFrequencyPeriodsPerYear,
  calculatePeriodToDate,
  calculateBillingPeriodSequenceNo,
};

interface UseBillingPeriodFormFieldsParams {
  formData: BillingPeriodInput;
  financialYearOptions?: DropdownOption[];
  billingFrequencyOptions?: DropdownOption[];
  existingPeriods?: BillingPeriodMaster[];
  isEdit?: boolean;
  handleChange: (field: keyof BillingPeriodInput, value: string | number | boolean) => void;
  handleUpdate: (updates: Partial<BillingPeriodInput>) => void;
}

export function useBillingPeriodFormFields({
  formData,
  financialYearOptions = [],
  billingFrequencyOptions = [],
  existingPeriods = [],
  isEdit = false,
  handleChange,
  handleUpdate,
}: UseBillingPeriodFormFieldsParams) {
  const t = useTranslations("billingPeriodMaster");
  const { error } = useToast();

  const penaltyHandlers = useBillingPeriodPenaltyHandlers({
    formData,
    handleChange,
    handleUpdate,
  });

  const getYearStartDate = (fyId: string | number): string => {
    const selected = financialYearOptions.find((o) => o.value === String(fyId));
    if (!selected) return "";
    if (selected.data?.startDate) return String(selected.data.startDate).split("T")[0];
    if (selected.data?.year) return `${selected.data.year}-04-01`;
    const match = (selected.label || "").match(/\d{4}/);
    return match ? `${match[0]}-04-01` : "";
  };

  const handleYearChange = (val: string) => {
    const id = val ? Number(val) : "";
    if (!id) {
      handleUpdate({
        financialYearId: "",
        periodFromDate: "",
        periodToDate: "",
        dueDate: "",
        currentPenaltyStartDate: "",
      });
      return;
    }

    const yearStart = getYearStartDate(id);

    if (!formData.billingFrequencyId) {
      handleUpdate({
        financialYearId: id,
        periodFromDate: yearStart,
        periodToDate: "",
        dueDate: "",
        currentPenaltyStartDate: "",
      });
      return;
    }

    const fromDate = calculateNextPeriodFromDate(
      yearStart,
      existingPeriods,
      id,
      formData.billingFrequencyId
    );
    const freqOption = billingFrequencyOptions.find(
      (o) => o.value === String(formData.billingFrequencyId)
    );
    const periodsPerYear = getFrequencyPeriodsPerYear(freqOption);

    if (fromDate && periodsPerYear > 0) {
      const toDate = calculatePeriodToDate(fromDate, periodsPerYear);
      const seq = calculateBillingPeriodSequenceNo(fromDate, periodsPerYear, yearStart);
      handleUpdate({
        financialYearId: id,
        periodFromDate: fromDate,
        periodToDate: toDate,
        sequenceNo: seq,
        billGenerationDate: toDate,
        dueDate: toDate,
        graceDays: 0,
        currentPenaltyStartDate: toDate ? addDays(toDate, 1) : "",
      });
      return;
    }

    handleUpdate({ financialYearId: id, periodFromDate: fromDate });
  };

  const handleFrequencyChange = (val: string) => {
    const id = val ? Number(val) : "";
    if (!id) {
      handleUpdate({
        billingFrequencyId: "",
        periodToDate: "",
        billGenerationDate: "",
        dueDate: "",
        currentPenaltyStartDate: "",
      });
      return;
    }

    const freqOption = billingFrequencyOptions.find((o) => o.value === String(val));
    const periodsPerYear = getFrequencyPeriodsPerYear(freqOption);

    if (formData.financialYearId) {
      const yearStart = getYearStartDate(formData.financialYearId);
      const fromDate = calculateNextPeriodFromDate(
        yearStart,
        existingPeriods,
        formData.financialYearId,
        id
      );
      const toDate = calculatePeriodToDate(fromDate, periodsPerYear);
      const seq = calculateBillingPeriodSequenceNo(fromDate, periodsPerYear, yearStart);

      handleUpdate({
        billingFrequencyId: id,
        periodFromDate: fromDate,
        periodToDate: toDate,
        sequenceNo: seq,
        billGenerationDate: toDate,
        dueDate: toDate,
        graceDays: 0,
        currentPenaltyStartDate: toDate ? addDays(toDate, 1) : "",
      });
      return;
    }

    if (formData.periodFromDate && periodsPerYear > 0) {
      const toDate = calculatePeriodToDate(formData.periodFromDate, periodsPerYear);
      const seq = calculateBillingPeriodSequenceNo(formData.periodFromDate, periodsPerYear);
      handleUpdate({
        billingFrequencyId: id,
        periodToDate: toDate,
        sequenceNo: seq,
        billGenerationDate: toDate,
        dueDate: toDate,
        graceDays: 0,
        currentPenaltyStartDate: toDate ? addDays(toDate, 1) : "",
      });
      return;
    }

    handleUpdate({ billingFrequencyId: id });
  };

  const handleDueDateChange = (val: string) => {
    if (!val) {
      handleUpdate({ dueDate: "", currentPenaltyStartDate: "" });
      return;
    }
    const cleanDate = val.split("T")[0];
    if (formData.periodToDate && cleanDate < formData.periodToDate) {
      error(t("validation.dueDateAfterPeriodTo"));
    }
    const grace = formData.periodToDate ? diffDays(formData.periodToDate, cleanDate) : 0;
    if (formData.periodToDate && grace > MAX_GRACE_DAYS) {
      error(t("validation.dueDateMaxOneMonth"));
    }
    handleUpdate({
      dueDate: cleanDate,
      graceDays: grace,
      currentPenaltyStartDate: cleanDate ? addDays(cleanDate, 1) : "",
    });
  };

  const handleGraceDaysChange = (val: string) => {
    if (val === "") {
      handleUpdate({
        graceDays: "",
      });
      return;
    }
    const num = Number(val);
    if (isNaN(num)) return;
    if (num < 0) {
      error(t("validation.graceDaysPositive"));
      return;
    }
    if (num > MAX_GRACE_DAYS) {
      error(t("validation.graceDaysMax", { count: MAX_GRACE_DAYS }));
      return;
    }
    const due =
      formData.periodToDate
        ? num === 0
          ? formData.periodToDate
          : addDays(formData.periodToDate, num)
        : formData.dueDate ?? "";
    handleUpdate({
      graceDays: num,
      dueDate: due,
      currentPenaltyStartDate: due ? addDays(due, 1) : "",
    });
  };

  // Slot calculation
  const freqOption = billingFrequencyOptions.find(
    (o) => o.value === String(formData.billingFrequencyId)
  );
  const periodsPerYear = getFrequencyPeriodsPerYear(freqOption);
  const matchingPeriods = existingPeriods.filter(
    (p) =>
      String(p.financialYearId) === String(formData.financialYearId) &&
      String(p.billingFrequencyId) === String(formData.billingFrequencyId) &&
      (!isEdit || p.id !== formData.id)
  );
  const existingCount = matchingPeriods.length;
  const isMaxLimitReached = !isEdit && periodsPerYear > 0 && existingCount >= periodsPerYear;

  return {
    handleYearChange,
    handleFrequencyChange,
    handleDueDateChange,
    handleGraceDaysChange,
    ...penaltyHandlers,
    existingCount,
    periodsPerYear,
    isMaxLimitReached,
  };
}
