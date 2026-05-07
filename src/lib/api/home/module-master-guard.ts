import { ModuleMaster } from "@/types/home/module-master.types";
import { ApiError } from "@/lib/utils/api";
import { parseBoolean } from "@/lib/utils/type-guards";

/**
 * Type guard for ModuleMaster shape - validates ID exists
 */
export function isModuleMasterShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    "id" in obj && typeof obj.id === "number" && Number.isFinite(obj.id) && obj.id > 0 &&
    "moduleCode" in obj && typeof obj.moduleCode === "string" && obj.moduleCode.trim().length > 0
  );
}

/**
 * Normalizes and validates a ModuleMaster object from the API
 * @throws ApiError if required fields are missing or invalid
 */
export function normalizeModuleMaster(data: Record<string, unknown>): ModuleMaster {
  const id = Number(data.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(500, "Invalid module ID", `Received id: ${data.id}`);
  }

  const moduleCode = String(data.moduleCode ?? "").trim();
  if (!moduleCode) {
    throw new ApiError(500, "Missing moduleCode", "Module record must have a code");
  }

  const moduleName = String(data.moduleName ?? "").trim();
  const departmentName = String(data.departmentName ?? "").trim();

  return {
    id,
    departmentId: Number(data.departmentId) || 0,
    moduleCode,
    moduleName,
    moduleNameLocal: String(data.moduleNameLocal ?? moduleName).trim(),
    moduleIcon: String(data.moduleIcon ?? moduleCode).trim(),
    moduleLabel: String(data.moduleLabel ?? moduleName).trim(),
    moduleDescription: String(data.moduleDescription ?? "").trim(),
    departmentName,
    isActive: parseBoolean(data.isActive),
    createdDate: data.createdDate ? String(data.createdDate) : null,
    updatedDate: data.updatedDate ? String(data.updatedDate) : null,
  };
}
