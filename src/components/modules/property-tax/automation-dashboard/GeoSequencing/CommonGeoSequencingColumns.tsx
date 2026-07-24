/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpDown, ArrowUp } from 'lucide-react';
import { getCommonDivisionColumn, getCommonSrColumn } from '../CommonColumns/CommonColumns';
import type { Column, HeaderCell } from '@/components/common/AutomationTable';

export type GeoSequencingData = {
    sr: number | string;
    division: string;
    registered?: string | number; // Only for 'zone' view
    geoStruct: string | number;
    geoUnit: string | number;
    propRes: string | number;
    propNonRes: string | number;
    propMixed: string | number;
    propPublic: string | number;
    propUnder: string | number;
    assessStruct: string | number;
    assessUnit: string | number;
    unassessStruct: string | number;
    unassessUnit: string | number;
    newlyStruct: string | number;
    newlyUnit: string | number;
    inprocessStruct: string | number;
    inprocessUnit: string | number;
    isTotal?: boolean;
};

type ViewType = 'zone' | 'ward';

export const getGeoSequencingSharedColumns = (
    _t: any,
    viewType: ViewType,
    onRowClick?: (id: string) => void,
    linkHref?: (id: string) => string
): Column<GeoSequencingData>[] => {

    // Customize division/ward label depending on the view
    // getCommonDivisionColumn expects a translation key or we can just let it render what's in the data.
    // The data mapping will put either division or ward number in the 'division' field.
    const divisionColumn = getCommonDivisionColumn<GeoSequencingData>(onRowClick, linkHref);

    const baseColumns: Column<GeoSequencingData>[] = [
        getCommonSrColumn<GeoSequencingData>(),
        divisionColumn
    ];

    if (viewType === 'zone') {
        baseColumns.push({
            key: 'registered',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-emerald-950 border-r border-slate-300',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        });
    }

    baseColumns.push(
        {
            key: 'geoStruct',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-blue-900 border-r border-slate-300 cursor-pointer hover:bg-blue-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'geoUnit',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-blue-900 border-r border-slate-300 cursor-pointer hover:bg-blue-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'propRes',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-purple-950 border-r border-slate-300 cursor-pointer hover:bg-purple-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'propNonRes',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-purple-950 border-r border-slate-300 cursor-pointer hover:bg-purple-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'propMixed',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-purple-950 border-r border-slate-300 cursor-pointer hover:bg-purple-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'propPublic',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-purple-950 border-r border-slate-300 cursor-pointer hover:bg-purple-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'propUnder',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-purple-950 border-r border-slate-300 cursor-pointer hover:bg-purple-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'assessStruct',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-green-950 border-r border-slate-300 cursor-pointer hover:bg-green-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'assessUnit',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-green-950 border-r border-slate-300 cursor-pointer hover:bg-green-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'unassessStruct',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-orange-950 border-r border-slate-300 cursor-pointer hover:bg-orange-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'unassessUnit',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-orange-950 border-r border-slate-300 cursor-pointer hover:bg-orange-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'newlyStruct',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-emerald-950 border-r border-slate-300 cursor-pointer hover:bg-emerald-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'newlyUnit',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-emerald-950 border-r border-slate-300 cursor-pointer hover:bg-emerald-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'inprocessStruct',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-orange-950 border-r border-slate-300 cursor-pointer hover:bg-orange-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        },
        {
            key: 'inprocessUnit',
            label: '',
            align: 'center',
            cellClassName: 'p-3 text-center font-bold text-orange-950 border-r border-slate-300 cursor-pointer hover:bg-orange-50 transition-colors',
            render: (value) => ((value as number) ?? 0).toLocaleString('en-IN')
        }
    );

    return baseColumns;
};

const SortIcon = () => (
    <ArrowUpDown className="inline-block ml-1 w-3 h-3 text-slate-400 opacity-60" />
);

const ActiveSortIcon = () => (
    <ArrowUp className="inline-block ml-1 w-3 h-3 text-slate-500" />
);

const renderHeader = (title: string, showSort: boolean = true, activeSort: boolean = false) => (
    <div className="flex items-center justify-center gap-1 font-bold text-[14px] text-slate-700">
        {title} {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
    </div>
);

const renderLeftHeader = (title: string, showSort: boolean = true, activeSort: boolean = false) => (
    <div className="flex items-center justify-start gap-1 font-bold text-[15px] text-slate-700 uppercase">
        {title} {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
    </div>
);

export const getGeoSequencingSharedHeaderRows = (t: any, viewType: ViewType): HeaderCell[][] => {
    const topRow: HeaderCell[] = [
        {
            label: <div className="font-bold text-[15px] text-slate-700 uppercase">{t('geoSequencing.columns.sr')}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[40px]'
        },
        {
            label: renderLeftHeader(viewType === 'zone' ? t('geoSequencing.columns.division') : t('geoSequencing.columns.wardNo'), true, true),
            rowSpan: 2,
            align: 'left',
            headerClassName: 'bg-slate-50 min-w-[180px] cursor-pointer hover:bg-slate-100 transition-colors'
        }
    ];

    if (viewType === 'zone') {
        topRow.push({
            label: renderHeader(t('geoSequencing.columns.registeredProperties'), true, false),
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-emerald-50/50 min-w-[100px] cursor-pointer hover:bg-emerald-100/50 transition-colors'
        });
    }

    topRow.push(
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.geoSequencingProperties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-blue-50'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.propertyType')}</div>,
            colSpan: 5,
            align: 'center',
            headerClassName: 'bg-purple-50'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.assessed')}<br />{t('geoSequencing.columns.properties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-green-50'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.unassessed')}<br />{t('geoSequencing.columns.properties')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.newlyAssessedFound')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-emerald-50'
        },
        {
            label: <div className="font-bold text-[15px] text-slate-700">{t('geoSequencing.columns.assessmentInprocess')}</div>,
            colSpan: 2,
            align: 'center',
            headerClassName: 'bg-orange-50'
        }
    );

    const bottomRow: HeaderCell[] = [
        {
            label: renderHeader(t('geoSequencing.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.residential'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.nonResidential'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.mixed'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.publicUtility'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.underConstruction'), true, false),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.structure'), false, false),
            align: 'center',
            headerClassName: 'bg-green-50'
        },
        {
            label: renderHeader(t('geoSequencing.columns.units'), true, false),
            align: 'center',
            headerClassName: 'bg-green-50 hover:bg-green-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.structure'), false, false),
            align: 'center',
            headerClassName: 'bg-orange-50'
        },
        {
            label: renderHeader(t('geoSequencing.columns.units'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.structure'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        },
        {
            label: renderHeader(t('geoSequencing.columns.unit'), true, false),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        }
    ];

    return [topRow, bottomRow];
};
