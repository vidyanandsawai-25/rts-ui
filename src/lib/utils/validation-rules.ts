/**
 * Validation Rules - Regular expressions and sanitization patterns
 * 
 * @module validation-rules
 * 
 * ## Exports
 * 
 * ### Code Validation
 * - `CODE_REGEX` - Validates alphanumeric and underscore (A-Z, a-z, 0-9, _) - underscore only in between
 * - `CODE_SANITIZE` - Removes invalid characters for code fields
 * 
 * ### Description Validation
 * - `DESCRIPTION_REGEX` - Validates multilingual text with punctuation (&, -, /, etc.) - special chars only in between, single space only
 * - `DESCRIPTION_SANITIZE` - Removes invalid characters for descriptions
 * 
 * ### Text Validation
 * - `TEXT_SANITIZE` - Generic text sanitization
 * - `TEXT_ALLOWED` - Generic text validation - single space only
 * 
 * ### Search Validation
 * - `SEARCH_KEY_REGEX` - Search key validation
 */

/* ================= CODE VALIDATION ================= */
// Generic Code Validation: Allow alphanumeric characters and underscore (A-Z, a-z, 0-9, _)
// Must start and end with alphanumeric, underscore only allowed in between
// Used across all modules (Construction, Tax Zone, etc.)
export const CODE_REGEX = /^[A-Za-z0-9]+([A-Za-z0-9_]*[A-Za-z0-9]+)*$/;
export const CODE_SANITIZE = /[^A-Za-z0-9_]/g; // Remove any characters except alphanumeric and underscore

/* ================= DESCRIPTION VALIDATION ================= */
// Description: Allow all languages (Marathi, Hindi, English) with basic punctuation
// Special characters (&, -, /, etc.) must be in between other characters
// Only single space allowed between characters, no consecutive spaces
export const DESCRIPTION_REGEX = /^[\p{L}\p{M}\p{N}]+(([\p{L}\p{M}\p{N}\/,.\-()&]|\s(?!\s))*[\p{L}\p{M}\p{N}]+)*$/u;
export const DESCRIPTION_SANITIZE = /[^\p{L}\p{M}\p{N}\s\/,.\-()&]/gu;

/* ================= TEXT VALIDATION ================= */
// Allow Unicode letters, marks, numbers, spaces, and basic punctuation including &
export const TEXT_SANITIZE = /[^\p{L}\p{M}\p{N}\s,.\-\/&]/gu;
// Validation for allowed characters, special chars in between, single space only, allows single char
export const TEXT_ALLOWED = /^[\p{L}\p{M}\p{N}]+(([\p{L}\p{M}\p{N},.\-\/&]|\s(?!\s))*[\p{L}\p{M}\p{N}]+)*$/u;

/* ================= TRANSLATION TEXT VALIDATION ================= */
// Translation text: Allow multilingual characters, underscore, hyphen, basic punctuation
// Does NOT allow: @#$%^*&
// Allows: Unicode letters, marks, numbers, spaces, comma, period, hyphen, slash, underscore, parentheses
export const TRANSLATION_TEXT_SANITIZE = /[^\p{L}\p{M}\p{N}\s,.\-\/_()]/gu;

/* ================= SEARCH VALIDATION ================= */
export const SEARCH_KEY_REGEX = /^[A-Za-z0-9+\-]+$/;

/* ================= SOCIETY VALIDATION ================= */
export const PERSON_NAME_REGEX = /^[\p{L}\p{M}\s.,'-]+$/u;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_LOWERCASE_RESTRICTED_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in)$/;
export const MOBILE_10_REGEX = /^[6-9][0-9]{9}$/;
export const PINCODE_6_REGEX = /^[0-9]{6}$/;
export const CITY_NAME_REGEX = /^[a-zA-Z\s]+$/;
export const YEAR_REGEX = /^\d{4}$/;


/* ================= POSITIVE DECIMAL VALIDATION ================= */
// Regex pattern to match invalid keys for positive decimal input (blocks e, E, +, -)
export const POSITIVE_DECIMAL_INVALID_KEYS = /^[eE+\-]$/;

/* ================= ALL ZEROS VALIDATION ================= */
/**
 * Check if a string contains only zeros (e.g., "0", "00", "000", "0000")
 * Used to prevent invalid codes/names like "0000" in Zone Master, Rate Section Master, etc.
 * @param value - The string value to check
 * @returns true if the value consists only of zeros, false otherwise
 */
export const isAllZeros = (value: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return /^0+$/.test(trimmed);
};
