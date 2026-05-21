export interface CustomDateRange {
    id: string;
    fromDate: string;
    toDate: string;
    incrementType: 'Percentage' | 'Fixed';
    incrementValue: number;
    calculationMethod: 'Base Value' | 'Incremented Value';
    remarks?: string;
}

export interface RenterFormDataDetails {
    renterName: string;
    agreementId: string;
    agreementDate: string;
    agreementDateFrom: string;
    agreementDateTo: string;
    rentAmount: number | string;
    rentAmountAGR: number | string;
    rentAmountSUR: number | string;
    incrementFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | '11-Month' | 'No Increment' | 'Custom Date';
    incrementType: 'Percentage' | 'Fixed';
    selfDeclarationAmount?: number | string;
    incrementValue: number | string;
    isCompounding?: boolean;
    viewMode?: 'monthly' | 'annual';
    customDateRanges: CustomDateRange[];
}

export interface RenterFormData {
    id?: string;
    floorId: string;
    renterDetails: RenterFormDataDetails;
    renterMast?: unknown[];
    renterTableEntries?: unknown[];
    grandTotal?: number;
    renterCustomIncrements?: unknown[];
    [key: string]: unknown;
}

export interface RenterPayload extends Omit<RenterFormData, 'renterDetails'> {
    renterDetails: unknown[]; // API expects array
}
