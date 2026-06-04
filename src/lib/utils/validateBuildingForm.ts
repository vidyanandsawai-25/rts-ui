import { BuildingPermissionState } from "@/types/building-permission.types";

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

interface LengthRule {
    min: number;
    max: number;
}

const getCertificateLengthRule = (typeName?: string): LengthRule => {
    if (!typeName) return { min: 1, max: 100 };
    
    if (FINANCIAL_TAX_CERTIFICATES.includes(typeName)) {
        return { min: 6, max: 25 };
    }
    if (BUILDING_APPROVAL_CERTIFICATES.includes(typeName)) {
        return { min: 8, max: 40 };
    }
    if (SAFETY_NOC_CERTIFICATES.includes(typeName)) {
        return { min: 6, max: 30 };
    }
    if (PROPERTY_IDENTITY_CERTIFICATES.includes(typeName)) {
        return { min: 5, max: 30 };
    }
    
    return { min: 1, max: 100 };
};

/**
 * Validates the building permission form state.
 * For every enabled certificate, all three fields (number, date, document) are required.
 * Also validates the length constraints of the certificate number based on category rules.
 */
export const validateBuildingForm = (
    state: BuildingPermissionState,
    t: (key: string, params?: Record<string, string | number>) => string
): ValidationResult => {
    const errors: Record<number, string> = {};
    const incompleteCertificates: IncompleteCertificate[] = [];
    let isValid = true;

    Object.values(state).forEach((item) => {
        if (!item.enabled) return;

        const missingFields: string[] = [];

        if (!item.number || item.number.trim() === "") {
            missingFields.push(t("validation.numberRequired"));
        } else {
            if (/\s/.test(item.number)) {
                missingFields.push(t("validation.numberNoSpaces"));
            }
            const numLength = item.number.trim().length;
            const rule = getCertificateLengthRule(item.certificateTypeName);
            if (numLength < rule.min || numLength > rule.max) {
                missingFields.push(t("validation.numberLength", { min: rule.min, max: rule.max }));
            }
        }
        if (!item.date || item.date.trim() === "") {
            missingFields.push(t("validation.dateRequired"));
        }
        if (!item.documentGuid || item.documentGuid.trim() === "") {
            missingFields.push(t("validation.documentRequired"));
        }

        if (missingFields.length > 0) {
            errors[item.certificateTypeId] = missingFields[0];
            incompleteCertificates.push({
                id: item.certificateTypeId,
                name: item.certificateTypeName || `Certificate #${item.certificateTypeId}`,
            });
            isValid = false;
        }
    });

    return { isValid, errors, incompleteCertificates };
};
