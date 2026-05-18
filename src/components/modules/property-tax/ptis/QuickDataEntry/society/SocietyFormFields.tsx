import { SocietyGeneralFields } from './SocietyGeneralFields';
import { SocietyContactFields } from './SocietyContactFields';
import { useDigitInputs } from '@/hooks/useDigitInputs';

interface SocietyFormFieldsProps {
    t: (key: string) => string;
    managerMobileInput: ReturnType<typeof useDigitInputs>;
    secretaryMobileInput: ReturnType<typeof useDigitInputs>;
    managerEmail: string;
    setManagerEmail: (email: string) => void;
    secretaryEmail: string;
    setSecretaryEmail: (email: string) => void;
    societyEmail: string;
    setSocietyEmail: (email: string) => void;
    landOwnerName: string;
    setLandOwnerName: (name: string) => void;
    builderName: string;
    setBuilderName: (name: string) => void;
    societyName: string;
    setSocietyName: (name: string) => void;
    managerName: string;
    setManagerName: (name: string) => void;
    secretaryName: string;
    setSecretaryName: (name: string) => void;
    societyAddress: string;
    setSocietyAddress: (address: string) => void;
    showError: (
        field: 'managerMobile' | 'secretaryMobile' | 'managerEmail' | 'secretaryEmail' | 'societyEmail' |
               'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName' | 'societyAddress',
        isValid: boolean
    ) => boolean;
}

export const SocietyFormFields = ({
    t,
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
}: SocietyFormFieldsProps) => {
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <SocietyGeneralFields
                t={t}
                societyEmail={societyEmail}
                setSocietyEmail={setSocietyEmail}
                landOwnerName={landOwnerName}
                setLandOwnerName={setLandOwnerName}
                builderName={builderName}
                setBuilderName={setBuilderName}
                societyName={societyName}
                setSocietyName={setSocietyName}
                societyAddress={societyAddress}
                setSocietyAddress={setSocietyAddress}
                showError={showError}
            />
            <SocietyContactFields
                t={t}
                managerMobileInput={managerMobileInput}
                secretaryMobileInput={secretaryMobileInput}
                managerEmail={managerEmail}
                setManagerEmail={setManagerEmail}
                secretaryEmail={secretaryEmail}
                setSecretaryEmail={setSecretaryEmail}
                managerName={managerName}
                setManagerName={setManagerName}
                secretaryName={secretaryName}
                setSecretaryName={setSecretaryName}
                showError={showError}
            />
        </div>
    );
};
