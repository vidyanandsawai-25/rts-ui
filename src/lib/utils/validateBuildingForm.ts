import { BuildingPermissionState } from "@/types/building-permission.types";
import { validateDocumentNumber, validateDocumentDate, parseDateString } from "@/lib/validation/building/validation-rules";
import { mapTypeNameToKey } from "@/lib/utils/building-helpers";

interface IncompleteCertificate {
    id: number;
    name: string;
}

interface ValidationResult {
    isValid: boolean;
    /** Per-certificate short error string for sidebar badges (first missing field). */
    errors: Record<number, string>;
    /** Certificates that have at least one missing required field. */
    incompleteCertificates: IncompleteCertificate[];
    fieldErrors?: Record<number, { number?: string; date?: string; document?: string }>;
}




interface ValidateBuildingFormOptions {
    /** When true, skips the document-required check. Used when saving
     *  is triggered internally before a file upload (pre-upload save). */
    skipDocumentValidation?: boolean;
    skipNumberDateValidation?: boolean;
    onlyCertificateTypeId?: number;
}

export const validateBuildingForm = (
    state: BuildingPermissionState,
    t: (key: string, params?: Record<string, string | number>) => string,
    options: ValidateBuildingFormOptions = {}
): ValidationResult => {
    const errors: Record<number, string> = {};
    const fieldErrors: Record<number, { number?: string; date?: string; document?: string }> = {};
    const incompleteCertificates: IncompleteCertificate[] = [];
    let isValid = true;

    Object.values(state).forEach((item) => {
        if (options.onlyCertificateTypeId !== undefined && item.certificateTypeId !== options.onlyCertificateTypeId) {
            return;
        }
        if (!item.enabled) return;

        const fieldErrorsForCert: { number?: string; date?: string; document?: string } = {};

        if (!options.skipNumberDateValidation) {
            // 1. Certificate Number Validation
            const numberError = validateDocumentNumber(item.number, item.certificateTypeName || undefined);
            if (numberError) {
                fieldErrorsForCert.number = t(numberError.key, numberError.params);
            }

            // 2. Certificate Date Validation
            const dateError = validateDocumentDate(item.date);
            if (dateError) {
                fieldErrorsForCert.date = t(dateError.key, dateError.params);
            }
        }

        // 3. Document Validation (skipped during pre-upload saves)
        if (!options.skipDocumentValidation && (!item.documentGuid || item.documentGuid.trim() === "")) {
            fieldErrorsForCert.document = t("validation.documentRequired");
        }

        if (Object.keys(fieldErrorsForCert).length > 0) {
            fieldErrors[item.certificateTypeId] = fieldErrorsForCert;
            errors[item.certificateTypeId] = fieldErrorsForCert.number || fieldErrorsForCert.date || fieldErrorsForCert.document || "";
            incompleteCertificates.push({
                id: item.certificateTypeId,
                name: item.certificateTypeName || `Certificate #${item.certificateTypeId}`,
            });
            isValid = false;
        }
    });

    // Cross-field validation: Occupancy date > Commencement date
    const ccItem = Object.values(state).find(
        (item) => item.enabled && mapTypeNameToKey(item.certificateTypeName || "") === "commencementCertificate"
    );
    const ocItem = Object.values(state).find(
        (item) => item.enabled && mapTypeNameToKey(item.certificateTypeName || "") === "occupancyCertificate"
    );

    if (ccItem && ocItem && ccItem.date && ocItem.date) {
        const ccDate = parseDateString(ccItem.date);
        const ocDate = parseDateString(ocItem.date);
        if (ccDate && ocDate && ocDate <= ccDate) {
            isValid = false;
            
            if (!fieldErrors[ocItem.certificateTypeId]) {
                fieldErrors[ocItem.certificateTypeId] = {};
            }
            fieldErrors[ocItem.certificateTypeId].date = t("validation.occupancyDateAfterCommencement");
            errors[ocItem.certificateTypeId] = t("validation.occupancyDateAfterCommencement");
            
            if (!incompleteCertificates.some((c) => c.id === ocItem.certificateTypeId)) {
                incompleteCertificates.push({
                    id: ocItem.certificateTypeId,
                    name: ocItem.certificateTypeName || "Occupancy Certificate (OC)",
                });
            }
        }
    }

    return { isValid, errors, incompleteCertificates, fieldErrors };
};
