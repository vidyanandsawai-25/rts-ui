'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AutomationTable } from '@/components/common/AutomationTable';
import { Button } from '@/components/common/ActionButton';
import { ExportDropdown } from './ExportDropdown';
import { ExportConfig } from '@/types/automation-dashboard/export.type';
import { adaptTableConfigToExport } from '@/lib/utils/automation-dashboard/export/adapter';
import { getUniqueRoles, getApprovalColumns, getApprovalHeaderRows } from './ApprovalbyUlbColumns';
import { ApprovalByUlbItems, PendingExportItem } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';
import { useAutoExportToExcel } from '@/hooks/automation-dashboard/useAutoExportToExcel';
import { Column } from '@/components/common';

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

    const exportConfig = useMemo<ExportConfig<Record<string, unknown>>>(() => {
        const { exportColumns, exportHeaderRows } = adaptTableConfigToExport(columns as unknown as Column<Record<string, unknown>>[], headerRows);

        return {
            fileName: 'Approval_By_ULB_Report',
            reportTitle: 'Property Tax Data Center - Approval By ULB',
            reportSubtitle: `Workflow Stage: Approval By ULB - Division | Generated: ${new Date().toLocaleString()}`,
            pdfOrientation: 'landscape',
            headerRows: exportHeaderRows,
            columns: exportColumns,
            data: tableData as Record<string, unknown>[]
        };
    }, [tableData, columns, headerRows]);

    return (
        <div className="flex flex-col gap-4 h-full bg-slate-50">
            <AutomationTable
                headerExtra={
                    <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Empty space on left side if we don't have search */}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[13px] rounded transition-colors shadow-sm border-none">
                                {t('updatePending') || 'Update Pending'}
                            </Button>
                            <ExportDropdown config={exportConfig} />
                        </div>
                    </div>
                }
                containerClassName="h-full"
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
    );
};

export default ApprovalbyUlbDashboard;