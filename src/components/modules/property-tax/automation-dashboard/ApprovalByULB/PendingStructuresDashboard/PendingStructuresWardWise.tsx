'use client';

import { useMemo, useState } from 'react';

import { ArrowLeft, Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AutomationTable } from '@/components/common/AutomationTable';
import {
    getPendingStructuresColumns,
    ExtendedBuildingWiseItem
} from './PendingStructuresColumns';
import {
    AuthoritySignature,
    BuildingWisePagination
} from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';

interface PendingStructuresWardWiseProps {
    wardId?: string;
    serverData?: BuildingWisePagination | null;
}

const PendingStructuresWardWise = ({ wardId, serverData }: PendingStructuresWardWiseProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const t = useTranslations('automationDashboard.approvalByULB');
    const [searchTerm, setSearchTerm] = useState('');

    const rawItems: ExtendedBuildingWiseItem[] = useMemo(() => (serverData?.items as ExtendedBuildingWiseItem[]) || [], [serverData?.items]);

    // Extract unique authorities for dynamic columns
    const uniqueAuthorities = useMemo(() => {
        if (!rawItems.length) return [];
        const authoritiesMap = new Map<number, AuthoritySignature>();
        rawItems.forEach((row: ExtendedBuildingWiseItem) => {
            row.authoritySignatures?.forEach((auth: AuthoritySignature) => {
                if (!authoritiesMap.has(auth.signAuthorityId)) {
                    authoritiesMap.set(auth.signAuthorityId, auth);
                }
            });
        });
        return Array.from(authoritiesMap.values()).sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    }, [rawItems]);

    const locale = pathname.split('/')[1] || 'en';
    const columns = useMemo(() => getPendingStructuresColumns(uniqueAuthorities, t, locale), [uniqueAuthorities, t, locale]);

    const tableData = useMemo(() => {
        if (!rawItems.length) return [];

        const mappedData: ExtendedBuildingWiseItem[] = [...rawItems] as ExtendedBuildingWiseItem[];

        // If the server provides a separate totalRow object, append it
        const sData = serverData as unknown as { totalRow?: ExtendedBuildingWiseItem };
        if (sData?.totalRow) {
            mappedData.push({
                ...sData.totalRow,
                isTotal: true,
                demand: sData.totalRow.demand || sData.totalRow.totalDemand
            });
        }

        // If the total is already the last item in the array, ensure it has isTotal: true
        if (mappedData.length > 0) {
            const lastRow = mappedData[mappedData.length - 1];
            // Infer it's a total row if buildingNo is empty or explicitly flagged
            if (!lastRow.buildingNo || lastRow.buildingNo === 'Total' || lastRow.isTotal) {
                lastRow.isTotal = true;
            }
        }

        return mappedData;
    }, [rawItems, serverData]);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('pageNumber', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageSizeChange = (size: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('pageSize', size.toString());
        params.set('pageNumber', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden gap-3 p-3">
            {/* Custom Page Header */}
            <div className="flex items-center bg-[#f8f9fe] px-4 py-3 rounded-t-lg border border-slate-200 border-b-0 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[13px] text-slate-700 hover:text-indigo-600 transition-colors w-[200px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToWardWise')}
                </button>

                <div className="flex-1 flex justify-center">
                    <h1 className="text-[15px] font-bold text-slate-800">
                        {t('titleWithWard', { wardId: wardId || '' })}
                    </h1>
                </div>

                <div className="w-[200px] flex justify-end">
                    <div className="relative w-full max-w-[180px]">
                        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-slate-300 rounded-md outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="relative border-0 shadow-lg overflow-hidden transition-all duration-300 bg-white rounded-lg flex flex-col flex-1 min-h-0">
                <div className="flex-1 p-0 flex flex-col min-h-0 transition-all duration-300 border-t border-slate-200">
                    <AutomationTable
                        data={tableData}
                        columns={columns}
                        containerClassName="h-full flex flex-col min-h-0"
                        tableClassName="w-full border-collapse text-xs border border-slate-300 [&_tbody>tr>td]:border [&_tbody>tr>td]:border-slate-300 hover:[&_tbody>tr]:bg-slate-50"
                        theadClassName="sticky top-0 z-20 bg-[#ebfbfb] shadow-[0_1px_0_0_#cbd5e1,0_2px_4px_rgba(0,0,0,0.04)] [&>tr>th]:border [&>tr>th]:border-slate-300 [&>tr>th]:py-3 [&>tr>th]:!text-black"
                        maxBodyHeightClassName="flex-1 min-h-0"
                        rowClassName={(row) => row.isTotal ? "bg-purple-100/50 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-purple-200" : "group transition-colors border-b border-slate-200 cursor-pointer"}
                        loading={false}
                        totalCount={serverData?.totalCount || 0}
                        pageNumber={serverData?.pageNumber || 1}
                        pageSize={serverData?.pageSize || 10}
                        totalPages={serverData?.totalPages || 1}
                        paginationConfig={{
                            enabled: true,
                            showPageSizeSelector: true
                        }}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        getRowKey={(row, i) => row.isTotal ? 'total-row' : `${row.buildingNo}-${i}`}
                        emptyText="Building data not found"
                    />
                </div>
            </div>
        </div>
    );
};

export default PendingStructuresWardWise;
