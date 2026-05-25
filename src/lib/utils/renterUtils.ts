/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RenterCustomIncrementPostRow } from "@/types/floor-details.types";

/**
 * Converts various date string formats to ISO format (YYYY-MM-DD).
 * Supports: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
export const convertToISODate = (dateStr: string): string => {
    if (!dateStr) return "";

    // Try parsing different date formats
    const formats = [
        // DD/MM/YYYY or DD-MM-YYYY
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
        // YYYY-MM-DD
        /^(\d{4})-(\d{2})-(\d{2})$/,
    ];

    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            if (format === formats[0]) {
                // DD/MM/YYYY format
                const [, day, month, year] = match;
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            } else {
                // Already in YYYY-MM-DD format
                return dateStr;
            }
        }
    }

    return dateStr; // Return as-is if no match
};

/**
 * Calculates the next rent amount based on the current rent, increment percentage, and agreement type.
 */
export const calculateNextRent = (
    monthlyRent: number,
    incrementPercent: number,
    agreementType: string
): number => {
    if (!monthlyRent || !incrementPercent) return 0;

    switch (agreementType) {
        case "Quarterly":
            return monthlyRent + (monthlyRent * incrementPercent) / 400;
        case "Yearly":
        case "Custom":
            return monthlyRent + (monthlyRent * incrementPercent) / 100;
        default:
            return monthlyRent;
    }
};

/**
 * Extracts agreement details from OCR text.
 */
export const extractAgreementData = (text: string) => {
    const extractedData: any = {};

    // Clean text
    const cleanText = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

    // Extract Agreement ID (patterns: AGR-XXX, Agreement No: XXX, Agr. ID: XXX)
    const agrIdPatterns = [
        /Agreement\s*(?:No|ID|Number)[:\s]+([A-Z0-9-]+)/i,
        /AGR[:\s-]+([A-Z0-9-]+)/i,
        /Agr\.\s*(?:No|ID)[:\s]+([A-Z0-9-]+)/i,
    ];
    for (const pattern of agrIdPatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            extractedData.agreementId = match[1].trim();
            break;
        }
    }

    // Extract Renter Name (patterns: Tenant Name, Renter, Lessee)
    const namePatterns = [
        /(?:Tenant|Renter|Lessee)\s*(?:Name)?[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /Name\s*of\s*(?:Tenant|Renter|Lessee)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];
    for (const pattern of namePatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            extractedData.renterName = match[1].trim();
            break;
        }
    }

    // Extract Shop Name (patterns: Shop Name, Establishment, Business Name)
    const shopPatterns = [
        /(?:Shop|Establishment|Business)\s*(?:Name)?[:\s]+([A-Z0-9][a-z0-9\s]+(?:\s+[A-Z0-9][a-z0-9\s]+)*)/i,
        /Name\s*of\s*(?:Shop|Establishment|Business)[:\s]+([A-Z0-9][a-z0-9\s]+(?:\s+[A-Z0-9][a-z0-9\s]+)*)/i,
    ];
    for (const pattern of shopPatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            extractedData.shopName = match[1].trim();
            break;
        }
    }

    // Extract Dates (patterns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
    const datePatterns = [
        /(?:From|Start|Commencement)\s*(?:Date)?[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
        /(\d{4}-\d{2}-\d{2})/,
    ];
    const toDatePatterns = [
        /(?:To|End|Expiry)\s*(?:Date)?[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
        /(?:until|till)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    ];

    for (const pattern of datePatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            extractedData.agreementDateFrom = convertToISODate(match[1]);
            break;
        }
    }

    for (const pattern of toDatePatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            extractedData.agreementDateTo = convertToISODate(match[1]);
            break;
        }
    }

    // Extract Rent Amount (patterns: Rs. XXX, ₹ XXX, Rent: XXX)
    const rentPatterns = [
        /(?:Monthly\s*)?Rent[:\s]+(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.\d{2})?)/i,
        /(?:Rs\.?|₹|INR)\s*([0-9,]+(?:\.\d{2})?)\s*(?:per\s*month)?/i,
        /Amount[:\s]+(?:Rs\.?|₹|INR)?\s*([0-9,]+(?:\.\d{2})?)/i,
    ];
    for (const pattern of rentPatterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
            const rentAmount = match[1].replace(/,/g, "");
            extractedData.rentAmountAGR = rentAmount;
            extractedData.rentAmount = rentAmount;
            extractedData.rentSource = "agreement";
            break;
        }
    }

    return extractedData;
};

// Helper function to check if date ranges overlap
export const checkDateOverlap = (newFrom: string, newTo: string, existingRanges: any[]) => {
    const newStart = new Date(newFrom);
    const newEnd = new Date(newTo);

    for (let i = 0; i < existingRanges.length; i++) {
        const range = existingRanges[i];
        const existingStart = new Date(range.fromDate);
        const existingEnd = new Date(range.toDate);

        // Check if ranges overlap
        if (newStart <= existingEnd && newEnd >= existingStart) {
            // Return detailed overlap info
            return {
                overlaps: true,
                rangeNumber: i + 1,
                fromDate: range.fromDate,
                toDate: range.toDate
            };
        }
    }
    return { overlaps: false };
};

// Interface for validation input
export interface DateRangeValidationInput {
    newRangeData: {
        fromDate: string;
        toDate: string;
        incrementValue: string | number;
        incrementType?: string;
    };
    agreementStart: Date;
    agreementEnd: Date;
    existingRanges: any[];
}

export interface ValidationErrors {
    fromDate: string;
    toDate: string;
    incrementValue: string;
    general: string;
}

// Generalized validation function
export const validateDateRange = (input: DateRangeValidationInput): { isValid: boolean; errors: ValidationErrors; overlapInfo?: any } => {
    const errors = {
        fromDate: '',
        toDate: '',
        incrementValue: '',
        general: ''
    };
    let isValid = true;
    let overlapInfo = null;

    const { fromDate, toDate, incrementValue, incrementType } = input.newRangeData;
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    // Validate From Date
    if (!fromDate) {
        errors.fromDate = 'From Date is required';
        isValid = false;
    } else if (fromDateObj) {
        if (fromDateObj < input.agreementStart) {
            errors.fromDate = `Must be on or after Agreement Start Date (${input.agreementStart.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })})`;
            isValid = false;
        } else if (fromDateObj > input.agreementEnd) {
            errors.fromDate = `Must be on or before Agreement End Date (${input.agreementEnd.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })})`;
            isValid = false;
        } else {
            const currentYear = new Date().getFullYear();
            if (fromDateObj.getFullYear() !== currentYear) {
                errors.fromDate = `From date must be in the current year (${currentYear})`;
                isValid = false;
            }
        }
    }

    // Validate To Date
    if (!toDate) {
        errors.toDate = 'To Date is required';
        isValid = false;
    } else if (toDateObj) {
        if (toDateObj < input.agreementStart) {
            errors.toDate = `Must be on or after Agreement Start Date (${input.agreementStart.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })})`;
            isValid = false;
        } else if (toDateObj > input.agreementEnd) {
            errors.toDate = `Must be on or before Agreement End Date (${input.agreementEnd.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })})`;
            isValid = false;
        }

        // Check if To Date is less than From Date
        if (fromDateObj && toDateObj < fromDateObj) {
            errors.toDate = 'To Date must be on or after From Date';
            isValid = false;
        } else if (fromDateObj && toDateObj.getTime() === fromDateObj.getTime()) {
            errors.toDate = 'To Date must be after From Date (same day not allowed)';
            isValid = false;
        }
    }

    // Validate Increment Value
    const parsedIncrement = Number(incrementValue);
    if (incrementValue === undefined || incrementValue === null || String(incrementValue).trim() === "") {
        errors.incrementValue = 'Value is required';
        isValid = false;
    } else if (incrementType === 'Percentage') {
        const incStr = String(incrementValue).trim();
        if (/[^0-9]/.test(incStr)) {
            errors.incrementValue = 'Only numeric values are allowed.';
            isValid = false;
        } else if (incStr.length > 3) {
            errors.incrementValue = 'Maximum 3 digits allowed.';
            isValid = false;
        } else {
            const incVal = Number(incStr);
            if (incVal < 0 || incVal > 100) {
                errors.incrementValue = 'Percentage cannot exceed 100.';
                isValid = false;
            }
        }
    } else {
        if (!/^\d+(\.\d{1,2})?$/.test(String(incrementValue)) || parsedIncrement <= 0) {
            errors.incrementValue = 'Must be a positive number with up to 2 decimal places and no positive/negative signs';
            isValid = false;
        }
    }

    // Check for overlaps
    if (fromDate && toDate && isValid) {
        overlapInfo = checkDateOverlap(fromDate, toDate, input.existingRanges);
        if (overlapInfo.overlaps) {
            const overlapFrom = new Date(overlapInfo.fromDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
            const overlapTo = new Date(overlapInfo.toDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
            errors.general = `Date range overlaps with Range #${overlapInfo.rangeNumber} (${overlapFrom} - ${overlapTo})`;
            isValid = false;
        }
    }

    return { isValid, errors, overlapInfo };
};

/**
 * Maps UI `customDateRanges` entries to the API contract.
 * UI fields: fromDate, toDate, incrementType, incrementValue, calculationMethod
 */
export function mapCustomDateRangesToPostPayload(
    ranges: any[] | undefined | null
): RenterCustomIncrementPostRow[] {
    if (!ranges?.length) return [];
    return ranges.map((r) => ({
        Customfromdate: String(r.fromDate ?? ""),
        Customtodate: String(r.toDate ?? ""),
        CustomIncrementtype: String(r.incrementType ?? ""),
        CustomIncrementValue: Number(r.incrementValue ?? 0),
        CustomMethod: String(r.calculationMethod ?? ""),
    }));
}

