
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { MapPin, Download } from 'lucide-react';
import { Classification, ZoneDataRow } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';

const roleColors = [
    { header: 'bg-fuchsia-50', text: 'text-rose-900' },
    { header: 'bg-cyan-50', text: 'text-teal-700' },
    { header: 'bg-blue-50', text: 'text-blue-700' },
    { header: 'bg-emerald-50', text: 'text-emerald-700' },
    { header: 'bg-violet-50', text: 'text-violet-700' }
];

export const getUniqueRoles = (data: ZoneDataRow[]): string[] => {
    if (!data || data.length === 0) return [];
    const firstWithClassifications = data.find((row) => row.classifications && row.classifications.length > 0);
    if (!firstWithClassifications) return [];
    return firstWithClassifications.classifications?.map((c: Classification) => c.type).filter((t: string) => t && t !== 'Total') || [];
};

export const getApprovalColumns = (
    roles: string[],
    onDivisionClick?: (zoneId: string) => void,
    t?: (key: string) => string
): Column<ZoneDataRow>[] => {
    const defaultCellClass = 'p-3 text-center font-bold text-slate-700 border-r border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap';
    const baseColumns: Column<ZoneDataRow>[] = [
        {
            key: 'sr',
            label: t ? t('columns.sr') : '',
            align: 'center',
            cellClassName: defaultCellClass,
            render: (_value, row, index) => row.isTotal ? '' : index + 1
        },
        {
            key: 'zoneName',
            label: t ? t('columns.zoneWard') : '',
            align: 'left',
            cellClassName: '!p-0 border-r border-slate-300 border-l-2 border-l-transparent group-hover:border-l-indigo-500',
            render: (value, row) => {
                if (row.isTotal) {
                    return <div className="text-black font-bold text-center w-full block p-3">{row.zoneName || (t ? t('total') : 'Total')}</div>;
                }
                const nameStr = (value as string) || '';
                const code = row.wardId ? String(row.wardId) : row.zoneId ? String(row.zoneId) : nameStr.split(' - ')[0];
                return (
                    <div
                        className="flex items-center gap-2 w-full h-full p-3 cursor-pointer hover:bg-indigo-50/50 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDivisionClick && code) {
                                onDivisionClick(code);
                            }
                        }}
                    >
                        <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span className="text-slate-950 font-bold text-[13px] whitespace-nowrap">{row.wardName || nameStr}</span>
                    </div>
                );
            }
        },
        {
            key: 'totalStructure',
            label: '',
            align: 'center',
            cellClassName: 'border border-slate-300 p-1 text-center font-bold text-blue-900',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'totalUnit',
            label: '',
            align: 'center',
            cellClassName: 'border border-slate-300 p-1 text-center font-bold text-blue-900',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'totalDemand',
            label: '',
            align: 'center',
            cellClassName: 'border border-slate-300 p-1 text-center font-bold text-green-900 min-w-[80px]',
            render: (_, row) => {
                const demand = (row.totalDemand as number | undefined) ?? row.classifications?.find((x: Classification) => x.type === 'Total')?.totalDemand ?? row.classifications?.find((x: Classification) => x.type === 'Clerk')?.totalDemand ?? 0;
                if (demand >= 10000000) {
                    return `₹${(demand / 10000000).toFixed(2)}Cr`;
                } else {
                    return `₹${(demand / 100000).toFixed(2)}L`;
                }
            }
        }
    ];

    const dynamicTextColors = [
        'text-indigo-900',
        'text-cyan-950',
        'text-purple-950',
        'text-pink-950',
        'text-teal-950'
    ];

    roles.forEach((role, idx) => {
        const textClass = dynamicTextColors[idx % dynamicTextColors.length];
        const baseRoleClass = `border border-slate-300 p-1 text-center font-bold ${textClass}`;

        baseColumns.push(
            {
                key: `${role}_signedStruct`,
                label: '',
                align: 'center',
                cellClassName: baseRoleClass,
                render: (_, row) => {
                    const c = row.classifications?.find((x: Classification) => x.type === role);
                    return ((c?.structure as number) ?? 0).toLocaleString('en-IN');
                }
            },
            {
                key: `${role}_signedUnit`,
                label: '',
                align: 'center',
                cellClassName: baseRoleClass,
                render: (_, row) => {
                    const c = row.classifications?.find((x: Classification) => x.type === role);
                    return ((c?.unit as number) ?? 0).toLocaleString('en-IN');
                }
            },
            {
                key: `${role}_pendingStruct`,
                label: '',
                align: 'center',
                cellClassName: baseRoleClass,
                render: (_, row) => {
                    const c = row.classifications?.find((x: Classification) => x.type === role);
                    return ((c?.pendingStructure as number) ?? 0).toLocaleString('en-IN');
                }
            },
            {
                key: `${role}_pendingUnit`,
                label: '',
                align: 'center',
                cellClassName: baseRoleClass,
                render: (_, row) => {
                    const c = row.classifications?.find((x: Classification) => x.type === role);
                    return ((c?.pendingUnit as number) ?? 0).toLocaleString('en-IN');
                }
            }
        );
    });

    const totalCellClass = 'border border-slate-300 p-1 text-center font-bold text-amber-950';
    baseColumns.push(
        {
            key: `finalTotal_signedStruct`,
            label: '',
            align: 'center',
            cellClassName: totalCellClass,
            render: (_, row) => {
                const c = row.classifications?.find((x: Classification) => x.type === 'Total') || row.classifications?.[0];
                const total = c?.structure ?? 0;
                return total.toLocaleString('en-IN');
            }
        },
        {
            key: `finalTotal_signedUnit`,
            label: '',
            align: 'center',
            cellClassName: totalCellClass,
            render: (_, row) => {
                const c = row.classifications?.find((x: Classification) => x.type === 'Total') || row.classifications?.[0];
                const total = c?.unit ?? 0;
                return total.toLocaleString('en-IN');
            }
        },
        {
            key: `finalTotal_pendingStruct`,
            label: '',
            align: 'center',
            cellClassName: totalCellClass,
            render: (_, row) => {
                const c = row.classifications?.find((x: Classification) => x.type === 'Total') || row.classifications?.[0];
                const total = c?.pendingStructure ?? 0;
                return total.toLocaleString('en-IN');
            }
        },
        {
            key: `finalTotal_pendingUnit`,
            label: '',
            align: 'center',
            cellClassName: totalCellClass,
            render: (_, row) => {
                const c = row.classifications?.find((x: Classification) => x.type === 'Total') || row.classifications?.[0];
                const total = c?.pendingUnit ?? 0;
                return total.toLocaleString('en-IN');
            }
        }
    );

    return baseColumns;
};

export const getApprovalHeaderRows = (roles: string[], t?: (key: string) => string, viewType: 'zone' | 'ward' = 'zone'): HeaderCell[][] => {
    const topRow: HeaderCell[] = [
        {
            label: <div className="flex items-center justify-start gap-1 font-bold text-[15px] text-slate-700 uppercase whitespace-nowrap">SR</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[50px] border-r border-slate-300'
        },
        {
            label: (
                <div className="flex items-center justify-start gap-1 font-bold text-[15px] text-slate-700 uppercase whitespace-nowrap">
                    {viewType === 'ward' 
                        ? (t ? t('columns.divisionOffice') : 'DIVISION OFFICE') 
                        : (t ? t('columns.division') : 'DIVISION')}
                </div>
            ),
            rowSpan: 2,
            align: 'left',
            headerClassName: 'bg-slate-50 min-w-[180px] border-r border-slate-300'
        },
        {
            label: <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">{t ? t('totalStructures') : 'Total Structures'}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 border-r border-slate-300'
        },
        {
            label: <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">{t ? t('totalUnitsSubmitted') : 'Total Units Submitted'}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 border-r border-slate-300'
        },
        {
            label: <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">{t ? t('totalDemandCr') : 'Total Demand (Cr)'}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-emerald-50 border-r border-slate-300'
        }
    ];

    const bottomRow: HeaderCell[] = [];

    roles.forEach((role, idx) => {
        const color = roleColors[idx % roleColors.length];

        topRow.push({
            label: (
                <div className="flex items-center justify-between w-full px-1">
                    <span className="flex-1 text-center font-bold text-[14px] text-slate-700 whitespace-nowrap pl-6">{role}</span>
                    <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                        <Download className="w-3.5 h-3.5" />
                        {t ? t('export') : 'Export'}
                    </button>
                </div>
            ),
            colSpan: 4,
            align: 'center',
            headerClassName: `${color.header} border-r border-b border-slate-300 p-2`
        });

        bottomRow.push(
            {
                label: (
                    <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                        {t ? t('signed') : 'Signed'}<br />
                        {viewType === 'ward' ? (t ? t('buildings') : 'Buildings') : (t ? t('structures') : 'Structures')}
                    </div>
                ),
                align: 'center',
                headerClassName: `${color.header} border-r border-slate-300 p-2`
            },
            {
                label: (
                    <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                        {t ? t('signed') : 'Signed'}<br />
                        {viewType === 'ward' ? (t ? t('unit') : 'Unit') : (t ? t('units') : 'Units')}
                    </div>
                ),
                align: 'center',
                headerClassName: `${color.header} border-r border-slate-300 p-2`
            },
            {
                label: (
                    <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                        {t ? t('pending') : 'Pending'}<br />
                        {viewType === 'ward' ? (t ? t('buildings') : 'Buildings') : (t ? t('structures') : 'Structures')}
                    </div>
                ),
                align: 'center',
                headerClassName: `${color.header} border-r border-slate-300 p-2`
            },
            {
                label: (
                    <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                        {t ? t('pending') : 'Pending'}<br />
                        {viewType === 'ward' ? (t ? t('units') : 'Units') : (t ? t('units') : 'Units')}
                    </div>
                ),
                align: 'center',
                headerClassName: `${color.header} border-r border-slate-300 p-2`
            }
        );
    });

    topRow.push({
        label: <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">{t ? t('total') : 'Total'}</div>,
        colSpan: 4,
        align: 'center',
        headerClassName: `bg-amber-50 border-r border-b border-slate-300 p-2`
    });

    bottomRow.push(
        {
            label: (
                <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                    {t ? t('signed') : 'Signed'}<br />
                    {viewType === 'ward' ? (t ? t('buildings') : 'Buildings') : (t ? t('structures') : 'Structures')}
                </div>
            ),
            align: 'center',
            headerClassName: `bg-amber-50 border-r border-slate-300 p-2`
        },
        {
            label: (
                <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                    {t ? t('signed') : 'Signed'}<br />
                    {viewType === 'ward' ? (t ? t('unit') : 'Unit') : (t ? t('units') : 'Units')}
                </div>
            ),
            align: 'center',
            headerClassName: `bg-amber-50 border-r border-slate-300 p-2`
        },
        {
            label: (
                <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                    {t ? t('pending') : 'Pending'}<br />
                    {viewType === 'ward' ? (t ? t('buildings') : 'Buildings') : (t ? t('structures') : 'Structures')}
                </div>
            ),
            align: 'center',
            headerClassName: `bg-amber-50 border-r border-slate-300 p-2`
        },
        {
            label: (
                <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700 whitespace-nowrap">
                    {t ? t('pending') : 'Pending'}<br />
                    {viewType === 'ward' ? (t ? t('units') : 'Units') : (t ? t('units') : 'Units')}
                </div>
            ),
            align: 'center',
            headerClassName: `bg-amber-50 border-r border-slate-300 p-2`
        }
    );

    return [topRow, bottomRow];
};
