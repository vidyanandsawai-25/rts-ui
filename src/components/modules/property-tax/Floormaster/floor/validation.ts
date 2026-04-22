/**
 * Validation logic for Floor form
 */

import {
  CODE_REGEX,
  CODE_SANITIZE,
  DESCRIPTION_REGEX,
  DESCRIPTION_SANITIZE,
  commonValidations,
} from '@/lib/utils/validation';
import { FloorFormModel } from '@/types/floor.types';

/* ================= CONSTANTS ================= */
export const FLOOR_CODE_MAX = 7;
export const DESCRIPTION_MAX = 100;

/* ================= TYPES ================= */
type TranslateFunction = (key: string, params?: Record<string, unknown>) => string;

/* ================= VALIDATION ================= */
export function validateFloorForm(
  data: FloorFormModel,
  t: TranslateFunction,
  isEdit: boolean
): Partial<Record<keyof FloorFormModel, string>> {
  const errors: Partial<Record<keyof FloorFormModel, string>> = {};

  const floorCode = data.floorCode.trim();
  const description = data.description.trim();

  // Floor Code validation
  if (!floorCode) {
    errors.floorCode = t('form.validation.codeRequired');
  } else if (floorCode.length > FLOOR_CODE_MAX) {
    errors.floorCode = t('form.validation.codeMaxLength', { count: FLOOR_CODE_MAX });
  } else if (!CODE_REGEX.test(floorCode)) {
    errors.floorCode = t('form.validation.codeFormat');
  }

  // Description validation
  if (!description) {
    errors.description = t('form.validation.descriptionRequired');
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = t('form.validation.descriptionMaxLength', { count: DESCRIPTION_MAX });
  } else if (!DESCRIPTION_REGEX.test(description)) {
    errors.description = t('form.validation.descriptionFormat');
  }

  // Sequence number validation
  if (!Number.isFinite(data.sequenceNo) || data.sequenceNo < 0) {
    errors.sequenceNo = t('validation.mustBeNumber');
  }

  // isActive validation
  const isActiveError = commonValidations.masterActiveStatus(t, isEdit)(data.isActive);
  if (isActiveError) {
    errors.isActive = isActiveError;
  }

  return errors;
}

/* ================= SANITIZATION ================= */
export function sanitizeFloorCode(value: string): string {
  let sanitized = value.replace(CODE_SANITIZE, '');
  if (sanitized.length > FLOOR_CODE_MAX) {
    sanitized = sanitized.substring(0, FLOOR_CODE_MAX);
  }
  return sanitized;
}

export function sanitizeDescription(value: string): string {
  let sanitized = value.replace(DESCRIPTION_SANITIZE, '');
  if (sanitized.length > DESCRIPTION_MAX) {
    sanitized = sanitized.substring(0, DESCRIPTION_MAX);
  }
  return sanitized;
}
