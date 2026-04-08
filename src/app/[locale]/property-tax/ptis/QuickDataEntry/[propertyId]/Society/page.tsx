import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import SocietyForm from "@/components/modules/property-tax/ptis/QuickDataEntry/society/SocietyForm"

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

import { getPropertySocietyDetailsAction } from './action';

export default async function SocietyFormPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    const propertySocietyDetails = await getPropertySocietyDetailsAction(Number(propertyId));    

    return (
        <Suspense fallback={<div>Loading Society...</div>}>
            <SocietyForm
                societyData={propertySocietyDetails}
                propertyIdSearch={Number(propertyId)}
                locale={locale}
            />
        </Suspense>
    )
}