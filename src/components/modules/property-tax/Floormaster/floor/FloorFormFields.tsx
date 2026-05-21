'use client';

import { Input, ValidationMessage } from '@/components/common';
import type { FloorFormModel } from '@/types/floor.types';
import type React from 'react';
import { FLOOR_CODE_MAX, DESCRIPTION_MAX } from './validation';

/* ================= TYPES ================= */
interface FloorFormFieldsProps {
  formData: FloorFormModel;
  errors: Partial<Record<keyof FloorFormModel, string>>;
  showError: (field: keyof FloorFormModel) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  labels: {
    floorCode: string;
    floorCodePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    sequenceNo: string;
    sequenceNoPlaceholder: string;
  };
}

/* ================= COMPONENT ================= */
/**
 * Extracted form field group for FloorForm.
 * Handles: Floor Code, Description, Sequence No inputs + their validation messages.
 * Parent (FloorForm) owns state, validation logic, and submit handler.
 */
export function FloorFormFields({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
  labels,
}: Readonly<FloorFormFieldsProps>) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <Input
        name="floorCode"
        label={labels.floorCode}
        required
        placeholder={labels.floorCodePlaceholder}
        value={formData.floorCode}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth
        maxLength={FLOOR_CODE_MAX}
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.floorCode}
        visible={showError('floorCode')}
      />

      <Input
        name="description"
        label={labels.description}
        required
        placeholder={labels.descriptionPlaceholder}
        value={formData.description}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth
        maxLength={DESCRIPTION_MAX}
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.description}
        visible={showError('description')}
      />

      <Input
        name="sequenceNo"
        label={labels.sequenceNo}
        type="number"
        placeholder={labels.sequenceNoPlaceholder}
        value={formData.sequenceNo === 0 ? '' : formData.sequenceNo}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.sequenceNo}
        visible={showError('sequenceNo')}
      />
    </div>
  );
}
