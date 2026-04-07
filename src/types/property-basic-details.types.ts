/* -------------------------------------------------------------------------- */
/*                              PROPERTY API TYPES                            */
/* -------------------------------------------------------------------------- */

/**
 * Represents a single property item as returned by the Property API.
 * Endpoint: GET /api/Property?PropertyId={id}
 */
export interface PropertyApiItem {
    propertyId: number;
    taxZoneId: number;
    wardId: number;
    propertyNo: string;
    partitionNo: string;
    propertyTypeId: number;
    upicId: string;
    openPlot: boolean;
    csn: string;
    subZoneNo: string;
    plotNo: string;
    categoryId: number;
    type: string | null;
    partType: string | null;
    ownerTitle: string | null;
    ownerName: string;
    ownerTitleEnglish: string | null;
    ownerNameEnglish: string;
    occupierTitle: string | null;
    occupierName: string;
    occupierTitleEnglish: string | null;
    occupierNameEnglish: string;
    flatOrShopNo: string;
    flatOrShopName: string;
    flatOrShopNoEnglish: string;
    flatOrShopNameEnglish: string;
    address: string;
    location: string;
    addressEnglish: string;
    locationEnglish: string;
    mobileNo: string;
    emailId: string;
    societyDetailId: number | null;
    markedForDeletion: boolean;
    displayProperty: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
}

/**
 * Paginated response wrapper for the Property API.
 */
export interface PropertyApiPaginatedResponse {
    items: PropertyApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

/**
 * Represents a single property detail item (floor/unit) as returned by the PropertyDetails API.
 * Endpoint: GET /api/PropertyDetails?PropertyId={id}
 */
export interface PropertyDetailsApiItem {
    propertyDetailsId: number;
    propertyId: number;
    floorId: number;
    subFloorId: number;
    constructionYear: string;
    assessmentYear: string;
    constructionTypeId: number;
    typeOfUseId: number;
    carpetAreaSqMeter: number | null;
    carpetAreaSqFeet: number | null;
    builtupAreaSqMeter: number | null;
    builtupAreaSqFeet: number | null;
    noOfRooms: number;
    renterYesNO: boolean;
    rentMonthly: number;
    rentYearly: number | null;
    nonCalculateRentMonthly: number;
    renterNameEnglish: string;
    renterName: string;
    agreementFromDate: string;
    agreementDate: string | null;
    agreementToDate: string | null;
    subTypeOfUseId: number;
    taxLiability: string;
    isTaxable: boolean;
    occupancyDate: string;
    occupancyApplyOrNot: boolean;
    occupancyNumber: string;
    markedForDeletion: boolean;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
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
/**
 * Paginated response wrapper for the PropertyDetails API.
 */
export interface PropertyDetailsApiResponse {
    items: PropertyDetailsApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}
/**
 * Represents a single owner type item as returned by the OwnerType API.
 * Endpoint: GET /api/OwnerType?PageSize=20
 */
export interface OwnerTypeApiItem {
    ownerTypeId: number;
    ownerType: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

/**
 * Paginated response wrapper for the OwnerType API.
 */
export interface OwnerTypeApiResponse {
    items: OwnerTypeApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}
/**
 * Represents a single property type item as returned by the PropertyType API.
 * Endpoint: GET /api/PropertyType?PageSize=200
 */
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

/**
 * Paginated response wrapper for the PropertyType API.
 */
export interface PropertyTypeApiResponse {
    items: PropertyTypeApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}
/**
 * Represents a single property assessment item as returned by the PropertyAssessment API.
 * Endpoint: GET /api/PropertyAssessment?PropertyId={id}
 */
export interface PropertyAssessmentApiItem {
    propertyDetailsId: number;
    propertyId: number;
    ownerTypeId: number;
    wingName: string;
    wingId: number;
    wingNo: string;
    assessmentRemark: string;
    surveyRemark: string;
    flatSystemRemark: string;
    combPropRemark: string;
    adharCardNo: string;
    managerMobileNo: string;
    renterMobileNo: string;
    secretaryMobileNo: string;
    assessmentNo: string;
    prarupYadiPublishDate: string;
    antimYadiPublishDate: string;
    propertyRegDate: string | null;
    applyTaxesFrom: string | null;
    partOCDate: string | null;
    bhk: string;
    blockNo: string;
    usageCategoryId: number;
    alternetivEmailId: string | null;
    totalBuiltupAreaSqFeet: number | null;
    totalBuiltupAreaSqMeter: number;
    latitude: string;
    longitude: string;
    noOfResidentialToilets: number;
    noOfCommercialToilets: number;
    markedForDeletion: boolean;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
}

/**
 * Paginated response wrapper for the PropertyAssessment API.
 */
export interface PropertyAssessmentApiResponse {
    items: PropertyAssessmentApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

/**
 * Represents a property description item.
 */
export interface PropertyDescriptionApiItem {
    propertyDescriptionId: number;
    description: string;
}

/**
 * Represents a property category item from PropertyCategory API.
 * Endpoint: GET /api/PropertyCategory
 */
export interface PropertyCategoryApiItem {
    propertyCategoryId: number;
    propertyCategoryName: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string | null;
}

/**
 * Paginated response wrapper for the PropertyCategory API.
 */
export interface PropertyCategoryApiResponse {
    items: PropertyCategoryApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

/**
 * Represents a property category item.
 */
export interface CategoryApiItem {
    categoryId: number;
    categoryName: string;
}

/**
 * Represents a property subcategory item.
 */
export interface SubCategoryApiItem {
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
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

/**
 * Represents the DTO for updating property basic details.
 * Matches UpdatePropertyBasicDetailsDto in C#
 */
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

/**
 * Response wrapper for Property Basic Details API.
 */
export interface PropertyBasicDetailsResponse {
    success: boolean;
    message: string;
    items: PropertyBasicDetailsApiItem;
    errors: any | null;
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

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };
/**
 * Represents a collection of tax amounts by tax name.
 */
export type TaxAmounts = Record<string, number | undefined>;