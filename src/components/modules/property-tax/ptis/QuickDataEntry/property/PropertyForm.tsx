'use client';

import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useRouter } from "next/navigation";
import { PropertyFormViewProps } from '@/types/property-basic-details.types';
import { PropertyFormFields } from './PropertyFormFields';
import { PropertyFormActions } from './PropertyFormActions';
import { usePropertyForm } from './usePropertyForm';

const PropertyFormView = (props: PropertyFormViewProps) => {
    const t = useTranslations('quickDataEntry');
    const { confirm } = useConfirm();
    const router = useRouter();
    
    const {
        formRef,
        hasChanges,
        isUpdating,
        propertyTypeId,
        categoryId,
        wingId,
        checkFormChanges,
        handleSubmit,
        handlePropertyDescriptionChange,
        handleCategoryChange,
        handleWingChange,
        categoryOptions,
        wingOptions,
        propertyDescriptionOptions,
    } = usePropertyForm(props, t, confirm, router);

    return (
        <form ref={formRef} onSubmit={handleSubmit} onChange={checkFormChanges}>
            <Tabs defaultValue="property">
                <Tabs.TabPanel value="property" className="mt-0 p-4 space-y-3">
                    <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-4">
                        <h3 className="text-sm font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
                            {t('property.title')}
                        </h3>
                        
                        <PropertyFormFields 
                            t={t}
                            propertyData={props.propertyData}
                            categoryOptions={categoryOptions}
                            categoryId={categoryId}
                            handleCategoryChange={handleCategoryChange}
                            wingOptions={wingOptions}
                            wingId={wingId}
                            handleWingChange={handleWingChange}
                            propertyDescriptionOptions={propertyDescriptionOptions}
                            propertyTypeId={propertyTypeId}
                            handlePropertyDescriptionChange={handlePropertyDescriptionChange}
                        />

                        <PropertyFormActions 
                            t={t}
                            isUpdating={isUpdating}
                            hasChanges={hasChanges}
                        />
                    </div>
                </Tabs.TabPanel>
            </Tabs>
        </form>
    );
};

export default PropertyFormView;
