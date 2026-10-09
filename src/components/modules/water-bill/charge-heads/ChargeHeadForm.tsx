"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, CancelButton, SaveButton, Input, Select, Label, ToggleSwitch } from "@/components/common";
import { createChargeHeadSchema } from "@/lib/api/water-bill/chargeHeads.schema";
import { WATER_BILL_ENUMS } from "@/constants/waterBill.constants";
import type { ChargeHead, CreateChargeHeadDto } from "@/types/water-bill/chargeHeads.types";

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
    chargeHeadCode: initialData?.chargeHeadCode ?? "",
    chargeHeadName: initialData?.chargeHeadName ?? "",
    chargeHeadNameLocal: initialData?.chargeHeadNameLocal ?? "",
    chargeType: initialData?.chargeType ?? "Charge",
    sequenceNo: initialData?.sequenceNo ?? 1,
    description: initialData?.description ?? "",
    isRefundable: initialData?.isRefundable ?? false,
    isRegularPay: initialData?.isRegularPay ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<{
    chargeHeadCode?: string;
    chargeHeadName?: string;
    sequenceNo?: string;
  }>({});

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    if (open && initialData) {
      setFormData({
        chargeHeadCode: initialData.chargeHeadCode ?? "",
        chargeHeadName: initialData.chargeHeadName ?? "",
        chargeHeadNameLocal: initialData.chargeHeadNameLocal ?? "",
        chargeType: initialData.chargeType ?? "Charge",
        sequenceNo: initialData.sequenceNo ?? 1,
        description: initialData.description ?? "",
        isRefundable: initialData.isRefundable ?? false,
        isRegularPay: initialData.isRegularPay ?? false,
        isActive: initialData.isActive ?? true,
      });
      setErrors({});
    } else if (open && !initialData) {
      setFormData({
        chargeHeadCode: "",
        chargeHeadName: "",
        chargeHeadNameLocal: "",
        chargeType: "Charge",
        sequenceNo: 1,
        description: "",
        isRefundable: false,
        isRegularPay: false,
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
      const newErrors: {
        chargeHeadCode?: string;
        chargeHeadName?: string;
        sequenceNo?: string;
      } = {};
      if (fieldErrors.chargeHeadCode?.[0]) newErrors.chargeHeadCode = fieldErrors.chargeHeadCode[0];
      if (fieldErrors.chargeHeadName?.[0]) newErrors.chargeHeadName = fieldErrors.chargeHeadName[0];
      if (fieldErrors.sequenceNo?.[0]) newErrors.sequenceNo = fieldErrors.sequenceNo[0];
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
              value={formData.chargeHeadCode}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, chargeHeadCode: e.target.value.toUpperCase() }));
                if (errors.chargeHeadCode) setErrors((prev) => ({ ...prev, chargeHeadCode: undefined }));
              }}
              placeholder={t("form.code.placeholder")}
              error={errors.chargeHeadCode}
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              label={t("form.name.label")}
              value={formData.chargeHeadName}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, chargeHeadName: e.target.value }));
                if (errors.chargeHeadName) setErrors((prev) => ({ ...prev, chargeHeadName: undefined }));
              }}
              placeholder={t("form.name.placeholder")}
              error={errors.chargeHeadName}
              required
            />
          </div>

          {/* Row 2: Local Name | Charge Type */}
          <div className="space-y-1">
            <Input
              label={t("form.nameLocal.label")}
              value={formData.chargeHeadNameLocal || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, chargeHeadNameLocal: e.target.value }));
              }}
              placeholder={t("form.nameLocal.placeholder")}
            />
          </div>

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

          {/* Row 3: Sequence No | Description */}
          <div className="space-y-1">
            <Input
              label={t("form.sequenceNo.label")}
              type="number"
              value={formData.sequenceNo}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData((prev) => ({ ...prev, sequenceNo: isNaN(val) ? 1 : val }));
                if (errors.sequenceNo) setErrors((prev) => ({ ...prev, sequenceNo: undefined }));
              }}
              placeholder={t("form.sequenceNo.placeholder")}
              error={errors.sequenceNo}
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              label={t("form.description.label")}
              value={formData.description || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
              }}
              placeholder={t("form.description.placeholder")}
            />
          </div>

          {/* Row 4: Refundable | Regular Pay */}
          <ToggleField
            label={t("form.refundable")}
            checked={formData.isRefundable}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isRefundable: val }))}
          />

          <ToggleField
            label={t("form.regularPay")}
            checked={formData.isRegularPay}
            enabledText={t("enabled")}
            disabledText={t("disabled")}
            onChange={(val) => setFormData((prev) => ({ ...prev, isRegularPay: val }))}
          />

          {/* Row 5: Active */}
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
