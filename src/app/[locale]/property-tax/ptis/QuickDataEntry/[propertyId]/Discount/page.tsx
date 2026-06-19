import { setRequestLocale } from 'next-intl/server';
import DiscountFormview from "@/components/modules/property-tax/ptis/QuickDataEntry/discount/DiscountFormview";
import { getDiscountDetailsAction } from './discount-actions';
import { getPropertySocialInfoAction } from './social-actions';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ locale: string; propertyId: string }>;
    searchParams: Promise<{ view?: string }>;
}

export default async function DiscountFormPage({ params, searchParams }: PageProps) {
    const { locale, propertyId } = await params;
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams.view || "discount";

    setRequestLocale(locale);

    let initialDiscountData = null;
    let initialSocialData = null;

    if (activeTab === "social") {
        const socialResponse = await getPropertySocialInfoAction(propertyId);
        initialSocialData = socialResponse.data?.items || null;
    } else {
        const discountResponse = await getDiscountDetailsAction(propertyId);
        initialDiscountData = discountResponse.data || null;
    }

    return (
        <DiscountFormview
            key={`${propertyId}-${activeTab}`}
            initialDiscountData={initialDiscountData}
            initialSocialData={initialSocialData}
            propertyId={propertyId}
        />
    );
}