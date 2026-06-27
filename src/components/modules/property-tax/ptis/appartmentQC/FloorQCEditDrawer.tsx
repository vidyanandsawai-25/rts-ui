"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/common/Drawer";
import { CancelButton, SaveButton } from "@/components/common";
import { EditableSelect, EditableInput } from "./PropertyEditDrawerInputs";
import { YEAR_REGEX } from "@/lib/utils/validation-rules";
import { DrawerFloorDataRow, DrawerDropdownOption } from "@/hooks/apartmentQc/propertyEditScreenDrawer.types";
import { useTranslations } from "next-intl";

interface FloorQCEditDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedRow: DrawerFloorDataRow) => void;
  row: DrawerFloorDataRow | null;
  
  // Dropdown states and loading
  floorOptions: DrawerDropdownOption[];
  conTypeOptions: DrawerDropdownOption[];
  useTypeOptions: DrawerDropdownOption[];
  getSubTypeOptions: (typeOfUseId: string) => DrawerDropdownOption[];
  
  isLoadingFloors: boolean;
  isLoadingConTypes: boolean;
  isLoadingUseTypes: boolean;
  
  // Handlers to trigger lazy loading
  handleFloorDropdownClick: () => void;
  handleConTypeDropdownClick: () => void;
  handleUseTypeDropdownClick: () => void;
}

export const FloorQCEditDrawer = ({
  open,
  onClose,
  onSave,
  row,
  floorOptions,
  conTypeOptions,
  useTypeOptions,
  getSubTypeOptions,
  isLoadingFloors,
  isLoadingConTypes,
  isLoadingUseTypes,
  handleFloorDropdownClick,
  handleConTypeDropdownClick,
  handleUseTypeDropdownClick,
}: FloorQCEditDrawerProps) => {
  const t = useTranslations("appartmentQC");
  const [formData, setFormData] = useState<DrawerFloorDataRow | null>(null);

  useEffect(() => {
    if (open && row) {
      setFormData({ ...row });
    }
  }, [open, row]);

  if (!formData) return null;

  const updateField = (field: keyof DrawerFloorDataRow, value: string) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveClick = () => {
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title="Edit Floor QC"
      footer={
        <>
          <CancelButton onClick={onClose} label={t("drawer.cancel")} />
          <SaveButton
            onClick={handleSaveClick}
            label="Save / Update"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
        </>
      }
    >
      <div className="p-6 space-y-4">
        <div onClick={handleFloorDropdownClick}>
          <EditableSelect
            label={t("floorQC.columns.floor") + " *"}
            value={formData.floorId}
            onChange={(v) => updateField("floorId", v)}
            options={floorOptions}
            isLoading={isLoadingFloors}
            required
          />
        </div>
        
        <EditableInput
          label={t("floorQC.columns.conYear") + " *"}
          value={formData.conYear}
          onChange={(v) => {
            let newValue = v;
            newValue = newValue.replace(/\D/g, "");
            if (newValue.length > 4) newValue = newValue.slice(0, 4);
            updateField("conYear", newValue);
          }}
          required
        />

        <EditableInput
          label={t("floorQC.columns.asstYear") + " *"}
          value={formData.asstYear}
          onChange={(v) => {
            let newValue = v;
            newValue = newValue.replace(/\D/g, "");
            if (newValue.length > 4) newValue = newValue.slice(0, 4);
            updateField("asstYear", newValue);
          }}
          required
        />

        <div onClick={handleConTypeDropdownClick}>
          <EditableSelect
            label={t("floorQC.columns.conType") + " *"}
            value={formData.constructionTypeId}
            onChange={(v) => updateField("constructionTypeId", v)}
            options={conTypeOptions}
            isLoading={isLoadingConTypes}
            required
          />
        </div>

        <div onClick={handleUseTypeDropdownClick}>
          <EditableSelect
            label={t("floorQC.columns.use") + " *"}
            value={formData.typeOfUseId}
            onChange={(v) => {
              updateField("typeOfUseId", v);
              // Reset sub-type when use type changes
              updateField("subTypeOfUseId", "");
            }}
            options={useTypeOptions}
            isLoading={isLoadingUseTypes}
            required
          />
        </div>

        <div onClick={handleUseTypeDropdownClick}>
          <EditableSelect
            label={t("floorQC.columns.subTypeOfUse") + " *"}
            value={formData.subTypeOfUseId}
            onChange={(v) => updateField("subTypeOfUseId", v)}
            options={getSubTypeOptions(formData.typeOfUseId)}
            isLoading={isLoadingUseTypes}
            required
          />
        </div>
      </div>
    </Drawer>
  );
};
