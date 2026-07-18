"use client";

import { useState, useCallback, useMemo } from "react";
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

import type { InventoryModelFormModel, InventoryModelFormProps } from "@/types/asset-masters/inventory-model.types";
import { validateAssetMasterForm } from "@/lib/validations/asset-master-form.validation";
import { useInventoryModelSubmit } from "@/hooks/asset-masters/inventory-model/useInventoryModelSubmit";
import { useInventoryModelForm } from "@/hooks/asset-masters/inventory-model/useInventoryModelForm";

export default function InventoryModelForm({ initialData, groups }: InventoryModelFormProps) {
  const router = useRouter();
  const isEdit = initialData?.id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("inventoryModel.configuration.masterData.form");
  const tCommon = useTranslations("common");
  const tNames = useTranslations("inventoryModel.masterNames");
  const locale = useLocale();

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: InventoryModelFormModel) => {
    return validateAssetMasterForm(data, t, { requiresGroup: true, isInventory: true, hasDepreciation: false, hasCode: false });
  }, [t]);

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleSelectChange,
    handleBlur,
    handleToggleStatus,
    setErrors,
    setTouched,
  } = useInventoryModelForm(initialData, validate);

  const categoryOptions = useMemo(() => {
    return (groups || [])
      .filter((g) => g.id !== "all" && (g.status !== "Inactive" || g.id === String(formData.group ?? "")))
      .map((g) => ({ label: g.name, value: g.id }));
  }, [groups, formData.group]);

  const showError = (field: keyof InventoryModelFormModel) =>
    touched[field] && !!errors[field];

  const { handleSubmit, isSubmitting } = useInventoryModelSubmit({
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
              {isEdit ? t("editTitle", { name: tNames("inventory-model-master") }) : t("addTitle", { name: tNames("inventory-model-master") })}
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
            form="inventory-model-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="inventory-model-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
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
          showError={(field) => showError(field as keyof InventoryModelFormModel)}
          onChange={handleChange}
          onBlur={handleBlur}
          onSelectChange={handleSelectChange}
          t={t}
          categoryOptions={categoryOptions}
        />

        <RequiredFieldsNote text={tCommon("note.mandatory") || "FIELDS ARE MANDATORY"} />
      </form>
    </Drawer>
  );
}
