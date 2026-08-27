/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import type { SortConfig } from '@/lib/utils/automation-dashboard/sortUtils';
import { renderSortableHeader, ViewType } from '../CommonColumns/SortHeader';
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
    assessedStatusId?: number;
    unassessedStatusId?: number;
    newlyAssessedStatusId?: number;
    inprocessStatusId?: number;
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

export const getInternalSurveyHeaderRows = (
    t: any,
    viewType: ViewType = 'zone',
    sortConfig?: SortConfig<InternalSurveyTableRow> | null,
    onSort?: (key: keyof InternalSurveyTableRow) => void
): HeaderCell[][] => {
    const topRow: HeaderCell[] = [
        {
            label: <div className="font-bold text-[15px] text-slate-900 uppercase">{t('internalSurvey.columns.sr')}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[50px] border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(
                t('internalSurvey.columns.division'),
                'division',
                sortConfig,
                onSort,
                true,
                viewType
            ),
            rowSpan: 2,
            align: 'left',
            headerClassName: 'bg-slate-50 min-w-[180px] cursor-pointer hover:bg-slate-100 transition-colors border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center">{t('internalSurvey.columns.geoSequencingProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center">{t('internalSurvey.columns.surveyProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center">{t('internalSurvey.columns.propertyType')}</div>,
            colSpan: 5,
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center whitespace-nowrap">{t('internalSurvey.columns.assessed')}<br />{t('internalSurvey.columns.properties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-green-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center whitespace-nowrap">{t('internalSurvey.columns.unassessed')}<br />{t('internalSurvey.columns.properties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center"><span className="whitespace-nowrap">{t('internalSurvey.columns.newlyAssessed')}</span><br />{t('internalSurvey.columns.found')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-emerald-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-900 text-center">{t('internalSurvey.columns.assessment')}<br />{t('internalSurvey.columns.inprocess')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.photoCount'), 'photoCount', sortConfig, onSort, false, viewType),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-cyan-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        }
    ];

    const bottomRow: HeaderCell[] = [
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'geoStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.unit'), 'geoUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'surveyStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.unit'), 'surveyUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.residential'), 'propRes', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.nonResidential'), 'propNonRes', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.mixedProperty'), 'propMixed', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.publicUtility'), 'propPublic', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.underConstruction'), 'propUnder', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'assessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-green-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.units'), 'assessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-green-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'unassessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.units'), 'unassessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'newlyStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-emerald-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.unit'), 'newlyUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-emerald-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.structure'), 'inprocessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        },
        {
            label: renderSortableHeader(t('internalSurvey.columns.unit'), 'inprocessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 border border-slate-300 p-1 text-center text-table-header text-slate-900 sticky top-0 z-20'
        }
    ];

    return [topRow, bottomRow];
};
