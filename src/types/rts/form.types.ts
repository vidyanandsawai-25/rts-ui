export type LangLabel = {
  en: string;
  hi: string;
  mr: string;
};

export type SelectOption = {
  value: string;
  label: LangLabel;
};

export type NormalizeRule = "trim" | "uppercase" | "removeSpaces" | "removeCommas";

export type CustomValidate = "noTempEmail" | "gstNumber" | "panCard" | "aadharCard";

export type InputMode = "text" | "numeric" | "decimal" | "tel" | "search" | "email" | "url";

export type FieldValidation = {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
  allow?: string;
  normalize?: NormalizeRule | NormalizeRule[];
  customValidate?: CustomValidate;
  inputMode?: InputMode;
  message?: string;
  acceptedFormats?: string[];
  accept?: string;
  maxFileSizeMb?: number;
};

export type FieldCondition =
  | { field: string; equals: string | number | boolean }
  | { field: string; doesNotEqual: string | number | boolean }
  | { field: string; equalsAny: Array<string | number | boolean> }
  | { field: string; doesNotEqualAny: Array<string | number | boolean> }
  | { field: string; equalsBool: boolean }
  | { field: string; doesNotEqualBool: boolean }
  | { field: string; notEmpty: boolean }
  | { any: FieldCondition[] }
  | { all: FieldCondition[] };

export type BaseField = {
  id: string;
  label: LangLabel;
  colSpan?: 1 | 2 | 3 | 4;
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
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'month'
    | 'url'
    | 'password'
    | 'textarea'
    | 'file'
    | 'hidden'
    | 'label';
  validation?: FieldValidation;
};

export type SelectField = BaseField & {
  type: 'select';
  options: SelectOption[];
};

export type RadioField = BaseField & {
  type: "radio";
  options: SelectOption[];
};

export type CheckboxField = BaseField & {
  type: "checkbox";
  options?: SelectOption[];
};

export type ActionField = BaseField & {
  type: "action";
  action: {
    kind: string;
  };
};

export type PickedLocation = { lat: number; lng: number; label?: string } | null;

export type LocationPickerField = BaseField & {
  type: "locationPicker";
  persistKey?: string;
  placeholder?: string | LangLabel;
};

export type CheckboxOption = {
  value: string;
  label: Record<string, string> | string;
};

export type CheckboxDropdownField = BaseField & {
  type: "checkboxDropdown";
  options: CheckboxOption[];
};

export type FieldConfig =
  | TextField
  | SelectField
  | RadioField
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
  showIf?: FieldCondition;
  hideIf?: FieldCondition;
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
