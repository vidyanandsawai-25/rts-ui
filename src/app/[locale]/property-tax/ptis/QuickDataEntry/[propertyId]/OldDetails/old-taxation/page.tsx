import { setRequestLocale } from 'next-intl/server';
import OldTaxationForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/OldTaxation/OldTaxationForm';
import { getPropertyOldDetailsAction } from './action';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OldTaxationPage({ params, searchParams }: PageProps) {
    const { locale, propertyId } = await params;
    const { } = await searchParams; // Destructure if needed, but the user snippet had it
    setRequestLocale(locale);

    const propertyOldDetails = await getPropertyOldDetailsAction(Number(propertyId));

    return (
        <OldTaxationForm
            propertyOldDetails={propertyOldDetails}
        />
    );
}
