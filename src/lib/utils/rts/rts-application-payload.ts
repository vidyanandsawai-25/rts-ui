import type { CreateRtsApplicationPayload } from "@/lib/api/rts/rtsapplication.service";

export interface BuildRtsApplicationPayloadParams {
  formData: Record<string, unknown>;
  steps: Array<{ fields?: Array<Record<string, unknown>> }>;
  departmentId?: number | string | null;
  serviceId?: number | string | null;
  ownerId?: number;
  createdBy?: number;
  applicationStatus?: string;
  documentGuidByFieldDefinitionId?: Record<string, string>;
}

function generateOwnerId(): number {
  return Math.floor(100 + Math.random() * 900);
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function toTextValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim() === "" ? null : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof File) return value.name || null;
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toLabelText(label: unknown): string | null {
  if (!label) return null;
  if (typeof label === "string") return label.trim() || null;
  if (typeof label === "object") {
    const record = label as Record<string, unknown>;
    const candidates = [record.en, record.hi, record.mr];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function getFieldOptions(field: Record<string, unknown>) {
  const options = field.options;
  return Array.isArray(options) ? options as Array<Record<string, unknown>> : [];
}

function getOptionLabelText(field: Record<string, unknown>, value: unknown): string | null {
  const normalizedValue = String(value ?? "");
  if (!normalizedValue) return null;

  const matchedOption = getFieldOptions(field).find(
    (option) => String(option?.value ?? "") === normalizedValue
  );

  return (
    toLabelText(matchedOption?.label) ??
    toLabelText(matchedOption?.value) ??
    normalizedValue
  );
}

function getSelectedOptionLabels(field: Record<string, unknown>, values: unknown[]): string[] {
  return values
    .map((value) => getOptionLabelText(field, value))
    .filter((label): label is string => Boolean(label));
}

function toNumberValue(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDateValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.trim();
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? normalized : parsed.toISOString();
  }
  return null;
}

function readFieldName(field: Record<string, unknown>): string {
  const rawApi = field.rawApi as Record<string, unknown> | undefined;
  return String(
    rawApi?.fieldName ||
      rawApi?.fieldCode ||
      field.groupFieldId ||
      field.id ||
      field.fieldName ||
      ""
  );
}

function readFieldDefinitionId(field: Record<string, unknown>): number {
  const rawApi = field.rawApi as Record<string, unknown> | undefined;
  const value = field.fieldDefinitionId ?? rawApi?.id ?? rawApi?.fieldDefinitionId;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildRtsApplicationPayload({
  formData,
  steps,
  departmentId,
  serviceId,
  ownerId,
  createdBy = 0,
  applicationStatus = "pending",
  documentGuidByFieldDefinitionId = {},
}: BuildRtsApplicationPayloadParams): CreateRtsApplicationPayload {
  const fieldValues = (steps || [])
    .flatMap((step) => (step.fields || []) as Array<Record<string, unknown>>)
    .map((field) => {
      const fieldId = String(field.id || "");
      const value = fieldId ? formData[fieldId] : undefined;

      if (isEmptyValue(value)) return null;

      const fieldType = String(field.type || "").toLowerCase();
      const fieldDefinitionId = readFieldDefinitionId(field);
      const fieldValue: CreateRtsApplicationPayload["fieldValues"][number] = {
        isActive: true,
        createdBy,
        fieldDefinitionId,
        fieldName: readFieldName(field),
        textValue: null,
        numberValue: null,
        dateValue: null,
        booleanValue: null,
        documentGuid: null,
      };

      if (fieldType === "checkbox") {
        if (Array.isArray(value)) {
          const labels = getSelectedOptionLabels(field, value);
          fieldValue.textValue = labels.length ? JSON.stringify(labels) : null;
        } else {
          fieldValue.booleanValue = Boolean(value);
        }
      } else if (fieldType === "file") {
        fieldValue.documentGuid = documentGuidByFieldDefinitionId[String(fieldDefinitionId)] ?? null;
      } else if (fieldType === "number" || fieldType === "decimal" || fieldType === "year") {
        const numeric = toNumberValue(value);
        fieldValue.numberValue = numeric;
        fieldValue.textValue = numeric == null ? toTextValue(value) : null;
      } else if (
        fieldType === "date" ||
        fieldType === "time" ||
        fieldType === "datetime" ||
        fieldType === "datetime-local" ||
        fieldType === "month"
      ) {
        fieldValue.dateValue = toDateValue(value);
        fieldValue.textValue = fieldValue.dateValue ? null : toTextValue(value);
      } else if (fieldType === "radio") {
        fieldValue.textValue = getOptionLabelText(field, value);
      } else {
        fieldValue.textValue = toTextValue(value);
      }

      return fieldValue;
    })
    .filter(Boolean) as CreateRtsApplicationPayload["fieldValues"];

  return {
    isActive: true,
    createdBy,
    departmentId: departmentId == null || departmentId === "" ? undefined : Number(departmentId),
    serviceId: serviceId == null || serviceId === "" ? undefined : Number(serviceId),
    ownerId: Number.isFinite(Number(ownerId)) && Number(ownerId) > 0 ? Number(ownerId) : generateOwnerId(),
    applicationStatus,
    fieldValues,
  };
}
