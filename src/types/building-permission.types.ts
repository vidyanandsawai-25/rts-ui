export type BuildingKey =
    | "buildingPermit"
    | "commencementCertificate"
    | "occupancyCertificate"
    | "possessionCertificate"
    | "index2"
    | "electricBill"
    | "buildCompletionCertificate";

export type CertificateData = {
    enabled: boolean;
    number: string;
    date: string;
    documentGuid?: string;
    isUploading?: boolean;
};

export type BuildingPermissionState = Record<BuildingKey, CertificateData>;

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

export interface BuildingFormProps {
    initialBuildingPermission: BuildingPermissionApiResponse | null;
    propertyId: string;
}
