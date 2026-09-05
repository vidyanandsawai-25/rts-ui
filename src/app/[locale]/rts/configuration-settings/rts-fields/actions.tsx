"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { locales } from "@/i18n/config";
import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";
import {
  createRtsFieldDefinition,
  deleteRtsFieldDefinition,
  getAllRtsFieldDefinitions,
  updateRtsFieldDefinition,
} from "@/lib/api/rts/rtsfielddefinition.service";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

type ConfigField = {
  id: string;
  departmentId: string;
  serviceId: string;
  fieldCode: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup: string;
  optionsJson: string;
  isRequired: boolean;
  displayOrder: number;
  validationRules: string;
  defaultValue: string;
  minValue: number | null;
  maxValue: number | null;
  maxLength: number | null;
  isActive: boolean;
};

type ConfigDepartment = {
  id: string;
  name: string;
  nameLocal?: string | null;
};

type ConfigService = {
  id: string;
  name: string;
  nameLocal?: string | null;
  departmentId: string;
};

type FieldPayload = {
  departmentId: string;
  serviceId: string;
  fieldCode: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup?: string;
  optionsJson?: string;
  isRequired?: boolean;
  displayOrder?: number;
  validationRules?: string;
  defaultValue?: string;
  minValue?: number | null;
  maxValue?: number | null;
  maxLength?: number | null;
  isActive: boolean;
};

function toConfigDepartment(department: {
  id: number;
  departmentName: string;
  departmentNameLocal?: string | null;
}): ConfigDepartment {
  return {
    id: String(department.id),
    name: department.departmentName,
    nameLocal: department.departmentNameLocal ?? null,
  };
}

function toConfigService(service: {
  id: number;
  serviceName: string;
  serviceNameLocal?: string | null;
  departmentId: number;
}): ConfigService {
  return {
    id: String(service.id),
    name: service.serviceName,
    nameLocal: service.serviceNameLocal ?? null,
    departmentId: String(service.departmentId),
  };
}

function toConfigField(field: {
  id: number;
  departmentId: number;
  serviceId: number;
  fieldCode: string;
  fieldLabel: string;
  fieldType: string;
  fieldGroup: string | null;
  optionsJson: string | null;
  isRequired: boolean;
  displayOrder: number;
  validationRules: string | null;
  defaultValue: string | number | boolean | null;
  minValue: number | null;
  maxValue: number | null;
  maxLength: number | null;
  isActive: boolean;
}): ConfigField {
  return {
    id: String(field.id),
    departmentId: String(field.departmentId),
    serviceId: String(field.serviceId),
    fieldCode: field.fieldCode,
    fieldName: field.fieldCode,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    fieldGroup: field.fieldGroup ?? "",
    optionsJson: field.optionsJson ?? "",
    isRequired: field.isRequired,
    displayOrder: field.displayOrder,
    validationRules: field.validationRules ?? "",
    defaultValue: field.defaultValue == null ? "" : String(field.defaultValue),
    minValue: field.minValue,
    maxValue: field.maxValue,
    maxLength: field.maxLength,
    isActive: field.isActive,
  };
}

function revalidateFieldConfigPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-fields`, "page");
    revalidatePath(`/${locale}/rts/fields`, "page");
  }
}

function parseRequiredId(raw: string): number {
  const value = parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid RTS id");
  }
  return value;
}

function buildFieldRequestPayload(field: FieldPayload, userId?: number) {
  return {
    departmentId: parseRequiredId(field.departmentId),
    serviceId: parseRequiredId(field.serviceId),
    fieldCode: field.fieldCode,
    fieldLabel: field.fieldLabel,
    fieldType: field.fieldType,
    fieldGroup: field.fieldGroup || undefined,
    optionsJson: field.optionsJson || undefined,
    isRequired: field.isRequired ?? false,
    displayOrder: field.displayOrder ?? 1,
    validationRules: field.validationRules || undefined,
    defaultValue: field.defaultValue || undefined,
    minValue: field.minValue ?? undefined,
    maxValue: field.maxValue ?? undefined,
    maxLength: field.maxLength ?? undefined,
    isActive: field.isActive,
    ...(userId ? { createdBy: userId, updatedBy: userId } : {}),
  };
}

export async function getRtsFieldConfigData() {
  const [fields, departments, services] = await Promise.all([
    getAllRtsFieldDefinitions(),
    getAllRtsDepartments(),
    getAllRtsServices(),
  ]);

  return {
    fields: fields.map(toConfigField),
    departments: departments.map(toConfigDepartment),
    services: services.map(toConfigService),
  };
}

export async function saveRtsFieldConfigAction(field: FieldPayload) {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) ?? undefined;
    const payload = buildFieldRequestPayload(field, userId);

    const createdField = await createRtsFieldDefinition({
      ...payload,
      createdBy: userId,
    });

    revalidateFieldConfigPages();

    return { success: true, field: toConfigField(createdField) };
  } catch {
    return { success: false };
  }
}

export async function updateRtsFieldConfigAction(id: string, field: FieldPayload) {
  try {
    const fieldId = parseRequiredId(id);
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) ?? undefined;
    const payload = buildFieldRequestPayload(field, userId);

    const updatedField = await updateRtsFieldDefinition(fieldId, {
      id: fieldId,
      ...payload,
      updatedBy: userId,
    });

    revalidateFieldConfigPages();

    return { success: true, field: toConfigField(updatedField) };
  } catch {
    return { success: false };
  }
}

export async function deleteRtsFieldConfigAction(id: string) {
  try {
    const fieldId = parseRequiredId(id);
    await deleteRtsFieldDefinition(fieldId);

    revalidateFieldConfigPages();

    return { success: true };
  } catch {
    return { success: false };
  }
}
