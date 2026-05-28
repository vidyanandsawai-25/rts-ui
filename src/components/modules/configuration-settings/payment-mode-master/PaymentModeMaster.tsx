"use client";

import { useTranslations, useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PaymentModeAddButton } from "./PaymentModeAddButton";
import { PaymentModeStatsCards } from "./PaymentModeStatsCards";
import { PaymentModeTable } from "./PaymentModeTable";
import { usePermissions } from "@/hooks/usePermissions";
import type { PaymentMode } from "@/types/paymentMode.types";

interface PaymentModeMasterProps {
    data: PaymentMode[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchTerm: string;
    allData: PaymentMode[];
    statusCode?: number;
    fetchError?: string;
}

export function PaymentModeMaster({
    data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    searchTerm,
    allData,
    statusCode,
    fetchError,
}: PaymentModeMasterProps) {
    const t = useTranslations("paymentModeMaster");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    const { canView, haveFullAccess } = usePermissions("PAYMENT_MODE_MASTER");

    if (!canView && !haveFullAccess) {
        const isUnauthorized =
            statusCode === 401 ||
            (fetchError &&
                (fetchError.toLowerCase().includes("unauthorized") ||
                    fetchError.toLowerCase().includes("token") ||
                    fetchError === "messages.unauthorizedToken"));

        const messageKey = isUnauthorized ? "errors.unauthorized" : "errors.noAccess";

        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-xl border border-gray-200/80 shadow-sm animate-in fade-in duration-300">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                    <h3 className="text-lg font-semibold text-gray-900">{tCommon(messageKey)}</h3>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Page Header: Title + Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-xl font-bold text-blue-950">{t("title")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
                </div>
                {haveFullAccess && <PaymentModeAddButton />}
            </div>

            {/* Stats Cards — Server fetched, Client rendered here */}
            <PaymentModeStatsCards totalCount={totalCount} allData={allData} locale={locale} />

            {/* Table — Client Island */}
            <PaymentModeTable
                data={data}
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                searchTerm={searchTerm}
            />
        </PageContainer>
    );
}
