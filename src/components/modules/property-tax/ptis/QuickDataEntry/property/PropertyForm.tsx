'use client';

import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common';
import { PropertyFormViewProps } from '@/types/property-basic-details.types';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { PropertyFormFields } from './PropertyFormFields';
import { PropertyFormActions } from './PropertyFormActions';

const PropertyFormView = (props: PropertyFormViewProps) => {
    const {
        formRef,
        hasChanges,
        isUpdating,
        propertyTypeId,
        categoryId,
        wingId,
        moujaId,
        checkFormChanges,
        handleSubmit,
        handlePropertyDescriptionChange,
        handleCategoryChange,
        handleWingChange,
        handleMoujaChange,
        categoryOptions,
        wingOptions,
        moujaOptions,
        propertyDescriptionOptions,
    } = usePropertyForm(props);

    const t = useTranslations('quickDataEntry');

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
                            moujaOptions={moujaOptions}
                            moujaId={moujaId}
                            handleMoujaChange={handleMoujaChange}
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
