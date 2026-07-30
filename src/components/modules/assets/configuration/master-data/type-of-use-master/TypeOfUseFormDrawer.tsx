"use client";

import { useEffect, useRef } from "react";
import { Layers, CheckCircle2, X, AlertCircle } from "lucide-react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton, ToggleSwitch, ValidationMessage, SearchSelect, Input } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import type { AssetTypeOfUse } from "@/types/asset-masters/type-of-use.types";
import { useTypeOfUseForm } from "@/hooks/asset-masters/type-of-use/useTypeOfUseForm";

export interface TypeOfUseFormDrawerProps {
  id: number | null;
  initialData?: AssetTypeOfUse;
  categories: { id: number; name: string }[];
  groups: { id: number; name: string }[];
  types?: { id: number; name: string }[];
  onCategoryChange?: (categoryId: number) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TypeOfUseFormDrawer({
  id,
  initialData,
  categories,
  groups,
  types: initialTypes = [],
  onCategoryChange,
  onSuccess,
  onCancel,
}: TypeOfUseFormDrawerProps) {
  const {
    formData,
    errors,
    isSubmitting,
    isActive,
    types,
    open,
    isLoadingTypes,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  } = useTypeOfUseForm({
    id,
    initialData,
    onSuccess,
    onCancel,
    initialTypes,
    onCategoryChange,
  });

  const statusToggleRef = useRef<HTMLButtonElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (isEdit && statusToggleRef.current) {
          statusToggleRef.current.focus();
        } else if (!isEdit && codeRef.current) {
          codeRef.current.focus();
        }
      }, 150);
    }
  }, [open, isEdit]);

  const typeOptions = [
    { value: "R", label: t("type.options.residential", { default: "R - Residential" }) },
    { value: "C", label: t("type.options.commercial", { default: "C - Commercial" }) },
    { value: "I", label: t("type.options.industrial", { default: "I - Industrial" }) },
    { value: "N", label: t("type.options.nontaxable", { default: "N - Non-taxable" }) },
  ];

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("type.edit", { default: "Edit Type of Use" }) : t("type.add", { default: "Add Type of Use" })}
            </div>
            <div className="text-sm text-slate-500">
              {!isEdit && formData.typeOfUseGroupId > 0 && groups.find((g) => g.id === formData.typeOfUseGroupId)
                ? t("messages.addingTo", { name: groups.find((g) => g.id === formData.typeOfUseGroupId)?.name || "" })
                : t("subtitle", { default: "Configure Types of Use" })}
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
            label={isEdit ? tCommon("actions.update", { default: "Update" }) : tCommon("buttons.save", { default: "Save" })}
            type="submit"
            form="typeofuse-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="typeofuse-form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
            <div
              className={cn(
                "rounded-xl p-3 flex items-center justify-between",
                isActive
                  ? "border border-blue-200 bg-[#F0F6FF]"
                  : "border border-gray-200 bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-full",
                    isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-900"
                  )}
                >
                  {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t("group.fields.status", { default: "Status" })}</div>
                  <div className="text-sm text-gray-500">
                    {t("status.toggleDescription", { default: "Toggle the status" })}
                    {isActive ? ` ${t("status.active", { default: "Active" })}` : ` ${t("status.inactive", { default: "Inactive" })}`}
                  </div>
                </div>
              </div>

              <ToggleSwitch
                ref={statusToggleRef}
                checked={isActive}
                onChange={handleToggleStatus}
                showPopup={false}
                activeLabel={t("status.active", { default: "Active" })}
                inactiveLabel={t("status.inactive", { default: "Inactive" })}
              />
            </div>
            {errors.isActive && (
              <ValidationMessage message={errors.isActive} className="mt-2" />
            )}
          </div>
        )}

        <div className="space-y-4">
          <SearchSelect
            name="assetCategoryId"
            label={t("type.fields.category", { default: "Asset Category" })}
            required
            value={String(formData.assetCategoryId || "")}
            onChange={(name, val) => {
              handleChange({
                target: { name, value: val }
                  } as React.ChangeEvent<HTMLSelectElement>);
            }}
            onBlur={() => {
              handleBlur({
                target: { name: "assetCategoryId", value: String(formData.assetCategoryId || "") }
              } as React.FocusEvent<HTMLSelectElement>);
            }}
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          />
          <ValidationMessage
            message={errors.assetCategoryId}
            visible={showError("assetCategoryId")}
          />

          <SearchSelect
            name="assetTypeId"
            label={t("type.fields.assetType", { default: "Asset Type" })}
            required
            disabled={formData.assetCategoryId <= 0 || isLoadingTypes}
            value={String(formData.assetTypeId || "")}
            onChange={(name, val) => {
              handleChange({
                target: { name, value: val }
                  } as React.ChangeEvent<HTMLSelectElement>);
            }}
            onBlur={() => {
              handleBlur({
                target: { name: "assetTypeId", value: String(formData.assetTypeId || "") }
              } as React.FocusEvent<HTMLSelectElement>);
            }}
            options={types.map((t) => ({ value: String(t.id), label: t.name }))}
          />
          <ValidationMessage
            message={errors.assetTypeId}
            visible={showError("assetTypeId")}
          />

          <SearchSelect
            name="typeOfUseGroupId"
            label={t("group.title", { default: "Use Groups" })}
            required
            value={String(formData.typeOfUseGroupId || "")}
            onChange={(name, val) => {
              handleChange({
                target: { name, value: val }
                  } as React.ChangeEvent<HTMLSelectElement>);
            }}
            onBlur={() => {
              handleBlur({
                target: { name: "typeOfUseGroupId", value: String(formData.typeOfUseGroupId || "") }
              } as React.FocusEvent<HTMLSelectElement>);
            }}
            options={groups.map((g) => ({ value: String(g.id), label: g.name }))}
          />
          <ValidationMessage
            message={errors.typeOfUseGroupId}
            visible={showError("typeOfUseGroupId")}
          />

          <Input
            ref={codeRef}
            name="typeOfUseCode"
            label={t("type.fields.typeId", { default: "Type Of Use Code" })}
            required
            placeholder={t("type.placeholders.typeId", { default: "e.g., RES, COM" })}
            value={formData.typeOfUseCode}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
          />
          <ValidationMessage
            message={errors.typeOfUseCode}
            visible={showError("typeOfUseCode")}
          />

          <Input
            name="description"
            label={t("type.fields.description.label", { default: "Description" })}
            required
            placeholder={t("type.placeholders.description", { default: "Enter description" })}
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
          />
          <ValidationMessage
            message={errors.description}
            visible={showError("description")}
          />

          <SearchSelect
            name="type"
            label={t("type.fields.type.label", { default: "Type" })}
            required
            value={formData.type}
            onChange={(name, val) => {
              handleChange({
                target: { name, value: val }
                  } as React.ChangeEvent<HTMLSelectElement>);
            }}
            onBlur={() => {
              handleBlur({
                target: { name: "type", value: String(formData.type || "") }
              } as React.FocusEvent<HTMLSelectElement>);
            }}
            options={typeOptions}
          />
          <ValidationMessage
            message={errors.type}
            visible={showError("type")}
          />

          <Input
            type="number"
            name="searchSequence"
            label={t("type.fields.sequence", { default: "Sequence" })}
            required
            value={formData.searchSequence}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
          />
          <ValidationMessage
            message={errors.searchSequence}
            visible={showError("searchSequence")}
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          <span>{tCommon("note.mandatory")}</span>
        </div>
      </form>
    </Drawer>
  );
}

