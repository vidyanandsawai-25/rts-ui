import { setRequestLocale } from 'next-intl/server';
import SocietyForm from "@/components/modules/property-tax/ptis/QuickDataEntry/society/SocietyForm"

import { getPropertySocietyDetailsAction } from './action';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SocietyFormPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    const pid = Number(propertyId);

    if (isNaN(pid)) {
        throw new Error("Invalid Property Id");
    }

    const result = await getPropertySocietyDetailsAction(Number(propertyId));

    if (!result.success) {
        throw new Error(result.error || 'Failed to load society details');
    }

    const propertySocietyDetails = result.data;

    return (
        <SocietyForm
            societyData={propertySocietyDetails}
            propertyIdSearch={Number(propertyId)}
            locale={locale}
        />
    )
}