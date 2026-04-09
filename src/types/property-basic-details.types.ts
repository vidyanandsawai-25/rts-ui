// PROPERTY API TYPES    

//  Represents a property category item from PropertyCategory API. Endpoint: GET /api/PropertyCategory
export interface OwnerTypeApiItem {
    ownerTypeId: number;
    ownerType: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

// Paginated response wrapper for the OwnerType API.
export interface OwnerTypeApiResponse {
    items: OwnerTypeApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface PropertyTypeApiItem {
    propertyTypeId: number;
    propertyDescription: string;
    type: string;
    propertyTypeGroup: string;
    searchKey: string;
    searchSequence: number;
    propertyTypeCategoryId: number | null;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

// Paginated response wrapper for the PropertyType API.
export interface PropertyTypeApiResponse {
    items: PropertyTypeApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

//  Represents a property category item from PropertyCategory API. Endpoint: GET /api/PropertyCategory
export interface PropertyCategoryApiItem {
    propertyCategoryId: number;
    propertyCategoryName: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

//  Paginated response wrapper for the PropertyCategory API.
export interface PropertyCategoryApiResponse {
    items: PropertyCategoryApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface PropertyBasicDetailsApiItem {
    propertyId: number;
    wardId: number;
    wardNo: string;
    zoneId: number;
    division: string;
    propertyNo: string;
    partitionNo: string;
    flatOrShopNo: string;
    plotNo: string;
    surveyNo: string;
    taxZoneId: number;
    taxZoneNo: string;
    categoryId: number;
    categoryName: string;
    propertyTypeId: number;
    propertyDescription: string;
    upicId: string;
    subZoneNo: string;
    wingNo: string;
    wingId: number;
    wingName: string | null;
    noOfResidentialToilets: number;
    noOfCommercialToilets: number;
    totalCarpetAreaSqMeter: number;
    totalBuiltupAreaSqMeter: number;
    totalCarpetAreaSqFeet: number;
    totalBuiltupAreaSqFeet: number;
    plotArea: number | null;
    plotAreaFtLength: number;
    plotAreaFtWidth: number;
    plotAreaMtrLength: number;
    plotAreaMtrWidth: number;
}

export interface TypeOfUseApiItem {
    typeOfUseId: number;
    typeOfUseCode: string;
    description: string;
    type: string;
    typeOfUseGroupId: number;
    searchKey: string | null;
    searchSequence: number | null;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

// Represents the DTO for updating property basic details. Matches UpdatePropertyBasicDetailsDto in C#
export interface UpdatePropertyBasicDetailsDto {
    wardId: number;
    taxZoneId: number;
    categoryId: number | null;
    propertyTypeId: number | null;
    partitionNo: string | null;
    flatOrShopNo: string | null;
    plotNo: string | null;
    surveyNo: string | null;
    upicId: string | null;
    subZoneNo: string | null;
    wingNo: string | null;
    noOfResidentialToilets: number | null;
    noOfCommercialToilets: number | null;
    totalBuiltupAreaSqFeet: number | null;
    totalCarpetAreaSqFeet: number | null;
    plotArea: number | null;
    plotAreaFtLength: number | null;
    plotAreaFtWidth: number | null;
    plotAreaMtrLength: number | null;
    plotAreaMtrWidth: number | null;
    wingId: number | null;
    wingName: string | null;
}

//  Response wrapper for Property Basic Details API.
export interface PropertyBasicDetailsResponse {
    success: boolean;
    message: string;
    items: PropertyBasicDetailsApiItem;
    errors: unknown | null;
}

export interface WingItem {
    wingId: number;
    wingNo: string;
    sequenceNo: number;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

export interface WingResponse {
    items: WingItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface TaxDetailsApiResponse {
    success: boolean;
    message: string;
    items: {
        propertyId: number;
        taxAmounts: TaxAmounts;
    };
    errors: string[] | null;
}

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

//  Represents a collection of tax amounts by tax name.
export type TaxAmounts = Record<string, number | undefined>;