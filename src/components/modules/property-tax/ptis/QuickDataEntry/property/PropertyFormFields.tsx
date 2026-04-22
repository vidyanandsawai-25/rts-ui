import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { BasicPropertyFields } from './BasicPropertyFields';
import { AdditionalPropertyFields } from './AdditionalPropertyFields';
import { AreaDetailsFields } from './AreaDetailsFields';

interface PropertyFormFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: string;
    handleCategoryChange: (name: string, value: string) => void;
    wingOptions: { label: string; value: string }[];
    wingId: string;
    handleWingChange: (name: string, value: string) => void;
    propertyDescriptionOptions: { label: string; value: string }[];
    propertyTypeId: string;
    handlePropertyDescriptionChange: (name: string, value: string) => void;
}

export const PropertyFormFields = (props: PropertyFormFieldsProps) => {
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <BasicPropertyFields {...props} />
            <AdditionalPropertyFields t={props.t} propertyData={props.propertyData} />
            <AreaDetailsFields t={props.t} propertyData={props.propertyData} />
        </div>
    );
};
