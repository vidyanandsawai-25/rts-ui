'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AutomationTable } from '@/components/common/AutomationTable';
import { ExportButton } from '@/components/common/ActionButtons';
import { Button } from '@/components/common/ActionButton';
import { getUniqueRoles, getApprovalColumns, getApprovalHeaderRows } from './ApprovalbyUlbColumns';
import { ApprovalByUlbItems, PendingExportItem } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';
import { useAutoExportToExcel } from '@/hooks/automation-dashboard/useAutoExportToExcel';

interface ApprovalbyUlbDashboardProps {
    serverData?: ApprovalByUlbItems | null;
    exportData?: PendingExportItem[] | null;
    exportRoleName?: string | null;
}

const ApprovalbyUlbDashboard = ({ serverData, exportData, exportRoleName }: ApprovalbyUlbDashboardProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('automationDashboard.approvalByULB');
    const workflowStageId = searchParams.get('workflowStageId') || '';
    const basePath = `/${locale}/property-tax/automation-dashboard`;

    const handleComplete = useCallback(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete('signAuthorityId');
        currentParams.delete('roleName');
        router.replace(`${basePath}/approval-by-ulb?${currentParams.toString()}`);
    }, [searchParams, router, basePath]);

    const excelData = useMemo(() => {
        if (!exportData) return null;
        return exportData.map((row) => ({
            "Zone": row.zone || "",
            "Building No": row.buildingNo || "",
            "SR Notice No": row.srNoticeNo || "",
            "Pending Sign At": row.pendingSignAt || "",
            "Pending Officer Name": row.pendingOfficerName || ""
        }));
    }, [exportData]);

    useAutoExportToExcel({
        data: excelData,
        fileName: exportRoleName ? `Pending_Signatures_${exportRoleName.replace(/\s+/g, '_')}` : null,
        sheetName: 'Pending_Signatures',
        emptyMessage: `No pending records found for ${exportRoleName}`,
        successMessage: `Successfully exported data for ${exportRoleName}`,
        onComplete: handleComplete
    });

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

    const handleNavigation = useCallback((zoneId: string) => {
        const returnUrl = encodeURIComponent(`/${locale}/property-tax/automation-dashboard/approval-by-ulb${workflowStageId ? `?workflowStageId=${workflowStageId}` : ''}`);
        const query = `?returnUrl=${returnUrl}${workflowStageId ? `&workflowStageId=${workflowStageId}` : ''}`;
        router.push(`${basePath}/approval-by-ulb/ward-wise-summary/${zoneId}${query}`);
    }, [router, locale, basePath, workflowStageId]);

    const handleExportClick = useCallback((roleId: number, roleName: string) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('signAuthorityId', roleId.toString());
        currentParams.set('roleName', roleName);
        // Also keep workflowStageId if present
        if (workflowStageId) {
            currentParams.set('workflowStageId', workflowStageId);
        }
        router.push(`${basePath}/approval-by-ulb?${currentParams.toString()}`);
    }, [router, searchParams, basePath, workflowStageId]);

    const columns = useMemo(() => getApprovalColumns(roles, handleNavigation, t), [roles, handleNavigation, t]);
    const headerRows = useMemo(() => getApprovalHeaderRows(roles, t, 'zone', handleExportClick), [roles, t, handleExportClick]);

    return (
        <div className="flex h-full flex-col gap-1 overflow-hidden bg-gray-50   ">
            <div className="flex items-center justify-end bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 justify-end">
                    <Button className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm rounded transition-colors shadow-sm border-none">
                        {t('updatePending') || 'Update Pending'}
                    </Button>
                    <ExportButton className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded transition-colors shadow-sm" />
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
                <AutomationTable
                    columns={columns}
                    headerRows={headerRows}
                    data={tableData}
                    tableClassName="border-collapse w-full border border-slate-300 [&_tbody>tr>td]:border [&_tbody>tr>td]:border-slate-300 hover:[&_tbody>tr]:bg-slate-50"
                    theadClassName="[&>tr>th]:border [&>tr>th]:border-slate-300"
                    rowClassName={(row) => row.isTotal ? "bg-gradient-to-r from-indigo-100 to-purple-100 font-bold sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] [&>td]:!border-indigo-200 [&>td]:!border-r" : "group transition-colors hover:bg-slate-50"}
                    getRowKey={(row, index) => `${row.zoneId || 'total'}-${index}`}
                    onRowClick={(row) => {
                        if (!row.isTotal) {
                            const code = row.zoneId ? String(row.zoneId) : row.wardId ? String(row.wardId) : typeof row.zoneName === 'string' ? row.zoneName.split(' - ')[0] : '';
                            if (code) {
                                handleNavigation(code);
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ApprovalbyUlbDashboard;