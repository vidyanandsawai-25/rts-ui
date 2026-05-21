import { ApiError } from '@/lib/utils/api';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPropertySocietyDetails } from '@/lib/api/property-society.service';

import {
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    MoujaItem,
    TaxZoneItem
} from "@/types/property-basic-details.types";

import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";

import PropertyFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/property/PropertyForm';
import { getMoujaMasterAction, getPropertyBasicDetailsAction, getPropertyCategoriesAction, getPropertyTypesAction, getTaxZonesAction } from './action';

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

    let MoujaMasterList: MoujaItem[] = [];
    let propertyDescriptionList: PropertyTypeApiItem[] = [];
    let propertyCategoryList: PropertyCategoryApiItem[] = [];
    let propertyBasicDetails: PropertyBasicDetailsApiItem | null = null;
    let propertySocietyDetails: PropertySocietyDetailsApiItem | null = null;
    let taxZonesList: TaxZoneItem[] = [];

    try {
        const [
            moujaMasterRes,
            propertyTypesRes,
            propertyCategoriesRes,
            propertyBasicDetailsRes,
            propertySocietyRes,
            taxZonesRes
        ] = await Promise.all([
            getMoujaMasterAction(1, -1),
            getPropertyTypesAction(1, -1),
            getPropertyCategoriesAction(1, -1),
            getPropertyBasicDetailsAction(pid),
            getPropertySocietyDetails(pid),
            getTaxZonesAction(1, -1)
        ]);

        if (moujaMasterRes.success && moujaMasterRes.data) {
            MoujaMasterList = moujaMasterRes.data;
        } else if (!moujaMasterRes.success) {
            throw new Error(moujaMasterRes.error || "Failed to fetch Mouja Master");
        }

        if (propertyTypesRes.success && propertyTypesRes.data) {
            propertyDescriptionList = propertyTypesRes.data;
        } else if (!propertyTypesRes.success) {
            throw new Error(propertyTypesRes.error || "Failed to fetch Property Descriptions");
        }

        if (propertyCategoriesRes.success && propertyCategoriesRes.data) {
            propertyCategoryList = propertyCategoriesRes.data;
        } else if (!propertyCategoriesRes.success) {
            throw new Error(propertyCategoriesRes.error || "Failed to fetch Property Categories");
        }

        if (propertyBasicDetailsRes.success && propertyBasicDetailsRes.data) {
            propertyBasicDetails = propertyBasicDetailsRes.data;
        } else if (!propertyBasicDetailsRes.success) {
            throw new Error(propertyBasicDetailsRes.error || "Failed to fetch Property Basic Details");
        }

        propertySocietyDetails = propertySocietyRes;
        if (taxZonesRes.success && taxZonesRes.data) {
            taxZonesList = taxZonesRes.data;
        }
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
            MoujaMaster={MoujaMasterList}
            propertyCategories={propertyCategoryList}
            propertyDescriptions={propertyDescriptionList}
            propertyData={propertyBasicDetails}
            propertySocietyDetails={propertySocietyDetails}
            taxZones={taxZonesList}
            locale={locale}
        />
    );
}