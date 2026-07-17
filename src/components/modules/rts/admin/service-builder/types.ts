export type BuilderFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "checkbox"
  | "aadhar"
  | "pan"
  | "file"
  | "radio";

export type BuilderColSpan = 1 | 2 | 3 | 4;

export interface BuilderFieldOption {
  id: string;
  label: string;
}

export interface BuilderFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: BuilderFieldType;
  required: boolean;
  placeholder: string;
  helpText: string;
  colSpan: BuilderColSpan;
  options: BuilderFieldOption[];
  min?: number;
  max?: number;
  dateRestriction?: string;
}

export interface BuilderSectionDefinition {
  id: string;
  title: string;
  description: string;
  fields: BuilderFieldDefinition[];
}

export interface AdminServiceFormRecord {
  id: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  description: string;
  status: "Draft" | "Published";
  createdAt: string;
  updatedAt: string;
  sections: BuilderSectionDefinition[];
}

export interface StoredAdminServiceFormRecord extends AdminServiceFormRecord {
  generatedSchema: GeneratedDynamicFormSchema;
}

export interface GeneratedDynamicFieldSchema {
  id: string;
  type: BuilderFieldType;
  label: {
    en: string;
    hi: string;
    mr: string;
  };
  required: boolean;
  colSpan: number;
  placeholder?: {
    en: string;
    hi: string;
    mr: string;
  };
  helperText?: {
    en: string;
    hi: string;
    mr: string;
  };
  options?: Array<{
    value: string;
    label: {
      en: string;
      hi: string;
      mr: string;
    };
  }>;
}

export interface GeneratedDynamicSectionSchema {
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
  fields: GeneratedDynamicFieldSchema[];
}

export interface GeneratedDynamicFormSchema {
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  description: string;
  steps: GeneratedDynamicSectionSchema[];
  documents: [];
}

export interface ServicesAndFormDataFile {
  services: StoredAdminServiceFormRecord[];
}
