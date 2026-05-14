import { useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useLoading } from '@/hooks/useLoading';
import { societyValidations, validateForm, hasErrors } from "@/lib/utils/validation";
import { updatePropertySocietyDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action";
import { SocietyFormProps, UpdatePropertySocietyDetailsDto } from "@/types/property-society-details.types";
import { kycValidators } from '@/lib/utils/kyc-validation.constants';

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
        managerMobileInput,
        secretaryMobileInput,
        managerEmail,
        setManagerEmail,
        secretaryEmail,
        setSecretaryEmail,
        societyEmail,
        setSocietyEmail,
        landOwnerName,
        setLandOwnerName,
        builderName,
        setBuilderName,
        societyName,
        setSocietyName,
        managerName,
        setManagerName,
        secretaryName,
        setSecretaryName,
        isSubmitted,
        setIsSubmitted,
        hasChanges,
        setHasChanges,
    } = useSocietyFormState(societyData);

    // Validation error display logic - matches KYC pattern
    // Shows errors only if:
    // 1. Form has been submitted, OR
    // 2. Field has been touched (has a value) AND is invalid
    const showError = (
        field: 'managerMobile' | 'secretaryMobile' | 'managerEmail' | 'secretaryEmail' | 'societyEmail' | 
               'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName', 
        isValid: boolean
    ): boolean => {
        // If form is submitted, show all validation errors
        if (isSubmitted) return !isValid;

        // For digit inputs (mobile numbers), show error only if user has entered data
        if (field === 'managerMobile') {
            return managerMobileInput.value.length > 0 && !isValid;
        }
        if (field === 'secretaryMobile') {
            return secretaryMobileInput.value.length > 0 && !isValid;
        }

        // For email fields, show error only if field has been touched (has value)
        if (field === 'managerEmail') {
            return !!managerEmail && !isValid;
        }
        if (field === 'secretaryEmail') {
            return !!secretaryEmail && !isValid;
        }
        if (field === 'societyEmail') {
            return !!societyEmail && !isValid;
        }

        // For name fields, show error only if field has been touched (has value)
        if (field === 'landOwnerName') {
            return !!landOwnerName && !isValid;
        }
        if (field === 'builderName') {
            return !!builderName && !isValid;
        }
        if (field === 'societyName') {
            return !!societyName && !isValid;
        }
        if (field === 'managerName') {
            return !!managerName && !isValid;
        }
        if (field === 'secretaryName') {
            return !!secretaryName && !isValid;
        }

        return false;
    };

    // 2. Changes Hook - Updated to use new input structure
    const { checkFormChanges } = useSocietyChanges({
        formRef,
        managerMobileDigits: managerMobileInput.digits,
        secretaryMobileDigits: secretaryMobileInput.digits,
        landOwnerName,
        builderName,
        societyName,
        managerName,
        secretaryName,
        managerEmail,
        secretaryEmail,
        societyEmail,
        societyData,
        setHasChanges
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);

        const formData = new FormData(e.currentTarget);
        const pid = societyData?.propertyId || propertyIdSearch;
        const managerMobileStr = managerMobileInput.value;
        const secretaryMobileStr = secretaryMobileInput.value;

        // Validate emails before proceeding
        const isManagerEmailValid = kycValidators.isValidEmail(managerEmail);
        const isSecretaryEmailValid = kycValidators.isValidEmail(secretaryEmail);
        const isSocietyEmailValid = kycValidators.isValidEmail(societyEmail);
        const isManagerMobileValid = kycValidators.isValidMobile(managerMobileStr);
        const isSecretaryMobileValid = kycValidators.isValidMobile(secretaryMobileStr);

        // Validate names
        const isLandOwnerNameValid = !landOwnerName || kycValidators.isValidName(landOwnerName);
        const isBuilderNameValid = !builderName || kycValidators.isValidName(builderName);
        const isSocietyNameValid = !societyName || kycValidators.isValidName(societyName);
        const isManagerNameValid = !managerName || kycValidators.isValidName(managerName);
        const isSecretaryNameValid = !secretaryName || kycValidators.isValidName(secretaryName);

        // Show specific error messages for invalid fields
        if (!isManagerEmailValid && managerEmail) {
            toast.error(t('kyc.validation.invalidEmail'));
            return;
        }
        if (!isSecretaryEmailValid && secretaryEmail) {
            toast.error(t('kyc.validation.invalidEmail'));
            return;
        }
        if (!isSocietyEmailValid && societyEmail) {
            toast.error(t('kyc.validation.invalidEmail'));
            return;
        }
        if (!isManagerMobileValid && managerMobileStr) {
            toast.error(t('kyc.validation.invalidMobile'));
            return;
        }
        if (!isSecretaryMobileValid && secretaryMobileStr) {
            toast.error(t('kyc.validation.invalidMobile'));
            return;
        }
        if (!isLandOwnerNameValid) {
            toast.error(t('kyc.validation.invalidName'));
            return;
        }
        if (!isBuilderNameValid) {
            toast.error(t('kyc.validation.invalidName'));
            return;
        }
        if (!isSocietyNameValid) {
            toast.error(t('kyc.validation.invalidName'));
            return;
        }
        if (!isManagerNameValid) {
            toast.error(t('kyc.validation.invalidName'));
            return;
        }
        if (!isSecretaryNameValid) {
            toast.error(t('kyc.validation.invalidName'));
            return;
        }

        const data = {
            landOwnerName: landOwnerName.trim(),
            builderName: builderName.trim(),
            managerName: managerName.trim(),
            secretaryName: secretaryName.trim(),
            societyEmailId: societyEmail.trim(),
            managerEmailId: managerEmail.trim(),
            secretaryEmailId: secretaryEmail.trim(),
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
            societyName: societyName.trim() || null,
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
            societyNameEnglish: societyName.trim() || null,
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
        managerMobileInput,
        secretaryMobileInput,
        managerEmail,
        setManagerEmail,
        secretaryEmail,
        setSecretaryEmail,
        societyEmail,
        setSocietyEmail,
        landOwnerName,
        setLandOwnerName,
        builderName,
        setBuilderName,
        societyName,
        setSocietyName,
        managerName,
        setManagerName,
        secretaryName,
        setSecretaryName,
        showError,
        handleSubmit,
        checkFormChanges,
    };
};
