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

    const result = await getPropertyOldDetailsAction(Number(propertyId));

    if (!result.success) {
        throw new Error('Failed to fetch property old details');
    }

    return (
        <OldTaxationForm
            propertyOldDetails={result.data}
        />
    );
}
