/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Use these functions before setting any user input to state.
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 * while preserving valid international characters
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
    // Trim whitespace
    .trim();
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
 * Allows letters, spaces, hyphens, apostrophes, and dots
 * 
 * @param name - Raw name input
 * @returns Sanitized name
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Allow only valid name characters (letters, spaces, hyphens, apostrophes, dots)
    // Supports international characters
    .replace(/[^a-zA-Z\u00C0-\u024F\u0900-\u097F\s'-.\u0D00-\u0D7F]/g, '')
    .trim();
};

/**
 * Sanitize address input
 * More permissive than name sanitization
 * 
 * @param address - Raw address input
 * @returns Sanitized address
 */
export const sanitizeAddress = (address: string): string => {
  if (!address || typeof address !== 'string') return '';
  
  return address
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
};
