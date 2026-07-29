import { mapTypeNameToKey } from "@/lib/utils/building-helpers";
import {
    FINANCIAL_TAX_CERTIFICATES,
    BUILDING_APPROVAL_CERTIFICATES,
    SAFETY_NOC_CERTIFICATES,
    PROPERTY_IDENTITY_CERTIFICATES
} from "./validation-constants";

export interface LengthRule {
    min: number;
    max: number;
}

export interface ValidationError {
    key: string;
    params?: Record<string, string | number>;
}

export const getCertificateLengthRule = (typeName?: string): LengthRule => {
    if (!typeName) return { min: 1, max: 100 };
    const typeKey = mapTypeNameToKey(typeName);
    if (typeKey === "commencementCertificate" || typeKey === "occupancyCertificate" || typeKey === "possessionCertificate") {
        return { min: 5, max: 50 };
    }
    if (typeKey === "index2") {
        return { min: 10, max: 19 };
    }
    if (typeKey === "electricBill") {
        return { min: 9, max: 12 };
    }
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

export const validateDocumentNumber = (
    number: string | null | undefined,
    typeName?: string
): ValidationError | null => {
    if (!number || number.trim() === "") {
        return { key: "validation.numberRequired" };
    }

    const trimmedNumber = number.trim();
    if (isRepeatedNumber(trimmedNumber)) {
        return { key: "validation.numberRepeated" };
    }

    if (/\s/.test(trimmedNumber)) {
        return { key: "validation.numberNoSpaces" };
    }

    const typeKey = mapTypeNameToKey(typeName || "");
    const isCOP = typeKey === "commencementCertificate" || typeKey === "occupancyCertificate" || typeKey === "possessionCertificate";

    if (isCOP) {
        const copRegex = /^[A-Za-z0-9\/\-]{5,50}$/;
        if (!copRegex.test(trimmedNumber)) {
            return { key: "validation.numberInvalidCOP" };
        }
    } else if (typeKey === "index2") {
        const index2Regex = /^[A-Za-z0-9]{3,6}-\d{1,7}-\d{4}$/;
        if (!index2Regex.test(trimmedNumber)) {
            return { key: "validation.numberInvalidIndex2" };
        }
    } else if (typeKey === "electricBill") {
        const electricRegex = /^\d{9,12}$/;
        if (!electricRegex.test(trimmedNumber)) {
            return { key: "validation.numberInvalidElectric" };
        }
    } else {
        const rule = getCertificateLengthRule(typeName);
        if (trimmedNumber.length < rule.min || trimmedNumber.length > rule.max) {
            return { key: "validation.numberLength", params: { min: rule.min, max: rule.max } };
        }
    }

    // Additional general checks
    if (/^0+$/.test(trimmedNumber)) {
        return { key: "building.errors.allZeros" };
    }

    // Character checks (disallow spaces for all certificate types)
    const allowedCharsRegex = /^[a-zA-Z0-9\-_/]+$/;
    if (!allowedCharsRegex.test(trimmedNumber)) {
        return { key: "building.errors.invalidCharacters" };
    }

    if (isDummyOrRepeated(trimmedNumber)) {
        return { key: "building.errors.dummyText" };
    }

    return null;
};

export const parseDateString = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr || dateStr.trim() === "") return null;
    const parts = dateStr.trim().split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const utcTime = Date.UTC(year, month, day);
    const dateObj = new Date(utcTime);
    const dateIsValid = !isNaN(utcTime) && 
                        dateObj.getUTCFullYear() === year && 
                        dateObj.getUTCMonth() === month && 
                        dateObj.getUTCDate() === day;
    return dateIsValid ? dateObj : null;
};

export const validateDocumentDate = (
    date: string | null | undefined
): ValidationError | null => {
    if (!date || date.trim() === "") {
        return { key: "validation.dateRequired" };
    }

    const dateObj = parseDateString(date);
    if (!dateObj) {
        return { key: "validation.invalidDate" };
    }

    const now = new Date();
    const todayTime = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateObj.getTime() > todayTime) {
        return { key: "validation.dateFuture" };
    }
    if (dateObj.getTime() < Date.UTC(1900, 0, 1)) {
        return { key: "validation.dateBefore1900" };
    }

    return null;
};
