export interface Classification {
    type: string;
    structure: number;
    unit: number;
    pendingStructure: number;
    pendingUnit: number;
    oldDemand: number;
    currentDemand: number;
    retroDemand: number;
    totalDemand: number;
    additionalRevenueGenerated: number;
}

export interface ZoneDataRow {
    zoneId: number | null;
    zoneName: string;
    wardId: number | null;
    wardName: string | null;
    totalStructure: number;
    totalUnit: number;
    classifications: Classification[];
    isTotal?: boolean;
}

export interface ApprovalByUlbItems {
    zoneData: ZoneDataRow[];
    totalRow: ZoneDataRow | null;
    grandTotalRow: ZoneDataRow | null;
}

export interface ApprovalByUlbResponse {
    success: boolean;
    message: string;
    items: ApprovalByUlbItems;
    errors: unknown | null;
    correlationId: string | null;
}

export interface AuthoritySignature {
    signAuthorityId: number;
    authorityName: string;
    authorityCode: string;
    sequenceOrder: number;
    isSigned: number;
}

export interface BuildingWiseItem {
    buildingNo: string;
    noticeNo: string;
    units: number;
    totalDemand: number;
    authoritySignatures: AuthoritySignature[];
}

export interface BuildingWisePagination {
    items: BuildingWiseItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface BuildingWiseResponse {
    success: boolean;
    message: string;
    items: BuildingWisePagination;
    errors: unknown | null;
    correlationId: string | null;
}
