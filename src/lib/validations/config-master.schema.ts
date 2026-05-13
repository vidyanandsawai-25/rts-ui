import { z } from 'zod';

/**
 * Shared audit fields
 */
export const AuditSchema = z.object({
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
});

/**
 * Config Category Schemas
 */
export const CreateConfigCategorySchema = z.object({
  categoryCode: z.string().trim().min(1, 'Category code is required'),
  categoryName: z.string().trim().min(1, 'Category name is required'),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdBy: z.number().optional(),
});

export const UpdateConfigCategorySchema = z.object({
  categoryCode: z.string().trim().min(1, 'Category code is required'),
  categoryName: z.string().trim().min(1, 'Category name is required'),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  updatedBy: z.number().optional(),
});

/**
 * Config Key Schemas
 */
export const CreateConfigKeySchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  configCode: z.string().trim().min(1, 'Config code is required'),
  configName: z.string().trim().min(1, 'Config name is required'),
  description: z.string().nullish().transform(val => val?.trim() || ''),
  dataType: z.string().trim().min(1, 'Data type is required'),
  controlType: z.string().trim().min(1, 'Control type is required'),
  defaultValue: z.string().nullish().transform(val => val?.trim() || ''),
  isActive: z.boolean().default(true),
  createdBy: z.number().optional(),
});

export const UpdateConfigKeySchema = CreateConfigKeySchema.extend({
  updatedBy: z.number().optional(),
}).omit({ createdBy: true });

/**
 * Config Value / Department Update Schemas
 */
export const CreateConfigValueSchema = z.object({
  configKeyId: z.coerce.number().int().positive('Configuration key is required'),
  // Use preprocess to handle empty strings and convert to null for optional fields
  departmentId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? null : Number(val),
    z.number().int().positive().nullable()
  ),
  moduleId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? null : Number(val),
    z.number().int().positive().nullable()
  ),
  value: z.string().trim().min(1, 'Value is required').max(5000, 'Value is too long'),
  // Use transform instead of coerce for boolean to handle 'false' string correctly
  isEnabled: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(true)
  ),
});

export const UpdateConfigValueSchema = CreateConfigValueSchema.extend({
  configValueId: z.number().int().positive(),
}).partial({
  configKeyId: true,
});

export const DepartmentUpdateItemSchema = z.object({
  departmentId: z.number().int().positive(),
  moduleId: z.number().int().nullable().optional(),
  isEnabled: z.boolean(),
  configValueId: z.number().int().nonnegative(),
  value: z.string(),
});

export const SaveDepartmentConfigurationSchema = z.object({
  configKeyId: z.number().int().positive(),
  updates: z.array(DepartmentUpdateItemSchema),
});

export * from './config-master-normalization.schema';

/**
 * Module (Submodule) Mutation Schemas
 */
export const CreateModuleMasterSchema = z.object({
  departmentId: z.number().int().positive(),
  moduleCode: z.string().trim().min(1, 'Module code is required'),
  moduleName: z.string().trim().min(1, 'Module name is required'),
  moduleNameLocal: z.string().trim().nullable().optional(),
  moduleIcon: z.string().trim().nullable().optional(),
  moduleLabel: z.string().trim().nullable().optional(),
  moduleDescription: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const UpdateModuleMasterSchema = CreateModuleMasterSchema.extend({
  // Add update specific fields if any
});
