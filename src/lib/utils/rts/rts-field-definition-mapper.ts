import type {
  DynamicFieldOption,
  DynamicFormField,
  DynamicFormSection,
  DynamicRenderFieldType,
  RtsFieldDefinitionApiItem,
} from "@/types/rts/field-definition.types";
import type { ServiceFormConfig } from "@/types/rts/form.types";

const DEFAULT_INDIAN_MOBILE_PATTERN = "^[7-9][0-9]{9}$";

type ParsedValidationRules = {
  pattern?: string;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  allow?: string;
  inputMode?: string;
  normalize?: Array<"trim" | "uppercase" | "removeSpaces" | "removeCommas">;
  acceptedFormats?: string[];
  accept?: string;
  maxFileSizeMb?: number;
  message?: string;
};

function langLabel(value: string, localValue?: string | null) {
  const localVal = localValue?.trim() || value;
  return {
    en: value,
    hi: localVal,
    mr: localVal,
  };
}

function isLangLabelLike(value: unknown): value is { en?: unknown; hi?: unknown; mr?: unknown } {
  return Boolean(value && typeof value === "object" && ("en" in (value as any) || "hi" in (value as any) || "mr" in (value as any)));
}

function normalizeLangLabel(value: unknown, fallback = "") {
  if (isLangLabelLike(value)) {
    const en = value.en == null ? fallback : String(value.en);
    const hi = value.hi == null ? en : String(value.hi);
    const mr = value.mr == null ? en : String(value.mr);

    return {
      en,
      hi,
      mr,
    };
  }

  const text = value == null ? fallback : String(value);
  return langLabel(text);
}

function extractOptionValue(option: Record<string, unknown>) {
  const valueSource =
    option.value ?? option.id ?? option.key ?? option.text ?? option.name ?? option.label;

  return valueSource === undefined || valueSource === null ? "" : String(valueSource);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hasRule(validationRules: string | null | undefined, rule: string): boolean {
  if (!validationRules) return false;
  return validationRules
    .split(/[,\|;]/)
    .map((r) => r.trim().toLowerCase())
    .some((r) => r === rule.toLowerCase() || r.startsWith(`${rule.toLowerCase()}:`));
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeFormatToken(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/^\./, "");
  if (!cleaned) return "";
  return cleaned;
}

function toAcceptValue(formats?: string[]) {
  if (!formats?.length) return undefined;
  return formats.map((format) => `.${format}`).join(",");
}

function normalizeValidationRuleList(value: unknown) {
  const normalized = new Set<"trim" | "uppercase" | "removeSpaces" | "removeCommas">();

  const pushRule = (rule: string) => {
    const key = rule.trim().toLowerCase();
    if (key === "trim") normalized.add("trim");
    if (key === "uppercase") normalized.add("uppercase");
    if (key === "removespaces") normalized.add("removeSpaces");
    if (key === "removecommas") normalized.add("removeCommas");
  };

  if (Array.isArray(value)) {
    value.forEach((rule) => {
      if (typeof rule === "string") pushRule(rule);
    });
  } else if (typeof value === "string") {
    value
      .split(/[+\s,|;]+/)
      .filter(Boolean)
      .forEach(pushRule);
  }

  return normalized.size ? [...normalized] : undefined;
}

function toRuleString(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function toLocalDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveDateRuleToken(value?: string) {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized !== "today" && normalized !== "yesterday") return value;

  const date = new Date();
  if (normalized === "yesterday") date.setDate(date.getDate() - 1);
  return toLocalDateValue(date);
}

function parseFormatsFromAccept(value?: string) {
  if (!value?.trim()) return undefined;

  const formats = value
    .split(",")
    .map((part) => {
      const trimmed = part.trim().toLowerCase();
      if (!trimmed || trimmed.includes("/")) return "";
      return normalizeFormatToken(trimmed);
    })
    .filter(Boolean);

  return formats.length ? [...new Set(formats)] : undefined;
}

function parseValidationRulesJson(validationRules?: string | null): ParsedValidationRules | null {
  if (!validationRules?.trim()) return null;

  try {
    const parsed = JSON.parse(validationRules) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const acceptedFormatsSource =
      parsed.acceptedFormats ??
      parsed.fileTypes ??
      parsed.fileType ??
      parsed.allowedTypes ??
      parsed.allowedExtensions ??
      parsed.extensions ??
      parsed.file;

    const acceptedFormats = Array.isArray(acceptedFormatsSource)
      ? acceptedFormatsSource
          .map((item) => normalizeFormatToken(String(item ?? "")))
          .filter(Boolean)
      : typeof acceptedFormatsSource === "string"
        ? acceptedFormatsSource
            .split(/[,\s|;]+/)
            .map((item) => normalizeFormatToken(item))
            .filter(Boolean)
        : undefined;

    const acceptString = typeof parsed.accept === "string" ? parsed.accept : undefined;
    const formatsFromAccept = parseFormatsFromAccept(acceptString);
    const normalizedFormats = acceptedFormats?.length ? acceptedFormats : formatsFromAccept;

    const maxFileSizeMb =
      toFiniteNumber(parsed.maxFileSizeMb) ??
      toFiniteNumber(parsed.maxSizeMb) ??
      toFiniteNumber(parsed.maxSize) ??
      (typeof parsed.maxsize === "string"
        ? (() => {
            const match = parsed.maxsize.match(/(\d+(?:\.\d+)?)\s*mb/i);
            return match?.[1] ? toFiniteNumber(match[1]) : undefined;
          })()
        : undefined);

    return {
      pattern: typeof parsed.pattern === "string" ? parsed.pattern : undefined,
      min:
        toFiniteNumber(parsed.min) ??
        toFiniteNumber(parsed.minValue),
      max:
        toFiniteNumber(parsed.max) ??
        toFiniteNumber(parsed.maxValue),
      minDate:
        toRuleString(parsed.minDate) ??
        toRuleString(parsed.dateMin) ??
        toRuleString(parsed.min_date),
      maxDate:
        toRuleString(parsed.maxDate) ??
        toRuleString(parsed.dateMax) ??
        toRuleString(parsed.max_date),
      minTime:
        toRuleString(parsed.minTime) ??
        toRuleString(parsed.timeMin) ??
        toRuleString(parsed.min_time),
      maxTime:
        toRuleString(parsed.maxTime) ??
        toRuleString(parsed.timeMax) ??
        toRuleString(parsed.max_time),
      minLength:
        toFiniteNumber(parsed.minLength) ??
        toFiniteNumber(parsed.minlength) ??
        toFiniteNumber(parsed.min_length),
      maxLength:
        toFiniteNumber(parsed.maxLength) ??
        toFiniteNumber(parsed.maxlength) ??
        toFiniteNumber(parsed.max_length),
      exactLength:
        toFiniteNumber(parsed.exactLength) ??
        toFiniteNumber(parsed.exactlength) ??
        toFiniteNumber(parsed.length),
      allow: typeof parsed.allow === "string" ? parsed.allow : undefined,
      inputMode:
        typeof parsed.inputMode === "string"
          ? parsed.inputMode
          : typeof parsed.input_mode === "string"
            ? parsed.input_mode
            : undefined,
      normalize:
        normalizeValidationRuleList(parsed.normalize) ??
        normalizeValidationRuleList(parsed.normalise),
      acceptedFormats: normalizedFormats?.length ? [...new Set(normalizedFormats)] : undefined,
      accept: acceptString ?? (normalizedFormats?.length ? toAcceptValue(normalizedFormats) : undefined),
      maxFileSizeMb,
      message:
        typeof parsed.message === "string"
          ? parsed.message
          : typeof parsed.errorMessage === "string"
            ? parsed.errorMessage
            : undefined,
    };
  } catch {
    return null;
  }
}

function parseOptionsJson(optionsJson: string | null): DynamicFieldOption[] {
  if (!optionsJson?.trim()) return [];

  try {
    const parsed = JSON.parse(optionsJson) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): DynamicFieldOption | null => {
        if (!item || typeof item !== "object") return null;

        const option = item as Record<string, unknown>;

        const value = extractOptionValue(option);
        const labelData = normalizeLangLabel(
          option.label ?? option.text ?? option.name ?? option.value ?? option.id,
          value
        );
        const label = labelData.en || value;

        if (!value.trim() && !label.trim()) return null;

        return {
          value,
          label,
          disabled: Boolean(option.disabled),
        };
      })
      .filter((item): item is DynamicFieldOption => item !== null);
  } catch {
    return [];
  }
}

function mapRtsFieldType(fieldType: string): DynamicRenderFieldType {
  const normalized = fieldType.trim().toLowerCase();

  switch (normalized) {
    case "text":
      return "text";
    case "number":
      return "number";
    case "decimal":
      return "decimal";
    case "amount":
      return "amount";
    case "email":
      return "email";
    case "mobile":
      return "mobile";
    case "aadhaar":
    case "aadhar":
      return "aadhaar";
    case "pan":
      return "pan";
    case "pincode":
    case "pin":
    case "pin_code":
      return "pincode";
    case "url":
      return "url";
    case "password":
      return "password";
    case "date":
      return "date";
    case "time":
      return "time";
    case "datetime":
    case "date_time":
    case "date-time":
      return "datetime";
    case "month":
      return "month";
    case "year":
      return "year";
    case "textarea":
    case "text_area":
    case "multi_line":
      return "textarea";
    case "dropdown":
    case "select":
      return "select";
    case "radio":
      return "radio";
    case "checkbox":
      return "checkbox";
    case "file":
    case "upload":
      return "file";
    case "hidden":
      return "hidden";
    case "label":
      return "label";
    default:
      return "text";
  }
}

function getFieldColSpan(type: DynamicRenderFieldType): 1 | 2 | 4 {
  if (type === "textarea" || type === "file" || type === "checkbox" || type === "label") {
    return 4;
  }

  if (type === "hidden") {
    return 1;
  }

  return 2;
}

function mapApiItemToField(item: RtsFieldDefinitionApiItem): DynamicFormField {
  const type = mapRtsFieldType(item.fieldType);
  const group = item.fieldGroup?.trim() || "General";

  return {
    id: item.fieldCode,
    fieldDefinitionId: item.id,
    departmentId: item.departmentId,
    serviceId: item.serviceId,

    fieldCode: item.fieldCode,
    // fieldName removed from API — fieldCode is the unique identifier
    label: item.fieldLabel,

    type,
    rawFieldType: item.fieldType,

    group,
    required: item.isRequired || hasRule(item.validationRules, "required"),
    displayOrder: item.displayOrder,

    validationRules: item.validationRules,
    defaultValue: item.defaultValue,
    minValue: item.minValue,
    maxValue: item.maxValue,
    maxLength: item.maxLength,

    options: parseOptionsJson(item.optionsJson),

    colSpan: getFieldColSpan(type),
  };
}

export function buildRtsDynamicFormSections(
  apiItems: RtsFieldDefinitionApiItem[]
): DynamicFormSection[] {
  const activeSortedItems = [...apiItems]
    .filter((item) => item.isActive !== false)
    .sort((a, b) => {
      const byDisplayOrder = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (byDisplayOrder !== 0) return byDisplayOrder;
      return (a.id ?? 0) - (b.id ?? 0);
    });

  const sectionMap = new Map<string, DynamicFormSection>();

  for (const item of activeSortedItems) {
    const groupTitle = item.fieldGroup?.trim() || "General";
    const sectionId = `section-${slugify(groupTitle) || "general"}`;

    if (!sectionMap.has(sectionId)) {
      sectionMap.set(sectionId, {
        id: sectionId,
        title: {
          en: groupTitle,
          hi: groupTitle,
          mr: groupTitle,
        },
        description: {
          en: "Please fill the required details.",
          hi: "कृपया आवश्यक विवरण भरें।",
          mr: "कृपया आवश्यक तपशील भरा.",
        },
        fields: [],
      });
    }

    sectionMap.get(sectionId)?.fields.push(mapApiItemToField(item));
  }

  return Array.from(sectionMap.values()).map((section) => ({
    ...section,
    fields: section.fields.sort((a, b) => a.displayOrder - b.displayOrder),
  }));
}

function safeParseOldOptionsJson(optionsJson: string | null | undefined) {
  if (!optionsJson?.trim()) return [];

  try {
    const parsed = JSON.parse(optionsJson);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item: any) => {
        if (!item || typeof item !== "object") return null;

        const option = item as Record<string, unknown>;
        const value = extractOptionValue(option);
        const label = normalizeLangLabel(
          option.label ?? option.text ?? option.name ?? option.value ?? option.id,
          value
        );

        if (!value.trim() && !label.en.trim() && !label.hi.trim() && !label.mr.trim()) return null;

        return {
          value,
          label,
          disabled: Boolean(option.disabled),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function extractMaxLength(validationRules?: string | null, fallback?: number | null) {
  if (typeof fallback === "number") return fallback;

  const match = String(validationRules || "").match(/maxlength:(\d+)/i);
  if (!match?.[1]) return undefined;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractValidationNumber(
  validationRules: string | null | undefined,
  ruleNames: string[],
  fallback?: number | null
) {
  if (typeof fallback === "number") return fallback;

  const source = String(validationRules || "");
  for (const ruleName of ruleNames) {
    const match = source.match(new RegExp(`${ruleName}:(-?\\d+(?:\\.\\d+)?)`, "i"));
    if (!match?.[1]) continue;

    const parsed = Number(match[1]);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function extractValidationString(
  validationRules: string | null | undefined,
  ruleNames: string[]
) {
  const source = String(validationRules || "");

  for (const ruleName of ruleNames) {
    const match = source.match(new RegExp(`${ruleName}:([^|;,]+)`, "i"));
    if (match?.[1]) return match[1].trim();
  }

  return undefined;
}

function parseValidationNormalizeRules(validationRules?: string | null) {
  const source = String(validationRules || "");
  const normalize = new Set<string>();
  const normalizeValue = extractValidationString(source, ["normalize"]);

  if (normalizeValue) {
    normalizeValue
      .split(/[+\s,]+/)
      .map((rule) => rule.trim())
      .filter(Boolean)
      .forEach((rule) => normalize.add(rule));
  }

  if (hasRule(source, "trim")) normalize.add("trim");
  if (hasRule(source, "uppercase")) normalize.add("uppercase");
  if (hasRule(source, "removespaces")) normalize.add("removeSpaces");
  if (hasRule(source, "removecommas")) normalize.add("removeCommas");

  const list = [...normalize].filter(
    (rule): rule is "trim" | "uppercase" | "removeSpaces" | "removeCommas" =>
      rule === "trim" || rule === "uppercase" || rule === "removeSpaces" || rule === "removeCommas"
  );

  return list.length ? list : undefined;
}

function parseFileValidationFormats(validationRules?: string | null) {
  const source = String(validationRules || "");
  const match = source.match(/file:([^|;]+)/i);
  if (!match?.[1]) return undefined;

  const formats = match[1]
    .split(",")
    .map((part) => normalizeFormatToken(part))
    .filter((part) => part && !part.startsWith("maxsize:"));

  return formats.length ? formats : undefined;
}

function parseFileValidationMaxSizeMb(validationRules?: string | null) {
  const source = String(validationRules || "");
  const match = source.match(/maxsize:(\d+(?:\.\d+)?)\s*mb/i);
  if (!match?.[1]) return undefined;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractValidationDateString(
  validationRules: string | null | undefined,
  ruleNames: string[]
) {
  return extractValidationString(validationRules, ruleNames);
}

function mapApiFieldTypeToOldType(apiType: string) {
  const normalized = String(apiType || "Text").trim().toLowerCase();

  switch (normalized) {
    case "text":
      return "text";
    case "number":
      return "number";
    case "decimal":
    case "amount":
      return "number";
    case "email":
      return "email";
    case "mobile":
    case "tel":
    case "phone":
      return "tel";
    case "aadhaar":
    case "aadhar":
    case "pan":
    case "pincode":
      return "text";
    case "url":
      return "url";
    case "password":
      return "password";
    case "date":
      return "date";
    case "time":
      return "time";
    case "datetime":
    case "date_time":
    case "date-time":
      return "datetime-local";
    case "month":
      return "month";
    case "year":
      return "number";
    case "textarea":
    case "text_area":
      return "textarea";
    case "dropdown":
    case "select":
      return "select";
    case "radio":
      return "radio";
    case "checkbox":
      return "checkbox";
    case "file":
    case "upload":
      return "file";
    case "hidden":
      return "hidden";
    case "label":
      return "label";
    default:
      return "text";
  }
}

function getApiFieldColSpan(oldType: string, optionsCount = 0) {
  if (oldType === "checkbox") {
    if (optionsCount === 0) return 12;
    if (optionsCount <= 2) return 4;
    if (optionsCount <= 6) return 6;
    if (optionsCount <= 10) return 8;
    return 12;
  }

  if (oldType === "radio") {
    return optionsCount > 4 ? 6 : 4;
  }

  if (oldType === "textarea" || oldType === "checkboxDropdown" || oldType === "file" || oldType === "label") {
    return 12;
  }

  return 6;
}

function mapApiItemToOldField(item: RtsFieldDefinitionApiItem) {
  const options = safeParseOldOptionsJson(item?.optionsJson);
  const oldType = mapApiFieldTypeToOldType(item?.fieldType);
  const parsedValidation = parseValidationRulesJson(item?.validationRules);
  const maxLength =
    parsedValidation?.maxLength ??
    extractMaxLength(parsedValidation ? null : item?.validationRules, item?.maxLength);

  const validation: Record<string, any> = {};
  const minLength =
    parsedValidation?.minLength ??
    extractValidationNumber(parsedValidation ? null : item?.validationRules, ["minlength", "min_length"]);
  const exactLength =
    parsedValidation?.exactLength ??
    extractValidationNumber(parsedValidation ? null : item?.validationRules, ["exactlength", "length"]);
  const minValue =
    parsedValidation?.min ??
    extractValidationNumber(parsedValidation ? null : item?.validationRules, ["min", "minvalue"], item?.minValue);
  const maxValue =
    parsedValidation?.max ??
    extractValidationNumber(parsedValidation ? null : item?.validationRules, ["max", "maxvalue"], item?.maxValue);
  const minDateRule =
    parsedValidation?.minDate ??
    extractValidationDateString(parsedValidation ? null : item?.validationRules, ["mindate", "datemin", "date_min", "min_date"]);
  const maxDateRule =
    parsedValidation?.maxDate ??
    extractValidationDateString(parsedValidation ? null : item?.validationRules, ["maxdate", "datemax", "date_max", "max_date"]);
  const minDate = resolveDateRuleToken(minDateRule);
  const maxDate = resolveDateRuleToken(maxDateRule);
  const minTime =
    parsedValidation?.minTime ??
    extractValidationDateString(parsedValidation ? null : item?.validationRules, ["mintime", "timemin", "time_min", "min_time"]);
  const maxTime =
    parsedValidation?.maxTime ??
    extractValidationDateString(parsedValidation ? null : item?.validationRules, ["maxtime", "timemax", "time_max", "max_time"]);
  const pattern =
    parsedValidation?.pattern ??
    extractValidationString(parsedValidation ? null : item?.validationRules, ["regex", "pattern"]);
  const allow =
    parsedValidation?.allow ??
    extractValidationString(parsedValidation ? null : item?.validationRules, ["allow"]);
  const inputMode =
    parsedValidation?.inputMode ??
    extractValidationString(parsedValidation ? null : item?.validationRules, ["inputmode", "input_mode"]);
  const normalize =
    parsedValidation?.normalize ??
    parseValidationNormalizeRules(parsedValidation ? null : item?.validationRules);
  const acceptedFormats =
    parsedValidation?.acceptedFormats ??
    parseFileValidationFormats(parsedValidation ? null : item?.validationRules);
  const accept =
    parsedValidation?.accept ??
    toAcceptValue(acceptedFormats);
  const maxFileSizeMb =
    parsedValidation?.maxFileSizeMb ??
    parseFileValidationMaxSizeMb(parsedValidation ? null : item?.validationRules);
  const message = parsedValidation?.message;
  const isMobileField = oldType === "tel";
  const isNumericLikeField =
    oldType === "number" || String(item?.fieldType || "").toLowerCase() === "year";

  if (typeof maxLength === "number") validation.maxLength = maxLength;
  if (typeof minLength === "number") validation.minLength = minLength;
  if (typeof exactLength === "number") validation.exactLength = exactLength;
  if (isNumericLikeField && typeof minValue === "number") validation.min = minValue;
  if (isNumericLikeField && typeof maxValue === "number") validation.max = maxValue;
  if (minDate) validation.minDate = minDate;
  if (maxDate) validation.maxDate = maxDate;
  if (minTime) validation.minTime = minTime;
  if (maxTime) validation.maxTime = maxTime;
  if (pattern) validation.pattern = pattern;
  if (allow) validation.allow = allow;
  if (inputMode) validation.inputMode = inputMode as any;
  if (normalize) validation.normalize = normalize;
  if (acceptedFormats) validation.acceptedFormats = acceptedFormats;
  if (accept) validation.accept = accept;
  if (typeof maxFileSizeMb === "number") validation.maxFileSizeMb = maxFileSizeMb;
  if (message) validation.message = message;

  // The current field-definition API returns `tel` without validation rules.
  // Supply the standard Indian mobile rules until the API provides explicit ones.
  if (isMobileField) {
    validation.pattern ??= DEFAULT_INDIAN_MOBILE_PATTERN;
    validation.exactLength ??= 10;
    validation.maxLength ??= 10;
    validation.allow ??= "numeric";
    validation.inputMode ??= "numeric";
    validation.message ??= "Enter a valid 10-digit mobile number starting with 7, 8, or 9.";
  }

  if (hasRule(item?.validationRules, "decimal")) {
    validation.allow = "decimal";
    validation.inputMode = "decimal";
  }

  if (String(item?.fieldType || "").toLowerCase() === "year") {
    validation.allow = "numeric";
    validation.inputMode = "numeric";
  }

  return {
    id: String(item?.fieldCode || item?.id),
    type: oldType,
    label: langLabel(String(item?.fieldLabel || item?.fieldCode || ""), item?.fieldLabelLocal),
    required: Boolean(item?.isRequired) || hasRule(item?.validationRules, "required"),
    colSpan: getApiFieldColSpan(oldType, options.length),
    placeholder:
      oldType === "select"
        ? langLabel("Select")
        : oldType === "file"
          ? langLabel("Upload file")
          : langLabel(`Enter ${item?.fieldLabel || item?.fieldCode || ""}`),
    helperText: undefined,
    description: undefined,
    options,
    validation,
    maxLength,
    min: isNumericLikeField ? minValue ?? undefined : undefined,
    max: isNumericLikeField ? maxValue ?? undefined : undefined,
    defaultValue: item?.defaultValue ?? "",
    displayOrder: item?.displayOrder ?? 0,
    groupId: item?.id,
    fieldDefinitionId: item?.id,
    backendFieldId: item?.id,
    groupFieldId: item?.fieldCode,
    rawApi: item,
  };
}

export function extractRtsFieldDefinitionItems(initialGroups: unknown): RtsFieldDefinitionApiItem[] {
  if (!initialGroups) return [];

  if (Array.isArray(initialGroups)) {
    if (initialGroups.some((item) => (item as any)?.fieldCode || (item as any)?.fieldLabel || (item as any)?.fieldGroup)) {
      return initialGroups as RtsFieldDefinitionApiItem[];
    }

    const nestedFields = initialGroups.flatMap((group) => ((group as any)?.fields || []));
    if (nestedFields.some((item) => item?.fieldCode || item?.fieldLabel || item?.fieldGroup)) {
      return nestedFields as RtsFieldDefinitionApiItem[];
    }

    return [];
  }

  if (Array.isArray((initialGroups as any)?.items)) {
    return (initialGroups as any).items as RtsFieldDefinitionApiItem[];
  }

  return [];
}

export function buildOldServiceFormConfigFromRtsFieldDefinitions(
  serviceId: string,
  apiItems: RtsFieldDefinitionApiItem[]
): ServiceFormConfig | null {
  const activeItems = [...apiItems]
    .filter((item) => item && item.isActive !== false)
    .sort((a, b) => {
      const order = Number(a?.displayOrder ?? 0) - Number(b?.displayOrder ?? 0);
      if (order !== 0) return order;
      return Number(a?.id ?? 0) - Number(b?.id ?? 0);
    });

  if (!activeItems.length) return null;

  const groupMap = new Map<string, any>();

  for (const item of activeItems) {
    const groupTitle = String(item?.fieldGroup || "General").trim() || "General";
    const groupKey = slugify(groupTitle);
    const stepId = groupKey || "general";

    if (!groupMap.has(stepId)) {
      groupMap.set(stepId, {
        id: stepId,
        title: langLabel(groupTitle),
        description: langLabel("Please fill the required details."),
        icon: "FileText",
        fields: [],
      });
    }

    groupMap.get(stepId).fields.push(mapApiItemToOldField(item));
  }

  const steps = Array.from(groupMap.values()).map((step: any) => ({
    ...step,
    fields: [...step.fields].sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0)),
  }));

  return {
    serviceId,
    steps,
    documents: [],
  } as ServiceFormConfig;
}
