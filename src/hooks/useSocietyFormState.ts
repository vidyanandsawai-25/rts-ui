import { useState } from 'react';
import { PropertySocietyDetailsApiItem } from '@/types/property-society-details.types';

export const useSocietyFormState = (societyData: PropertySocietyDetailsApiItem | null) => {
    const initialManagerMobile = (societyData?.managerMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [managerMobileDigits, setManagerMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialManagerMobile[i] ?? "")
    );

    const initialSecretaryMobile = (societyData?.secretaryMobileNo ?? "").replace(/\D/g, "").split("").slice(0, 10);
    const [secretaryMobileDigits, setSecretaryMobileDigits] = useState<string[]>(
        Array.from({ length: 10 }, (_, i) => initialSecretaryMobile[i] ?? "")
    );

    const [hasChanges, setHasChanges] = useState(false);

    return {
        managerMobileDigits,
        setManagerMobileDigits,
        secretaryMobileDigits,
        setSecretaryMobileDigits,
        hasChanges,
        setHasChanges,
    };
};
