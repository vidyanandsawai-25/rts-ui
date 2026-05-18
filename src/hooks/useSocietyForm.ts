import { useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useLoading } from '@/hooks/useLoading';
import { societyValidations, validateForm, hasErrors } from "@/lib/utils/validation";
import { updatePropertySocietyDetailsAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Society/action";
import { SocietyFormProps, UpdatePropertySocietyDetailsDto } from "@/types/property-society-details.types";
import { societyValidators, propertyValidators } from '@/lib/utils/kyc-validation.constants';

import { useSocietyChanges } from '@/hooks/useSocietyChanges';
import { useSocietyFormState } from '@/hooks/useSocietyFormState'; 

const getMobileErrorMessage = (value: string, t: (key: string) => string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (!/^[6-9]/.test(digits)) {
        return t('kyc.validation.invalidMobileStart') || 'Mobile number must start with 6 to 9.';
    }
    if (digits.length !== 10) {
        return t('kyc.validation.invalidMobile') || 'Mobile number must be exactly 10 digits.';
    }
    return '';
};

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
        societyAddress,
        setSocietyAddress,
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
               'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName' | 'societyAddress', 
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
        if (field === 'societyAddress') {
            return !!societyAddress && !isValid;
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
        societyAddress,
        societyData,
        setHasChanges
    });

    // 3. Validation check for submit button
    // Returns true if all filled fields have valid values
    const canSubmit = (): boolean => {
        const managerMobileStr = managerMobileInput.value;
        const secretaryMobileStr = secretaryMobileInput.value;

        // Check emails - if filled, must be valid
        const isManagerEmailValid = !managerEmail || societyValidators.isValidEmail(managerEmail);
        const isSecretaryEmailValid = !secretaryEmail || societyValidators.isValidEmail(secretaryEmail);
        const isSocietyEmailValid = !societyEmail || societyValidators.isValidEmail(societyEmail);
        
        // Check mobile numbers - if filled, must be valid
        const isManagerMobileValid = !managerMobileStr || societyValidators.isValidMobile(managerMobileStr);
        const isSecretaryMobileValid = !secretaryMobileStr || societyValidators.isValidMobile(secretaryMobileStr);

        // Check names - if filled, must be valid
        const isLandOwnerNameValid = !landOwnerName || societyValidators.isValidPersonName(landOwnerName);
        const isBuilderNameValid = !builderName || societyValidators.isValidPersonName(builderName);
        const isSocietyNameValid = !societyName || societyValidators.isValidSocietyName(societyName);
        const isManagerNameValid = !managerName || societyValidators.isValidPersonName(managerName);
        const isSecretaryNameValid = !secretaryName || societyValidators.isValidPersonName(secretaryName);
        
        // Check address - if filled, must be valid
        const isSocietyAddressValid = !societyAddress || propertyValidators.isValidAddress(societyAddress);

        return (
            isManagerEmailValid &&
            isSecretaryEmailValid &&
            isSocietyEmailValid &&
            isManagerMobileValid &&
            isSecretaryMobileValid &&
            isLandOwnerNameValid &&
            isBuilderNameValid &&
            isSocietyNameValid &&
            isManagerNameValid &&
            isSecretaryNameValid &&
            isSocietyAddressValid
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);

        const pid = societyData?.propertyId || propertyIdSearch;
        const managerMobileStr = managerMobileInput.value;
        const secretaryMobileStr = secretaryMobileInput.value;

        // Validate emails before proceeding
        const isManagerEmailValid = societyValidators.isValidEmail(managerEmail);
        const isSecretaryEmailValid = societyValidators.isValidEmail(secretaryEmail);
        const isSocietyEmailValid = societyValidators.isValidEmail(societyEmail);
        const isManagerMobileValid = societyValidators.isValidMobile(managerMobileStr);
        const isSecretaryMobileValid = societyValidators.isValidMobile(secretaryMobileStr);

        // Validate names
        const isLandOwnerNameValid = !landOwnerName || societyValidators.isValidPersonName(landOwnerName);
        const isBuilderNameValid = !builderName || societyValidators.isValidPersonName(builderName);
        const isSocietyNameValid = !societyName || societyValidators.isValidSocietyName(societyName);
        const isManagerNameValid = !managerName || societyValidators.isValidPersonName(managerName);
        const isSecretaryNameValid = !secretaryName || societyValidators.isValidPersonName(secretaryName);
        const isSocietyAddressValid = !societyAddress || propertyValidators.isValidAddress(societyAddress);

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
            toast.error(getMobileErrorMessage(managerMobileStr, t));
            return;
        }
        if (!isSecretaryMobileValid && secretaryMobileStr) {
            toast.error(getMobileErrorMessage(secretaryMobileStr, t));
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
        if (!isSocietyAddressValid) {
            toast.error(t('kyc.validation.invalidAddress'));
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
            societyAddress: societyAddress.trim() || null,
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
            societyAddressEnglish: societyAddress.trim() || null,
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
        societyAddress,
        setSocietyAddress,
        showError,
        canSubmit,
        handleSubmit,
        checkFormChanges,
    };
};
