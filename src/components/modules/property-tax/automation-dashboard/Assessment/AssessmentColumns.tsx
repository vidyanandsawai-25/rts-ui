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

export const commonBorderClass = 'border-slate-400 dark:border-slate-600';
export const commonHeaderClass = `bg-white border ${commonBorderClass} px-2 py-1 text-center text-table-header text-slate-900 sticky top-0 z-20`;
export const commonClassificationHeaderClass = `bg-purple-200 py-3 border ${commonBorderClass} px-1 text-center text-table-header text-slate-900 sticky top-0 z-20`;

export const getAssessmentHeaderRows = (tab: string, t: (key: string) => string): HeaderCell[][] => [
    [
        {
            label: renderHeader(t('columns.sr'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: `min-w-[50px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.zoneNo'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.totalStructure'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.totalUnit'), true),
            rowSpan: 2,
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        },
        {
            label: <div className="font-bold text-[11px] lg:text-[15px] text-slate-900 uppercase">{t('columns.propertyClassification')}</div>,
            colSpan: tab === 'Unassessed' ? 7 : 8,
            align: 'center',
            headerClassName: commonClassificationHeaderClass
        }
    ],
    [
        {
            label: renderHeader(t('columns.type'), false),
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.structure'), true),
            align: 'center',
            headerClassName: `min-w-[100px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.unit'), true),
            align: 'center',
            headerClassName: `min-w-[100px] ${commonHeaderClass}`
        },
        ...(tab !== 'Unassessed' ? [{
            label: renderHeader(t('columns.oldDemand'), true),
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        } as HeaderCell] : []),
        {
            label: renderHeader(t('columns.currentDemand'), true),
            align: 'center',
            headerClassName: `min-w-[130px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.retroDemand'), true),
            align: 'center',
            headerClassName: `min-w-[120px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.totalDemand'), true),
            align: 'center',
            headerClassName: `min-w-[130px] ${commonHeaderClass}`
        },
        {
            label: renderHeader(t('columns.additionalRevenue'), true),
            align: 'center',
            headerClassName: `min-w-[180px] ${commonHeaderClass}`
        }
    ]
];

export const commonAssessmentCellClass = `p-0 text-center text-table-header text-slate-950 font-bold select-none bg-white border ${commonBorderClass}`;
export const commonAssessmentNoPaddingCellClass = `!p-0 text-center text-table-header text-slate-950 font-bold select-none bg-white h-[1px] border ${commonBorderClass}`;

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
            cellClassName: `w-12 ${commonAssessmentCellClass}`,
            rowSpan: (row) => row.rowSpan ?? 0
        },
        {
            key: 'zoneName',
            label: '',
            align: 'left',
            cellClassName: `min-w-[140px] ${commonAssessmentCellClass}`,
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => (row.zoneNo && value !== 'TOTAL' && value !== 'GRAND TOTAL') ? `${row.zoneNo} - ${value}` : value as React.ReactNode
        },
        {
            key: 'totalStructure',
            label: '',
            align: 'center',
            cellClassName: `min-w-[90px] ${commonAssessmentNoPaddingCellClass}`,
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Structure=true')
        },
        {
            key: 'totalUnit',
            label: '',
            align: 'center',
            cellClassName: `min-w-[90px] ${commonAssessmentNoPaddingCellClass}`,
            rowSpan: (row) => row.rowSpan ?? 0,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Unit=true')
        },
        {
            key: 'type',
            label: '',
            align: 'center',
            cellClassName: `min-w-[130px] ${commonAssessmentCellClass}`,
            render: (value) => {
                const colors = {
                    'Assessed': 'text-blue-950 bg-blue-100',
                    'Unassessed': 'text-amber-950 bg-amber-100',
                    'Rented': 'text-orange-950 bg-orange-100',
                    'Assessed + Unassessed': 'text-slate-800 bg-slate-100',
                    'Additional Construction': 'text-blue-950 bg-blue-100',
                    'Change Of Use': 'text-amber-950 bg-amber-100',
                    'NoChange': 'text-orange-950 bg-orange-100',
                    'Underassessed': 'text-orange-950 bg-orange-100',
                    'Residential': 'text-blue-950 bg-blue-100',
                    'Commercial': 'text-green-950 bg-green-100',
                    'Industrial': 'text-purple-950 bg-purple-100',
                    'Mixed Use': 'text-amber-950 bg-amber-100',
                    'Public Utility': 'text-teal-950 bg-teal-100',
                    'Open Plots': 'text-slate-950 bg-slate-100',
                    'Owner': 'text-indigo-950 bg-indigo-100',
                    'Renter': 'text-purple-950 bg-purple-100'
                };
                const colorClass = colors[value as keyof typeof colors] || 'text-slate-900';
                return <div className={`h-full w-full py-3 -my-2 ${colorClass}`}>{value as React.ReactNode}</div>;
            }
        },
        {
            key: 'structure',
            label: '',
            align: 'center',
            cellClassName: `min-w-[80px] ${commonAssessmentNoPaddingCellClass}`,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Structure=true')
        },
        {
            key: 'unit',
            label: '',
            align: 'center',
            cellClassName: `min-w-[80px] ${commonAssessmentNoPaddingCellClass}`,
            render: (value, row) => renderClickableCell(value, row, locale, workflowStageId, returnUrl, router, '&Unit=true')
        },
        ...(tab !== 'Unassessed' ? [{
            key: 'oldDemand',
            label: '',
            align: 'right',
            cellClassName: `min-w-[80px] ${commonAssessmentCellClass}`
        } as Column<AssessmentRow>] : []),
        {
            key: 'currentDemand',
            label: '',
            align: 'right',
            cellClassName: `min-w-[120px] ${commonAssessmentCellClass}`,
        },
        {
            key: 'retroDemand',
            label: '',
            align: 'right',
            cellClassName: `min-w-[120px] ${commonAssessmentCellClass}`,
        },
        {
            key: 'totalDemand',
            label: '',
            align: 'right',
            cellClassName: `min-w-[120px] ${commonAssessmentCellClass}`
        },
        {
            key: 'addRevenue',
            label: '',
            align: 'right',
            cellClassName: `min-w-[120px] ${commonAssessmentCellClass}`
        }
    ];

