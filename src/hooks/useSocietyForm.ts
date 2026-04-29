import { useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useLoading } from '@/hooks/useLoading';
import { societyValidations, validateForm, hasErrors } from "@/lib/utils/validation";
import { updatePropertySocietyDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action";
import { SocietyFormProps, UpdatePropertySocietyDetailsDto } from "@/types/property-society-details.types";

import { useSocietyChanges } from '@/hooks/useSocietyChanges';
import { useSocietyFormState } from '@/hooks/useSocietyFormState'; 

export const useSocietyForm = (props: SocietyFormProps) => {
    const { societyData, propertyIdSearch, locale } = props;
    
    const t = useTranslations('quickDataEntry');
    const { confirm } = useConfirm();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const { isLoading: isUpdating, startLoading, stopLoading } = useLoading(false);

    // 1. State Hook
    const {
        managerMobileDigits,
        setManagerMobileDigits,
        secretaryMobileDigits,
        setSecretaryMobileDigits,
        hasChanges,
        setHasChanges,
    } = useSocietyFormState(societyData);

    // 2. Changes Hook
    const { checkFormChanges } = useSocietyChanges({
        formRef,
        managerMobileDigits,
        secretaryMobileDigits,
        societyData,
        setHasChanges
    });

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
            societyName: String(formData.get("societyName") ?? "").trim() || null,
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

        confirm({
            variant: "update",
            title: t("society.updateConfirmTitle"),
            description: t("society.updateConfirmText"),
            confirmText: t("society.updateConfirmButton"),
            onConfirm: async () => {
                startLoading();
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
                    stopLoading();
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
