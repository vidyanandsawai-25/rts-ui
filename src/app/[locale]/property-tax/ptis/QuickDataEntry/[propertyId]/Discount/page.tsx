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

    // On-demand SSR: fetch ONLY the data needed for the active tab
    const discountResponse = activeTab === "discount"
        ? await getDiscountDetailsAction(propertyId)
        : { success: true as const, data: undefined };

    const socialResponse = activeTab === "social"
        ? await getPropertySocialInfoAction(propertyId)
        : { success: true as const, data: undefined };

    const initialDiscountData = discountResponse.data ?? null;
    const initialSocialData = socialResponse.data?.items ?? null;

    return (
        <DiscountFormview
            key={`${propertyId}-${activeTab}`}
            initialDiscountData={initialDiscountData}
            initialSocialData={initialSocialData}
            propertyId={propertyId}
        />
    );
}