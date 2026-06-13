import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    updateDiscountDetailsAction,
    uploadDiscountDocumentAction,
    replaceDiscountDocumentAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/action";
import {
    DiscountState,
    PropertyDiscountInfoResponseDto
} from "@/types/discount.types";
import { useTranslations } from "next-intl";

import { mapApiToDiscountState, mapDiscountStateToApi } from "@/lib/utils/discount-helpers";
import { validateDiscountForm } from "@/lib/utils/validateDiscountForm";

export const useDiscountForm = (
    initialDiscountData: PropertyDiscountInfoResponseDto | null,
    propertyId: string
) => {
    const t = useTranslations('quickDataEntry');
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [incompleteDiscounts, setIncompleteDiscounts] = useState<{ id: number; name: string }[]>([]);
    
    const params = useParams();
    const locale = params.locale as string;

    const [discountData, setDiscountData] = useState<DiscountState>(() =>
        mapApiToDiscountState(initialDiscountData)
    );

    const [prevInitialDiscountData, setPrevInitialDiscountData] = useState(initialDiscountData);

    if (initialDiscountData !== prevInitialDiscountData) {
        setPrevInitialDiscountData(initialDiscountData);
        setDiscountData(mapApiToDiscountState(initialDiscountData));
    }

    const clearError = useCallback((id: number) => {
        setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setIncompleteDiscounts((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const handleToggleEnabled = useCallback((id: number, checked: boolean) => {
        setDiscountData((prev) => {
            const item = prev[id];
            if (!item) return prev;
            return {
                ...prev,
                [id]: { ...item, enabled: checked },
            };
        });
        clearError(id);
        setHasChanges(true);
    }, [clearError]);

    const handleInputChange = useCallback((
        id: number,
        field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark",
        value: string
    ) => {
        setDiscountData((prev) => {
            const item = prev[id];
            if (!item) return prev;

            return {
                ...prev,
                [id]: { ...item, [field]: value },
            };
        });
        clearError(id);
        setHasChanges(true);
    }, [clearError]);

    const handleFileUpload = useCallback(async (id: number, file: File) => {
        if (file.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
            toast.error(t("discount.uploadInvalidFile") || "Invalid file");
            return;
        }

        const item = discountData[id];
        if (!item) return;

        setDiscountData(prev => ({
            ...prev,
            [id]: { ...prev[id], isUploading: true }
        }));

        try {
            const formData = new FormData();
            formData.append("File", file);

            const hasDetailId = !!item.propertySocialDetailId;
            if (!hasDetailId) {
                formData.append("PropertyId", String(propertyId));
                formData.append("SocialAttributeId", String(id));
            }

            const result = hasDetailId
                ? await replaceDiscountDocumentAction(item.propertySocialDetailId!, formData)
                : await uploadDiscountDocumentAction(formData);

            if (result.success && result.data) {
                const docData = result.data;

                setDiscountData(prev => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        propertySocialDetailId: docData.propertySocialDetailId,
                        documentBindingId: docData.documentBindingId,
                        documentGuid: docData.documentGuid,
                        documentUrl: `/api/documents/${encodeURIComponent(docData.documentGuid)}/view`,
                        isUploading: false
                    }
                }));
                clearError(id);
                setHasChanges(true);
                toast.success(t("discount.uploadSuccess") || "File uploaded successfully!");
            } else {
                throw new Error(result.error || t("discount.uploadError"));
            }
        } catch (error: unknown) {
            setDiscountData(prev => ({
                ...prev,
                [id]: { ...prev[id], isUploading: false }
            }));
            const message = error instanceof Error ? error.message : String(error);
            toast.error(message || t("discount.uploadError"));
        }
    }, [discountData, propertyId, t, clearError]);

    const handleSave = async () => {
        if (isSaving) return { success: false, isValid: true };

        const { isValid, errors, incompleteDiscounts: invalidDiscounts } = validateDiscountForm(
            discountData, (key, params) => t(key, params)
        );

        if (!isValid) {
            setValidationErrors(errors);
            setIncompleteDiscounts(invalidDiscounts);
            return { success: false, isValid: false, incompleteDiscounts: invalidDiscounts };
        }

        setValidationErrors({});
        setIncompleteDiscounts([]);
        startLoading();
        try {
            const mappedData = mapDiscountStateToApi(discountData);

            const response = await updateDiscountDetailsAction(locale, propertyId, mappedData);
            if (response.success) {
                setHasChanges(false);
                toast.success(t("discount.saveSuccess") || "Discount details saved successfully!");
                return { success: true, isValid: true };
            } else {
                toast.error(response.error || t("discount.saveError") || "Failed to save discount details");
                return { success: false, isValid: true };
            }
        } catch (_error) {
            toast.error(t("discount.saveError") || "Error saving discount details");
            return { success: false, isValid: true };
        } finally {
            stopLoading();
        }
    };

    return {
        discountData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteDiscounts,
        handleToggleEnabled,
        handleInputChange,
        handleFileUpload,
        handleSave,
        t
    };
};
