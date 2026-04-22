/**
 * Validation Schemas - Reusable validators for master forms
 * 
 * @module validation-schemas
 * 
 * ## Exports
 * 
 * ### Common Validators (commonValidations)
 * - `masterCode(t, maxLength, messageKeys)` - Generic code validation for all masters
 * - `masterDescription(t, maxLength, messageKeys)` - Generic description validation for all masters
 * - `masterSearchSequence(t, messageKey)` - Generic search sequence validation
 * - `masterActiveStatus(t, isEdit, messageKey)` - Generic active status validation
 * 
 * ### Schema Factory
 * - `createMasterValidationSchema(t, isEdit, config)` - Factory for master form validators
 * 
 * ### Backward Compatibility
 * - `constructionValidators` - Construction-specific validators
 */

import { 
  CODE_REGEX, 
  DESCRIPTION_REGEX,
  PERSON_NAME_REGEX,
  EMAIL_REGEX,
  MOBILE_10_REGEX
} from './validation-rules';
import type { Validator } from './validation-helpers';

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
  ): Validator => (fieldValue: unknown) => {
    const strVal = String(fieldValue ?? "").trim();
   
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
  ): Validator => (fieldValue: unknown) => {
    const strVal = String(fieldValue ?? "").trim();
   
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
  ): Validator => (fieldValue: unknown) => {
    const numVal = Number(fieldValue);
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
  ): Validator => (fieldValue: unknown) => {
    // ✅ Explicitly parse boolean values - handles both boolean and string types
    // Common with HTML inputs/FormData which store booleans as strings
    const isActive = fieldValue === true || fieldValue === "true";
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

/**
 * Society form validations
 */
export const societyValidations = {
  personName:
    (
      label: string,
      t: (key: string, values?: Record<string, string | number | Date>) => string
    ): Validator =>
    (value: unknown) => {
      const strVal = String(value ?? "").trim();
      if (!strVal) return undefined; // optional field
      if (!PERSON_NAME_REGEX.test(strVal)) {
        return t(`society.validation.${label}`);
      }
      return undefined;
    },

  email:
    (
      label: string,
      t: (key: string, values?: Record<string, string | number | Date>) => string
    ): Validator =>
    (value: unknown) => {
      const strVal = String(value ?? "").trim();
      if (!strVal) return undefined; // optional field
      if (!EMAIL_REGEX.test(strVal)) {
        return t(`society.validation.${label}`);
      }
      return undefined;
    },

  mobile10:
    (
      label: string,
      t: (key: string, values?: Record<string, string | number | Date>) => string
    ): Validator =>
    (value: unknown) => {
      const strVal = String(value ?? "").trim();
      if (!strVal) return undefined; // optional field
      if (!MOBILE_10_REGEX.test(strVal)) {
        return t(`society.validation.${label}`);
      }
      return undefined;
    },
};
