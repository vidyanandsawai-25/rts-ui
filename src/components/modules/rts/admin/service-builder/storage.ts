import type {
  AdminServiceFormRecord,
  BuilderFieldDefinition,
  BuilderSectionDefinition,
  GeneratedDynamicFieldSchema,
  GeneratedDynamicFormSchema,
  GeneratedDynamicSectionSchema,
  StoredAdminServiceFormRecord,
} from "./types";

export const SERVICE_BUILDER_DRAFT_KEY = "rts_admin_service_builder_draft_v1";

export type ServiceBuilderDraft = {
  currentStep: number;
  serviceName: string;
  departmentId: string;
  description: string;
  sections: BuilderSectionDefinition[];
};

function toLocalizedText(value: string) {
  return {
    en: value,
    hi: value,
    mr: value,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function createEmptyField(): BuilderFieldDefinition {
  return {
    id: createId("field"),
    key: "field_name",
    label: "New Field",
    type: "text",
    required: false,
    placeholder: "",
    helpText: "",
    colSpan: 2,
    options: [],
    min: 0,
    max: 50,
    dateRestriction: "none",
  };
}

export function createEmptySection(): BuilderSectionDefinition {
  return {
    id: createId("section"),
    title: "New Section",
    description: "Group related fields together.",
    fields: [createEmptyField()],
  };
}

export function buildGeneratedDynamicSchema(record: AdminServiceFormRecord): GeneratedDynamicFormSchema {
  const steps: GeneratedDynamicSectionSchema[] = record.sections.map((section) => ({
    id: slugify(section.title) || section.id,
    title: toLocalizedText(section.title),
    description: section.description ? toLocalizedText(section.description) : undefined,
    fields: section.fields.map((field): GeneratedDynamicFieldSchema => ({
      id: slugify(field.key) || field.id,
      type: field.type,
      label: toLocalizedText(field.label),
      required: field.required,
      colSpan: field.colSpan * 3,
      placeholder: field.placeholder ? toLocalizedText(field.placeholder) : undefined,
      helperText: field.helpText ? toLocalizedText(field.helpText) : undefined,
      options:
        field.type === "select"
          ? field.options.map((option) => ({
              value: slugify(option.label) || option.id,
              label: toLocalizedText(option.label),
            }))
          : undefined,
    })),
  }));

  return {
    serviceId: record.id,
    serviceName: record.serviceName,
    departmentId: record.departmentId,
    departmentName: record.departmentName,
    description: record.description,
    steps,
    documents: [],
  };
}

export function buildStoredAdminServiceFormRecord(record: AdminServiceFormRecord): StoredAdminServiceFormRecord {
  return {
    ...record,
    generatedSchema: buildGeneratedDynamicSchema(record),
  };
}

export function readServiceBuilderDraft(): ServiceBuilderDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SERVICE_BUILDER_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ServiceBuilderDraft>;
    if (!Array.isArray(parsed.sections)) {
      return null;
    }

    return {
      currentStep:
        typeof parsed.currentStep === "number" && parsed.currentStep >= 0 && parsed.currentStep <= 2
          ? parsed.currentStep
          : 0,
      serviceName: typeof parsed.serviceName === "string" ? parsed.serviceName : "",
      departmentId: typeof parsed.departmentId === "string" ? parsed.departmentId : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      sections: parsed.sections.length > 0 ? parsed.sections : [createEmptySection()],
    };
  } catch {
    return null;
  }
}

export function writeServiceBuilderDraft(draft: ServiceBuilderDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SERVICE_BUILDER_DRAFT_KEY, JSON.stringify(draft));
}

export function clearServiceBuilderDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SERVICE_BUILDER_DRAFT_KEY);
}
