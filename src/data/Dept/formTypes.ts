// @ts-nocheck
export type LangLabel = { en: string; hi: string; mr: string };

export type SelectOption = {
  value: string;
  label: LangLabel;
};

export type InputMode =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';

export type NormalizeRule = 'trim' | 'uppercase' | 'removeSpaces' | 'removeCommas';

export type CustomValidateFn = (value: any, formData: Record<string, any>) => string | null;
export type CustomValidate = CustomValidateFn | CustomValidateFn[] | string | string[];

export type FieldValidation = {
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  exactLength?: number;
  min?: number;
  max?: number;
  allow?: string;
  normalize?: NormalizeRule | NormalizeRule[];
  customValidate?: CustomValidate;
  inputMode?: InputMode;
  message?: string;
};

export type FieldCondition =
  | { field: string; equals: string }
  | { field: string; doesNotEqual: string }
  | { field: string; equalsAny: string[] }
  | { field: string; doesNotEqualAny: string[] }
  | { any: FieldCondition[] }
  | { all: FieldCondition[] }
  | { field: string; notEmpty: boolean }
  | { field: string; equalsBool: boolean }
  | { field: string; doesNotEqualBool: boolean };




export type BaseField = {
  id: string;
  label: LangLabel;
  required?: boolean;
  colSpan?: number;
  placeholder?: string | LangLabel;
  helperText?: LangLabel;
  description?: LangLabel;
  readOnly?: boolean;
  disabled?: boolean;
  showIf?: FieldCondition;
  inputMode?: InputMode;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  allow?: string;
  normalize?: NormalizeRule | NormalizeRule[];
  customValidate?: CustomValidate;
  validationKey?: string;
};

export type TextField = BaseField & {
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
  validation?: FieldValidation;
};

export type SelectField = BaseField & {
  type: 'select';
  options: SelectOption[];
};

export type CheckboxField = BaseField & {
  type: "checkbox";
};

export type ActionField = BaseField & {
  type: "action";
  action: {
    kind: string;
  };
};

// ✅ Location picker types
export type PickedLocation = { lat: number; lng: number; label?: string } | null;

export type LocationPickerField = BaseField & {
  type: "locationPicker";
  persistKey?: string;
  placeholder?: string | LangLabel;
};

export type FieldConfig =
  | TextField
  | SelectField
  | LocationPickerField
  | CheckboxField
  | ActionField
  | CheckboxDropdownField;

export type FormField = FieldConfig;

export type ServiceFormStep = {
  id: string;
  title: LangLabel;
  description?: LangLabel;
  fields: FieldConfig[];
  showIf?: FieldCondition;   // render step only if condition met
  hideIf?: FieldCondition;   // hide step if condition met
  disableIf?: FieldCondition;
};

export type ServiceDocument = {
  id: string;
  label: LangLabel;
  description?: LangLabel;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number;
};

export type ServiceFormConfig = {
  serviceId: string;
  steps: ServiceFormStep[];
  documents?: ServiceDocument[];
};

// ------------------- helpers (keep your existing ones; these are safe defaults) -------------------

export function createAddressFieldsWithCity(prefix = "Property"): FieldConfig[] {
  const p = prefix.trim();
  const key = p.toLowerCase();

  return [
    {
      id: `${key}City`,
      type: "text",
      label: { en: `${p} City`, hi: `${p} शहर`, mr: `${p} शहर` },
      required: true,
      colSpan: 1,
    },
    {
      id: `${key}State`,
      type: "text",
      label: { en: `${p} State`, hi: `${p} राज्य`, mr: `${p} राज्य` },
      required: true,
      colSpan: 1,
    },
  ];
}

// ✅ Property location field helper
export function createLocationPickerField(
  opts?: Partial<LocationPickerField>
): LocationPickerField {
  return {
    id: "propertyLocation",
    type: "locationPicker",
    label: {
      en: "Pick Property Location",
      hi: "संपत्ति का स्थान चुनें",
      mr: "मालमत्तेचे स्थान निवडा",
    },
    required: true,
    colSpan: 2,
    persistKey: "rts_property_location",
    placeholder: {
      en: "Search location (India only)...",
      hi: "भारत में स्थान खोजें...",
      mr: "फक्त भारतातील स्थान शोधा...",
    },
    ...opts,
  };
}

// ✅ Applicant fields helper (default: NO location here)
export function createApplicantInformationFields(
  opts?: { includeLocation?: boolean; locationPersistKey?: string }
): FieldConfig[] {
  const includeLocation = opts?.includeLocation ?? false;

  const fields: FieldConfig[] = [
    {
      id: 'firstName',
      type: 'text',
      label: { en: 'First Name', hi: 'प्रथम नाम', mr: 'प्रथम नाव' },
      required: true,
        validationKey: 'NAME_NO_SPACE',
      colSpan: 1,
    },
    {
      id: 'middleName',
      type: 'text',
      label: { en: 'Middle Name', hi: 'मध्य नाम', mr: 'मधले नाव' },
      required: false,
         validationKey: 'NAME_NO_SPACE',
      colSpan: 1,
    },
    {
      id: 'lastName',
      type: 'text',
      label: { en: 'Last Name', hi: 'अंतिम नाम', mr: 'आडनाव' },
      required: true,
      validationKey: 'NAME_NO_SPACE',
      colSpan: 1,
    },
    {
      id: 'mobileNumber',
      type: 'tel',
      label: { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाईल नंबर' },
      required: true,
         validationKey:'MOBILE',
      colSpan: 1,
    },
    {
      id: 'aadharNo',
      type: 'text',
      label: { en: 'Aadhar Card No', hi: 'आधार नंबर', mr: 'आधार क्रमांक' },
      required: true,
        validationKey:'AADHAAR',
      colSpan: 1,
    },
    {
      id: 'email',
      type: 'email',
      label: { en: 'Email', hi: 'ईमेल', mr: 'ई-मेल' },
      required: false,
      colSpan: 1,
    },
  ];

  if (includeLocation) {
    fields.push(
      createLocationPickerField({
        id: 'applicantLocation',
        persistKey: opts?.locationPersistKey ?? 'rts_applicant_location',
        label: {
          en: 'Pick Applicant Location',
          hi: 'आवेदक का स्थान चुनें',
          mr: 'अर्जदाराचे स्थान निवडा',
        },
      })
    );
  }

  return fields;
}
export const declarationField = (): FormField[] => [
  {
    id: 'declaration',
    type: 'checkbox',
    label: {
      en: 'I hereby declare that the information provided is true and correct.',
      hi: 'मैं घोषणा करता हूं कि दी गई जानकारी सत्य और सही है।',
      mr: 'मी याद्वारे घोषित करतो की दिलेली माहिती खरी आणि बरोबर आहे.',
    },
    required: true,
    colSpan: 1,
  },
];

export function isConditionMet(
  cond: FieldCondition | undefined,
  formData: Record<string, any>
): boolean {
  if (!cond) return true;

  // logical groups
  if ('any' in cond) return cond.any.some((c) => isConditionMet(c, formData));
  if ('all' in cond) return cond.all.every((c) => isConditionMet(c, formData));

  // single field rules
  const v = formData?.[cond.field];

  // ✅ boolean checks
  if ("equalsBool" in cond) return Boolean(v) === cond.equalsBool;
  if ("doesNotEqualBool" in cond) return Boolean(v) !== cond.doesNotEqualBool;

  // ✅ string-based checks (NOW supports checkboxDropdown where v can be string[])
  if ("equals" in cond) {
    if (Array.isArray(v)) return v.map(String).includes(String(cond.equals));
    return String(v ?? "") === String(cond.equals);
  }

  if ("doesNotEqual" in cond) {
    if (Array.isArray(v)) return !v.map(String).includes(String(cond.doesNotEqual));
    return String(v ?? "") !== String(cond.doesNotEqual);
  }

  if ("equalsAny" in cond) {
    const targets = cond.equalsAny.map(String);
    if (Array.isArray(v)) {
      const vv = v.map(String);
      return targets.some((t) => vv.includes(t));
    }
    return targets.includes(String(v ?? ""));
  }

  if ("doesNotEqualAny" in cond) {
    const targets = cond.doesNotEqualAny.map(String);
    if (Array.isArray(v)) {
      const vv = v.map(String);
      return !targets.some((t) => vv.includes(t));
    }
    return !targets.includes(String(v ?? ""));
  }

  // notEmpty (also supports arrays)
  if ("notEmpty" in cond) {
    const empty =
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "") ||
      (Array.isArray(v) && v.length === 0);

    return cond.notEmpty ? !empty : empty;
  }

  return true;
}



export function requiredIf(cond: FieldCondition, message: string): CustomValidateFn {
  return (value: any, formData: Record<string, any>) => {
    const must = isConditionMet(cond, formData);
    if (!must) return null;

    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    return empty ? message : null;
  };
}

export type CheckboxOption = {
  value: string;
  label: Record<string, string> | string; // or your LocalizedText type
};

export type CheckboxDropdownField = BaseField & {
  type: "checkboxDropdown";
  options: CheckboxOption[];
};
