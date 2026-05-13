import { z } from 'zod';

/**
 * API Response Schemas (for Normalization)
 */
export const ConfigCategoryResponseSchema = z.preprocess((data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const d = data as Record<string, unknown>;
  return {
    ...d,
    categoryId: d.configCategoryId ?? d.ConfigCategoryId ?? d.categoryId ?? d.CategoryId ?? d.id ?? d.Id,
    id: String(d.configCategoryId ?? d.ConfigCategoryId ?? d.categoryId ?? d.CategoryId ?? d.id ?? d.Id),
    categoryCode: d.categoryCode ?? d.CategoryCode ?? d.code ?? d.Code,
    categoryName: d.categoryName ?? d.CategoryName ?? d.name ?? d.Name,
    displayOrder: d.displayOrder ?? d.DisplayOrder,
    isActive: d.isActive ?? d.IsActive,
    isEnabled: d.isActive ?? d.IsActive,
    createdDate: d.createdDate ?? d.CreatedDate ?? '',
    updatedDate: d.updatedDate ?? d.UpdatedDate ?? null,
  }
}, z.object({
  id: z.string(),
  categoryId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  categoryCode: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  categoryName: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  displayOrder: z.coerce.number().default(0),
  isActive: z.coerce.boolean().default(true),
  isEnabled: z.coerce.boolean().default(true),
  createdDate: z.coerce.string().default(''),
  updatedDate: z.coerce.string().nullable().default(null),
}));

export const ConfigKeyResponseSchema = z.preprocess((data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const d = data as Record<string, unknown>;
  return {
    ...d,
    configKeyId: d.configKeyId ?? d.ConfigKeyId ?? d.id ?? d.Id ?? 0,
    id: String(d.configKeyId ?? d.ConfigKeyId ?? d.id ?? d.Id ?? 0),
    categoryId: d.categoryId ?? d.CategoryId ?? d.configCategoryId ?? d.ConfigCategoryId ?? 0,
    configCode: d.configCode ?? d.ConfigCode ?? d.code ?? d.Code,
    configName: d.configName ?? d.ConfigName ?? d.name ?? d.Name,
    description: d.description ?? d.Description ?? d.desc ?? '',
    dataType: d.dataType ?? d.DataType ?? d.type ?? '',
    controlType: d.controlType ?? d.ControlType ?? '',
    defaultValue: d.defaultValue ?? d.DefaultValue ?? '',
    isActive: d.isActive ?? d.IsActive,
    isEnabled: d.isActive ?? d.IsActive,
    createdDate: d.createdDate ?? d.CreatedDate ?? '',
    updatedDate: d.updatedDate ?? d.UpdatedDate ?? null,
  }
}, z.object({
  id: z.string(),
  configKeyId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  categoryId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  configCode: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  configName: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  description: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  dataType: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  controlType: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()),
  defaultValue: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  isActive: z.coerce.boolean().default(true),
  isEnabled: z.coerce.boolean().default(true),
  createdDate: z.coerce.string().default(''),
  updatedDate: z.coerce.string().nullable().default(null),
}));

export const ConfigValueResponseSchema = z.preprocess((data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const d = data as Record<string, unknown>;
  return {
    ...d,
    configValueId: d.configValueId ?? d.ConfigValueId ?? d.id ?? d.Id,
    id: String(d.configValueId ?? d.ConfigValueId ?? d.id ?? d.Id),
    configKeyId: d.configKeyId ?? d.ConfigKeyId,
    departmentId: d.departmentId ?? d.DepartmentId,
    moduleId: d.moduleId ?? d.ModuleId,
    moduleName: d.moduleName ?? d.ModuleName ?? null,
    value: d.value ?? d.Value ?? '',
    isActive: d.isActive ?? d.IsActive,
    isEnabled: d.isActive ?? d.IsActive,
    createdDate: d.createdDate ?? d.CreatedDate ?? '',
    updatedDate: d.updatedDate ?? d.UpdatedDate ?? null,
  }
}, z.object({
  id: z.string(),
  configValueId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  configKeyId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  departmentId: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }, z.number().nullable().default(null)),
  moduleId: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }, z.number().nullable().default(null)),
  value: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  isActive: z.coerce.boolean().default(true),
  isEnabled: z.coerce.boolean().default(true),
  moduleName: z.coerce.string().nullable().default(null),
  createdDate: z.coerce.string().default(''),
  updatedDate: z.coerce.string().nullable().default(null),
}));

export const ModuleMasterResponseSchema = z.preprocess((data: unknown) => {
  if (!data || typeof data !== 'object') return data;
  const d = data as Record<string, unknown>;
  return {
    ...d,
    moduleId: d.moduleId ?? d.ModuleId ?? d.id ?? d.Id,
    id: String(d.moduleId ?? d.ModuleId ?? d.id ?? d.Id),
    departmentId: d.departmentId ?? d.DepartmentId,
    moduleCode: d.moduleCode ?? d.ModuleCode,
    moduleName: d.moduleName ?? d.ModuleName,
    moduleNameLocal: d.moduleNameLocal ?? d.ModuleNameLocal ?? '',
    moduleIcon: d.moduleIcon ?? d.ModuleIcon ?? '',
    moduleLabel: d.moduleLabel ?? d.ModuleLabel ?? '',
    moduleDescription: d.moduleDescription ?? d.ModuleDescription ?? '',
    departmentName: d.departmentName ?? d.DepartmentName ?? '',
    isActive: d.isActive ?? d.IsActive,
    isEnabled: d.isActive ?? d.IsActive,
  }
}, z.object({
  id: z.string(),
  moduleId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  departmentId: z.preprocess((val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number()),
  moduleCode: z.coerce.string(),
  moduleName: z.coerce.string(),
  moduleNameLocal: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  moduleIcon: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  moduleLabel: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  moduleDescription: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  departmentName: z.preprocess((val) => (val === null || val === undefined ? '' : val), z.coerce.string()).default(''),
  isActive: z.coerce.boolean().default(true),
  isEnabled: z.coerce.boolean().default(true),
}));
