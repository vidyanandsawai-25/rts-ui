"use client";

import { LayoutGrid } from "lucide-react";


import { CancelButton, SaveButton, StatusToggleCard, RequiredFieldsNote } from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { FormFieldsSection } from "./FormFieldsSection";
import { useAssetTypeForm } from "@/hooks/asset-masters/asset-type/useAssetTypeForm";

import type { AssetTypeFormModel, AssetTypeFormProps } from "@/types/asset-masters/asset-type.types";

export default function AssetTypeForm({ initialData, groups }: AssetTypeFormProps) {
  const {
    isEdit,
    open,
    handleClose,
    formData,
    errors,
    showError,
    handleChange,
    handleSelectChange,
    handleRadioChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
    isSubmitting,
    t,
    tCommon,
    tNames,
    categoryOptions,
  } = useAssetTypeForm({ initialData, groups });

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <LayoutGrid size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("editTitle", { name: tNames("asset-type-master") }) : t("addTitle", { name: tNames("asset-type-master") })}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("updateSubtitle") : t("createSubtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label={t("buttons.cancel")} onClick={handleClose} />
          <SaveButton
            label={isEdit ? t("buttons.update") : t("buttons.save")}
            type="submit"
            form="asset-type-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="asset-type-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            activeLabel={t("labels.active")}
            inactiveLabel={t("labels.inactive")}
            statusLabel={t("labels.status")}
          />
        )}

        <FormFieldsSection
          formData={formData}
          errors={errors}
          showError={(field) => showError(field as keyof AssetTypeFormModel)}
          onChange={handleChange}
          onBlur={handleBlur}
          onSelectChange={handleSelectChange}
          onRadioChange={handleRadioChange}
          t={t}
          categoryOptions={categoryOptions}
        />

        <RequiredFieldsNote text={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

