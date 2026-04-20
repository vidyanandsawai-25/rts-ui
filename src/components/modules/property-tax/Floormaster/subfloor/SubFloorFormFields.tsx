'use client';

import { Input, ValidationMessage } from '@/components/common';
import type { SubFloorFormModel } from '@/types/floor.types';
import type React from 'react';

/* ================= TYPES ================= */
interface SubFloorFormFieldsProps {
  formData: SubFloorFormModel;
  errors: Partial<Record<keyof SubFloorFormModel, string>>;
  showError: (field: keyof SubFloorFormModel) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  labels: {
    code: string;
    codePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
  };
}

/* ================= COMPONENT ================= */
/**
 * Extracted form field group for SubFloorForm.
 * Handles: SubFloor Code, Description inputs + their validation messages.
 * Parent (SubFloorForm) owns state, validation logic, and submit handler.
 */
export function SubFloorFormFields({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
  labels,
}: Readonly<SubFloorFormFieldsProps>) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <Input
        name="subFloorCode"
        label={labels.code}
        required
        value={formData.subFloorCode}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={labels.codePlaceholder}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.subFloorCode}
        visible={showError('subFloorCode')}
      />

      <Input
        name="description"
        label={labels.description}
        required
        value={formData.description}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={labels.descriptionPlaceholder}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.description}
        visible={showError('description')}
      />
    </div>
  );
}
