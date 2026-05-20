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
  /** Maximum length for names (150 characters) */
  NAME_MAX_LENGTH: 150,
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
  /** Maximum length for person names - Manager, Secretary, LandOwner, Builder (150 characters) */
  PERSON_NAME_MAX_LENGTH: 150,
  /** Maximum length for society/building name (150 characters) */
  SOCIETY_NAME_MAX_LENGTH: 150,
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
   * Names must NOT contain any numbers (0-9)
   * @param name - Name to validate
   * @returns True if name meets minimum and maximum length requirements and doesn't contain numbers
   */
  isValidName: (name: string): boolean => {
    const trimmed = name.trim();

    // Check if name contains any numbers (0-9) - REJECT if found
    if (/\d/.test(trimmed)) return false;

    return (
      trimmed.length >= KYC_VALIDATION_RULES.NAME_MIN_LENGTH &&
      trimmed.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH
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
   * Check if value contains only special characters (invalid)
   * @param value - Value to check
   * @returns True if value contains only special characters
   */
  isOnlySpecialCharacters: (value: string): boolean => {
    if (!value || !value.trim()) return false;
    // Check if string contains only special characters and no valid letters
    const hasValidChars = /[\p{L}]/u.test(value);
    return !hasValidChars;
  },

  /**
   * Validate person name length and format
   * Names must NOT contain any numbers (0-9)
   * @param name - Name to validate
   * @returns True if name meets society person name length requirements and doesn't contain numbers or only special characters
   */
  isValidPersonName: (name: string): boolean => {
    if (!name) return true; // Empty is valid (optional field)
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    // Check if name contains any numbers (0-9) - REJECT if found
    if (/\d/.test(trimmed)) return false;

    // Check for special-character-only values
    if (societyValidators.isOnlySpecialCharacters(trimmed)) return false;
    const length = trimmed.length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH &&
      length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH;
  },

  /**
   * Validate society/building name length and format
   * Names must NOT contain any numbers (0-9)
   * @param name - Name to validate
   * @returns True if name meets society name length requirements and doesn't contain numbers or only special characters
   */
  isValidSocietyName: (name: string): boolean => {
    if (!name) return true; // Empty is valid (optional field)
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    // Check if name contains any numbers (0-9) - REJECT if found
    if (/\d/.test(trimmed)) return false;

    // Check for special-character-only values
    if (societyValidators.isOnlySpecialCharacters(trimmed)) return false;
    const length = trimmed.length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH &&
      length <= SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH;
  },

  /**
   * Validate mobile number (10 digits starting with 6-9)
   * @param mobile - Mobile number string
   * @returns True if valid (empty or exactly 10 digits and starting with 6-9)
   */
  isValidMobile: (mobile: string): boolean => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length === 0) return true;
    return digits.length === SOCIETY_VALIDATION_RULES.MOBILE_LENGTH && /^[6-9]/.test(digits);
  },

  /**
   * Validate email format and length - only allows letters, numbers, periods, and @ symbol
   * Rejects underscores, hyphens, plus signs, and all other special characters
   * Allows incomplete emails while typing (e.g., xyz@gmail.) but validates final format
   * @param email - Email to validate
   * @returns True if valid format and within length constraints
   */
  isValidEmail: (email: string, isStrict = false): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return true;

    // Only allow letters, numbers, periods, and @
    if (/[^a-zA-Z0-9@.]/.test(trimmedEmail)) return false;

    // Reject consecutive periods (..)
    if (/\.{2,}/.test(trimmedEmail)) return false;

    // Reject emails starting with period
    if (/^\./.test(trimmedEmail)) return false;

    // Reject period immediately before @
    if (/\.@/.test(trimmedEmail)) return false;

    // Ensure there's exactly one @ symbol
    if ((trimmedEmail.match(/@/g) || []).length !== 1) return false;

    // If email doesn't contain @, it's incomplete but not invalid yet
    if (!trimmedEmail.includes('@')) return !isStrict;

    // Check for valid domain structure
    const atIndex = trimmedEmail.indexOf('@');
    const domain = trimmedEmail.substring(atIndex + 1);

    // If domain is empty or too short, it's incomplete (allow while typing)
    if (!domain || domain.length < 2) return !isStrict;

    // If domain has a dot, check for valid TLD format
    if (domain.includes('.')) {
      const domainParts = domain.split('.');
      // Must have at least 2 parts (domain.tld)
      if (domainParts.length < 2) return false;
      // Last part (TLD) must be at least 2 chars and only letters
      const tld = domainParts[domainParts.length - 1];
      if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    } else {
      // Domain has no dot yet - allow while typing (e.g., xyz@gmail)
      return !isStrict;
    }

    // Strict email validation pattern for complete emails
    const validEmailPattern = /^[a-zA-Z0-9][a-zA-Z0-9.]*@[a-zA-Z0-9][a-zA-Z0-9.]*\.[a-zA-Z]{2,}$/;

    return trimmedEmail.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH &&
      validEmailPattern.test(trimmedEmail);
  },
} as const;

/**
 * Property validation rules and constraints
 */
export const PROPERTY_VALIDATION_RULES = {
  /** Maximum length for flat/shop number */
  FLAT_SHOP_NO_MAX_LENGTH: 50,
  /** Maximum length for plot number (3 digits only) */
  PLOT_NO_MAX_LENGTH: 3,
  /** Maximum length for plot area (3 digits only) */
  PLOT_AREA_MAX_LENGTH: 3,
  /** Maximum length for survey number */
  SURVEY_NO_MAX_LENGTH: 50,
  /** Maximum length for sub zone number */
  SUB_ZONE_NO_MAX_LENGTH: 50,
  /** Maximum length for residential toilet count (3 digits) */
  RESIDENTIAL_TOILET_MAX_LENGTH: 3,
  /** Maximum length for commercial toilet count (3 digits) */
  COMMERCIAL_TOILET_MAX_LENGTH: 3,
} as const;

/**
 * Property field validation helper functions
 * Provides reusable validators for property form fields
 */
export const propertyValidators = {
  /**
   * Check if value contains only invalid special characters
   * @param value - Value to check
   * @returns True if value is invalid (only special characters)
   */
  isOnlyInvalidCharacters: (value: string): boolean => {
    if (!value || !value.trim()) return false;
    // Check if string contains only invalid characters and no valid alphanumerics
    const hasValidChars = /[a-zA-Z0-9]/g.test(value);
    return !hasValidChars;
  },

  /**
   * Validate flat/shop number format
   * Allows alphanumeric and hyphen, but no other special characters
   * @param value - Flat/shop number to validate
   * @returns True if valid format
   */
  isValidFlatShopNo: (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional field)
    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    // Check for only invalid characters
    if (propertyValidators.isOnlyInvalidCharacters(trimmed)) return false;

    // Allow alphanumeric and hyphen only
    // Hyphen must be between valid characters
    const validPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    return validPattern.test(trimmed);
  },

  /**
   * Validate plot number format
   * Allows alphanumeric only, no special characters
   * @param value - Plot number to validate
   * @returns True if valid format
   */
  isValidPlotNo: (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional field)
    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    // Check for only invalid characters
    if (propertyValidators.isOnlyInvalidCharacters(trimmed)) return false;

    // Allow alphanumeric only
    const validPattern = /^[a-zA-Z0-9]+$/;
    return validPattern.test(trimmed);
  },

  /**
   * Validate numeric field (like plot area, toilet count)
   * Only allows positive numbers, no negative values
   * @param value - Numeric value to validate
   * @returns True if valid (empty or positive number)
   */
  isValidPositiveNumber: (value: string | number | null | undefined): boolean => {
    if (value === null || value === undefined || value === '') return true; // Empty is valid
    const num = Number(value);
    return !isNaN(num) && num >= 0 && isFinite(num);
  },

  /**
   * Validate survey number format
   * Allows alphanumeric and common survey number separators (/, -)
   * @param value - Survey number to validate
   * @returns True if valid format
   */
  isValidSurveyNo: (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional field)
    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    // Check for only invalid characters
    if (propertyValidators.isOnlyInvalidCharacters(trimmed)) return false;

    // Allow alphanumeric and / or - as separators
    const validPattern = /^[a-zA-Z0-9]+([-/][a-zA-Z0-9]+)*$/;
    return validPattern.test(trimmed);
  },

  /**
   * Validate sub zone number format
   * Allows alphanumeric and hyphen
   * @param value - Sub zone number to validate
   * @returns True if valid format
   */
  isValidSubZoneNo: (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional field)
    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    // Check for only invalid characters
    if (propertyValidators.isOnlyInvalidCharacters(trimmed)) return false;

    // Allow alphanumeric and hyphen
    const validPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
    return validPattern.test(trimmed);
  },

  /**
   * Validate address field - should not contain only special characters
   * @param value - Address to validate
   * @returns True if valid (contains valid characters)
   */
  isValidAddress: (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional field)
    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    // Check if address contains at least some valid characters
    const hasValidChars = /[\p{L}\p{N}]/u.test(trimmed);
    return hasValidChars;
  },
} as const;

/**
 * Enhanced KYC validators with stricter email validation
 */
export const enhancedKycValidators = {
  /**
   * Enhanced email validation - only allows letters, numbers, periods, and @ symbol
   * Rejects underscores, hyphens, plus signs, and all other special characters
   * Allows incomplete emails while typing (e.g., xyz@gmail.) but validates final format
   * @param email - Email address to validate
   * @returns True if valid or empty, false if invalid format
   */
  isValidEmail: (email: string, isStrict = false): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return true;

    // Only allow letters, numbers, periods, and @
    if (/[^a-zA-Z0-9@.]/.test(trimmedEmail)) return false;

    // Reject consecutive periods (..)
    if (/\.{2,}/.test(trimmedEmail)) return false;

    // Reject emails starting with period
    if (/^\./.test(trimmedEmail)) return false;

    // Reject period immediately before @
    if (/\.@/.test(trimmedEmail)) return false;

    // Ensure there's exactly one @ symbol
    if ((trimmedEmail.match(/@/g) || []).length !== 1) return false;

    // If email doesn't contain @, it's incomplete but not invalid yet
    if (!trimmedEmail.includes('@')) return !isStrict;

    // Check for valid domain structure - must have at least one dot after @
    const atIndex = trimmedEmail.indexOf('@');
    const domain = trimmedEmail.substring(atIndex + 1);

    // If domain is empty or doesn't have content, it's incomplete (allow while typing)
    if (!domain || domain.length < 2) return !isStrict;

    // If domain has a dot, check for valid TLD format
    if (domain.includes('.')) {
      const domainParts = domain.split('.');
      // Must have at least 2 parts (domain.tld)
      if (domainParts.length < 2) return false;
      // Last part (TLD) must be at least 2 chars and only letters
      const tld = domainParts[domainParts.length - 1];
      if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    } else {
      // Domain has no dot yet - allow while typing (e.g., xyz@gmail)
      return !isStrict;
    }

    // Strict email validation pattern for complete emails
    const validEmailPattern = /^[a-zA-Z0-9][a-zA-Z0-9.]*@[a-zA-Z0-9][a-zA-Z0-9.]*\.[a-zA-Z]{2,}$/;

    return validEmailPattern.test(trimmedEmail) && trimmedEmail.length <= KYC_VALIDATION_RULES.EMAIL_MAX_LENGTH;
  },

  /**
   * Validate address - should not contain only special characters
   * @param address - Address to validate
   * @returns True if valid
   */
  isValidAddress: (address: string): boolean => {
    if (!address) return true;
    const trimmed = address.trim();
    if (trimmed.length === 0) return true;

    // Check if address contains at least some valid letters or numbers
    const hasValidChars = /[\p{L}\p{N}]/u.test(trimmed);
    return hasValidChars;
  },

  /**
   * Validate shop name - must NOT contain numbers (0-9)
   * @param name - Shop name to validate
   * @returns True if valid (no numbers, not only special characters)
   */
  isValidShopName: (name: string): boolean => {
    if (!name) return true;
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    // Check if contains at least some valid letters or numbers
    const hasValidChars = /[\p{L}\p{N}]/u.test(trimmed);
    return hasValidChars;
  },

  /**
   * Validate occupier name - must NOT contain numbers (0-9)
   * @param name - Occupier name to validate
   * @returns True if valid (no numbers, not only special characters)
   */
  isValidOccupierName: (name: string): boolean => {
    if (!name) return true;
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    // Check if name contains any numbers (0-9) - REJECT if found
    if (/\d/.test(trimmed)) return false;

    // Check if contains at least some valid letters
    const hasValidChars = /[\p{L}]/u.test(trimmed);
    return hasValidChars;
  },
} as const;

export const MAX_PROPERTY_ID = 2147483647; // Maximum value for a signed 32-bit integer
