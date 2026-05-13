import { setRequestLocale } from 'next-intl/server';
import DiscountFormview from "@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview";
import { getDiscountDetailsAction } from './action';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function DiscountFormPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    // Fetch discount details from the server
    const response = await getDiscountDetailsAction(propertyId);

    return (
        <DiscountFormview
            key={propertyId}
            initialDiscountData={response.data || null}
            propertyId={propertyId}
        />
    );
}