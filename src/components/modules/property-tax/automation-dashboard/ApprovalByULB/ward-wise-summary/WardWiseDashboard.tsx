'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { AutomationTable } from '@/components/common/AutomationTable';
import { getUniqueRoles, getApprovalColumns, getApprovalHeaderRows } from '../ApprovalbyUlbColumns';
import { ApprovalByUlbItems } from "@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type";
interface WardWiseDashboardProps {
    zoneId: string;
    serverData: ApprovalByUlbItems | null;
}

export default function WardWiseDashboard({ zoneId, serverData }: WardWiseDashboardProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('automationDashboard.approvalByULB');
    const basePath = `/${locale}/property-tax/automation-dashboard`;
    const workflowStageId = searchParams.get('workflowStageId');

    const backUrl = workflowStageId ? `${basePath}/approval-by-ulb?workflowStageId=${workflowStageId}` : `${basePath}/approval-by-ulb`;

    const tableData = useMemo(() => {
        if (!serverData) return [];

        const data = serverData.zoneData ? serverData.zoneData.slice() : [];

        if (serverData.totalRow) {
            data.push({
                ...serverData.totalRow,
                isTotal: true,
                zoneName: t('total')
            });
        }

        return data;
    }, [serverData, t]);

    const roles = useMemo(() => getUniqueRoles(serverData?.zoneData || []), [serverData]);
    const handleNavigation = useCallback((wardId: string) => {
        const returnUrl = encodeURIComponent(`${basePath}/approval-by-ulb/ward-wise-summary/${zoneId}${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
        const query = `?returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}`;
        router.push(`${basePath}/approval-by-ulb/pending-structures-ward-wise/${wardId}${query}`);
    }, [basePath, zoneId, workflowStageId, router]);

    const columns = useMemo(() => getApprovalColumns(roles, handleNavigation, t), [roles, handleNavigation, t]);
    const headerRows = useMemo(() => getApprovalHeaderRows(roles, t, 'ward'), [roles, t]);

    const zoneNameDisplay = serverData?.zoneData?.[0]?.zoneName || '';

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden gap-3 p-3">
            {/* Custom Page Header */}
            <div className="flex items-center bg-[#f8f9fe] px-4 py-4 rounded-t-lg border border-slate-200 border-b-0 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
                <button
                    onClick={() => router.push(backUrl)}
                    className="flex items-center gap-2 text-[13px] text-slate-700 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToWardWise') || 'Back to Division'}
                </button>

                <div className="flex-1 flex justify-center pr-24">
                    <h1 className="text-[15px] font-bold text-slate-800">
                        {zoneNameDisplay ? `Approval by ULB - Ward-wise (${zoneNameDisplay})` : 'Approval by ULB - Ward-wise'}
                    </h1>
                </div>
            </div>

            {/* Ward-wise Table */}
            <div className="relative border-0 shadow-lg overflow-hidden transition-all duration-300 bg-white rounded-lg flex flex-col flex-1 min-h-0">
                <div className="flex-1 p-0 flex flex-col min-h-0 transition-all duration-300 border-t border-slate-200 [&_thead>tr:first-child]:bg-gradient-to-r [&_thead>tr:first-child]:from-indigo-100 [&_thead>tr:first-child]:to-purple-100 [&_thead>tr:first-child]:shadow-sm [&_thead>tr:nth-child(2)]:bg-gradient-to-r [&_thead>tr:nth-child(2)]:from-indigo-50 [&_thead>tr:nth-child(2)]:to-purple-50 [&_th]:border [&_th]:border-slate-300 [&_td]:border [&_td]:border-slate-300">
                    <AutomationTable
                        data={tableData}
                        columns={columns}
                        headerRows={headerRows}
                        containerClassName="h-full flex flex-col min-h-0"
                        tableClassName="w-full border-collapse text-xs border border-slate-300 [&_tbody>tr>td]:border [&_tbody>tr>td]:border-slate-300 hover:[&_tbody>tr]:bg-slate-50"
                        theadClassName="sticky top-0 z-20 shadow-[0_1px_0_0_#cbd5e1,0_2px_4px_rgba(0,0,0,0.04)] [&>tr>th]:border [&>tr>th]:border-slate-300"
                        maxBodyHeightClassName="flex-1 min-h-0"
                        rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors border-b border-slate-200 cursor-pointer"}
                        loading={false}
                        getRowKey={(row, index) => `${row.zoneId || 'total'}-${index}`}
                        onRowClick={(row) => {
                            if (!row.isTotal) {
                                const code = row.wardId ? String(row.wardId) : row.zoneId ? String(row.zoneId) : typeof row.zoneName === 'string' ? row.zoneName.split(' - ')[0] : '';
                                if (code) {
                                    handleNavigation(code);
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}