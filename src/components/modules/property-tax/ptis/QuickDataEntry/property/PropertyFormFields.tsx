import { PropertyBasicDetailsApiItem, TaxZoneItem } from '@/types/property-basic-details.types';
import { BasicPropertyFields } from './BasicPropertyFields';
import { AdditionalPropertyFields } from './AdditionalPropertyFields';
import { AreaDetailsFields } from './AreaDetailsFields';

interface PropertyFormFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: number | null;
    handleCategoryChange: (name: string | undefined, value: string) => void;
    moujaOptions: { label: string; value: string }[];
    moujaId: number | null;
    handleMoujaChange: (name: string | undefined, value: string) => void;
    propertyDescriptionOptions: { label: string; value: string }[];
    propertyTypeId: number | null;
    handlePropertyDescriptionChange: (name: string | undefined, value: string) => void;
    taxZones: TaxZoneItem[];
    checkFormChanges: () => void;
}

export const PropertyFormFields = (props: PropertyFormFieldsProps) => {
    const {
        t,
        propertyData,
        categoryOptions,
        categoryId,
        handleCategoryChange,
        moujaOptions,
        moujaId,
        handleMoujaChange,
        propertyDescriptionOptions,
        propertyTypeId,
        handlePropertyDescriptionChange,
        taxZones,
        checkFormChanges
    } = props;
    
    return (
        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
            <BasicPropertyFields
                t={t}
                propertyData={propertyData}
                categoryOptions={categoryOptions}
                categoryId={categoryId}
                handleCategoryChange={handleCategoryChange}
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
                taxZones={taxZones}
                checkFormChanges={checkFormChanges}
            />
            <AreaDetailsFields
                t={t}
                propertyData={propertyData}
            />
        </div>
    );
};
