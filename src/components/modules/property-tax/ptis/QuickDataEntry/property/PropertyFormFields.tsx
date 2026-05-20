import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { BasicPropertyFields } from './BasicPropertyFields';
import { AdditionalPropertyFields } from './AdditionalPropertyFields';
import { AreaDetailsFields } from './AreaDetailsFields';

interface PropertyFormFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: number | null;
    handleCategoryChange: (name: string | undefined, value: string) => void;
    wingOptions: { label: string; value: string }[];
    wingId: number | null;
    handleWingChange: (name: string | undefined, value: string) => void;
    moujaOptions: { label: string; value: string }[];
    moujaId: number | null;
    handleMoujaChange: (name: string | undefined, value: string) => void;
    propertyDescriptionOptions: { label: string; value: string }[];
    propertyTypeId: number | null;
    handlePropertyDescriptionChange: (name: string | undefined, value: string) => void;
}

export const PropertyFormFields = (props: PropertyFormFieldsProps) => {
    const {
        t,
        propertyData,
        categoryOptions,
        categoryId,
        handleCategoryChange,
        wingOptions,
        wingId,
        handleWingChange,
        moujaOptions,
        moujaId,
        handleMoujaChange,
        propertyDescriptionOptions,
        propertyTypeId,
        handlePropertyDescriptionChange
    } = props;
    
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <BasicPropertyFields
                t={t}
                propertyData={propertyData}
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
            <AdditionalPropertyFields
                t={t}
                propertyData={propertyData}
            />
            <AreaDetailsFields
                t={t}
                propertyData={propertyData}
            />
        </div>
    );
};
