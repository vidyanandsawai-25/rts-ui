'use client';

import { Button, Drawer, MasterTable } from "@/components/common";
import { FileText, Sheet } from "lucide-react";
import { useAuditTrail } from "@/hooks/PropertyMedia/useAuditTrail";
import { getAuditTrailColumns } from "@/components/modules/property-tax/PropertyMedia/AuditTrail/AuditTrailColumn";
import { ActivityLog, AuditTrailResult } from "@/types/PropertyMedia/PropertyMedia.types";

export interface AuditTrailContainerProps {
    initialData?: AuditTrailResult;
}

export function AuditTrailContainer({ initialData }: AuditTrailContainerProps) {
    const {
        isDrawerOpen,
        handleDrawerClose,
        paginatedData,
        pageNumber,
        pageSize,
        totalCount,
        totalPages,
        handlePageChange,
        handlePageSizeChange,
        handleExport,
        isExporting,
        t,
    } = useAuditTrail({ initialData });

    return (
        <Drawer
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            width="lg"
            title={
                <div className="flex flex-col py-1">
                    <h2 className="text-[#173a67] text-[19px] font-bold leading-tight">
                        {t('auditTrailDrawer.title')}
                    </h2>
                </div>
            }>
            <div className="m-2 flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <Button
                        variant="success"
                        size="xs"
                        icon={Sheet}
                        disabled={isExporting}
                        onClick={() => handleExport(0)}
                        className="h-8 rounded-lg bg-[#107C41] border-[#107C41] px-3 text-xs font-semibold text-white hover:bg-[#0b5c30]"
                    >
                        {t('auditTrailDrawer.excel')}
                    </Button>

                    <Button
                        variant="secondary"
                        size="xs"
                        icon={FileText}
                        disabled={isExporting}
                        onClick={() => handleExport(1)}
                        className="h-8 rounded-lg border-blue-200 bg-white px-3 text-xs font-semibold text-[#185FB8] hover:bg-blue-50"
                    >
                        {t('auditTrailDrawer.pdf')}
                    </Button>
                </div>
            </div>
            <div className="mb-4 px-4">
                <MasterTable<ActivityLog>
                    data={paginatedData}
                    columns={getAuditTrailColumns(t)}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    actionHeaderAlign="left"
                    actionCellAlign="left"
                    containerClassName="[&>div]:overflow-hidden"
                    tableClassName="[&_th]:text-center [&_td]:text-center"
                    paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                    emptyText={t('auditTrailDrawer.table.noRecords') || "No records found"}
                />
            </div>
        </Drawer>
    );
}