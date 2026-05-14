import { useCallback, useEffect, RefObject } from 'react';
import { PropertySocietyDetailsApiItem } from '@/types/property-society-details.types';

export const useSocietyChanges = ({
    formRef,
    managerMobileDigits,
    secretaryMobileDigits,
    landOwnerName,
    builderName,
    societyName,
    managerName,
    secretaryName,
    managerEmail,
    secretaryEmail,
    societyEmail,
    societyData,
    setHasChanges,
}: {
    formRef: RefObject<HTMLFormElement | null>;
    managerMobileDigits: string[];
    secretaryMobileDigits: string[];
    landOwnerName: string;
    builderName: string;
    societyName: string;
    managerName: string;
    secretaryName: string;
    managerEmail: string;
    secretaryEmail: string;
    societyEmail: string;
    societyData: PropertySocietyDetailsApiItem | null;
    setHasChanges: (value: boolean) => void;
}) => {
    
    const checkFormChanges = useCallback(() => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const managerMobileStr = managerMobileDigits.join("");
        const secretaryMobileStr = secretaryMobileDigits.join("");

        const isChanged =
            landOwnerName.trim() !== (societyData?.landOwnerName ?? "") ||
            builderName.trim() !== (societyData?.builderName ?? "") ||
            societyName.trim() !== (societyData?.societyName ?? "") ||
            String(formData.get("societyAddress") ?? "").trim() !== (societyData?.societyAddress ?? "") ||
            societyEmail.trim() !== (societyData?.societyEmailId ?? "") ||
            managerName.trim() !== (societyData?.managerName ?? "") ||
            managerEmail.trim() !== (societyData?.managerEmailId ?? "") ||
            managerMobileStr !== (societyData?.managerMobileNo ?? "") ||
            secretaryName.trim() !== (societyData?.secretaryName ?? "") ||
            secretaryEmail.trim() !== (societyData?.secretaryEmailId ?? "") ||
            secretaryMobileStr !== (societyData?.secretaryMobileNo ?? "");

        setHasChanges(isChanged);
    }, [
        managerMobileDigits, 
        secretaryMobileDigits, 
        landOwnerName, 
        builderName, 
        societyName, 
        managerName, 
        secretaryName,
        managerEmail,
        secretaryEmail,
        societyEmail,
        societyData, 
        formRef, 
        setHasChanges
    ]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    return { checkFormChanges };
};
