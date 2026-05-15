import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { uploadDocumentAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions";
import {
    createBuildingPermissionsAction,
    updateBuildingPermissionsAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action";
import {
    BuildingKey,
    BuildingPermissionState,
    BuildingPermissionApiResponse
} from "@/types/building-permission.types";
import {
    mapApiToBuildingState,
    mapBuildingStateToApi
} from "@/lib/utils/building-helpers";
import { useLoading } from "@/hooks/useLoading";
import { validateBuildingForm } from "@/lib/utils/validateBuildingForm";

export const useBuildingForm = (
    initialData: BuildingPermissionApiResponse | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const [hasChanges, setHasChanges] = useState(false);
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);

    const [buildingPermission, setBuildingPermission] = useState<BuildingPermissionState>(
        mapApiToBuildingState(initialData?.items)
    );

    const handleFileUpload = useCallback(async (key: BuildingKey, file: File) => {
                // File validation: type and size
                const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
                if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
                    toast.error(t("building.uploadInvalidFile") || "Invalid file");
                    return;
                }
        const typeMapping: Record<BuildingKey, string> = {
            buildingPermit: "BuildingPermit",
            commencementCertificate: "Commencement",
            occupancyCertificate: "OccupancyCert",
            possessionCertificate: "PossessionCert",
            index2: "Index2",
            electricBill: "ElectricBill",
            buildCompletionCertificate: "BuildCompletionCert",
        };

        setBuildingPermission((prev) => ({
            ...prev,
            [key]: { ...prev[key], isUploading: true },
        }));

        try {
            const formData = new FormData();
            formData.append("File", file);
            formData.append("GroupKey", "PropertyBuildingPermission");
            formData.append("FileTypeName", typeMapping[key]);

            const result = await uploadDocumentAction(formData);

            if (result.success && result.data) {
                const docData = result.data;
                setBuildingPermission((prev) => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        documentGuid: typeof docData === 'string' ? docData : docData.documentGuid,
                        isUploading: false,
                    },
                }));
                setHasChanges(true);
                toast.success(t("building.uploadSuccess"));
            } else {
                throw new Error(result.error || t("building.uploadError"));
            }
        } catch (_error) {
            setBuildingPermission((prev) => ({
                ...prev,
                [key]: { ...prev[key], isUploading: false },
            }));
            toast.error(t("building.uploadError"));
        }
    }, [t]);

    const handleToggleEnabled = useCallback((key: BuildingKey, checked: boolean) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                enabled: checked,
                number: checked ? prev[key].number : "",
                date: checked ? prev[key].date : "",
                documentGuid: checked ? prev[key].documentGuid : undefined,
            },
        }));
        setHasChanges(true);
    }, []);

    const handleInputChange = useCallback((key: BuildingKey, field: 'number' | 'date', value: string) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
        setHasChanges(true);
    }, []);

    const params = useParams();
    const locale = params.locale as string;

    const handleSave = async () => {
        // Validate
        const { isValid, errors } = validateBuildingForm(buildingPermission, (key) => t(`common.${key}`));

        if (!isValid) {
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            return;
        }

        startLoading();
        try {
            const mappedData = mapBuildingStateToApi(buildingPermission);
            const payload = {
                ...initialData?.items,
                ...mappedData,
                propertyId: parseInt(propertyId)
            };

            let response;
            if (!initialData?.items) {
                response = await createBuildingPermissionsAction(locale, propertyId, payload);
            } else {
                response = await updateBuildingPermissionsAction(locale, propertyId, payload);
            }

            if (response.success) {
                setHasChanges(false);
                toast.success(t("building.saveSuccess") || "Building permissions saved successfully!");
            } else {
                toast.error(response.error || t("building.saveError") || "Error saving building permissions!");
            }
        } catch (_error) {
            toast.error(t("building.saveError") || "Error saving building permissions!");
        } finally {
            stopLoading();
        }
    };

    return {
        buildingPermission,
        hasChanges,
        isSaving,
        handleFileUpload,
        handleToggleEnabled,
        handleInputChange,
        handleSave,
        t
    };
};
