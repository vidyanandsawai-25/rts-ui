"use client";

import { Input, ValidationMessage } from "@/components/common";
import { PartitionFormState, PartitionFormErrors } from "@/types/zone-master/properties/partition-form.types";

interface NonApartmentPartitionSectionProps {
  form: PartitionFormState;
  setForm: React.Dispatch<React.SetStateAction<PartitionFormState>>;
  errors: PartitionFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>;
  t: (key: string) => string;
}

export function NonApartmentPartitionSection({
  form,
  setForm,
  errors,
  setErrors,
  t,
}: NonApartmentPartitionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          {t("partitionForm.nonApartment.description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t("partitionForm.fromPartition")}
            type="number"
            value={form.fromPartition}
            onChange={(e) => {
              setForm({ ...form, fromPartition: e.target.value });
              setErrors({ ...errors, fromPartition: undefined });
            }}
            placeholder="1"
            required
            disabled
            className="bg-gray-50 font-bold text-blue-800"
          />
          <ValidationMessage
            message={errors.fromPartition}
            visible={!!errors.fromPartition}
            type="error"
          />
        </div>

        <div>
          <Input
            label={t("partitionForm.toPartition")}
            type="number"
            value={form.toPartition}
            onChange={(e) => {
              setForm({ ...form, toPartition: e.target.value });
              setErrors({ ...errors, toPartition: undefined });
            }}
            placeholder={t("partitionForm.placeholders.toPartition")}
            required
          />
          <ValidationMessage
            message={errors.toPartition}
            visible={!!errors.toPartition}
            type="error"
          />
        </div>
      </div>

      {form.fromPartition && form.toPartition && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {t("partitionForm.partitionRangePrefix")} {form.fromPartition} {t("partitionForm.to")} {form.toPartition} ({Math.max(0, parseInt(form.toPartition) - parseInt(form.fromPartition) + 1)} {t("partitionForm.partitions")})
          </p>
        </div>
      )}
    </div>
  );
}
