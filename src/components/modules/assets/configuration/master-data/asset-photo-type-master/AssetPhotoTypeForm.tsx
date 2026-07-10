"use client";
import { useEffect, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Input, ValidationMessage, ToggleSwitch, SearchSelect } from "@/components/common";
import { StatusToggleCard } from "./StatusToggleCard";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
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

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <Input
            ref={photoTypeCodeRef}
            name="photoTypeCode"
            label={t("form.fields.photoTypeCode.label")}
            required
            placeholder={t("form.fields.photoTypeCode.placeholder")}
            value={formData.photoTypeCode}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.photoTypeCode}
            visible={showError("photoTypeCode")}
          />

          <SearchSelect
            name="assetCategoryId"
            label={t("form.fields.assetCategoryId.label")}
            required
            placeholder={t("form.fields.assetCategoryId.placeholder")}
            options={categoryOptions}
            value={formData.assetCategoryId ? String(formData.assetCategoryId) : ""}
            onChange={handleSelectChange}
            error={showError("assetCategoryId") ? errors.assetCategoryId : undefined}
          />

          <SearchSelect
            name="assetTypeId"
            label={t("form.fields.assetTypeId.label")}
            required
            placeholder={t("form.fields.assetTypeId.placeholder")}
            options={typeOptions}
            value={formData.assetTypeId ? String(formData.assetTypeId) : ""}
            onChange={handleSelectChange}
            disabled={!formData.assetCategoryId || typeOptions.length === 0}
            error={showError("assetTypeId") ? errors.assetTypeId : undefined}
          />

          <div className="flex items-center justify-between p-3 border border-[#DCEAFF] bg-white rounded-xl">
            <div>
              <div className="font-medium text-slate-800 text-sm">{t("form.fields.isRequired.label")}</div>
              <div className="text-xs text-slate-500">{t("form.fields.isRequired.description")}</div>
            </div>
            <ToggleSwitch
              checked={formData.isRequired}
              onChange={handleToggleRequired}
              showPopup={false}
              activeLabel={t("form.fields.isRequired.label")}
              inactiveLabel={t("form.fields.isRequired.label")}
            />
          </div>

          <Input
            name="photoTypeName"
            label={t("form.fields.photoTypeName.label")}
            required
            placeholder={t("form.fields.photoTypeName.placeholder")}
            value={formData.photoTypeName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.photoTypeName}
            visible={showError("photoTypeName")}
          />

          <Input
            name="description"
            label={t("form.fields.description.label")}
            placeholder={t("form.fields.description.placeholder")}
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.description}
            visible={showError("description")}
          />

          <Input
            name="displayOrder"
            label={t("form.fields.displayOrder.label")}
            type="number"
            min={0}
            value={displayOrderValue}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.displayOrder}
            visible={showError("displayOrder")}
          />
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

