/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUpDown, ArrowUp, Download } from 'lucide-react';
import { Column } from '@/components/common/AutomationTable';
import { HeaderCell } from '@/components/common/AutomationTable';
import { getCommonDivisionColumn, getCommonSrColumn, getCommonWardColumn } from '../CommonColumns/CommonColumns';

export type DataEntryData = {
    sr: number | string;
    division: string;
    wardNo: string;
    isTotal?: boolean;
    wardId?: number | string;
    zoneNo?: string;

    structure: string | number;
    unit: string | number;

    isStruct: string | number;
    isUnit: string | number;

    deCompStruct: string | number;
    deCompUnit: string | number;
    dePendStruct: string | number;
    dePendUnit: string | number;

    photoComp: string | number;
    photoPend: string | number;

    planComp: string | number;
    planPend: string | number;

    qaCompStruct: string | number;
    qaCompUnit: string | number;
    qaPendStruct: string | number;
    qaPendUnit: string | number;
    qaTypeWise: string | number;

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
};

export const getDataEntryColumns = (
    level: 'division' | 'ward',
    _t: any,
    onDivisionClick?: (divisionCode: string, row: any) => void,
    divisionLinkHref?: (divisionCode: string) => string,
    onPropertyCellClick?: (row: any, key: string) => void
): Column<any>[] => {
    const renderClickableCell = (value: unknown, row: any, key: string) => (
        <div
            className="w-full h-full p-3 text-center font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center justify-center"
            onClick={(e) => {
                e.stopPropagation();
                if (row.isTotal) return;
                onPropertyCellClick?.(row, key);
            }}
        >
            {value != null ? Number(value).toLocaleString('en-IN') : '0'}
        </div>
    );

    const cellClass = '!p-0 border-r border-slate-300';

    return [
        getCommonSrColumn<any>(),
        level === 'division' ? getCommonDivisionColumn<any>(onDivisionClick, divisionLinkHref) : getCommonWardColumn<any>(),

        { key: 'isStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'isStruct') },
        { key: 'isUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'isUnit') },

        { key: 'deCompStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'deCompStruct') },
        { key: 'deCompUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'deCompUnit') },
        { key: 'dePendStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'dePendStruct') },
        { key: 'dePendUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'dePendUnit') },

        { key: 'photoComp', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'photoComp') },
        { key: 'photoPend', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'photoPend') },

        { key: 'planComp', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'planComp') },
        { key: 'planPend', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'planPend') },

        { key: 'qaCompStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'qaCompStruct') },
        { key: 'qaCompUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'qaCompUnit') },
        { key: 'qaPendStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'qaPendStruct') },
        { key: 'qaPendUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'qaPendUnit') },
        { key: 'qaTypeWise', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'qaTypeWise') },

        { key: 'propRes', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'propRes') },
        { key: 'propNonRes', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'propNonRes') },
        { key: 'propMixed', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'propMixed') },
        { key: 'propPublic', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'propPublic') },
        { key: 'propUnder', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'propUnder') },

        { key: 'assessStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'assessStruct') },
        { key: 'assessUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'assessUnit') },
        { key: 'unassessStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'unassessStruct') },
        { key: 'unassessUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'unassessUnit') },
        { key: 'newlyStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'newlyStruct') },
        { key: 'newlyUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'newlyUnit') },
        { key: 'inprocessStruct', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'inprocessStruct') },
        { key: 'inprocessUnit', label: '', align: 'center', cellClassName: cellClass, render: (v: any, r: any) => renderClickableCell(v, r, 'inprocessUnit') },
    ];
};

const SortIcon = () => <ArrowUpDown className="inline-block ml-1 w-3 h-3 text-slate-400 opacity-60" />;
const ActiveSortIcon = () => <ArrowUp className="inline-block ml-1 w-3 h-3 text-slate-500" />;

const renderHeader = (title: string, showSort: boolean = false, activeSort: boolean = false, isWard: boolean = false, exportText: string = '', isSubHeader: boolean = false) => {
    const formattedTitle = (isSubHeader && title.includes(' ')) ? (
        <div className="flex flex-col items-center justify-center leading-snug">
            {title.split(' ').map((word, i) => <span key={i}>{word}</span>)}
        </div>
    ) : title;

    return (
        <div className={isWard ? `inline-flex items-center justify-center gap-0.5 ${isSubHeader ? 'font-semibold text-[13px] text-slate-700' : 'font-bold text-[14px] text-slate-700'} leading-tight whitespace-nowrap` : `flex items-center justify-center gap-1 ${isSubHeader ? 'font-semibold text-[14px] text-slate-700' : 'font-bold text-[15px] text-slate-700'} whitespace-nowrap`}>
            {formattedTitle}
            {exportText && (
                <span className="inline-flex items-center gap-1 px-2 py-1.5 ml-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-300 rounded shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    <Download className="w-3 h-3" /> {exportText}   
                </span>
            )}
            {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
        </div>
    );
};

const renderLeftHeader = (title: string, showSort: boolean = false, activeSort: boolean = false, isWard: boolean = false) => (
    <div className={isWard ? "inline-flex items-center justify-start gap-0.5 font-bold text-[13px] leading-tight text-slate-700 uppercase whitespace-nowrap" : "flex items-center justify-start gap-1 font-bold text-[14px] text-slate-700 uppercase whitespace-nowrap"}>
        {title} {showSort && (activeSort ? <ActiveSortIcon /> : <SortIcon />)}
    </div>
);

export const getDataEntryHeaderRows = (level: 'division' | 'ward', t: any): HeaderCell[][] => {
    const isWard = level === 'ward';

    return [
        [
            { label: <div className="font-bold text-[15px] text-slate-700 uppercase whitespace-nowrap">{t('dataEntryQualityCheck.columns.sr')}</div>, rowSpan: 2, align: 'center', headerClassName: 'bg-slate-50 min-w-[50px]' },
            { label: renderLeftHeader(level === 'division' ? t('dataEntryQualityCheck.columns.division') : t('dataEntryQualityCheck.columns.wardNo'), true, true, isWard), rowSpan: 2, align: isWard ? 'center' : 'left', headerClassName: 'bg-slate-50 min-w-[180px]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.internalSurvey'), false, false, isWard), colSpan: 2, align: 'center', headerClassName: 'bg-[#f0fdfa]' }, // teal-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.dataEntry'), false, false, isWard), colSpan: 4, align: 'center', headerClassName: 'bg-[#f0f9ff]' }, // sky-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.photo'), false, false, isWard, t('dataEntryQualityCheck.buttons.export') || 'Export'), colSpan: 2, align: 'center', headerClassName: 'bg-[#faf5ff]' }, // purple-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.plan'), false, false, isWard, t('dataEntryQualityCheck.buttons.export') || 'Export'), colSpan: 2, align: 'center', headerClassName: 'bg-[#eef2ff]' }, // indigo-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.qualityAnalyst'), false, false, isWard), colSpan: 5, align: 'center', headerClassName: 'bg-[#fefce8]' }, // yellow-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.propertyType'), false, false, isWard), colSpan: 5, align: 'center', headerClassName: 'bg-[#fdf2f8]' }, // pink-50

            { label: renderHeader(t('dataEntryQualityCheck.columns.assessedProperties'), false, false, isWard), colSpan: 2, align: 'center', headerClassName: 'bg-[#ecfdf5]' }, // emerald-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.unassessedProperties'), false, false, isWard), colSpan: 2, align: 'center', headerClassName: 'bg-[#fff7ed]' }, // orange-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.newlyAssessedFound'), false, false, isWard), colSpan: 2, align: 'center', headerClassName: 'bg-[#f0fdfa]' }, // teal-50
            { label: renderHeader(t('dataEntryQualityCheck.columns.assessmentInprocess'), false, false, isWard), colSpan: 2, align: 'center', headerClassName: 'bg-[#ecfeff]' }, // cyan-50
        ],
        [
            { label: renderHeader(t('dataEntryQualityCheck.columns.structure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0fdfa]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.unit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0fdfa]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.completedStructure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0f9ff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.completedUnit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0f9ff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pendingStructure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0f9ff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pendingUnit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0f9ff]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.complete'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#faf5ff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pending'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#faf5ff]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.complete'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#eef2ff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pending'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#eef2ff]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.completedStructure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fefce8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.completedUnit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fefce8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pendingStructure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fefce8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.pendingUnit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fefce8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.typeWise'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fefce8]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.residential'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fdf2f8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.nonResidential'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fdf2f8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.mixed'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fdf2f8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.publicUtility'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fdf2f8]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.underConstruction'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fdf2f8]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.structure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#ecfdf5]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.units'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#ecfdf5]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.structure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fff7ed]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.units'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#fff7ed]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.structure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0fdfa]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.unit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#f0fdfa]' },

            { label: renderHeader(t('dataEntryQualityCheck.columns.structure'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#ecfeff]' },
            { label: renderHeader(t('dataEntryQualityCheck.columns.unit'), false, false, isWard, '', true), align: 'center', headerClassName: 'bg-[#ecfeff]' },
        ]
    ];
};
