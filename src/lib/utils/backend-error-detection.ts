/**
 * Utility functions for detecting and handling backend API error responses
 */

/**
 * Error keywords that indicate a backend error message
 */
const ERROR_KEYWORDS = ['error', 'failed', 'invalid', 'already exists', 'duplicate'] as const;

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
  return ERROR_KEYWORDS.some((keyword) => lowerMsg.includes(keyword));
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
  return DUPLICATE_KEYWORDS.some((keyword) => lowerMsg.includes(keyword));
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

/**
 * Safely extracts a clean, human-readable error message from any error object,
 * JSON string, or standard Error instance, avoiding raw JSON or context prefix wrappers.
 */
export function getCleanErrorMessage(
  err: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (!err) return defaultMessage;

  if (err && typeof err === 'object') {
    const errorObj = err as Record<string, unknown>;

    // Try extracting responseText/error from ApiError
    let rawText = (errorObj.responseText || errorObj.error || errorObj.message) as
      | string
      | undefined;

    if (rawText && typeof rawText === 'string') {
      rawText = rawText.trim();
      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        try {
          const parsed = JSON.parse(rawText) as Record<string, unknown>;
          if (parsed.message && typeof parsed.message === 'string') {
            return parsed.message;
          }
          if (parsed.error && typeof parsed.error === 'string') {
            return parsed.error;
          }
          if (parsed.errors && typeof parsed.errors === 'object') {
            const firstError = Object.values(parsed.errors)[0];
            if (typeof firstError === 'string') return firstError;
            if (Array.isArray(firstError) && typeof firstError[0] === 'string')
              return firstError[0];
          }
        } catch {}
      }
    }

    if (errorObj.message && typeof errorObj.message === 'string') {
      const match = errorObj.message.match(/^[^:]+:\s*(.+?)\s*\(\d+\)$/);
      if (match && match[1]) {
        const inner = match[1];
        if (inner.startsWith('{') && inner.endsWith('}')) {
          try {
            const parsed = JSON.parse(inner) as Record<string, unknown>;
            if (parsed.message && typeof parsed.message === 'string') return parsed.message;
          } catch {}
        }
        return inner;
      }
      return errorObj.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  const strErr = String(err);
  if (strErr.startsWith('{') && strErr.endsWith('}')) {
    try {
      const parsed = JSON.parse(strErr) as Record<string, unknown>;
      if (parsed.message && typeof parsed.message === 'string') return parsed.message;
    } catch {}
  }

  return strErr;
}
