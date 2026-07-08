"use client";
import { useEffect, useRef } from "react";
import { Home as RoomIcon } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, Input, ValidationMessage, SearchSelect } from "@/components/common";
import { StatusToggleCard } from "./StatusToggleCard";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";
import type { AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import { useAssetRoomForm } from "@/hooks/asset-masters/assetroomtype/useAssetRoomForm";

export interface AssetRoomTypeFormProps {
  id: number | null;
  initialData?: AssetRoomType;
  types: { id: number; name: string }[];
}

export default function AssetRoomTypeForm({
  id,
  initialData,
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

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <Input
            ref={roomTypeCodeRef}
            name="roomTypeCode"
            label={t("form.fields.roomTypeCode.label")}
            required
            placeholder={t("form.fields.roomTypeCode.placeholder")}
            value={formData.roomTypeCode}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.roomTypeCode}
            visible={showError("roomTypeCode")}
          />

          <SearchSelect
            name="assetTypeId"
            label={t("form.fields.assetTypeId.label")}
            required
            placeholder={t("form.fields.assetTypeId.placeholder")}
            options={typeOptions}
            value={formData.assetTypeId ? String(formData.assetTypeId) : ""}
            onChange={handleSelectChange}
            error={showError("assetTypeId") ? errors.assetTypeId : undefined}
          />

          <Input
            name="roomTypeName"
            label={t("form.fields.roomTypeName.label")}
            required
            placeholder={t("form.fields.roomTypeName.placeholder")}
            value={formData.roomTypeName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.roomTypeName}
            visible={showError("roomTypeName")}
          />

          <Input
            name="description"
            label={t("form.fields.description.label")}
            required
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
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}
