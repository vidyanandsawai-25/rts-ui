/**
 * Common type definitions shared across multiple modules
 */

export interface LookupData {
    // Core fields
    id?: number;
    code?: string;
    description: string;
    
    // Floor-specific fields
    floorId?: number;
    floorCode?: string;
    sequenceNo?: number;
    maxFloorNo?: number;
    
    // SubFloor-specific fields
    subFloorId?: number;
    subFloorCode?: string;
    subFloorPercentage?: number;
    
    // Construction-specific fields
    constructionTypeId?: number;
    constructionCode?: string;
    
    // Type of Use specific fields
    typeOfUseId?: number;
    typeOfUseCode?: string;
    type?: string;
    typeOfUseGroupId?: number;
    
    // SubType of Use specific fields
    subTypeOfUseId?: number;
    
    // Common optional fields
    searchKey?: string | null;
    searchSequence?: number | null;
    isActive?: boolean;
    createdDate?: string;
    updatedDate?: string | null;
    
    // Allow additional fields
    [key: string]: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
