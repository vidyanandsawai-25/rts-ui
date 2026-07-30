/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpDown, ArrowUp } from 'lucide-react';
import { formatIndianNumber } from '@/lib/utils/numberUtils';
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
    wardId?: number;
    zoneId?: number;
    zoneNo?: string;
};

type ViewType = 'zone' | 'ward';

export const getGeoSequencingSharedColumns = (
    _t: any,
    viewType: ViewType,
    onRowClick?: (id: string, row: GeoSequencingData) => void,
    linkHref?: (id: string) => string,
    onPropertyCellClick?: (row: GeoSequencingData, key: string) => void
): Column<GeoSequencingData>[] => {

    const renderClickableCell = (value: unknown, row: GeoSequencingData, key: string, colorClass: string) => (
        <div
            className={`w-full h-full p-3 text-center font-bold whitespace-nowrap flex items-center justify-center cursor-pointer transition-colors ${colorClass}`}
            onClick={(e) => {
                e.stopPropagation();
                if (row.isTotal) return;
                onPropertyCellClick?.(row, key);
            }}
        >
            {formatIndianNumber(value)}
        </div>
    );

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
            cellClassName: '!p-0 border-r border-slate-300',
            render: (value, row) => renderClickableCell(value, row, 'registered', 'text-emerald-950 hover:bg-emerald-50')
        });
    }

    baseColumns.push(
        { key: 'geoStruct', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'geoStruct', 'text-blue-900 hover:bg-blue-50') },
        { key: 'geoUnit', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'geoUnit', 'text-blue-900 hover:bg-blue-50') },
        { key: 'propRes', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'propRes', 'text-purple-950 hover:bg-purple-50') },
        { key: 'propNonRes', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'propNonRes', 'text-purple-950 hover:bg-purple-50') },
        { key: 'propMixed', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'propMixed', 'text-purple-950 hover:bg-purple-50') },
        { key: 'propPublic', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'propPublic', 'text-purple-950 hover:bg-purple-50') },
        { key: 'propUnder', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'propUnder', 'text-purple-950 hover:bg-purple-50') },
        { key: 'assessStruct', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'assessStruct', 'text-green-950 hover:bg-green-50') },
        { key: 'assessUnit', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'assessUnit', 'text-green-950 hover:bg-green-50') },
        { key: 'unassessStruct', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'unassessStruct', 'text-orange-950 hover:bg-orange-50') },
        { key: 'unassessUnit', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'unassessUnit', 'text-orange-950 hover:bg-orange-50') },
        { key: 'newlyStruct', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'newlyStruct', 'text-emerald-950 hover:bg-emerald-50') },
        { key: 'newlyUnit', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'newlyUnit', 'text-emerald-950 hover:bg-emerald-50') },
        { key: 'inprocessStruct', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'inprocessStruct', 'text-orange-950 hover:bg-orange-50') },
        { key: 'inprocessUnit', label: '', align: 'center', cellClassName: '!p-0 border-r border-slate-300', render: (v, r) => renderClickableCell(v, r, 'inprocessUnit', 'text-orange-950 hover:bg-orange-50') }
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
