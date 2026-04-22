import { setRequestLocale } from 'next-intl/server';
import {
    getPropertyBasicDetailsAction,
    getPropertyCategoriesAction,
    getPropertyTypesAction,
    getWingMasterAction,
} from './action';
import { getPropertySocietyDetailsAction } from '../Society/action';

import PropertyFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/property/PropertyForm';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertyFormPage({ params }: PageProps): Promise<React.JSX.Element> {

    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    // ✅ Parallel API calls with clear naming
    const [
        WingMaster,
        propertyDescriptionResponse,
        propertyCategoryResponse,
        propertyBasicDetailsResponse,
        propertySociety,
    ] = await Promise.all([
        getWingMasterAction(),
        getPropertyTypesAction(),
        getPropertyCategoriesAction(),
        getPropertyBasicDetailsAction(Number(propertyId)),
        getPropertySocietyDetailsAction(Number(propertyId)),
    ]);

    // ✅ Clean extracted data
    const propertyDescriptionList = propertyDescriptionResponse.success ? propertyDescriptionResponse.data : [];
    const propertyCategoryList = propertyCategoryResponse.success ? propertyCategoryResponse.data : [];
    const propertyBasicDetails = propertyBasicDetailsResponse.success ? propertyBasicDetailsResponse.data : null;
    const propertySocietyDetails = propertySociety.success ? propertySociety.data : null;
    const WingMasterList = WingMaster.success ? WingMaster.data : [];


    return (
        <PropertyFormView
            WingMaster={WingMasterList}
            propertyCategories={propertyCategoryList}
            propertyDescriptions={propertyDescriptionList}
            propertyData={propertyBasicDetails}
            propertySocietyDetails={propertySocietyDetails}
            locale={locale}
        />
    );
}