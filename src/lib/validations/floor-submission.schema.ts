/**
 * Floor Submission Zod Schema
 * 
 * Provides type-safe validation for floor submission payloads
 * Replaces manual validation with declarative schema
 * 
 * @module floor-submission-schema
 */

import { z } from 'zod';
import { checkIsUtilityCategory } from '@/lib/utils/floorSubmission/floor-utility-checks';

/**
 * Returns keys that can be translated in the UI layer
 */

export const offsetSchema = z.object({
    isActive: z.boolean().default(true),
    lengthMtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    widthMtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    heightMtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    areaSqMtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    shape: z.string().min(1, { message: 'offset.validation.shapeRequired' }).default('Rectangle'),
    base1Mtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    base2Mtr: z.coerce.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    operation: z.string().min(1, { message: 'offset.validation.operationRequired' }).default('subtract'),
});

export const roomSchema = z.object({
    isActive: z.boolean().default(true),
    propertyDetailsId: z.coerce.number().optional(),
    propertyId: z.coerce.number().optional(),
    roomNo: z.string().min(1, { message: 'roomSubmission.validation.roomNoRequired' }),
    roomType: z.string().min(1, { message: 'roomSubmission.validation.roomTypeRequired' }),
    lengthMtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    widthMtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    heightMtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    areaSqMtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    shape: z.string().min(1, { message: 'roomSubmission.validation.shapeRequired' }).default('Rectangle'),
    base1Mtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    base2Mtr: z.coerce.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    roomWiseMinusData: z.array(offsetSchema).optional().default([]),
    submissionType: z.string().default('Room'),
});

export const renterDetailItemSchema = z.object({
    id: z.coerce.number().optional(),
    agreementId: z.string().optional(),
    incrementFrequency: z.string().default('Yearly'),
    incrementType: z.string().default('Percentage'),
    incrementValue: z.coerce.number().default(0),
    incrementMethod: z.string().default('base'),
    durationFrom: z.string().nullable().optional(),
    durationTo: z.string().nullable().optional(),
    rentAmount: z.coerce.number().default(0),
    rentMonthly: z.coerce.number().default(0),
    increment: z.coerce.number().default(0),
    incrementStatus: z.boolean().default(true),
    isActive: z.boolean().default(true),
    // Custom-range marker fields (optional) — used to round-trip
    // multi-range custom date entries through the backend.
    customFromDate: z.string().nullable().optional(),
    customToDate: z.string().nullable().optional(),
    customIncrementType: z.string().nullable().optional(),
    customIncrementValue: z.coerce.number().nullable().optional(),
    customMethod: z.string().nullable().optional(),
});

export const renterMastItemSchema = z.object({
    id: z.coerce.number().optional(),
    finalRent: z.coerce.number().default(0),
    financialYear: z.string().default(''),
    durationFrom: z.string().nullable().optional(),
    durationTo: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    nonCalculateRentMonthly: z.number().optional().nullable(),
    taxLiability: z.string().optional().nullable(),
});

export const renterSubmissionSchema = z.object({
    propertyId: z.coerce.number().positive('floor.errors.propertyIdRequired'),
    propertyDetailsId: z.coerce.number().optional(),
    updatedBy: z.coerce.number().optional(),
    renterYesNo: z.boolean().default(true),
    renterName: z.string().optional(),
    renterNameEnglish: z.string().optional(),
    rentYearly: z.coerce.number().optional(),
    rentMonthly: z.coerce.number().optional(),
    agreementFromDate: z.string().optional().nullable(),
    agreementToDate: z.string().optional().nullable(),
    agreementDate: z.string().optional().nullable(),
    nonCalculateRentMonthly: z.number().optional().nullable(),
    taxLiability: z.string().optional().nullable(),
    renterDetails: z.array(renterDetailItemSchema).optional().default([]),
    renterMast: z.array(renterMastItemSchema).optional().default([]),
});

export const floorSubmissionSchema = z.object({
    isActive: z.boolean().default(true),
    propertyId: z.coerce.number()
        .positive('floor.errors.propertyIdRequired'),
    propertyDetailsId: z.coerce.number()
        .nonnegative().default(0),
    floorId: z.coerce.number().nullable().optional(),
    floorDescription: z.string()
        .transform(val => (val || '').trim())
        .default(''),
    subFloorId: z.coerce.number()
        .nonnegative().default(0),
    subFloorDescription: z.string().default(''),
    constructionYear: z.string().default(''),
    assessmentYear: z.string()
        .length(4, 'floor.errors.assessmentYearInvalid')
        .regex(/^\d{4}$/, 'floor.errors.assessmentYearInvalid')
        .refine((val) => {
            const year = parseInt(val, 10);
            const today = new Date();
            const currentFinancialStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
            return year >= 1700 && year <= currentFinancialStartYear;
        }, { message: 'floor.errors.assessmentYearInvalid' }),
    constructionTypeId: z.coerce.number().nullable().optional(),
    constructionTypeDescription: z.string()
        .transform(val => (val || '').trim())
        .default(''),
    typeOfUseId: z.coerce.number().nullable().optional(),
    typeOfUseCategoryId: z.coerce.number().nullable().optional(),
    typeOfUseDescription: z.string()
        .transform(val => (val || '').trim())
        .default(''),
    subTypeOfUseId: z.coerce.number()
        .nonnegative().default(0),
    subTypeOfUseDescription: z.string().default(''),
    carpetAreaSqFeet: z.coerce.number()
        .positive('floor.errors.carpetAreaRequired'),
    carpetAreaSqMeter: z.coerce.number()
        .nonnegative().default(0),
    builtupAreaSqMeter: z.coerce.number()
        .nonnegative().default(0),
    builtupAreaSqFeet: z.coerce.number()
        .nonnegative().default(0),
    noOfRooms: z.coerce.number()
        .int()
        .nonnegative().default(0),
    renterYesNo: z.boolean().default(false),
    renterName: z.string().default(''),
    renterNameEnglish: z.string().default(''),
    rentYearly: z.coerce.number()
        .nonnegative().default(0),
    agreementFromDate: z.string().optional().nullable(),
    agreementToDate: z.string().optional().nullable(),
    agreementDate: z.string().optional().nullable(),
    rentMonthly: z.coerce.number()
        .nonnegative().default(0),
    isTaxable: z.boolean().default(true),
    taxLiability: z.string().default(''),
    occupancyDate: z.string().optional().nullable(),
    occupancyApplyOrNot: z.boolean().default(false),
    occupancyNumber: z.string().default(''),
    nonCalculateRentMonthly: z.coerce.number()
        .nonnegative().default(0),
    renterDetails: z.array(renterDetailItemSchema).optional().default([]),
    renterMast: z.array(renterMastItemSchema).optional().default([]),
    roomWiseSubmissionDetails: z.array(roomSchema).optional().default([]),
    createdBy: z.coerce.number().optional(),
    updatedBy: z.coerce.number().optional(),
    selectedFloorType: z.enum(['Construction', 'OpenPlot']).optional(),
    length: z.union([z.string(), z.number()]).optional().nullable(),
    width: z.union([z.string(), z.number()]).optional().nullable(),
    isOpenPlot: z.boolean().default(false),
}).superRefine((data, ctx) => {
    // If it's an OpenPlot or isOpenPlot is true, bypass construction/floor fields validation
    if (data.selectedFloorType !== 'OpenPlot' && !data.isOpenPlot) {
        // Enforce floorId
        if (!data.floorId || data.floorId <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.floorRequired',
                path: ['floorId']
            });
        }
        
        // Enforce floorDescription
        if (!data.floorDescription || data.floorDescription.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.floorDescriptionRequired',
                path: ['floorDescription']
            });
        }

        // Enforce constructionYear
        const conYr = data.constructionYear;
        if (!conYr || conYr.length !== 4 || !/^\d{4}$/.test(conYr)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.constructionYearInvalid',
                path: ['constructionYear']
            });
        } else {
            const year = parseInt(conYr, 10);
            const today = new Date();
            const currentFinancialStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
            if (year < 1700 || year > currentFinancialStartYear) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'floor.errors.constructionYearInvalid',
                    path: ['constructionYear']
                });
            }
        }

        // Enforce constructionTypeId
        if (!data.constructionTypeId || data.constructionTypeId <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.constructionTypeRequired',
                path: ['constructionTypeId']
            });
        }

        // Enforce constructionTypeDescription
        if (!data.constructionTypeDescription || data.constructionTypeDescription.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.constructionTypeRequired',
                path: ['constructionTypeDescription']
            });
        }

        // Enforce typeOfUseId
        if (!data.typeOfUseId || data.typeOfUseId <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.typeOfUseRequired',
                path: ['typeOfUseId']
            });
        }

        // Enforce typeOfUseDescription
        if (!data.typeOfUseDescription || data.typeOfUseDescription.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.typeOfUseRequired',
                path: ['typeOfUseDescription']
            });
        }

        // Enforce noOfRooms
        const isUtility = checkIsUtilityCategory(data.typeOfUseCategoryId);
        if (!isUtility && (data.noOfRooms === undefined || data.noOfRooms <= 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.roomCountRequired',
                path: ['noOfRooms']
            });
        }
    }

    if (data.selectedFloorType === 'OpenPlot' || data.isOpenPlot) {
        const len = parseFloat(String(data.length));
        const wid = parseFloat(String(data.width));
        if (data.length !== undefined && data.length !== null && data.length !== '') {
            if (isNaN(len) || len <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'floor.errors.lengthRequired',
                    path: ['length']
                });
            }
        }
        if (data.width !== undefined && data.width !== null && data.width !== '') {
            if (isNaN(wid) || wid <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'floor.errors.widthRequired',
                    path: ['width']
                });
            }
        }
        if (!data.constructionTypeId || data.constructionTypeId <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.openPlotConstructionTypeNotFound',
                path: ['constructionTypeId']
            });
        }
    } else {
        // If isOpenPlot = false, Open Space-specific fields should not contain unnecessary data
        if (data.length !== undefined && data.length !== null && data.length !== "" && parseFloat(String(data.length)) !== 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.unnecessaryLength',
                path: ['length']
            });
        }
        if (data.width !== undefined && data.width !== null && data.width !== "" && parseFloat(String(data.width)) !== 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.errors.unnecessaryWidth',
                path: ['width']
            });
        }
    }

    // If it's an update, skip *cross-field* validation (e.g., constructionYear vs assessmentYear) to allow existing database values
    const rawDetailsId = Number(data.propertyDetailsId || (data as Record<string, unknown>).id || 0);
    if (rawDetailsId > 0) return;
    // Only validate constructionYear vs assessmentYear if in Construction mode
    if (data.selectedFloorType !== 'OpenPlot' && !data.isOpenPlot && data.constructionYear && data.assessmentYear) {
        const conYear = parseInt(data.constructionYear, 10);
        const asstYear = parseInt(data.assessmentYear, 10);
        if (!isNaN(conYear) && !isNaN(asstYear) && asstYear < conYear) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'floor.asstYrError',
                path: ['assessmentYear'],
            });
        }
    }
}).transform(data => ({
    ...data,
    propertyDetailsId: data.propertyDetailsId ?? (data as Record<string, unknown>).id
}));

export type FloorSubmissionSchemaType = z.infer<typeof floorSubmissionSchema>;

/**
 * Validation function that returns translation keys
 * 
 * @param payload - Floor submission payload to validate
 * @returns Object with success flag and error key for translation
 */
export function validateFloorSubmissionPayload(
    payload: unknown
): { success: true; data: FloorSubmissionSchemaType } | { success: false; errorKey: string } {
    try {
        const validated = floorSubmissionSchema.parse(payload);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return first error's message (translation key)
            const firstError = error.issues[0];
            return {
                success: false,
                errorKey: firstError.message || 'validation.invalidData'
            };
        }
        return { success: false, errorKey: 'validation.unexpectedError' };
    }
}

/**
 * Submission ID validation schema
 * Accepts positive numbers or numeric strings only (excluding '0')
 */
export const submissionIdSchema = z.union([
    z.number().positive(),
    z.string().regex(/^[1-9]\d*$/).transform(Number),
]);

export function validateSubmissionId(id: unknown): boolean {
    return submissionIdSchema.safeParse(id).success;
}
