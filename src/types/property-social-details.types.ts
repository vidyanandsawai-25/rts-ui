export interface SocialAttributeHierarchyDto {
    id: number;
    socialAttributeCode: string;
    socialAttributeName: string;
    dataType: string;
    unit?: string | null;
    displayOrder?: number | null;
    parentAttributeId?: number | null;
    isRequiredWhenParentTrue: boolean;
    isDiscountApplicable: boolean;
    propertySocialDetailId?: number | null;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    photoTypeId?: number | null;
    isPhotoRequired?: boolean;
    isDocumentRequired?: boolean;
    isActive?: boolean;
    children: SocialAttributeHierarchyDto[];
}

export interface PropertySocialInfoResponseDto {
    propertyId: number;
    socialAttributes: SocialAttributeHierarchyDto[];
}

export interface PropertySocialDetailsDto {
    id: number;
    propertyId: number;
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    socialAttributeCode?: string | null;
    socialAttributeName?: string | null;
    isActive?: boolean;
}

export interface PropertySocialInfoItemDto {
    id?: number | null; // This corresponds to the PropertySocialDetailId in C# if existing
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
}

export interface PropertySocialInfoApiResponse {
    success: boolean;
    message: string;
    items?: PropertySocialInfoResponseDto;
}

export interface UpsertPropertySocialInfoApiResponse {
    success: boolean;
    message: string;
    items?: PropertySocialDetailsDto[];
}

export interface UpsertPropertySocialInfoDto {
    propertyId: number;
    updatedBy: number;
    socialAttributes: PropertySocialInfoItemDto[];
    socialAttributeIdsToRemove: number[];
}
