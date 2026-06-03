import { setRequestLocale } from 'next-intl/server';
import DiscountFormview from "@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview";
import { getDiscountDetailsAction, getPropertySocialInfoAction } from './action';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
}

export default async function DiscountFormPage({ params }: PageProps) {
    const { locale, propertyId } = await params;
    setRequestLocale(locale);

    // Fetch discount and social details in parallel (pure SSR)
    const [discountResponse, socialResponse] = await Promise.all([
        getDiscountDetailsAction(propertyId),
        getPropertySocialInfoAction(propertyId),
    ]);

    return (
        <DiscountFormview
            key={propertyId}
            initialDiscountData={discountResponse.data || null}
            initialSocialData={socialResponse.data?.items || null}
            propertyId={propertyId}
        />
    );
}