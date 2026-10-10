"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, CancelButton, SaveButton } from "@/components/common";
import { TariffFormFields } from "./TariffFormFields";
import { createTariffWorkbenchSchema } from "@/lib/api/water-bill/tariff-workbench/tariffWorkbench.schema";
import type {
  CreateTariffWorkbenchDto,
  TariffFormProps,
} from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

export type { TariffFormProps };

export function TariffForm({
  open,
  initialData,
  isSubmitting = false,
  financialYearOptions = [],
  connectionTypeOptions = [],
  connectionCategoryOptions = [],
  tapSizeOptions = [],
  billingMethodOptions = [],
  onClose,
  onSubmit,
}: TariffFormProps) {
  const t = useTranslations("tariffWorkbench");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initialData);

  const defaultFyId = financialYearOptions.length > 0 ? Number(financialYearOptions[0].value) : 0;
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<CreateTariffWorkbenchDto>({
    tariffCode: initialData?.tariffCode ?? "",
    tariffName: initialData?.tariffName ?? "",
    financialYearId: (initialData?.financialYearId || initialData?.yearId) ?? defaultFyId,
    connectionTypeId: initialData?.connectionTypeId ?? null,
    connectionCategoryId: initialData?.connectionCategoryId ?? null,
    tapSizeId: initialData?.tapSizeId ?? null,
    billingMethod: initialData?.billingMethod ?? "",
    effectiveFrom: initialData?.effectiveFrom ? initialData.effectiveFrom.split("T")[0] : "",
    effectiveTo: initialData?.effectiveTo ? initialData.effectiveTo.split("T")[0] : "",
    versionNo: initialData?.versionNo ?? 1,
    status: initialData?.status ?? "Draft",
    description: initialData?.description ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof CreateTariffWorkbenchDto, boolean>>>({});
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    setFormData({
      tariffCode: initialData?.tariffCode ?? "",
      tariffName: initialData?.tariffName ?? "",
      financialYearId: (initialData?.financialYearId || initialData?.yearId) ?? defaultFyId,
      connectionTypeId: initialData?.connectionTypeId ?? null,
      connectionCategoryId: initialData?.connectionCategoryId ?? null,
      tapSizeId: initialData?.tapSizeId ?? null,
      billingMethod: initialData?.billingMethod ?? "",
      effectiveFrom: initialData?.effectiveFrom ? initialData.effectiveFrom.split("T")[0] : "",
      effectiveTo: initialData?.effectiveTo ? initialData.effectiveTo.split("T")[0] : "",
      versionNo: initialData?.versionNo ?? 1,
      status: initialData?.status ?? "Draft",
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
    });
    setSubmittedOnce(false);
    setTouched({});
  }

  const validate = useCallback((data: CreateTariffWorkbenchDto) => {
    const res = createTariffWorkbenchSchema(t).safeParse(data);
    const errs: Partial<Record<keyof CreateTariffWorkbenchDto, string>> = {};
    if (!res.success) {
      for (const [key, msgs] of Object.entries(res.error.flatten().fieldErrors)) {
        if (msgs?.[0]) errs[key as keyof CreateTariffWorkbenchDto] = msgs[0];
      }
    }
    return errs;
  }, [t]);

  const errors = validate(formData);
  const showError = (field: keyof CreateTariffWorkbenchDto) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof CreateTariffWorkbenchDto, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof CreateTariffWorkbenchDto) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (Object.keys(validate(formData)).length > 0) return;
    onSubmit(formData);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            {t("moduleTitle")}
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isEdit ? t("editTitle") : t("addTitle")}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CancelButton label={tCommon("buttons.cancel")} onClick={onClose} disabled={isSubmitting} />
          <SaveButton label={t("form.saveRecord")} type="submit" form="tariff-workbench-form" isLoading={isSubmitting} />
        </div>
      }
    >
      <form id="tariff-workbench-form" onSubmit={handleSubmit} className="p-6 bg-white">
        <TariffFormFields
          formData={formData}
          errors={errors}
          showError={showError}
          handleChange={handleChange}
          handleBlur={handleBlur}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          financialYearOptions={financialYearOptions}
          connectionTypeOptions={connectionTypeOptions}
          connectionCategoryOptions={connectionCategoryOptions}
          tapSizeOptions={tapSizeOptions}
          billingMethodOptions={billingMethodOptions}
          t={t}
          tCommon={tCommon}
        />
      </form>
    </Drawer>
  );
}
