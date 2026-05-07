/**
 * Unified Floor Submission Validation
 * 
 * Single source of truth for all floor-related validation
 * Uses Zod schema for both form and API payload validation
 * Eliminates dual validation system code smell
 * 
 * @module floor-submission-validation
 */

import { ActionResult } from '@/types/common.types';
import { FloorSubmissionPayload } from '@/types/floor-details.types';
import {
  validateFloorSubmissionPayload as zodValidate,
  FloorSubmissionSchemaType,
} from './floor-submission.schema';
import {
  floorFormSchema,
} from './floor-form.schema';

/**
 * Validate floor form data (client-side)
 * Returns validation result with field-level errors
 * 
 * @param data - Floor form data to validate
 * @returns Validation result with success flag and errors object
 * 
 * @example
 * const result = validateFloorForm(editingFloorForm);
 * if (!result.success) {
 *   setFormErrors(result.errors);
 * }
 */
export function validateFloorForm(data: unknown) {
  const result = floorFormSchema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    return { success: false as const, isValid: false, errors };
  }

  return { success: true as const, isValid: true, data: result.data, errors: {} };
}

/**
 * Validate individual field (for real-time validation)
 * 
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @returns Validation result for single field
 * 
 * @example
 * const result = validateField('conYr', '2024');
 * if (!result.isValid) {
 *   setFormErrors(prev => ({ ...prev, conYr: result.error }));
 * }
 */
export function validateField(fieldName: string, value: unknown) {
  const fieldSchema = floorFormSchema.shape[fieldName as keyof typeof floorFormSchema.shape];

  if (!fieldSchema) {
    return { isValid: true, error: undefined };
  }

  const result = fieldSchema.safeParse(value);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues[0].message
    };
  }

  return { isValid: true, error: undefined };
}

/**
 * Centralized validation for FloorSubmissionPayload using Zod schema.
 * Returns { success: true } if valid, else { success: false, error }.
 * Error messages are translation keys that should be translated in the UI layer.
 */
export function validateFloorSubmissionPayload(payload: FloorSubmissionPayload): ActionResult<FloorSubmissionSchemaType> {
  const result = zodValidate(payload);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.errorKey };
}

/**
 * Export schema functions for backward compatibility
 */
export { floorSubmissionSchema } from './floor-submission.schema';
export type { FloorSubmissionSchemaType } from './floor-submission.schema';
