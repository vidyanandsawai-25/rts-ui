
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PropertyWisePagination } from "@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type";
import { AutomationTable } from "@/components/common/AutomationTable";
import { ArrowLeft, Search } from "lucide-react";

import { getBuildingwisePropertyHeaderRows, getBuildingwisePropertyColumns } from "./BuildingwisePropertyColumns";

interface BuildingwisePropertyProps {
    propertyNo: string;
    serverData: PropertyWisePagination | null;
}

const BuildingwiseProperty = ({ propertyNo, serverData }: BuildingwisePropertyProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations("automationDashboard");
    const [searchTerm, setSearchTerm] = useState("");

    const headerRows = useMemo(() => getBuildingwisePropertyHeaderRows(), []);
    const columns = useMemo(() => getBuildingwisePropertyColumns(t), [t]);

    const totalCount = serverData?.totalCount || 0;
    const pageNumber = serverData?.pageNumber || 1;
    const pageSize = serverData?.pageSize || 10;
    const totalPages = serverData?.totalPages || 1;
    const tableData = serverData?.items || [];

    const handlePageChange = (newPageNumber: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('pageNumber', newPageNumber.toString());
        currentParams.set('pageSize', pageSize.toString());
        router.push(`?${currentParams.toString()}`);
    };

    const handlePageSizeChange = (newSize: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('pageNumber', '1');
        currentParams.set('pageSize', newSize.toString());
        router.push(`?${currentParams.toString()}`);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-slate-50 gap-3 p-3">
            {/* Header Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    {t('approvalByULB.buildingWiseProperty.backToStructureDetails')}
                </button>

                <div className="flex-1 flex justify-center text-[13px] font-bold text-slate-800">
                    {t('approvalByULB.buildingWiseProperty.title', { propertyNo })}
                </div>

                <div className="relative w-full max-w-[200px]">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('approvalByULB.buildingWiseProperty.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-300 rounded outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="relative border-0 shadow-sm overflow-hidden bg-white rounded-lg flex flex-col flex-1 min-h-0 border border-slate-200">
                <AutomationTable
                    data={tableData}
                    columns={columns}
                    headerRows={headerRows}
                    containerClassName="h-full flex flex-col min-h-0"
                    tableClassName="w-full border-collapse text-xs border border-slate-300 [&_tbody>tr>td]:border [&_tbody>tr>td]:border-slate-300 hover:[&_tbody>tr]:bg-slate-50"
                    theadClassName="sticky top-0 z-20 bg-slate-50 shadow-[0_1px_0_0_#cbd5e1,0_2px_4px_rgba(0,0,0,0.04)] [&>tr>th]:border [&>tr>th]:border-slate-300"
                    maxBodyHeightClassName="flex-1 min-h-0"
                    rowClassName={() => "group transition-colors border-b border-slate-200 cursor-pointer"}
                    loading={false}
                    totalCount={totalCount}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    paginationConfig={{
                        enabled: true,
                        showPageSizeSelector: true
                    }}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    )
}

export default BuildingwiseProperty;