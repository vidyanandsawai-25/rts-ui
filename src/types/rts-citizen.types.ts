/**
 * rts-citizen.types.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript contracts for the RTS Citizen Portal API responses.
 * These types define what the real DB/API must return.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── i18n text (all labels support 3 languages) ───────────────────────────────
export type I18nLabel = {
  en: string;
  hi?: string;
  mr?: string;
};

// ── Department ───────────────────────────────────────────────────────────────
export type DepartmentDTO = {
  /** Unique slug, e.g. "property-tax", "birth-death" */
  id: string;

  /** Department display name in 3 languages */
  name: I18nLabel;

  /** Lucide icon name string, e.g. "HeartPulse", "Home" */
  icon: string;

  /**
   * Department card image.
   * Use a local public path: "/images/departments/property-tax.svg"
   * or a CDN URL. Team will populate from DB/CMS.
   */
  image: string;

  /** List of services under this department */
  services: ServiceDTO[];
};

// ── Service ──────────────────────────────────────────────────────────────────
export type ServiceDTO = {
  /** RTS service ID, e.g. "7204" */
  id: string;

  /** Service display name in 3 languages */
  name: I18nLabel;

  /** Lucide icon name string */
  icon?: string;

  /** Tailwind color class for card accent, e.g. "bg-blue-400" */
  color?: string;
};

// ── Service Metadata (for form page header) ──────────────────────────────────
export type ServiceMetaDTO = {
  serviceId: string;
  rtsServiceId: number;
  departmentId: string;
  departmentName: I18nLabel;

  /** Service name in 3 languages (for form title, page title) */
  serviceName: I18nLabel;

  /** Expected processing time (SLA), e.g. "7 days" */
  sla?: string;

  /** Application fee, e.g. "₹50" or "Free" */
  fee?: string;
};

// ── Form Field Types ─────────────────────────────────────────────────────────
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'tel'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'property-search'
  | 'location-picker';

export type FieldOption = {
  value: string;
  label: I18nLabel;
};

export type FormFieldDTO = {
  /** Unique field key used as form key */
  fieldId: string;

  /** Display label in 3 languages */
  label: I18nLabel;

  fieldType: FieldType;
  required: boolean;
  isActive: boolean;

  /** Placeholder text in 3 languages */
  placeholder?: I18nLabel;

  /** For select/radio/checkbox fields */
  options?: FieldOption[];

  /** Validation rules */
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };

  /** For file fields */
  fileConfig?: {
    accept?: string;        // e.g. ".pdf,.jpg,.png"
    maxSizeMB?: number;
    label: I18nLabel;       // Document name
    description?: I18nLabel;
  };

  /** Lucide icon name for field icon */
  icon?: string;

  /** Group reference */
  groupId: number;
  groupTitle: I18nLabel;
};

// ── Form Field Group (section of form) ───────────────────────────────────────
export type ServiceFieldGroupDTO = {
  groupId: number;

  /** Section heading in 3 languages */
  groupTitle: I18nLabel;

  /** Section icon (Lucide icon name) */
  icon?: string;

  fields: FormFieldDTO[];
};

// ── Document Upload ──────────────────────────────────────────────────────────
export type DocumentDTO = {
  docId: string;
  label: I18nLabel;
  required: boolean;
  accept?: string;           // ".pdf,.jpg,.png"
  maxSizeMB?: number;
  description?: I18nLabel;
};
