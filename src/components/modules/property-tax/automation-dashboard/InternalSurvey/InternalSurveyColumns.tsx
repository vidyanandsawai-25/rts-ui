/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpDown, ArrowUp } from 'lucide-react';
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { getCommonDivisionColumn, getCommonSrColumn } from '../CommonColumns/CommonColumns';
import { formatIndianNumber } from '@/lib/utils/numberUtils';

export type InternalSurveyTableRow = {
    sr: number | string;
    division: string;
    geoStruct: number | string;
    geoUnit: number | string;
    surveyStruct: number | string;
    surveyUnit: number | string;
    propRes: number | string;
    propNonRes: number | string;
    propMixed: number | string;
    propPublic: number | string;
    propUnder: number | string;
    assessStruct: number | string;
    assessUnit: number | string;
    unassessStruct: number | string;
    unassessUnit: number | string;
    newlyStruct: number | string;
    newlyUnit: number | string;
    inprocessStruct: number | string;
    inprocessUnit: number | string;
    photoCount: number | string;
    isTotal?: boolean;
    wardId?: number;
    zoneId?: number;
    zoneNo?: string;
};

export const getInternalSurveyColumns = (
    _t: any,
    onRowClick?: (id: string, row: InternalSurveyTableRow) => void,
    linkHref?: (id: string) => string,
    onPropertyCellClick?: (row: InternalSurveyTableRow, key: string) => void
): Column<InternalSurveyTableRow>[] => {

    const divisionColumn = getCommonDivisionColumn<InternalSurveyTableRow>(onRowClick, linkHref);

    const renderClickableCell = (value: unknown, row: InternalSurveyTableRow, key: string, textClass: string) => (
        <div
            className={`w-full h-full p-3 text-center font-bold ${textClass} flex items-center justify-center`}
            onClick={(e) => {
                e.stopPropagation();
                if (row.isTotal) return;
                onPropertyCellClick?.(row, key);
            }}
        >
            {formatIndianNumber(value)}
        </div>
    );

    const baseColumns: Column<InternalSurveyTableRow>[] = [
        getCommonSrColumn<InternalSurveyTableRow>(),
        divisionColumn,
        {
            key: 'geoStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-indigo-50 transition-colors',
            render: (value, row) => renderClickableCell(value, row, 'geoStruct', 'text-indigo-950')
        },
        {
            key: 'geoUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-indigo-50 transition-colors',
            render: (value, row) => renderClickableCell(value, row, 'geoUnit', 'text-indigo-950')
        },
        {
            key: 'surveyStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-indigo-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'surveyStruct', 'text-indigo-950')
        },
        {
            key: 'surveyUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-indigo-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'surveyUnit', 'text-indigo-950')
        },
        {
            key: 'propRes',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-purple-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'propRes', 'text-purple-950')
        },
        {
            key: 'propNonRes',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-purple-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'propNonRes', 'text-purple-950')
        },
        {
            key: 'propMixed',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-purple-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'propMixed', 'text-purple-950')
        },
        {
            key: 'propPublic',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-purple-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'propPublic', 'text-purple-950')
        },
        {
            key: 'propUnder',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border-r border-slate-300 hover:bg-purple-50 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'propUnder', 'text-purple-950')
        },
        {
            key: 'assessStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-green-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'assessStruct', 'text-green-900')
        },
        {
            key: 'assessUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-green-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'assessUnit', 'text-green-900')
        },
        {
            key: 'unassessStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-orange-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'unassessStruct', 'text-orange-900')
        },
        {
            key: 'unassessUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-orange-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'unassessUnit', 'text-orange-900')
        },
        {
            key: 'newlyStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-emerald-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'newlyStruct', 'text-emerald-950')
        },
        {
            key: 'newlyUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-emerald-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'newlyUnit', 'text-emerald-950')
        },
        {
            key: 'inprocessStruct',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-orange-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'inprocessStruct', 'text-orange-900')
        },
        {
            key: 'inprocessUnit',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300 hover:bg-orange-100 transition-colors cursor-pointer',
            render: (value, row) => renderClickableCell(value, row, 'inprocessUnit', 'text-orange-900')
        },
        {
            key: 'photoCount',
            label: '',
            align: 'center',
            cellClassName: '!p-0 border border-slate-300',
            render: (value, row) => renderClickableCell(value, row, 'photoCount', 'text-cyan-900')
        }
    ];

    return baseColumns;
};

const SortIcon = () => (
    <ArrowUpDown className="inline-block ml-1 w-3 h-3 text-slate-400 opacity-60" />
);

const ActiveSortIcon = () => (
    <ArrowUp className="inline-block ml-1 w-3 h-3 text-slate-500" />
);

const renderHeader = (title: string, showSort: boolean = true, activeSort: boolean = false) => (
    <div className="flex items-center justify-center gap-1 font-bold text-[13px] text-slate-700">
        {title} {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
    </div>
);

const renderLeftHeader = (title: string, showSort: boolean = true, activeSort: boolean = false) => (
    <div className="flex items-center justify-start gap-1 font-bold text-[14px] text-slate-700 uppercase">
        {title} {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
    </div>
);

export const getInternalSurveyHeaderRows = (t: any): HeaderCell[][] => {
    const topRow: HeaderCell[] = [
        {
            label: <div className="font-bold text-[14px] text-slate-700 uppercase">{t('internalSurvey.columns.sr')}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[40px]'
        },
        {
            label: renderLeftHeader(t('internalSurvey.columns.division'), true, true),
            rowSpan: 2,
            align: 'left',
            headerClassName: 'bg-slate-50 min-w-[180px] cursor-pointer hover:bg-slate-100 transition-colors'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.geoSequencingProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.surveyProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.propertyType')}</div>,
            colSpan: 5,
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.assessedProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-green-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.unassessedProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.newlyAssessedFound')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-emerald-50'
        },
        {
            label: <div className="font-bold text-[14px] text-slate-700 text-center">{t('internalSurvey.columns.assessmentInprocess')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.photoCount'), true, false),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-cyan-50'
        }
    ];

    const bottomRow: HeaderCell[] = [
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.residential'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.nonResidential'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.mixedProperty'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.publicUtility'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.underConstruction'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-green-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.units'), true, false),
            align: 'center',
            headerClassName: 'bg-green-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.units'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-emerald-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-emerald-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: renderHeader(t('internalSurvey.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50'
        }
    ];

    return [topRow, bottomRow];
};
