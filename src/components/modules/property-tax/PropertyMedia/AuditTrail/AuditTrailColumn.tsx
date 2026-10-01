import { Column, Badge } from "@/components/common"
import { ActivityLog } from "@/types/PropertyMedia/PropertyMedia.types";

export const getAuditTrailColumns = (t: (key: string) => string): Column<ActivityLog>[] => [
    {
        key: 'dateTime',
        label: t('auditTrailDrawer.table.columns.dateTime'),
        width: '25%',
        headerClassName: 'border-r border-blue-200/80',
        cellClassName: 'border-r border-blue-100 text-slate-700 font-normal',
    }, {
        key: 'user',
        label: t('auditTrailDrawer.table.columns.user'),
        width: '15%',
        headerClassName: 'border-r border-blue-200/80',
        cellClassName: 'border-r border-blue-100 text-slate-700 font-normal',
    }, {
        key: 'action',
        label: t('auditTrailDrawer.table.columns.action'),
        width: '20%',
        headerClassName: 'border-r border-blue-200/80',
        cellClassName: 'border-r border-blue-100 text-slate-700 font-normal',
    }, {
        key: 'category',
        label: t('auditTrailDrawer.table.columns.category'),
        width: '20%',
        headerClassName: 'border-r border-blue-200/80',
        cellClassName: 'border-r border-blue-100 text-slate-700 font-normal',

    }, {
        key: 'result',
        label: t('auditTrailDrawer.table.columns.result'),
        width: '20%',
        headerClassName: 'border-r border-blue-200/80',
        cellClassName: 'border-r border-blue-100 text-slate-700 font-normal',
        render: (value) => (
            <Badge variant="success" size="md" className="h-auto py-1 text-center leading-tight">
                {`${String(value ?? "")} ${t('auditTrailDrawer.table.uploaded')}`}
            </Badge>
        )
    }
]