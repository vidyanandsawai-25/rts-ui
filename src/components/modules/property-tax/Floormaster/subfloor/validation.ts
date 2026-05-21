/**
 * Validation logic for SubFloor form
 */

import {
  CODE_REGEX,
  CODE_SANITIZE,
  DESCRIPTION_REGEX,
  DESCRIPTION_SANITIZE,
  commonValidations,
} from '@/lib/utils/validation';
import { SubFloorFormModel } from '@/types/floor.types';

/* ================= CONSTANTS ================= */
export const SUBFLOOR_CODE_MAX = 5;
export const DESCRIPTION_MAX = 100;

/* ================= TYPES ================= */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFunction = (key: string, params?: Record<string, any>) => string;

/* ================= VALIDATION ================= */
export function validateSubFloorForm(
  data: SubFloorFormModel,
  t: TranslateFunction,
  isEdit: boolean
): Partial<Record<keyof SubFloorFormModel, string>> {
  const errors: Partial<Record<keyof SubFloorFormModel, string>> = {};

  const code = data.subFloorCode.trim();
  const description = data.description.trim();

  // SubFloor Code validation
  if (!code) {
    errors.subFloorCode = t('form.validation.codeRequired');
  } else if (code.length > SUBFLOOR_CODE_MAX) {
    errors.subFloorCode = t('form.validation.codeMaxLength', { count: SUBFLOOR_CODE_MAX });
  } else if (!CODE_REGEX.test(code)) {
    errors.subFloorCode = t('form.validation.codeFormat');
  }

  // Description validation
  if (!description) {
    errors.description = t('form.validation.descriptionRequired');
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = t('form.validation.descriptionMaxLength', { count: DESCRIPTION_MAX });
  } else if (!DESCRIPTION_REGEX.test(description)) {
    errors.description = t('form.validation.descriptionFormat');
  }

  // isActive validation
  const isActiveError = commonValidations.masterActiveStatus(t, isEdit)(data.isActive);
  if (isActiveError) {
    errors.isActive = isActiveError;
  }

  return errors;
}

/* ================= SANITIZATION ================= */
export function sanitizeSubFloorCode(value: string): string {
  let sanitized = value.replace(CODE_SANITIZE, '');
  if (sanitized.length > SUBFLOOR_CODE_MAX) {
    sanitized = sanitized.substring(0, SUBFLOOR_CODE_MAX);
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
