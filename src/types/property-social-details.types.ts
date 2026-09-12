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
    documentGuid?: string | null;
    photoBindingId?: number | null;
    photoGuid?: string | null;
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
     documentGuid?: string | null;
    photoGuid?: string | null;
    photoBindingId?: number | null;
    isPhotoRequired?: boolean;
    isDocumentRequired?: boolean;
}

export interface PropertySocialInfoItemDto {
    id?: number; // This corresponds to the PropertySocialDetailId in C# if existing
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    isActive?: boolean;
    documentGuid?: string | null;
    photoGuid?: string | null;
    photoBindingId?: number | null;
    isPhotoRequired?: boolean;
    isDocumentRequired?: boolean;
}

export interface CreatePropertySocialDetailDto {
    // isActive: boolean;
    createdBy: number;
    propertyId: number | null;
    socialAttributeId: number;
    wingDetailId: number | null;
    societyDetailId: number | null;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
}

export interface CreateBulkPropertySocialDetailDto {
    isActive: boolean;
    createdBy: number;
    propertyIds: string | null;
    socialAttributeId: number;
    wingDetailId: number | null;
    societyDetailId: number | null;
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
    propertyId: number | null;
    societyDetailId?: number | null;
    wingDetailId?: number | null;
    propertyIds?: string | null;
    updatedBy: number;
    socialAttributes: PropertySocialInfoItemDto[];
    socialAttributeIdsToRemove: number[];
}
