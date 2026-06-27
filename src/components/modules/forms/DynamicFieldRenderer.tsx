"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/common/Input";
import { Info } from "lucide-react";
import type {
  FieldConfig,
  LangLabel,
  LocationPickerField,
  NormalizeRule,
  InputMode,
  PickedLocation,
  SelectField,
  TextField,
} from "@/data/Dept/formTypes";
import { VALIDATION_RULES } from "@/lib/utils/validationRegistry";

const LocationPicker = dynamic(() => import("@/components/common/LocationPicker"), {
  ssr: false,
});

function t(label: LangLabel | undefined, lang: "en" | "hi" | "mr") {
  if (!label) return "";
  return (label as any)?.[lang] ?? (label as any)?.en ?? "";
}

const getLabelText = (label?: LangLabel | string) => {
  if (!label) return "";
  if (typeof label === "string") return label.toLowerCase();
  return Object.values(label)
    .filter((val) => typeof val === "string")
    .join(" ")
    .toLowerCase();
};

const PERSON_NAME_BLOCKLIST = [
  "building",
  "society",
  "colony",
  "property",
  "road",
  "street",
  "landmark",
  "ward",
  "zone",
  "city",
  "state",
  "district",
  "bank",
  "branch",
  "company",
  "firm",
  "business",
  "trade",
  "shop",
  "office",
  "organization",
  "organisation",
  "agency",
  "mandal",
  "hospital",
  "school",
  "college",
  "institute",
  "police",
  "fire",
  "station",
  "department",
  "authority",
  "developer",
  "association",
  "project",
];

const isPersonNameField = (fieldId: string, labelText: string) => {
  const haystack = `${fieldId} ${labelText}`.toLowerCase();
  if (!haystack.includes("name")) return false;
  if (PERSON_NAME_BLOCKLIST.some((token) => haystack.includes(token))) return false;
  return true;
};

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

const getInputDefaults = (field: FieldConfig) => {
  const fieldType = String((field as any).type ?? "");
  const fieldId = String((field as any).id ?? "").toLowerCase();
  const labelText = getLabelText((field as any).label);
  const normalize: NormalizeRule[] = [];
  let inputMode: InputMode | undefined;
  let allow: string | undefined;
  let maxLength: number | undefined;
  const hasValidationKey = Object.prototype.hasOwnProperty.call(field as any, "validationKey");
  if (hasValidationKey) return { inputMode, allow, maxLength, normalize };
  const isNameLabel = isPersonNameField(fieldId, labelText);

  if (isNameLabel) {
    inputMode = "text";
    allow = "letters";
    normalize.push("trim");
  }

  if (
    fieldType === "tel" ||
    /mobile|mobileno|mobilenumber|contactno|contactnumber|phone/.test(fieldId)
  ) {
    inputMode = "numeric";
    allow = "numeric";
    maxLength = 10;
    normalize.push("trim", "removeSpaces");
  }

  if (/aadhaar|aadhar/.test(fieldId)) {
    inputMode = inputMode ?? "numeric";
    allow = allow ?? "numeric";
    maxLength = maxLength ?? 12;
    normalize.push("trim", "removeSpaces");
  }

  if (/pincode|pin_code|pin-code/.test(fieldId)) {
    inputMode = inputMode ?? "numeric";
    allow = allow ?? "numeric";
    maxLength = maxLength ?? 6;
    normalize.push("trim", "removeSpaces");
  }

  if (/pancard|pan(card)?(number|no)|pan_no|pan_number/.test(fieldId)) {
    inputMode = inputMode ?? "text";
    allow = allow ?? "alphanumeric";
    maxLength = maxLength ?? 10;
    normalize.push("trim", "removeSpaces", "uppercase");
  }

  if (fieldType === "number") {
    inputMode = inputMode ?? "numeric";
    allow = allow ?? "numeric";
    normalize.push("trim", "removeSpaces");
  }

  if (fieldType === "email" || fieldId.includes("email")) {
    inputMode = inputMode ?? "email";
  }

  return { inputMode, allow, maxLength, normalize };
};

const getFieldRules = (field: FieldConfig) => {
  const validation = (field as any).validation || {};
  const key = (field as any).validationKey;
  const rule = key ? VALIDATION_RULES[key] : undefined;
  const defaults = getInputDefaults(field);

  const normalize = mergeNormalizeRules(
    (field as any).normalize ?? validation.normalize ?? rule?.normalize,
    defaults.normalize
  );
  const allow = (field as any).allow ?? validation.allow ?? rule?.allow ?? defaults.allow;
  const inputMode =
    (field as any).inputMode ?? validation.inputMode ?? rule?.inputMode ?? defaults.inputMode;
  const maxLength =
    (field as any).exactLength ??
    (field as any).maxLength ??
    validation.exactLength ??
    validation.maxLength ??
    rule?.exactLength ??
    rule?.maxLength ??
    defaults.maxLength;

  return { inputMode, allow, normalize, maxLength };
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

export default function DynamicFieldRenderer(props: {
  field: FieldConfig;
  lang: "en" | "hi" | "mr";
  values: Record<string, any>;
  setValue: (id: string, value: any) => void;
  error?: string;
}) {
  const { field, lang, values, setValue, error } = props;

  const span = toSpan4((field as any).colSpan);
  const wrapClass = SPAN_CLASS[span];
  const placeholderValue = (field as any)?.placeholder;
  const placeholderText =
    typeof placeholderValue === "string" ? placeholderValue : t(placeholderValue as any, lang);
  const helpText =
    (field as any)?.helperText?.[lang] ||
    (field as any)?.helperText?.en ||
    (field as any)?.description?.[lang] ||
    (field as any)?.description?.en ||
    placeholderText ||
    "";
  const helpIcon = helpText ? (
    <span title={helpText} aria-label={helpText} className="inline-flex cursor-help">
      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
    </span>
  ) : null;

  // ---------------------------
  // ✅ Location Picker
  // ---------------------------
  if (field.type === "locationPicker") {
    const f = field as LocationPickerField;
    return (
      <div className={wrapClass}>
        <div
          title={helpText || undefined}
          className="flex items-center gap-1 min-w-0 text-sm font-medium mb-2"
        >
          <span className="truncate">{t(f.label, lang)}</span>
          {helpIcon}
        </div>
        <LocationPicker
          value={(values[f.id] as PickedLocation) ?? null}
          onChange={(v: PickedLocation | null) => setValue(f.id, v)}
          persistKey={f.persistKey}
          placeholder={(() => {
            if (!f.placeholder) return undefined;
            if (typeof (f as any).placeholder === "string") return (f as any).placeholder;
            return t(f.placeholder as any, lang);
          })()}
          lang={lang}
        />
        {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
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
        setValue("certOC", nextOC);
        setValue("certCC", nextCC);
        setValue("certElectricityBill", nextEB);
        setValue("certOther", nextOther);

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

        setValue("occupancyCertDateType", typeVal);

        // update status
        setValue("propertyProofStatus", computeProofStatus(nextOC, nextCC, nextEB));
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
          <label className="text-sm font-medium block mb-1">{t(f.label, lang)}</label>

          <button
            type="button"
            className="w-full rounded-xl border px-3 py-2 flex items-center justify-between bg-white"
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

          {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
        </div>
      );
    }

    // ✅ Normal select for all other fields
    return (
      <div className={wrapClass}>
        <label className="text-sm font-medium block mb-1">{t(f.label, lang)}</label>
        <select
          className="w-full rounded-xl border px-3 py-2"
          value={values[f.id] ?? ""}
          onChange={(e) => setValue(f.id, sanitizeValue(e.target.value, f))}
        >
          <option value="">{lang === "hi" ? "चयन करें" : lang === "mr" ? "निवडा" : "Select"}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label, lang)}
            </option>
          ))}
        </select>
        {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
      </div>
    );
  }

  // ---------------------------
  // ✅ TEXT / TEXTAREA
  // ---------------------------
  const f = field as TextField;
  const isTextarea = f.type === "textarea";
  const { inputMode, maxLength } = getFieldRules(f);

  return (
    <div className={wrapClass}>
      <label
        title={helpText || undefined}
        className="flex items-center gap-1 min-w-0 text-sm font-medium block mb-1"
      >
        <span className="truncate">{t((f as any).label, lang)}</span>
        {helpIcon}
      </label>
      {isTextarea ? (
        <textarea
          className="w-full rounded-xl border px-3 py-2 min-h-[90px]"
          value={values[f.id] ?? ""}
          maxLength={typeof maxLength === "number" ? maxLength : undefined}
          onChange={(e) => setValue(f.id, sanitizeValue(e.target.value, f))}
        />
      ) : (
        <Input
          type={f.type === "text" ? "text" : (f.type as any)}
          value={values[f.id] ?? ""}
          inputMode={inputMode}
          maxLength={typeof maxLength === "number" ? maxLength : undefined}
          onChange={(e: any) => setValue(f.id, sanitizeValue(e.target.value, f))}
        />
      )}
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
