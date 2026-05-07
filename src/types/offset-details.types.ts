/**
 * Offset and deduction type definitions
 */

export interface OffsetData {
    id?: number;
    offsetId?: number | string;
    offsetType?: string;
    offsetTypeId?: number | string;
    offsetValue?: number | string;
    offsetArea?: number | string;
    length?: number | string;
    breadth?: number | string;
    [key: string]: unknown;
}

export interface OffsetAPIResponse {
    id?: number;
    offsetId?: number;
    offsetType?: string;
    offsetTypeId?: number;
    offsetValue?: number;
    offsetArea?: number;
    length?: number;
    lengthMtr?: number;
    breadth?: number;
    widthMtr?: number;
    heightMtr?: number;
    baseMtr?: number;
    base2Mtr?: number;
    areaSqMtr?: number;
    roomWiseMinusId?: number;
    operation?: string;
    remark?: string;
    shapeType?: string;
    shapeParameters?: unknown;
    [key: string]: unknown;
}

export interface OffsetSubmissionItem {
    offsetTypeId?: number | string;
    offsetValue?: number;
    offsetArea?: number;
    length?: number;
    breadth?: number;
    [key: string]: unknown;
}
