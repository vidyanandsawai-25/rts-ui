"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, CancelButton, SaveButton, Input, Select, Label, ToggleSwitch } from "@/components/common";
import { createChargeHeadSchema } from "@/lib/api/water-bill/chargeHeads.schema";
import { WATER_BILL_ENUMS } from "@/constants/waterBill.constants";
import type { ChargeHead, CreateChargeHeadDto } from "@/types/waterBill/chargeHeads.types";

interface ChargeHeadFormProps {
  open: boolean;
  initialData?: ChargeHead | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChargeHeadDto) => void;
}

function ToggleField({
  label,
  checked,
  enabledText,
  disabledText,
  onChange,
}: {
  label: string;
  checked: boolean;
  enabledText: string;
  disabledText: string;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="space-y-1 text-left">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      <div className="flex items-center justify-between h-10 px-3 bg-slate-50/70 border border-slate-200 rounded-lg">
        <span className={`text-xs font-medium ${checked ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
          {checked ? enabledText : disabledText}
        </span>
        <ToggleSwitch
          checked={checked}
          onChange={onChange}
          showPopup={false}
          activeLabel={enabledText}
          inactiveLabel={disabledText}
        />
      </div>
    </div>
  );
}

export function ChargeHeadForm({
  open,
  initialData,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ChargeHeadFormProps) {
  const t = useTranslations("chargeHeads");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState<CreateChargeHeadDto>({
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    chargeType: initialData?.chargeType ?? "Charge",
    isTax: initialData?.isTax ?? false,
    isPenalty: initialData?.isPenalty ?? false,
    isRefundable: initialData?.isRefundable ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<{ code?: string; name?: string }>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    if (open && initialData) {
      setFormData({
        code: initialData.code ?? "",
        name: initialData.name ?? "",
        chargeType: initialData.chargeType ?? "Charge",
        isTax: initialData.isTax ?? false,
        isPenalty: initialData.isPenalty ?? false,
        isRefundable: initialData.isRefundable ?? false,
        isActive: initialData.isActive ?? true,
      });
      setErrors({});
    } else if (open && !initialData) {
      setFormData({
        code: "",
        name: "",
        chargeType: "Charge",
        isTax: false,
        isPenalty: false,
        isRefundable: false,
        isActive: true,
      });
      setErrors({});
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const schema = createChargeHeadSchema(t);
    const res = schema.safeParse(formData);
    if (!res.success) {
      const fieldErrors = res.error.flatten().fieldErrors;
      const newErrors: { code?: string; name?: string } = {};
      if (fieldErrors.code?.[0]) newErrors.code = fieldErrors.code[0];
      if (fieldErrors.name?.[0]) newErrors.name = fieldErrors.name[0];
      setErrors(newErrors);
      return;
    }
    setErrors({});
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
            {t("categoryTag")}
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isEdit ? t("editTitle") : t("addTitle")}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CancelButton label={tCommon("buttons.cancel")} onClick={onClose} disabled={isSubmitting} />
          <SaveButton label={t("saveRecord")} type="submit" form="charge-head-form" isLoading={isSubmitting} />
        </div>
      }
    >
      <form id="charge-head-form" onSubmit={handleSubmit} className="p-6 bg-white text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Row 1: Code | Name */}
          <div className="space-y-1">
            <Input
              label={t("form.code.label")}
              value={formData.code}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
              }}
              placeholder={t("form.code.placeholder")}
              error={errors.code}
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              label={t("form.name.label")}
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder={t("form.name.placeholder")}
              error={errors.name}
              required
            />
          </div>

          {/* Row 2: Charge Type | Is Tax */}
          <div className="space-y-1">
            <Select
              label={t("form.chargeType.label")}
              value={formData.chargeType}
              onChange={(_e, val) => setFormData((prev) => ({ ...prev, chargeType: val }))}
              options={WATER_BILL_ENUMS.CHARGE_TYPES.map((type) => ({
                value: type,
                label: t(`form.chargeType.${type.toLowerCase()}` as Parameters<typeof t>[0]),
              }))}
            />
          </div>

          <ToggleField
            label={t("form.tax")}
            checked={formData.isTax}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isTax: val }))}
          />

          {/* Row 3: Penalty | Refundable */}
          <ToggleField
            label={t("form.penalty")}
            checked={formData.isPenalty}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isPenalty: val }))}
          />

          <ToggleField
            label={t("form.refundable")}
            checked={formData.isRefundable}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isRefundable: val }))}
          />

          {/* Row 4: Active */}
          <ToggleField
            label={t("form.active")}
            checked={formData.isActive}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
          />
        </div>
      </form>
    </Drawer>
  );
}
