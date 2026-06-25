import { useState, useCallback, useEffect, useMemo } from 'react';
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
    parseAndLocalizeBackendError,
    hasChangesComparedToInitial
} from "@/lib/utils/building-helpers";
import { useLoading } from "@/hooks/useLoading";
import { validateBuildingForm } from "@/lib/utils/validateBuildingForm";
import { uploadPendingFiles } from "@/lib/utils/building-upload-helper";

export const useBuildingForm = (
    initialData: PropertyCertificateWithStatusDto[] | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<number, { number?: string; date?: string; document?: string }>>({});
    const [incompleteCertificates, setIncompleteCertificates] = useState<{ id: number; name: string }[]>([]);
    const [buildingPermission, setBuildingPermission] = useState<BuildingPermissionState>(() =>
        mapApiToBuildingState(initialData)
    );

    const initialMappedState = useMemo(() =>
        mapApiToBuildingState(initialData),
        [initialData]
    );

    const hasChanges = useMemo(() => {
        return hasChangesComparedToInitial(buildingPermission, initialMappedState);
    }, [buildingPermission, initialMappedState]);

    const [prevInitialData, setPrevInitialData] = useState(initialData);
    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        setBuildingPermission(mapApiToBuildingState(initialData));
    }

    const clearError = useCallback((id: number) => {
        setValidationErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setFieldErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setIncompleteCertificates((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const handleFileUpload = useCallback(async (id: number, file: File) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
        if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
            toast.error(t("building.uploadInvalidFile") || "Invalid file");
            return;
        }
        if (!buildingPermission[id]) {
            toast.error(t("building.errors.notFound") || "Certificate not found.");
            return;
        }
        setBuildingPermission((prev) => ({
            ...prev,
            [id]: { ...prev[id], pendingFile: file, fileName: file.name, documentGuid: undefined },
        }));
        clearError(id);
    }, [buildingPermission, t, clearError]);

    const handleFileDelete = useCallback((id: number) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [id]: { ...prev[id], pendingFile: undefined, fileName: undefined, documentGuid: undefined }
        }));
        clearError(id);
    }, [clearError]);

    const handleToggleEnabled = useCallback((id: number, checked: boolean) => {
        setBuildingPermission((prev) => ({ ...prev, [id]: { ...prev[id], enabled: checked } }));
        clearError(id);
    }, [clearError]);

    const handleInputChange = useCallback((id: number, field: 'number' | 'date', value: string) => {
        setBuildingPermission((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
        clearError(id);
    }, [clearError]);

    const params = useParams();
    const locale = params.locale as string;

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as unknown as { __buildingFormHasChanges?: boolean }).__buildingFormHasChanges = hasChanges;
        }
        return () => {
            if (typeof window !== "undefined") {
                delete (window as unknown as { __buildingFormHasChanges?: boolean }).__buildingFormHasChanges;
            }
        };
    }, [hasChanges]);

    const handleSave = async () => {
        if (isSaving) return { success: false, isValid: true };

        const { isValid, errors, incompleteCertificates: invalidCerts, fieldErrors: fErrors } = validateBuildingForm(
            buildingPermission,
            (key, params) => key.startsWith("building.") ? t(key, params) : t(`common.${key}`, params)
        );

        if (!isValid) {
            setValidationErrors(errors);
            setFieldErrors(fErrors || {});
            setIncompleteCertificates(invalidCerts);
            return { success: false, isValid: false, incompleteCertificates: invalidCerts };
        }

        setValidationErrors({});
        setFieldErrors({});
        setIncompleteCertificates([]);
        startLoading();

        const uploadResult = await uploadPendingFiles(
            buildingPermission,
            propertyId,
            { uploadCertificateDocumentAction, replaceCertificateDocumentAction },
            (key) => t(key)
        );

        if (!uploadResult.success) {
            stopLoading();
            setBuildingPermission(uploadResult.updatedState);
            toast.error(uploadResult.error || t("building.uploadError"));
            return { success: false, isValid: true };
        }

        const updatedPermissionState = uploadResult.updatedState;
        const propId = Number(propertyId);

        try {
            const payload = mapBuildingStateToApi(updatedPermissionState, propId);
            const response = await saveBuildingPermissionsAction(locale, propertyId, payload);

            setBuildingPermission(updatedPermissionState);
            if (response.success) {
                toast.success(t("building.saveSuccess") || "Building permissions saved successfully!");
                return { success: true, isValid: true };
            }
            throw new Error(response.error);
        } catch (error: unknown) {
            setBuildingPermission(updatedPermissionState);
            const msg = error instanceof Error ? error.message : "";
            const displayError = msg 
                ? parseAndLocalizeBackendError(msg, updatedPermissionState, (key) => t(key))
                : (t("building.saveError") || "Error saving building permissions!");
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
        fieldErrors,
        incompleteCertificates,
        handleFileUpload,
        handleFileDelete,
        handleToggleEnabled,
        handleInputChange,
        handleSave,
        t
    };
};
