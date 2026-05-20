import { getPaymentModeMastersAction, getAllPaymentModeMastersAction } from "./actions";
import { getTranslations } from "next-intl/server";
import { PaymentModeAddButton } from "@/components/modules/configuration-settings/payment-mode-master/PaymentModeAddButton";
import { PaymentModeStatsCards } from "@/components/modules/configuration-settings/payment-mode-master/PaymentModeStatsCards";
import { PaymentModeTable } from "@/components/modules/configuration-settings/payment-mode-master/PaymentModeTable";
import { PageContainer } from "@/components/common/PageContainer";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Payment Mode Master Page - Full SSR Implementation with Authentication
 * - Requires authentication (redirects to login if not authenticated)
 * - Server-side data fetching with auth token
 */
export default async function PaymentModeMasterPage({ params, searchParams }: PageProps) {
    // 1. Read View State from URL Search Params (SSR)
    const { locale } = await params;

    const resolvedSearchParams = await searchParams;
    const pageNumber = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const searchTerm = (resolvedSearchParams.search as string) || "";

    // 2. Parallel Data Fetching on the Server via Actions
    const [pagedResult, allResult, t] = await Promise.all([
        getPaymentModeMastersAction(pageNumber, pageSize, searchTerm),
        getAllPaymentModeMastersAction(),
        getTranslations({ locale, namespace: "paymentModeMaster" }),
    ]);

    const defaultPagedData = { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPrevious: false, hasNext: false };
    const pagedData = pagedResult.success ? (pagedResult.data || defaultPagedData) : defaultPagedData;
    const allData = allResult.success ? (allResult.data || []) : [];

    // 3. Render — Islands of Interactivity
    return (
        <PageContainer>
            {/* Page Header: Title + Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-xl font-bold text-blue-950">{t("title")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
                </div>
                <PaymentModeAddButton />
            </div>

            {/* Stats Cards — Server rendered */}
            <PaymentModeStatsCards totalCount={pagedData.totalCount} allData={allData} locale={locale} />

            {/* Table — Client Island */}
            <PaymentModeTable
                data={pagedData.items}
                pageNumber={pagedData.pageNumber}
                pageSize={pagedData.pageSize}
                totalCount={pagedData.totalCount}
                totalPages={pagedData.totalPages}
                searchTerm={searchTerm}
            />
        </PageContainer>
    );
}
