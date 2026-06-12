"use client";

import { useTranslations } from "next-intl";
import {
  Drawer,
  CancelButton,
  SaveButton,
  Input,
  Select,
  ValidationMessage,
} from "@/components/common";
import { StatusToggleField } from "./StatusToggleField";
import { MandatoryFieldsNotice } from "@/components/modules/property-tax/Floormaster/MandatoryFieldsNotice";
import { WaterRateDrawerTitle } from "./WaterRateDrawerTitle";
import { useWaterRateForm } from "./hooks/useWaterRateForm";
import { useWaterRateOptions } from "./hooks/useWaterRateOptions";
import type { WaterRate } from "@/types/water-connection.types";

export interface WaterRateFormProps {
  id: number | null;
  initialData?: WaterRate;
}

export function WaterRateForm({ id, initialData }: Readonly<WaterRateFormProps>) {
  const t = useTranslations("waterConnectionMaster.waterRate");
  const tCommon = useTranslations("common");

  // Use custom hooks for form logic and options loading
  const {
    open,
    isEdit,
    isSubmitting,
    formData,
    errors,
    showError,
    handleChange,
    handleBlur,
    handleClose,
    handleSubmit,
  } = useWaterRateForm({ id, initialData });

  const { types, sizes, years, loading: loadingOptions } = useWaterRateOptions({
    initialTypeId: initialData?.waterConnectionTypeId,
    initialSizeId: initialData?.waterConnectionSizeId,
    initialYearId: initialData?.financeYearId,
  });

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        <WaterRateDrawerTitle
          title={isEdit ? t("editTitle") : t("addTitle")}
          subtitle={isEdit ? t("editSubtitle") : t("addSubtitle")}
        />
      }
      footer={
        <>
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? tCommon("buttons.edit") : tCommon("buttons.save")}
            type="submit"
            form="water-rate-form"
            isLoading={isSubmitting || loadingOptions}
          />
        </>
      }
    >
      <form
        id="water-rate-form"
        onSubmit={handleSubmit}
        className="space-y-5 bg-[#F8FAFF] p-5"
        noValidate
      >
        {isEdit && (
          <StatusToggleField
            isActive={formData.isActive}
            onChange={() => handleChange("isActive", !formData.isActive)}
            labels={{
              title: t("form.activeStatusTitle"),
              activeText: t("form.activeStatusOn"),
              inactiveText: t("form.activeStatusOff"),
            }}
          />
        )}

        <div className="space-y-4">
          {/* Connection Type Dropdown */}
          <div>
            <Select
              label={t("form.connectionType.label")}
              required
              options={types}
              value={formData.waterConnectionTypeId}
              onChange={(_e, val) => handleChange("waterConnectionTypeId", val)}
              onBlur={() => handleBlur("waterConnectionTypeId")}
              placeholder={t("form.connectionType.placeholder")}
              disabled={loadingOptions}
              error={showError("waterConnectionTypeId") ? errors.waterConnectionTypeId : undefined}
            />
          </div>

          {/* Connection Size Dropdown */}
          <div>
            <Select
              label={t("form.connectionSize.label")}
              required
              options={sizes}
              value={formData.waterConnectionSizeId}
              onChange={(_e, val) => handleChange("waterConnectionSizeId", val)}
              onBlur={() => handleBlur("waterConnectionSizeId")}
              placeholder={t("form.connectionSize.placeholder")}
              disabled={loadingOptions}
              error={showError("waterConnectionSizeId") ? errors.waterConnectionSizeId : undefined}
            />
          </div>

          {/* Finance Year Dropdown */}
          <div>
            <Select
              label={t("form.financeYear.label")}
              required
              options={years}
              value={formData.financeYearId}
              onChange={(_e, val) => handleChange("financeYearId", val)}
              onBlur={() => handleBlur("financeYearId")}
              placeholder={t("form.financeYear.placeholder")}
              disabled={loadingOptions}
              error={showError("financeYearId") ? errors.financeYearId : undefined}
            />
          </div>

          {/* Yearly Rate Input */}
          <div>
            <Input
              label={t("form.yearlyRate.label")}
              required
              id="water-yearly-rate"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={formData.yearlyRate}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                handleChange("yearlyRate", digits);
              }}
              onBlur={() => handleBlur("yearlyRate")}
              placeholder={t("form.yearlyRate.placeholder")}
              aria-invalid={showError("yearlyRate") ? "true" : "false"}
              aria-describedby={showError("yearlyRate") ? "water-yearly-rate-error" : undefined}
            />
            <ValidationMessage
              id="water-yearly-rate-error"
              message={errors.yearlyRate}
              visible={showError("yearlyRate")}
            />
          </div>
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
