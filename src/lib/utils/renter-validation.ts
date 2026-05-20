import { RenterFormDataDetails } from "@/types/renter.types";

/**
 * Enterprise Validation Logic for Renter Module
 */

export interface ValidationError {
    field: keyof RenterFormDataDetails;
    message: string;
}

/** Agreement ID: only letters and digits */
const AGREEMENT_ID_REGEX = /^[a-zA-Z0-9]*$/;

/** Renter Name: only letters, spaces, dots */
const RENTER_NAME_REGEX = /^[a-zA-Z\s.]+$/;

/** Validate DD-MM-YYYY is a real calendar date */
const isValidCalendarDate = (isoDate: string): boolean => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    return !isNaN(d.getTime());
};

export const validateRenterForm = (details: RenterFormDataDetails): ValidationError[] => {
    const errors: ValidationError[] = [];

    // ─── Agreement ID ─────────────────────────────────────────────────────────
    if (details.agreementId && !AGREEMENT_ID_REGEX.test(details.agreementId)) {
        errors.push({ field: 'agreementId', message: 'Agreement ID must contain only letters and numbers' });
    }

    // ─── Agreement Date ───────────────────────────────────────────────────────
    if (details.agreementDate && !isValidCalendarDate(details.agreementDate)) {
        errors.push({ field: 'agreementDate' as keyof RenterFormDataDetails, message: 'Please enter a valid Agreement Date in DD-MM-YYYY format' });
    }

    // ─── Renter Name (Required + Alphabets only) ──────────────────────────────
    if (!details.renterName?.trim()) {
        errors.push({ field: 'renterName', message: 'Renter name is required' });
    } else if (!RENTER_NAME_REGEX.test(details.renterName.trim())) {
        errors.push({ field: 'renterName', message: 'Renter name must contain only alphabets (no numbers or symbols)' });
    }

    // ─── Rent Amount (Required + Positive) ────────────────────────────────────
    if (!details.rentAmount || Number(details.rentAmount) <= 0) {
        errors.push({ field: 'rentAmount', message: 'Valid rent amount is required' });
    }

    // ─── Duration Dates ───────────────────────────────────────────────────────
    if (details.agreementDateFrom && !isValidCalendarDate(details.agreementDateFrom)) {
        errors.push({ field: 'agreementDateFrom', message: 'Please enter a valid From date in DD-MM-YYYY format' });
    }
    if (details.agreementDateTo && !isValidCalendarDate(details.agreementDateTo)) {
        errors.push({ field: 'agreementDateTo', message: 'Please enter a valid To date in DD-MM-YYYY format' });
    }

    // ─── Duration: From < To ──────────────────────────────────────────────────
    if (details.agreementDateFrom && details.agreementDateTo) {
        const from = new Date(details.agreementDateFrom);
        const to = new Date(details.agreementDateTo);
        
        if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from >= to) {
            errors.push({ field: 'agreementDateTo', message: 'To date must be after From date' });
        }
    }

    // ─── Increment Logic ──────────────────────────────────────────────────────
    if (details.incrementFrequency !== 'No Increment' && details.incrementFrequency !== 'Custom Date') {
        const incVal = Number(details.incrementValue);
        if (!details.incrementValue || isNaN(incVal) || incVal <= 0) {
            errors.push({ field: 'incrementValue', message: 'Increment value is required for the selected frequency' });
        }
        if (details.incrementValue && incVal < 0) {
            errors.push({ field: 'incrementValue', message: 'Increment value cannot be negative' });
        }
    }

    return errors;
};
