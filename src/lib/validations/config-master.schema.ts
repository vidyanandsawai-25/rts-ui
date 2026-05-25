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
    .min(3, 'Category code must be at least 3 characters')
    .max(20, 'Category code is too long')
    .regex(CODE_REGEX, 'Category code can only contain alphanumeric characters and underscores')
    .refine(val => !isAllZeros(val), 'Category code cannot be all zeros'),
  categoryName: z.string()
    .trim()
    .min(3, 'Category name must be at least 3 characters')
    .max(100, 'Category name is too long')
    .regex(TEXT_ALLOWED, 'Category name contains invalid characters'),
  displayOrder: z.number().int('Display order must be an integer').min(0, 'Display order cannot be negative').max(99999, 'Display order cannot exceed 99999').default(0),
  isActive: z.boolean().default(true),
  createdBy: z.number().optional(),
});

export const UpdateConfigCategorySchema = CreateConfigCategorySchema.extend({
  updatedBy: z.number().optional(),
}).omit({ createdBy: true });

/**
 * Config Key Schemas
 */
export const ConfigKeyBaseSchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  configCode: z.string()
    .trim()
    .min(3, 'Config code must be at least 3 characters')
    .max(50, 'Config code is too long')
    .regex(CODE_REGEX, 'Config code can only contain alphanumeric characters and underscores')
    .refine(val => !isAllZeros(val), 'Config code cannot be all zeros'),
  configName: z.string()
    .trim()
    .min(3, 'Config name must be at least 3 characters')
    .max(100, 'Config name is too long')
    .regex(TEXT_ALLOWED, 'Config name contains invalid characters'),
  description: z.string().nullish().transform(val => val?.trim() || '').pipe(
    z.string()
      .max(255, 'Description is too long')
      .refine(val => !/[<>]/.test(val), 'Description cannot contain HTML tags or angle brackets')
  ),
  dataType: z.string().trim().min(1, 'Data type is required'),
  controlType: z.string().trim().min(1, 'Control type is required'),
  defaultValue: z.string().nullish().transform(val => val?.trim() || '').pipe(
    z.string()
      .max(100, 'Default value is too long')
      .refine(val => !/[<>]/.test(val), 'Default value cannot contain HTML tags or angle brackets')
  ),
  isActive: z.boolean().default(true),
});

const validateDefaultValueRefinement = (data: { dataType: string; defaultValue?: string | null }, ctx: z.RefinementCtx) => {
  const { dataType, defaultValue } = data;
  if (!defaultValue) return;

  if (dataType === 'int') {
    if (!/^-?\d+$/.test(defaultValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Default value must be a valid integer',
        path: ['defaultValue'],
      });
      return;
    }
    const parsed = parseInt(defaultValue, 10);
    if (parsed < -2147483648 || parsed > 2147483647) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Default value must be a 32-bit signed integer (-2147483648 to 2147483647)',
        path: ['defaultValue'],
      });
    }
  } else if (dataType === 'decimal') {
    if (!/^-?\d+(\.\d+)?$/.test(defaultValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Default value must be a valid decimal number',
        path: ['defaultValue'],
      });
    }
  } else if (dataType === 'boolean') {
    if (defaultValue !== 'true' && defaultValue !== 'false') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default value must be 'true' or 'false'",
        path: ['defaultValue'],
      });
    }
  } else if (dataType === 'datetime') {
    if (isNaN(Date.parse(defaultValue))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Default value must be a valid date and time',
        path: ['defaultValue'],
      });
    }
  }
};

export const CreateConfigKeySchema = ConfigKeyBaseSchema.extend({
  createdBy: z.number().optional(),
}).superRefine(validateDefaultValueRefinement);

export const UpdateConfigKeySchema = ConfigKeyBaseSchema.extend({
  updatedBy: z.number().optional(),
}).superRefine(validateDefaultValueRefinement);

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
  moduleCode: z.string()
    .trim()
    .min(3, 'Module code must be at least 3 characters')
    .max(50, 'Module code is too long')
    .regex(CODE_REGEX, 'Module code can only contain alphanumeric characters and underscores')
    .refine(val => !isAllZeros(val), 'Module code cannot be all zeros'),
  moduleName: z.string()
    .trim()
    .min(3, 'Module name must be at least 3 characters')
    .max(100, 'Module name is too long')
    .regex(TEXT_ALLOWED, 'Module name contains invalid characters'),
  moduleNameLocal: z.string().trim().nullable().optional(),
  moduleIcon: z.string().trim().nullable().optional(),
  moduleLabel: z.string().trim().nullable().optional(),
  moduleDescription: z.string().nullish().transform(val => val?.trim() || '').pipe(
    z.string()
      .max(255, 'Description is too long')
      .refine(val => !/[<>]/.test(val), 'Description cannot contain HTML tags or angle brackets')
  ),
  isActive: z.boolean().default(true),
});

export const UpdateModuleMasterSchema = CreateModuleMasterSchema.extend({
  // Add update specific fields if any
});
