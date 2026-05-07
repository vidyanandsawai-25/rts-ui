/**
 * Renter and tenant type definitions
 */

export interface RenterDetailItem {
    id?: number;
    renterId?: number | string;
    renterName?: string;
    renterNameEnglish?: string;
    rentMonthly?: number;
    rentYearly?: number;
    agreementFromDate?: string;
    agreementToDate?: string;
    agreementDate?: string;
    [key: string]: unknown;
}

export interface RenterMastItem {
    id?: number;
    renterMastId?: number | string;
    renterType?: string;
    renterCategory?: string;
    [key: string]: unknown;
}

export interface RenterAPIResponse {
    id?: number;
    renterId?: number;
    renterName?: string;
    renterNameEnglish?: string;
    rentMonthly?: number;
    rentYearly?: number;
    agreementFromDate?: string;
    agreementToDate?: string;
    agreementDate?: string;
    [key: string]: unknown;
}
