import { useCallback } from "react";
import { toast } from "sonner";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { checkSocialRequiredFields } from "@/lib/validations/social-details.validation";
import { 
    deleteSocialDocumentAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions";

export const useSocialPhotoUpload = (
    socialData: Record<number, FlatSocialAttributeState>,
    _propertyId: string,
    setFormState: React.Dispatch<React.SetStateAction<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>>,
    setHasChanges: (val: boolean) => void,
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    },
    initialFlatData?: Record<number, FlatSocialAttributeState>
) => {
    const handlePhotoUpload = useCallback(async (socialAttributeId: number, file: File) => {
        if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error(t("discount.uploadInvalidFile") || "Invalid file type. Only JPG and PNG images are allowed.");
            return;
        }

        const item = socialData[socialAttributeId];
        if (!item) return;

        const validationError = checkSocialRequiredFields(socialAttributeId, socialData, t);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setFormState(prev => {
            const nextData = { ...prev.data };
            if (nextData[socialAttributeId]) {
                nextData[socialAttributeId] = {
                    ...nextData[socialAttributeId],
                    pendingFile: file,
                    documentGuid: "pending",
                    documentUrl: "pending",
                };
            }
            const nextErrors = { ...prev.errors };
            delete nextErrors[socialAttributeId];
            return {
                data: nextData,
                errors: nextErrors
            };
        });
        setHasChanges(true);
    }, [socialData, t, setFormState, setHasChanges]);

    const handlePhotoDelete = useCallback(async (socialAttributeId: number) => {
        const item = socialData[socialAttributeId];
        if (!item) return;

        // If the document is currently in pending state, revert to the initial flat state or null if it didn't exist
        if (item.documentGuid === "pending") {
            const initialItem = initialFlatData?.[socialAttributeId];
            setFormState(prev => {
                const nextData = { ...prev.data };
                if (nextData[socialAttributeId]) {
                    nextData[socialAttributeId] = {
                        ...nextData[socialAttributeId],
                        pendingFile: undefined,
                        documentGuid: initialItem?.documentGuid || null,
                        documentUrl: initialItem?.documentUrl || null,
                        documentBindingId: initialItem?.documentBindingId || null
                    };
                }
                return { ...prev, data: nextData };
            });
            setHasChanges(true);
            toast.success(t("discount.deleteSuccess") || "File removed successfully!");
            return;
        }

        // If it was a saved document, call the DELETE API
        if (!item.id) return;

        setFormState(prev => {
            const nextData = { ...prev.data };
            if (nextData[socialAttributeId]) {
                nextData[socialAttributeId] = { ...nextData[socialAttributeId], isUploading: true };
            }
            return { ...prev, data: nextData };
        });

        try {
            const result = await deleteSocialDocumentAction(item.id);

            if (result.success) {
                setFormState(prev => {
                    const nextData = { ...prev.data };
                    if (nextData[socialAttributeId]) {
                        nextData[socialAttributeId] = {
                            ...nextData[socialAttributeId],
                            documentBindingId: null,
                            documentGuid: null,
                            documentUrl: null,
                            isUploading: false,
                            pendingFile: undefined
                        };
                    }
                    const nextErrors = { ...prev.errors };
                    delete nextErrors[socialAttributeId];
                    return {
                        data: nextData,
                        errors: nextErrors
                    };
                });
                setHasChanges(true);
                toast.success(t("discount.deleteSuccess") || "File deleted successfully!");
            } else {
                throw new Error(result.error || t("discount.deleteError"));
            }
        } catch (error: unknown) {
            setFormState(prev => {
                const nextData = { ...prev.data };
                if (nextData[socialAttributeId]) {
                    nextData[socialAttributeId] = { ...nextData[socialAttributeId], isUploading: false };
                }
                return { ...prev, data: nextData };
            });
            const message = error instanceof Error ? error.message : String(error);
            toast.error(message || t("discount.deleteError") || "Failed to delete file");
        }
    }, [socialData, t, setFormState, setHasChanges, initialFlatData]);

    return { handlePhotoUpload, handlePhotoDelete };
};
