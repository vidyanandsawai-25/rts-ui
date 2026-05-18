import { useState } from 'react';
import { PropertySocietyDetailsApiItem } from '@/types/property-society-details.types';
import { useDigitInputs } from './useDigitInputs';
import { SOCIETY_VALIDATION_RULES } from '@/lib/utils/kyc-validation.constants';

export const useSocietyFormState = (societyData: PropertySocietyDetailsApiItem | null) => {
    // Use useDigitInputs hook for mobile number fields
    const managerMobileInput = useDigitInputs(
        SOCIETY_VALIDATION_RULES.MOBILE_LENGTH,
        societyData?.managerMobileNo ?? ''
    );

    const secretaryMobileInput = useDigitInputs(
        SOCIETY_VALIDATION_RULES.MOBILE_LENGTH,
        societyData?.secretaryMobileNo ?? ''
    );

    // Email state management
    const [managerEmail, setManagerEmail] = useState(societyData?.managerEmailId ?? '');
    const [secretaryEmail, setSecretaryEmail] = useState(societyData?.secretaryEmailId ?? '');
    const [societyEmail, setSocietyEmail] = useState(societyData?.societyEmailId ?? '');

    // Name state management
    const [landOwnerName, setLandOwnerName] = useState(societyData?.landOwnerName ?? '');
    const [builderName, setBuilderName] = useState(societyData?.builderName ?? '');
    const [societyName, setSocietyName] = useState(societyData?.societyName ?? '');
    const [managerName, setManagerName] = useState(societyData?.managerName ?? '');
    const [secretaryName, setSecretaryName] = useState(societyData?.secretaryName ?? '');

    // Address state management
    const [societyAddress, setSocietyAddress] = useState(societyData?.societyAddress ?? '');

    // Submission state
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    return {
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
    };
};
