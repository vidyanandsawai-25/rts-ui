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
 * Translation key schema for validation errors
 * Returns keys that can be translated in the UI layer
 */
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
        .regex(/^\d{4}$/, 'floor.errors.constructionYearInvalid'),
    assessmentYear: z.string()
        .length(4, 'floor.errors.assessmentYearInvalid')
        .regex(/^\d{4}$/, 'floor.errors.assessmentYearInvalid'),
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
    renterDetails: z.array(z.unknown()).optional(),
    renterMast: z.array(z.unknown()).optional(),
    roomWiseSubmissionDetails: z.array(z.unknown()).optional(),
    createdBy: z.number().optional(),
    updatedBy: z.number().optional(),
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
