'use client';

import { EyeIconButton, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';

interface FloorDetail extends Record<string, unknown> {
    floor: string;
    conYear: string;
    asstYear: string;
    constType: string;
    use: string;
    carpetAreaSqFt: number;
    carpetAreaSqM: number;
    builtUpAreaSqFt: number;
    builtUpAreaSqM: number;
    rate: number;
    renter: string;
    taxLiability: string;
    rentMy: number;
    rentalValue: number;
    depreciation: number;
    alv: number;
    mr: number;
    rv: number;
    status?: 'Same' | 'Changed' | 'New';
    bgClass?: string;
}

interface OldFloorDetailsProps {
    data: FloorDetail[];
    isAutoScrolling: boolean;
    onToggleAutoScroll: () => void;
}

// Column definitions for Old Floor Details
const oldColumns: Column<FloorDetail>[] = [
    {
        key: 'floor',
        label: 'Floor ↑↓',
        width: '64px',
        align: 'center',
        cellClassName: 'font-bold'
    },
    {
        key: 'conYear',
        label: 'Con Year ↑↓',
        width: '96px',
        align: 'center'
    },
    {
        key: 'asstYear',
        label: 'Asst Year ↑↓',
        width: '96px',
        align: 'center'
    },
    {
        key: 'constType',
        label: 'Const Type ↑↓',
        width: '96px',
        align: 'center',
        cellClassName: 'font-bold text-sky-800'
    },
    {
        key: 'use',
        label: 'Use ↑↓',
        width: '128px',
        align: 'left',
        cellClassName: 'text-emerald-700'
    },
    {
        key: 'carpetAreaSqFt',
        label: 'Carpet A ↑↓',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono',
        render: (_, row: any) => `${row.carpetAreaSqFt} / ${row.carpetAreaSqM}`
    },
    {
        key: 'builtUpAreaSqFt',
        label: 'Built-up A ↑↓',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono',
        render: (_, row: any) => `${row.builtUpAreaSqFt} / ${row.builtUpAreaSqM}`
    },
    {
        key: 'rate',
        label: 'Rate ↑↓',
        width: '96px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono'
    },
    {
        key: 'renter',
        label: 'Renter ↑↓',
        width: '144px',
        align: 'left',
        cellClassName: 'text-emerald-700'
    },
    {
        key: 'taxLiability',
        label: 'Tax Liability ↑↓',
        width: '128px',
        align: 'center',
        cellClassName: 'font-mono',
        render: (val: any) => val || '-'
    },
    {
        key: 'rentMy',
        label: 'Rent M/Y ↑↓',
        width: '112px',
        align: 'right',
        cellClassName: 'font-mono'
    },
    {
        key: 'rentalValue',
        label: 'Rental Value ↑↓',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    },
    {
        key: 'depreciation',
        label: 'Depreciation ↑↓',
        width: '112px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono'
    },
    {
        key: 'alv',
        label: 'ALV ↑↓',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    },
    {
        key: 'mr',
        label: 'M&R ↑↓',
        width: '96px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono'
    },
    {
        key: 'rv',
        label: 'RV ↑↓',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    }
];

export function OldFloorDetails({ 
    data, 
    isAutoScrolling, 
    onToggleAutoScroll 
}: OldFloorDetailsProps) {
    return (
        <div className="flex-grow flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-sky-950">Old Floor Details</h4>
                <EyeIconButton
                    onClick={onToggleAutoScroll}
                    isAutoScrolling={isAutoScrolling}
                    startTitle="Start Auto Scroll"
                    stopTitle="Stop Auto Scroll"
                />
            </div>

            <div id="old-table-container" className="min-w-0">
                <MasterTable
                    columns={oldColumns}
                    data={data}
                    paginationConfig={{ enabled: false }}
                    tableClassName="w-max min-w-full text-xs font-medium border-collapse"
                    theadClassName="bg-[#d9e3ec] text-black font-bold border-b border-gray-300 [&_th]:whitespace-nowrap [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-r [&_th]:border-gray-300/60 text-center font-sans"
                    rowClassName={() => "[&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200"}
                    height="xs"
                />
            </div>
        </div>
    );
}