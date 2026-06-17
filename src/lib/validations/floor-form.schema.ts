/**
 * Floor Form Zod Schema
 * 
 * Provides validation for the client-side floor submission form.
 * Uses human-readable error messages for immediate UI feedback.
 */

import { z } from 'zod';

const currentFinancialStartYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;

/**
 * Validates that a dropdown value is not empty and is not a placeholder string
 * across English, Hindi, and Marathi locales.
 */
export const isValidDropdownValue = (val: unknown): boolean => {
  if (val === null || val === undefined) return false;
  const trimmed = String(val).trim();
  if (trimmed.length === 0) return false;

  const lower = trimmed.toLowerCase();

  // Reject strings containing common select/placeholder keywords in English
  if (
    lower.includes('select') ||
    lower.includes('choose') ||
    lower.includes('first')
  ) {
    return false;
  }

  // Reject Marathi placeholders (containing "निवडा")
  if (trimmed.includes('निवडा')) {
    return false;
  }

  // Reject Hindi placeholders (containing "चुनें")
  if (trimmed.includes('चुनें')) {
    return false;
  }

  return true;
};

export const floorFormSchema = z.object({
  // Identity fields
  id: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),
  isAddingNewFloor: z.boolean().optional(),

  // Basic info - required fields
  floor: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0 && isValidDropdownValue(val), 'Floor is required'),
  floorId: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  subFloor: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  subFloorId: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  // Year validation with consistent rules
  conYr: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0, 'Construction year is required')
    .refine(val => /^\d*$/.test(val), 'Construction year must contain only numbers')
    .refine(val => val.length === 4, 'Construction year must be exactly 4 digits')
    .refine((val) => {
      const year = parseInt(val, 10);
      return year >= 1700 && year <= currentFinancialStartYear;
    }, {
      message: `Construction year must be between 1700 and the current financial year (${currentFinancialStartYear})`
    }),

  asstYr: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0, 'Assessment year is required')
    .refine(val => /^\d*$/.test(val), 'Assessment year must contain only numbers')
    .refine(val => val.length === 4, 'Assessment year must be exactly 4 digits')
    .refine((val) => {
      const year = parseInt(val, 10);
      return year >= 1700 && year <= currentFinancialStartYear;
    }, {
      message: `Assessment year must be between 1700 and the current financial year (${currentFinancialStartYear})`
    }),

  // Construction and usage - required
  conTyp: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0 && isValidDropdownValue(val), 'Construction type is required'),
  constructionTypeId: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  use: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0 && isValidDropdownValue(val), 'Type of use is required'),
  typeOfUseId: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  subTyp: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  subTypeOfUseId: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),

  // Descriptions (auto-populated from lookups)
  floorDescription: z.union([z.string(), z.null(), z.undefined()]).optional(),
  subFloorDescription: z.union([z.string(), z.null(), z.undefined()]).optional(),
  constructionTypeDescription: z.union([z.string(), z.null(), z.undefined()]).optional(),
  typeOfUseDescription: z.union([z.string(), z.null(), z.undefined()]).optional(),
  subTypeOfUseDescription: z.union([z.string(), z.null(), z.undefined()]).optional(),

  // Room and area validation
  rooms: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0, 'Number of rooms is required')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0;
    }, 'Number of rooms must be a positive number'),

  areaSqFt: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .refine(val => val.length > 0, 'Carpet area is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Carpet area must be a positive number'),

  areaSqM: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  builtupAreaSqFt: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  builtupAreaSqM: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),

  // Renter information
  renter: z.union([z.string(), z.boolean(), z.null(), z.undefined()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('No'),

  renterName: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  renterNameEnglish: z.union([z.string(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  rentMonthly: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  rentYearly: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),

  // Dates
  agreementFromDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),
  agreementToDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),
  agreementDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),

  // Tax information
  isTaxable: z.union([z.string(), z.boolean(), z.null(), z.undefined()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('Yes'),

  taxLiability: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),

  // Occupancy
  occupancyDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),
  occupancyApplyOrNot: z.union([z.string(), z.boolean(), z.null(), z.undefined()])
    .transform(val => val === 'Yes' || val === true ? 'Yes' : 'No')
    .default('No'),
  occupancyNumber: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => String(val ?? '').trim())
    .default(''),
  nonCalculateRentMonthly: z.union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(val => Number(val ?? 0))
    .default(0),

  renterDetails: z.union([z.array(z.unknown()), z.null(), z.undefined()])
    .transform(val => val ?? [])
    .default([]),
  renterMast: z.union([z.array(z.unknown()), z.null(), z.undefined()])
    .transform(val => val ?? [])
    .default([]),
  roomData: z.union([z.array(z.unknown()), z.null(), z.undefined()])
    .transform(val => val ?? [])
    .default([]),
}).refine((data) => {
  if (!data.conYr || !data.asstYr) return true;
  const conYear = parseInt(data.conYr, 10);
  const asstYear = parseInt(data.asstYr, 10);
  if (isNaN(conYear) || isNaN(asstYear)) return true;
  return asstYear >= conYear;
}, {
  message: 'Assessment year cannot be less than construction year',
  path: ['asstYr'],
});

export type FloorFormData = z.infer<typeof floorFormSchema>;
