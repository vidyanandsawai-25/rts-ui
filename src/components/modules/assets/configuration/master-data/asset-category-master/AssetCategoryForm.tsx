"use client";

import { Box } from "lucide-react";

import { CancelButton, SaveButton, StatusToggleCard, RequiredFieldsNote } from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { FormFieldsSection } from "./FormFieldsSection";
import { useAssetCategoryForm } from "@/hooks/asset-masters/asset-category/useAssetCategoryForm";

import type { AssetCategoryFormModel, AssetCategoryFormProps } from "@/types/asset-masters/asset-category.types";

export default function AssetCategoryForm({ initialData }: AssetCategoryFormProps) {
  const {
    isEdit,
    open,
    handleClose,
    formData,
    errors,
    showError,
    handleChange,
    handleCheckboxChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
    isSubmitting,
    t,
    tCommon,
    tNames,
  } = useAssetCategoryForm({ initialData });

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <Box size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("editTitle", { name: tNames("asset-category-master") }) : t("addTitle", { name: tNames("asset-category-master") })}
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
            form="asset-category-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="asset-category-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
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
          showError={(field) => showError(field as keyof AssetCategoryFormModel)}
          onChange={handleChange}
          onBlur={handleBlur}
          onCheckboxChange={handleCheckboxChange}
          t={t}
          isPending={isSubmitting}
        />

        <RequiredFieldsNote text={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

