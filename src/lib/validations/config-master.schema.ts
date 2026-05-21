import { z } from 'zod';
import { CODE_REGEX, TEXT_ALLOWED, isAllZeros } from '../utils/validation-rules';

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
  categoryCode: z.string()
    .trim()
    .min(1, 'Category code is required')
    .max(20, 'Category code is too long')
    .regex(CODE_REGEX, 'Category code can only contain alphanumeric characters and underscores')
    .refine(val => !isAllZeros(val), 'Category code cannot be all zeros'),
  categoryName: z.string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name is too long')
    .regex(TEXT_ALLOWED, 'Category name contains invalid characters'),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdBy: z.number().optional(),
});

export const UpdateConfigCategorySchema = CreateConfigCategorySchema.extend({
  updatedBy: z.number().optional(),
}).omit({ createdBy: true });

/**
 * Config Key Schemas
 */
export const CreateConfigKeySchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  configCode: z.string()
    .trim()
    .min(1, 'Config code is required')
    .max(50, 'Config code is too long')
    .regex(CODE_REGEX, 'Config code can only contain alphanumeric characters and underscores')
    .refine(val => !isAllZeros(val), 'Config code cannot be all zeros'),
  configName: z.string()
    .trim()
    .min(1, 'Config name is required')
    .max(100, 'Config name is too long')
    .regex(TEXT_ALLOWED, 'Config name contains invalid characters'),
  description: z.string().nullish().transform(val => val?.trim() || '').pipe(z.string().max(255, 'Description is too long')),
  dataType: z.string().trim().min(1, 'Data type is required'),
  controlType: z.string().trim().min(1, 'Control type is required'),
  defaultValue: z.string().nullish().transform(val => val?.trim() || '').pipe(z.string().max(100, 'Default value is too long')),
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
