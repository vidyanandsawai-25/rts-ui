/**
 * Validation Helpers - Utility functions for form validation
 * 
 * @module validation-helpers
 * 
 * ## Exports
 * 
 * ### Types
 * - `Validator` - Function type for field validators
 * 
 * ### Functions
 * - `validateForm(data, schema)` - Generic form validation function
 * - `hasErrors(errors)` - Check if validation errors exist
 */

export type Validator = (value: unknown) => string | undefined;

/**
 * Generic form validation function
 * 
 * @param data - Form data object
 * @param schema - Validation schema (field name -> validator function)
 * @returns Object with validation errors (field name -> error message)
 * 
 * @example
 * const schema = {
 *   code: (value) => !value ? "Code is required" : undefined,
 *   description: (value) => !value ? "Description is required" : undefined,
 * };
 * const errors = validateForm(formData, schema);
 */
export const validateForm = (
  data: unknown,
  schema: Record<string, Validator>
): Record<string, string> => {
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
 * 
 * @param errors - Errors object from validateForm
 * @returns True if there are any errors, false otherwise
 * 
 * @example
 * const errors = validateForm(formData, schema);
 * if (hasErrors(errors)) {
 *   // Show error message
 * }
 */
export const hasErrors = (errors: Record<string, string>): boolean =>
  Object.keys(errors).length > 0;
