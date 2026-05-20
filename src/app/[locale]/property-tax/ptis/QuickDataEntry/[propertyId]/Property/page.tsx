import { ApiError } from '@/lib/utils/api';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
    getPropertyBasicDetails,
    getPropertyCategories,
    getPropertyTypes,
    getWingMaster,
    getMoujaMaster
} from "@/lib/api/property-basic-details.service";
import { getPropertySocietyDetails } from '@/lib/api/property-society.service';

import {
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    WingItem,
    MoujaItem
} from "@/types/property-basic-details.types";
import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";

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

    const pid = Number(propertyId);

    if (isNaN(pid)) {
        throw new Error("Invalid Property Id");
    }

    let WingMasterList: WingItem[] = [];
    let MoujaMasterList: MoujaItem[] = [];
    let propertyDescriptionList: PropertyTypeApiItem[] = [];
    let propertyCategoryList: PropertyCategoryApiItem[] = [];
    let propertyBasicDetails: PropertyBasicDetailsApiItem | null = null;
    let propertySocietyDetails: PropertySocietyDetailsApiItem | null = null;

    try {
        const [
            wingMasterRes,
            moujaMasterRes,
            propertyTypesRes,
            propertyCategoriesRes,
            propertyBasicDetailsRes,
            propertySocietyRes,
        ] = await Promise.all([
            getWingMaster(1, -1),
            getMoujaMaster(1, -1),
            getPropertyTypes(1,-1),
            getPropertyCategories(1,-1),
            getPropertyBasicDetails(pid),
            getPropertySocietyDetails(pid),
        ]);
        WingMasterList = wingMasterRes;
        MoujaMasterList = moujaMasterRes;
        propertyDescriptionList = propertyTypesRes;
        propertyCategoryList = propertyCategoriesRes;
        propertyBasicDetails = propertyBasicDetailsRes;
        propertySocietyDetails = propertySocietyRes;
    } catch (error: unknown) {
        const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
        if (error instanceof ApiError) {
            if (error.statusCode === 401) {
                throw new Error(t('property.errors.unauthorized'));
            } else if (error.statusCode === 403) {
                throw new Error(t('property.errors.forbidden'));
            } else if (error.statusCode === 404) {
                throw new Error(t('property.errors.notFound'));
            } else if (error.statusCode >= 500) {
                throw new Error(t('property.errors.serverError'));
            } else {
                throw new Error(error.contextMessage || t('property.errors.defaultApiError', { message: error.message }));
            }
        }

        const msg = error instanceof Error ? error.message.toLowerCase() : "";
        if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
            throw new Error(t('property.errors.failedToConnect.description'));
        }

        throw error;
    }

    if (!propertyBasicDetails) {
        const t = await getTranslations("quickDataEntry");
        throw new Error(t('property.errors.fetchPropertyBasicDetails'));
    }    

    return (
        <PropertyFormView
            WingMaster={WingMasterList}
            MoujaMaster={MoujaMasterList}
            propertyCategories={propertyCategoryList}
            propertyDescriptions={propertyDescriptionList}
            propertyData={propertyBasicDetails}
            propertySocietyDetails={propertySocietyDetails}
            locale={locale}
        />
    );
}