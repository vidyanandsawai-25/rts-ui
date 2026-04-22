'use client';

/**
 * Custom hook for login form state management.
 * 
 * Following the pattern from useConstructionForm.ts for consistent
 * form handling across the application.
 * 
 * @module useLoginForm
 */

import {
  useState,
  useCallback,
  useMemo,
  type ChangeEvent,
  type FocusEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useTranslations } from 'next-intl';
import {
  AUTH_CONSTRAINTS,
  USERNAME_SANITIZE,
  PASSWORD_SANITIZE,
  AUTH_ERROR_CODES,
} from '@/components/modules/login/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
}

export interface UseLoginFormOptions {
  /** Initial username value (e.g., from URL param or cookie) */
  initialUsername?: string;
  /** Callback when form is submitted successfully (before action) */
  onBeforeSubmit?: (data: LoginFormData) => void;
}

export interface UseLoginFormReturn {
  /** Current form data */
  formData: LoginFormData;
  /** Current validation errors */
  errors: LoginFormErrors;
  /** Which fields have been touched/interacted with */
  touched: Record<string, boolean>;
  /** Whether form has been submitted at least once */
  submittedOnce: boolean;
  /** Handle input change with sanitization */
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Handle input blur for validation */
  handleBlur: (e: FocusEvent<HTMLInputElement>) => void;
  /** Check if error should be shown for a field */
  showError: (field: keyof LoginFormErrors) => boolean;
  /** Validate entire form, returns true if valid */
  validateForm: () => boolean;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Set form data directly (for external updates) */
  setFormData: Dispatch<SetStateAction<LoginFormData>>;
  /** Mark form as submitted */
  markSubmitted: () => void;
  /** Check if form is valid (no errors) */
  isValid: boolean;
  /** Check if form can be submitted (has required data) */
  canSubmit: boolean;
}

// ---------------------------------------------------------------------------
// Hook Implementation
// ---------------------------------------------------------------------------

export function useLoginForm(options: UseLoginFormOptions = {}): UseLoginFormReturn {
  const { initialUsername = '' } = options;
  
  const t = useTranslations('common.login');
  
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    username: initialUsername,
    password: '',
  });
  
  // Validation state
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  
  const validate = useCallback((data: LoginFormData): LoginFormErrors => {
    const errs: LoginFormErrors = {};
    
    // Username validation
    const trimmedUsername = data.username.trim();
    if (!trimmedUsername) {
      errs.username = t(`errors.${AUTH_ERROR_CODES.USERNAME_REQUIRED}`);
    } else if (trimmedUsername.length < AUTH_CONSTRAINTS.USERNAME_MIN_LENGTH) {
      errs.username = t(`errors.${AUTH_ERROR_CODES.USERNAME_TOO_SHORT}`);
    } else if (trimmedUsername.length > AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH) {
      errs.username = t(`errors.${AUTH_ERROR_CODES.USERNAME_TOO_LONG}`);
    }
    
    // Password validation
    if (!data.password) {
      errs.password = t(`errors.${AUTH_ERROR_CODES.PASSWORD_REQUIRED}`);
    } else if (data.password.length > AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH) {
      errs.password = t(`errors.${AUTH_ERROR_CODES.PASSWORD_TOO_LONG}`);
    }
    
    return errs;
  }, [t]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    
    if (name === 'username') {
      // Sanitize username - remove invalid characters
      sanitizedValue = value.replace(USERNAME_SANITIZE, '');
      // Enforce max length
      if (sanitizedValue.length > AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH) {
        sanitizedValue = sanitizedValue.slice(0, AUTH_CONSTRAINTS.USERNAME_MAX_LENGTH);
      }
    } else if (name === 'password') {
      // Remove zero-width and control characters
      sanitizedValue = value.replace(PASSWORD_SANITIZE, '');
      // Enforce max length
      if (sanitizedValue.length > AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH) {
        sanitizedValue = sanitizedValue.slice(0, AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error for this field on change
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof LoginFormErrors];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate this field
    const fieldErrors = validate(formData);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name as keyof LoginFormErrors],
    }));
  }, [formData, validate]);

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

  const showError = useCallback((field: keyof LoginFormErrors): boolean => {
    return (submittedOnce || touched[field]) && !!errors[field];
  }, [submittedOnce, touched, errors]);

  const validateForm = useCallback((): boolean => {
    const allErrors = validate(formData);
    setErrors(allErrors);
    setSubmittedOnce(true);
    
    // Mark all fields as touched
    setTouched({
      username: true,
      password: true,
    });
    
    return Object.keys(allErrors).length === 0;
  }, [formData, validate]);

  const resetForm = useCallback(() => {
    setFormData({
      username: initialUsername,
      password: '',
    });
    setErrors({});
    setTouched({});
    setSubmittedOnce(false);
  }, [initialUsername]);

  const markSubmitted = useCallback(() => {
    setSubmittedOnce(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const canSubmit = useMemo(() => {
    const hasUsername = formData.username.trim().length >= AUTH_CONSTRAINTS.USERNAME_MIN_LENGTH;
    const hasPassword = formData.password.length > 0;
    return hasUsername && hasPassword;
  }, [formData]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    formData,
    errors,
    touched,
    submittedOnce,
    handleChange,
    handleBlur,
    showError,
    validateForm,
    resetForm,
    setFormData,
    markSubmitted,
    isValid,
    canSubmit,
  };
}

// ---------------------------------------------------------------------------
// Error Message Helper Hook
// ---------------------------------------------------------------------------

/**
 * Maps {@link AUTH_ERROR_CODES} values to message keys under `common.login.errors`
 * when the key differs from the code (e.g. camelCase vs SCREAMING_SNAKE).
 */
const AUTH_ERROR_TO_LOGIN_I18N_KEY: Record<string, string> = {
  [AUTH_ERROR_CODES.CREDENTIALS_REQUIRED]: 'credentialsRequired',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'invalidCredentials',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: 'Auth_AccountLocked_Temporary',
  [AUTH_ERROR_CODES.ACCOUNT_INACTIVE]: 'ACCOUNT_INACTIVE',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'Auth_UserNotFound',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'SESSION_EXPIRED',
  [AUTH_ERROR_CODES.TOO_MANY_ATTEMPTS]: 'TOO_MANY_ATTEMPTS',
  [AUTH_ERROR_CODES.SERVICE_UNAVAILABLE]: 'serviceUnavailable',
  [AUTH_ERROR_CODES.REQUEST_TIMEOUT]: 'REQUEST_TIMEOUT',
  [AUTH_ERROR_CODES.LOGIN_FAILED]: 'LOGIN_FAILED',
  [AUTH_ERROR_CODES.PASSWORD_CHANGE_REQUIRED]: 'passwordChangeRequired',
  [AUTH_ERROR_CODES.INVALID_OTP_FORMAT]: 'enterValidToken',
  [AUTH_ERROR_CODES.VERIFICATION_FAILED]: 'VERIFICATION_FAILED',
  [AUTH_ERROR_CODES.RESEND_FAILED]: 'RESEND_FAILED',
  [AUTH_ERROR_CODES.RESET_FAILED]: 'RESET_FAILED',
  [AUTH_ERROR_CODES.INVALID_REQUEST]: 'INVALID_REQUEST',
  PASSWORDS_MISMATCH: 'passwordsMismatch',
};

/**
 * Hook to convert error codes to localized messages.
 * Separated for reuse in components that don't need full form management.
 */
export function useLoginErrorMessages() {
  const t = useTranslations('common.login');

  const getLocalizedError = useCallback((errorCode: string | undefined): string => {
    if (!errorCode) return '';

    const suffix = AUTH_ERROR_TO_LOGIN_I18N_KEY[errorCode] ?? errorCode;
    const primary = `errors.${suffix}`;

    if (typeof t.has === 'function' && t.has(primary)) {
      return t(primary);
    }

    const fallbackCode = `errors.${errorCode}`;
    if (typeof t.has === 'function' && t.has(fallbackCode)) {
      return t(fallbackCode);
    }

    try {
      return t(primary);
    } catch {
      try {
        return t(fallbackCode);
      } catch {
        try {
          return t('errors.LOGIN_FAILED');
        } catch {
          return errorCode;
        }
      }
    }
  }, [t]);

  return { getLocalizedError };
}
