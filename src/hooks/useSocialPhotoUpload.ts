import { useCallback } from "react";
import { toast } from "sonner";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { checkSocialRequiredFields } from "@/lib/validations/social-details.validation";
import { 
    uploadSocialPhotoAction, 
    replaceSocialPhotoAction 
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions";

export const useSocialPhotoUpload = (
    socialData: Record<number, FlatSocialAttributeState>,
    propertyId: string,
    setFormState: React.Dispatch<React.SetStateAction<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>>,
    setHasChanges: (val: boolean) => void,
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    }
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
                nextData[socialAttributeId] = { ...nextData[socialAttributeId], isUploading: true };
            }
            return { ...prev, data: nextData };
        });

        try {
            const formData = new FormData();
            formData.append("File", file);

            const hasDetailId = !!item.id;
            if (!hasDetailId) {
                formData.append("PropertyId", String(propertyId));
                formData.append("SocialAttributeId", String(socialAttributeId));
            }
            formData.append("IsPhoto", "true");

            const result = hasDetailId
                ? await replaceSocialPhotoAction(item.id!, formData)
                : await uploadSocialPhotoAction(formData);

            if (result.success && result.data) {
                const docData = result.data;

                setFormState(prev => {
                    const nextData = { ...prev.data };
                    if (nextData[socialAttributeId]) {
                        nextData[socialAttributeId] = {
                            ...nextData[socialAttributeId],
                            id: docData.propertySocialDetailId,
                            documentBindingId: docData.documentBindingId,
                            documentGuid: docData.documentGuid,
                            documentUrl: `/api/documents/${encodeURIComponent(docData.documentGuid)}/view`,
                            isUploading: false
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
                toast.success(t("discount.uploadSuccess") || "File uploaded successfully!");
            } else {
                throw new Error(result.error || t("discount.uploadError"));
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
            toast.error(message || t("discount.uploadError"));
        }
    }, [socialData, propertyId, t, setFormState, setHasChanges]);

    return { handlePhotoUpload };
};
