/**
 * Common validation functions for forms
 */

export type Validator = (value: unknown) => string | undefined;

/* ================= CONSTANTS ================= */
//ConstructionTypeMaster 

// Construction Code: Allow alphanumeric characters plus spaces and hyphens (A-Z, a-z, 0-9, space, -)
export const CONSTRUCTION_CODE_REGEX = /^[A-Za-z0-9 -]+$/;
export const CONSTRUCTION_CODE_SANITIZE = /[^A-Za-z0-9 -]/g; // Remove any characters except alphanumeric, space, and hyphen

// Description: Allow all languages (Marathi, Hindi, English) with basic punctuation
export const DESCRIPTION_REGEX = /^[\p{L}\p{M}\p{N}\s\/,.\-()]+$/u;
export const DESCRIPTION_SANITIZE = /[^\p{L}\p{M}\p{N}\s\/,.\-()]/gu;

//taxZone

export const TEXT_SANITIZE = /[^\p{L}\p{M}\p{N}\s,.\-\/]/gu; // Allow Unicode letters, marks, numbers, spaces, and basic punctuation
export const TEXT_ALLOWED = /^[\p{L}\p{M}\p{N}\s,.\-\/]+$/u; // Validation for allowed characters

export const SEARCH_KEY_REGEX = /^[A-Za-z0-9+\-]+$/;
/**
 * Generic form validation function
 */
export const validateForm = (data: unknown, schema: Record<string, Validator>): Record<string, string> => {
  const errors: Record<string, string> = {};
  const formData = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {};

  Object.keys(schema).forEach((key) => {
    const validator = schema[key];
    if (validator) {
      const error = validator(formData[key]);
      if (error) errors[key] = error;
    }
  });

  return errors;
};

/**
 * Check if a form has any errors
 */
export const hasErrors = (errors: Record<string, string>) => Object.keys(errors).length > 0;

/**
 * Common validation rules
 */
export const commonValidations = {
  /**
   * Validation for codes (required, alphanumeric, max length)
   */
  code: (
    label: string,
    t: (key: string, values?: Record<string, string | number | Date>) => string
  ): Validator => (value: unknown) => {
    const strVal = String(value || "");
    if (!strVal || !strVal.trim()) return t('validation.required', { label });
    if (!/^[a-zA-Z0-9-]+$/.test(strVal)) return t('validation.alphanumeric', { label });
    if (strVal.length > 50) return t('validation.tooLong', { label });
    return undefined;
  },

  /**
   * Validation for names (required, max length)
   */
  name: (
    label: string,
    t: (key: string, values?: Record<string, string | number | Date>) => string
  ): Validator => (value: unknown) => {
    const strVal = String(value || "");
    if (!strVal || !strVal.trim()) return t('validation.required', { label });
    if (strVal.length > 100) return t('validation.tooLong', { label });
    return undefined;
  },

  /**
   * Validation for descriptions (optional by default, max length)
   */
  description: (
    label: string,
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    required: boolean = false
  ): Validator => (value: unknown) => {
    const strVal = String(value || "");
    if (required && (!strVal || !strVal.trim())) return t('validation.required', { label });
    if (strVal && strVal.length > 500) return t('validation.tooLong', { label });
    return undefined;
  }
};