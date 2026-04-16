/**
 * Common validation functions for forms
 * 
 * @module validation
 * 
 * ## Exports
 * 
 * ### Constants (Regex & Sanitization)
 * - `CODE_REGEX` - Validates alphanumeric and underscore (A-Z, a-z, 0-9, _) - underscore only in between
 * - `CODE_SANITIZE` - Removes invalid characters for code fields
 * - `DESCRIPTION_REGEX` - Validates multilingual text with punctuation (&, -, /, etc.) - special chars only in between, single space only
 * - `DESCRIPTION_SANITIZE` - Removes invalid characters for descriptions
 * - `TEXT_SANITIZE` - Generic text sanitization
 * - `TEXT_ALLOWED` - Generic text validation - single space only
 * - `SEARCH_KEY_REGEX` - Search key validation
 * 
 * ### Functions
 * - `validateForm(data, schema)` - Generic form validation function
 * - `hasErrors(errors)` - Check if validation errors exist
 * - `createMasterValidationSchema(t, isEdit, config)` - Factory for master form validators
 * 
 * ### Validators (commonValidations)
 * - `masterCode(t, maxLength, messageKeys)` - Generic code validation for all masters
 * - `masterDescription(t, maxLength, messageKeys)` - Generic description validation for all masters
 * - `masterSearchSequence(t, messageKey)` - Generic search sequence validation
 * - `masterActiveStatus(t, isEdit, messageKey)` - Generic active status validation
 * 
 * ### Helpers
 * - `constructionValidators` - Backward compatibility helpers for construction module
 */

export type Validator = (value: unknown) => string | undefined;

/* ================= CONSTANTS ================= */
// Generic Code Validation: Allow alphanumeric characters and underscore (A-Z, a-z, 0-9, _)
// Must start and end with alphanumeric, underscore only allowed in between
// Used across all modules (Construction, Tax Zone, etc.)
export const CODE_REGEX = /^[A-Za-z0-9]+([A-Za-z0-9_]*[A-Za-z0-9]+)*$/;
export const CODE_SANITIZE = /[^A-Za-z0-9_]/g; // Remove any characters except alphanumeric and underscore

// Description: Allow all languages (Marathi, Hindi, English) with basic punctuation
// Special characters (&, -, /, etc.) must be in between other characters
// Only single space allowed between characters, no consecutive spaces
export const DESCRIPTION_REGEX = /^[\p{L}\p{M}\p{N}]+(([\p{L}\p{M}\p{N}\/,.\-()&]|\s(?!\s))*[\p{L}\p{M}\p{N}]+)*$/u;
export const DESCRIPTION_SANITIZE = /[^\p{L}\p{M}\p{N}\s\/,.\-()&]/gu;

//taxZone

export const TEXT_SANITIZE = /[^\p{L}\p{M}\p{N}\s,.\-\/&]/gu; // Allow Unicode letters, marks, numbers, spaces, and basic punctuation including &
export const TEXT_ALLOWED = /^[\p{L}\p{M}\p{N}]+(([\p{L}\p{M}\p{N},.\-\/&]|\s(?!\s))*[\p{L}\p{M}\p{N}]+)*$/u; // Validation for allowed characters, special chars in between, single space only, allows single char

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
 * Common validation rules for Master Forms
 * These validators are generic and can be used across all master forms (Construction, Tax Zone, etc.)
 */
export const commonValidations = {
  /**
   * Generic master code validation (alphanumeric and underscore)
   * Underscore (_) must be in between alphanumeric characters, not at start/end
   * Used for: Construction Code, Tax Zone Code, etc.
   * 
   * @param t - Translation function
   * @param maxLength - Maximum allowed length
   * @param messageKeys - Custom translation keys for errors
   */
  masterCode: (
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    maxLength: number = 50,
    messageKeys?: {
      required?: string;
      format?: string;
      maxLength?: string;
    }
  ): Validator => (value: unknown) => {
    const strVal = String(value || "").trim();
    
    const keys = {
      required: messageKeys?.required || 'form.validation.codeRequired',
      format: messageKeys?.format || 'form.validation.codeFormat',
      maxLength: messageKeys?.maxLength || 'form.validation.codeMaxLength',
    };
    
    if (!strVal) return t(keys.required);
    if (strVal.length > maxLength) return t(keys.maxLength, { count: maxLength });
    if (!CODE_REGEX.test(strVal)) return t(keys.format);
    return undefined;
  },

  /**
   * Generic master description validation (multilingual support)
   * Special characters (&, -, /, etc.) must be in between other characters, not at start/end
   * Only single space allowed between words, no consecutive spaces
   * Used for: Construction Description, Tax Zone Description, etc.
   * 
   * @param t - Translation function
   * @param maxLength - Maximum allowed length
   * @param messageKeys - Custom translation keys for errors
   */
  masterDescription: (
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    maxLength: number = 100,
    messageKeys?: {
      required?: string;
      format?: string;
      maxLength?: string;
    }
  ): Validator => (value: unknown) => {
    const strVal = String(value || "").trim();
    
    const keys = {
      required: messageKeys?.required || 'form.validation.descriptionRequired',
      format: messageKeys?.format || 'form.validation.descriptionFormat',
      maxLength: messageKeys?.maxLength || 'form.validation.descriptionMaxLength',
    };
    
    if (!strVal) return t(keys.required);
    if (strVal.length > maxLength) return t(keys.maxLength, { count: maxLength });
    if (!DESCRIPTION_REGEX.test(strVal)) return t(keys.format);
    return undefined;
  },

  /**
   * Generic search sequence validation
   * Used across all master forms
   * 
   * @param t - Translation function
   * @param messageKey - Custom translation key for invalid sequence error
   */
  masterSearchSequence: (
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    messageKey?: string
  ): Validator => (value: unknown) => {
    const numVal = Number(value);
    const key = messageKey || 'form.validation.sequenceInvalid';
    
    if (!Number.isFinite(numVal) || numVal < 0) {
      return t(key);
    }
    return undefined;
  },

  /**
   * Generic active status validation
   * Used across all master forms (new records must be active)
   * 
   * @param t - Translation function
   * @param isEdit - Whether this is an edit operation
   * @param messageKey - Custom translation key for must be active error
   */
  masterActiveStatus: (
    t: (key: string, values?: Record<string, string | number | Date>) => string,
    isEdit: boolean,
    messageKey?: string
  ): Validator => (value: unknown) => {
    const isActive = Boolean(value);
    const key = messageKey || 'form.validation.mustBeActive';
    
    if (!isActive && !isEdit) {
      return t(key);
    }
    return undefined;
  }
};

/**
 * Helper factory to create master form validation schema
 * Simplifies creating validators for master forms with consistent naming
 * 
 * @example
 * // For Construction Type Master - map to actual form field names
 * const schema = createMasterValidationSchema(t, isEdit, {
 *   code: { maxLength: 7, messageKeys: { 
 *     required: 'form.validation.constructionCodeRequired',
 *     format: 'form.validation.constructionCodeFormat',
 *     maxLength: 'form.validation.constructionCodeMaxLength'
 *   }},
 *   description: { maxLength: 100, messageKeys: {
 *     required: 'form.validation.descriptionRequired',
 *     format: 'form.validation.descriptionFormat',
 *     maxLength: 'form.validation.descriptionMaxLength'
 *   }},
 *   searchSequence: { messageKey: 'form.validation.sequenceInvalid' },
 *   activeStatus: { messageKey: 'form.validation.mustBeActive' }
 * });
 * // Then map schema keys to form model field names:
 * // constructionCode: schema.code, description: schema.description, etc.
 */
export const createMasterValidationSchema = (
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean,
  config: {
    code?: {
      maxLength?: number;
      messageKeys?: {
        required?: string;
        format?: string;
        maxLength?: string;
      };
    };
    description?: {
      maxLength?: number;
      messageKeys?: {
        required?: string;
        format?: string;
        maxLength?: string;
      };
    };
    searchSequence?: boolean | { messageKey?: string };
    activeStatus?: boolean | { messageKey?: string };
  }
) => {
  const schema: Record<string, Validator> = {};

  if (config.code) {
    schema.code = commonValidations.masterCode(
      t,
      config.code.maxLength,
      config.code.messageKeys
    );
  }

  if (config.description) {
    schema.description = commonValidations.masterDescription(
      t,
      config.description.maxLength,
      config.description.messageKeys
    );
  }

  if (config.searchSequence) {
    const messageKey = typeof config.searchSequence === 'object' 
      ? config.searchSequence.messageKey 
      : undefined;
    schema.searchSequence = commonValidations.masterSearchSequence(t, messageKey);
  }

  if (config.activeStatus) {
    const messageKey = typeof config.activeStatus === 'object' 
      ? config.activeStatus.messageKey 
      : undefined;
    schema.isActive = commonValidations.masterActiveStatus(t, isEdit, messageKey);
  }

  return schema;
};

/**
 * Backward compatibility - Construction-specific validators
 * These use the generic master validators with construction-specific message keys
 */
export const constructionValidators = {
  code: (t: (key: string, values?: Record<string, string | number | Date>) => string, maxLength: number = 7) =>
    commonValidations.masterCode(t, maxLength, {
      required: 'form.validation.constructionCodeRequired',
      format: 'form.validation.constructionCodeFormat',
      maxLength: 'form.validation.constructionCodeMaxLength',
    }),
  
  description: (t: (key: string, values?: Record<string, string | number | Date>) => string, maxLength: number = 100) =>
    commonValidations.masterDescription(t, maxLength, {
      required: 'form.validation.descriptionRequired',
      format: 'form.validation.descriptionFormat',
      maxLength: 'form.validation.descriptionMaxLength',
    }),
  
  searchSequence: (t: (key: string, values?: Record<string, string | number | Date>) => string) =>
    commonValidations.masterSearchSequence(t, 'form.validation.sequenceInvalid'),
  
  activeStatus: (t: (key: string, values?: Record<string, string | number | Date>) => string, isEdit: boolean) =>
    commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
};