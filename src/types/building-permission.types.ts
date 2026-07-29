import type { FloorResponse, ConstructionTypeResponse, TypeOfUseApiItem, SubFloorResponse, SubTypeOfUseResponse } from '@/types/floor-details.types';
import type { FloorData } from '@/types/room-details.types';

export type CertificateData = {
    enabled: boolean;
    number: string;
    date: string;
    documentGuid?: string;
    isUploading?: boolean;
    isDeleting?: boolean;
    certificateTypeId: number;
    propertyCertificateId?: number | null;
    fileName?: string;
    certificateTypeName?: string;
    certificateTypeCode?: string;
    displayOrder?: number;
    pendingFile?: File;
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

export enum CertificateScope {
    Property = 0,
    Floor = 1
}

export interface PropertyCertificateWithStatusDto {
    certificateTypeId: number;
    certificateTypeName: string;
    certificateTypeCode?: string;
    displayOrder: number;
    hasCertificate: boolean;
    propertyCertificateId: number | null;
    isActive: boolean;
    certificateNo: string | null;
    issueDate: string | null;
    documentGuid: string | null;
    fileName: string | null;
    propertyDetailsId?: number | null;
}

export interface FloorCertificateDto {
    propertyDetailsId: number;
    propertyId: number;
    floorDescription?: string | null;
    subFloorDescription?: string | null;
    constructionYear?: string | null;
    assessmentYear?: string | null;
    constructionTypeDescription?: string | null;
    typeOfUseDescription?: string | null;
    subTypeOfUseDescription?: string | null;
    carpetAreaSqFeet?: number | null;
    carpetAreaSqMeter?: number | null;
    builtupAreaSqFeet?: number | null;
    builtupAreaSqMeter?: number | null;
    isSelected: boolean;
    certificateApplicable: boolean;
    ccDate?: string | null;
    ocDate?: string | null;
    electricBillDate?: string | null;
    ccCertificateNo?: string | null;
    ocCertificateNo?: string | null;
    electricBillNo?: string | null;
}

export interface FloorCertificatesResponseDto {
    propertyId: number;
    selectedPropertyDetailsId?: number | null;
    selectedFloor?: FloorCertificateDto | null;
    otherFloors: FloorCertificateDto[];
    propertyWiseCertificates: PropertyCertificateWithStatusDto[];
}

export interface SaveCertificateRequestDto {
    propertyId: number;
    propertyDetailsId?: number | null;
    certificateScope: CertificateScope;
    certificateTypeId: number;
    certificateNo?: string | null;
    certificateIssueDate?: string | null;
    isPrimaryDocument?: boolean;
}

export interface SaveCertificateResponseDto {
    propertyCertificateId: number;
    propertyId: number;
    propertyDetailsId?: number | null;
    certificateScope: CertificateScope;
    certificateTypeId: number;
    certificateNo?: string | null;
    certificateIssueDate?: string | null;
    documentGuid?: string | null;
    documentBindingId?: number | null;
    taxRecalculationTriggered: boolean;
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
    propertyDetailsId?: number | null;
    existingDocumentGuid?: string | null;
    hasNewDocument: boolean;
    markedForDeletion?: boolean | null;
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
    initialFloorCertificates?: FloorCertificatesResponseDto | null;
    propertyId: string;
    floorData?: FloorResponse[];
    constructionTypeData?: ConstructionTypeResponse[];
    useData?: TypeOfUseApiItem[];
    subFloorData?: SubFloorResponse[];
    subTypeData?: SubTypeOfUseResponse[];
    initialFloors?: FloorData[];
}
