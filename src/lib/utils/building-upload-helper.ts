import { ApiResponse } from "@/types/common.types";
import { BuildingPermissionState, PropertyCertificateUploadResponseDto } from "@/types/building-permission.types";

interface UploadActions {
  uploadCertificateDocumentAction: (formData: FormData) => Promise<ApiResponse<PropertyCertificateUploadResponseDto>>;
  replaceCertificateDocumentAction: (propertyCertificateId: number, formData: FormData) => Promise<ApiResponse<PropertyCertificateUploadResponseDto>>;
}

export async function uploadPendingFiles(
    buildingPermission: BuildingPermissionState,
    propertyId: string,
    actions: UploadActions,
    t: (key: string) => string
): Promise<{ success: boolean; updatedState: BuildingPermissionState; error?: string }> {
    const updatedState = { ...buildingPermission };
    const propId = Number(propertyId);

    for (const [_, cert] of Object.entries(buildingPermission)) {
        if (cert.pendingFile) {
            const certTypeId = cert.certificateTypeId;
            const file = cert.pendingFile;

            try {
                const formData = new FormData();
                formData.append("File", file);

                let result;
                if (cert.propertyCertificateId) {
                    result = await actions.replaceCertificateDocumentAction(cert.propertyCertificateId, formData);
                } else {
                    formData.append("PropertyId", propId.toString());
                    formData.append("CertificateTypeId", certTypeId.toString());
                    if (cert.number) formData.append("CertificateNo", cert.number);
                    if (cert.date) formData.append("IssueDate", cert.date);
                    result = await actions.uploadCertificateDocumentAction(formData);
                }

                if (result.success && result.data) {
                    updatedState[certTypeId] = {
                        ...updatedState[certTypeId],
                        documentGuid: result.data.documentGuid,
                        propertyCertificateId: result.data.propertyCertificateId,
                        fileName: result.data.fileName,
                        pendingFile: undefined,
                    };
                } else {
                    return {
                        success: false,
                        updatedState,
                        error: `${cert.certificateTypeName || "Document"}: ${result.error || t("building.uploadError")}`
                    };
                }
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : "Failed to upload document";
                return {
                    success: false,
                    updatedState,
                    error: `${cert.certificateTypeName || "Document"}: ${msg}`
                };
            }
        }
    }

    return { success: true, updatedState };
}
