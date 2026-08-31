// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Check,
  CheckCircle,
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
} from "lucide-react";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { isConditionMet } from "@/lib/utils/rts/conditions";
import { VALIDATION_RULES } from "@/lib/utils/validationRegistry";

const DEFAULT_INDIAN_MOBILE_PATTERN = "^[7-9][0-9]{9}$";
const DEFAULT_GMAIL_EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@gmail\\.com$";

import { type FormField, type NormalizeRule, type CustomValidate, type InputMode } from "@/types/rts/form.types";
import { type SaveDraftValuesRequest } from "@/types/rts.types";
import { useLanguage } from "@/components/Providers/LanguageProvider";
import DynamicFieldRenderer from "@/components/modules/rts/forms/DynamicFieldRenderer";
import {
  buildOldServiceFormConfigFromRtsFieldDefinitions,
  extractRtsFieldDefinitionItems,
} from "@/lib/utils/rts/rts-field-definition-mapper";
import { resolveApplicantContact } from "@/lib/utils/rts/rts-application-payload";
import type { CreateRtsApplicationResponse } from "@/types/rts/rts-application.types";
import { PaymentCheckoutModal } from "@/components/modules/rts/citizen/PaymentCheckoutModal";
import { PaymentReceiptModal } from "@/components/modules/rts/citizen/PaymentReceiptModal";
import type { PaymentReceiptResult } from "@/lib/api/rts/rtspayment.service";

const MySwal = withReactContent(Swal);

const Button = ({ children, className, variant, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center ${variant === "outline" ? "border-2 bg-transparent" : ""
      } ${className}`}
  >
    {children}
  </button>
);

interface ServiceFormProps {
  locale: string;
  serviceId: string;
  govtServiceCode?: number;
  departmentId?: number;
  serviceTitle?: string;
  initialGroups?: any[] | { items?: any[] };
  submitApplicationAction?: (payload: FormData) => Promise<CreateRtsApplicationResponse>;
  submitState?: "form" | "success";
  successTrackingId?: string;
  successApplicationStatus?: string;
  isLoggedIn?: boolean;
  serviceFees?: number;
  feesRequired?: boolean;
  isResubmitMode?: boolean;
  resubmitApplicationId?: number;
  resubmitApplicationNo?: string;
  officerRemark?: string | null;
  prefilledValues?: Record<string, any>;
  existingDocuments?: any[];
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

function serializeFormValue(value: any) {
  if (value === undefined || value === null) return null;
  if (value instanceof File) return value.name;
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : null;
  if (typeof value === "object") return JSON.stringify(value);

  const text = String(value).trim();
  return text === "" ? null : text;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character] || character);
}

function getLocalizedLabelText(label: any, language: string): string {
  if (!label) return "";
  if (typeof label === "string") return label.trim();
  if (typeof label === "object") {
    return (
      label?.[language] ||
      label?.en ||
      label?.hi ||
      label?.mr ||
      Object.values(label).find((value) => typeof value === "string" && value.trim()) ||
      ""
    ) as string;
  }
  return "";
}

export default function DynamicServiceFormClient({
  locale,
  serviceId,
  govtServiceCode,
  departmentId,
  serviceTitle: serviceTitleFromServer,
  initialGroups,
  submitApplicationAction,
  submitState = "form",
  successTrackingId = "",
  successApplicationStatus = "",
  isLoggedIn = false,
  serviceFees,
  feesRequired,
  isResubmitMode = false,
  resubmitApplicationId,
  resubmitApplicationNo,
  officerRemark,
  prefilledValues,
  existingDocuments,
}: ServiceFormProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations("rts.serviceForm");

  const [activeSection, setActiveSection] = useState(0);
  const [darkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);
  const [showSuccessPaymentModal, setShowSuccessPaymentModal] = useState(false);
  const [checkoutAppInfo, setCheckoutAppInfo] = useState<{
    applicationId: number;
    applicationNo: string;
    serviceName: string;
    fees: number;
  } | null>(null);
  const [successReceiptModalData, setSuccessReceiptModalData] = useState<PaymentReceiptResult | null>(null);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingProgrammatically = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [openCheckboxDropdown, setOpenCheckboxDropdown] = useState<Record<string, boolean>>({});

  /**
   * New API rendering logic:
   * API field definitions become old ServiceFormConfig shape.
   */
  const apiItems = useMemo(() => extractRtsFieldDefinitionItems(initialGroups), [initialGroups]);

  const apiConfig = useMemo(
    () => buildOldServiceFormConfigFromRtsFieldDefinitions(serviceId, apiItems),
    [serviceId, apiItems]
  );
  const baseSteps = useMemo(() => apiConfig?.steps || [], [apiConfig]);

  /**
   * Initialize default values from API/defaultValue or prefilledValues in resubmit mode.
   */
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };

      for (const step of baseSteps || []) {
        for (const field of step.fields || []) {
          const key = String(field.id);
          const rawId = field.rawApi?.id ? String(field.rawApi.id) : null;
          const fieldDefId = field.fieldDefinitionId ? String(field.fieldDefinitionId) : null;
          const code = field.rawApi?.fieldCode ? String(field.rawApi.fieldCode) : null;

          if (prefilledValues) {
            const val =
              prefilledValues[key] ??
              (code ? prefilledValues[code] : undefined) ??
              (rawId ? prefilledValues[rawId] : undefined) ??
              (fieldDefId ? prefilledValues[fieldDefId] : undefined);

            if (val !== undefined && val !== null && val !== "") {
              next[key] = val;
              continue;
            }
          }

          if (Object.prototype.hasOwnProperty.call(next, key)) continue;

          if (field.type === "checkbox") {
            const options = Array.isArray(field.options) ? field.options : [];

            if (options.length > 1) {
              if (Array.isArray(field.defaultValue)) {
                next[key] = field.defaultValue.map(String);
              } else if (typeof field.defaultValue === "string" && field.defaultValue.trim()) {
                next[key] = [field.defaultValue];
              } else {
                next[key] = [];
              }
            } else {
              const singleOptionValue = options[0]?.value;
              next[key] =
                field.defaultValue === true ||
                field.defaultValue === "true" ||
                field.defaultValue === "Agree" ||
                field.defaultValue === "Yes" ||
                (singleOptionValue ? field.defaultValue === singleOptionValue : false) ||
                false;
            }
          } else if (field.type === "checkboxDropdown") {
            next[key] = Array.isArray(field.defaultValue) ? field.defaultValue : [];
          } else {
            next[key] = field.defaultValue ?? "";
          }
        }
      }

      return next;
    });
  }, [baseSteps, prefilledValues]);

  const steps = useMemo(() => baseSteps, [baseSteps]);

  // Draft restoration check on mount (skip in resubmit mode)
  useEffect(() => {
    if (isResubmitMode) return;
    try {
      let foundKey: string | null = null;
      let foundData: any = null;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("rtsDraft:") && key.endsWith(`:${serviceId}`)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!foundData || new Date(parsed.savedAt) > new Date(foundData.savedAt)) {
              foundKey = key;
              foundData = parsed;
            }
          }
        }
      }

      if (foundData && foundKey) {
        const formattedDate = new Date(foundData.savedAt).toLocaleString();
        MySwal.fire({
          title: language === "en" ? "Restore Draft?" : language === "hi" ? "ड्राफ्ट पुनर्स्थापित करें?" : "मसुदा पुनर्संचयित करायचा?",
          text: language === "en"
            ? `We found a draft saved on ${formattedDate}. Would you like to restore it?`
            : language === "hi"
              ? `हमें ${formattedDate} पर सहेजा गया एक ड्राफ्ट मिला। क्या आप इसे पुनर्स्थापित करना चाहेंगे?`
              : `आम्हाला ${formattedDate} रोजी जतन केलेला मसुदा सापडला. आपण तो पुनर्संचयित करू इच्छिता?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: language === "en" ? "Yes, Restore" : language === "hi" ? "हाँ, पुनर्स्थापित करें" : "होय, पुनर्संचयित करा",
          cancelButtonText: language === "en" ? "No, Start Fresh" : language === "hi" ? "नहीं, नया शुरू करें" : "नाही, नवीन सुरू करा",
          confirmButtonColor: "#0d9488",
          cancelButtonColor: "#ef4444",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        }).then((result) => {
          if (result.isConfirmed) {
            if (foundData.applicationId) {
              setCurrentApplicationId(foundData.applicationId);
            }
            if (foundData.formData) {
              setFormData((prev) => ({
                ...prev,
                ...foundData.formData,
              }));
            }
            MySwal.fire({
              icon: "success",
              title: language === "en" ? "Restored" : language === "hi" ? "पुनर्स्थापित" : "पुनर्संचयित",
              timer: 1500,
              showConfirmButton: false,
              background: darkMode ? "#1f2937" : "#ffffff",
              color: darkMode ? "#ffffff" : "#000000",
            });
          } else {
            localStorage.removeItem(foundKey!);
          }
        });
      }
    } catch (e) {
      console.error("Error checking draft:", e);
    }
  }, [serviceId, language, darkMode]);

  const shouldRenderField = (field: any) => {
    return isConditionMet(field?.showIf, formData);
  };

  const isDeclarationStep = (step: any) => {
    const id = String(step?.id ?? "").toLowerCase();
    const en = String(step?.title?.en ?? "").toLowerCase();
    return id.includes("declaration") || en.includes("declaration");
  };

  const sections = useMemo(() => {
    const decl = (steps || []).filter((step: any) => isDeclarationStep(step));
    const nonDecl = (steps || []).filter((step: any) => !isDeclarationStep(step));
    const final = [...nonDecl, ...decl];
    return final;
  }, [steps]);

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  const serviceTitle =
    serviceTitleFromServer ||
    steps[0]?.title?.[language] ||
    steps[0]?.title?.en ||
    "Service";

  const isFieldEmpty = (value: any) => value === undefined || value === null || value === "";

  const normalizeRuleList = (rules?: NormalizeRule | NormalizeRule[]) => {
    if (!rules) return [];
    return Array.isArray(rules) ? rules : [rules];
  };

  const applyNormalize = (value: string, rules?: NormalizeRule | NormalizeRule[]) => {
    const normalized = normalizeRuleList(rules);

    return normalized.reduce((next, rule) => {
      if (rule === "trim") return next.trim();
      if (rule === "uppercase") return next.toUpperCase();
      if (rule === "removeSpaces") return next.replace(/\s+/g, "");
      if (rule === "removeCommas") return next.replace(/,/g, "");
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

  const getBaseValidation = (field: FormField | any) => {
    const validation = field?.validation || {};
    const key = field?.validationKey;
    const rule = key ? VALIDATION_RULES[key] : undefined;
    const isMobileField = String(field?.type ?? "").toLowerCase() === "tel";
    const isEmailField = String(field?.type ?? "").toLowerCase() === "email";
    const configuredPattern = validation.pattern ?? field?.pattern ?? rule?.pattern;
    const hasConfiguredPattern = typeof configuredPattern === "string" && configuredPattern.trim().length > 0;

    return {
      pattern: hasConfiguredPattern
        ? configuredPattern
        : isMobileField
          ? DEFAULT_INDIAN_MOBILE_PATTERN
          : isEmailField
            ? DEFAULT_GMAIL_EMAIL_PATTERN
            : undefined,
      minLength: validation.minLength ?? field?.minLength ?? rule?.minLength,
      maxLength: validation.maxLength ?? field?.maxLength ?? rule?.maxLength,
      exactLength: validation.exactLength ?? field?.exactLength ?? rule?.exactLength ?? (isMobileField ? 10 : undefined),
      min: validation.min ?? field?.min ?? rule?.min,
      max: validation.max ?? field?.max ?? rule?.max,
      minDate: validation.minDate,
      maxDate: validation.maxDate,
      minTime: validation.minTime,
      maxTime: validation.maxTime,
      allow: validation.allow ?? field?.allow ?? rule?.allow ?? (isMobileField ? "numeric" : undefined),
      normalize: validation.normalize ?? field?.normalize ?? rule?.normalize,
      customValidate: validation.customValidate ?? field?.customValidate ?? rule?.customValidate,
      inputMode: validation.inputMode ?? field?.inputMode ?? rule?.inputMode ?? (isMobileField ? "numeric" : undefined),
      message: validation.message ?? rule?.message ?? (isMobileField ? "Enter a valid 10-digit mobile number starting with 7, 8, or 9." : undefined),
    };
  };

  const getMergedRules = (field: FormField | any) => {
    const base = getBaseValidation(field);

    return {
      base,
      allow: base.allow,
      inputMode: base.inputMode,
      exactLength: base.exactLength,
      normalize: mergeNormalizeRules(base.normalize),
    };
  };

  const resolveAllowRule = (allow?: string) => {
    if (!allow) return null;

    const key = allow.toLowerCase();
    const flags = allow.includes("\\p{") ? "gu" : "g";

    if (key === "numeric" || key === "digits") return { kind: "chars" as const, regex: /[0-9]/g };
    if (key === "letters") return { kind: "chars" as const, regex: /[\p{L}\p{M}\s]/gu };
    if (key === "decimal") return { kind: "decimal" as const };
    if (key === "alpha") return { kind: "chars" as const, regex: /[\p{L}\p{M}\s.'-]/gu };
    if (key === "alphanumeric") return { kind: "chars" as const, regex: /[A-Za-z0-9]/g };

    try {
      if (allow.includes("^") || allow.includes("$")) {
        const charClass = allow.match(/\[[^\]]+\]/);
        if (charClass) return { kind: "chars" as const, regex: new RegExp(charClass[0], flags) };
        if (allow.includes("\\d")) return { kind: "chars" as const, regex: /[0-9]/g };
        if (allow.toLowerCase().includes("a-z")) return { kind: "chars" as const, regex: /[A-Za-z]/g };
        return null;
      }

      return { kind: "chars" as const, regex: new RegExp(allow, flags) };
    } catch {
      return null;
    }
  };

  const sanitizeInputValue = (rawValue: any, field: FormField | any) => {
    if (typeof rawValue !== "string") return rawValue;

    const { allow, normalize, base, exactLength } = getMergedRules(field);
    let next = rawValue;

    const allowRule = resolveAllowRule(allow);

    if (allowRule?.kind === "decimal") {
      next = next.replace(/[^0-9.]/g, "");
      const firstDot = next.indexOf(".");
      if (firstDot !== -1) {
        next = `${next.slice(0, firstDot + 1)}${next.slice(firstDot + 1).replace(/\./g, "")}`;
      }
    } else if (allowRule?.kind === "chars") {
      const matches = next.match(allowRule.regex);
      next = matches ? matches.join("") : "";
    }

    next = applyNormalize(next, normalize);

    const maxLen = exactLength ?? base.maxLength;
    if (typeof maxLen === "number" && maxLen >= 0 && next.length > maxLen) {
      next = next.slice(0, maxLen);
    }

    return next;
  };

  const runCustomValidate = (custom: CustomValidate | undefined, value: any) => {
    if (!custom) return null;

    const validators = Array.isArray(custom) ? custom : [custom];

    for (const validator of validators) {
      if (typeof validator === "function") {
        const result = validator(value, formData);
        if (typeof result === "string") return result;
        if (result === false) return "Invalid value";
      }
    }

    return null;
  };

  const getFieldLabelText = (field: FormField | any) => {
    const label = field?.label;
    if (!label) return "this field";
    if (typeof label === "string") return label.trim() || "this field";

    return (
      label?.[language] ||
      label?.en ||
      Object.values(label).find((value) => typeof value === "string" && value.trim()) ||
      "this field"
    ) as string;
  };

  const formatAcceptedFileTypes = (formats?: string[]) => {
    if (!Array.isArray(formats) || formats.length === 0) return "file";
    return formats.join(", ");
  };

  const matchesAllowedFileTypes = (file: File, formats?: string[]) => {
    if (!formats?.length) return true;

    const extension = file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase() ?? ""
      : "";

    return formats.some((format) => format.toLowerCase() === extension);
  };

  const getInvalidRuleMessage = (
    field: FormField | any,
    rule:
      | "pattern"
      | "exactLength"
      | "minLength"
      | "maxLength"
      | "min"
      | "max"
      | "minDate"
      | "maxDate"
      | "minTime"
      | "maxTime"
      | "number"
      | "fileType"
      | "fileSize"
  ) => {
    const fieldType = String(field?.type ?? "").toLowerCase();
    const labelText = getFieldLabelText(field);
    const validation = field?.validation ?? {};

    if (typeof validation.message === "string" && validation.message.trim()) {
      return validation.message.trim();
    }

    if (rule === "fileType") {
      return `Please upload your ${formatAcceptedFileTypes(validation.acceptedFormats)}`;
    }

    if (rule === "fileSize" && typeof validation.maxFileSizeMb === "number") {
      return `Please upload a file smaller than ${validation.maxFileSizeMb} MB`;
    }

    if (rule === "number") return "Enter a valid number";
    if (rule === "exactLength" && typeof validation.exactLength === "number") {
      return `Please enter exactly ${validation.exactLength} characters`;
    }
    if (rule === "minLength" && typeof validation.minLength === "number") {
      return `Please enter at least ${validation.minLength} characters`;
    }
    if (rule === "maxLength" && typeof validation.maxLength === "number") {
      return `Please enter no more than ${validation.maxLength} characters`;
    }
    if (rule === "min" && typeof validation.min === "number") {
      return `Minimum value is ${validation.min}`;
    }
    if (rule === "max" && typeof validation.max === "number") {
      return `Maximum value is ${validation.max}`;
    }
    if (rule === "minDate" && validation.minDate) {
      return `Date must be on or after ${validation.minDate}`;
    }
    if (rule === "maxDate" && validation.maxDate) {
      return `Date must be on or before ${validation.maxDate}`;
    }
    if (rule === "minTime" && validation.minTime) {
      return `Time must be at or after ${validation.minTime}`;
    }
    if (rule === "maxTime" && validation.maxTime) {
      return `Time must be at or before ${validation.maxTime}`;
    }

    if (fieldType === "email") return `Please enter a valid ${labelText}`;
    if (fieldType === "tel") return "Please enter a valid Phone No.";
    if (fieldType === "number") return "Please enter a valid Value";
    if (fieldType === "date") return "Please enter a valid Date";
    if (fieldType === "time") return "Please enter a valid time";
    if (fieldType === "datetime-local") return "Please enter a valid date and time";

    return `Please enter a valid ${labelText}`;
  };

  const getEmptyRequiredMessage = (field: FormField | any) => {
    const fieldType = String(field?.type ?? "").toLowerCase();
    const labelText = getFieldLabelText(field);

    if (fieldType === "checkbox") {
      const options = Array.isArray(field?.options) ? field.options : [];
      return options.length > 1
        ? "Please check one or more options to continue"
        : "Please check this to continue";
    }

    if (fieldType === "radio") return "Please select any one of Option";
    if (fieldType === "select") return "Please select an option";
    if (fieldType === "number") return "Please enter a Value";
    if (fieldType === "tel") return "Please enter Phone No.";
    if (fieldType === "time") return "Please enter a time";
    if (fieldType === "date") return "Please enter a Date";
    if (fieldType === "datetime-local") return "Please enter a date and time";
    if (fieldType === "file") {
      const formats = field?.validation?.acceptedFormats;
      return `Please upload your ${formatAcceptedFileTypes(formats)}`;
    }

    return `Please enter ${labelText}`;
  };

  const markTouched = (id: string) => {
    setTouchedFields((prev) => ({ ...prev, [id]: true }));
  };

  const getFieldError = (field: FormField | any) => {
    if (!shouldRenderField(field)) return null;

    const { base } = getMergedRules(field);
    const fieldId = String(field?.id ?? "");
    const value = formData[fieldId];
    const fieldType = String(field?.type ?? "");

    const isCertField =
      fieldId === "certOC" ||
      fieldId === "certCC" ||
      fieldId === "certElectricityBill" ||
      fieldId === "certOther" ||
      fieldId === "existingCertOC" ||
      fieldId === "existingCertCC" ||
      fieldId === "existingCertElectricityBill" ||
      fieldId === "existingCertOther";

    if (isCertField) {
      const isExisting = fieldId.startsWith("existing");
      const oc = formData[isExisting ? "existingCertOC" : "certOC"] === true;
      const cc = formData[isExisting ? "existingCertCC" : "certCC"] === true;
      const eb = formData[isExisting ? "existingCertElectricityBill" : "certElectricityBill"] === true;

      if (fieldId === (isExisting ? "existingCertCC" : "certCC")) {
        if (!oc && !cc) return "CC is required if OC is not available.";
      }

      if (fieldId === (isExisting ? "existingCertElectricityBill" : "certElectricityBill")) {
        if (!oc && eb && !cc) return "CC must be selected if Electricity Bill is selected.";
      }

      return null;
    }

    if (fieldType === "checkbox") {
      const options = Array.isArray(field?.options) ? field.options : [];

      if (options.length > 1) {
        if (field?.required && (!Array.isArray(value) || value.length === 0)) {
          return getEmptyRequiredMessage(field);
        }
        return null;
      }

      if (
        field?.required &&
        value !== true &&
        value !== "Agree" &&
        value !== "Yes" &&
        value !== options[0]?.value
      ) {
        return getEmptyRequiredMessage(field);
      }
      return null;
    }

    if (field?.required && isFieldEmpty(value)) return getEmptyRequiredMessage(field);
    if (isFieldEmpty(value)) return null;

    if (value instanceof File) {
      const acceptedFormats = field?.validation?.acceptedFormats;
      if (!matchesAllowedFileTypes(value, acceptedFormats)) {
        return getInvalidRuleMessage(field, "fileType");
      }

      const maxFileSizeMb = field?.validation?.maxFileSizeMb;
      if (typeof maxFileSizeMb === "number") {
        const maxBytes = maxFileSizeMb * 1024 * 1024;
        if (value.size > maxBytes) {
          return getInvalidRuleMessage(field, "fileSize");
        }
      }
      return null;
    }

    const strValue = Array.isArray(value) ? value.join(",") : String(value);
    const lowerFieldType = fieldType.toLowerCase();

    if (base.pattern) {
      try {
        const regex = base.pattern.includes("\\p{") ? new RegExp(base.pattern, "u") : new RegExp(base.pattern);
        if (!regex.test(strValue)) return getInvalidRuleMessage(field, "pattern");
      } catch {
        // ignore invalid regex
      }
    }

    if ((lowerFieldType === "date" || lowerFieldType === "datetime-local" || lowerFieldType === "month") && base.minDate && strValue < base.minDate) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), minDate: base.minDate },
        },
        "minDate"
      );
    }

    if ((lowerFieldType === "date" || lowerFieldType === "datetime-local" || lowerFieldType === "month") && base.maxDate && strValue > base.maxDate) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), maxDate: base.maxDate },
        },
        "maxDate"
      );
    }

    if (lowerFieldType === "time" && base.minTime && strValue < base.minTime) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), minTime: base.minTime },
        },
        "minTime"
      );
    }

    if (lowerFieldType === "time" && base.maxTime && strValue > base.maxTime) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), maxTime: base.maxTime },
        },
        "maxTime"
      );
    }

    const exactLen = base.exactLength;

    if (typeof exactLen === "number" && strValue.length !== exactLen) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), exactLength: exactLen },
        },
        "exactLength"
      );
    }

    if (typeof base.minLength === "number" && strValue.length < base.minLength) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), minLength: base.minLength },
        },
        "minLength"
      );
    }

    if (typeof base.maxLength === "number" && strValue.length > base.maxLength) {
      return getInvalidRuleMessage(
        {
          ...field,
          validation: { ...(field?.validation ?? {}), maxLength: base.maxLength },
        },
        "maxLength"
      );
    }

    if (typeof base.min === "number" || typeof base.max === "number") {
      const numValue = Number(strValue);

      if (Number.isNaN(numValue)) return getInvalidRuleMessage(field, "number");

      if (typeof base.min === "number" && numValue < base.min) {
        return getInvalidRuleMessage(
          {
            ...field,
            validation: { ...(field?.validation ?? {}), min: base.min },
          },
          "min"
        );
      }

      if (typeof base.max === "number" && numValue > base.max) {
        return getInvalidRuleMessage(
          {
            ...field,
            validation: { ...(field?.validation ?? {}), max: base.max },
          },
          "max"
        );
      }
    }

    const customError = runCustomValidate(base.customValidate, value);
    if (customError) return customError;

    return null;
  };

  const isFieldMissing = (field: any) => !!getFieldError(field);

  const isSectionComplete = (sectionIndex: number) => {
    const section: any = sections[sectionIndex];
    if (!section) return false;

    return section.fields
      .filter((field: any) => shouldRenderField(field))
      .every((field: any) => !isFieldMissing(field));
  };

  const normalizeSelectValue = (value: any) => {
    if (value && typeof value === "object" && !(value instanceof File)) {
      if ("value" in value) return value.value;
      if ("id" in value) return value.id;
    }

    return value;
  };

  const handleInputChange = (id: string, value: any, field?: FormField | any) => {
    setFormData((prev) => {
      const sanitized = field ? sanitizeInputValue(value, field) : value;
      const nextValue = normalizeSelectValue(sanitized);
      return { ...prev, [id]: nextValue };
    });
  };

  useEffect(() => {
    const onDocClick = (event: any) => {
      const element = event.target as HTMLElement;
      if (!element.closest("[data-checkbox-dd]")) {
        setOpenCheckboxDropdown({});
      }
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    const updateActiveSectionFromScroll = () => {
      if (isScrollingProgrammatically.current || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const isAtBottom = container.scrollTop >= maxScrollTop - 1;

      if (isAtBottom) {
        const lastIndex = Math.max(0, sectionRefs.current.length - 1);
        setActiveSection((prev) => (prev === lastIndex ? prev : lastIndex));
        return;
      }

      const scrollPosition = container.scrollTop + 24;
      let newActiveIndex = 0;

      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        if (scrollPosition >= section.offsetTop) {
          newActiveIndex = index;
        }
      });

      setActiveSection((prev) => (prev === newActiveIndex ? prev : newActiveIndex));
    };

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateActiveSectionFromScroll();
      });
    };

    const currentRef = scrollContainerRef.current;

    if (currentRef) currentRef.addEventListener("scroll", handleScroll);
    updateActiveSectionFromScroll();

    return () => {
      if (currentRef) currentRef.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sections.length]);

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    const container = scrollContainerRef.current;

    if (!section || !container) return;

    isScrollingProgrammatically.current = true;
    setActiveSection(index);

    const headerH = headerRef.current?.offsetHeight ?? 180;

    container.scrollTo({
      top: Math.max(0, section.offsetTop - headerH - 16),
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 800);
  };

  const handleBack = () => {
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`);
    }
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

    const missing = required.filter((item) => item.value == null || String(item.value).trim() === "");

    return missing;
  };

  const fieldToGroupIdMap = useMemo(() => {
    const map = new Map<string, number>();
    let fallbackId = 1;

    for (const step of steps || []) {
      for (const field of step.fields || []) {
        const key = String(field.id);

        const backendId =
          Number(field.groupId) ||
          Number(field.fieldDefinitionId) ||
          Number(field.backendFieldId) ||
          fallbackId++;

        if (!map.has(key)) map.set(key, backendId);
      }
    }

    return map;
  }, [steps]);

  const collectFormData = (): SaveDraftValuesRequest => {
    const values: { groupId: number; value: string | null }[] = [];

    for (const step of steps || []) {
      for (const field of step.fields || []) {
        if (!shouldRenderField(field)) continue;
        if (field.type === "label" || field.type === "hidden") continue;

        const key = String(field.id);
        const groupId = fieldToGroupIdMap.get(key);

        if (!groupId) {
          continue;
        }

        values.push({
          groupId,
          value: serializeFormValue(formData[key]),
        });
      }
    }
    return { currentStep: "Step1", values };
  };

  const buildSubmitFormData = () => {
    const submitBundle = new FormData();
    const fileFields: Array<{
      fileKey: string;
      fieldId: string;
      fieldDefinitionId: number;
      fieldName: string;
      fieldLabel: string;
    }> = [];

    for (const step of steps || []) {
      for (const field of step.fields || []) {
        if (!shouldRenderField(field)) continue;
        if (String(field?.type || "").toLowerCase() !== "file") continue;

        const fieldId = String(field?.id ?? "");
        const fileValue = formData[fieldId];

        if (!(fileValue instanceof File) || fileValue.size <= 0) {
          continue;
        }

        const fileKey = `file:${fieldId}`;
        submitBundle.append(fileKey, fileValue, fileValue.name);
        fileFields.push({
          fileKey,
          fieldId,
          fieldDefinitionId: Number(field?.fieldDefinitionId ?? field?.rawApi?.id ?? 0),
          fieldName: String(
            field?.rawApi?.fieldCode ||
              field?.groupFieldId ||
              field?.id ||
              field?.fieldCode ||
              ""
          ),
          fieldLabel: getLocalizedLabelText(field?.label, language),
        });
      }
    }

    submitBundle.append(
      "submitInput",
      JSON.stringify({
        formValues: formData,
        steps,
        departmentId,
        serviceId,
        createdBy: 0,
        applicationStatus: "Submitted",
        fileFields,
      })
    );

    return submitBundle;
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

  const ensureApplicationId = (): number => {
    let applicationId = currentApplicationId;

    if (!applicationId) {
      applicationId = Date.now();
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
          govtServiceCode,
          departmentId,
          payload,
          formData,
          savedAt: new Date().toISOString(),
        })
      );

      MySwal.fire({
        icon: "success",
        title: "Draft Saved",
        text: "Your progress has been saved locally.",
        timer: 2000,
        showConfirmButton: false,
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        customClass: { popup: "rounded-xl shadow-xl" },
      });
    } catch (err: any) {

      const apiErr = parseBackendError(err);

      MySwal.fire({
        icon: "error",
        title: "Error",
        text: apiErr?.message || err?.message || "Failed to save draft",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        customClass: { popup: "rounded-xl shadow-xl" },
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);

    MySwal.fire({
      icon: "success",
      title: "Copied!",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);

    const firstInvalidIndex = sections.findIndex((_, index) => !isSectionComplete(index));

    if (firstInvalidIndex !== -1) {
      scrollToSection(firstInvalidIndex);

      MySwal.fire({
        icon: "error",
        title: language === "en" ? "Incomplete Form" : "अपूर्ण फॉर्म",
        text: language === "en"
          ? "Please fill all required fields highlighted in red."
          : "कृपया लाल रंग में हाइलाइट किए गए सभी आवश्यक फ़ील्ड भरें।",
        confirmButtonColor: "#ef4444",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });

      logRequiredMissing();
      return;
    }

    if (isResubmitMode && resubmitApplicationId) {
      setIsSubmitting(true);
      try {
        const { citizenResubmitApplicationAction, uploadCitizenDocumentAction } = await import(
          "@/app/[locale]/service/dashboard/actions"
        );

        const fieldValuesPayload: any[] = [];
        for (const step of baseSteps || []) {
          for (const field of step.fields || []) {
            const fieldDefId = Number(field.rawApi?.id || field.fieldDefinitionId || field.id);
            if (!fieldDefId || isNaN(fieldDefId)) continue;

            const val = formData[String(field.id)];
            let docGuid: string | null = null;

            if (val instanceof File) {
              const fd = new FormData();
              fd.append("file", val);
              const upRes = await uploadCitizenDocumentAction(fd);
              if (upRes.success && upRes.documentGuid) {
                docGuid = upRes.documentGuid;
              }
            } else if (typeof val === "string" && val.startsWith("guid:")) {
              docGuid = val.replace("guid:", "");
            } else {
              const existDoc = existingDocuments?.find((d) => d.fieldDefinitionId === fieldDefId);
              if (existDoc?.documentGuid) {
                docGuid = existDoc.documentGuid;
              }
            }

            fieldValuesPayload.push({
              fieldDefinitionId: fieldDefId,
              textValue: typeof val === "string" ? val : null,
              numberValue: typeof val === "number" ? val : null,
              dateValue: field.type === "date" && typeof val === "string" ? val : null,
              booleanValue: typeof val === "boolean" ? val : null,
              documentGuid: docGuid,
            });
          }
        }

        const res = await citizenResubmitApplicationAction(
          resubmitApplicationId,
          "Application updated and resubmitted by citizen with corrections.",
          fieldValuesPayload
        );

        if (res.success) {
          await MySwal.fire({
            icon: "success",
            title: language === "en" ? "Application Resubmitted!" : "अर्ज पुन्हा सादर झाला!",
            text: res.message || "आपला अर्ज दुरुस्त करून यशस्वीरित्या पुन्हा सादर करण्यात आला आहे.",
            confirmButtonColor: "#059669",
            background: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          });
          router.replace(`/${locale}/service/dashboard`);
        } else {
          MySwal.fire({
            icon: "error",
            title: language === "en" ? "Resubmit Failed" : "पुन्हा सादर करणे अयशस्वी",
            text: res.message || "Failed to resubmit application.",
            confirmButtonColor: "#ef4444",
            background: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          });
        }
      } catch (err: any) {
        MySwal.fire({
          icon: "error",
          title: language === "en" ? "Error" : "त्रुटी",
          text: err?.message || "An unexpected error occurred.",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = collectFormData();
      const step = payload.currentStep || "Step1";
      const applicationId = ensureApplicationId();
      const submitBundle = buildSubmitFormData();

      if (!submitApplicationAction) {
        throw new Error("submitApplicationAction is missing");
      }

      const response = await submitApplicationAction(submitBundle);

      // Clear draft on successful submit
      if (applicationId) {
        localStorage.removeItem(`rtsDraft:${applicationId}:${serviceId}`);
      }
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("rtsDraft:") && key.endsWith(`:${serviceId}`)) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error(e);
      }

      const newId = response?.items?.applicationNo?.trim();
      const newStatus = response?.items?.applicationStatus?.trim();
      const submissionDate = new Date().toLocaleString();

      const applicantName =
        (formData.applicantFirstName
          ? `${formData.applicantFirstName} ${formData.applicantLastName || ""}`.trim()
          : "") ||
        formData.applicantFullName ||
        formData.firstName ||
        formData.directorName ||
        "Applicant";

      const newApplication = {
        id: newId,
        applicationId,
        serviceName: typeof serviceTitle === "string" ? serviceTitle : "Service",
        applicantName,
        submittedDate: submissionDate,
        currentStage: 1,
        progress: 25,
        status: newStatus,
        userUpicId: "RTS2024001234",
        stages: [
          {
            stage: 1,
            name: "Application Submitted",
            status: "approved",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            remark: "System: Application received successfully.",
          },
          {
            stage: 2,
            name: "Document Verification",
            status: "pending",
            officer: "-",
            date: "-",
            time: "-",
            remark: "Pending review.",
          },
          {
            stage: 3,
            name: "Final Approval",
            status: "pending",
            officer: "-",
            date: "-",
            time: "-",
            remark: "Pending.",
          },
        ],
      };

      const existingData = JSON.parse(localStorage.getItem("rtsApplications") || "{}");
      existingData[newId] = newApplication;
      localStorage.setItem("rtsApplications", JSON.stringify(existingData));

      const rawAppId = Number(response?.items?.id) || parseInt(newId.replace(/\D/g, ""), 10) || 1;
      const appFees = Number(serviceFees) > 0 ? Number(serviceFees) : (feesRequired ? 50 : 0);

      if (appFees > 0) {
        MySwal.fire({
          icon: "success",
          title: language === "en"
            ? "Application Submitted!"
            : language === "hi"
              ? "आवेदन सबमिट हुआ!"
              : "अर्ज यशस्वीरित्या सादर झाला!",
          html: language === "en"
            ? `<div class="space-y-3 p-2 text-center">
                 <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Tracking ID</p>
                 <p class="text-2xl font-mono font-black text-teal-600">${newId}</p>
                 <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 font-semibold">
                   Statutory Government Fee: ₹${appFees}.00
                 </div>
                 <p class="text-xs text-gray-500 font-medium">Please proceed to pay the statutory fee now or pay later from your citizen dashboard.</p>
               </div>`
            : language === "hi"
              ? `<div class="space-y-3 p-2 text-center">
                   <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">आवेदन ट्रैकिंग आईडी</p>
                   <p class="text-2xl font-mono font-black text-teal-600">${newId}</p>
                   <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 font-semibold">
                     शासकीय सेवा शुल्क: ₹${appFees}.00
                   </div>
                   <p class="text-xs text-gray-500 font-medium">कृपया अभी शुल्क का भुगतान करें या बाद में नागरिक डैशबोर्ड से करें।</p>
                 </div>`
              : `<div class="space-y-3 p-2 text-center">
                   <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">अर्ज ट्रॅकिंग आयडी</p>
                   <p class="text-2xl font-mono font-black text-teal-600">${newId}</p>
                   <div class="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 font-semibold">
                     शासकीय सेवा शुल्क: ₹${appFees}.00
                   </div>
                   <p class="text-xs text-gray-500 font-medium">कृपया आताच ऑनलाइन शुल्क भरा किंवा नंतर नागरिक डॅशबोर्डवरून भरा.</p>
                 </div>`,
          showCancelButton: true,
          confirmButtonText: language === "en" ? "💳 Pay Government Fee Now" : language === "hi" ? "💳 अभी शुल्क भरें" : "💳 आताच शुल्क भरा",
          cancelButtonText: language === "en" ? "Pay Later / Go to Dashboard" : language === "hi" ? "बाद में भरें / डैशबोर्ड पर जाएं" : "नंतर भरा / डॅशबोर्डवर जा",
          confirmButtonColor: "#059669",
          cancelButtonColor: "#64748b",
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
          customClass: { popup: "rounded-xl shadow-xl border border-teal-500/20" },
        }).then((swalRes) => {
          if (swalRes.isConfirmed) {
            setCheckoutAppInfo({
              applicationId: rawAppId,
              applicationNo: newId,
              serviceName: typeof serviceTitle === "string" ? serviceTitle : "RTS Service",
              fees: appFees,
            });
            setShowSuccessPaymentModal(true);
          } else {
            if (isLoggedIn) {
              router.replace(`/${locale}/service/dashboard`);
            } else {
              router.replace(`/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`);
            }
          }
        });
      } else {
        MySwal.fire({
          icon: "success",
          title: language === "en"
            ? "Application Submitted!"
            : language === "hi"
              ? "आवेदन सबमिट हुआ!"
              : "अर्ज यशस्वीरित्या सादर झाला!",
          html: `<div class="space-y-3 p-2 text-center">
                   <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Tracking ID</p>
                   <p class="text-2xl font-mono font-black text-teal-600">${newId}</p>
                 </div>`,
          timer: 2500,
          showConfirmButton: false,
          background: darkMode ? "#1f2937" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
          customClass: { popup: "rounded-xl shadow-xl border border-teal-500/20" },
        }).then(() => {
          if (isLoggedIn) {
            router.replace(`/${locale}/service/dashboard`);
          } else {
            router.replace(`/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`);
          }
        });
      }
    } catch (err: any) {
      const apiErr = parseBackendError(err);

      MySwal.fire({
        icon: "error",
        title: language === "en" ? "Submit Failed" : "सबमिट असफल",
        text: apiErr?.message || err?.message || "Failed to submit application",
        confirmButtonColor: "#ef4444",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (isSubmitting) return;

    setHasAttemptedSubmit(true);

    const firstInvalidIndex = sections.findIndex((_, index) => !isSectionComplete(index));

    if (firstInvalidIndex !== -1) {
      scrollToSection(firstInvalidIndex);

      MySwal.fire({
        icon: "error",
        title: language === "en" ? "Incomplete Form" : "अपूर्ण फॉर्म",
        text:
          language === "en"
            ? "Please fill all required fields highlighted in red."
            : "कृपया लाल रंग में हाइलाइट किए गए सभी आवश्यक फ़ील्ड भरें।",
        confirmButtonColor: "#ef4444",
        background: darkMode ? "#1f2937" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });

      logRequiredMissing();
      return;
    }

    const applicantContact = resolveApplicantContact(formData, steps);
    if (applicantContact.missing.length) {
      const missingLabels = applicantContact.missing
        .map((field) => field === 'applicantName' ? 'applicant name' : 'mobile number')
        .join(' and ');

      MySwal.fire({
        icon: 'error',
        title: language === 'en' ? 'Applicant details required' : 'आवेदक विवरण आवश्यक है',
        text:
          language === 'en'
            ? `The configured form must include a filled ${missingLabels} field before submission.`
            : `सबमिट करने से पहले ${missingLabels} फ़ील्ड भरना आवश्यक है।`,
        confirmButtonColor: '#ef4444',
        background: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      });
      return;
    }

    const confirmation = await MySwal.fire({
      icon: "question",
      title: t("confirmation.title"),
      html: `<strong>${escapeHtml(t("confirmation.serviceName"))}: ${escapeHtml(serviceTitle)}</strong><br><br>${escapeHtml(t("confirmation.description"))}`,
      showCancelButton: true,
      confirmButtonText: t("confirmation.confirm"),
      cancelButtonText: t("confirmation.cancel"),
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      background: darkMode ? "#1f2937" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000",
    });

    if (confirmation.isConfirmed) {
      await handleSubmit();
    }
  };

  const getServiceIcon = (title: string) => {
    if (title.includes("Applicant")) return User;
    if (title.includes("Address")) return MapPin;
    if (title.includes("Document")) return FileText;
    if (title.includes("Property")) return Home;
    if (title.includes("Business")) return Briefcase;
    return Info;
  };

  const getStepIcon = (step: any): LucideIcon =>
    step?.icon && iconMap[step.icon] ? iconMap[step.icon] : getServiceIcon(step?.title?.en || "");

  if (submitState === "success") {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
      >
        <div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"
            }`}
        >
          <div className="pt-12 pb-12 px-8 text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {language === "en"
                  ? "Application Submitted Successfully!"
                  : language === "hi"
                    ? "आवेदन सफलतापूर्वक जमा हुआ!"
                    : "अर्ज यशस्वीरित्या सबमिट झाला!"}
              </h2>

              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {language === "en"
                  ? "Your application has been received and is under review."
                  : language === "hi"
                    ? "आपका आवेदन प्राप्त हुआ है और समीक्षाधीन है।"
                    : "तुमचा अर्ज प्राप्त झाला आहे आणि तपासणीत आहे."}
              </p>
            </div>

            <div
              className={`p-6 rounded-xl border-2 border-dashed ${darkMode ? "bg-gray-700/50 border-teal-500/50" : "bg-teal-50 border-teal-200"
                }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className={`w-4 h-4 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
                  <span
                    className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    {language === "en" ? "Application Tracking ID" : "ट्रैकिंग आईडी"}
                  </span>
                </div>

                <div
                  className={`text-4xl font-mono font-bold tracking-wider ${darkMode ? "text-teal-400" : "text-teal-600"
                    }`}
                >
                  {successTrackingId}
                </div>

                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {language === "en" ? "Save this ID to track status" : "स्थिति ट्रैक करने के लिए सहेजें"}
                </p>
                {successApplicationStatus ? (
                  <p className={`text-sm font-semibold ${darkMode ? "text-teal-300" : "text-teal-700"}`}>
                    {successApplicationStatus}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                onClick={() => setShowSuccessPaymentModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg py-3 font-bold cursor-pointer"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {language === "en" ? "Pay Government Fee Now" : language === "hi" ? "शासकीय शुल्क अभी भरें" : "आताच शासकीय शुल्क भरा"}
              </Button>

              <Button
                onClick={() => copyToClipboard(successTrackingId)}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-lg py-3 cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === "en" ? "Copy Tracking ID" : "आईडी कॉपी करें"}
              </Button>

              <Button
                onClick={() => router.push(isLoggedIn ? `/${locale}/service/dashboard` : `/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`)}
                variant="outline"
                className={`${darkMode
                  ? "border-gray-600 hover:bg-gray-700 text-white"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  } py-3 cursor-pointer`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "en" ? "Back to Services" : language === "hi" ? "वापस जाएं" : "सेवांकडे परत जा"}
              </Button>
            </div>

            <div
              className={`flex items-start gap-3 p-4 rounded-lg text-left ${darkMode ? "bg-blue-900/20" : "bg-blue-50"
                }`}
            >
              <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                {language === "en"
                  ? "You will receive SMS and email notifications regarding your application status. The processing will be completed within 15 working days."
                  : "आपको अपने आवेदन की स्थिति के बारे में एसएमएस और ईमेल सूचनाएं प्राप्त होंगी।"}
              </p>
            </div>
          </div>
        </div>

        {showSuccessPaymentModal && (
          <PaymentCheckoutModal
            applicationId={parseInt(successTrackingId.replace(/\D/g, ""), 10) || 1}
            applicationNo={successTrackingId}
            serviceName={serviceTitle}
            fees={50}
            onClose={() => setShowSuccessPaymentModal(false)}
            onSuccess={(receipt) => {
              setSuccessReceiptModalData(receipt);
            }}
          />
        )}

        {successReceiptModalData && (
          <PaymentReceiptModal
            receipt={successReceiptModalData}
            onClose={() => setSuccessReceiptModalData(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col w-full mt-16 sm:mt-20 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div
        ref={headerRef}
        className={`flex-shrink-0 w-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border-b shadow-md z-10`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={handleBack}
                className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${darkMode
                  ? "border-gray-600 hover:bg-gray-700 text-white"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700 bg-white"
                  }`}
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {language === "en" ? "Back" : language === "hi" ? "पीछे" : "मागे"}
                </span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 w-full max-w-xl">
                  <div className={`h-px flex-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                  <h1
                    className={`text-sm sm:text-lg font-semibold whitespace-nowrap ${darkMode ? "text-white" : "text-gray-800"
                      }`}
                  >
                    {serviceTitle}
                  </h1>
                  <div className={`h-px flex-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
                </div>
              </div>

              <div className="md:hidden mt-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {sections.map((section: any, index: number) => {
                    const isActive = index === activeSection;
                    const isComplete = isSectionComplete(index);
                    const isErr = hasAttemptedSubmit && !isComplete;

                    return (
                      <button
                        key={`${section.id}-${index}`}
                        onClick={() => scrollToSection(index)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${isActive
                            ? "bg-teal-600 text-white border-teal-600"
                            : isErr
                              ? "bg-red-50 text-red-700 border-red-300"
                              : darkMode
                                ? "bg-gray-700 text-gray-100 border-gray-600"
                                : "bg-white text-gray-700 border-gray-200"
                          }`}
                      >
                        {section.title?.[language] || section.title?.en}
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

      <div className="flex flex-1 overflow-hidden w-full">
        <aside
          className={`w-48 lg:w-56 xl:w-64 flex-shrink-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } border-r p-3 lg:p-4 overflow-y-auto hidden md:block`}
        >
          <h3
            className={`text-[10px] lg:text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            {language === "en" ? "Form Sections" : language === "hi" ? "फॉर्म अनुभाग" : "फॉर्म विभाग"}
          </h3>

          <nav className="space-y-1 lg:space-y-1.5">
            {sections.map((step: any, index: number) => {
              const isActive = index === activeSection;
              const Icon = getStepIcon(step);
              const isComplete = isSectionComplete(index);
              const isErr = hasAttemptedSubmit && !isComplete;

              return (
                <button
                  key={step.id || index}
                  onClick={() => scrollToSection(index)}
                  className={`w-full flex items-center gap-2 lg:gap-2.5 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all ${isActive
                    ? darkMode
                      ? "bg-teal-900/30 text-teal-400 border-l-4 border-teal-500"
                      : "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                    : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isErr
                      ? "bg-red-500 text-white"
                      : isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                          ? darkMode
                            ? "bg-teal-500/20 text-teal-400"
                            : "bg-teal-100 text-teal-600"
                          : darkMode
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-100 text-gray-500"
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
                      className={`text-[10px] lg:text-xs font-medium truncate ${isActive ? "font-bold" : ""
                        } ${isErr ? "text-red-500" : ""}`}
                    >
                      {step.title?.[language] || step.title?.en}
                    </div>

                    <div className={`text-[9px] lg:text-[10px] ${isErr ? "text-red-500" : "text-gray-500"}`}>
                      {isErr ? "Pending Action" : language === "en" ? "Section" : "खंड"} {index + 1}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4" ref={scrollContainerRef}>
          {isResubmitMode && (
            <div className="mb-3 sm:mb-4 rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm mt-0.5">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wide text-orange-950">
                      {language === "en" ? "Officer Remark / Reason for Correction:" : "अधिकाऱ्याचा शेरा / दुरुस्तीचे कारण:"}
                    </h3>
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-200/80 px-2 py-0.5 rounded-full">
                      {language === "en" ? "Action Required" : "तातडीने पूर्तता आवश्यक"}
                    </span>
                  </div>
                  {officerRemark && (
                    <div className="rounded-xl border border-orange-200 bg-white/95 p-3 text-xs text-orange-950 font-bold shadow-xs">
                      “{officerRemark}”
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-orange-900 leading-relaxed">
                    {language === "en"
                      ? "Please correct the required details or re-upload the documents as instructed above, then click 'Update & Resubmit Application'."
                      : "कृपया वरील सूचनेनुसार आवश्यक त्या फील्ड्समध्ये दुरुस्ती करा किंवा कागदपत्रे पुन्हा अपलोड करून खालील 'दुरुस्ती करून पुन्हा सादर करा' बटणावर क्लिक करा."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {sections.map((section: any, index: number) => {
            if (!isConditionMet(section.showIf, formData)) {
              return null;
            }

            const step = section;

            return (
              <section
                key={step.id || index}
                ref={(element) => {
                  sectionRefs.current[index] = element;
                }}
                className={`mb-2 sm:mb-3 rounded-lg ${darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200 shadow-sm"
                  } p-3 sm:p-4`}
              >
                <div className={`pb-2 mb-2 border-b ${darkMode ? "border-teal-500" : "border-teal-100"}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 rounded-md ${darkMode ? "bg-teal-900/30" : "bg-teal-50"}`}>
                      {(() => {
                        const Icon = getStepIcon(step);
                        return (
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? "text-teal-400" : "text-teal-600"}`} />
                        );
                      })()}
                    </div>

                    <div>
                      <h2 className={`text-sm sm:text-base font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        {step.title[language]}
                      </h2>

                      {step.description && (
                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {step.description[language]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {(step.fields || []).map((field: any, fieldIndex: number) => {
                    if (!shouldRenderField(field)) return null;

                    const fieldId = String(field?.id ?? "");
                    const fieldError = getFieldError(field);
                    const showError = !!fieldError && hasAttemptedSubmit;
                    return (
                      <DynamicFieldRenderer
                        key={`${step.id}-${fieldId}-${fieldIndex}`}
                        field={field}
                        stepId={step.id}
                        fieldIndex={fieldIndex}
                        lang={language}
                        values={formData}
                        darkMode={darkMode}
                        stepDisabled={false}
                        error={fieldError}
                        showError={showError}
                        serviceId={serviceId}
                        openCheckboxDropdown={openCheckboxDropdown}
                        setOpenCheckboxDropdown={setOpenCheckboxDropdown}
                        onChange={handleInputChange}
                        markTouched={markTouched}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      <div
        className={`flex-shrink-0 w-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border-t shadow-2xl`}
      >
        <div className="w-full px-4 sm:px-6 py-2">
          <div className="flex flex-row justify-end items-center gap-2 sm:gap-3">
            <button
              onClick={handleSaveProgress}
              className={`flex items-center justify-center px-3 sm:px-5 py-1.5 rounded-md border font-medium text-xs transition-all
                ${darkMode
                  ? "border-teal-500 text-teal-400 hover:bg-teal-900/20"
                  : "border-teal-500 text-teal-700 hover:bg-teal-50"
                }`}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {language === "en" ? "Save Draft" : "सहेजें"}
            </button>

            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
              className={`flex items-center justify-center px-4 sm:px-6 py-1.5 rounded-md ${
                isResubmitMode
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              } text-white shadow font-medium text-xs transition-all
                ${isSubmitting
                  ? "opacity-70 cursor-not-allowed pointer-events-none"
                  : ""
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isResubmitMode
                    ? language === "en"
                      ? "Resubmitting..."
                      : "सादर होत आहे..."
                    : "Submitting..."}
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span>
                    {isResubmitMode
                      ? language === "en"
                        ? "Update & Resubmit Application"
                        : "दुरुस्ती करून पुन्हा सादर करा"
                      : language === "en"
                      ? "Submit Application"
                      : "जमा करें"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showSuccessPaymentModal && checkoutAppInfo && (
        <PaymentCheckoutModal
          applicationId={checkoutAppInfo.applicationId}
          applicationNo={checkoutAppInfo.applicationNo}
          serviceName={checkoutAppInfo.serviceName}
          fees={checkoutAppInfo.fees}
          onClose={() => {
            setShowSuccessPaymentModal(false);
            if (isLoggedIn) {
              router.replace(`/${locale}/service/dashboard`);
            } else {
              router.replace(`/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`);
            }
          }}
          onSuccess={(receipt) => {
            setShowSuccessPaymentModal(false);
            setSuccessReceiptModalData(receipt);
          }}
        />
      )}

      {successReceiptModalData && (
        <PaymentReceiptModal
          receipt={successReceiptModalData}
          onClose={() => {
            setSuccessReceiptModalData(null);
            if (isLoggedIn) {
              router.replace(`/${locale}/service/dashboard`);
            } else {
              router.replace(`/${locale}/service${departmentId ? `?deptId=${departmentId}` : ""}`);
            }
          }}
        />
      )}
    </div>
  );
}
