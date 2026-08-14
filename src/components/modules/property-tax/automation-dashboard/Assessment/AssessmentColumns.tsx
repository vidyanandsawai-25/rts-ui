import type React from 'react';
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { AssessmentRow } from '@/types/automation-dashboard/assessment/assessmentgrid.type';

const renderClickableCell = (value: unknown, row: AssessmentRow, locale: string, workflowStageId: string | null, returnUrl: string, router: { push: (href: string) => void }, extraQuery: string = '') => {
    if (value === undefined || value === null) return value as React.ReactNode;
    // Don't render links for grand total row if it doesn't have a specific zoneId (but 0 is valid for TOTAL)
    if (row.zoneId === undefined || row.zoneId === null) return <div className="w-full h-full p-3 flex items-center justify-center cursor-default">{value as React.ReactNode}</div>;
    
    return (
        <div 
            onClick={() => router.push(`/${locale}/property-tax/automation-dashboard/property-details-dashboard/${row.zoneId}?workflowStageId=${workflowStageId || ''}&stage=Assessment${row.zoneNo ? `&zoneNo=${row.zoneNo}` : ''}${extraQuery}&returnUrl=${encodeURIComponent(returnUrl)}`)}
            className="w-full h-full p-3 flex items-center justify-center cursor-pointer hover:bg-blue-50/50 hover:text-blue-800 transition-colors"
        >
            <span className="hover:underline">{value as React.ReactNode}</span>
        </div>
    );
};

const renderHeader = (title: string, _showSort: boolean = true) => (
    <div className="flex items-center justify-center gap-1 font-bold text-[11px] lg:text-[14px] py-3 text-slate-900 uppercase whitespace-nowrap">
        {title}
    </div>
);

export const getAssessmentHeaderRows = (tab: string, t: (key: string) => string): HeaderCell[][] => [
    [
        {
            label: renderHeader(t('columns.sr'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[50px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.zoneNo'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.totalStructure'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.totalUnit'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        },
        {
            label: <div className="font-bold text-[11px] lg:text-[15px] text-slate-900 uppercase">{t('columns.propertyClassification')}</div>,
            colSpan: tab === 'Unassessed' ? 7 : 8,
            align: 'center',
            headerClassName: 'bg-fuchsia-200/50 py-3 border-b border-slate-200'
        }
    ],
    [
        {
            label: renderHeader(t('columns.type'), false),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.structure'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[100px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.unit'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[100px] border-r border-slate-200'
        },
        ...(tab !== 'Unassessed' ? [{
            label: renderHeader(t('columns.oldDemand'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        } as HeaderCell] : []),
        {
            label: renderHeader(t('columns.currentDemand'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[130px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.retroDemand'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[120px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.totalDemand'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[130px] border-r border-slate-200'
        },
        {
            label: renderHeader(t('columns.additionalRevenue'), true),
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[180px]'
        }
    ]
];

export const getAssessmentColumns = (
    tab: string,
    _t: (key: string) => string,
    locale: string,
    workflowStageId: string | null,
    returnUrl: string,
    router: { push: (href: string) => void }
): Column<AssessmentRow>[] => [
        {
            key: 'sr',
            label: '',
            align: 'center',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 w-12 select-none bg-[#f8fafc]",
            rowSpan: (row) => row.rowSpan ?? 0
        },
        {
            key: 'zoneName',
            label: '',
            align: 'left',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[140px] select-none bg-[#f8fafc]",
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => (row.zoneNo && value !== 'TOTAL' && value !== 'GRAND TOTAL') ? row.zoneNo : value as React.ReactNode
        },
        {
            key: 'totalStructure',
            label: '',
            align: 'center',
            cellClassName: '!p-0 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[90px] select-none bg-[#f8fafc]',
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Structure=true')
        },
        {
            key: 'totalUnit',
            label: '',
            align: 'center',
            cellClassName: "!p-0 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[90px] select-none bg-[#f8fafc]",
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Unit=true')
        },
        {
            key: 'type',
            label: '',
            align: 'left',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[130px] bg-[#f8fafc]",
            render: (value) => {
                const colors = {
                    'Assessed': 'text-blue-950 bg-blue-50/50',
                    'Unassessed': 'text-amber-950 bg-amber-50/50',
                    'Rented': 'text-orange-950 bg-orange-50/50',
                    'Assessed + Unassessed': 'text-slate-800 bg-slate-50/30',
                    'Additional Construction': 'text-blue-950 bg-blue-50/50',
                    'Change Of Use': 'text-amber-950 bg-amber-50/50',
                    'NoChange': 'text-orange-950 bg-orange-50/50',
                    'Underassessed': 'text-orange-950 bg-orange-50/50',
                    'Residential': 'text-blue-950 bg-blue-50/50',
                    'Commercial': 'text-green-950 bg-green-50/50',
                    'Industrial': 'text-purple-950 bg-purple-50/50',
                    'Mixed Use': 'text-amber-950 bg-amber-50/50',
                    'Public Utility': 'text-teal-950 bg-teal-50/50',
                    'Open Plots': 'text-slate-950 bg-slate-50/50',
                    'Owner': 'text-indigo-950 bg-indigo-50/50',
                    'Renter': 'text-purple-950 bg-purple-50/50'
                };
                const colorClass = colors[value as keyof typeof colors] || 'text-slate-700';
                return <div className={`h-full w-full py-3 -my-2 ${colorClass}`}>{value as React.ReactNode}</div>;
            }
        },
        {
            key: 'structure',
            label: '',
            align: 'center',
            cellClassName: "!p-0 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[80px] select-none bg-[#f8fafc]",
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Structure=true')
        },
        {
            key: 'unit',
            label: '',
            align: 'center',
            cellClassName: "!p-0 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[80px] select-none bg-[#f8fafc]",
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Unit=true')
        },
        ...(tab !== 'Unassessed' ? [{
            key: 'oldDemand',
            label: '',
            align: 'right',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[80px] select-none bg-[#f8fafc]"
        } as Column<AssessmentRow>] : []),
        {
            key: 'currentDemand',
            label: '',
            align: 'right',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[120px] select-none bg-[#f8fafc]",
        },
        {
            key: 'retroDemand',
            label: '',
            align: 'right',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[120px] select-none bg-[#f8fafc]",
        },
        {
            key: 'totalDemand',
            label: '',
            align: 'right',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[120px] select-none bg-[#f8fafc]"
        },
        {
            key: 'addRevenue',
            label: '',
            align: 'right',
            cellClassName: "p-3 text-center text-table-header text-slate-950 font-bold border-b-2 border-r border-slate-300 min-w-[120px] select-none bg-[#f8fafc]"
        }
    ];
