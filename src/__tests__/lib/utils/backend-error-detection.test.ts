import { describe, it, expect } from 'vitest';
import {
  isBackendErrorMessage,
  isDuplicateError,
  getErrorStatusCode,
} from '@/lib/utils/backend-error-detection';

describe('backend-error-detection', () => {
  describe('isBackendErrorMessage', () => {
    it('should return true for messages with error keywords', () => {
      expect(isBackendErrorMessage('Operation failed')).toBe(true);
      expect(isBackendErrorMessage('Error occurred')).toBe(true);
      expect(isBackendErrorMessage('Invalid input')).toBe(true);
      expect(isBackendErrorMessage('Record already exists')).toBe(true);
      expect(isBackendErrorMessage('Duplicate entry found')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isBackendErrorMessage('OPERATION FAILED')).toBe(true);
      expect(isBackendErrorMessage('Error')).toBe(true);
      expect(isBackendErrorMessage('INVALID')).toBe(true);
    });

    it('should return false for success messages', () => {
      expect(isBackendErrorMessage('Operation successful')).toBe(false);
      expect(isBackendErrorMessage('Record created')).toBe(false);
      expect(isBackendErrorMessage('Success')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isBackendErrorMessage(null)).toBe(false);
      expect(isBackendErrorMessage(undefined)).toBe(false);
      expect(isBackendErrorMessage('')).toBe(false);
    });
  });

  describe('isDuplicateError', () => {
    it('should return true for duplicate error messages', () => {
      expect(isDuplicateError('Record already exists')).toBe(true);
      expect(isDuplicateError('Duplicate entry found')).toBe(true);
      expect(isDuplicateError('This item already exists in the database')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isDuplicateError('ALREADY EXISTS')).toBe(true);
      expect(isDuplicateError('Duplicate')).toBe(true);
    });

    it('should return false for non-duplicate errors', () => {
      expect(isDuplicateError('Operation failed')).toBe(false);
      expect(isDuplicateError('Invalid input')).toBe(false);
      expect(isDuplicateError('Error occurred')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isDuplicateError(null)).toBe(false);
      expect(isDuplicateError(undefined)).toBe(false);
      expect(isDuplicateError('')).toBe(false);
    });
  });

  describe('getErrorStatusCode', () => {
    it('should return 409 for duplicate errors', () => {
      expect(getErrorStatusCode('Record already exists')).toBe(409);
      expect(getErrorStatusCode('Duplicate entry')).toBe(409);
    });

    it('should return 500 for other errors', () => {
      expect(getErrorStatusCode('Operation failed')).toBe(500);
      expect(getErrorStatusCode('Invalid input')).toBe(500);
      expect(getErrorStatusCode('Error occurred')).toBe(500);
    });

    it('should return 500 for null or undefined', () => {
      expect(getErrorStatusCode(null)).toBe(500);
      expect(getErrorStatusCode(undefined)).toBe(500);
      expect(getErrorStatusCode('')).toBe(500);
    });
  });
});
