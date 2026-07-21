"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import { CancelButton, SaveButton, StatusToggleCard } from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations, useLocale } from "next-intl";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import { FormFieldsSection } from "./FormFieldsSection";
import type { OwnershipTypeFormModel } from "@/types/asset-masters/ownership-type.types";
import { validateOwnershipTypeForm } from "@/lib/validations/ownership-type-form.validation";
import { useOwnershipTypeSubmit } from "@/hooks/asset-masters/ownership-type/useOwnershipTypeSubmit";
import { ASSET_MASTER_TEXT_SANITIZE, ASSET_MASTER_NAME_SANITIZE } from "@/lib/utils/validation-rules";

export function OwnershipTypeForm({ id, initialData }: { id?: number; initialData?: import("@/types/asset-masters/ownership-type.types").OwnershipTypeFormModel | null; }) {
  const router = useRouter();
  const isEdit = id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("ownershipType");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [formData, setFormData] = useState<OwnershipTypeFormModel>(
    initialData ?? {
      id: undefined,
      ownershipTypeName: "",
      description: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: OwnershipTypeFormModel) => {
    return validateOwnershipTypeForm(data, t);
  }, [t]);

  const showError = (field: string) => touched[field] && !!errors[field];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "ownershipTypeName") {
      newValue = newValue.replace(ASSET_MASTER_NAME_SANITIZE, "");
    }
    
    if (name === "description") {
      newValue = newValue.replace(ASSET_MASTER_TEXT_SANITIZE, "");
    }
    
    if (typeof newValue === "string" && newValue.length > 0 && ["ownershipTypeName", "description"].includes(name)) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    setFormData((p) => ({ ...p, [name]: newValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  };

  const { handleSubmit, isSubmitting } = useOwnershipTypeSubmit({
    isEdit,
    locale,
    formData,
    validate,
    setErrors,
    setTouched,
    setOpen,
    tCommon,
  });

  const handleToggleStatus = () => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  };

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
                ? t("configuration.masterData.form.editTitle", { name: t("masterNames.ownership-type-master") }) 
                : t("configuration.masterData.form.addTitle", { name: t("masterNames.ownership-type-master") })}
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
            form="ownership-type-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="ownership-type-form" onSubmit={handleSubmit} noValidate className="space-y-6 bg-[#F8FAFF] p-5">
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
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
