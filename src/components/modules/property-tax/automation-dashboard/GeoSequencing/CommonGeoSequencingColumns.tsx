
import { getCommonDivisionColumn, getCommonSrColumn } from '../CommonColumns/CommonColumns';
import type { Column, HeaderCell } from '@/components/common/AutomationTable';
import type { SortConfig } from '@/lib/utils/automation-dashboard/sortUtils';
import { renderSortableHeader, ViewType } from '../CommonColumns/SortHeader';
import { formatIndianNumber } from '@/lib/utils/numberUtils';


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

export const getGeoSequencingSharedColumns = (
    _t: (key: string) => string,
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

export const getGeoSequencingSharedHeaderRows = (
    t: (key: string) => string,
    viewType: ViewType,
    sortConfig?: SortConfig<GeoSequencingData> | null,
    onSort?: (key: keyof GeoSequencingData) => void
): HeaderCell[][] => {
    const topRow: HeaderCell[] = [
        {
            label: <div className="font-bold text-[15px] text-slate-700 uppercase">{t('geoSequencing.columns.sr')}</div>,
            rowSpan: 2,
            align: 'center',
            headerClassName: 'bg-slate-50 min-w-[40px]'
        },
        {
            label: renderSortableHeader(viewType === 'zone' ? t('geoSequencing.columns.division') : t('geoSequencing.columns.wardNo'), 'division', sortConfig, onSort, true, viewType),
            rowSpan: 2,
            align: 'left',
            headerClassName: 'bg-slate-50 min-w-[180px] cursor-pointer hover:bg-slate-100 transition-colors'
        }
    ];

    if (viewType === 'zone') {
        topRow.push({
            label: renderSortableHeader(t('geoSequencing.columns.registeredProperties'), 'registered', sortConfig, onSort, false, viewType),
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
            label: renderSortableHeader(t('geoSequencing.columns.structure'), 'geoStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.unit'), 'geoUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.residential'), 'propRes', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.nonResidential'), 'propNonRes', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.mixed'), 'propMixed', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.publicUtility'), 'propPublic', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.underConstruction'), 'propUnder', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.structure'), 'assessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-green-50 hover:bg-green-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.units'), 'assessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-green-50 hover:bg-green-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.structure'), 'unassessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.units'), 'unassessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.structure'), 'newlyStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.unit'), 'newlyUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.structure'), 'inprocessStruct', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        },
        {
            label: renderSortableHeader(t('geoSequencing.columns.unit'), 'inprocessUnit', sortConfig, onSort, false, viewType),
            align: 'center',
            headerClassName: 'bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer'
        }
    ];

    return [topRow, bottomRow];
};

export const getPropertyTypeIdParam = (columnKey: string): string => {
    switch (columnKey) {
        case 'propRes': return '&PropertyTypeCategoryId=1';
        case 'propNonRes': return '&PropertyTypeCategoryId=2';
        case 'propMixed': return '&PropertyTypeCategoryId=3';
        case 'propPublic': return '&PropertyTypeCategoryId=5';
        case 'propUnder': return '&PropertyTypeCategoryId=6';
        default: return '';
    }
};
