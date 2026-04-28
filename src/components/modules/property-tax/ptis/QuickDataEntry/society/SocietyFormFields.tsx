import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";
import { SocietyGeneralFields } from './SocietyGeneralFields';
import { SocietyContactFields } from './SocietyContactFields';

interface SocietyFormFieldsProps {
    t: (key: string) => string;
    societyData: PropertySocietyDetailsApiItem | null;
    managerMobileDigits: string[];
    setManagerMobileDigits: (val: (prev: string[]) => string[]) => void;
    secretaryMobileDigits: string[];
    setSecretaryMobileDigits: (val: (prev: string[]) => string[]) => void;
}

export const SocietyFormFields = ({
    t,
    societyData,
    managerMobileDigits,
    setManagerMobileDigits,
    secretaryMobileDigits,
    setSecretaryMobileDigits,
}: SocietyFormFieldsProps) => {
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <SocietyGeneralFields
                t={t}
                societyData={societyData}
            />
            <SocietyContactFields
                t={t}
                societyData={societyData}
                managerMobileDigits={managerMobileDigits}
                setManagerMobileDigits={setManagerMobileDigits}
                secretaryMobileDigits={secretaryMobileDigits}
                setSecretaryMobileDigits={setSecretaryMobileDigits}
            />
        </div>
    );
};
