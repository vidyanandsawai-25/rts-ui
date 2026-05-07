/**
 * Utility functions for detecting and handling backend API error responses
 */

/**
 * Error keywords that indicate a backend error message
 */
const ERROR_KEYWORDS = [
  'error',
  'failed',
  'invalid',
  'already exists',
  'duplicate',
] as const;

/**
 * Duplicate error keywords for specific duplicate detection
 */
const DUPLICATE_KEYWORDS = ['already exists', 'duplicate'] as const;

/**
 * Checks if a message string contains error-indicating keywords
 * 
 * @param message - The message string to check
 * @returns True if the message contains error keywords, false otherwise
 * 
 * @example
 * isBackendErrorMessage('Operation failed') // true
 * isBackendErrorMessage('Success') // false
 */
export function isBackendErrorMessage(message: string | undefined | null): boolean {
  if (!message) return false;
  
  const lowerMsg = message.toLowerCase();
  return ERROR_KEYWORDS.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Checks if a message indicates a duplicate entry error
 * 
 * @param message - The message string to check
 * @returns True if the message indicates a duplicate, false otherwise
 * 
 * @example
 * isDuplicateError('Record already exists') // true
 * isDuplicateError('Invalid input') // false
 */
export function isDuplicateError(message: string | undefined | null): boolean {
  if (!message) return false;
  
  const lowerMsg = message.toLowerCase();
  return DUPLICATE_KEYWORDS.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Determines the appropriate HTTP status code based on error message
 * 
 * @param message - The error message string
 * @returns 409 for duplicate errors, 500 for other errors
 * 
 * @example
 * getErrorStatusCode('Record already exists') // 409
 * getErrorStatusCode('Operation failed') // 500
 */
export function getErrorStatusCode(message: string | undefined | null): number {
  return isDuplicateError(message) ? 409 : 500;
}
