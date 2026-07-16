"use client";
import { useEffect, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common";
import { StatusToggleCard } from "./StatusToggleCard";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import { AssetPhotoTypeFormFields } from "./AssetPhotoTypeFormFields";
import type { AssetPhotoType } from "@/types/asset-masters/asset-photo-type.types";
import { useAssetPhotoForm } from "@/hooks/asset-masters/assetphototype/useAssetPhotoForm";

export interface AssetPhotoTypeFormProps {
  id: number | null;
  initialData?: AssetPhotoType;
  categories: { id: number; name: string }[];
  types: { id: number; name: string }[];
}

export default function AssetPhotoTypeForm({
  id,
  initialData,
  categories,
  types,
}: AssetPhotoTypeFormProps) {
  const {
    formData,
    displayOrderValue,
    errors,
    isSubmitting,
    isActive,
    open,
    handleChange,
    handleBlur,
    handleSelectChange,
    handleSubmit,
    handleToggleStatus,
    handleToggleRequired,
    handleToggleSubUnit,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  } = useAssetPhotoForm({
    id,
    initialData,
  });

  const statusToggleRef = useRef<HTMLButtonElement>(null);
  const photoTypeCodeRef = useRef<HTMLInputElement>(null);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: String(c.id) }));
  const typeOptions = types.map((type) => ({ label: type.name, value: String(type.id) }));

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (isEdit && statusToggleRef.current) {
          statusToggleRef.current.focus();
        } else if (!isEdit && photoTypeCodeRef.current) {
          photoTypeCodeRef.current.focus();
        }
      }, 150);
    }
  }, [open, isEdit]);

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <ImageIcon size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") : t("form.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("form.editSubtitle") : t("form.subtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleCancel}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? t("form.actions.update") : t("form.actions.save")}
            type="submit"
            form="form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            statusToggleRef={statusToggleRef}
            isActive={isActive}
            handleToggleStatus={handleToggleStatus}
            statusLabel={t("form.status.label")}
            statusDescription={t("form.status.description")}
            activeText={tCommon("status.active")}
            inactiveText={tCommon("status.inactive")}
            errorMessage={errors.isActive}
          />
        )}

        <AssetPhotoTypeFormFields
          photoTypeCodeRef={photoTypeCodeRef}
          formData={formData}
          displayOrderValue={displayOrderValue}
          errors={errors}
          showError={showError}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSelectChange={handleSelectChange}
          handleToggleRequired={handleToggleRequired}
          handleToggleSubUnit={handleToggleSubUnit}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

