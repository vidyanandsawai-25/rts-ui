import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { updatePropertySocietyDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action";
import { societyValidations, validateForm, hasErrors } from "@/lib/utils/validation";
import { SocietyFormProps, UpdatePropertySocietyDetailsDto } from "@/types/property-society-details.types";
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ConfirmContextType } from '@/components/common/ConfirmProvider';

export const useSocietyForm = (props: SocietyFormProps, t: (key: string) => string, confirm: ConfirmContextType['confirm'], router: AppRouterInstance) => {
    const { societyData, propertyIdSearch, locale } = props;
    const [isUpdating, setIsUpdating] = useState(false);

    const initialManagerMobile = (societyData?.managerMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [managerMobileDigits, setManagerMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialManagerMobile[i] ?? "")
    );

    const initialSecretaryMobile = (societyData?.secretaryMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [secretaryMobileDigits, setSecretaryMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialSecretaryMobile[i] ?? "")
    );

    const formRef = useRef<HTMLFormElement>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const checkFormChanges = useCallback(() => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const managerMobileStr = managerMobileDigits.join("");
        const secretaryMobileStr = secretaryMobileDigits.join("");

        const isChanged =
            String(formData.get("landOwnerName") ?? "").trim() !== (societyData?.landOwnerName ?? "") ||
            String(formData.get("builderName") ?? "").trim() !== (societyData?.builderName ?? "") ||
            String(formData.get("societyName") ?? "").trim() !== (societyData?.societyName ?? "") ||
            String(formData.get("societyAddress") ?? "").trim() !== (societyData?.societyAddress ?? "") ||
            String(formData.get("societyEmailId") ?? "").trim() !== (societyData?.societyEmailId ?? "") ||
            String(formData.get("managerName") ?? "").trim() !== (societyData?.managerName ?? "") ||
            String(formData.get("managerEmailId") ?? "").trim() !== (societyData?.managerEmailId ?? "") ||
            managerMobileStr !== (societyData?.managerMobileNo ?? "") ||
            String(formData.get("secretaryName") ?? "").trim() !== (societyData?.secretaryName ?? "") ||
            String(formData.get("secretaryEmailId") ?? "").trim() !== (societyData?.secretaryEmailId ?? "") ||
            secretaryMobileStr !== (societyData?.secretaryMobileNo ?? "");

        setHasChanges(isChanged);
    }, [managerMobileDigits, secretaryMobileDigits, societyData]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const pid = societyData?.propertyId || propertyIdSearch;
        const managerMobileStr = managerMobileDigits.join("");
        const secretaryMobileStr = secretaryMobileDigits.join("");

        const data = {
            landOwnerName: String(formData.get("landOwnerName") ?? "").trim(),
            builderName: String(formData.get("builderName") ?? "").trim(),
            managerName: String(formData.get("managerName") ?? "").trim(),
            secretaryName: String(formData.get("secretaryName") ?? "").trim(),
            societyEmailId: String(formData.get("societyEmailId") ?? "").trim(),
            managerEmailId: String(formData.get("managerEmailId") ?? "").trim(),
            secretaryEmailId: String(formData.get("secretaryEmailId") ?? "").trim(),
            managerMobileStr,
            secretaryMobileStr,
        };

        const errors = validateForm(data, {
            landOwnerName: societyValidations.personName("landOwnerName", t),
            builderName: societyValidations.personName("builderName", t),
            managerName: societyValidations.personName("managerName", t),
            secretaryName: societyValidations.personName("secretaryName", t),
            societyEmailId: societyValidations.email("societyEmail", t),
            managerEmailId: societyValidations.email("managerEmail", t),
            secretaryEmailId: societyValidations.email("secretaryEmail", t),
            managerMobileStr: societyValidations.mobile10("managerMobile", t),
            secretaryMobileStr: societyValidations.mobile10("secretaryMobile", t),
        });

        if (hasErrors(errors)) {
            toast.error(Object.values(errors)[0]);
            return;
        }

        const payload: UpdatePropertySocietyDetailsDto = {
            propertyId: pid,
            societyDetailId: societyData?.societyDetailId ?? null,
            wingId: societyData?.wingId ?? null,
            wingNo: societyData?.wingNo ?? null,
            wingName: societyData?.wingName ?? null,
            societyName: data.societyEmailId || null, // Wait, logic in original file was societyName: societyName || null
            societyAddress: String(formData.get("societyAddress") ?? "").trim() || null,
            societyEmailId: data.societyEmailId || null,
            managerName: data.managerName || null,
            managerEmailId: data.managerEmailId || null,
            managerMobileNo: managerMobileStr || null,
            secretaryName: data.secretaryName || null,
            secretaryEmailId: data.secretaryEmailId || null,
            secretaryMobileNo: secretaryMobileStr || null,
            landOwnerName: data.landOwnerName || null,
            builderName: data.builderName || null,
            societyNameEnglish: String(formData.get("societyName") ?? "").trim() || null,
            societyAddressEnglish: String(formData.get("societyAddress") ?? "").trim() || null,
            secretaryNameEnglish: data.secretaryName || null,
            managerNameEnglish: data.managerName || null,
            landOwnerNameEnglish: data.landOwnerName || null,
            builderNameEnglish: data.builderName || null,
        };
        // Fix societyName in payload
        payload.societyName = String(formData.get("societyName") ?? "").trim() || null;

        confirm({
            variant: "update",
            title: t("society.updateConfirmTitle"),
            description: t("society.updateConfirmText"),
            confirmText: t("society.updateConfirmButton"),
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    const result = await updatePropertySocietyDetailsAction(locale, pid, payload);
                    if (!result?.success) {
                        toast.error(result?.error || t("society.updateError"));
                        return;
                    }
                    toast.success(t("society.updateSuccess"));
                    router.refresh();
                } catch (_err) {
                    toast.error(t("society.updateError"));
                } finally {
                    setIsUpdating(false);
                }
            },
        });
    };

    return {
        formRef,
        hasChanges,
        isUpdating,
        managerMobileDigits,
        setManagerMobileDigits,
        secretaryMobileDigits,
        setSecretaryMobileDigits,
        handleSubmit,
        checkFormChanges,
    };
};
