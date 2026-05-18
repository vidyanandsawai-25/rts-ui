/**
 * Validation schema for Property ID (used in actions)
 */
export const propertyIdActionSchema = z.object({
  propertyId: z.number({ message: 'Property ID is required' }).positive('Property ID must be a positive number').finite('Property ID must be a finite number'),
});
import { z } from 'zod';

/**
 * Common field validations
 */
const wardNoSchema = z.string().min(1, { message: 'Ward number is required' });
const wardIdSchema = z.number({ message: 'Ward ID is required' });
const propertyNoSchema = z.string().min(1, { message: 'Property number is required' });
const partitionNoSchema = z.string().optional();

/**
 * Validation schema for Property Search (used in URL syncing and search bar)
 */
export const propertySearchSchema = z.object({
  wardNo: wardNoSchema,
  propertyNo: propertyNoSchema,
  partitionNo: partitionNoSchema,
  wardId: wardIdSchema.nullable().optional(),
  propertyId: z.string().nullable().optional(),
});

/**
 * Validation schema for Fetching Property Details.
 * Accepts EITHER a direct `propertyId` (bypass search) OR `wardNo + propertyNo`
 * (search-then-resolve path). This matches the service-layer branching logic.
 */
export const propertyDetailsSchema = z
  .union([
    // Path A: direct lookup by propertyId
    z.object({
      propertyId: z.number({ message: 'Property ID must be a number' }),
      wardNo: z.string().optional(),
      propertyNo: z.string().optional(),
      partitionNo: partitionNoSchema,
      wardId: wardIdSchema.optional(),
    }),
    // Path B: search by ward + property number
    z.object({
      wardNo: wardNoSchema,
      propertyNo: propertyNoSchema,
      partitionNo: partitionNoSchema,
      wardId: wardIdSchema.optional(),
      propertyId: z.number().optional(),
    }),
  ])
  .refine(
    (val) => 'propertyId' in val && val.propertyId !== undefined
      ? true
      : !!(val.wardNo && val.propertyNo),
    { message: 'Provide either a propertyId or both wardNo and propertyNo' }
  );

/**
 * Validation schema for Ward actions
 */
export const wardNoActionSchema = z.object({
  wardNo: wardNoSchema,
});

export const wardIdActionSchema = z.object({
  wardId: wardIdSchema,
});

/**
 * Validation schema for Search suggestions
 */
export const searchSuggestionsSchema = z.object({
  wardNo: z.string().optional(),
  wardId: z.number().optional(),
  propertyNo: z.string().optional(),
  searchText: z.string().optional(),
});

export type PropertySearchSchema = z.infer<typeof propertySearchSchema>;
