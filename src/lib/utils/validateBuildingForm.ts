import { BuildingPermissionState } from "@/types/building-permission.types";
import { mapTypeNameToKey } from "./building-helpers";

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

const FINANCIAL_TAX_CERTIFICATES = [
    "Property Tax Certificate",
    "No Dues Certificate",
    "Assessment Certificate",
    "Property Valuation Certificate",
    "Encumbrance Certificate"
];

const BUILDING_APPROVAL_CERTIFICATES = [
    "Building Permission Certificate",
    "Building Plan Approval Certificate",
    "Commencement Certificate (CC)",
    "Occupancy Certificate (OC)",
    "Completion Certificate",
    "Building Completion Certificate",
    "Revised Building Permission Certificate",
    "Building Regularization Certificate",
    "Building Renovation Approval Certificate",
    "Building Extension Approval Certificate",
    "Additional Floor Permission Certificate",
    "Layout Approval Certificate",
    "Subdivision Approval Certificate",
    "Amalgamation Approval Certificate",
    "Development Permission Certificate"
];

const SAFETY_NOC_CERTIFICATES = [
    "Building Safety Certificate",
    "Structural Stability Certificate",
    "Fire Safety Certificate",
    "Lift Safety Certificate",
    "Electrical Safety Certificate",
    "Water Connection Approval Certificate",
    "Sewerage Connection Approval Certificate",
    "Rainwater Harvesting Compliance Certificate",
    "Environmental Clearance Certificate",
    "Tree Cutting Permission Certificate",
    "Demolition Permission Certificate",
    "Road Cutting Permission Certificate",
    "NOC Certificate"
];

const PROPERTY_IDENTITY_CERTIFICATES = [
    "Property Certificate",
    "Ownership Certificate",
    "Land Use Certificate",
    "Zoning Certificate",
    "Address Verification Certificate"
];

export interface LengthRule {
    min: number;
    max: number;
}

export const getCertificateLengthRule = (typeName?: string): LengthRule => {
    if (!typeName) return { min: 1, max: 100 };
    if (FINANCIAL_TAX_CERTIFICATES.includes(typeName)) return { min: 6, max: 25 };
    if (BUILDING_APPROVAL_CERTIFICATES.includes(typeName)) return { min: 8, max: 40 };
    if (SAFETY_NOC_CERTIFICATES.includes(typeName)) return { min: 6, max: 30 };
    if (PROPERTY_IDENTITY_CERTIFICATES.includes(typeName)) return { min: 5, max: 30 };
    return { min: 1, max: 100 };
};

const isRepeatedNumber = (val: string): boolean => {
    if (val.length < 2) return false;
    return /^([a-zA-Z0-9])\1+$/.test(val);
};

const isDummyOrRepeated = (val: string): boolean => {
    if (/^(.)\1+$/.test(val)) return true;
    const lowercaseVal = val.toLowerCase();
    const dummyWords = [
        "dummy", "test", "demo", "placeholder", "nil", "none", "null", 
        "sample", "temp", "qwerty", "asdf", "xyz", "abc"
    ];
    const sequences = [
        "123456", "234567", "345678", "456789", "012345",
        "987654", "876543", "765432", "654321", "543210",
        "abcdef", "bcdefg", "cdefgh", "defghi", "efghij", "fghijk",
        "fedcba"
    ];
    if (dummyWords.some(word => lowercaseVal.includes(word)) || lowercaseVal === "na" || lowercaseVal === "n/a") {
        return true;
    }
    if (sequences.some(seq => lowercaseVal.includes(seq))) {
        return true;
    }
    return false;
};

export const validateBuildingForm = (
    state: BuildingPermissionState,
    t: (key: string, params?: Record<string, string | number>) => string
): ValidationResult => {
    const errors: Record<number, string> = {};
    const fieldErrors: Record<number, { number?: string; date?: string; document?: string }> = {};
    const incompleteCertificates: IncompleteCertificate[] = [];
    let isValid = true;

    Object.values(state).forEach((item) => {
        if (!item.enabled) return;

        const fieldErrorsForCert: { number?: string; date?: string; document?: string } = {};

        // 1. Certificate Number Validation
        if (!item.number || item.number.trim() === "") {
            fieldErrorsForCert.number = t("validation.numberRequired");
        } else {
            const trimmedNumber = item.number.trim();
            if (isRepeatedNumber(trimmedNumber)) {
                fieldErrorsForCert.number = t("validation.numberRepeated");
            } else {
                const typeKey = mapTypeNameToKey(item.certificateTypeName || "");
                if (typeKey === "commencementCertificate" || typeKey === "occupancyCertificate" || typeKey === "possessionCertificate") {
                    const copRegex = /^[A-Za-z0-9\/\-\s]{5,50}$/;
                    if (!copRegex.test(trimmedNumber)) {
                        fieldErrorsForCert.number = t("validation.numberInvalidCOP");
                    }
                } else if (typeKey === "index2") {
                    const index2Regex = /^[A-Za-z0-9]{3,6}-\d{1,7}-\d{4}$/;
                    if (!index2Regex.test(trimmedNumber)) {
                        fieldErrorsForCert.number = t("validation.numberInvalidIndex2");
                    }
                } else if (typeKey === "electricBill") {
                    const electricRegex = /^\d{9,12}$/;
                    if (!electricRegex.test(trimmedNumber)) {
                        fieldErrorsForCert.number = t("validation.numberInvalidElectric");
                    }
                } else {
                    if (/\s/.test(trimmedNumber)) {
                        fieldErrorsForCert.number = t("validation.numberNoSpaces");
                    } else {
                        const numLength = trimmedNumber.length;
                        const rule = getCertificateLengthRule(item.certificateTypeName);
                        if (numLength < rule.min || numLength > rule.max) {
                            fieldErrorsForCert.number = t("validation.numberLength", { min: rule.min, max: rule.max });
                        }
                    }
                }
            }

            // Additional checks from feature branch (HEAD)
            if (!fieldErrorsForCert.number) {
                if (/^0+$/.test(trimmedNumber)) {
                    fieldErrorsForCert.number = t("building.errors.allZeros");
                } else if (!/^[a-zA-Z0-9\-_/]+$/.test(trimmedNumber)) {
                    fieldErrorsForCert.number = t("building.errors.invalidCharacters");
                } else if (isDummyOrRepeated(trimmedNumber)) {
                    fieldErrorsForCert.number = t("building.errors.dummyText");
                }
            }
        }

        // 2. Certificate Date Validation
        if (!item.date || item.date.trim() === "") {
            fieldErrorsForCert.date = t("validation.dateRequired");
        } else {
            const dateParts = item.date.split("-");
            let dateIsValid = false;
            let dateObj: Date | null = null;
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                dateObj = new Date(year, month, day);
                dateIsValid = !isNaN(dateObj.getTime()) && 
                              dateObj.getFullYear() === year && 
                              dateObj.getMonth() === month && 
                              dateObj.getDate() === day;
            }

            if (!dateIsValid || !dateObj) {
                fieldErrorsForCert.date = t("validation.invalidDate");
            } else {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (dateObj > today) {
                    fieldErrorsForCert.date = t("validation.dateFuture");
                } else if (dateObj < new Date(1900, 0, 1)) {
                    fieldErrorsForCert.date = t("validation.dateBefore1900");
                }
            }
        }

        // 3. Document Validation
        if (!item.documentGuid || item.documentGuid.trim() === "") {
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

    return { isValid, errors, incompleteCertificates, fieldErrors };
};
