/**
 * KYC Validation Constants and Utilities
 * 
 * This module provides validation rules and helper functions for KYC (Know Your Customer)
 * form fields including Aadhar card numbers, mobile numbers, email addresses, and names.
 * 
 * @module kyc-validation
 */

/**
 * KYC validation rules and constraints
 * Used across KYC form components for consistent validation
 */
export const KYC_VALIDATION_RULES = {
  /** Required length for Aadhar card number (12 digits) */
  AADHAR_LENGTH: 12,
  /** Required length for mobile number (10 digits) */
  MOBILE_LENGTH: 10,
  /** Minimum length for names (2 characters) */
  NAME_MIN_LENGTH: 2,
  /** Maximum length for names (100 characters) */
  NAME_MAX_LENGTH: 100,
  /** Email validation regex pattern */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Maximum length for address fields (255 characters) */
  ADDRESS_MAX_LENGTH: 255,
  /** Maximum length for shop name (100 characters) */
  SHOP_NAME_MAX_LENGTH: 100,
  /** Maximum length for email fields (100 characters) */
  EMAIL_MAX_LENGTH: 100,
} as const;

/**
 * Society form validation rules and constraints
 * Based on database schema constraints
 */
export const SOCIETY_VALIDATION_RULES = {
  /** Required length for mobile number (10 digits) */
  MOBILE_LENGTH: 10,
  /** Minimum length for names (2 characters) */
  NAME_MIN_LENGTH: 2,
  /** Maximum length for person names - Manager, Secretary, LandOwner, Builder (200 characters) */
  PERSON_NAME_MAX_LENGTH: 200,
  /** Maximum length for society/building name (500 characters) */
  SOCIETY_NAME_MAX_LENGTH: 500,
  /** Maximum length for society address (200 characters) */
  ADDRESS_MAX_LENGTH: 200,
  /** Maximum length for email fields (100 characters) */
  EMAIL_MAX_LENGTH: 100,
} as const;

/**
 * Title options for KYC form owner/occupier selection
 * Includes English and commonly used romanized honorific options
 */
export const KYC_TITLE_OPTIONS = [
  { label: 'Mr', value: 'Mr' },
  { label: 'Mrs', value: 'Mrs' },
  { label: 'Ms', value: 'Ms' },
  { label: 'Dr', value: 'Dr' },
  { label: 'Prof', value: 'Prof' },
  { label: 'Shri', value: 'Shri' },
  { label: 'Smt', value: 'Smt' },
  { label: 'Kumari', value: 'Kumari' },
] as const;

/**
 * KYC validation helper functions
 * Provides reusable validators for common KYC form fields
 */
export const kycValidators = {
  /**
   * Validate email address format
   * @param email - Email address to validate
   * @returns True if valid or empty, false if invalid format
   */
  isValidEmail: (email: string): boolean => {
    const trimmedEmail = email.trim();
    return !trimmedEmail || KYC_VALIDATION_RULES.EMAIL_REGEX.test(trimmedEmail);
  },

  /**
   * Validate name length and format
   * @param name - Name to validate
   * @returns True if name meets minimum and maximum length requirements
   */
  isValidName: (name: string): boolean => {
    return (
      name.trim().length >= KYC_VALIDATION_RULES.NAME_MIN_LENGTH &&
      name.trim().length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH
    );
  },

  /**
   * Validate mobile number (10 digits)
   * Allows empty values or exactly 10 digits
   * @param mobile - Mobile number string (can include non-digit characters)
   * @returns True if valid (empty or exactly 10 digits)
   */
  isValidMobile: (mobile: string): boolean => {
    const digits = mobile.replace(/\D/g, '');
    return digits.length === 0 || digits.length === KYC_VALIDATION_RULES.MOBILE_LENGTH;
  },

  /**
   * Validate Aadhar card number (12 digits)
   * Allows empty values or exactly 12 digits
   * @param aadhar - Aadhar number string (can include non-digit characters)
   * @returns True if valid (empty or exactly 12 digits)
   */
  isValidAadhar: (aadhar: string): boolean => {
    const digits = aadhar.replace(/\D/g, '');
    return digits.length === 0 || digits.length === KYC_VALIDATION_RULES.AADHAR_LENGTH;
  },
} as const;

/**
 * Society validation helper functions
 * Provides reusable validators for society form fields
 */
export const societyValidators = {
  /**
   * Validate person name length
   * @param name - Name to validate
   * @returns True if name meets society person name length requirements
   */
  isValidPersonName: (name: string): boolean => {
    const length = name.trim().length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH && 
           length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH;
  },

  /**
   * Validate society/building name length
   * @param name - Name to validate
   * @returns True if name meets society name length requirements
   */
  isValidSocietyName: (name: string): boolean => {
    const length = name.trim().length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH && 
           length <= SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH;
  },

  /**
   * Validate mobile number (10 digits)
   * @param mobile - Mobile number string
   * @returns True if valid (empty or exactly 10 digits)
   */
  isValidMobile: (mobile: string): boolean => {
    const digits = mobile.replace(/\D/g, '');
    return digits.length === 0 || digits.length === SOCIETY_VALIDATION_RULES.MOBILE_LENGTH;
  },

  /**
   * Validate email format and length
   * @param email - Email to validate
   * @returns True if valid format and within length constraints
   */
  isValidEmail: (email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return true;
    return trimmedEmail.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH && 
           KYC_VALIDATION_RULES.EMAIL_REGEX.test(trimmedEmail);
  },
} as const;

