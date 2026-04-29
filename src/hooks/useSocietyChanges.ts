import { useCallback, useEffect, RefObject } from 'react';
import { PropertySocietyDetailsApiItem } from '@/types/property-society-details.types';

export const useSocietyChanges = ({
    formRef,
    managerMobileDigits,
    secretaryMobileDigits,
    societyData,
    setHasChanges,
}: {
    formRef: RefObject<HTMLFormElement | null>;
    managerMobileDigits: string[];
    secretaryMobileDigits: string[];
    societyData: PropertySocietyDetailsApiItem | null;
    setHasChanges: (value: boolean) => void;
}) => {
    
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
    }, [managerMobileDigits, secretaryMobileDigits, societyData, formRef, setHasChanges]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    return { checkFormChanges };
};
