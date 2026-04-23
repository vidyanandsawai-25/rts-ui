import type { ChangeEvent, Dispatch, FocusEvent, SetStateAction } from 'react';
import { UlbMaster } from '@/types/master.types';

// ---------------------------------------------------------------------------
// Page & Component Props
// ---------------------------------------------------------------------------

export interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/** Resolved on the server (`getTranslations`) so the login shell ships real copy in the RSC HTML. */
export interface LoginFormCopy {
  loginTitle: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  showPassword: string;
  hidePassword: string;
}

export interface LoginFormProps {
  username?: string;
  locale: string;
  errorMessage?: string;
  /** SSR flash (e.g. query-driven messages). */
  infoMessage?: string;
  ulbData?: UlbMaster;
  /** Server-resolved UI strings for SSR + shared client fields. */
  copy: LoginFormCopy;
}

// ---------------------------------------------------------------------------
// `useLoginForm` hook
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
// API Request DTOs
// ---------------------------------------------------------------------------

export interface LogoutRequest {
  sessionId: string;
}

export interface ChangePasswordRequest {
  userName: string;
  newPassword: string;
  mustChangePassword?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// API Response DTOs
// ---------------------------------------------------------------------------

export interface UserInfo {
  userId: number;
  userName: string;
  userCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  address: string;
  preferredLanguage: string;
  lastLoginAt: string;
  roles: string[];
  permissions: string[];
}

/** POST `/Auth/login` — response JSON when HTTP succeeds. */
export interface AuthLoginApiBody {
  success: boolean;
  token?: string;
  refreshToken?: string;
  userId?: number;
  username?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  message?: string;
  expiresAt?: string;
  requiresPasswordChange?: boolean;
}

/** GET `/UlbConfig` — response JSON when HTTP succeeds. */
export interface UlbConfigApiBody {
  ulbId: number;
  ulbCode: string;
  ulbName: string;
  ulbNameLocal?: string | null;
  ulbLogo?: string | null;
  emailId?: string | null;
  mobileNo?: string | null;
  websiteUrl?: string | null;
  ulbAddress?: string | null;
  state?: string | null;
  district?: string | null;
}

export interface TokenValidationResponse {
  isValid: boolean;
  user?: UserInfo;
  message: string | null;
}

export interface LoginAttempt {
  id: number;
  ipAddress: string | null;
  userAgent: string | null;
  attemptedAt: string;
  wasSuccessful: boolean;
  isCurrentSession: boolean;
}
