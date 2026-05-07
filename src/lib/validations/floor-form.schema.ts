/**
 * Floor Form Zod Schema
 * 
 * Provides validation for the client-side floor submission form.
 * Uses human-readable error messages for immediate UI feedback.
 */

import { z } from 'zod';

export const floorFormSchema = z.object({
  // Identity fields
  id: z.union([z.string(), z.number()]).optional(),

  // Basic info - required fields
  floor: z.string()
    .transform(val => val.trim())
    .pipe(z.string().min(1, 'Floor is required')),
  floorId: z.union([z.string(), z.number()]).optional(),

  subFloor: z.string()
    .default('')
    .transform(val => val.trim()),
  subFloorId: z.union([z.string(), z.number()]).optional(),

  // Year validation with consistent rules
  conYr: z.string()
    .length(4, 'Construction year must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Construction year must contain only numbers')
    .refine((val) => {
      const year = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 10;
    }, `Year must be between 1900 and ${new Date().getFullYear() + 10}`),

  asstYr: z.string()
    .length(4, 'Assessment year must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Assessment year must contain only numbers')
    .refine((val) => {
      const year = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 10;
    }, `Year must be between 1900 and ${new Date().getFullYear() + 10}`),

  // Construction and usage - required
  conTyp: z.string()
    .min(1, 'Construction type is required'),
  constructionTypeId: z.union([z.string(), z.number()]).optional(),

  use: z.string()
    .min(1, 'Type of use is required'),
  typeOfUseId: z.union([z.string(), z.number()]).optional(),

  subTyp: z.string().default(''),
  subTypeOfUseId: z.union([z.string(), z.number()]).optional(),

  // Descriptions (auto-populated from lookups)
  floorDescription: z.string().optional(),
  subFloorDescription: z.string().optional(),
  constructionTypeDescription: z.string().optional(),
  typeOfUseDescription: z.string().optional(),
  subTypeOfUseDescription: z.string().optional(),

  // Room and area validation
  rooms: z.string()
    .min(1, 'Number of rooms is required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0;
    }, 'Number of rooms must be a positive number'),

  areaSqFt: z.string()
    .min(1, 'Carpet area is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Carpet area must be a positive number'),

  areaSqM: z.string().default(''),
  builtupAreaSqFt: z.string().default(''),
  builtupAreaSqM: z.string().default(''),

  // Renter information
  renter: z.union([z.string(), z.boolean()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('No'),

  renterName: z.string().default(''),
  renterNameEnglish: z.string().default(''),
  rentMonthly: z.string().default(''),
  rentYearly: z.string().default(''),

  // Dates
  agreementFromDate: z.union([z.string(), z.null()]).optional().nullable(),
  agreementToDate: z.union([z.string(), z.null()]).optional().nullable(),
  agreementDate: z.union([z.string(), z.null()]).optional().nullable(),

  // Tax information
  isTaxable: z.union([z.string(), z.boolean()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('Yes'),

  taxLiability: z.string().default(''),

  // Occupancy
  occupancyDate: z.union([z.string(), z.null()]).optional().nullable(),
  occupancyApplyOrNot: z.union([z.string(), z.boolean()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('No'),
  occupancyNumber: z.string().default(''),
  nonCalculateRentMonthly: z.number().default(0),

  // Related data
  renterDetails: z.array(z.unknown()).optional().default([]),
  renterMast: z.array(z.unknown()).optional().default([]),
  roomData: z.array(z.unknown()).optional().default([]),
});

export type FloorFormData = z.infer<typeof floorFormSchema>;
