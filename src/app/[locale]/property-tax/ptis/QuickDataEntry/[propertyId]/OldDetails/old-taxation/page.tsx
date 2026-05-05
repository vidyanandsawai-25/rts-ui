import { setRequestLocale } from 'next-intl/server';
import OldTaxationForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/OldTaxation/OldTaxationForm';
import { getPropertyOldDetailsAction } from './action';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
}

export default async function OldTaxationPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    const propertyOldDetails = await getPropertyOldDetailsAction(Number(propertyId));

    return (
        <OldTaxationForm
            propertyOldDetails={propertyOldDetails}
        />
    );
}
