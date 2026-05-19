/**
 * Floor Submission Zod Schema
 * 
 * Provides type-safe validation for floor submission payloads
 * Replaces manual validation with declarative schema
 * 
 * @module floor-submission-schema
 */

import { z } from 'zod';

/**
 * Returns keys that can be translated in the UI layer
 */

export const offsetSchema = z.object({
    isActive: z.boolean().default(true),
    lengthMtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    widthMtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    heightMtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    areaSqMtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    shape: z.string().min(1, { message: 'offset.validation.shapeRequired' }).default('Rectangle'),
    base1Mtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    base2Mtr: z.number().nonnegative({ message: 'offset.validation.nonnegative' }).default(0),
    operation: z.string().min(1, { message: 'offset.validation.operationRequired' }).default('subtract'),
});

export const roomSchema = z.object({
    isActive: z.boolean().default(true),
    roomNo: z.string().min(1, { message: 'roomSubmission.validation.roomNoRequired' }),
    roomType: z.string().min(1, { message: 'roomSubmission.validation.roomTypeRequired' }),
    lengthMtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    widthMtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    heightMtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    areaSqMtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    shape: z.string().min(1, { message: 'roomSubmission.validation.shapeRequired' }).default('Rectangle'),
    base1Mtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    base2Mtr: z.number().nonnegative({ message: 'roomSubmission.validation.nonnegative' }).default(0),
    roomWiseMinusData: z.array(offsetSchema).optional().default([]),
    submissionType: z.string().default('Room'),
});

export const floorSubmissionSchema = z.object({
    isActive: z.boolean().default(true),
    propertyId: z.number()
        .positive('floor.errors.propertyIdRequired'),
    propertyDetailsId: z.number()
        .nonnegative().default(0),
    floorId: z.number()
        .positive('floor.errors.floorRequired'),
    floorDescription: z.string()
        .transform(val => val.trim())
        .pipe(z.string().min(1, 'floor.errors.floorDescriptionRequired')),
    subFloorId: z.number()
        .nonnegative().default(0),
    subFloorDescription: z.string().default(''),
    constructionYear: z.string()
        .length(4, 'floor.errors.constructionYearInvalid')
        .regex(/^\d{4}$/, 'floor.errors.constructionYearInvalid')
        .refine((val) => {
            const year = parseInt(val, 10);
            const today = new Date();
            const currentFinancialStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
            return year >= 1900 && year <= currentFinancialStartYear;
        }, { message: 'floor.errors.constructionYearInvalid' }),
    assessmentYear: z.string()
        .length(4, 'floor.errors.assessmentYearInvalid')
        .regex(/^\d{4}$/, 'floor.errors.assessmentYearInvalid')
        .refine((val) => {
            const year = parseInt(val, 10);
            const today = new Date();
            const currentFinancialStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
            return year >= 1900 && year <= currentFinancialStartYear;
        }, { message: 'floor.errors.assessmentYearInvalid' }),
    constructionTypeId: z.number()
        .positive('floor.errors.constructionTypeRequired'),
    constructionTypeDescription: z.string()
        .transform(val => val.trim())
        .pipe(z.string().min(1, 'floor.errors.constructionTypeRequired')),
    typeOfUseId: z.number()
        .positive('floor.errors.typeOfUseRequired'),
    typeOfUseDescription: z.string()
        .transform(val => val.trim())
        .pipe(z.string().min(1, 'floor.errors.typeOfUseRequired')),
    subTypeOfUseId: z.number()
        .nonnegative().default(0),
    subTypeOfUseDescription: z.string().default(''),
    carpetAreaSqFeet: z.number()
        .positive('floor.errors.carpetAreaRequired'),
    carpetAreaSqMeter: z.number()
        .nonnegative().default(0),
    builtupAreaSqMeter: z.number()
        .nonnegative().default(0),
    builtupAreaSqFeet: z.number()
        .nonnegative().default(0),
    noOfRooms: z.number()
        .int()
        .positive('floor.errors.roomCountRequired'),
    renterYesNo: z.boolean().default(false),
    renterName: z.string().default(''),
    renterNameEnglish: z.string().default(''),
    rentYearly: z.number()
        .nonnegative().default(0),
    agreementFromDate: z.string().optional().nullable(),
    agreementToDate: z.string().optional().nullable(),
    agreementDate: z.string().optional().nullable(),
    rentMonthly: z.number()
        .nonnegative().default(0),
    isTaxable: z.boolean().default(true),
    taxLiability: z.string().default(''),
    occupancyDate: z.string().optional().nullable(),
    occupancyApplyOrNot: z.boolean().default(false),
    occupancyNumber: z.string().default(''),
    nonCalculateRentMonthly: z.number()
        .nonnegative().default(0),
    renterDetails: z.array(z.unknown()).optional().default([]),
    renterMast: z.array(z.unknown()).optional().default([]),
    roomWiseSubmissionDetails: z.array(roomSchema).optional().default([]),
    createdBy: z.number().optional(),
    updatedBy: z.number().optional(),
}).refine((data) => {
    const conYear = parseInt(data.constructionYear, 10);
    const asstYear = parseInt(data.assessmentYear, 10);
    if (isNaN(conYear) || isNaN(asstYear)) return true;
    return asstYear >= conYear;
}, {
    message: 'floor.asstYrError',
    path: ['assessmentYear'],
});

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
