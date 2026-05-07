import { ModuleMaster } from "@/types/home/module-master.types";
import { ApiError } from "@/lib/utils/api";
import { parseBoolean } from "@/lib/utils/type-guards";

/**
 * Type guard for ModuleMaster shape - validates ID exists (supports camel/PascalCase)
 */
export function isModuleMasterShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  
  const id = obj.id ?? obj.Id;
  const moduleCode = obj.moduleCode ?? obj.ModuleCode;

  return (
    typeof id === "number" && Number.isFinite(id) && id > 0 &&
    typeof moduleCode === "string" && moduleCode.trim().length > 0
  );
}

/**
 * Normalizes and validates a ModuleMaster object from the API
 * @throws ApiError if required fields are missing or invalid
 */
export function normalizeModuleMaster(data: Record<string, unknown>): ModuleMaster {
  const rawId = data.id ?? data.Id;
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(500, "Invalid module ID", `Received id: ${rawId}`);
  }

  const moduleCode = String((data.moduleCode ?? data.ModuleCode ?? "")).trim();
  if (!moduleCode) {
    throw new ApiError(500, "Missing moduleCode", "Module record must have a code");
  }

  const moduleName = String((data.moduleName ?? data.ModuleName ?? "")).trim();
  const departmentName = String((data.departmentName ?? data.DepartmentName ?? "")).trim();

  return {
    id,
    departmentId: Number(data.departmentId ?? data.DepartmentId) || 0,
    moduleCode,
    moduleName,
    moduleNameLocal: String((data.moduleNameLocal ?? data.ModuleNameLocal ?? moduleName)).trim(),
    moduleIcon: String((data.moduleIcon ?? data.ModuleIcon ?? moduleCode)).trim(),
    moduleLabel: String((data.moduleLabel ?? data.ModuleLabel ?? moduleName)).trim(),
    moduleDescription: String((data.moduleDescription ?? data.ModuleDescription ?? "")).trim(),
    departmentName,
    isActive: parseBoolean(data.isActive ?? data.IsActive),
    createdDate: (data.createdDate ?? data.CreatedDate) ? String(data.createdDate ?? data.CreatedDate) : null,
    updatedDate: (data.updatedDate ?? data.UpdatedDate) ? String(data.updatedDate ?? data.UpdatedDate) : null,
  };
}
