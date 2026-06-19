import { EMAIL_REGEX, VALID_TLD_REGEX } from '../validation-rules';

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
 * Check if a number contains repeated or invalid sequences
 * Rejects patterns like 00000, 111111, 222222, etc.
 */
const hasRepeatedSequence = (digits: string, minLength: number = 5): boolean => {
  if (!digits || digits.length < minLength) return false;

  for (let i = 0; i <= digits.length - minLength; i++) {
    const char = digits[i];
    let count = 1;
    for (let j = i + 1; j < digits.length && digits[j] === char; j++) {
      count++;
      if (count >= minLength) return true;
    }
  }
  return false;
};

export const societyValidators = {
  /**
   * Check if value contains only special characters (invalid)
   */
  isOnlySpecialCharacters: (value: string): boolean => {
    if (!value || !value.trim()) return false;
    const hasValidChars = /[\p{L}]/u.test(value);
    return !hasValidChars;
  },

  /**
   * Validate person name length and format
   */
  isValidPersonName: (name: string): boolean => {
    if (!name) return true;
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    if (/\d/.test(trimmed)) return false;

    if (societyValidators.isOnlySpecialCharacters(trimmed)) return false;
    const length = trimmed.length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH &&
      length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH;
  },

  /**
   * Validate society/building name length and format
   */
  isValidSocietyName: (name: string): boolean => {
    if (!name) return true;
    const trimmed = name.trim();
    if (trimmed.length === 0) return true;

    if (/\d/.test(trimmed)) return false;

    if (societyValidators.isOnlySpecialCharacters(trimmed)) return false;
    const length = trimmed.length;
    return length >= SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH &&
      length <= SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH;
  },

  /**
   * Validate mobile number (10 digits starting with 6-9)
   */
  isValidMobile: (mobile: string): boolean => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length === 0) return true;
    if (digits.length !== SOCIETY_VALIDATION_RULES.MOBILE_LENGTH || !/^[6-9]/.test(digits)) return false;

    return !hasRepeatedSequence(digits, 5);
  },

  /**
   * Validate email format and length
   */
  isValidEmail: (email: string, isStrict = false): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return true;

    if (/[^a-zA-Z0-9@.]/.test(trimmedEmail)) return false;

    if (/\.{2,}/.test(trimmedEmail)) return false;

    if (/^\./.test(trimmedEmail)) return false;

    if (/\.@/.test(trimmedEmail)) return false;

    if ((trimmedEmail.match(/@/g) || []).length !== 1) return false;

    if (!trimmedEmail.includes('@')) return !isStrict;

    const atIndex = trimmedEmail.indexOf('@');
    const domain = trimmedEmail.substring(atIndex + 1);

    if (!domain || domain.length < 2) return !isStrict;

    if (domain.includes('.')) {
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false;
      const tld = domainParts[domainParts.length - 1];
      if (!tld || tld.length < 2 || !VALID_TLD_REGEX.test(tld)) return false;
    } else {
      return !isStrict;
    }

    const validEmailPattern = EMAIL_REGEX;

    return trimmedEmail.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH &&
      validEmailPattern.test(trimmedEmail);
  },

  /**
   * Validate society address format and length
   */
  isValidAddress: (address: string): boolean => {
    if (!address) return true;
    const trimmed = address.trim();
    if (trimmed.length === 0) return true;

    // Check if address contains at least some valid letters or numbers
    const hasValidChars = /[\p{L}\p{N}]/u.test(trimmed);
    if (!hasValidChars) return false;

    return trimmed.length <= SOCIETY_VALIDATION_RULES.ADDRESS_MAX_LENGTH;
  },
} as const;
