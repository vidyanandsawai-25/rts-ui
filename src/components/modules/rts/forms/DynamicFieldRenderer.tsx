"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FileText, Upload, X } from "lucide-react";
import type {
  CheckboxField,
  FieldConfig,
  LangLabel,
  LocationPickerField,
  NormalizeRule,
  PickedLocation,
  SelectField,
  TextField,
} from "@/types/rts/form.types";

// Re-import corrected path for VALIDATION_RULES if needed (it was @/lib/utils/validationRegistry)
import { VALIDATION_RULES as REGISTRY_RULES } from "@/lib/utils/validationRegistry";

const LocationPicker = dynamic(() => import("@/components/common/LocationPicker"), {
  ssr: false,
});

const DEFAULT_INDIAN_MOBILE_PATTERN = "^[7-9][0-9]{9}$";
const DEFAULT_GMAIL_EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@gmail\\.com$";

function t(label: LangLabel | undefined, lang: "en" | "hi" | "mr") {
  if (!label) return "";
  return (label as any)?.[lang] ?? (label as any)?.en ?? "";
}

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

const mergeNormalizeRules = (baseRules?: NormalizeRule | NormalizeRule[], derivedRules?: NormalizeRule[]) => {
  const merged = [...normalizeRuleList(baseRules), ...(derivedRules ?? [])];
  return merged.length ? merged : undefined;
};

const resolveAllowRule = (allow?: string) => {
  if (!allow) return null;
  const key = allow.toLowerCase();
  const flags = allow.includes("\\p{") ? "gu" : "g";
  if (key === "numeric" || key === "digits") {
    return { kind: "chars" as const, regex: /[0-9]/g };
  }
  if (key === "letters") {
    return { kind: "chars" as const, regex: /[\p{L}\p{M}\s]/gu };
  }
  if (key === "decimal") {
    return { kind: "decimal" as const };
  }
  if (key === "alpha") {
    return { kind: "chars" as const, regex: /[\p{L}\p{M}\s.'-]/gu };
  }
  if (key === "alphanumeric") {
    return { kind: "chars" as const, regex: /[A-Za-z0-9]/g };
  }
  try {
    if (allow.includes("^") || allow.includes("$")) {
      const charClass = allow.match(/\[[^\]]+\]/);
      if (charClass) return { kind: "chars" as const, regex: new RegExp(charClass[0], flags) };
      if (allow.includes("\\d")) return { kind: "chars" as const, regex: /[0-9]/g };
      if (allow.toLowerCase().includes("a-z")) {
        return { kind: "chars" as const, regex: /[A-Za-z]/g };
      }
      return null;
    }
    const regex = new RegExp(allow, flags);
    return { kind: "chars" as const, regex };
  } catch {
    return null;
  }
};

const getFieldRules = (field: FieldConfig) => {
  const validation = (field as any).validation || {};
  const key = (field as any).validationKey;
  const rule = key ? REGISTRY_RULES[key] : undefined;
  const isMobileField = field.type === "tel";
  const isEmailField = field.type === "email";
  const configuredPattern = validation.pattern ?? field.pattern ?? rule?.pattern;
  const hasConfiguredPattern = typeof configuredPattern === "string" && configuredPattern.trim().length > 0;
  const normalize = mergeNormalizeRules(
    validation.normalize ?? (field as any).normalize ?? rule?.normalize
  );
  const allow = validation.allow ?? (field as any).allow ?? rule?.allow ?? (isMobileField ? "numeric" : undefined);
  const inputMode =
    validation.inputMode ?? (field as any).inputMode ?? rule?.inputMode ?? (isMobileField ? "numeric" : undefined);
  const exactLength =
    validation.exactLength ??
    (field as any).exactLength ??
    rule?.exactLength ??
    (isMobileField ? 10 : undefined);
  const maxLength =
    exactLength ??
    validation.maxLength ??
    (field as any).exactLength ??
    (field as any).maxLength ??
    rule?.exactLength ??
    rule?.maxLength;
  const min =
    validation.min ??
    (field as any).min ??
    rule?.min;
  const max =
    validation.max ??
    (field as any).max ??
    rule?.max;
  const minDate = validation.minDate;
  const maxDate = validation.maxDate;
  const minTime = validation.minTime;
  const maxTime = validation.maxTime;
  const accept = validation.accept;

  return {
    inputMode,
    allow,
    normalize,
    pattern: hasConfiguredPattern
      ? configuredPattern
      : isMobileField
        ? DEFAULT_INDIAN_MOBILE_PATTERN
        : isEmailField
          ? DEFAULT_GMAIL_EMAIL_PATTERN
          : undefined,
    maxLength,
    min,
    max,
    minDate,
    maxDate,
    minTime,
    maxTime,
    accept,
  };
};

const sanitizeValue = (rawValue: string, field: FieldConfig) => {
  const { allow, normalize, maxLength } = getFieldRules(field);
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

  if (typeof maxLength === "number" && maxLength >= 0 && next.length > maxLength) {
    next = next.slice(0, maxLength);
  }

  return next;
};

// Same mapping as in the big form (so behavior matches everywhere)
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
  1: "col-span-1",
  2: "col-span-1 sm:col-span-2 lg:col-span-2",
  3: "col-span-1 sm:col-span-2 lg:col-span-3",
  4: "col-span-1 sm:col-span-2 lg:col-span-4",
};

function computeProofStatus(oc: boolean, cc: boolean, eb: boolean) {
  if (oc) return "Strong / Legal";
  if (cc && eb) return "Legal";
  if (cc) return "Partially Legal";
  return "Weak";
}

function getChoiceOptions(field: any): Array<{ value: string; label: LangLabel }> {
  const fType = field.type;
  if (fType !== "radio" && fType !== "checkbox") return [];
  const options = field.options;
  return Array.isArray(options) ? options : [];
}

function getCheckboxSpan(optionsCount: number): 1 | 2 | 3 | 4 {
  if (optionsCount === 0) return 4;
  if (optionsCount <= 2) return 1;
  if (optionsCount <= 6) return 2;
  if (optionsCount <= 10) return 3;
  return 4;
}

function getControlClass(hasError: boolean, extraClass = "") {
  return [
    "w-full rounded-[4px] border bg-white px-3 text-[14px] text-slate-900 outline-none transition-colors",
    "placeholder:text-slate-400",
    hasError
      ? "border-2 border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200"
      : "border-slate-300 focus:border-[#22cfc3] focus:ring-1 focus:ring-[#bff5ef]",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");
}

const FIELD_ERROR_CLASS = "mt-1 text-[10px] font-medium text-red-500";
const getLabelColorClass = (hasError: boolean) => (hasError ? "text-red-500" : "text-slate-800");

export default function DynamicFieldRenderer(props: {
  field: any;
  lang: "en" | "hi" | "mr";
  values: Record<string, any>;
  setValue?: (id: string, value: any, field?: any) => void;
  onChange?: (id: string, value: any, field?: any) => void;
  error?: string;
  showError?: boolean;
}) {
  const { field, lang, values, setValue, onChange, error, showError } = props;
  const updateValue: (id: string, value: any, field?: any) => void =
    setValue ??
    onChange ??
    ((_: string, __: any) => {
      throw new Error("DynamicFieldRenderer requires setValue or onChange");
    });

  const choiceOptions = getChoiceOptions(field);
  const hasError = Boolean(showError && error);
  const rawFieldType = String((field as any)?.type ?? "").toLowerCase();
  const rawInputMode = String((field as any)?.inputMode ?? "").toLowerCase();
  const shouldUseCompactSingleSpan =
    field.type === "text" ||
    field.type === "email" ||
    field.type === "number" ||
    field.type === "tel" ||
    field.type === "select" ||
    field.type === "textarea" ||
    field.type === "file" ||
    field.type === "date" ||
    rawFieldType === "time" ||
    rawFieldType === "datetime-local" ||
    rawFieldType === "month" ||
    rawFieldType === "url" ||
    rawInputMode === "url";
  const span =
    field.type === "checkbox"
      ? getCheckboxSpan(choiceOptions.length)
      : field.type === "radio" && choiceOptions.length > 0
        ? choiceOptions.length > 4
          ? 2
          : 1
        : shouldUseCompactSingleSpan
          ? 1
          : toSpan4((field as any).colSpan);
  const wrapClass = SPAN_CLASS[span];
  const placeholderValue = (field as any)?.placeholder;
  const placeholderText =
    typeof placeholderValue === "string" ? placeholderValue : t(placeholderValue as any, lang);
  const requiredIndicator = (field as any)?.required ? (
    <span className="text-red-500 text-[13px]">*</span>
  ) : null;

  // ---------------------------
  // ✅ Location Picker
  // ---------------------------
  if (field.type === "locationPicker") {
    const f = field as LocationPickerField;
    return (
      <div className={wrapClass}>
        <div className={`mb-2 flex min-w-0 items-start gap-1 text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
          <span className="min-w-0 whitespace-normal break-words">{t(f.label, lang)}</span>
          {requiredIndicator}
        </div>
        <LocationPicker
          value={(values[f.id] as PickedLocation) ?? null}
          onChange={(v: PickedLocation | null) => updateValue(f.id, v, f)}
          persistKey={f.persistKey}
          placeholder={(() => {
            if (!f.placeholder) return undefined;
            if (typeof (f as any).placeholder === "string") return (f as any).placeholder;
            return t(f.placeholder as any, lang);
          })()}
          lang={lang}
        />
        {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
      </div>
    );
  }

  // ---------------------------
  // ✅ SELECT
  // ---------------------------
  if (field.type === "select") {
    const f = field as SelectField;

    // ✅ SPECIAL: occupancyCertDateType => dropdown with checkboxes INSIDE list
    if (f.id === "occupancyCertDateType") {
      const [open, setOpen] = React.useState(false);
      const rootRef = React.useRef<HTMLDivElement | null>(null);

      React.useEffect(() => {
        const onDown = (e: MouseEvent) => {
          if (!rootRef.current) return;
          if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
      }, []);

      const oc = values["certOC"] === true;
      const cc = values["certCC"] === true;
      const eb = values["certElectricityBill"] === true;
      const other = values["certOther"] === true;

      const placeholder = lang === "hi" ? "चयन करें" : lang === "mr" ? "निवडा" : "Select";

      // Show current selection text in the button
      const currentText =
        oc ? "OC Date" : eb ? "Electricity Bill Date" : cc ? "CC Date" : other ? "Other" : placeholder;

      const setAll = (nextOC: boolean, nextCC: boolean, nextEB: boolean, nextOther: boolean) => {
        updateValue("certOC", nextOC, f);
        updateValue("certCC", nextCC, f);
        updateValue("certElectricityBill", nextEB, f);
        updateValue("certOther", nextOther, f);

        // keep dropdown field value in sync (optional, but good for backend)
        const typeVal = nextOC
          ? "OC Date"
          : nextEB
          ? "Electricity Bill Date"
          : nextCC
          ? "CC Date"
          : nextOther
          ? "Other"
          : "";

        updateValue("occupancyCertDateType", typeVal, f);

        // update status
        updateValue("propertyProofStatus", computeProofStatus(nextOC, nextCC, nextEB), f);
      };

      const onToggle = (type: "OC Date" | "CC Date" | "Electricity Bill Date" | "Other") => {
        if (type === "OC Date") {
          const next = !oc;
          if (next) {
            // OC checked => uncheck all others
            setAll(true, false, false, false);
          } else {
            setAll(false, cc, eb, other);
          }
          return;
        }

        // if OC already checked => block others (as per rule)
        if (oc) return;

        if (type === "CC Date") {
          const next = !cc;
          setAll(false, next, eb, other);
          return;
        }

        if (type === "Electricity Bill Date") {
          const next = !eb;

          // If Electricity checked (and OC not checked) => auto-check CC (rule)
          if (next) {
            setAll(false, true, true, other);
          } else {
            setAll(false, cc, false, other);
          }
          return;
        }

        if (type === "Other") {
          const next = !other;
          setAll(false, cc, eb, next);
          return;
        }
      };

      const disabledOtherOptions = oc; // OC locks all others

      const item = (
        label: string,
        checked: boolean,
        disabled: boolean,
        onClick: () => void
      ) => (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left ${
            disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="h-4 w-4"
          />
          <span className="truncate">{label}</span>
        </button>
      );

      return (
        <div className={wrapClass} ref={rootRef}>
          <label className={`mb-1 block text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
            <span className="inline-flex items-center gap-1">
              <span>{t(f.label, lang)}</span>
              {requiredIndicator}
            </span>
          </label>

          <button
            type="button"
            className={getControlClass(hasError, "flex h-[40px] items-center justify-between py-2")}
            onClick={() => setOpen((p) => !p)}
          >
            <span className="truncate">{currentText}</span>
            <span>▾</span>
          </button>

          {open && (
            <div className="relative">
              <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg p-2">
                {item("OC Date", oc, false, () => onToggle("OC Date"))}
                {item("CC Date", cc, disabledOtherOptions, () => onToggle("CC Date"))}
                {item(
                  "Electricity Bill Date",
                  eb,
                  disabledOtherOptions,
                  () => onToggle("Electricity Bill Date")
                )}
                {item("Other", other, disabledOtherOptions, () => onToggle("Other"))}
              </div>
            </div>
          )}
          {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
        </div>
      );
    }

    // ✅ Normal select for all other fields
    return (
      <div className={wrapClass}>
        <label className={`mb-1 block text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
          <span className="inline-flex items-center gap-1">
            <span>{t(f.label, lang)}</span>
            {requiredIndicator}
          </span>
        </label>
        <select
          className={getControlClass(hasError, "h-[40px] py-2")}
          value={values[f.id] ?? ""}
          onChange={(e) => updateValue(f.id, sanitizeValue(e.target.value, f), f)}
        >
          <option value="">{lang === "hi" ? "चयन करें" : lang === "mr" ? "निवडा" : "Select"}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label, lang)}
            </option>
          ))}
        </select>
        {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
      </div>
    );
  }

  if (field.type === "radio") {
    const f = field as any;

    return (
      <div className={wrapClass}>
        <label className={`mb-1 block text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
          <span className="inline-flex items-center gap-1">
            <span>{t(f.label, lang)}</span>
            {requiredIndicator}
          </span>
        </label>
        <div className={getControlClass(hasError, "flex min-h-[40px] flex-wrap gap-x-5 gap-y-2 py-2")}>
          {f.options.map((option: any) => {
            const checked = values[f.id] === option.value;
            return (
              <label key={option.value} className="inline-flex items-center gap-2 text-[14px] text-slate-700">
                <input
                  type="radio"
                  name={f.id}
                  value={option.value}
                  checked={checked}
                  onChange={() => updateValue(f.id, option.value, f)}
                  className="h-4 w-4"
                />
                <span>{t(option.label, lang)}</span>
              </label>
            );
          })}
        </div>
        {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
      </div>
    );
  }

  if (field.type === "checkbox") {
    const f = field as CheckboxField;
    const options = choiceOptions;

    if (options.length === 0) {
      const checked =
        values[f.id] === true ||
        values[f.id] === "true" ||
        values[f.id] === "Yes" ||
        values[f.id] === "Agree";

      return (
        <div className={wrapClass}>
          <label
            className={getControlClass(
              hasError,
              "inline-flex min-h-[40px] items-start gap-3 rounded-[12px] py-3 text-[14px] text-slate-700"
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => updateValue(f.id, e.target.checked, f)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span className="min-w-0 whitespace-normal break-words">
              {t(f.label, lang)}
              {requiredIndicator ? <span className="ml-1 inline text-red-500">*</span> : null}
            </span>
          </label>
          {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
        </div>
      );
    }

    if (options.length > 1) {
      const selected = Array.isArray(values[f.id]) ? values[f.id].map(String) : [];

      const toggleOption = (optionValue: string) => {
        const next = selected.includes(optionValue)
          ? selected.filter((value: string) => value !== optionValue)
          : [...selected, optionValue];
        updateValue(f.id, next, f);
      };

      return (
        <div className={wrapClass}>
          <label className={`mb-1 block text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
            <span className="inline-flex items-center gap-1">
              <span>{t(f.label, lang)}</span>
              {requiredIndicator}
            </span>
          </label>
          <div className={getControlClass(hasError, "flex min-h-[40px] flex-wrap gap-x-5 gap-y-2 py-2")}>
            {options.map((option) => (
              <label key={option.value} className="inline-flex items-center gap-2 text-[14px] text-slate-700">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4"
                />
                <span>{t(option.label, lang)}</span>
              </label>
            ))}
          </div>
          {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
        </div>
      );
    }

    const singleOption = options[0];
    const checked =
      values[f.id] === true ||
      values[f.id] === "true" ||
      values[f.id] === "Yes" ||
      values[f.id] === "Agree" ||
      (singleOption ? values[f.id] === singleOption.value : false);

    return (
      <div className={wrapClass}>
        <label className={`mb-1 block text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
          <span className="inline-flex items-center gap-1">
            <span>{t(f.label, lang)}</span>
            {requiredIndicator}
          </span>
        </label>
        <label className={getControlClass(hasError, "inline-flex min-h-[40px] items-center gap-2 py-2 text-[14px] text-slate-700")}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => updateValue(f.id, e.target.checked, f)}
            className="h-4 w-4"
          />
          <span>{singleOption ? t(singleOption.label, lang) : t(f.label, lang)}</span>
        </label>
        {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
      </div>
    );
  }

  if (field.type === "file") {
    const f = field as any;
    const currentValue = values[f.id];
    const isUploaded = currentValue instanceof File || (typeof currentValue === "string" && currentValue.trim() !== "");
    const selectedFileName =
      currentValue instanceof File
        ? currentValue.name
        : typeof currentValue === "string"
          ? currentValue
          : "";
    const fileHint = selectedFileName || placeholderText || "Upload required document";

    return (
      <div className={`${wrapClass} h-full`}>
        <label
          htmlFor={`file-input-${f.id}`}
          className={`group flex h-full min-h-[72px] cursor-pointer items-center gap-3 rounded-[8px] border bg-[#f9fafb] px-3 py-2 transition-colors ${
            hasError
              ? "border-red-400 bg-red-50/40"
              : isUploaded
                ? "border-[#27d3cf] bg-[#f8fffe]"
                : "border-[#d8e1ec] hover:border-[#27d3cf]"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border transition-colors ${
              hasError
                ? "border-red-200 bg-white text-red-500"
                : isUploaded
                  ? "border-[#b9f0ec] bg-[#efffff] text-[#10b981]"
                  : "border-[#dfe6ef] bg-[#f8fbff] text-[#98a7ba] group-hover:border-[#b9f0ec] group-hover:bg-[#efffff] group-hover:text-[#11b8b2]"
            }`}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className={`flex items-start gap-1 text-[12px] font-semibold ${hasError ? "text-red-500" : "text-[#1d3557]"}`}>
              <span className="min-w-0 whitespace-normal break-words leading-4">{t(f.label, lang)}</span>
              {requiredIndicator}
            </div>
            <p className="whitespace-normal break-words text-[11px] leading-4 text-[#93a4b8]">{fileHint}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-[6px] border border-[#8be9e2] bg-[#efffff] px-3 py-1 text-[11px] font-semibold text-[#11b8b2] transition-colors group-hover:border-[#63e1d7] group-hover:bg-[#e6fffd]">
              <span className="inline-flex items-center justify-center gap-1">
                <Upload className="h-3.5 w-3.5" />
                {selectedFileName ? "Change" : "Upload"}
              </span>
            </div>
            {isUploaded ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateValue(f.id, null, f);
                }}
                className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[6px] border border-[#fecaca] bg-[#fff1f2] text-[#ef4444] transition-colors hover:bg-[#ffe4e6]"
                aria-label={`Remove ${t(f.label, lang)}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <input
            id={`file-input-${f.id}`}
            type="file"
            accept={(f as any)?.validation?.accept}
            className="sr-only"
            onChange={(e) => updateValue(f.id, e.target.files?.[0] ?? null, f)}
          />
        </label>
        {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
      </div>
    );
  }

  // ---------------------------
  // ✅ TEXT / TEXTAREA
  // ---------------------------
  const f = field as TextField;
  const isTextarea = f.type === "textarea";
  const { inputMode, maxLength, min, max, minDate, maxDate, minTime, maxTime, pattern } = getFieldRules(f);
  const htmlType = f.type === "text" ? "text" : (f.type as any);
  const minProp =
    htmlType === "date" || htmlType === "datetime-local" || htmlType === "month"
      ? minDate
      : htmlType === "time"
        ? minTime
        : typeof min === "number"
          ? min
          : typeof (f as any)?.min === "string"
            ? (f as any).min
            : undefined;
  const maxProp =
    htmlType === "date" || htmlType === "datetime-local" || htmlType === "month"
      ? maxDate
      : htmlType === "time"
        ? maxTime
        : typeof max === "number"
          ? max
          : typeof (f as any)?.max === "string"
            ? (f as any).max
            : undefined;

  return (
    <div className={wrapClass}>
      <label className={`mb-1 flex min-w-0 items-start gap-1 text-[12px] font-medium ${getLabelColorClass(hasError)}`}>
        <span className="min-w-0 whitespace-normal break-words">{t((f as any).label, lang)}</span>
        {requiredIndicator}
      </label>
      {isTextarea ? (
        <textarea
          className={getControlClass(hasError, "min-h-[58px] py-2.5")}
          value={values[f.id] ?? ""}
          maxLength={typeof maxLength === "number" ? maxLength : undefined}
          onChange={(e) => updateValue(f.id, sanitizeValue(e.target.value, f), f)}
        />
      ) : (
        <input
          type={htmlType}
          value={values[f.id] ?? ""}
          inputMode={inputMode}
          maxLength={typeof maxLength === "number" ? maxLength : undefined}
          min={minProp}
          max={maxProp}
          pattern={pattern}
          placeholder={placeholderText}
          className={getControlClass(hasError, "h-[40px] py-2")}
          onChange={(e: any) => updateValue(f.id, sanitizeValue(e.target.value, f), f)}
        />
      )}
      {showError && error ? <div className={FIELD_ERROR_CLASS}>{error}</div> : null}
    </div>
  );
}
