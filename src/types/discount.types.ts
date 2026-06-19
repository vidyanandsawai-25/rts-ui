export interface DiscountAttributeState extends Omit<DiscountAttributeDto, 'intValue' | 'decimalValue'> {
    enabled: boolean;
    isUploading?: boolean;
    intValue?: number | string | null;
    decimalValue?: number | string | null;
}

export type DiscountState = Record<number, DiscountAttributeState>;


export interface DiscountAttributeDto {
    id: number;
    socialAttributeCode: string;
    socialAttributeName: string;
    dataType: string;
    unit?: string | null;
    displayOrder?: number | null;
    isDiscountApplicable: boolean;
    propertySocialDetailId?: number | null;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    documentGuid?: string | null;
    documentUrl?: string | null;
    remark?: string | null;
    isPhotoRequired?: boolean;
    isDocumentRequired?: boolean;
    isActive?: boolean;
}

export interface PropertyDiscountInfoResponseDto {
    propertyId: number;
    discountAttributes: DiscountAttributeDto[];
}

export interface DiscountDocumentUploadResponseDto {
    propertySocialDetailId: number;
    propertyId: number;
    socialAttributeId: number;
    documentBindingId: number;
    documentGuid: string;
    documentUrl: string;
    fileName: string;
    remark?: string | null;
}

export interface DiscountAttributeItemDto {
    propertySocialDetailId: number | null;
    socialAttributeId: number;
    bitValue?: boolean | null;
    intValue?: number | null;
    decimalValue?: number | null;
    textValue?: string | null;
    dateValue?: string | null;
    documentBindingId?: number | null;
    remark?: string | null;
    isActive?: boolean;
}

export interface UpsertPropertyDiscountInfoDto {
    propertyId: number;
    updatedBy: number;
    discountAttributes: DiscountAttributeItemDto[];
}


