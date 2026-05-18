"use client"
import { Tabs } from "@/components/common"
import { useTranslations } from "next-intl";
import { SocietyFormProps } from "@/types/property-society-details.types";
import { SocietyFormFields } from "./SocietyFormFields";
import { SocietyFormActions } from "./SocietyFormActions";
import { useSocietyForm } from "@/hooks/useSocietyForm";

const SocietyForm = (props: SocietyFormProps) => {
    const {
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
    } = useSocietyForm(props);

    const t = useTranslations("quickDataEntry");

    return (
        <form ref={formRef} onSubmit={handleSubmit} onChange={checkFormChanges} noValidate>
            <Tabs defaultValue="society">
                <Tabs.TabPanel value="society" className="mt-0 p-4 space-y-3">
                    <div className="bg-white rounded-xl shadow-md border-2 border-purple-100 p-4">
                        <h3 className="text-sm font-bold text-purple-800 mb-3 pb-2 border-b-2 border-purple-200">
                            {t('society.title')}
                        </h3>

                        <SocietyFormFields
                            t={t}
                            societyData={props.societyData}
                            managerMobileInput={managerMobileInput}
                            secretaryMobileInput={secretaryMobileInput}
                            managerEmail={managerEmail}
                            setManagerEmail={setManagerEmail}
                            secretaryEmail={secretaryEmail}
                            setSecretaryEmail={setSecretaryEmail}
                            societyEmail={societyEmail}
                            setSocietyEmail={setSocietyEmail}
                            landOwnerName={landOwnerName}
                            setLandOwnerName={setLandOwnerName}
                            builderName={builderName}
                            setBuilderName={setBuilderName}
                            societyName={societyName}
                            setSocietyName={setSocietyName}
                            managerName={managerName}
                            setManagerName={setManagerName}
                            secretaryName={secretaryName}
                            setSecretaryName={setSecretaryName}
                            societyAddress={societyAddress}
                            setSocietyAddress={setSocietyAddress}
                            showError={showError}
                        />

                        <SocietyFormActions
                            t={t}
                            isUpdating={isUpdating}
                            hasChanges={hasChanges}
                            canSubmit={canSubmit()}
                        />
                    </div>
                </Tabs.TabPanel>
            </Tabs>
        </form>
    );
};

export default SocietyForm;
