import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { saveBuildingPermissionsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Building/action";
import { PropertyCertificateWithStatusDto } from "@/types/building-permission.types";
import { mapBuildingStateToApi, parseAndLocalizeBackendError } from "@/lib/utils/building-helpers";
import { useLoading } from "@/hooks/useLoading";
import { validateBuildingForm } from "@/lib/utils/validateBuildingForm";
import { useBuildingFormState } from "./useBuildingFormState";
import { useBuildingFileUpload } from "./useBuildingFileUpload";

export const useBuildingForm = (
    initialData: PropertyCertificateWithStatusDto[] | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const params = useParams();
    const locale = params.locale as string;
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);

    const {
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
        handleInputChange
    } = useBuildingFormState(initialData);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as unknown as { __buildingFormHasChanges?: boolean }).__buildingFormHasChanges = hasChanges;
        }
        return () => {
            if (typeof window !== 'undefined') {
                (window as unknown as { __buildingFormHasChanges?: boolean }).__buildingFormHasChanges = false;
            }
        };
    }, [hasChanges]);

    const handleSave = useCallback(async (opts?: {
        skipDocumentValidation?: boolean;
        skipNumberDateValidation?: boolean;
        skipRevalidate?: boolean;
        silent?: boolean;
        onlyCertificateTypeId?: number;
    }): Promise<{
        success: boolean;
        isValid: boolean;
        incompleteCertificates?: { id: number; name: string }[];
        updatedCertificates?: PropertyCertificateWithStatusDto[];
    }> => {
        if (isSaving) return { success: false, isValid: true };

        const { isValid, errors, incompleteCertificates: invalidCerts, fieldErrors: fErrors } = validateBuildingForm(
            buildingPermission,
            (key, params) => {
                if (key.startsWith("building.")) {
                    return t(key, params);
                }
                return t(`common.${key}`, params);
            },
            {
                skipDocumentValidation: opts?.skipDocumentValidation,
                skipNumberDateValidation: opts?.skipNumberDateValidation,
                onlyCertificateTypeId: opts?.onlyCertificateTypeId
            }
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

        try {
            const formData = new FormData();
            const payload = mapBuildingStateToApi(
                buildingPermission,
                parseInt(propertyId),
                opts?.onlyCertificateTypeId,
                opts?.skipNumberDateValidation
            );
            formData.append("certificates", JSON.stringify(payload));

            // Append pending files
            Object.values(buildingPermission).forEach(item => {
                if (item.enabled && item.pendingFile) {
                    formData.append(`file_${item.certificateTypeId}`, item.pendingFile);
                }
            });

            const response = opts?.skipRevalidate !== undefined
                ? await saveBuildingPermissionsAction(locale, propertyId, formData, opts.skipRevalidate)
                : await saveBuildingPermissionsAction(locale, propertyId, formData);

            if (response.success) {
                if (!opts?.silent) {
                    toast.success(t("building.saveSuccess") || "Building permissions saved successfully!");
                }
                return { success: true, isValid: true };
            } else {
                const displayError = response.error 
                    ? parseAndLocalizeBackendError(response.error, buildingPermission, (key) => t(key))
                    : (t("building.saveError") || "Error saving building permissions!");
                toast.error(displayError);
                return { success: false, isValid: true };
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "";
            const displayError = msg 
                ? parseAndLocalizeBackendError(msg, buildingPermission, (key) => t(key))
                : (t("building.saveError") || "Error saving building permissions!");
            toast.error(displayError);
            return { success: false, isValid: true };
        } finally {
            stopLoading();
        }
    }, [buildingPermission, isSaving, locale, propertyId, startLoading, stopLoading, t, setFieldErrors, setIncompleteCertificates, setValidationErrors]);

    const { handleFileUpload, handleFileDelete } = useBuildingFileUpload(
        buildingPermission,
        setBuildingPermission,
        clearError,
        t as unknown as (key: string, values?: Record<string, string | number>) => string
    );

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
