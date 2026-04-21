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
  name?: string | null;
  userRoleId?: number;
  userRole?: string | null;
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
