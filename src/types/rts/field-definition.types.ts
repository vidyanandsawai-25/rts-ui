export interface RtsFieldDefinitionQueryParams {
  DepartmentId?: number;
  ServiceId?: number;
  FieldCode?: string;
  FieldName?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface RtsFieldDefinitionApiItem {
  departmentId: number;
  serviceId: number;
  fieldCode: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup: string | null;
  isRequired: boolean;
  displayOrder: number;
  validationRules: string | null;
  defaultValue: string | number | boolean | null;
  minValue: number | null;
  maxValue: number | null;
  maxLength: number | null;
  optionsJson: string | null;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export type DynamicRenderFieldType =
  | "text"
  | "number"
  | "decimal"
  | "amount"
  | "email"
  | "mobile"
  | "aadhaar"
  | "pan"
  | "pincode"
  | "url"
  | "password"
  | "date"
  | "time"
  | "datetime"
  | "month"
  | "year"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "hidden"
  | "label";

export interface DynamicFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DynamicFormField {
  id: string;
  fieldDefinitionId: number;
  departmentId: number;
  serviceId: number;

  fieldCode: string;
  fieldName: string;
  label: string;

  type: DynamicRenderFieldType;
  rawFieldType: string;

  group: string;
  required: boolean;
  displayOrder: number;

  validationRules: string | null;
  defaultValue: string | number | boolean | null;
  minValue: number | null;
  maxValue: number | null;
  maxLength: number | null;

  options: DynamicFieldOption[];

  colSpan: 1 | 2 | 4;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface DynamicFormSection {
  id: string;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  description?: {
    en: string;
    hi: string;
    mr: string;
  };
  fields: DynamicFormField[];
}