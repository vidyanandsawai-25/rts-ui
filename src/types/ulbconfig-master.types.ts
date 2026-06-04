/**
 * Configuration Master Types
 * Consolidated interfaces for all system configuration modules
 */

import type { ComponentType } from 'react';
import type { SelectProps } from '@/components/common/select';
import type { TextAreaProps } from '@/components/common/Textarea';

/**
 * --- Common Interfaces ---
 */
export interface RenewalAlert {
  label: string;
  date: string;
  daysRemaining: number;
  triggered: boolean;
}

export interface CompletionStatus {
  ulbInfo: boolean;
  logoImages: boolean;
  projectLicenseInfo: boolean;
  departmentLicense: boolean;
}

/**
 * --- ULB Module Types ---
 */

/**
 * UlbConfigurationMaster Model (matches GET `/ULBMaster` API)
 */
export interface UlbConfigurationMaster {
  id: number;
  ulbCode: string;
  ulbName: string;
  ulbNameLocal?: string | null;
  ulbTypeId: number;
  ulbLogo?: string | null;
  emailId?: string | null;
  mobileNo?: string | null;
  alternateMobileNo?: string | null;
  websiteUrl?: string | null;
  contactPersonName?: string | null;
  contactPersonDesignation?: string | null;
  ulbAddress?: string | null;
  state?: string | null;
  district?: string | null;
  pinCode?: string | null;
  projectStartDate?: string | null;
  financialYearStartDate?: string | null;
  expectedGoLiveDate?: string | null;
  partnerName?: string | null;
  pmName?: string | null;
  pmEmailId?: string | null;
  pmMobileNo?: string | null;
  licenceType?: string | null;
  licenceStartDate?: string | null;
  licenceEndDate?: string | null;
  licenceDuration?: string | null;
  supportType?: string | null;
  licenceKey?: string | null;
  isActive?: boolean;
  createdDate?: string | null;
  updatedDate?: string | null;
}

/** Wrapped API response for POST/PUT `/ULBMaster`. */
export interface UlbMasterMutationResponse {
  success?: boolean;
  message?: string;
  items?: Record<string, unknown> | null;
  errors?: unknown;
  correlationId?: string | null;
}

/** Page-level data returned by SSR for the ULB configuration screen. */
export interface UlbConfigurationPageData {
  ulb: UlbConfigurationMaster | null;
  departments: Department[];
  licences: DepartmentLicenceDetails[];
}

/**
 * ULB Model (Frontend/Legacy compatibility)
 */
export interface ULB {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  state: string;
  district: string;
  address: string;
  pincode: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  website: string;
  population: number;
  area: number;
  established: string;
  departmentsActive: number;
  isActive: boolean;
  status: string;
}

export interface ULBConfigurationFormData {
  // ULB Information
  ulbName: string;
  ulbCode: string;
  ulbType: string;
  state: string;
  district: string;
  address: string;
  pincode: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;
  ulbLogo: string | null;

  // ULB Name Styling
  ulbNameFont: string;
  ulbNameColor: string;
  ulbNameSize: string;
  ulbNameWeight: string;
  ulbNameStyle: string;

  // Project Information
  projectStartDate: string;
  financialYearStart: string;
  goLiveDate: string;
  implementationPartner: string;
  projectManager: string;
  projectManagerEmail: string;
  projectManagerPhone: string;

  // Master License Information
  licenseType: string;
  licenseKey: string;
  licenseStartDate: string;
  licenseDuration: string;
  licenseEndDate: string;
  maxUsers: string;
  maxDepartments: string;
  supportType: string;
  renewalDate: string;
  licenseStatus: string;
}

export interface ULBImage {
  id: string;
  url: string;
  name: string;
  size: number;
  isBackgroundImage: boolean;
  uploadedDate: string;
}

export interface ULBImagesManagerProps {
  logoUrl?: string | null;
  onLogoChange: (url: string | null) => void;
}

export interface ULBResponseData {
  items: UlbConfigurationMaster;
  success: boolean;
  message: string;
  errors: unknown;
}

/**
 * --- Department Module Types ---
 */
export interface Department {
  departmentMasterId?: number;
  departmentId?: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentLicense {
  id: string;
  departmentMasterId?: number;
  departmentLicenceDetailsId?: number;
  name: string;
  enabled: boolean;
  startDate: string;
  duration: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  renewalAlerts: RenewalAlert[];
}

export interface DepartmentLicenceDetails {
  departmentLicenceDetailsId?: number;
  ulbMasterId?: number;
  departmentMasterId?: number;
  departmentId?: number;
  departmentCode?: string;
  departmentName?: string;
  licenceStartDate?: string;
  licenceEndDate?: string;
  licenceDuration?: string;
  isEnabled?: boolean;
  status?: string;
  isActive?: boolean;
}

/** Wrapped API response for POST/PUT `/DepartmentLicenceDetails`. */
export interface DepartmentLicenceMutationResponse {
  success?: boolean;
  message?: string;
  items?: Record<string, unknown> | null;
  errors?: unknown;
  correlationId?: string | null;
}

/**
 * --- Advanced Configuration Types ---
 */
export interface DepartmentConfig {
  departmentId: string;
  departmentName: string;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  enableTwoFactorAuth: boolean;
  requirePasswordChange: boolean;
  passwordComplexity: 'low' | 'medium' | 'high';
  submodules: Record<string, SubmoduleConfig>;
}

export interface SubmoduleConfig {
  submoduleId: string;
  submoduleName: string;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  enableTwoFactorAuth: boolean;
}

export interface BillingConfig {
  departmentId: string;
  departmentName: string;
  enableAutoBillGeneration: boolean;
  billGenerationDay: number;
  billGenerationFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';
  customDates: string[];
  dueAfterDays: number;
  enableLateFeePenalty: boolean;
  lateFeePercentage: number;
  enableReminders: boolean;
  reminderDaysBefore: number;
  submodules: Record<string, SubmoduleBillingConfig>;
}

export interface SubmoduleBillingConfig {
  submoduleId: string;
  submoduleName: string;
  enableAutoBillGeneration: boolean;
  billGenerationDay: number;
  billGenerationFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';
  customDates: string[];
  dueAfterDays: number;
}

export interface GlobalConfig {
  defaultPasswordExpiryDays: number;
  defaultSessionTimeoutMinutes: number;
  defaultMaxLoginAttempts: number;
  enableAuditLog: boolean;
  enableGlobalTwoFactorAuth: boolean;
  defaultPasswordComplexity: 'low' | 'medium' | 'high';
}

/**
 * --- User Management Types ---
 */
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  designation: string;
  hierarchyLevel: string;
  office: string;
  departments: string[];
  moduleAccess: { [key: string]: string[] };
  isActive: boolean;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  createdDate: string;
}

/**
 * --- Prop Interfaces ---
 */
export interface ConfigMasterProps {
  initialDepartments?: DepartmentConfig[];
  initialGlobalConfig?: GlobalConfig;
}

export interface DepartmentMasterProps {
  initialDepartments?: Department[];
}

export interface UlbConfigurationMasterProps {
  initialULBs?: ULB[];
}

export interface UserManagementProps {
  initialUsers?: User[];
}

export interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * ---------------------------------------------------------------------------
 * ULB Configuration — Module Types (component props, shared payloads, ids)
 * Consumed by:
 *   - src/components/modules/configuration-settings/ulb-configuration/**
 *   - src/hooks/configuration-settings/ulb-configuration/**
 * ---------------------------------------------------------------------------
 */

/** ID of each tab in the ULB Configuration workflow. */
export type UlbTabId =
  | 'ulb-info'
  | 'logo-images'
  | 'project-license-info'
  | 'department-license';

/** Sections that participate in per-section save / validation. */
export type UlbSectionKey = 'ulb-info' | 'logo-images' | 'project-license-info';

/** Shared payload describing the master license dates (passed to dept-license bulk-apply). */
export interface UlbMasterLicenseSnapshot {
  startDate: string;
  duration: string;
  endDate: string;
}

/** Generic callback signature for updating a single field of `ULBConfigurationFormData`. */
export type UlbFieldChangeHandler = <K extends keyof ULBConfigurationFormData>(
  field: K,
  value: ULBConfigurationFormData[K]
) => void;

export type UlbFieldBlurHandler = (field: keyof ULBConfigurationFormData) => void;

export type UlbFieldErrorGetter = (field: keyof ULBConfigurationFormData) => string | undefined;

export interface UlbValidatedFieldProps {
  onFieldChange: UlbFieldChangeHandler;
  onFieldBlur: UlbFieldBlurHandler;
  getFieldError: UlbFieldErrorGetter;
}

/** Server-data props shared by the server wrapper and the client orchestrator. */
export interface ULBConfigurationModuleProps {
  initialUlbData: UlbConfigurationMaster | null;
  initialDeptData: Department[];
  initialLicenceData: DepartmentLicenceDetails[];
  fetchError?: string;
  statusCode?: number;
}

export interface ULBProgressHeaderProps {
  completedCount: number;
  totalSteps: number;
  urgentAlertCount: number;
}

export interface UlbTabDescriptor {
  id: UlbTabId;
  icon: ComponentType<{ className?: string }>;
  label: string;
  key: keyof CompletionStatus;
}

export interface ULBTabListProps {
  activeTab: UlbTabId;
  completionStatus: CompletionStatus;
  t: (key: string) => string;
}

/** ULBFormField wrapper prop types (`UlbSelect`, `UlbSelectMd`, `UlbTextArea`). */
export type UlbSelectBaseProps = Omit<SelectProps, 'onChange'> & {
  onChange?: (value: string) => void;
};

export type UlbTextAreaProps = TextAreaProps & {
  label?: string;
  required?: boolean;
};

export interface ULBInfoTabProps extends UlbValidatedFieldProps {
  formData: ULBConfigurationFormData;
  t: (key: string) => string;
  onStateChange: (value: string) => void;
  onSave: () => void;
  onNext: () => void;
  footerClassName: string;
}

export interface ULBLogoImagesTabProps {
  t: (key: string) => string;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  onSave: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isSaving?: boolean;
  footerClassName: string;
}

export interface ULBProjectLicenseTabProps extends UlbValidatedFieldProps {
  formData: ULBConfigurationFormData;
  masterRenewalAlerts: RenewalAlert[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onLicenseFieldChange: (field: 'licenseStartDate' | 'licenseDuration', value: string) => void;
  onGenerateLicenseKey: () => void;
  onSave: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isSaving?: boolean;
  footerClassName: string;
}

export interface ULBDepartmentLicenseTabProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  filtered: DepartmentLicense[];
  totalCount: number;
  activeCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  master: UlbMasterLicenseSnapshot;
  onToggle: (id: string, enabled: boolean, masterDates?: UlbMasterLicenseSnapshot) => void;
  onDateChange: (id: string, field: 'startDate' | 'duration' | 'endDate', value: string) => void;
  onApplyMaster: () => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onPrevious: () => void;
  onSaveProgress: () => void;
  onFinalize: () => void;
  isSaving?: boolean;
  isLoadingDepartments?: boolean;
  footerClassName: string;
}

export interface ULBContactAddressCardProps extends UlbValidatedFieldProps {
  formData: ULBConfigurationFormData;
  t: (key: string) => string;
}

export interface ULBProjectInfoSectionProps extends UlbValidatedFieldProps {
  formData: ULBConfigurationFormData;
  t: (key: string) => string;
}

export interface ULBLicenseSectionProps extends Pick<UlbValidatedFieldProps, 'onFieldBlur' | 'getFieldError'> {
  formData: ULBConfigurationFormData;
  masterRenewalAlerts: RenewalAlert[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onFieldChange: UlbFieldChangeHandler;
  onLicenseFieldChange: (field: 'licenseStartDate' | 'licenseDuration', value: string) => void;
  onGenerateLicenseKey: () => void;
}

export interface ULBDepartmentCardProps {
  dept: DepartmentLicense;
  t: (key: string) => string;
  onToggle: (id: string, enabled: boolean, masterDates?: UlbMasterLicenseSnapshot) => void;
  onDateChange: (id: string, field: 'startDate' | 'duration' | 'endDate', value: string) => void;
}

export interface ULBLogoUploadProps {
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

