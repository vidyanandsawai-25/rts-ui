import { useState, useCallback, useMemo } from "react";
import { BuildingPermissionState, PropertyCertificateWithStatusDto } from "@/types/building-permission.types";
import { mapApiToBuildingState, hasChangesComparedToInitial } from "@/lib/utils/building-helpers";

export const useBuildingFormState = (initialData: PropertyCertificateWithStatusDto[] | null) => {
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<number, { number?: string; date?: string; document?: string }>>({});
    const [incompleteCertificates, setIncompleteCertificates] = useState<{ id: number; name: string }[]>([]);
    const [buildingPermission, setBuildingPermission] = useState<BuildingPermissionState>(() =>
        mapApiToBuildingState(initialData)
    );

    const initialMappedState = useMemo(() => mapApiToBuildingState(initialData), [initialData]);
    const hasChanges = useMemo(() => hasChangesComparedToInitial(buildingPermission, initialMappedState), [buildingPermission, initialMappedState]);

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
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setIncompleteCertificates((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const handleToggleEnabled = useCallback((certificateTypeId: number, checked: boolean) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [certificateTypeId]: { ...prev[certificateTypeId], enabled: checked },
        }));
        clearError(certificateTypeId);
    }, [clearError]);

    const handleInputChange = useCallback((certificateTypeId: number, field: 'number' | 'date', value: string) => {
        setBuildingPermission((prev) => ({
            ...prev,
            [certificateTypeId]: { ...prev[certificateTypeId], [field]: value },
        }));
        clearError(certificateTypeId);
    }, [clearError]);

    return {
        buildingPermission,
        setBuildingPermission,
        hasChanges,
        validationErrors,
        setValidationErrors,
        fieldErrors,
        setFieldErrors,
        incompleteCertificates,
        setIncompleteCertificates,
        clearError,
        handleToggleEnabled,
        handleInputChange,
        initialMappedState
    };
};
