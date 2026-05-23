import { RenterFormDataDetails } from "@/types/renter.types";

/**
 * Enterprise Validation Logic for Renter Module
 */

export interface ValidationError {
    field: keyof RenterFormDataDetails;
    message: string;
}

export interface ExistingFloorRenterDetails {
    agreementId?: string;
    durationFrom?: string;
    durationTo?: string;
    [key: string]: unknown;
}

export interface ExistingFloorData {
    id?: string | number;
    renter?: string;
    renterDetails?: ExistingFloorRenterDetails[];
    [key: string]: unknown;
}

/** Validate calendar date */
const isValidCalendarDate = (isoDate: string): boolean => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    return !isNaN(d.getTime());
};

/** Calendar-accurate overlap check */
export const areDatesOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    if (isNaN(s1.getTime()) || isNaN(e1.getTime()) || isNaN(s2.getTime()) || isNaN(e2.getTime())) {
        return false;
    }
    return s1 <= e2 && e1 >= s2;
};

export const validateRenterForm = (
    details: RenterFormDataDetails,
    currentFloorId?: string | number,
    existingFloors?: ExistingFloorData[]
): ValidationError[] => {
    const errors: ValidationError[] = [];

    // ─── Agreement ID ─────────────────────────────────────────────────────────
    if (!details.agreementId || !details.agreementId.trim()) {
        errors.push({
            field: 'agreementId',
            message: 'Agreement ID is required.'
        });
    } else {
        const agreementIdVal = details.agreementId.trim();

        // 1. Allowed characters check
        const allowedCharsRegex = /^[A-Za-z0-9_-]+$/;
        if (!allowedCharsRegex.test(agreementIdVal)) {
            errors.push({
                field: 'agreementId',
                message: 'Only letters, numbers, underscore (_) and hyphen (-) are allowed.'
            });
        }
        // 2. Length check
        else if (agreementIdVal.length < 3 || agreementIdVal.length > 15) {
            errors.push({
                field: 'agreementId',
                message: 'Agreement ID must be between 3 and 15 characters.'
            });
        }
        // 3. Mandatory Rule: must contain at least one numeric value
        else if (!/\d/.test(agreementIdVal)) {
            errors.push({
                field: 'agreementId',
                message: 'Agreement ID should contain at least one numeric value.'
            });
        }
        // 4. Additional Smart Validation (Spam / Random / Repeated)
        else {
            // Repeated characters check: Reject same character repeated continuously > 3 times
            const hasRepeatedChar = /(.)\1{3,}/i.test(agreementIdVal);

            // Repeated sequence check (e.g. abcabc, ag101ag101)
            const hasRepeatedSeq = /([A-Za-z0-9_-]{2})\1{2,}/i.test(agreementIdVal) || /([A-Za-z0-9_-]{3,})\1+/i.test(agreementIdVal);

            // Keyboard pattern check (asdfgh, qwerty, zxcvbn)
            const idLower = agreementIdVal.toLowerCase();
            const keyboardPatterns = ['asdfgh', 'qwerty', 'zxcvbn'];
            const hasKeyboardPattern = keyboardPatterns.some(pat => idLower.includes(pat));

            if (hasRepeatedChar || hasRepeatedSeq || hasKeyboardPattern) {
                errors.push({
                    field: 'agreementId',
                    message: 'Random or repeated characters are not allowed.'
                });
            }
            // 5. General regex match safeguard
            else if (!/^(?=.*\d)[A-Za-z\d_-]{3,15}$/.test(agreementIdVal)) {
                errors.push({
                    field: 'agreementId',
                    message: 'Please enter a valid Agreement ID.'
                });
            }
            // 6. Duplicate check against existing floors
            else if (existingFloors) {
                const hasDuplicate = existingFloors.some(f => {
                    if (currentFloorId !== undefined && String(f.id) === String(currentFloorId)) return false;
                    if (f.renter !== 'Yes') return false;
                    return Array.isArray(f.renterDetails) && f.renterDetails.some(rd => 
                        rd.agreementId && String(rd.agreementId).trim().toUpperCase() === agreementIdVal.toUpperCase()
                    );
                });
                if (hasDuplicate) {
                    errors.push({
                        field: 'agreementId',
                        message: 'Agreement ID already exists for this property.'
                    });
                }
            }
        }
    }

    // ─── Agreement Date ───────────────────────────────────────────────────────
    if (!details.agreementDate) {
        errors.push({ field: 'agreementDate', message: 'Agreement Date is required.' });
    } else if (!isValidCalendarDate(details.agreementDate)) {
        errors.push({ field: 'agreementDate', message: 'Agreement Date is required.' });
    } else {
        const agreementDateObj = new Date(details.agreementDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        agreementDateObj.setHours(0, 0, 0, 0);

        if (agreementDateObj > today) {
            errors.push({ field: 'agreementDate', message: 'Agreement Date cannot be a future date.' });
        }

        const currentYear = new Date().getFullYear();
        if (agreementDateObj.getFullYear() !== currentYear) {
            errors.push({ field: 'agreementDate', message: 'Agreement Date must be of current year only.' });
        }
    }

    // ─── Renter Name ──────────────────────────────────────────────────────────
    if (!details.renterName || !details.renterName.trim()) {
        errors.push({ field: 'renterName', message: 'Renter Name is required.' });
    } else {
        const nameVal = details.renterName;
        const trimmedName = nameVal.trim();
        const primaryRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

        if (trimmedName.length < 3) {
            errors.push({ field: 'renterName', message: 'Renter Name must be at least 3 characters.' });
        } else if (nameVal.length > 100) {
            errors.push({ field: 'renterName', message: 'Renter Name cannot exceed 100 characters.' });
        } else if (!primaryRegex.test(nameVal)) {
            errors.push({ field: 'renterName', message: 'Renter Name should contain only alphabets and spaces.' });
        } else {
            // Repeated characters check: Reject same character repeated continuously > 3 times
            const hasRepeatedChar = /(.)\1{3,}/i.test(nameVal);

            // Repeated sequence patterns:
            // 1. Any 2-character sequence repeated continuously 3 or more times (e.g. hahaha)
            // 2. Any 3+ character sequence repeated continuously 2 or more times (e.g. qweqwe, abcabcabc)
            const hasRepeatedSeq = /([A-Za-z]{2})\1{2,}/i.test(nameVal) || /([A-Za-z]{3,})\1+/i.test(nameVal);

            if (hasRepeatedChar || hasRepeatedSeq) {
                errors.push({ field: 'renterName', message: 'Repeated or random characters are not allowed.' });
            } else {
                // Keyboard patterns check
                const nameLower = nameVal.toLowerCase();
                const keyboardPatterns = ['asdfgh', 'qwerty', 'zxcvbn'];
                const hasKeyboardPattern = keyboardPatterns.some(pat => nameLower.includes(pat));

                // Consonant-only / Vowel check: Reject words of length >= 3 with no vowels
                const words = nameVal.split(/\s+/);
                const hasSpamWord = words.some(word => word.length >= 3 && !/[aeiouy]/i.test(word));

                if (hasKeyboardPattern || hasSpamWord) {
                    errors.push({ field: 'renterName', message: 'Please enter a meaningful renter name.' });
                }
            }
        }
    }

    // ─── Duration Dates ───────────────────────────────────────────────────────
    if (!details.agreementDateFrom) {
        errors.push({ field: 'agreementDateFrom', message: 'From Date is required.' });
    }
    if (!details.agreementDateTo) {
        errors.push({ field: 'agreementDateTo', message: 'To Date is required.' });
    }

    if (details.agreementDateFrom && details.agreementDateTo) {
        const fromDateObj = new Date(details.agreementDateFrom);
        const toDateObj = new Date(details.agreementDateTo);

        if (!isNaN(fromDateObj.getTime()) && !isNaN(toDateObj.getTime())) {
            if (toDateObj <= fromDateObj) {
                errors.push({ field: 'agreementDateTo', message: 'To Date must be greater than From Date.' });
            }

            const currentYear = new Date().getFullYear();
            if (fromDateObj.getFullYear() !== currentYear) {
                errors.push({ field: 'agreementDateFrom', message: 'From Date must be in current year.' });
            }

            if (details.agreementDate) {
                const agreementDateObj = new Date(details.agreementDate);
                if (!isNaN(agreementDateObj.getTime()) && fromDateObj < agreementDateObj) {
                    errors.push({ field: 'agreementDateFrom', message: 'From Date should not be before Agreement Date.' });
                }
            }

            // Duration overlap checks
            if (existingFloors) {
                const hasOverlap = existingFloors.some(f => {
                    if (currentFloorId !== undefined && String(f.id) === String(currentFloorId)) return false;
                    if (f.renter !== 'Yes') return false;
                    return Array.isArray(f.renterDetails) && f.renterDetails.some(rd => {
                        if (!rd.durationFrom || !rd.durationTo) return false;
                        return areDatesOverlapping(details.agreementDateFrom, details.agreementDateTo, rd.durationFrom, rd.durationTo);
                    });
                });
                if (hasOverlap) {
                    errors.push({ field: 'agreementDateFrom', message: 'Selected duration overlaps with existing renter agreement.' });
                    errors.push({ field: 'agreementDateTo', message: 'Selected duration overlaps with existing renter agreement.' });
                }
            }
        }
    }

    // ─── Monthly Rent ─────────────────────────────────────────────────────────
    if (details.rentAmount === undefined || details.rentAmount === null || String(details.rentAmount).trim() === "") {
        errors.push({ field: 'rentAmount', message: 'Monthly Rent is required.' });
    } else {
        const rentStr = String(details.rentAmount).trim();
        const rentRegex = /^\d+(\.\d{1,2})?$/;
        if (!rentRegex.test(rentStr)) {
            errors.push({ field: 'rentAmount', message: 'Enter valid rent amount.' });
        } else {
            const rentVal = Number(rentStr);
            if (rentVal <= 0) {
                errors.push({ field: 'rentAmount', message: 'Rent amount must be greater than 0.' });
            } else {
                const integerPart = rentStr.split('.')[0];
                if (integerPart.length > 10) {
                    errors.push({ field: 'rentAmount', message: 'Monthly Rent cannot exceed 10 digits.' });
                }
            }
        }
    }

    // ─── Increment Logic ──────────────────────────────────────────────────────
    const isIncrementValueEntered = details.incrementValue !== undefined && details.incrementValue !== null && String(details.incrementValue).trim() !== "";
    const hasFrequencySelected = details.incrementFrequency && details.incrementFrequency !== 'No Increment' && details.incrementFrequency !== 'Custom Date';

    if (isIncrementValueEntered) {
        if (!details.incrementFrequency || details.incrementFrequency === 'No Increment') {
            errors.push({ field: 'incrementFrequency', message: 'Please select Increment Frequency.' });
        }
        if (!details.incrementType) {
            errors.push({ field: 'incrementType', message: 'Please select Increment Type.' });
        }

        const incStr = String(details.incrementValue).trim();
        if (details.incrementType === 'Percentage') {
            if (/[^0-9]/.test(incStr)) {
                errors.push({ field: 'incrementValue', message: 'Only numeric values are allowed.' });
            } else if (incStr.length > 3) {
                errors.push({ field: 'incrementValue', message: 'Maximum 3 digits allowed.' });
            } else {
                const incVal = Number(incStr);
                if (incVal < 0 || incVal > 100) {
                    errors.push({ field: 'incrementValue', message: 'Percentage cannot exceed 100.' });
                }
            }
        } else if (details.incrementType === 'Fixed') {
            const incRegex = /^\d+(\.\d{1,2})?$/;
            if (!incRegex.test(incStr)) {
                errors.push({ field: 'incrementValue', message: 'Increment Value must be greater than 0.' });
            } else {
                const incVal = Number(incStr);
                const integerPart = incStr.split('.')[0];
                if (integerPart.length > 5) {
                    errors.push({ field: 'incrementValue', message: 'Increment Value cannot exceed allowed limit.' });
                } else if (incVal <= 0) {
                    errors.push({ field: 'incrementValue', message: 'Increment Value must be greater than 0.' });
                }
            }
        }
    } else if (hasFrequencySelected) {
        errors.push({ field: 'incrementValue', message: 'Increment Value is required.' });
    }

    // ─── Custom Date Ranges ──────────────────────────────────────────────────
    if (details.incrementFrequency === 'Custom Date' && Array.isArray(details.customDateRanges)) {
        details.customDateRanges.forEach((range, idx) => {
            if (range.fromDate) {
                const fromDateObj = new Date(range.fromDate);
                const currentYear = new Date().getFullYear();
                if (!isNaN(fromDateObj.getTime()) && fromDateObj.getFullYear() !== currentYear) {
                    errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} From Date must be in current year.` });
                }

                if (details.agreementDate) {
                    const agreementDateObj = new Date(details.agreementDate);
                    if (!isNaN(fromDateObj.getTime()) && !isNaN(agreementDateObj.getTime()) && fromDateObj < agreementDateObj) {
                        errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} From Date should not be before Agreement Date.` });
                    }
                }
            }
            
            const incStr = String(range.incrementValue).trim();
            if (range.incrementType === 'Percentage') {
                if (/[^0-9]/.test(incStr)) {
                    errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Only numeric values are allowed.` });
                } else if (incStr.length > 3) {
                    errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Maximum 3 digits allowed.` });
                } else {
                    const incVal = Number(incStr);
                    if (incVal < 0 || incVal > 100) {
                        errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Percentage cannot exceed 100.` });
                    }
                }
            } else {
                const incRegex = /^\d+(\.\d{1,2})?$/;
                if (!incRegex.test(incStr)) {
                    errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Increment Value must be greater than 0.` });
                } else {
                    const incVal = Number(incStr);
                    const integerPart = incStr.split('.')[0];
                    if (integerPart.length > 5) {
                        errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Increment Value cannot exceed allowed limit.` });
                    } else if (incVal <= 0) {
                        errors.push({ field: 'customDateRanges', message: `Custom range #${idx + 1} Increment Value must be greater than 0.` });
                    }
                }
            }
        });
    }

    return errors;
};

