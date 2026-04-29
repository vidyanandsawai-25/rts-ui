import TaxationBreakdownForm from '@/components/modules/property-tax/ptis/QuickDataEntry/old-details/TaxationBreakdown/TaxationBreakdownForm';
import { setRequestLocale } from 'next-intl/server';
import { getOldTaxesDetailsAction } from './action';

interface PageProps {
    params: Promise<{
        propertyId: string;
        locale: string;
    }>;
}

export default async function TaxationBreakdownPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    const result = await getOldTaxesDetailsAction(Number(propertyId));
    const taxationData = result.success ? result.data : null;
    console.log("resss", taxationData);
    
    return (
        <TaxationBreakdownForm initialData={taxationData} />
    );
}
