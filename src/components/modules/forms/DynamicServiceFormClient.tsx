// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  FileCheck,
  Save,
  User,
  MapPin,
  FileText,
  Building,
  Baby,
  Briefcase,
  CreditCard,
  Home,
  Info,
  AlertCircle,
  Download,
  type LucideIcon,
} from 'lucide-react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { departments } from '@/data/departments';
import { getServiceFormConfig } from '@/data/serviceFormConfig';
import {
  getPropertyMastList,
  getPropertyByOwnerId,
  getPropertyByPropertyId,
} from '@/lib/api/propertyMast';
import { getPropertyByNo, getPropertyText } from '@/data/properties';
import { plumberMaster } from '@/data/plumber';
import { consumerMaster } from '@/data/consumers';
import { isConditionMet } from '@/data/Dept/formTypes';
import { VALIDATION_RULES } from '@/lib/utils/validationRegistry';

import {
  type FormField,
  type ServiceFormConfig,
  type NormalizeRule,
  type CustomValidate,
  type InputMode,
} from '@/data/Dept/formTypes';
import { type SaveDraftValuesRequest } from '@/types/rts.types';


import { useLanguage } from '@/components/Providers/LanguageProvider';

const MySwal = withReactContent(Swal);

const LocationPicker = dynamic(() => import('@/components/common/LocationPicker'), {
  ssr: false,
});

const Button = ({ children, className, variant, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${
      variant === 'outline' ? 'border-2 bg-transparent' : ''
    } ${className}`}
  >
    {children}
  </button>
);

const DBG = true;

const dbg = (...args: any[]) => {
  if (!DBG) return;
  console.log('🟦[RTS DBG]', ...args);
};

const warn = (...args: any[]) => {
  if (!DBG) return;
  console.warn('🟨[RTS WARN]', ...args);
};

// interface ServiceFormProps {
//   serviceId: string; // 7176 (route)
//   rtsServiceId: number; // 1 (db pk)
//   departmentId: number; // 1
//   initialGroups: any[];
// }
interface ServiceFormProps {
  serviceId: string;
  rtsServiceId?: number;
  departmentId?: number;
  initialGroups?: any[];
}


const iconMap: Record<string, LucideIcon> = {
  User,
  MapPin,
  FileText,
  Building,
  Baby,
  Briefcase,
  CreditCard,
  Home,
  Info,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PAN_REGEX = /^[A-Z]{3}[PCHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;
const NAME_REGEX = /^[A-Za-z\s.'-]{2,60}$/;
const NAME_ONLY_REGEX = /^[A-Za-z\u0900-\u097F\s]+$/;

const PERSON_NAME_BLOCKLIST = [
  'building',
  'society',
  'colony',
  'property',
  'road',
  'street',
  'landmark',
  'ward',
  'zone',
  'city',
  'state',
  'district',
  'bank',
  'branch',
  'company',
  'firm',
  'business',
  'trade',
  'shop',
  'office',
  'organization',
  'organisation',
  'agency',
  'mandal',
  'hospital',
  'school',
  'college',
  'institute',
  'police',
  'fire',
  'station',
  'department',
  'authority',
  'developer',
  'association',
  'project',
];

const isLikelyPersonNameField = (fieldId: string, labelText: string) => {
  const haystack = `${fieldId} ${labelText}`.toLowerCase();
  if (!haystack.includes('name')) return false;
  if (PERSON_NAME_BLOCKLIST.some((token) => haystack.includes(token))) return false;
  return true;
};

const TEMP_EMAIL_DOMAINS = [
  '10minutemail.com',
  '10minutemail.net',
  '20minutemail.com',
  '33mail.com',
  'anonymousmail.org',
  'disposablemail.com',
  'dispostable.com',
  'dropmail.me',
  'emailondeck.com',
  'fakeinbox.com',
  'getnada.com',
  'guerrillamail.com',
  'mailinator.com',
  'mailsac.com',
  'mintemail.com',
  'minuteinbox.com',
  'moakt.com',
  'mytemp.email',
  'temp-mail.org',
  'tempmail.com',
  'tempmail.net',
  'trashmail.com',
  'yopmail.com',
];

const getEmailDomain = (email: string) => {
  const parts = String(email).toLowerCase().split('@');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

const isTempEmailDomain = (email: string) => {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return TEMP_EMAIL_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`));
};

const deepClone = <T,>(obj: T): T => {
  try {
    if (typeof structuredClone === 'function') return structuredClone(obj);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(obj)) as T;
};

// ✅ 7176 auto-fill+lock fields when existing property selected
const PROPERTY_AUTO_FIELDS = new Set<string>([
  'zoneId',
  'wardNo',
  'surveyNo',
  'propertyAddress',
  'buildingName',
  'flatNo',
  'pincode',
  'propertylatitude',
  'propertylongitude',
  'propertylocationName',
  'propertyCity',
  'propertyState',
  'PropertyHouseFlatNo',
  'PropertyBuildingName',
  'PropertyRoadStreetName',
  'PropertyCity',
  'PropertyLandmark',
  'PropertyWardNo',
  'PropertyPinCode',
  'commencementCertNo',
  'occupancyCertNo',
]);

async function fetchPropertyDetails(propertyId: string) {
  return getPropertyByPropertyId(propertyId);
}

// export default function DynamicServiceFormClient({
//   serviceId,
//   rtsServiceId,
//   departmentId,
//   initialGroups,
// }: ServiceFormProps) {


export default function DynamicServiceFormClient({
  serviceId,
  rtsServiceId,
  departmentId,
  initialGroups,
}: ServiceFormProps) {
  console.log('✅ SSR Props:', { serviceId, rtsServiceId, departmentId, initialGroups });

  const router = useRouter();
  const { language } = useLanguage();

  // Core State
  const [activeSection, setActiveSection] = useState(0);
  const [darkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  // Data & Validation State
  const [ownerSyncState, setOwnerSyncState] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Document uploads
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File | null>>({});

  // ✅ Map modal state
  const [openMapFor, setOpenMapFor] = useState<string | null>(null);

  // ✅ prevent refetch loops
  const last7176FetchRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);

  // Dept/Service context
  const [navCtx, setNavCtx] = useState<{
    deptId?: string;
    deptName?: any;
    serviceName?: any;
    deptCount?: number;
  }>({});

  // Refs
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingProgrammatically = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastPropertyAutofillRef = useRef<{ propertyNo: string; address: string } | null>(null);

  const [propertyNotFound, setPropertyNotFound] = useState(false);

  const [ownerOptions, setOwnerOptions] = useState<any[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loadingDto, setLoadingDto] = useState(false);

  // -------------------------
  // ✅ CONFIG
  // -------------------------
  // ✅ CONFIG (single source of truth)
  const baseConfig = useMemo(() => getServiceFormConfig(serviceId), [serviceId]);
  const emptyConfig = useMemo<ServiceFormConfig>(
    () => ({ serviceId, steps: [], documents: [] }),
    [serviceId]
  );
  const [runtimeConfig, setRuntimeConfig] = useState<ServiceFormConfig | null>(null);
  const [propertyNoOptions, setPropertyNoOptions] = useState<any[]>([]);
  const [upicNoOptions, setUpicNoOptions] = useState<any[]>([]);

  const [openCheckboxDropdown, setOpenCheckboxDropdown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setRuntimeConfig(baseConfig ? deepClone(baseConfig) : null);
  }, [baseConfig]);

  const effectiveConfig: ServiceFormConfig = runtimeConfig ?? baseConfig ?? emptyConfig;
  const baseSteps = useMemo(() => effectiveConfig.steps || [], [effectiveConfig]);

  const steps = useMemo(() => {
    // -------------------- 7177 --------------------
    if (serviceId === '7177') {
      return baseSteps.map((step: any) => {
        if (step.id !== 'property-identification' || !Array.isArray(step.fields)) return step;

        // ✅ PropertyNo dropdown
        const propertyNoLabel = {
          en: 'Property No',
          hi: 'संपत्ति क्रमांक',
          mr: 'मालमत्ता क्रमांक',
        };
        const propertyNoSource = step.fields.find(
          (field: any) => String(field.id).toLowerCase() === 'propertyno'
        );

        const propertyNoField = {
          ...(propertyNoSource || {
            id: 'propertyNo',
            type: 'select',
            label: propertyNoLabel,
            required: true,
            colSpan: 1,
          }),
          type: 'select',
          label: propertyNoLabel,
          options: propertyNoOptions,
          disabled: propertyNoOptions.length <= 1,
        };

        // ✅ Remove ownerId from UI completely
        // Also lock fields that are auto-filled
        const normalizedFields = step.fields
          .filter((field: any) => {
            const id = String(field.id || '').toLowerCase();
            return id !== 'ownerid' && id !== 'propertyno';
          })
          .map((field: any) => {
            const id = String(field.id || '').toLowerCase();

            if (id === 'upicno') return { ...field, options: upicNoOptions, disabled: true };
            if (id === 'zone' || id === 'wardarea') return { ...field, disabled: true };

            if (
              ['assessmentaccountno', 'propertytaxpropertyid', 'indexnumber', 'houseno'].includes(
                id
              )
            ) {
              return { ...field, readOnly: true };
            }

    

            return field;
          });

        return { ...step, fields: [propertyNoField, ...normalizedFields] };
      });
    }

    // -------------------- 7176 --------------------
    if (serviceId === '7176') {
      return baseSteps.map((step: any) => {
        if (step.id !== 'property-details' || !Array.isArray(step.fields)) return step;

        return {
          ...step,
          fields: step.fields.map((f: any) => {
            const id = String(f?.id || '').toLowerCase();

            // ownerId dropdown (optional)
            if (id === 'ownerid') return { ...f, type: 'select', options: ownerOptions };

            // propertyNo dropdown (from propertyOptions)
            if (id === 'propertyno') return { ...f, type: 'select', options: propertyOptions };

            return f;
          }),
        };
      });
    }

    return baseSteps;
  }, [baseSteps, serviceId, ownerOptions, propertyOptions, propertyNoOptions, upicNoOptions]);

  const docsTitle = { en: 'Documents', hi: 'दस्तावेज़', mr: 'कागदपत्रे' };
  const docsList = effectiveConfig.documents || [];
  const hasDocs = docsList.length > 0;
  const requiredDocs = docsList.filter((d: any) => d?.required !== false);

  const isDocRequired = (doc: any) => {
    const baseRequired = doc?.required !== false;

    // ✅ 7177 conditional doc
    if (serviceId === '7177' && doc?.id === 'occupancyOrCompletionCertificate') {
      const reason = String(formData.reassessmentReasonType || '');
      const ocAvail = String(formData.occupancyCertificateAvailable || '')
        .trim()
        .toLowerCase();
      return reason === 'additional_construction' && ocAvail === 'yes';
    }

    return baseRequired;
  };

 

  const shouldRenderField = (field: any) => {
    return isConditionMet(field?.showIf, formData);
  };

  const isDeclarationStep = (step: any) => {
    const id = String(step?.id ?? '').toLowerCase();
    const en = String(step?.title?.en ?? '').toLowerCase();
    return id.includes('declaration') || en.includes('declaration');
  };

  const sections = useMemo(() => {
    const stepSections = (steps || []).map((s: any) => ({ ...s, __isDocs: false }));

    const decl = stepSections.filter((s: any) => isDeclarationStep(s));
    const nonDecl = stepSections.filter((s: any) => !isDeclarationStep(s));

    const docsSection = hasDocs ? [{ id: 'docs', title: docsTitle, __isDocs: true }] : [];

    const final = [...nonDecl, ...docsSection, ...decl];

    dbg(
      'sections built from CONFIG:',
      final.map((s: any) => s.id)
    );
    return final;
  }, [steps, hasDocs]);

  const hasApplicantFields = steps.some((step: any) => {
    const titleIncludesApplicant = String(step?.title?.en ?? '')
      .toLowerCase()
      .includes('applicant');
    const hasApplicantFieldId =
      Array.isArray(step.fields) &&
      step.fields.some((field: any) =>
        String(field?.id ?? '')
          .toLowerCase()
          .includes('applicant')
      );
    return titleIncludesApplicant || hasApplicantFieldId;
  });

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  // Load localStorage header context
  useEffect(() => {
    try {
      const deptId = localStorage.getItem('selectedDeptId') || undefined;
      const deptName = localStorage.getItem('selectedDeptName');
      const serviceName = localStorage.getItem('selectedServiceName');
      const deptCount = localStorage.getItem('selectedDeptServicesCount');

      setNavCtx({
        deptId,
        deptName: deptName ? JSON.parse(deptName) : undefined,
        serviceName: serviceName ? JSON.parse(serviceName) : undefined,
        deptCount: deptCount ? Number(deptCount) : undefined,
      });
    } catch {
      // ignore
    }
  }, []);

  const deptFromStorage = navCtx.deptId
    ? departments.find((d) => d.id === navCtx.deptId)
    : undefined;
  const deptFromIdScan = departments.find((d) => d.services?.some((s) => s.id === serviceId));
  const resolvedDept = deptFromStorage || deptFromIdScan;

  const resolvedService =
    resolvedDept?.services?.find((s) => s.id === serviceId) ||
    deptFromIdScan?.services?.find((s) => s.id === serviceId);

  const serviceTitle =
    resolvedService?.name?.[language] ||
    resolvedService?.name?.en ||
    navCtx.serviceName?.[language] ||
    navCtx.serviceName?.en ||
    steps[0]?.title?.[language] ||
    steps[0]?.title?.en ||
    'Service';

  // --- VALIDATION HELPERS ---
  const isFieldEmpty = (value: any) => value === undefined || value === null || value === '';

  const normalizeRuleList = (rules?: NormalizeRule | NormalizeRule[]) => {
    if (!rules) return [];
    return Array.isArray(rules) ? rules : [rules];
  };

  const applyNormalize = (value: string, rules?: NormalizeRule | NormalizeRule[]) => {
    const normalized = normalizeRuleList(rules);
    return normalized.reduce((next, rule) => {
      if (rule === 'trim') return next.trim();
      if (rule === 'uppercase') return next.toUpperCase();
      if (rule === 'removeSpaces') return next.replace(/\s+/g, '');
      if (rule === 'removeCommas') return next.replace(/,/g, '');
      return next;
    }, value);
  };

  const mergeNormalizeRules = (
    baseRules?: NormalizeRule | NormalizeRule[],
    derivedRules?: NormalizeRule[]
  ) => {
    const merged = [...normalizeRuleList(baseRules), ...(derivedRules ?? [])];
    return merged.length ? merged : undefined;
  };

  const getBaseValidation = (field: FormField) => {
    const v = (field as any).validation || {};
    const key = (field as any).validationKey;
    const rule = key ? VALIDATION_RULES[key] : undefined;
    // Merge registry rules by key while allowing field-level overrides.
    return {
      pattern: (field as any).pattern ?? v.pattern ?? rule?.pattern,
      minLength: (field as any).minLength ?? v.minLength ?? rule?.minLength,
      maxLength: (field as any).maxLength ?? v.maxLength ?? rule?.maxLength,
      exactLength: (field as any).exactLength ?? v.exactLength ?? rule?.exactLength,
      min: v.min ?? rule?.min,
      max: v.max ?? rule?.max,
      allow: (field as any).allow ?? v.allow ?? rule?.allow,
      normalize: (field as any).normalize ?? v.normalize ?? rule?.normalize,
      customValidate: (field as any).customValidate ?? v.customValidate ?? rule?.customValidate,
      inputMode: (field as any).inputMode ?? v.inputMode ?? rule?.inputMode,
      message: v.message ?? rule?.message,
    };
  };

  const getFieldMeta = (field: FormField) => {
    const fieldType = String((field as any).type ?? '');
    const fieldId = String((field as any).id ?? '');
    const lowerId = fieldId.toLowerCase();
    const label = (field as any).label;
    const labelText =
      typeof label === 'string'
        ? label.toLowerCase()
        : Object.values(label || {})
            .filter((val) => typeof val === 'string')
            .join(' ')
            .toLowerCase();
    // const isNameLabel = labelText.includes('name');
    const isNameLabel = isLikelyPersonNameField(lowerId, labelText);

    const isMobileField =
      fieldType === 'tel' ||
      /mobile|mobileno|mobilenumber|contactno|contactnumber|phone/.test(lowerId);
    const isAadhaarField = /aadhaar|aadhar/.test(lowerId);
    const isPanField = /pancard|pan(card)?(number|no)|pan_no|pan_number/.test(lowerId);
    const isPincodeField = /pincode|pin_code|pin-code/.test(lowerId);
    const isEmailField = fieldType === 'email' || /email/.test(lowerId);

    return {
      fieldType,
      fieldId,
      lowerId,
      labelText,
      isNameLabel,
      isMobileField,
      isAadhaarField,
      isPanField,
      isPincodeField,
      isEmailField,
    };
  };

  const getDerivedRules = (field: FormField) => {
    const meta = getFieldMeta(field);
    // If validationKey is explicitly set, skip heuristic rules (registry/field rules only).
    const hasValidationKey = Object.prototype.hasOwnProperty.call(field as any, 'validationKey');
    if (hasValidationKey) {
      return {
        ...meta,
        normalize: [],
        allow: undefined,
        inputMode: undefined,
        exactLength: undefined,
        pattern: null,
        patternMessage: null,
      };
    }
    const normalize: NormalizeRule[] = [];
    let allow: string | undefined;
    let inputMode: InputMode | undefined;
    let exactLength: number | undefined;
    let pattern: RegExp | null = null;
    let patternMessage: string | null = null;

    if (meta.isNameLabel) {
      allow = allow ?? 'letters';
      inputMode = inputMode ?? 'text';
      normalize.push('trim');
      pattern = pattern ?? NAME_ONLY_REGEX;
      patternMessage = patternMessage ?? 'Only letters are allowed';
    }

    if (meta.isMobileField) {
      allow = 'numeric';
      inputMode = 'numeric';
      exactLength = 10;
      normalize.push('trim', 'removeSpaces');
      pattern = MOBILE_REGEX;
      patternMessage = 'Enter a valid 10-digit mobile number';
    }

    if (meta.isAadhaarField) {
      allow = allow ?? 'numeric';
      inputMode = inputMode ?? 'numeric';
      exactLength = exactLength ?? 12;
      normalize.push('trim', 'removeSpaces');
      pattern = pattern ?? AADHAAR_REGEX;
      patternMessage = patternMessage ?? 'Aadhaar must be 12 digits';
    }

    if (meta.isPincodeField) {
      allow = allow ?? 'numeric';
      inputMode = inputMode ?? 'numeric';
      exactLength = exactLength ?? 6;
      normalize.push('trim', 'removeSpaces');
      pattern = pattern ?? PINCODE_REGEX;
      patternMessage = patternMessage ?? 'Enter a valid 6-digit PIN code';
    }

    if (meta.isPanField) {
      allow = allow ?? 'alphanumeric';
      inputMode = inputMode ?? 'text';
      exactLength = exactLength ?? 10;
      normalize.push('trim', 'removeSpaces', 'uppercase');
      pattern = pattern ?? PAN_REGEX;
      patternMessage = patternMessage ?? 'Enter a valid PAN (e.g., ABCPZ1234K)';
    }

    if (meta.fieldType === 'number') {
      allow = allow ?? 'numeric';
      inputMode = inputMode ?? 'numeric';
      normalize.push('trim', 'removeSpaces');
    }

    if (meta.isEmailField) inputMode = inputMode ?? 'email';

    return { ...meta, normalize, allow, inputMode, exactLength, pattern, patternMessage };
  };

  const getMergedRules = (field: FormField) => {
    const base = getBaseValidation(field);
    const derived = getDerivedRules(field);
    return {
      base,
      derived,
      allow: base.allow ?? derived.allow,
      inputMode: base.inputMode ?? derived.inputMode,
      exactLength: base.exactLength ?? derived.exactLength,
      normalize: mergeNormalizeRules(base.normalize, derived.normalize),
    };
  };

  const resolveAllowRule = (allow?: string) => {
    if (!allow) return null;
    const key = allow.toLowerCase();
    const flags = allow.includes('\\p{') ? 'gu' : 'g';
    if (key === 'numeric' || key === 'digits') return { kind: 'chars' as const, regex: /[0-9]/g };
    if (key === 'letters') return { kind: 'chars' as const, regex: /[\p{L}\p{M}\s]/gu };
    if (key === 'decimal') return { kind: 'decimal' as const };
    if (key === 'alpha') return { kind: 'chars' as const, regex: /[\p{L}\p{M}\s.'-]/gu };
    if (key === 'alphanumeric') return { kind: 'chars' as const, regex: /[A-Za-z0-9]/g };

    try {
      if (allow.includes('^') || allow.includes('$')) {
        const charClass = allow.match(/\[[^\]]+\]/);
        if (charClass) return { kind: 'chars' as const, regex: new RegExp(charClass[0], flags) };
        if (allow.includes('\\d')) return { kind: 'chars' as const, regex: /[0-9]/g };
        if (allow.toLowerCase().includes('a-z'))
          return { kind: 'chars' as const, regex: /[A-Za-z]/g };
        return null;
      }
      const regex = new RegExp(allow, flags);
      return { kind: 'chars' as const, regex };
    } catch {
      return null;
    }
  };

  const sanitizeInputValue = (rawValue: any, field: FormField) => {
    if (typeof rawValue !== 'string') return rawValue;
    const { allow, normalize, base, exactLength } = getMergedRules(field);
    let next = rawValue;

    const allowRule = resolveAllowRule(allow);
    if (allowRule?.kind === 'decimal') {
      next = next.replace(/[^0-9.]/g, '');
      const firstDot = next.indexOf('.');
      if (firstDot !== -1) {
        next = `${next.slice(0, firstDot + 1)}${next.slice(firstDot + 1).replace(/\./g, '')}`;
      }
    } else if (allowRule?.kind === 'chars') {
      const matches = next.match(allowRule.regex);
      next = matches ? matches.join('') : '';
    }

    next = applyNormalize(next, normalize);

    const maxLen = exactLength ?? base.maxLength;
    if (typeof maxLen === 'number' && maxLen >= 0 && next.length > maxLen)
      next = next.slice(0, maxLen);

    return next;
  };

  const customValidators: Record<string, (value: any, data: Record<string, any>) => string | null> =
    {
      mobile: (value) =>
        MOBILE_REGEX.test(String(value || '')) ? null : 'Enter a valid 10-digit mobile number',
      aadhaar: (value) =>
        AADHAAR_REGEX.test(String(value || '')) ? null : 'Aadhaar must be 12 digits',
      pan: (value) =>
        PAN_REGEX.test(String(value || '').toUpperCase())
          ? null
          : 'Enter a valid PAN (e.g., ABCPZ1234K)',
      pincode: (value) =>
        PINCODE_REGEX.test(String(value || '')) ? null : 'Enter a valid 6-digit PIN code',
      name: (value) => (NAME_REGEX.test(String(value || '')) ? null : 'Enter a valid name'),
      corporateEmailOnly: (value) => {
        const email = String(value || '');
        if (!EMAIL_REGEX.test(email)) return 'Enter a valid email';
        if (isTempEmailDomain(email)) return 'Temporary emails are not allowed';
        return null;
      },
      noTempEmail: (value) => {
        const email = String(value || '');
        if (!EMAIL_REGEX.test(email)) return 'Enter a valid email';
        if (isTempEmailDomain(email)) return 'Temporary emails are not allowed';
        return null;
      },
    };

  const runCustomValidate = (custom: CustomValidate | undefined, value: any) => {
    if (!custom) return null;
    const validators = Array.isArray(custom) ? custom : [custom];
    for (const validator of validators) {
      if (typeof validator === 'function') {
        const result = validator(value, formData);
        if (typeof result === 'string') return result;
        if (result === false) return 'Invalid value';
      } else if (typeof validator === 'string') {
        const fn = customValidators[validator];
        const result = fn ? fn(value, formData) : null;
        if (result) return result;
      }
    }
    return null;
  };

  const markTouched = (id: string) => setTouchedFields((prev) => ({ ...prev, [id]: true }));

  const getFieldError = (field: FormField) => {
    if (!shouldRenderField(field as any)) return null;

    const { base, derived } = getMergedRules(field);
    const fieldId = String((field as any).id ?? '');
    const value = formData[fieldId];
    const fieldType = derived.fieldType;

    const isCertField =
      fieldId === 'certOC' ||
      fieldId === 'certCC' ||
      fieldId === 'certElectricityBill' ||
      fieldId === 'certOther' ||
       fieldId === 'existingCertOC' ||
  fieldId === 'existingCertCC' ||
  fieldId === 'existingCertElectricityBill' ||
  fieldId === 'existingCertOther';


    if (isCertField) {

      const isExisting = fieldId.startsWith('existing');

      const oc = formData['certOC'] === true;
      const cc = formData['certCC'] === true;
      const eb = formData['certElectricityBill'] === true;

  if (fieldId === (isExisting ? 'existingCertCC' : 'certCC')) {
    if (!oc && !cc) return 'CC is required if OC is not available.';
  }

  // ✅ Rule 3: EB cannot be without CC when OC not selected
  if (fieldId === (isExisting ? 'existingCertElectricityBill' : 'certElectricityBill')) {
    if (!oc && eb && !cc) return 'CC must be selected if Electricity Bill is selected.';
  }

      // NOTE:
      // Rule 1 (auto-uncheck + disable CC/EB when OC selected) should be enforced in handleInputChange + renderField disable.
      // Validation here is enough for Rule 2/3.
      return null;
    }

    // ✅ EXISTING CHECKBOX VALIDATION (for termsAccepted etc.)
    if (fieldType === 'checkbox') {
      if ((field as any).required && value !== true) return 'Please check this to continue';
      return null;
    }

    if ((field as any).required && isFieldEmpty(value)) return 'Required field';
    if (isFieldEmpty(value)) return null;

    const strValue = String(value);

    if (base.pattern) {
      try {
        const regex = base.pattern.includes('\\p{') ? new RegExp(base.pattern, 'u') : new RegExp(base.pattern);
        if (!regex.test(strValue)) return base.message || 'Invalid format';
      } catch {
        // ignore invalid regex
      }
    } else if (derived.pattern && !derived.pattern.test(strValue)) {
      return derived.patternMessage || 'Invalid format';
    }

    if (derived.isEmailField) {
      if (!EMAIL_REGEX.test(strValue)) return 'Enter a valid email';
      if (isTempEmailDomain(strValue)) return 'Temporary emails are not allowed';
    }

    const exactLen = base.exactLength ?? derived.exactLength;
    if (typeof exactLen === 'number' && strValue.length !== exactLen)
      return `Must be exactly ${exactLen} characters`;
    if (typeof base.minLength === 'number' && strValue.length < base.minLength)
      return `Must be at least ${base.minLength} characters`;
    if (typeof base.maxLength === 'number' && strValue.length > base.maxLength)
      return `Must be at most ${base.maxLength} characters`;

    if (typeof base.min === 'number' || typeof base.max === 'number') {
      const numValue = Number(strValue);
      if (Number.isNaN(numValue)) return 'Enter a valid number';
      if (typeof base.min === 'number' && numValue < base.min)
        return `Minimum value is ${base.min}`;
      if (typeof base.max === 'number' && numValue > base.max)
        return `Maximum value is ${base.max}`;
    }

    if (base.pattern) {
      try {
        const regex = new RegExp(base.pattern);
        if (!regex.test(strValue)) return 'Invalid format';
      } catch {
        // ignore invalid regex
      }
    }

    const customError = runCustomValidate(base.customValidate, value);
    if (customError) return customError;

    return null;
  };

  const isFieldMissing = (field: any) => !!getFieldError(field as FormField);

  const isDocsComplete = () => {
    if (!hasDocs) return true;
    return requiredDocs.every((d: any) => !!uploadedDocs[d.id]);
  };

  const isSectionComplete = (sectionIndex: number) => {
    const sec: any = sections[sectionIndex];
    if (!sec) return false;
    if (sec.__isDocs) return isDocsComplete();
    return sec.fields
      .filter((f: any) => shouldRenderField(f))
      .every((field: any) => !isFieldMissing(field));
  };

  const normalizeSelectValue = (v: any) => {
    // common react-select style: { value, label }
    if (v && typeof v === 'object') {
      if ('value' in v) return (v as any).value;
      if ('id' in v) return (v as any).id; // sometimes dropdown sends {id,name}
    }
    return v;
  };

  

  const handleInputChange = (id: string, value: any, field?: FormField) => {
    setFormData((prev) => {
      // Sanitize using validationKey-driven rules.
      const sanitized = field ? sanitizeInputValue(value, field) : value;
      const nextValue = normalizeSelectValue(sanitized); // ?. IMPORTANT
      const next = { ...prev, [id]: nextValue };

      dbg('INPUT CHANGE:', { id, value, sanitized, stored: nextValue, type: typeof nextValue });

    // ✅ 7176 rules
    if (serviceId === '7176' && id === 'isPropertyRegistered') {
      const isYes =
        String(nextValue ?? '')
          .trim()
          .toLowerCase() === 'yes';
      if (!isYes) {
        next['propertyId'] = '';
        for (const k of PROPERTY_AUTO_FIELDS) next[k] = '';
        last7176FetchRef.current = null;
        dbg('7176 cleared property fields because isPropertyRegistered=No');
      }
    }

    if (serviceId === '7176' && id === 'propertyId') {
      next['propertylatitude'] = '';
      next['propertylongitude'] = '';
      next['propertylocationName'] = '';
      next['propertyCity'] = '';
      next['propertyState'] = '';
      last7176FetchRef.current = null;
      dbg('7176 propertyId changed -> cleared geo fields');
    }

    // ✅ reset normal certificate dates/numbers when type changes
    if (id === 'occupancyCertDateType') {
      next['ocDate'] = '';
      next['ccDate'] = '';
      next['electricityBillDate'] = '';
      next['otherDate'] = '';

      // ✅ clear certificate numbers so user doesn't submit wrong one
      next['commencementCertNo'] = '';
      next['occupancyCertNo'] = '';
    }

    // ✅ reset existing certificate dates/numbers when type changes
    if (serviceId === '7177' && id === 'existingOccupancyCertDateType') {
      next['existingOcDate'] = '';
      next['existingCcDate'] = '';
      next['existingElectricityBillDate'] = '';
      next['existingOtherDate'] = '';

      next['existingCommencementCertNo'] = '';
      next['existingOccupancyCertNo'] = '';

      next['existingPropertyProofStatus'] = '';
    }

    // ============================================================
    // ✅ OCC certificate rules (checkboxDropdown values) - NORMAL
    // ============================================================
    if (id === 'occupancyCertDateType') {
      const OCC_KEYS = {
        OC: 'OC Date',
        CC: 'CC Date',
        EB: 'Electricity Bill Date',
        OTHER: 'Other',
      };

      let arr: string[] = Array.isArray(nextValue) ? nextValue.map(String) : [];

      const hasOC = arr.includes(OCC_KEYS.OC);

      // ✅ Rule: If OC selected -> auto set Is Construction Authorized = yes
      // and remove EB + OTHER (you can remove CC too if you want, but I kept CC allowed)
      if (hasOC) {
        next['isConstructionAuthorized'] = 'yes';
        arr = arr.filter((x) => x !== OCC_KEYS.EB && x !== OCC_KEYS.OTHER);
      }

      // ✅ write back corrected array
      next['occupancyCertDateType'] = arr;

      // ✅ Sync checkbox mirrors
      next['certOC'] = arr.includes(OCC_KEYS.OC);
      next['certCC'] = arr.includes(OCC_KEYS.CC);
      next['certElectricityBill'] = arr.includes(OCC_KEYS.EB);
      next['certOther'] = arr.includes(OCC_KEYS.OTHER);

      // ✅ Property proof status
      let status = 'Weak';
      if (next['certOC']) status = 'Strong / Legal';
      else if (next['certCC'] && next['certElectricityBill']) status = 'Legal';
      else if (next['certCC']) status = 'Partially Legal';

      next['propertyProofStatus'] = status;
    }

    // ============================================================
    // ✅ OCC certificate rules (checkboxDropdown values) - EXISTING (7177)
    // ============================================================
    if (serviceId === '7177' && id === 'existingOccupancyCertDateType') {
      const OCC_KEYS = {
        OC: 'OC Date',
        CC: 'CC Date',
        EB: 'Electricity Bill Date',
        OTHER: 'Other',
      };

      let arr: string[] = Array.isArray(nextValue) ? nextValue.map(String) : [];

      const hasOC = arr.includes(OCC_KEYS.OC);

      // ✅ Rule: If OC selected -> auto set Is Construction Authorized = yes
      // and remove EB + OTHER
      if (hasOC) {
        next['isConstructionAuthorized'] = 'yes';
        arr = arr.filter((x) => x !== OCC_KEYS.EB && x !== OCC_KEYS.OTHER);
      }

      // ✅ write back corrected array
      next['existingOccupancyCertDateType'] = arr;

      // ✅ Sync checkbox mirrors
      next['existingCertOC'] = arr.includes(OCC_KEYS.OC);
      next['existingCertCC'] = arr.includes(OCC_KEYS.CC);
      next['existingCertElectricityBill'] = arr.includes(OCC_KEYS.EB);
      next['existingCertOther'] = arr.includes(OCC_KEYS.OTHER);

      // ✅ Reset existing fields when type changes
      next['existingOcDate'] = '';
      next['existingCcDate'] = '';
      next['existingElectricityBillDate'] = '';
      next['existingOtherDate'] = '';
      next['existingOccupancyCertNo'] = '';
      next['existingCommencementCertNo'] = '';

      // ✅ Existing property proof status
      let status = 'Weak';
      if (next['existingCertOC']) status = 'Strong / Legal';
      else if (next['existingCertCC'] && next['existingCertElectricityBill']) status = 'Legal';
      else if (next['existingCertCC']) status = 'Partially Legal';

      next['existingPropertyProofStatus'] = status;
    }

    // Payment helper
    if (id === 'part_enterPartPayment') next['part_payableAmount'] = nextValue;

    if (id === 'paymentMode') {
      if (nextValue === 'full') {
        next['part_totalOutstanding'] = '';
        next['part_enterPartPayment'] = '';
        next['part_payableAmount'] = '';
      } else if (nextValue === 'part') {
        next['full_totalBillOutstandingAmount'] = '';
      }
    }

    // ✅ 7177 logic (also use nextValue instead of value)
    if (serviceId === '7177' && id === 'reassessmentReasonType') {
      next['areaUnit'] = 'sq_ft';

      if (nextValue !== 'additional_construction') {
        next['constructionType'] = '';
        next['isConstructionAuthorized'] = '';
        next['buildingPermissionNo'] = '';
        next['commencementDate'] = '';
        next['completionDate'] = '';

        next['occupancyCertificateAvailable'] = '';
        next['occupancyCertNo'] = '';
        next['occupancyCertDateType'] = '';
        next['occupancyCertDate'] = '';
        next['existingOccupancyCertDateType'] = [];
        next['existingOcDate'] = '';
        next['existingCcDate'] = '';
        next['existingElectricityBillDate'] = '';
        next['existingOtherDate'] = '';

        next['existingOccupancyCertNo'] = '';
        next['existingCommencementCertNo'] = '';

        next['existingCertOC'] = false;
        next['existingCertCC'] = false;
        next['existingCertElectricityBill'] = false;
        next['existingCertOther'] = false;

        next['existingPropertyProofStatus'] = '';
      }

      if (nextValue !== 'change_in_use') next['propertyUsage'] = '';
      if (nextValue !== 'change_in_occupancy' && nextValue !== 'additional_construction')
        next['occupancyStatus'] = '';
    }

    // ✅ Certificate rules (checkboxes) - Rule 1/2/3 (NORMAL checkboxes only)
    if (['certOC', 'certCC', 'certElectricityBill', 'certOther'].includes(id)) {
      const oc = id === 'certOC' ? !!nextValue : !!next['certOC'];
      const cc = id === 'certCC' ? !!nextValue : !!next['certCC'];
      const eb = id === 'certElectricityBill' ? !!nextValue : !!next['certElectricityBill'];

      // ✅ Rule 1: If OC selected → auto-uncheck others
      if (id === 'certOC' && oc) {
        next['certCC'] = false;
        next['certElectricityBill'] = false;
        next['certOther'] = false;
      }

      // ✅ Optional safety: if OC is NOT selected and user checks EB, force CC = true
      if (!oc && id === 'certElectricityBill' && eb && !cc) {
        next['certCC'] = true;
      }

      // ✅ status
      const finalOC = !!next['certOC'];
      const finalCC = !!next['certCC'];
      const finalEB = !!next['certElectricityBill'];

      let status = 'Weak';
      if (finalOC) status = 'Strong / Legal';
      else if (finalCC && finalEB) status = 'Legal';
      else if (finalCC) status = 'Partially Legal';

      next['propertyProofStatus'] = status;
    }

    return next;
  });
};

  
  // ✅ safer fetch (timeout)
  
    const safeFetchJson = async (url: string, timeoutMs = 12000) => {
    const queryMatch = url.match(/[?&]q=([^&]+)/);
    const latMatch = url.match(/[?&]lat=([^&]+)/);
    const lngMatch = url.match(/[?&]lng=([^&]+)/);
    const q = queryMatch ? decodeURIComponent(queryMatch[1]) : "";

    if (q) {
      return {
        results: [
          { label: `${q} - Local result 1`, lat: 20.5, lng: 77.0 },
          { label: `${q} - Local result 2`, lat: 21.1, lng: 77.9 },
        ],
      };
    }

    if (latMatch && lngMatch) {
      return {
        found: true,
        displayName: `Pinned location (${Number(decodeURIComponent(latMatch[1])).toFixed(4)}, ${Number(decodeURIComponent(lngMatch[1])).toFixed(4)})`,
      };
    }

    return null;
  };

  const pickFirst = (obj: any, keys: string[]) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    const data = await safeFetchJson(
      `/api/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
        String(lng)
      )}`,
      12000
    );
    if (!data?.found) return null;
    return data as {
      found: true;
      displayName: string;
      postcode?: string;
      city?: string;
      state?: string;
      country?: string;
    };
  };

  useEffect(() => {
    if (serviceId !== '7176') return;

    (async () => {
      try {
        setLoadingProps(true);

        const list = await getPropertyMastList();

        const opts = (list || []).map((x: any) => {
          // ✅ IMPORTANT: dropdown value must be propertyId (for getPropertyByPropertyId)
          const propertyId = String(
            pickFirst(x, ['propertyId', 'PropertyId', 'id', 'propId', 'property_id'])
          ).trim();

          const propertyNo = String(
            pickFirst(x, [
              'propertyNo',
              'PropertyNo',
              'property_number',
              'propNo',
              'propertyNoText',
            ])
          ).trim();

          const labelText = propertyNo || propertyId || '-';

          return {
            value: propertyId || labelText, // fallback, but ideally propertyId exists
            label: { en: labelText, hi: labelText, mr: labelText },
            meta: x,
          };
        });

        // ✅ remove empty values
        const clean = opts.filter((o: any) => String(o.value || '').trim() !== '');
        setPropertyOptions(clean);
      } catch (e: any) {
        console.error('7176 property list load failed:', e?.message || e);
        setPropertyOptions([]);
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [serviceId]);

  // ✅ 7177 default unit
  useEffect(() => {
    if (serviceId !== '7177') return;
    setFormData((prev) => ({ ...prev, areaUnit: prev.areaUnit || 'sq_ft' }));
  }, [serviceId]);

  // ✅ 7177: if only ONE property, auto-fill propertyNo
  useEffect(() => {
    if (serviceId !== '7177') return;

    if (propertyNoOptions.length === 1) {
      const only = propertyNoOptions[0]?.value;
      if (!only) return;

      setFormData((prev) => ({ ...prev, propertyNo: prev.propertyNo || only }));
    }
  }, [serviceId, propertyNoOptions]);

  // ✅ 7177 autofill
  useEffect(() => {
    if (serviceId !== '7177') return;

    const selectedPropertyNoRaw = String(formData?.propertyNo || '').trim();

    if (!selectedPropertyNoRaw) {
      lastPropertyAutofillRef.current = null;

      setFormData((prev: any) => ({
        ...prev,
        assessmentAccountNo: '',
        propertyTaxPropertyId: '',
        upicNo: '',
        zone: '',
        wardArea: '',
        propertyAddress: '',
        indexNumber: '',
        houseNo: '',

        ownerFirstName: '',
        ownerMiddleName: '',
        ownerLastName: '',
        ownerMobile: '',
        ownerEmail: '',
        ownerAadhar: '',
        ownerCity: '',
        ownerState: '',
      }));
      return;
    }

    // ✅ normalize if your stored numbers include "PROP-"
    const normalizedNo = selectedPropertyNoRaw.replace(/^PROP-/, '');
    const property = getPropertyByNo(normalizedNo); // ✅ single lookup
    if (!property) return;

    const nextAddress = getPropertyText(property.address, language);

    setFormData((prev: any) => {
      const lastAutofill = lastPropertyAutofillRef.current;

      const shouldUpdateAddress =
        !prev.propertyAddress ||
        !lastAutofill ||
        lastAutofill.propertyNo !== selectedPropertyNoRaw ||
        prev.propertyAddress === lastAutofill.address;

      const next = {
        ...prev,
        assessmentAccountNo: property.assessmentAccountNo ?? '',
        propertyTaxPropertyId: property.propertyTaxPropertyId ?? prev.propertyTaxPropertyId ?? '',
        upicNo: property.upicNo ?? '',
        zone: property.zone ?? '',
        wardArea: property.wardArea ?? '',
        ...(shouldUpdateAddress ? { propertyAddress: nextAddress } : {}),
        indexNumber: property.indexNumber ?? '',
        houseNo: property.houseNo ?? '',

        ownerFirstName: property.ownerFirstName ?? '',
        ownerMiddleName: property.ownerMiddleName ?? '',
        ownerLastName: property.ownerLastName ?? '',
        ownerMobile: property.ownerMobile ?? '',
        ownerEmail: property.ownerEmail ?? '',
        ownerAadhar: property.ownerAadhar ?? '',
        ownerCity: property.ownerCity ?? '',
        ownerState: property.ownerState ?? '',
      };

      lastPropertyAutofillRef.current = { propertyNo: selectedPropertyNoRaw, address: nextAddress };

      const changed = (Object.keys(next) as Array<keyof typeof next>).some(
        (key) => next[key] !== (prev as any)[key]
      );
      return changed ? next : prev;
    });
  }, [serviceId, formData?.propertyNo, language]);

  useEffect(() => {
    if (serviceId !== '7176') return;

    (async () => {
      try {
        setLoadingProps(true);

        const list = await getPropertyMastList();

        // ✅ PropertyNo dropdown options
        const opts = (list || []).map((x: any) => ({
          value: String(x.propertyNo), // ✅ fetch key = propertyNo
          label: {
            en: `${x.propertyNo}${x.ownerName ? ' - ' + x.ownerName : ''}`,
            hi: `${x.propertyNo}${x.ownerName ? ' - ' + x.ownerName : ''}`,
            mr: `${x.propertyNo}${x.ownerName ? ' - ' + x.ownerName : ''}`,
          },
          meta: x,
        }));

        setPropertyOptions(opts);

        // ✅ auto select if only one
        if (opts.length === 1) {
          setFormData((prev: any) => ({ ...prev, propertyNo: opts[0].value }));
        }
      } catch (e: any) {
        console.error('7176 property list fetch failed:', e?.message || e);
        setPropertyOptions([]);
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [serviceId]);

  // ✅ 7176 auto-fill on databaseFetch by propertyNo change Aditya_kamble
  useEffect(() => {
    if (!formData?.propertyNo) return;

    const ownerId = Number(String(formData.ownerId).trim());
    if (!ownerId || Number.isNaN(ownerId)) return;

    (async () => {
      try {
        setLoadingProps(true);

        // ✅ reset dependent fields
        setPropertyOptions([]);
        setFormData((prev: any) => ({
          ...prev,
          propertyNo: '',
          upicNo: '',
          zoneId: '',
          wardNo: '',
          surveyNo: '',
          propertyAddress: '',
          buildingName: '',
          flatNo: '',
          pincode: '',
          commencementCertNo: '',
          occupancyCertNo: '',
          occupancyCertDateType: '',
          occupancyCertDate: '',
          propertylatitude: '',
          propertylongitude: '',
        }));

        const res = await getPropertyByOwnerId(ownerId); // ✅ API 2
        const list = Array.isArray(res) ? res : res ? [res] : [];
        const options = list.map((p) => ({
          value: String(p.propertyId), // ✅ value must be propertyId
          label: {
            en: String(p.propertyNo ?? p.propertyId),
            hi: String(p.propertyNo ?? p.propertyId),
            mr: String(p.propertyNo ?? p.propertyId),
          },
          meta: p,
        }));

        setPropertyOptions(options);

        // ✅ if only 1 property -> auto pick and fetch DTO
        if (options.length === 1) {
          const onlyOne = options[0];
          setFormData((prev: any) => ({ ...prev, propertyNo: onlyOne.value }));
        }
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [formData?.ownerId]);

  // ✅ 7176 auto-fill on propertyNo change Aditya_kamble

  useEffect(() => {
    if (serviceId !== '7176') return;

    const isYes =
      String(formData?.isPropertyRegistered || '')
        .trim()
        .toLowerCase() === 'yes';

    const propertyNo = String(formData?.propertyNo || '').trim(); // ✅ propertyNo selected

    if (!isYes) return;
    if (!propertyNo) return;

    if (last7176FetchRef.current === propertyNo) return;
    last7176FetchRef.current = propertyNo;

    (async () => {
      try {
        setPropertyNotFound(false);

        // ✅ fetch by propertyNo (your backend uses PROP-xxxx anyway)
        const p = await getPropertyByPropertyId(propertyNo);

        console.log('✅ 7176 DTO:', p);

        setFormData((prev: any) => ({
          ...prev,
          zoneId: p.zoneId ?? '',
          wardNo: p.wardNo ?? '',
          surveyNo: [p.moujeGaon, p.surveyGatCtsNo].filter(Boolean).join(' - '),
          propertyAddress: p.propertyAddress ?? '',
          buildingName: p.buildingName ?? '',
          flatNo: p.wingFlatShopNo ?? '',
          pincode: p.pincode ?? '',
          propertylatitude: p.latitude ?? '',
          propertylongitude: p.longitude ?? '',
          commencementCertNo: p.ccNo ?? '',
          occupancyCertNo: p.ocNo ?? '',
        }));
      } catch (e: any) {
        console.error('7176 property fetch failed:', e?.message || e);
        setPropertyNotFound(true);
        last7176FetchRef.current = null;
      }
    })();
  }, [serviceId, formData?.isPropertyRegistered, formData?.propertyNo]);

  useEffect(() => {
    const onDocClick = (e: any) => {
      const el = e.target as HTMLElement;
      if (!el.closest('[data-checkbox-dd]')) {
        setOpenCheckboxDropdown({});
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // ✅ 7177: load propertyNo options gives propertyId, propertyNo, ownerName, etc. aditya_kamble
  useEffect(() => {
    if (serviceId !== '7177') return;

    (async () => {
      try {
        setLoadingProps(true);

        const list = await getPropertyMastList(); // ✅ gives propertyId, propertyNo, ownerName, etc.

        const opts = (list || [])
          .map((x: any) => {
            const propertyId = String(x.propertyId ?? '').trim(); // ✅ use this as value
            const propertyNo = String(x.propertyNo ?? '').trim();
            const ownerName = String(x.ownerName ?? '').trim();

            if (!propertyId) return null;

            return {
              value: propertyId, // ✅ IMPORTANT: we will fetch DTO using propertyId
              label: {
                en: `${propertyNo}${ownerName ? ' - ' + ownerName : ''}`,
                hi: `${propertyNo}${ownerName ? ' - ' + ownerName : ''}`,
                mr: `${propertyNo}${ownerName ? ' - ' + ownerName : ''}`,
              },
              meta: x,
            };
          })
          .filter(Boolean);

        setPropertyNoOptions(opts as any[]);

        // ✅ auto select if only one
        if (opts.length === 1) {
          setFormData((prev: any) => ({ ...prev, propertyNo: (opts[0] as any).value }));
        }
      } catch (e: any) {
        console.error('7177 property list load failed:', e?.message || e);
        setPropertyNoOptions([]);
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [serviceId]);

  // ✅ 7177 auto-fill on propertyNo change by aditya_kamble
  useEffect(() => {
    if (serviceId !== '7177') return;

    const propertyId = String(formData?.propertyNo || '').trim(); // ✅ propertyNo holds propertyId now
    if (!propertyId) return;

    (async () => {
      try {
        const p = await getPropertyByPropertyId(propertyId);

        setFormData((prev: any) => ({
          ...prev,
          upicNo: p.upicNo ?? '',
          zone: p.zoneId != null ? String(p.zoneId) : '',
          wardArea: p.wardNo != null ? String(p.wardNo) : '',
          propertyAddress: p.propertyAddress ?? '',

          ownerFirstName: p.ownerName ?? '',
          ownerMobile: p.mobileNo ?? '',
          ownerEmail: p.ownerEmail ?? '',
          ownerAadhar: p.ownerAadhar ?? '',
          ownerCity: p.ownerCity ?? '',
          ownerState: p.ownerState ?? '',
        }));
      } catch (e) {
        console.error('7177 fetch failed', e);
      }
    })();
  }, [serviceId, formData?.propertyNo]);

  useEffect(() => {
    if (serviceId !== '7177') return;

    const selectedPropertyNo = String(formData?.propertyNo || '').trim();

    if (!selectedPropertyNo) {
      lastPropertyAutofillRef.current = null;

      setFormData((prev: any) => ({
        ...prev,
        upicNo: '',
        zone: '',
        wardArea: '',
        propertyAddress: '',
        ownerFirstName: '',
        ownerMobile: '',
        ownerEmail: '',
        ownerAadhar: '',
        ownerCity: '',
        ownerState: '',
      }));
      return;
    }

    const property = getPropertyByNo(selectedPropertyNo);
    if (!property) return;

    const nextAddress = getPropertyText(property.address, language);

    setFormData((prev: any) => ({
      ...prev,
      upicNo: property.upicNo ?? '',
      zone: property.zone ?? '',
      wardArea: property.wardArea ?? '',
      propertyAddress: nextAddress,

      ownerFirstName: property.ownerFirstName ?? '',
      ownerMobile: property.ownerMobile ?? '',
      ownerEmail: property.ownerEmail ?? '',
      ownerAadhar: property.ownerAadhar ?? '',
      ownerCity: property.ownerCity ?? '',
      ownerState: property.ownerState ?? '',
    }));
  }, [
    serviceId,
    formData?.propertyNo, // ✅ always present in deps
    language, // ✅ always present in deps
  ]);

  const isOwnerSection = (step: any) => {
    const id = String(step?.id ?? '').toLowerCase();
    const title = String(step?.title?.en ?? '').toLowerCase();
    return id.includes('owner') || title.includes('owner');
  };

  const getOwnerCandidateSources = (ownerId: string) => {
    const prefixMatch = ownerId.match(/^[oO]wner/);
    if (!prefixMatch) return [];
    const suffix = ownerId.slice(prefixMatch[0].length);
    if (!suffix) return [];

    const normalized = suffix.charAt(0).toLowerCase() + suffix.slice(1);
    const lowerSuffix = suffix.toLowerCase();
    const candidates = [`applicant${suffix}`, `applicant${normalized}`, normalized, suffix];

    const extraAliasMap: Record<string, string[]> = {
      mobile: ['mobileNumber', 'applicantMobile', 'applicantMobileNumber'],
      email: ['emailAddress', 'applicantEmail', 'applicantEmailAddress'],
      aadhar: ['aadharNumber', 'applicantAadhar'],
      pan: ['panNumber', 'applicantPanNumber'],
      title: ['applicantTitle'],
    };

    Object.entries(extraAliasMap).forEach(([key, aliases]) => {
      if (lowerSuffix.includes(key)) candidates.push(...aliases);
    });

    return Array.from(new Set(candidates.filter(Boolean)));
  };

  const findApplicantSourceForOwner = (ownerId: string, values: Record<string, any>) => {
    const candidates = getOwnerCandidateSources(ownerId);
    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(values, candidate)) return candidate;
    }
    return null;
  };

  const syncApplicantValuesToOwner = (step: any) => {
    if (!Array.isArray(step?.fields) || !step.fields.length) return;
    setFormData((prev) => {
      const updates: Record<string, any> = {};
      step.fields.forEach((field: any) => {
        const sourceId = findApplicantSourceForOwner(field.id, prev);
        if (sourceId) updates[field.id] = prev[sourceId];
      });
      if (!Object.keys(updates).length) return prev;
      return { ...prev, ...updates };
    });
  };

  // --- SCROLL SPY ---
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (isScrollingProgrammatically.current || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const headerH = headerRef.current?.offsetHeight ?? 180;
        const scrollPosition = container.scrollTop + headerH + 20;

        let newActiveIndex = activeSection;

        sectionRefs.current.forEach((section, index) => {
          if (!section) return;
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight)
            newActiveIndex = index;
        });

        if (newActiveIndex !== activeSection) setActiveSection(newActiveIndex);
      });
    };

    const currentRef = scrollContainerRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);

    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeSection]);

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    const container = scrollContainerRef.current;
    if (!section || !container) return;

    isScrollingProgrammatically.current = true;
    setActiveSection(index);

    const headerH = headerRef.current?.offsetHeight ?? 180;
    container.scrollTo({
      top: Math.max(0, section.offsetTop - headerH - 16),
      behavior: 'smooth',
    });

    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 800);
  };

  const handleBack = () => router.push(`/${language}/service/dashboard`);

  const goToRetaxation7177 = () => {
    router.push('/service/7177');
  };

  const logRequiredMissing = () => {
    const required: any[] = [];

    for (const step of steps || []) {
      for (const field of step.fields || []) {
        if (!shouldRenderField(field)) continue;
        if (!field?.required) continue;

        required.push({
          label: field?.label?.[language] ?? field?.label?.en ?? field.id,
          key: field.id,
          value: formData[field.id],
        });
      }
    }

    const missing = required.filter((r) => r.value == null || String(r.value).trim() === '');
    dbg('REQUIRED SNAPSHOT (CONFIG):', required);
    warn('REQUIRED MISSING (CONFIG):', missing);
    return missing;
  };

  // ✅ DB mapping: groupFieldId -> groupId (MUST be before collectFormData)
  // const fieldToGroupIdMap = useMemo(() => {
  //   const map = new Map<string, number>();

  //   (initialGroups || []).forEach((g: any) => {
  //     (g.fields || []).forEach((f: any) => {
  //       if (f?.groupFieldId && typeof f?.groupId === 'number') {
  //         map.set(String(f.groupFieldId), f.groupId);
  //       }
  //     });
  //   });

  //   dbg('fieldToGroupIdMap size:', map.size);
  //   return map;
  // }, [initialGroups]);
const fieldToGroupIdMap = useMemo(() => {
  const map = new Map<string, number>();
  let gid = 1;

  for (const step of steps || []) {
    for (const field of step.fields || []) {
      const key = String(field.id);
      if (!map.has(key)) map.set(key, gid++);
    }
  }

  return map;
}, [steps]);

  // ✅ Collect form data from state
  const collectFormData = (): SaveDraftValuesRequest => {
    const values: { groupId: number; value: string | null }[] = [];

    for (const step of steps || []) {
      for (const field of step.fields || []) {
        if (!shouldRenderField(field)) continue;

        const key = String(field.id);
        const groupId = fieldToGroupIdMap.get(key);

        if (!groupId) {
          warn('groupId not found for field (skipping):', key);
          continue;
        }

        const v = formData[key];

        values.push({
          groupId,
          value: v === undefined || v === null || String(v).trim() === '' ? null : String(v),
        });
      }
    }

    dbg('COLLECT payload values count:', values.length);
    return { currentStep: 'Step1', values };
  };

  const parseBackendError = (err: any): { message?: string; missing?: any[]; status?: number } => {
    const raw = err?.message;
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return { message: raw };
    }
  };

  // const ensureApplicationId = async (): Promise<number> => {
  //   let applicationId = currentApplicationId;

  //   if (!applicationId) {
  //     const draftResp = await createDraftSSR({
  //       rtsServiceId,
  //       departmentId,
  //       currentStep: 'Step1',
  //     });

  //     applicationId = draftResp.applicationId;
  //     setCurrentApplicationId(applicationId);
  //   }

  //   return applicationId;
  // };

  // ✅ Save Draft
const ensureApplicationId = (): number => {
  let applicationId = currentApplicationId;

  if (!applicationId) {
    applicationId = Date.now(); // local-only id
    setCurrentApplicationId(applicationId);
  }

  return applicationId;
};

const handleSaveProgress = () => {
  try {
    logRequiredMissing();
    const payload = collectFormData();
    const applicationId = ensureApplicationId();

    localStorage.setItem(
      `rtsDraft:${applicationId}:${serviceId}`,
      JSON.stringify({
        applicationId,
        serviceId,
        payload,
        formData,
        savedAt: new Date().toISOString(),
      })
    );

    MySwal.fire({
      icon: 'success',
      title: 'Draft Saved',
      text: 'Your progress has been saved locally.',
      timer: 2000,
      showConfirmButton: false,
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      customClass: { popup: 'rounded-xl shadow-xl' },
    });
  } catch (err: any) {
    console.error(err);
    const apiErr = parseBackendError(err);

    MySwal.fire({
      icon: 'error',
      title: 'Error',
      text: apiErr?.message || err?.message || 'Failed to save draft',
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#ffffff' : '#000000',
      customClass: { popup: 'rounded-xl shadow-xl' },
    });
  }
};




  // const handleSaveProgress = async () => {
  //   try {
  //     logRequiredMissing();
  //     const payload = collectFormData();
  //     console.log(
  //       'Missing values being sent:',
  //       payload.values.filter((v) => v.value == null || String(v.value).trim() === '')
  //     );
  //     console.log('formData snapshot:', formData);
  //     const applicationId = await ensureApplicationId();
  //     const must = ['propertyId', 'surveyNo', 'firstName', 'lastName', 'mobileNumber', 'aadharNo'];
  //     console.log(
  //       'MISSING CHECK:',
  //       must.map((k) => [k, formData[k]])
  //     );

  //     console.log('FORMDATA KEYS:', Object.keys(formData));
  //     console.log(
  //       'PAYLOAD VALUES (sample):',
  //       payload.values.filter(
  //         (v) =>
  //           [
  //             'propertyId',
  //             'surveyNo',
  //             'firstName',
  //             'lastName',
  //             'mobileNumber',
  //             'aadharNo',
  //           ].includes(String(v.groupId)) // adjust if needed
  //       )
  //     );
  //     await saveDraftValuesSSR(applicationId, payload);

  //     MySwal.fire({
  //       icon: 'success',
  //       title: language === 'en' ? 'Draft Saved' : 'ड्राफ्ट सहेजा गया',
  //       text:
  //         language === 'en'
  //           ? 'Your progress has been saved in the database.'
  //           : 'आपकी प्रगति सुरक्षित कर ली गई है।',
  //       timer: 2000,
  //       showConfirmButton: false,
  //       background: darkMode ? '#1f2937' : '#ffffff',
  //       color: darkMode ? '#ffffff' : '#000000',
  //       customClass: { popup: 'rounded-xl shadow-xl' },
  //     });
  //   } catch (err: any) {
  //     console.error(err);
  //     const apiErr = parseBackendError(err);

  //     MySwal.fire({
  //       icon: 'error',
  //       title: language === 'en' ? 'Error' : 'त्रुटि',
  //       text: apiErr?.message || err?.message || 'Failed to save draft',
  //       background: darkMode ? '#1f2937' : '#ffffff',
  //       color: darkMode ? '#ffffff' : '#000000',
  //       customClass: { popup: 'rounded-xl shadow-xl' },
  //     });
  //   }
  // };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    MySwal.fire({
      icon: 'success',
      title: 'Copied!',
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  // ✅ Submit (final save + submit)
  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);

    // 1) UI section validation
    const firstInvalidIndex = sections.findIndex((_, idx) => !isSectionComplete(idx));
    if (firstInvalidIndex !== -1) {
      scrollToSection(firstInvalidIndex);
      const isDocsSection = !!(sections[firstInvalidIndex] as any)?.__isDocs;

      MySwal.fire({
        icon: 'error',
        title: language === 'en' ? 'Incomplete Form' : 'अपूर्ण फॉर्म',
        text: isDocsSection
          ? language === 'en'
            ? 'Please upload all required documents.'
            : 'कृपया सभी आवश्यक दस्तावेज़ अपलोड करें।'
          : language === 'en'
          ? 'Please fill all required fields highlighted in red.'
          : 'कृपया लाल रंग में हाइलाइट किए गए सभी आवश्यक फ़ील्ड भरें।',
        confirmButtonColor: '#ef4444',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });
      logRequiredMissing();
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = collectFormData();
      const step = payload.currentStep || 'Step1';

      // 2) Ensure application created
      const applicationId = await ensureApplicationId();

      // 3) Save final values
     // await saveDraftValuesSSR(applicationId, { ...payload, currentStep: step });

      // 4) Submit
     // await submitApplicationSSR(applicationId, { currentStep: step });

      const newId = `APP-${applicationId}`;
      setTrackingId(newId);

      // Optional: local success object
      const submissionDate = new Date().toLocaleString();
      const applicantName =
        (formData['applicantFirstName']
          ? `${formData['applicantFirstName']} ${formData['applicantLastName'] || ''}`.trim()
          : '') ||
        formData['applicantFullName'] ||
        formData['firstName'] ||
        formData['directorName'] ||
        'Applicant';

      const occupancyDateType = formData.occupancyCertDateType || '';
      const occupancySelectedDate = formData.occupancyCertDate || '';

      const newApplication = {
        id: newId,
        applicationId,
        serviceName:
          resolvedService?.name?.en ||
          (typeof serviceTitle === 'string' ? serviceTitle : 'Service'),
        applicantName,
        submittedDate: submissionDate,
        occupancyDateInfo: { type: occupancyDateType, date: occupancySelectedDate },
        currentStage: 1,
        progress: 25,
        status: 'submitted',
        userUpicId: 'RTS2024001234',
        stages: [
          {
            stage: 1,
            name: 'Application Submitted',
            status: 'approved',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            remark: 'System: Application received successfully.',
          },
          {
            stage: 2,
            name: 'Document Verification',
            status: 'pending',
            officer: '-',
            date: '-',
            time: '-',
            remark: 'Pending review.',
          },
          {
            stage: 3,
            name: 'Final Approval',
            status: 'pending',
            officer: '-',
            date: '-',
            time: '-',
            remark: 'Pending.',
          },
        ],
      };

      const existingData = JSON.parse(localStorage.getItem('rtsApplications') || '{}');
      existingData[newId] = newApplication;
      localStorage.setItem('rtsApplications', JSON.stringify(existingData));

      setIsSuccess(true);

      MySwal.fire({
        icon: 'success',
        title: language === 'en' ? 'Submitted' : 'सबमिट हुआ',
        text:
          language === 'en'
            ? 'Your application has been submitted successfully.'
            : 'आपका आवेदन सफलतापूर्वक सबमिट हो गया है।',
        timer: 2000,
        showConfirmButton: false,
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });
    } catch (err: any) {
      console.error(err);
      setIsSuccess(false);

      const apiErr = parseBackendError(err);

      if (apiErr?.missing?.length) {
        const listHtml = apiErr.missing
          .slice(0, 10)
          .map((m: any) => `<li>${m.groupFieldLabel}</li>`)
          .join('');

        MySwal.fire({
          icon: 'error',
          title: language === 'en' ? 'Missing Required Fields' : 'आवश्यक फ़ील्ड खाली हैं',
          html:
            language === 'en'
              ? `<div style="text-align:left;">${
                  apiErr.message || 'Please fill required fields.'
                }<ul>${listHtml}</ul></div>`
              : `<div style="text-align:left;">${
                  apiErr.message || 'कृपया आवश्यक फ़ील्ड भरें।'
                }<ul>${listHtml}</ul></div>`,
          confirmButtonColor: '#ef4444',
          background: darkMode ? '#1f2937' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
        });

        return;
      }

      MySwal.fire({
        icon: 'error',
        title: language === 'en' ? 'Submit Failed' : 'सबमिट असफल',
        text: apiErr?.message || err?.message || 'Failed to submit application',
        confirmButtonColor: '#ef4444',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HELPERS ---
  const getServiceIcon = (title: string) => {
    if (title.includes('Applicant')) return User;
    if (title.includes('Address')) return MapPin;
    if (title.includes('Document')) return FileText;
    if (title.includes('Property')) return Home;
    if (title.includes('Business')) return Briefcase;
    return Info;
  };

  const getStepIcon = (step: any): LucideIcon =>
    step?.icon && iconMap[step.icon] ? iconMap[step.icon] : getServiceIcon(step?.title?.en || '');

  // ✅ 4-column layout mapping
  const toSpan4 = (raw: any): 1 | 2 | 3 | 4 => {
    const cs = Number(raw ?? 1);
    if (cs === 12) return 4;
    if (cs === 8) return 3;
    if (cs === 6) return 2;
    if (cs === 4) return 1;
    if (cs === 3 || cs === 2) return 4;
    return 1;
  };

  const SPAN_CLASS: Record<1 | 2 | 3 | 4, string> = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2 lg:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
    4: 'col-span-1 sm:col-span-2 lg:col-span-4',
  };

  const getFieldColClass = (field: FormField) => {
    const span = toSpan4((field as any).colSpan);
    return SPAN_CLASS[span];
  };

  const defaultDeclarationText = {
    en: 'I declare that the information provided is true and correct.',
    hi: 'मैं घोषणा करता/करती हूँ कि दी गई जानकारी सत्य है।',
    mr: 'मी घोषणा करतो/करते की दिलेली माहिती खरी आहे.',
  };

  const termsAcceptedDeclarationText = {
    en: 'I have read and agree to the terms & conditions. I declare that the information provided is true and correct.',
    hi: 'मैं नियम एवं शर्तों से सहमत हूँ और घोषणा करता/करती हूँ कि दी गई जानकारी सत्य है।',
    mr: 'मी नियम व अटींना सहमत आहे आणि दिलेली माहिती खरी व अचूक असल्याची घोषणा करतो/करते.',
  };

  // --- DOCUMENT UPLOAD ---

  const renderField = (field: FormField, stepId: string, stepDisabled = false, fieldIndex = 0) => {
    if (!shouldRenderField(field as any)) return null;

    const fieldType = (field as any).type;
    const fieldId = String((field as any).id ?? '');
    const fieldError = getFieldError(field as any);
    const showError = !!fieldError && (hasAttemptedSubmit || touchedFields[fieldId]);
    const placeholderText =
      typeof (field as any)?.placeholder === 'string'
        ? (field as any).placeholder
        : (field as any)?.placeholder?.[language] || (field as any)?.placeholder?.en;
    const helpText =
      (field as any)?.helperText?.[language] ||
      (field as any)?.helperText?.en ||
      (field as any)?.description?.[language] ||
      (field as any)?.description?.en ||
      placeholderText ||
      '';
    const helpIcon = helpText ? (
      <span title={helpText} aria-label={helpText} className="inline-flex cursor-help">
        <Info
          className={`w-3.5 h-3.5 ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}
        />
      </span>
    ) : null;

    // ✅ Banner + Block submit for 7176 when property already exists
    const is7176RegisteredYes =
      serviceId === '7176' &&
      String(formData?.isPropertyRegistered || '')
        .trim()
        .toLowerCase() === 'yes';

    const showRegisteredBanner =
      is7176RegisteredYes && !!String(formData?.propertyNo || '').trim() && !propertyNotFound;

    const block7176Submit = showRegisteredBanner; // you can make stricter if you want

    // ✅ 7176 lock: registered=yes + owner selected + propertyFound
    const lockPropertyLocation =
      serviceId === '7176' &&
      String(formData?.isPropertyRegistered || '')
        .trim()
        .toLowerCase() === 'yes' &&
      !!String(formData?.propertyNo || '').trim() &&
      !propertyNotFound;

    const is7177OwnerAutofillLocked =
      serviceId === '7177' && !!String(formData.propertyNo || '').trim();

    const LOCK_IDS_7177 = new Set([
      'ownerFirstName',
      'ownerMiddleName',
      'ownerLastName',
      'ownerMobile',
      'ownerEmail',
      'ownerAadhar',
      'ownerCity',
      'ownerState',
    ]);

    // ACTION
    if (fieldType === 'action') {
      // ✅ Disable CC & Electricity if OC is selected (Rule 1)
      const ocChecked = formData['certOC'] === true;
      const certLock = ocChecked && (fieldId === 'certCC' || fieldId === 'certElectricityBill');

      const isDisabled =
        stepDisabled ||
        !!(field as any).disabled ||
        certLock ||
        (lockPropertyLocation && PROPERTY_AUTO_FIELDS.has(fieldId));

      return (
        <div key={`${stepId}-${fieldId}-${fieldIndex}`} className={getFieldColClass(field)}>
          <label
            title={helpText || undefined}
            className={`flex items-center gap-1 min-w-0 text-xs font-semibold mb-1.5 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <span className="truncate">
              {(field as any).label?.[language] ?? (field as any).label?.en}
            </span>
            {helpIcon}
          </label>

          <button
            type="button"
            disabled={isDisabled}
            className={`w-full h-10 rounded-lg border font-semibold text-sm transition-all ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
                : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
            } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {(field as any).label?.[language] ?? (field as any).label?.en}
          </button>
        </div>
      );
    }

   

    if (fieldType === 'checkbox') {
      const checked = formData[fieldId] === true;

      const ocSelected = formData['certOC'] === true;

      // Disable CC, EB, Other when OC is selected
      const disableBecauseOC =
        ocSelected &&
        ( fieldId === 'certElectricityBill' || fieldId === 'certOther');

      const cfgLine =
        (field as any)?.description?.[language] ||
        (field as any)?.helperText?.[language] ||
        (field as any)?.placeholder?.[language] ||
        '';

      const line =
        fieldId === 'termsAccepted'
          ? termsAcceptedDeclarationText[language]
          : cfgLine || defaultDeclarationText[language];

      return (
        <div
          key={`${stepId}-${fieldId}-${fieldIndex}`}
          className="col-span-1 sm:col-span-2 lg:col-span-4"
        >
          <div
            className={`rounded-xl border p-4 ${
              showError
                ? 'border-red-500 ring-1 ring-red-500 bg-red-50'
                : darkMode
                ? 'border-gray-600 bg-gray-700/20'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                id={fieldId}
                type="checkbox"
                checked={checked}
                disabled={stepDisabled || disableBecauseOC}
                onChange={(e) => {
                  if (stepDisabled) return;
                  handleInputChange(fieldId, e.target.checked, field);
                  markTouched(fieldId);
                }}
                style={{ colorScheme: 'light' }}
                className="mt-1 h-4 w-4 rounded border border-gray-300 bg-white accent-teal-600 focus:ring-2 focus:ring-teal-500"
              />

              <div className="min-w-0 flex-1">
                <label
                  htmlFor={fieldId}
                  title={helpText || undefined}
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    showError ? 'text-red-600' : darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  <span className="truncate">
                    {(field as any).label?.[language]}{' '}
                    {(field as any).required && <span className="text-red-500">*</span>}
                  </span>
                  {helpIcon}
                </label>

                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {line}
                </p>

                {showError && (
                  <span className="text-[10px] text-red-600 mt-2 block">{fieldError}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // LocationPicker field
    if (fieldType === 'locationPicker') {
      const picked = formData[fieldId] ?? null;
      const placeholder =
        (field as any)?.placeholder?.[language] ||
        (language === 'hi'
          ? 'स्थान खोजें...'
          : language === 'mr'
          ? 'स्थान शोधा...'
          : 'Search location...');

      return (
        <div key={`${stepId}-${fieldId}-${fieldIndex}`} className={getFieldColClass(field)}>
          <div
            title={helpText || undefined}
            className={`flex items-center gap-1 min-w-0 text-xs font-semibold mb-1.5 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <span className="truncate">
              {(field as any).label?.[language] ?? (field as any).label?.en}{' '}
              {(field as any).required && <span className="text-red-500">*</span>}
            </span>
            {helpIcon}
          </div>

          <LocationPicker
            value={picked}
            placeholder={placeholder}
            persistKey={(field as any).persistKey || `rts_picker_${fieldId}`}
            onChange={(v) => {
              if (stepDisabled) return;
              handleInputChange(fieldId, v, field);
              markTouched(fieldId);
            }}
          />

          {showError && <span className="text-[10px] text-red-500 mt-1 block">{fieldError}</span>}
        </div>
      );
    }

    // ✅ CHECKBOX DROPDOWN (select, no typing)
    // ✅ CHECKBOX DROPDOWN (multi-select like screenshot)
    if (fieldType === 'checkboxDropdown') {
      const options = (field as any).options || [];

      // store as string[] in formData
      const selected: string[] = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];

      const OCC_KEYS = {
        OC: 'OC Date',
        CC: 'CC Date',
        EB: 'Electricity Bill Date',
        OTHER: 'Other',
      };

      const ocSelected = selected.includes(OCC_KEYS.OC);

      const selectPlaceholder =
        (field as any)?.placeholder?.[language] ||
        (language === 'hi' ? 'चयन करें' : language === 'mr' ? 'निवडा' : 'Select');

      const labelText = (field as any).label?.[language] ?? (field as any).label?.en ?? '';

      const displayText =
        selected.length === 0
          ? selectPlaceholder
          : selected
              .map((val) => {
                const found = options.find((o: any) => String(o.value) === String(val));
                return found
                  ? found.label?.[language] ?? found.label?.en ?? found.label ?? val
                  : val;
              })
              .join(', ');

      return (
        <div key={`${stepId}-${fieldId}-${fieldIndex}`} className={getFieldColClass(field)}>
          <div
            className={`flex items-center justify-between gap-2 text-xs font-semibold mb-1.5 ${
              showError ? 'text-red-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <span className="truncate">
              {labelText} {(field as any).required && <span className="text-red-500">*</span>}
            </span>
          </div>

          {/* Trigger */}
          <div className="relative" data-checkbox-dd>
            <button
              type="button"
              disabled={stepDisabled}
              onClick={() => {
                if (stepDisabled) return;
                setOpenCheckboxDropdown((prev: any) => ({
                  ...(prev || {}),
                  [fieldId]: !(prev || {})[fieldId],
                }));
              }}
              className={`w-full h-10 px-3 rounded border text-sm text-left flex items-center justify-between ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${showError ? 'border-red-500 ring-1 ring-red-500' : ''} ${
                stepDisabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span className="truncate">{displayText}</span>
              <span className="ml-2 text-xs">▾</span>
            </button>

            {/* Dropdown Panel */}
            {(openCheckboxDropdown?.[fieldId] ?? false) && (
              <div
                className={`absolute z-50 mt-2 w-full rounded-xl border shadow-lg overflow-hidden ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div
                  className={`px-3 py-2 text-xs font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {language === 'hi' ? 'Categories' : language === 'mr' ? 'श्रेणी' : 'Categories'}
                </div>

                <div className="max-h-56 overflow-auto">
                  {options.map((opt: any) => {
                    const optValue = String(opt.value);
                    const checked = selected.includes(optValue);

                    const optLabel =
                      opt.label?.[language] ?? opt.label?.en ?? opt.label ?? optValue;

                    const disableBecauseOC =
                      ocSelected &&
                      (
                        
                        optValue === OCC_KEYS.EB ||
                        optValue === OCC_KEYS.OTHER);

                    return (
                      <label
                        key={optValue}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                          darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50'
                        } ${
                          disableBecauseOC || stepDisabled ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={
                            stepDisabled ||
                            (ocSelected &&
                              (
                                optValue === OCC_KEYS.EB ||
                                optValue === OCC_KEYS.OTHER))
                          }
                          onChange={(e) => {
                            if (stepDisabled) return;

                            // hard block when OC already selected
                            if (
                              ocSelected &&
                              (
                                optValue === OCC_KEYS.EB ||
                                optValue === OCC_KEYS.OTHER)
                            ) {
                              return;
                            }

                            let nextArr = e.target.checked
                              ? Array.from(new Set([...selected, optValue]))
                              : selected.filter((x) => x !== optValue);

                            const hasOC = nextArr.includes(OCC_KEYS.OC);
                            const hasCC = nextArr.includes(OCC_KEYS.CC);
                            const hasEB = nextArr.includes(OCC_KEYS.EB);

                            // ✅ Rule 1: If OC selected -> remove CC/EB/Other
                            if (hasOC) {
                              nextArr = nextArr.filter(
                                (x) =>
                                   x !== OCC_KEYS.EB && x !== OCC_KEYS.OTHER
                              );

                              
                            } else {
                              // ✅ Rule 2: EB cannot be without CC
                              
                            }

                            handleInputChange(fieldId, nextArr, field);
                            markTouched(fieldId);
                          }}
                          className="h-4 w-4 rounded border-gray-300 accent-teal-600"
                        />

                        <span className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          {optLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Footer actions */}
                <div
                  className={`px-3 py-2 flex items-center justify-end gap-2 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1 rounded-md ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => {
                      if (stepDisabled) return;
                      handleInputChange(fieldId, [], field);
                      markTouched(fieldId);
                    }}
                  >
                    {language === 'hi' ? 'Clear' : language === 'mr' ? 'Clear' : 'Clear'}
                  </button>

                  <button
                    type="button"
                    className="text-xs font-semibold px-3 py-1 rounded-md bg-teal-600 text-white"
                    onClick={() =>
                      setOpenCheckboxDropdown((prev: any) => ({
                        ...(prev || {}),
                        [fieldId]: false,
                      }))
                    }
                  >
                    {language === 'hi' ? 'Done' : language === 'mr' ? 'Done' : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {showError && <span className="text-[10px] text-red-500 mt-1 block">{fieldError}</span>}
        </div>
      );
    }

    // other fields
    const value = formData[fieldId] ?? '';
    const { inputMode, base, exactLength } = getMergedRules(field as FormField);
    const maxLength = exactLength ?? base.maxLength;

    const baseClasses = `w-full px-3 py-2 rounded border outline-none transition-all duration-200 text-sm`;
    const themeClasses = darkMode
      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400 placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500 placeholder-gray-400';
    const errorClasses = showError
      ? 'border-red-500 ring-1 ring-red-500 bg-red-50 dark:bg-red-900/10'
      : '';
    const commonClasses = `${baseClasses} ${themeClasses} ${errorClasses}`;

    const isDisabled =
      stepDisabled ||
      !!(field as any).disabled ||
      (lockPropertyLocation && PROPERTY_AUTO_FIELDS.has(fieldId));

    let isReadOnly = !!(field as any).readOnly;

    if (lockPropertyLocation && PROPERTY_AUTO_FIELDS.has(fieldId) && fieldType !== 'select')
      isReadOnly = true;

    // ✅ 7177 owner lock
    if (is7177OwnerAutofillLocked && LOCK_IDS_7177.has(fieldId)) {
      if (fieldType !== 'select') isReadOnly = true;
    }

    const selectPlaceholder =
      (field as any)?.placeholder?.[language] ||
      (language === 'hi' ? 'चयन करें' : language === 'mr' ? 'निवडा' : 'Select');

    const OCC_LABELS: Record<string, { en: string; hi: string; mr: string }> = {
      'OC Date': { en: 'OC Date', hi: 'OC दिनांक', mr: 'OC दिनांक' },
      'CC Date': { en: 'CC Date', hi: 'CC दिनांक', mr: 'CC दिनांक' },
      'Electricity Bill Date': {
        en: 'Electricity Bill Date',
        hi: 'बिजली बिल दिनांक',
        mr: 'वीज बिल दिनांक',
      },
      Other: { en: 'Other Date', hi: 'अन्य दिनांक', mr: 'इतर दिनांक' },
    };

    const displayLabel = (field as any).label?.[language] ?? (field as any).label?.en ?? '';

    const showMapBtn = serviceId === '7176' && fieldId === 'propertyAddress';

    const options =
      serviceId === '7177' && fieldId.toLowerCase() === 'propertyno'
        ? propertyNoOptions // ✅ use 7177 list
        : serviceId === '7176' && fieldId.toLowerCase() === 'propertyno'
        ? propertyOptions // ✅ use 7176 list
        : (field as any).options || [];

    if (serviceId === '7177' && fieldType === 'select') {
      console.log('🔎 7177 SELECT:', fieldId, 'propertyNoOptions:', propertyNoOptions.length);
    }

    if (serviceId === '7176') {
      console.log('🟨 fieldId:', fieldId, 'type:', fieldType);
    }

    const finalDisabled =
      stepDisabled ||
      (fieldType === 'select' && fieldId === 'propertyNo'
        ? !String(formData?.propertyNo || '').trim() || loadingProps
        : isDisabled);

    if (serviceId === '7176' && fieldType === 'select') {
      console.log(
        '🔎 SELECT FIELD:',
        fieldId,
        'options:',
        (field as any).options?.length,
        'ownerOptions:',
        ownerOptions.length
      );
    }

    return (
      <div key={`${stepId}-${fieldId}-${fieldIndex}`} className={getFieldColClass(field)}>
        <div
          className={`flex items-center justify-between gap-2 text-xs font-semibold mb-1.5 ${
            showError ? 'text-red-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          <div className="flex items-center gap-1 min-w-0">
            <span className="truncate" title={helpText || undefined}>
              {displayLabel} {(field as any).required && <span className="text-red-500">*</span>}
            </span>
            {helpIcon}
          </div>

          {showMapBtn && (
            <button
              type="button"
              onClick={() => setOpenMapFor('property')}
              className={`shrink-0 px-3 py-1 rounded-md border text-[11px] font-semibold transition-all ${
                darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Location
            </button>
          )}
        </div>

        {fieldType === 'select' ? (
          <select
            className={`${commonClasses} h-10`}
            value={value}
            disabled={finalDisabled}
            onChange={(e) => handleInputChange(fieldId, e.target.value, field)}
            onBlur={() => markTouched(fieldId)}
          >
            <option value="">{selectPlaceholder}</option>
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label?.[language] ?? opt.label?.en ?? opt.label}
              </option>
            ))}
          </select>
        ) : fieldType === 'textarea' ? (
          <textarea
            rows={2}
            className={`${commonClasses} resize-y min-h-[42px]`}
            placeholder={(field as any).placeholder?.[language]}
            value={value}
            disabled={isDisabled}
            readOnly={isReadOnly}
            maxLength={typeof maxLength === 'number' ? maxLength : undefined}
            onChange={(e) => handleInputChange(fieldId, e.target.value, field)}
            onBlur={() => markTouched(fieldId)}
          />
        ) : (
          <input
            type={fieldType}
            className={`${commonClasses} h-10`}
            placeholder={(field as any).placeholder?.[language]}
            value={value}
            disabled={isDisabled}
            readOnly={isReadOnly}
            inputMode={inputMode}
            maxLength={typeof maxLength === 'number' ? maxLength : undefined}
            min={fieldType === 'number' && typeof base.min === 'number' ? base.min : undefined}
            max={fieldType === 'number' && typeof base.max === 'number' ? base.max : undefined}
            onChange={(e) => handleInputChange(fieldId, e.target.value, field)}
            onBlur={() => markTouched(fieldId)}
          />
        )}

        {showError && <span className="text-[10px] text-red-500 mt-1 block">{fieldError}</span>}
      </div>
    );
  };

  const renderDocumentUpload = (doc: any) => {
    const file = uploadedDocs[doc.id] || null;
    const required = isDocRequired(doc);
    const isDocError = hasAttemptedSubmit && required && !file;

    const onPick = (f: File | null) => setUploadedDocs((prev) => ({ ...prev, [doc.id]: f }));

    return (
      <label
        key={doc.id}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer group
          ${
            isDocError
              ? 'border-red-400 bg-red-50'
              : darkMode
              ? 'border-gray-600 bg-gray-700/50'
              : 'border-gray-200 bg-gray-50'
          }
          hover:border-teal-500 transition-all`}
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />

        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
            darkMode
              ? 'bg-gray-600 group-hover:bg-teal-500/20'
              : 'bg-white border border-gray-200 group-hover:bg-teal-50'
          }`}
        >
          <FileText
            className={`w-4 h-4 ${
              file
                ? darkMode ? 'text-teal-400' : 'text-teal-600'
                : darkMode ? 'text-gray-300' : 'text-gray-400 group-hover:text-teal-500'
            }`}
          />
        </div>

        {/* Label + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {doc.label[language]}
            </span>
            {required && <span className="text-red-500 text-xs">*</span>}
          </div>
          {file ? (
            <p className={`text-[10px] truncate ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
              {file.name}
            </p>
          ) : doc.description?.[language] ? (
            <p className="text-[10px] text-gray-400 truncate">{doc.description[language]}</p>
          ) : null}
          {isDocError && (
            <p className="text-[10px] text-red-600 font-semibold">
              {language === 'en' ? 'Required' : language === 'hi' ? 'आवश्यक' : 'आवश्यक'}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="px-2.5 py-1 text-[10px] text-teal-700 bg-teal-50 font-semibold rounded border border-teal-200 group-hover:bg-teal-100 transition-colors whitespace-nowrap">
            {file ? 'Change' : 'Upload'}
          </span>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPick(null);
              }}
              className="px-2 py-1 text-[10px] font-semibold rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap"
            >
              ✕
            </button>
          )}
        </div>
      </label>
    );
  };

  // --- SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="pt-12 pb-12 px-8 text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {language === 'en'
                  ? 'Application Submitted Successfully!'
                  : language === 'hi'
                  ? 'आवेदन सफलतापूर्वक जमा हुआ!'
                  : 'अर्ज यशस्वीरित्या सबमिट झाला!'}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'en'
                  ? 'Your application has been received and is under review.'
                  : language === 'hi'
                  ? 'आपका आवेदन प्राप्त हुआ है और समीक्षाधीन है।'
                  : 'तुमचा अर्ज प्राप्त झाला आहे आणि तपासणीत आहे.'}
              </p>
            </div>

            <div
              className={`p-6 rounded-xl border-2 border-dashed ${
                darkMode ? 'bg-gray-700/50 border-teal-500/50' : 'bg-teal-50 border-teal-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span
                    className={`text-sm font-semibold uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {language === 'en' ? 'Application Tracking ID' : 'ट्रैकिंग आईडी'}
                  </span>
                </div>
                <div
                  className={`text-4xl font-mono font-bold tracking-wider ${
                    darkMode ? 'text-teal-400' : 'text-teal-600'
                  }`}
                >
                  {trackingId}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {language === 'en'
                    ? 'Save this ID to track status'
                    : 'स्थिति ट्रैक करने के लिए सहेजें'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                onClick={() => copyToClipboard(trackingId)}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-lg py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Copy Tracking ID' : 'आईडी कॉपी करें'}
              </Button>

              <Button
                onClick={handleBack}
                variant="outline"
                className={`${
                  darkMode
                    ? 'border-gray-600 hover:bg-gray-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                } py-3`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'en'
                  ? 'Back to Services'
                  : language === 'hi'
                  ? 'वापस जाएं'
                  : 'सेवांकडे परत जा'}
              </Button>
            </div>

            <div
              className={`flex items-start gap-3 p-4 rounded-lg text-left ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}
            >
              <Info
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {language === 'en'
                  ? 'You will receive SMS and email notifications regarding your application status. The processing will be completed within 15 working days.'
                  : 'आपको अपने आवेदन की स्थिति के बारे में एसएमएस और ईमेल सूचनाएं प्राप्त होंगी।'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM ---
  return (
    <div
      className={`fixed inset-0 flex flex-col w-full mt-16 sm:mt-20 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`flex-shrink-0 w-full ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b shadow-md z-10`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={handleBack}
                className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  darkMode
                    ? 'border-gray-600 hover:bg-gray-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'Back' : language === 'hi' ? 'पीछे' : 'मागे'}
                </span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 w-full max-w-xl">
                  <div className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <h1
                    className={`text-sm sm:text-lg font-semibold whitespace-nowrap ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {serviceTitle}
                  </h1>
                  <div className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
              </div>

              <div className="md:hidden mt-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {sections.map((sec: any, idx: number) => {
                    const isActive = idx === activeSection;
                    const isComplete = isSectionComplete(idx);
                    const isErr = hasAttemptedSubmit && !isComplete;

                    return (
                      <button
                        key={`${sec.id}-${idx}`}
                        onClick={() => scrollToSection(idx)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${
                            isActive
                              ? 'bg-teal-600 text-white border-teal-600'
                              : isErr
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : darkMode
                              ? 'bg-gray-700 text-gray-100 border-gray-600'
                              : 'bg-white text-gray-700 border-gray-200'
                          }`}
                      >
                        {sec.__isDocs
                          ? docsTitle[language]
                          : sec.title?.[language] || sec.title?.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="w-[56px]" />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Sidebar */}
        <aside
          className={`w-48 lg:w-56 xl:w-64 flex-shrink-0 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-r p-3 lg:p-4 overflow-y-auto hidden md:block`}
        >
          <h3
            className={`text-[10px] lg:text-xs font-bold uppercase tracking-wide mb-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {language === 'en'
              ? 'Form Sections'
              : language === 'hi'
              ? 'फॉर्म अनुभाग'
              : 'फॉर्म विभाग'}
          </h3>

          <nav className="space-y-1 lg:space-y-1.5">
            {sections.map((step: any, index: number) => {
              const isActive = index === activeSection;
              const Icon = step.__isDocs ? FileCheck : getStepIcon(step);

              const isComplete = isSectionComplete(index);
              const isErr = hasAttemptedSubmit && !isComplete;

              return (
                <button
                  key={step.id || index}
                  onClick={() => scrollToSection(index)}
                  className={`w-full flex items-center gap-2 lg:gap-2.5 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all ${
                    isActive
                      ? darkMode
                        ? 'bg-teal-900/30 text-teal-400 border-l-4 border-teal-500'
                        : 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isErr
                        ? 'bg-red-500 text-white'
                        : isComplete
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? darkMode
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'bg-teal-100 text-teal-600'
                        : darkMode
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isErr ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : isComplete ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[10px] lg:text-xs font-medium truncate ${
                        isActive ? 'font-bold' : ''
                      } ${isErr ? 'text-red-500' : ''}`}
                    >
                      {step.__isDocs
                        ? docsTitle[language]
                        : step.title?.[language] || step.title?.en}
                    </div>
                    <div
                      className={`text-[9px] lg:text-[10px] ${
                        isErr ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      {isErr ? 'Pending Action' : language === 'en' ? 'Section' : 'खंड'} {index + 1}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4" ref={scrollContainerRef}>
          {sections.map((sec: any, index: number) => {
            const shouldDisableTaxAssessment7176 =
              serviceId === '7176' &&
              String(formData?.isPropertyRegistered || '')
                .trim()
                .toLowerCase() === 'yes' &&
              !!String(formData?.propertyNo || '').trim() &&
              !propertyNotFound;

            if (!sec.__isDocs && !isConditionMet(sec.showIf, formData)) {
              return null;
            }
            // ---------------------------
            // ✅ DOCUMENTS SECTION
            // ---------------------------
            if (sec.__isDocs) {
              return (
                <section
                  key="docs"
                  ref={(el) => {
                    sectionRefs.current[index] = el;
                  }}
                  className={`mb-2 sm:mb-3 rounded-lg ${
                    darkMode
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200 shadow-sm'
                  } p-3 sm:p-4`}
                >
                  <div
                    className={`pb-2 mb-2 border-b ${
                      darkMode ? 'border-teal-500' : 'border-teal-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 rounded-md ${
                          darkMode ? 'bg-teal-900/30' : 'bg-teal-50'
                        }`}
                      >
                        <FileCheck
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            darkMode ? 'text-teal-400' : 'text-teal-600'
                          }`}
                        />
                      </div>

                      <div>
                        <h2
                          className={`text-sm sm:text-base font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          {language === 'en' ? 'Supporting Documents' : 'सहायक दस्तावेज़'}
                        </h2>
                        <p
                          className={`text-xs mt-0.5 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {language === 'en'
                            ? 'Upload all required documents'
                            : 'सभी आवश्यक दस्तावेज़ अपलोड करें'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {docsList.map((doc: any) => renderDocumentUpload(doc))}
                  </div>
                </section>
              );
            }

            // ---------------------------
            // ✅ NORMAL STEP SECTION
            // ---------------------------
            const step = sec;
            const stepDisabled =
              step.id === 'tax-assessment-details' && shouldDisableTaxAssessment7176;
            const ownerStepKey = step.id || `owner-${index}`;
            const ownerSyncEnabled = ownerSyncState[ownerStepKey] ?? false;
            const isOwnerSectionVisible = isOwnerSection(step);

            // ✅ 7176 Banner condition (property is fetched & found)
            const showRegisteredBanner7176 =
              serviceId === '7176' &&
              step.id === 'property-details' &&
              String(formData?.isPropertyRegistered || '')
                .trim()
                .toLowerCase() === 'yes' &&
              !!String(formData?.propertyNo || '').trim() &&
              !propertyNotFound;

            const isAlreadyRegistered7176 =
              serviceId === '7176' &&
              String(formData?.isPropertyRegistered || '')
                .trim()
                .toLowerCase() === 'yes' &&
              !!String(formData?.propertyNo || '').trim() &&
              !propertyNotFound;

            return (
              <section
                key={step.id || index}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                className={`mb-2 sm:mb-3 rounded-lg ${
                  darkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
                } p-3 sm:p-4`}
              >
                {/* Header */}
                <div
                  className={`pb-2 mb-2 border-b ${
                    darkMode ? 'border-teal-500' : 'border-teal-100'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`p-1.5 rounded-md ${
                        darkMode ? 'bg-teal-900/30' : 'bg-teal-50'
                      }`}
                    >
                      {(() => {
                        const Icon = getStepIcon(step);
                        return (
                          <Icon
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              darkMode ? 'text-teal-400' : 'text-teal-600'
                            }`}
                          />
                        );
                      })()}
                    </div>

                    <div>
                      <h2
                        className={`text-sm sm:text-base font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {step.title[language]}
                      </h2>
                      {step.description && (
                        <p
                          className={`text-xs mt-0.5 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {step.description[language]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ 7176 Registered Property Banner (ONLY inside property-details step) */}
                {showRegisteredBanner7176 && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-amber-900">
                          {language === 'hi'
                            ? 'यह संपत्ति पहले से रजिस्टर्ड है'
                            : language === 'mr'
                            ? 'ही मालमत्ता आधीच नोंदणीकृत आहे'
                            : 'This property is already registered'}
                        </div>

                        <div className="mt-1 text-xs text-amber-800">
                          {language === 'hi'
                            ? 'यदि आप बदलाव करना चाहते हैं तो कृपया Retaxation Department में संपर्क करें।'
                            : language === 'mr'
                            ? 'बदल करायचा असल्यास कृपया Retaxation Department मध्ये संपर्क करा.'
                            : 'If you want to make changes, please visit the Retaxation Department.'}
                        </div>

                        {/* ✅ CTA Buttons */}
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={goToRetaxation7177}
                            className="inline-flex items-center justify-center rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800 transition"
                          >
                            {language === 'hi'
                              ? 'Retaxation (7177) पर जाएं'
                              : language === 'mr'
                              ? 'Retaxation (7177) वर जा'
                              : 'Go to Retaxation'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Owner sync checkbox */}
                {isOwnerSectionVisible && hasApplicantFields && (
                  <div className="mb-5">
                    <label className="inline-flex items-center gap-3 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={ownerSyncEnabled}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setOwnerSyncState((prev) => ({ ...prev, [ownerStepKey]: next }));
                          if (next) syncApplicantValuesToOwner(step);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>
                        {language === 'hi'
                          ? 'आवेदक विवरण मालिक के समान'
                          : language === 'mr'
                          ? 'आवेदक तपशील मालकासारखे'
                          : 'Owner details same as Applicant'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {step.fields.map((field: any, fieldIndex: number) =>
                    renderField(field as any, step.id, stepDisabled, fieldIndex)
                  )}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* ✅ ONE modal only */}
      {openMapFor === 'property' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3">
          <div
            className={`w-full max-w-3xl rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Property Location
              </h3>

              <button
                type="button"
                onClick={() => setOpenMapFor(null)}
                className={`px-3 py-1 rounded-md border text-xs font-semibold ${
                  darkMode
                    ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>

            <LocationPicker
              value={
                formData.propertylatitude && formData.propertylongitude
                  ? {
                      lat: Number(formData.propertylatitude),
                      lng: Number(formData.propertylongitude),
                      label: String(formData.propertyAddress || ''),
                    }
                  : null
              }
              placeholder={
                language === 'hi'
                  ? 'स्थान खोजें...'
                  : language === 'mr'
                  ? 'स्थान शोधा...'
                  : 'Search location...'
              }
              persistKey="rts_picker_property_7176"
              onChange={(picked) => {
                if (!picked) return;

                void (async () => {
                  const rev = await reverseGeocode(picked.lat, picked.lng);

                  setFormData((prev) => ({
                    ...prev,
                    propertyAddress: rev?.displayName || picked.label || prev.propertyAddress || '',
                    propertylatitude: picked.lat.toFixed(6),
                    propertylongitude: picked.lng.toFixed(6),
                    pincode: String(prev.pincode || '').trim() ? prev.pincode : rev?.postcode || '',
                    propertyCity: String(prev.propertyCity || '').trim()
                      ? prev.propertyCity
                      : rev?.city || '',
                    propertyState: String(prev.propertyState || '').trim()
                      ? prev.propertyState
                      : rev?.state || '',
                  }));

                  setOpenMapFor(null);
                })();
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className={`flex-shrink-0 w-full ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-t shadow-2xl`}
      >
        <div className="w-full px-4 sm:px-6 py-2">
          <div className="flex flex-row justify-end items-center gap-2 sm:gap-3">
            <button
              onClick={handleSaveProgress}
              disabled={
                serviceId === '7176' &&
                String(formData?.isPropertyRegistered || '')
                  .trim()
                  .toLowerCase() === 'yes' &&
                !!String(formData?.propertyNo || '').trim() &&
                !propertyNotFound
              }
              className={`flex items-center justify-center px-3 sm:px-5 py-1.5 rounded-md border font-medium text-xs transition-all
    ${
      serviceId === '7176' &&
      String(formData?.isPropertyRegistered || '')
        .trim()
        .toLowerCase() === 'yes' &&
      !!String(formData?.propertyNo || '').trim() &&
      !propertyNotFound
        ? 'opacity-70 cursor-not-allowed pointer-events-none'
        : darkMode
        ? 'border-teal-500 text-teal-400 hover:bg-teal-900/20'
        : 'border-teal-500 text-teal-700 hover:bg-teal-50'
    }`}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {serviceId === '7176' &&
              String(formData?.isPropertyRegistered || '')
                .trim()
                .toLowerCase() === 'yes' &&
              !!String(formData?.propertyNo || '').trim() &&
              !propertyNotFound
                ? language === 'mr'
                  ? 'Retaxation विभागात जा'
                  : language === 'hi'
                  ? 'Retaxation विभाग में जाएं'
                  : 'Go to Retaxation Department'
                : language === 'en'
                ? 'Save Draft'
                : 'सहेजें'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (serviceId === '7176' &&
                  String(formData?.isPropertyRegistered || '')
                    .trim()
                    .toLowerCase() === 'yes' &&
                  !!String(formData?.propertyNo || '').trim() &&
                  !propertyNotFound)
              }
              className={`flex items-center justify-center px-4 sm:px-6 py-1.5 rounded-md bg-gradient-to-r from-green-500 to-teal-600 text-white shadow font-medium text-xs transition-all
    ${
      isSubmitting ||
      (serviceId === '7176' &&
        String(formData?.isPropertyRegistered || '')
          .trim()
          .toLowerCase() === 'yes' &&
        !!String(formData?.propertyNo || '').trim() &&
        !propertyNotFound)
        ? 'opacity-70 cursor-not-allowed pointer-events-none'
        : 'hover:from-green-600 hover:to-teal-700'
    }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">
                    {serviceId === '7176' &&
                    String(formData?.isPropertyRegistered || '')
                      .trim()
                      .toLowerCase() === 'yes' &&
                    !!String(formData?.propertyNo || '').trim() &&
                    !propertyNotFound
                      ? language === 'mr'
                        ? 'Retaxation विभागात जा'
                        : language === 'hi'
                        ? 'Retaxation विभाग में जाएं'
                        : 'Go to Retaxation Department'
                      : language === 'en'
                      ? 'Submit Application'
                      : 'जमा करें'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}





