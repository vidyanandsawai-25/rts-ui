import { getCertificateLengthRule } from "@/lib/utils/validateBuildingForm";

export interface BuildingCertificateValidationInput {
    number?: string | null;
    date?: string | null;
    certificateTypeName?: string | null;
}

export const checkBuildingRequiredFields = (
    certificate: BuildingCertificateValidationInput,
    t: (key: string, values?: Record<string, string | number>) => string
): string | null => {
    if (!certificate.number || certificate.number.trim() === "") {
        return t("common.validation.numberRequired") || "Certificate Number is required";
    }
    if (/\s/.test(certificate.number)) {
        return t("common.validation.numberNoSpaces") || "Spaces are not allowed in Certificate Number";
    }
    const numLength = certificate.number.trim().length;
    const rule = getCertificateLengthRule(certificate.certificateTypeName || undefined);
    if (numLength < rule.min || numLength > rule.max) {
        return t("common.validation.numberLength", { min: rule.min, max: rule.max }) || `Certificate Number must be between ${rule.min} and ${rule.max} characters`;
    }

    const cleanNum = certificate.number.trim();
    if (/^0+$/.test(cleanNum)) {
        return t("building.errors.allZeros") || "Certificate number cannot be all zeros.";
    }
    if (!/^[a-zA-Z0-9\-_/]+$/.test(cleanNum)) {
        return t("building.errors.invalidCharacters") || "Certificate number contains invalid characters. Only alphanumeric, hyphens, underscores, and slashes are allowed.";
    }

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

    if (isDummyOrRepeated(cleanNum)) {
        return t("building.errors.dummyText") || "Dummy, sequential, or repetitive placeholder text is not allowed.";
    }

    if (!certificate.date || certificate.date.trim() === "") {
        return t("common.validation.dateRequired") || "Certificate Date is required";
    }
    const dateVal = new Date(certificate.date);
    if (isNaN(dateVal.getTime())) {
        return t("common.validation.invalidDate") || "Please enter a valid date";
    }
    const todayLimit = new Date();
    todayLimit.setHours(23, 59, 59, 999);
    if (dateVal > todayLimit) {
        return t("building.errors.futureDate") || "Date cannot be in the future.";
    }
    return null;
};
