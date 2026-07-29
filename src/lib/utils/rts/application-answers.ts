import type { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";
import type { RtsApplicationApiDetail } from "@/types/rts/rts-application.types";

export interface ApplicationAnswerItem {
  fieldDefinitionId: number;
  fieldCode: string;
  label: string;
  fieldType: string;
  displayValue: string;
  documentGuid: string | null;
  displayOrder: number;
}

export interface ApplicationAnswerGroup {
  groupTitle: string;
  answers: ApplicationAnswerItem[];
}

function parseOptionLabel(optionsJson: string | null, rawValue: string): string {
  if (!optionsJson?.trim()) return rawValue;

  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) return rawValue;

    const values = rawValue.split(",").map((v) => v.trim());

    const labels = values.map((value) => {
      const match = parsed.find((option) => {
        if (!option || typeof option !== "object") return false;
        const opt = option as Record<string, unknown>;
        const optionValue = opt.value ?? opt.id ?? opt.key;
        return String(optionValue) === value;
      }) as Record<string, unknown> | undefined;

      if (!match) return value;

      const label = match.label;
      if (typeof label === "string") return label;
      if (label && typeof label === "object") {
        const l = label as Record<string, unknown>;
        return String(l.en ?? l.hi ?? l.mr ?? value);
      }
      return value;
    });

    return labels.join(", ");
  } catch {
    return rawValue;
  }
}

function resolveDisplayValue(
  fieldValue: RtsApplicationApiDetail["fieldValues"][number],
  fieldDef: RtsFieldDefinitionApiItem | undefined
): string {
  if (fieldValue.documentGuid) return "Attached document";
  if (fieldValue.booleanValue !== null && fieldValue.booleanValue !== undefined) {
    return fieldValue.booleanValue ? "Yes" : "No";
  }
  if (fieldValue.dateValue) {
    const parsed = new Date(fieldValue.dateValue);
    return Number.isNaN(parsed.getTime()) ? fieldValue.dateValue : parsed.toLocaleDateString();
  }
  if (fieldValue.numberValue !== null && fieldValue.numberValue !== undefined) {
    return String(fieldValue.numberValue);
  }
  if (fieldValue.textValue) {
    const fieldType = fieldDef?.fieldType?.toLowerCase();
    if (fieldType === "select" || fieldType === "radio" || fieldType === "checkbox") {
      return parseOptionLabel(fieldDef?.optionsJson ?? null, fieldValue.textValue);
    }
    return fieldValue.textValue;
  }
  return "—";
}

/**
 * Joins RTS.FieldValue rows (an application's submitted answers) against
 * RTS.FieldDefinition (the service's field schema) for a read-only display,
 * grouped by FieldDefinition.fieldGroup and ordered by displayOrder.
 */
export function buildApplicationAnswerGroups(
  fieldDefinitions: RtsFieldDefinitionApiItem[],
  fieldValues: RtsApplicationApiDetail["fieldValues"]
): ApplicationAnswerGroup[] {
  const defsById = new Map<number, RtsFieldDefinitionApiItem>();
  for (const def of fieldDefinitions) defsById.set(def.id, def);

  const groupMap = new Map<string, ApplicationAnswerGroup>();

  const sortedValues = [...fieldValues].sort((a, b) => {
    const defA = defsById.get(a.fieldDefinitionId);
    const defB = defsById.get(b.fieldDefinitionId);
    return (defA?.displayOrder ?? 0) - (defB?.displayOrder ?? 0);
  });

  for (const value of sortedValues) {
    const fieldDef = defsById.get(value.fieldDefinitionId);
    const groupTitle = fieldDef?.fieldGroup?.trim() || "General";

    if (!groupMap.has(groupTitle)) {
      groupMap.set(groupTitle, { groupTitle, answers: [] });
    }

    groupMap.get(groupTitle)!.answers.push({
      fieldDefinitionId: value.fieldDefinitionId,
      fieldCode: fieldDef?.fieldCode ?? String(value.fieldDefinitionId),
      label: fieldDef?.fieldLabel ?? fieldDef?.fieldCode ?? `Field ${value.fieldDefinitionId}`,
      fieldType: fieldDef?.fieldType ?? "text",
      displayValue: resolveDisplayValue(value, fieldDef),
      documentGuid: value.documentGuid,
      displayOrder: fieldDef?.displayOrder ?? 0,
    });
  }

  return [...groupMap.values()];
}
