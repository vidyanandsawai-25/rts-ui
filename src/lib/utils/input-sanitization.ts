/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Use these functions before setting any user input to state.
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 * while preserving valid international characters
 * Blocks invalid special characters like *()_++_)(&&^%$#@!~!!@#$%}{};'.,, etc.
 * 
 * @param input - Raw user input string
 * @returns Sanitized string safe for display
 */
export const sanitizeTextInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Block invalid special characters - only allow letters, numbers, spaces, and basic punctuation
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u0900-\u097F\u0D00-\u0D7F\s.,\'\-\/()&]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s+/g, ' ');
};

/**
 * Sanitize email input
 * 
 * @param email - Raw email input
 * @returns Sanitized email string
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>()[\]\\,;:\s@"]/g, match => {
      // Keep @ symbol, remove other dangerous chars
      return match === '@' ? match : '';
    });
};

/**
 * Sanitize numeric input
 * 
 * @param input - Raw numeric input
 * @returns String containing only digits
 */
export const sanitizeNumericInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/\D/g, '');
};

/**
 * Escape HTML special characters
 * Use this when you need to display user input as-is
 * 
 * @param text - Text to escape
 * @returns HTML-safe string
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, char => map[char] || char);
};

/**
 * Validate and sanitize a name input
 * Allows letters, spaces, hyphens, apostrophes, dots, and common punctuation
 * Blocks all invalid special characters like *()_++_)(&&^%$#@!~!!@#$%}{};'.,, etc.
 * 
 * @param name - Raw name input
 * @returns Sanitized name with only valid characters
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Block all invalid special characters - only allow letters, spaces, and . , ' -
    // Supports international characters (Unicode letters)
    .replace(/[^a-zA-Z\u00C0-\u024F\u0900-\u097F\u0D00-\u0D7F\s.,'\-]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s+/g, ' ');
};

/**
 * Sanitize address input
 * More permissive than name sanitization but still blocks invalid special characters
 * Allows letters, numbers, spaces, and common address punctuation (.,/-#)
 * Blocks: *()_++_)(&&^%$@!~!!@#$%}{};'.,, etc.
 * Also blocks consecutive special characters and address with only special characters
 * 
 * @param address - Raw address input
 * @returns Sanitized address
 */
export const sanitizeAddress = (address: string): string => {
  if (!address || typeof address !== 'string') return '';
  
  const sanitized = address
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Block invalid special characters - only allow letters, numbers, spaces, and address-safe punctuation
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u0900-\u097F\u0D00-\u0D7F\s.,\-\/\#]/g, '')
    // Remove multiple consecutive special characters (e.g., ----, ////)
    .replace(/([.,\-\/\#])\1+/g, '$1')
    // Remove multiple consecutive spaces
    .replace(/\s+/g, ' ');
  
  // If result contains only special characters and no alphanumeric, return empty
  if (sanitized.trim() && !/[a-zA-Z0-9\u00C0-\u024F\u0900-\u097F\u0D00-\u0D7F]/.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};

/**
 * Sanitize flat/shop number input
 * Allows alphanumeric and hyphen only
 * Blocks consecutive hyphens like -----
 * 
 * @param input - Raw flat/shop number input
 * @returns Sanitized flat/shop number
 */
export const sanitizeFlatShopNo = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const sanitized = input
    // Allow only alphanumeric and hyphen
    .replace(/[^a-zA-Z0-9-]/g, '')
    // Block consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    .trim();
  
  // If only special characters (hyphens), return empty
  if (sanitized && !/[a-zA-Z0-9]/.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};

/**
 * Sanitize plot number input
 * Allows alphanumeric only
 * 
 * @param input - Raw plot number input
 * @returns Sanitized plot number
 */
export const sanitizePlotNo = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Allow only alphanumeric characters
  return input
    .replace(/[^a-zA-Z0-9]/g, '')
    .trim();
};

/**
 * Sanitize survey number input
 * Allows alphanumeric and common separators (/, -)
 * Blocks consecutive separators like ///// or -----
 * 
 * @param input - Raw survey number input
 * @returns Sanitized survey number
 */
export const sanitizeSurveyNo = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const sanitized = input
    // Allow alphanumeric and / or - separators
    .replace(/[^a-zA-Z0-9/-]/g, '')
    // Block consecutive separators
    .replace(/([/-])\1+/g, '$1')
    // Remove leading/trailing separators
    .replace(/^[/-]+|[/-]+$/g, '')
    .trim();
  
  // If only special characters, return empty
  if (sanitized && !/[a-zA-Z0-9]/.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};

/**
 * Sanitize sub zone number input
 * Allows alphanumeric and hyphen
 * Blocks consecutive hyphens like -----
 * 
 * @param input - Raw sub zone number input
 * @returns Sanitized sub zone number
 */
export const sanitizeSubZoneNo = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const sanitized = input
    // Allow alphanumeric and hyphen
    .replace(/[^a-zA-Z0-9-]/g, '')
    // Block consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    .trim();
  
  // If only special characters, return empty
  if (sanitized && !/[a-zA-Z0-9]/.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};

/**
 * Sanitize positive number input
 * Removes negative signs, allows only digits and decimal point
 * 
 * @param input - Raw number input
 * @returns Sanitized positive number string
 */
export const sanitizePositiveNumber = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove negative signs and allow only digits and one decimal point
  let sanitized = input.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return sanitized;
};

/**
 * Sanitize positive integer input
 * Allows only digits, no negative values or decimals
 * 
 * @param input - Raw integer input
 * @returns Sanitized positive integer string
 */
export const sanitizePositiveInteger = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Allow only digits
  return input.replace(/[^0-9]/g, '');
};

/**
 * Enhanced email sanitization with stricter rules
 * Only allows: letters (a-z), numbers (0-9), periods (.), and @ symbol
 * Blocks all other characters including underscores, hyphens, plus signs, etc.
 * Allows user to type periods freely - validation will catch invalid patterns like .......
 * 
 * @param email - Raw email input
 * @returns Sanitized email string
 */
export const sanitizeEmailStrict = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  let sanitized = email
    .toLowerCase()
    .trim()
    // Only keep letters, numbers, @ and period - remove everything else
    // This allows valid email characters while blocking ###, _++, ()()-----, etc.
    .replace(/[^a-z0-9@.]/g, '');
  
  // DO NOT modify consecutive periods - let user type freely
  // Validation will catch patterns like pra.jed.......e@gmail.com as invalid
  
  // Block leading period only
  sanitized = sanitized.replace(/^\./, '');
  
  // Ensure only one @ symbol - if multiple, keep only first occurrence
  const atIndex = sanitized.indexOf('@');
  if (atIndex !== -1) {
    const beforeAt = sanitized.substring(0, atIndex + 1);
    const afterAt = sanitized.substring(atIndex + 1).replace(/@/g, '');
    sanitized = beforeAt + afterAt;
  }
  
  // If result is only special characters (no alphanumeric), return empty
  if (sanitized && !/[a-z0-9]/.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};
