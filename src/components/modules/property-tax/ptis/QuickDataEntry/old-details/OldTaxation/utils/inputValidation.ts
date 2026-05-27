/**
 * Input validation and sanitization utilities for Old Taxation form
 * Ensures data quality and consistency
 */

/**
 * Sanitizes alphanumeric input with allowed special characters
 * Allows: letters, numbers, spaces, hyphens, forward slashes
 */
export const sanitizeAlphanumeric = (value: string): string => {
  return value.replace(/[^A-Za-z0-9\s\-\/]/g, '');
};

/**
 * Sanitizes alphanumeric input without spaces
 * Allows: letters, numbers, hyphens, forward slashes only
 */
export const sanitizeAlphanumericNoSpaces = (value: string): string => {
  return value.replace(/[^A-Za-z0-9\-\/]/g, '');
};

/**
 * Validates and sanitizes decimal input
 * Allows up to 15 total digits and 4 decimal places
 */
export const sanitizeDecimal = (value: string): string => {
  if (value === '' || /^\d{0,15}(\.\d{0,4})?$/.test(value)) {
    return value;
  }
  return '';
};

/**
 * Checks if a string field value is valid (non-empty after trimming)
 */
export const isValidStringField = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Prevents invalid numeric key input
 */
export const preventInvalidNumericKeys = (e: React.KeyboardEvent): void => {
  if (['-', 'e', 'E', '+'].includes(e.key)) {
    e.preventDefault();
  }
};
