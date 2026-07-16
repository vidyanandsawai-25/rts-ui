"use client";
import { useEffect, useRef } from "react";
import { Home as RoomIcon } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common";
import { StatusToggleCard } from "./StatusToggleCard";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import { AssetRoomTypeFormFields } from "./AssetRoomTypeFormFields";
import type { AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import { useAssetRoomForm } from "@/hooks/asset-masters/assetroomtype/useAssetRoomForm";

export interface AssetRoomTypeFormProps {
  id: number | null;
  initialData?: AssetRoomType;
  categories: { id: number; name: string }[];
  types: { id: number; name: string }[];
}

export default function AssetRoomTypeForm({
  id,
  initialData,
  categories,
  types,
}: AssetRoomTypeFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    isActive,
    open,
    handleChange,
    handleBlur,
    handleSelectChange,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  } = useAssetRoomForm({
    id,
    initialData,
  });

  const statusToggleRef = useRef<HTMLButtonElement>(null);
  const roomTypeCodeRef = useRef<HTMLInputElement>(null);

  const categoryOptions = categories.map((cat) => ({ label: cat.name, value: String(cat.id) }));
  const typeOptions = types.map((type) => ({ label: type.name, value: String(type.id) }));

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (isEdit && statusToggleRef.current) {
          statusToggleRef.current.focus();
        } else if (!isEdit && roomTypeCodeRef.current) {
          roomTypeCodeRef.current.focus();
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
            <RoomIcon size={20} />
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

        <AssetRoomTypeFormFields
          roomTypeCodeRef={roomTypeCodeRef}
          formData={formData}
          errors={errors}
          showError={showError}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSelectChange={handleSelectChange}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
