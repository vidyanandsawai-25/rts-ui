"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import {
  CancelButton,
  SaveButton,
  StatusToggleCard,
  RequiredFieldsNote,
} from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations, useLocale } from "next-intl";
import { FormFieldsSection } from "./FormFieldsSection";

import type { InventoryCategoryFormModel, InventoryCategoryFormProps } from "@/types/asset-masters/inventory-category.types";
import { validateAssetMasterForm } from "@/lib/validations/asset-master-form.validation";
import { useInventoryCategorySubmit } from "@/hooks/asset-masters/inventory-category/useInventoryCategorySubmit";
import { useInventoryCategoryForm } from "@/hooks/asset-masters/inventory-category/useInventoryCategoryForm";

export default function InventoryCategoryForm({ initialData }: InventoryCategoryFormProps) {
  const router = useRouter();
  const isEdit = initialData?.id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("inventoryCategory.configuration.masterData.form");
  const tCommon = useTranslations("common");
  const tNames = useTranslations("inventoryCategory.masterNames");
  const locale = useLocale();

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: InventoryCategoryFormModel) => {
    return validateAssetMasterForm(data, t, { requiresGroup: false, isInventory: true, hasDepreciation: true });
  }, [t]);

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleToggleStatus,
    setErrors,
    setTouched,
  } = useInventoryCategoryForm(initialData, validate);

  const showError = (field: keyof InventoryCategoryFormModel) =>
    touched[field] && !!errors[field];

  const { handleSubmit, isSubmitting } = useInventoryCategorySubmit({
    isEdit,
    locale,
    formData,
    validate,
    setErrors,
    setTouched,
    setOpen,
    t,
  });

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
              {isEdit ? t("editTitle", { name: tNames("inventory-category-master") }) : t("addTitle", { name: tNames("inventory-category-master") })}
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
            form="inventory-category-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="inventory-category-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
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
          showError={(field) => showError(field as keyof InventoryCategoryFormModel)}
          onChange={handleChange}
          onBlur={handleBlur}
          t={t}
        />

        <RequiredFieldsNote text={tCommon("note.mandatory") || "FIELDS ARE MANDATORY"} />
      </form>
    </Drawer>
  );
}
