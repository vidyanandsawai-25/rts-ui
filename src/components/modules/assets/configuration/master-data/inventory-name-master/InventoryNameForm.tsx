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

import type { InventoryNameFormModel, InventoryNameFormProps } from "@/types/asset-masters/inventory-name.types";
import { validateInventoryNameForm } from "@/lib/validations/inventory-item-form.validation";
import type { InventoryConditionCategory } from "@/types/asset-masters/inventory-condition.types";
import { useInventoryNameSubmit } from "@/hooks/asset-masters/inventory-name/useInventoryNameSubmit";
import { useInventoryNameForm } from "@/hooks/asset-masters/inventory-name/useInventoryNameForm";

export function InventoryNameForm({ id, initialData, categories }: InventoryNameFormProps) {
  const router = useRouter();
  const isEdit = id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("inventoryName");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: InventoryNameFormModel) => {
    return validateInventoryNameForm(data, t, tCommon);
  }, [t, tCommon]);

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
  } = useInventoryNameForm(initialData, validate);

  const categoryOptions = useMemo(() => {
    return (categories || []).map((g: InventoryConditionCategory) => ({ label: g.categoryName, value: String(g.id) }));
  }, [categories]);

  const showError = (field: string) => touched[field] && !!errors[field];

  const { handleSubmit, isSubmitting } = useInventoryNameSubmit({
    isEdit,
    locale,
    formData,
    validate,
    setErrors,
    setTouched,
    setOpen,
    tCommon,
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
              {isEdit 
                ? t("configuration.masterData.form.editTitle", { name: t("masterNames.inventory-name-master") }) 
                : t("configuration.masterData.form.addTitle", { name: t("masterNames.inventory-name-master") })}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("configuration.masterData.form.updateSubtitle") : t("configuration.masterData.form.createSubtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label={t("configuration.masterData.form.buttons.cancel")} onClick={handleClose} />
          <SaveButton
            label={isEdit ? t("configuration.masterData.form.buttons.update") : t("configuration.masterData.form.buttons.save")}
            type="submit"
            form="inventory-name-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="inventory-name-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            activeLabel={tCommon("status.active")}
            inactiveLabel={tCommon("status.inactive")}
            statusLabel={tCommon("status.label")}
          />
        )}

        <FormFieldsSection
          formData={formData}
          errors={errors}
          showError={showError}
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
