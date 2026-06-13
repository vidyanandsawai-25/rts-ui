import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
    uploadCertificateDocumentAction,
    replaceCertificateDocumentAction,
    saveBuildingPermissionsAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action";
import {
    BuildingPermissionState,
    PropertyCertificateWithStatusDto
} from "@/types/building-permission.types";
import {
    mapApiToBuildingState,
    mapBuildingStateToApi,
    parseAndLocalizeBackendError
} from "@/lib/utils/building-helpers";
import { useLoading } from "@/hooks/useLoading";
import { validateBuildingForm } from "@/lib/utils/validateBuildingForm";

export const useBuildingForm = (
    initialData: PropertyCertificateWithStatusDto[] | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const [hasChanges, setHasChanges] = useState(false);
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [incompleteCertificates, setIncompleteCertificates] = useState<{ id: number; name: string }[]>([]);
    const [buildingPermission, setBuildingPermission] = useState<BuildingPermissionState>(() =>
        mapApiToBuildingState(initialData)
    );

    const [prevInitialData, setPrevInitialData] = useState(initialData);

    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        setBuildingPermission(mapApiToBuildingState(initialData));
    }

    const clearError = useCallback((id: number) => {
        setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setIncompleteCertificates((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const handleFileUpload = useCallback(async (certificateTypeId: number, file: File) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
        if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
            toast.error(t("building.uploadInvalidFile") || "Invalid file");
            return;
        }

        const certificate = buildingPermission[certificateTypeId];
        if (!certificate) {
            toast.error(t("building.errors.notFound") || "Certificate not found.");
            return;
        }
        const propId = Number(propertyId);
        if (!Number.isFinite(propId)) {
            toast.error(t("building.saveError") || "Invalid property ID");
            return;
        }
        const certTypeId = certificate.certificateTypeId;
        if (!Number.isFinite(certTypeId)) {
            toast.error(t("building.errors.notFound") || "Certificate type is missing.");
            return;
        }

        setBuildingPermission((prev) => ({
            ...prev,
            [certificateTypeId]: { ...prev[certificateTypeId], isUploading: true },
        }));

        try {
            const formData = new FormData();
            formData.append("File", file);

            let result;
            if (certificate.propertyCertificateId) {
                result = await replaceCertificateDocumentAction(certificate.propertyCertificateId, formData);
            } else {
                formData.append("PropertyId", propId.toString());
                formData.append("CertificateTypeId", certTypeId.toString());
                if (certificate.number) formData.append("CertificateNo", certificate.number);
                if (certificate.date) formData.append("IssueDate", certificate.date);
                result = await uploadCertificateDocumentAction(formData);
            }

            if (result.success && result.data) {
                const responseData = result.data;
                setBuildingPermission((prev) => ({
                    ...prev,
                    [certificateTypeId]: {
                        ...prev[certificateTypeId],
                        documentGuid: responseData.documentGuid,
                        propertyCertificateId: responseData.propertyCertificateId,
                        fileName: responseData.fileName,
                        isUploading: false,
                    },
                }));
                clearError(certificateTypeId);
                setHasChanges(true);
                toast.success(t("building.uploadSuccess") || "File uploaded successfully!");
            } else {
                throw new Error(result.error || t("building.uploadError"));
            }
        } catch (error: unknown) {
            setBuildingPermission((prev) => ({
                ...prev,
                [certificateTypeId]: { ...prev[certificateTypeId], isUploading: false },
            }));
            const msg = error instanceof Error ? error.message : "Failed to upload document";
            toast.error(msg || t("building.uploadError") || "Error uploading document!");
        }
    }, [buildingPermission, propertyId, t, clearError]);

    const handleToggleEnabled = useCallback((certificateTypeId: number, checked: boolean) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [certificateTypeId]: { ...prev[certificateTypeId], enabled: checked },
        }));
        clearError(certificateTypeId);
        setHasChanges(true);
    }, [clearError]);

    const handleInputChange = useCallback((certificateTypeId: number, field: 'number' | 'date', value: string) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [certificateTypeId]: { ...prev[certificateTypeId], [field]: value },
        }));
        clearError(certificateTypeId);
        setHasChanges(true);
    }, [clearError]);

    const params = useParams();
    const locale = params.locale as string;

    const handleSave = async () => {
        if (isSaving) return { success: false, isValid: true };

        const { isValid, errors, incompleteCertificates: invalidCerts } = validateBuildingForm(
            buildingPermission, (key, params) => t(`common.${key}`, params)
        );

        if (!isValid) {
            setValidationErrors(errors);
            setIncompleteCertificates(invalidCerts);
            return { success: false, isValid: false, incompleteCertificates: invalidCerts };
        }

        setValidationErrors({});
        setIncompleteCertificates([]);
        startLoading();
        try {
            const payload = mapBuildingStateToApi(buildingPermission, parseInt(propertyId));
            const response = await saveBuildingPermissionsAction(locale, propertyId, payload);

            if (response.success) {
                setHasChanges(false);
                toast.success(t("building.saveSuccess") || "Building permissions saved successfully!");
                return { success: true, isValid: true };
            } else {
                let displayError = t("building.saveError") || "Error saving building permissions!";
                if (response.error) {
                    displayError = parseAndLocalizeBackendError(response.error, buildingPermission, (key) => t(key));
                }
                toast.error(displayError);
                return { success: false, isValid: true };
            }
        } catch (error: unknown) {
            const rawMsg = error instanceof Error ? error.message : "";
            let displayError = t("building.saveError") || "Error saving building permissions!";
            if (rawMsg) {
                displayError = parseAndLocalizeBackendError(rawMsg, buildingPermission, (key) => t(key));
            }
            toast.error(displayError);
            return { success: false, isValid: true };
        } finally {
            stopLoading();
        }
    };

    return {
        buildingPermission,
        hasChanges,
        isSaving,
        validationErrors,
        incompleteCertificates,
        handleFileUpload,
        handleToggleEnabled,
        handleInputChange,
        handleSave,
        t
    };
};
