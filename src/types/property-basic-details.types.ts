// PROPERTY API TYPES    
import { PropertySocietyDetailsApiItem } from "./property-society-details.types";

// Represents an owner type item from OwnerType API. Endpoint: GET /api/OwnerType
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
    id: number;
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

// Represents an owner type item from OwnerType API. Endpoint: GET /api/OwnerType
export interface PropertyCategoryApiItem {
    id: number;
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
    upicId: string | null;
    subZoneNo: string;
    moujaId: number | null;
    moujaName: string | null;
    wingNo: string | null;
    noOfResidentialToilets: number | null;
    noOfCommercialToilets: number | null;
    totalCarpetAreaSqMeter: number;
    totalBuiltupAreaSqMeter: number;
    totalCarpetAreaSqFeet: number;
    totalBuiltupAreaSqFeet: number;
    plotArea: number | null;
    plotAreaFtLength: number;
    plotAreaFtWidth: number;
    plotAreaMtrLength: number;
    plotAreaMtrWidth: number;
    wingId: number | null;
    wingName: string | null;
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
    moujaId: number | null;
    moujaName: string | null;
    wingNo: string | null;
    noOfResidentialToilets: number | null;
    noOfCommercialToilets: number | null;
    totalBuiltupAreaSqFeet: number | null;
    totalCarpetAreaSqFeet: number | null;
    totalBuiltupAreaSqMeter: number | null;
    totalCarpetAreaSqMeter: number | null;
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
    id: number;
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

export interface PropertyFormViewProps {
    WingMaster: WingItem[],
    propertyCategories: PropertyCategoryApiItem[],
    propertyDescriptions: PropertyTypeApiItem[],
    propertyData: PropertyBasicDetailsApiItem | null;
    propertySocietyDetails: PropertySocietyDetailsApiItem | null;
    locale: string;
}

export interface Tab {
    label: string;
    href: string;
    icon: React.ElementType;
}

export interface DrawerShellProps {
    children: React.ReactNode;
    locale: string;
}
export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

//  Represents a collection of tax amounts by tax name.
export type TaxAmounts = Record<string, number | undefined>;