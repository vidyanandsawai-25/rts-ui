"use client";

import { Input, Select, ValidationMessage, CancelButton } from "@/components/common";
import { Info, AlertCircle } from "lucide-react";
import { PartitionFormState, PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";
import { Option } from "@/components/common";
import { PreviewButton } from "@/components/common/ActionButtons";

interface WingDetailConfigSectionProps {
  form: PartitionFormState;
  setForm: React.Dispatch<React.SetStateAction<PartitionFormState>>;
  errors: PartitionFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>;
  wingOptions: Option[];
  fromFloorOptions: Option[];
  toFloorOptions: Option[];
  generationTypeOptions: Option[];
  handleFromFloorChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  handleToFloorChange: (e: React.ChangeEvent<HTMLSelectElement>, value: string) => void;
  handlePreviewBuilding: () => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export function WingDetailConfigSection({
  form,
  setForm,
  errors,
  setErrors,
  wingOptions,
  fromFloorOptions,
  toFloorOptions,
  generationTypeOptions,
  handleFromFloorChange,
  handleToFloorChange,
  handlePreviewBuilding,
  loading,
  onCancel,
  t,
  tCommon,
}: WingDetailConfigSectionProps) {
  return (
    <div className="p-4 border border-gray-300 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          {t("partitionForm.wing.newWingDetails")}
        </h4>
        <CancelButton
          size="xs"
          onClick={onCancel}
          label={tCommon("buttons.cancel")}
        />
      </div>

      {/* Info Box: Required Fields */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-300 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">{t("partitionForm.wing.requiredFieldsTitle")}</p>
          <p>{t("partitionForm.wing.requiredFieldsDesc")}</p>
        </div>
      </div>

      {/* Wing Letter */}
      <div>
        <Select
          label={t("partitionForm.wing.wingLetter")}
          required
          value={form.wingLetter}
          disabled
          onChange={(_e, value) => {
            setForm({ ...form, wingLetter: value });
            setErrors({ ...errors, wingLetter: undefined });
          }}
          options={wingOptions}
          placeholder={t("partitionForm.wing.placeholders.wingLetter")}
          selectSize="md"
        />
        <ValidationMessage
          message={errors.wingLetter}
          visible={!!errors.wingLetter}
          type="error"
        />
      </div>

      {/* Floor Range */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label={t("partitionForm.wing.fromFloor")}
              required
              value={form.fromFloor}
              onChange={handleFromFloorChange}
              options={fromFloorOptions}
              placeholder={t("partitionForm.wing.placeholders.fromFloor")}
              selectSize="md"
            />
            <ValidationMessage
              message={errors.fromFloor}
              visible={!!errors.fromFloor}
              type="error"
            />
          </div>
          <div>
            <Select
              label={t("partitionForm.wing.toFloor")}
              required
              value={form.toFloor}
              onChange={handleToFloorChange}
              options={toFloorOptions}
              placeholder={t("partitionForm.wing.placeholders.toFloor")}
              selectSize="md"
            />
            <ValidationMessage
              message={errors.toFloor}
              visible={!!errors.toFloor}
              type="error"
            />
          </div>
        </div>
      </div>

      {/* No Of Flat On One Floor */}
      <div>
        <Input
          label={t("partitionForm.wing.noOfFlatOnOneFloor")}
          required
          type="number"
          value={form.noOfFlatOnOneFloor}
          onChange={(e) => {
            setForm({ ...form, noOfFlatOnOneFloor: e.target.value });
            setErrors({ ...errors, noOfFlatOnOneFloor: undefined });
          }}
          placeholder={t("partitionForm.wing.placeholders.noOfFlatOnOneFloor")}
          disabled={loading}
          min="1"
        />
        <ValidationMessage
          message={errors.noOfFlatOnOneFloor}
          visible={!!errors.noOfFlatOnOneFloor}
          type="error"
        />
      </div>

      {/* Flat Start and Incremented By */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t("partitionForm.wing.flatStart")}
            required
            type="number"
            value={form.flatStart}
            onChange={(e) => {
              setForm({ ...form, flatStart: e.target.value });
              setErrors({ ...errors, flatStart: undefined });
            }}
            placeholder={t("partitionForm.wing.placeholders.flatStart")}
            disabled={loading}
            min="0"
          />
          <ValidationMessage
            message={errors.flatStart}
            visible={!!errors.flatStart}
            type="error"
          />
        </div>

        <div>
          <Input
            label={t("partitionForm.wing.incrementedBy")}
            required
            type="number"
            value={form.incrementedBy}
            onChange={(e) => {
              setForm({ ...form, incrementedBy: e.target.value });
              setErrors({ ...errors, incrementedBy: undefined });
            }}
            placeholder={t("partitionForm.wing.placeholders.incrementedBy")}
            disabled={loading}
            min="1"
          />
          <ValidationMessage
            message={errors.incrementedBy}
            visible={!!errors.incrementedBy}
            type="error"
          />
        </div>
      </div>

      {/* Prefix and Generation Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t("partitionForm.wing.prefix")}
            value={form.prefix}
            onChange={(e) => setForm({ ...form, prefix: e.target.value })}
            placeholder={t("partitionForm.wing.placeholders.prefix")}
            disabled={loading}
          />
        </div>

        <div>
          <Select
            label={t("partitionForm.wing.generationType")}
            required
            value={form.generationType}
            onChange={(_e, value) => {
              setForm({ ...form, generationType: value });
              setErrors({ ...errors, generationType: undefined });
            }}
            options={generationTypeOptions}
            placeholder={t("partitionForm.wing.placeholders.generationType")}
            selectSize="md"
          />
          <ValidationMessage
            message={errors.generationType}
            visible={!!errors.generationType}
            type="error"
          />
        </div>
      </div>

      {/* Warning Message */}
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-red-800">
          {t("partitionForm.wing.wingBuildingsDuplicate")}
        </p>
      </div>

      {/* Preview Building Button */}
      <PreviewButton
        onClick={handlePreviewBuilding}
        isLoading={loading}
        disabled={loading}
        label={t("partitionForm.wing.preview.previewButton")}
        className="w-full"
      />
    </div>
  );
}
