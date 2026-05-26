"use client";

import { Input, ValidationMessage, CancelButton } from "@/components/common";
import { PartitionFormErrors } from "@/types/partition-form.types";
import { sanitizeTextInput } from "@/lib/utils/input-sanitization";
import { KYC_VALIDATION_RULES } from "@/lib/utils/kyc-validation.constants";

interface AddWingFormProps {
  newWingId: number | null;
  newWingName: string;
  setNewWingName: (name: string) => void;
  errors: PartitionFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PartitionFormErrors>>;
  addingWing: boolean;
  editingSocietyDetailId: number | null;
  onCancel: () => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export function AddWingForm({
  newWingId,
  newWingName,
  setNewWingName,
  errors,
  setErrors,
  addingWing,
  editingSocietyDetailId,
  onCancel,
  t,
  tCommon,
}: AddWingFormProps) {
  return (
    <div className="p-3 border border-green-200 rounded-lg bg-green-50/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
          {editingSocietyDetailId ? t("partitionForm.wing.editWing") : t("partitionForm.wing.addWing")}
        </h4>
        <CancelButton
          size="xs"
          onClick={onCancel}
          label={tCommon("buttons.cancel")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t("partitionForm.wing.wingId")}
          </label>
          <Input
            value={String(newWingId || "")}
            disabled
            className="bg-gray-100 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t("partitionForm.wing.wingName")} <span className="text-red-500">*</span>
          </label>
          <Input
            value={newWingName}
            onChange={(e) => {
              const sanitized = sanitizeTextInput(e.target.value);
              if (sanitized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
                setNewWingName(sanitized);
                setErrors({ ...errors, wingName: undefined });
              }
            }}
            placeholder={t("partitionForm.wing.placeholders.wingLetter")}
            maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
            className="bg-white"
            disabled={addingWing}
          />
          <ValidationMessage
            message={errors.wingName}
            visible={!!errors.wingName}
            type="error"
          />
        </div>
      </div>
    </div>
  );
}
