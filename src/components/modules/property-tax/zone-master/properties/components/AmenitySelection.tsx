"use client";

import { useMemo, useEffect } from "react";
import { Input, Select, ValidationMessage } from "@/components/common";
import { PartitionFormState, PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";
import { SocietyWingDetailItem } from "@/types/zone-master/properties/society-wing-details.types";

interface AmenitySelectionProps {
  form: PartitionFormState;
  setForm: React.Dispatch<React.SetStateAction<PartitionFormState>>;
  errors: PartitionFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>;
  wingDetails: SocietyWingDetailItem[];
  calculateMaxAmenity: (wingName?: string | null) => number;
  t: (key: string) => string;
}

export function AmenitySelection({
  form,
  setForm,
  errors,
  setErrors,
  wingDetails,
  calculateMaxAmenity,
  t,
}: AmenitySelectionProps) {
  // Wing options from society wing details
  const wingOptions = useMemo(() => {
    const options = [
      { value: "", label: t("partitionForm.amenity.noWing") }
    ];
    
    wingDetails.forEach((detail) => {
      options.push({
        value: detail.wingNo,
        label: `${detail.wingNo} - ${detail.wingName}`
      });
    });
    
    return options;
  }, [wingDetails, t]);

  // Calculate max amenity based on selected wing
  const maxAmenity = useMemo(() => {
    return calculateMaxAmenity(form.selectedWingForAmenity || null);
  }, [calculateMaxAmenity, form.selectedWingForAmenity]);

  // Auto-set fromAmenity when maxAmenity changes
  useEffect(() => {
    const newFromAmenity = String(maxAmenity + 1);
    if (form.fromAmenity !== newFromAmenity) {
      setForm(prev => ({
        ...prev,
        fromAmenity: newFromAmenity,
      }));
    }
  }, [maxAmenity, form.fromAmenity, setForm]);

  // Calculate amenity display text
  const amenityDisplayText = useMemo(() => {
    if (!form.fromAmenity || !form.toAmenity) return "";
    
    const prefix = form.selectedWingForAmenity 
      ? `${form.selectedWingForAmenity}-AM`
      : "AM";
    
    const from = parseInt(form.fromAmenity);
    const to = parseInt(form.toAmenity);
    const count = Math.max(0, to - from + 1);
    
    return `${prefix}${from} ${t("partitionForm.to")} ${prefix}${to} (${count} ${t("partitionForm.amenity.amenities")})`;
  }, [form.selectedWingForAmenity, form.fromAmenity, form.toAmenity, t]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {t("partitionForm.amenity.description")}
        </p>
      </div>

      {/* Wing Selection */}
      <div>
        <Select
          label={t("partitionForm.amenity.selectWing")}
          value={form.selectedWingForAmenity}
          onChange={(_, value) => {
            setForm({ ...form, selectedWingForAmenity: value, toAmenity: "" });
            setErrors({ ...errors, selectedWingForAmenity: undefined, toAmenity: undefined });
          }}
          options={wingOptions}
          placeholder={t("partitionForm.amenity.placeholders.selectWing")}
        />
        <ValidationMessage
          message={errors.selectedWingForAmenity}
          visible={!!errors.selectedWingForAmenity}
          type="error"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t("partitionForm.amenity.fromAmenity")}
            type="number"
            value={form.fromAmenity}
            onChange={(e) => {
              setForm({ ...form, fromAmenity: e.target.value });
              setErrors({ ...errors, fromAmenity: undefined });
            }}
            placeholder="1"
            required
            disabled
            className="bg-gray-50 font-bold text-blue-800"
          />
          <ValidationMessage
            message={errors.fromAmenity}
            visible={!!errors.fromAmenity}
            type="error"
          />
        </div>

        <div>
          <Input
            label={t("partitionForm.amenity.toAmenity")}
            type="number"
            value={form.toAmenity}
            onChange={(e) => {
              setForm({ ...form, toAmenity: e.target.value });
              setErrors({ ...errors, toAmenity: undefined });
            }}
            placeholder="5"
            required
          />
          <ValidationMessage
            message={errors.toAmenity}
            visible={!!errors.toAmenity}
            type="error"
          />
        </div>
      </div>

      {amenityDisplayText && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">
            {t("partitionForm.amenity.amenitiesWillBeCreated")} {amenityDisplayText}
          </p>
        </div>
      )}
    </div>
  );
}
  