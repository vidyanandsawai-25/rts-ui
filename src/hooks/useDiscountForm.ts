import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { uploadDocumentAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions";
import { updateDiscountDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/action";
import {
    DiscountKey,
    DiscountState,
    DiscountApiResponse,
    DOC_TYPE_MAPPING
} from "@/types/discount.types";
import { useTranslations } from "next-intl";

import { mapApiToDiscountState, mapDiscountStateToApi } from "@/lib/utils/discount-helpers";

export const useDiscountForm = (
    initialDiscountData: DiscountApiResponse | null,
    propertyId: string
) => {
    const t = useTranslations('quickDataEntry');
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [hasChanges, setHasChanges] = useState(false);
    const params = useParams();
    const locale = params.locale as string;

    const [discountData, setDiscountData] = useState<DiscountState>(() =>
        mapApiToDiscountState(initialDiscountData)
    );

    const handleToggleChange = (key: DiscountKey, checked: boolean) => {
        setDiscountData((prev) => ({
            ...prev,
            [key]: { ...prev[key], enabled: checked },
        }));
        setHasChanges(true);
    };

    const handleFileUpload = async (key: DiscountKey, file: File) => {
                // File validation: type and size
                const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
                if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
                    toast.error(t("discount.uploadInvalidFile") || "Invalid file");
                    return;
                }
        setDiscountData(prev => ({
            ...prev,
            [key]: { ...prev[key], isUploading: true }
        }));

        try {
            const formData = new FormData();
            formData.append("File", file);
            formData.append("GroupKey", "PropertyDiscount");
            formData.append("FileTypeName", DOC_TYPE_MAPPING[key]);

            const result = await uploadDocumentAction(formData);

            if (result.success && result.data) {
                const docData = result.data;
                setDiscountData(prev => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        documentGuid: typeof docData === 'string' ? docData : docData.documentGuid,
                        isUploading: false
                    }
                }));
                setHasChanges(true);
                toast.success(`${t("discount.uploadSuccess")} ${t(`discount.${key}`)}`);
            } else {
                throw new Error(result.error || t("discount.uploadError"));
            }
        } catch (_error) {
            setDiscountData(prev => ({
                ...prev,
                [key]: { ...prev[key], isUploading: false }
            }));
            toast.error(t("discount.uploadError"));
        }
    };

    const handleSave = async () => {
        startLoading();
        try {
            const mappedData = mapDiscountStateToApi(discountData);
            const payload = {
                ...initialDiscountData?.items,
                ...mappedData,
                propertyId: parseInt(propertyId)
            };

            const response = await updateDiscountDetailsAction(locale, propertyId, payload);
            if (response.success) {
                setHasChanges(false);
                toast.success(t("discount.saveSuccess") || "Discount details saved successfully!");
            } else {
                toast.error(response.error || t("discount.saveError") || "Failed to save discount details");
            }
        } catch (_error) {
            toast.error(t("discount.saveError") || "Error saving discount details");
        } finally {
            stopLoading();
        }
    };

    return {
        discountData,
        isSaving,
        hasChanges,
        handleToggleChange,
        handleFileUpload,
        handleSave
    };
};
