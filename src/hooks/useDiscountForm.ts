"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    updateDiscountDetailsAction,
    deletePropertySocialDetailAction,
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions";
import { DiscountState, PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { useTranslations } from "next-intl";
import { mapApiToDiscountState, mapDiscountStateToApi, hasDiscountChangesComparedToInitial } from "@/lib/utils/discount-helpers";
import { validateDiscountForm } from "@/lib/utils/validateDiscountForm";

export const useDiscountForm = (initialDiscountData: PropertyDiscountInfoResponseDto | null, propertyId: string) => {
    const t = useTranslations('quickDataEntry');
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [incompleteDiscounts, setIncompleteDiscounts] = useState<{ id: number; name: string }[]>([]);
    const params = useParams();
    const locale = params.locale as string;
    const router = useRouter();
    const [discountData, setDiscountData] = useState<DiscountState>(() => mapApiToDiscountState(initialDiscountData));

    const initialMappedState = useMemo(() => mapApiToDiscountState(initialDiscountData), [initialDiscountData]);

    const [prevInitial, setPrevInitial] = useState(initialDiscountData);
    if (initialDiscountData && initialDiscountData !== prevInitial) {
        setPrevInitial(initialDiscountData);
        setDiscountData(mapApiToDiscountState(initialDiscountData));
    }

    const hasChanges = useMemo(() => {
        return hasDiscountChangesComparedToInitial(discountData, initialMappedState);
    }, [discountData, initialMappedState]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as unknown as { __discountFormHasChanges?: boolean }).__discountFormHasChanges = hasChanges;
        }
        return () => {
            if (typeof window !== "undefined") {
                (window as unknown as { __discountFormHasChanges?: boolean }).__discountFormHasChanges = false;
            }
        };
    }, [hasChanges]);

    const clearError = useCallback((id: number) => {
        setValidationErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setIncompleteDiscounts((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const handleToggleEnabled = useCallback((id: number, checked: boolean) => {
        setDiscountData((prev) => {
            const item = prev[id];
            if (!item) return prev;
            const isBitType = item.dataType?.toUpperCase() === "BIT";
            return {
                ...prev,
                [id]: { 
                    ...item, 
                    enabled: checked, 
                    bitValue: isBitType ? checked : item.bitValue 
                }
            };
        });
        clearError(id);
    }, [clearError]);

    const handleInputChange = useCallback((id: number, field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => {
        setDiscountData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
        clearError(id);
    }, [clearError]);

    const handleFileUpload = useCallback((id: number, file: File) => {
        if (file.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
            toast.error(t("discount.uploadInvalidFile") || "Invalid file");
            return;
        }
        setDiscountData(prev => {
            const item = prev[id];
            if (!item) return prev;
            return { ...prev, [id]: { ...item, pendingFile: file, documentGuid: "pending", fileName: file.name, documentUrl: undefined } };
        });
        clearError(id);
    }, [t, clearError]);

    const handleFileDelete = useCallback((id: number) => {
        setDiscountData(prev => {
            const item = prev[id];
            if (!item) return prev;
            return {
                ...prev,
                [id]: {
                    ...item,
                    pendingFile: undefined,
                    documentGuid: null,
                    documentBindingId: null,
                    documentUrl: null,
                    fileName: undefined,
                }
            };
        });
        clearError(id);
        toast.success(t("discount.fileRemoved") || "File removed from form. Click Save Changes to apply.");
    }, [clearError, t]);

    const handleDeleteDiscount = useCallback(async (id: number) => {
        const activeItem = discountData[id];
        if (!activeItem) return;

        const isSavedOnBackend = typeof activeItem.propertySocialDetailId === "number" && activeItem.propertySocialDetailId > 0;

        startLoading();
        try {
            if (isSavedOnBackend) {
                const response = await deletePropertySocialDetailAction(
                    propertyId,
                    id,
                    locale
                );

                if (!response.success) {
                    toast.error(response.error || "Failed to delete discount details");
                    return;
                }
            }

            // Clear local state and disable toggle
            setDiscountData(prev => {
                const item = prev[id];
                if (!item) return prev;
                return {
                    ...prev,
                    [id]: {
                        ...item,
                        pendingFile: undefined,
                        documentGuid: null,
                        documentBindingId: null,
                        documentUrl: null,
                        fileName: undefined,
                        intValue: null,
                        decimalValue: null,
                        textValue: null,
                        dateValue: null,
                        remark: "",
                        enabled: false,
                        bitValue: false,
                        propertySocialDetailId: null // Reset backend ID
                    }
                };
            });
            clearError(id);

            toast.success(t("discount.deleteSuccess") || "Discount and associated data deleted successfully!");

            if (isSavedOnBackend) {
                router.refresh();
            }
        } catch (_error) {
            toast.error("An error occurred while deleting the discount details");
        } finally {
            stopLoading();
        }
    }, [discountData, propertyId, locale, clearError, startLoading, stopLoading, t, router]);

    const handleSave = async () => {
        if (isSaving) return { success: false, isValid: true };
        const { isValid, errors, incompleteDiscounts: invalidDiscounts } = validateDiscountForm(discountData, (key, params) => t(key, params));
        if (!isValid) {
            setValidationErrors(errors);
            setIncompleteDiscounts(invalidDiscounts);
            return { success: false, isValid: false, incompleteDiscounts: invalidDiscounts };
        }
        setValidationErrors({});
        setIncompleteDiscounts([]);
        startLoading();

        try {
            const formData = new FormData();
            const payload = mapDiscountStateToApi(discountData);
            formData.append("discountAttributes", JSON.stringify(payload));

            // Append pending files
            Object.values(discountData).forEach(item => {
                if (item.enabled && item.pendingFile) {
                    formData.append(`file_${item.id}`, item.pendingFile);
                }
            });

            const response = await updateDiscountDetailsAction(locale, propertyId, formData);
            if (response.success) {
                toast.success(t("discount.saveSuccess") || "Discount details saved successfully!");
                return { success: true, isValid: true };
            }
            toast.error(response.error || t("discount.saveError") || "Failed to save");
            return { success: false, isValid: true };
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error));
            return { success: false, isValid: true };
        } finally { stopLoading(); }
    };
    
    const revertDiscount = useCallback((id: number) => {
        setDiscountData((prev) => {
            const initialItem = initialMappedState[id];
            if (!initialItem) return prev;
            const hasDbValues = typeof initialItem.propertySocialDetailId === "number" && initialItem.propertySocialDetailId > 0;
            if (!hasDbValues) return prev;
            return {
                ...prev,
                [id]: { ...initialItem }
            };
        });
        setValidationErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setIncompleteDiscounts((prev) => prev.filter((d) => d.id !== id));
    }, [initialMappedState]);

    return { discountData, isSaving, hasChanges, validationErrors, incompleteDiscounts, handleToggleEnabled, handleInputChange, handleFileUpload, handleFileDelete, handleDeleteDiscount, handleSave, revertDiscount, t };
};
