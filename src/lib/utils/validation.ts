/**
 * Common validation functions for forms
 */

export type Validator = (value: unknown) => string | undefined;

/* ================= CONSTANTS ================= */
//ConstructionTypeMaster 

// Construction Code: Allow alphanumeric, underscore, hyphen (no spaces)
export const CONSTRUCTION_CODE_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const CONSTRUCTION_CODE_SANITIZE = /[^a-zA-Z0-9_\-]/g;

// Description: Allow all languages (Marathi, Hindi, English) with basic punctuation
export const DESCRIPTION_REGEX = /^[\p{L}\p{M}\s\/,.\-()0-9\u200C\u200D]+$/u;
export const DESCRIPTION_SANITIZE = /[^\p{L}\p{M}\s\/,.\-()0-9\u200C\u200D]/gu;

//taxZone

// Zone No: Only letters, marks (for Devanagari), and numbers (no spaces, no punctuation)
export const ZONE_NO_ALLOWED = /^[\p{L}\p{M}\p{N}]+$/u; // Validation for Zone No (stricter)
export const ZONE_NO_SANITIZE = /[^\p{L}\p{M}\p{N}]/gu; // Sanitize Zone No

// Zone Type and Remark: Allow letters, marks, numbers, spaces, and basic punctuation
export const TEXT_SANITIZE = /[^\p{L}\p{M}\p{N}\s,./-]/gu; // Allow Unicode letters, marks, numbers, spaces, and basic punctuation
export const TEXT_ALLOWED = /^[\p{L}\p{M}\p{N}\s,./-]+$/u; // Validation for allowed characters

// RVRateMaster - Positive decimal validation (only numbers > 0 with decimals allowed)
export const POSITIVE_DECIMAL_REGEX = /^(?!0(\.0+)?$)\d+(\.\d+)?$/;
export const POSITIVE_DECIMAL_INVALID_KEYS = /^[eE+\-]$/; // Regex pattern to match invalid keys for positive decimal input

/**
 * Validate positive decimal number (greater than 0, no negative, no letters, no special chars)
 * @param value - The value to validate
 * @returns true if valid positive decimal, false otherwise
 */
export const isPositiveDecimal = (value: string | number): boolean => {
  if (value === '' || value === null || value === undefined) return false;
  const strValue = String(value).trim();
  return POSITIVE_DECIMAL_REGEX.test(strValue) && Number(strValue) > 0;
};

/**
 * Sanitize input to allow only positive decimal numbers
 * Removes any invalid characters and ensures value is positive
 * @param value - The input value
 * @returns Sanitized positive decimal value or empty string
 */
export const sanitizePositiveDecimal = (value: string): string => {
  // Remove all non-numeric characters except dot
  let sanitized = value.replace(/[^\d.]/g, '');
  
  // Allow only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Remove leading zeros (except for decimals like 0.5)
  if (sanitized.startsWith('0') && sanitized.length > 1 && !sanitized.startsWith('0.')) {
    sanitized = sanitized.replace(/^0+/, '');
  }
  
  return sanitized;
};

/**
 * Generic form validation function
 */
  export const validateForm = (data: unknown, schema: Record<string, Validator>) => {
  const errors: Record<string, string> = {};
  const formData = data as Record<string, unknown>;
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
    if (!CONSTRUCTION_CODE_REGEX.test(strVal)) return t('validation.alphanumeric', { label });
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
