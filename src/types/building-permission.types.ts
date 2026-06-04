export type CertificateData = {
    enabled: boolean;
    number: string;
    date: string;
    documentGuid?: string;
    isUploading?: boolean;
    certificateTypeId: number;
    propertyCertificateId?: number | null;
    fileName?: string;
    certificateTypeName?: string;
    displayOrder?: number;
};

export type BuildingPermissionState = Record<number, CertificateData>;

export interface BuildingPermissionItems {
    propertyId: number;
    propertySocialId: number;
    buildingPermitNo: string | null;
    buildingPermitDate: string | null;
    buildingPermitDocumentGuid: string | null;
    commencementNo: string | null;
    commencementDate: string | null;
    commencementDocumentGuid: string | null;
    occupancyCertNo: string | null;
    occupancyCertDate: string | null;
    occupancyCertDocumentGuid: string | null;
    possessionCertNo: string | null;
    possessionCertDate: string | null;
    possessionCertDocumentGuid: string | null;
    index2No: string | null;
    index2Date: string | null;
    index2DocumentGuid: string | null;
    electricBillNo: string | null;
    electricBillDate: string | null;
    electricBillDocumentGuid: string | null;
    buildCompletionCertNo: string | null;
    buildCompletionDate: string | null;
    buildCompletionCertDocumentGuid: string | null;
}

export interface BuildingPermissionApiResponse {
    success: boolean;
    message: string;
    items: BuildingPermissionItems;
}

export interface PropertyCertificateWithStatusDto {
    certificateTypeId: number;
    certificateTypeName: string;
    displayOrder: number;
    hasCertificate: boolean;
    propertyCertificateId: number | null;
    isActive: boolean;
    certificateNo: string | null;
    issueDate: string | null;
    documentGuid: string | null;
    fileName: string | null;
}

export interface PropertyCertificateUploadResponseDto {
    propertyCertificateId: number;
    documentGuid: string;
    documentId: number;
    documentBindingId: number;
    propertyId: number;
    certificateTypeId: number;
    certificateNo: string | null;
    issueDate: string | null;
    fileName: string;
    fileSizeBytes: number;
    storagePath: string;
}

export interface PropertyCertificateItemDto {
    certificateTypeId: number;
    isEnabled: boolean;
    certificateNumber?: string | null;
    certificateDate?: string | null;
    propertyCertificateId?: number | null;
    existingDocumentGuid?: string | null;
    hasNewDocument: boolean;
}

export interface PropertyCertificateBulkSaveDto {
    propertyId: number;
    certificates: PropertyCertificateItemDto[];
}

export interface PropertyCertificateBulkSaveResponseDto {
    propertyId: number;
    totalProcessed: number;
    enabledCount: number;
    disabledCount: number;
    updatedCertificates: PropertyCertificateWithStatusDto[];
    errors: string[];
}

export interface BuildingFormProps {
    initialBuildingPermission: PropertyCertificateWithStatusDto[] | null;
    propertyId: string;
}
