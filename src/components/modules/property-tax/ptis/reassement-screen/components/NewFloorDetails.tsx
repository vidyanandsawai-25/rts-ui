'use client';

import { EyeIconButton, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import type { MappedFloorDetail } from '@/types/reassessment.types';

interface NewFloorDetailsProps {
    data: MappedFloorDetail[];
    isAutoScrolling: boolean;
    onToggleAutoScroll: () => void;
}

// Column definitions for New Floor Details
const newColumns: Column<MappedFloorDetail>[] = [
    {
        key: 'floor',
        label: 'Floor',
        width: '64px',
        align: 'center',
        cellClassName: 'font-bold'
    },
    {
        key: 'conYear',
        label: 'Con Year',
        width: '96px',
        align: 'center'
    },
    {
        key: 'asstYear',
        label: 'Asst Year',
        width: '96px',
        align: 'center'
    },
    {
        key: 'constType',
        label: 'Const Type',
        width: '96px',
        align: 'center',
        cellClassName: 'font-bold text-sky-800'
    },
    {
        key: 'use',
        label: 'Use',
        width: '128px',
        align: 'left',
        cellClassName: 'text-emerald-700'
    },
    {
        key: 'carpetAreaSqFt',
        label: 'Carpet A',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono',
        render: (_, row: any) => `${row.carpetAreaSqFt} / ${row.carpetAreaSqM}`
    },
    {
        key: 'builtUpAreaSqFt',
        label: 'Built-up A',
        width: '128px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono',
        render: (_, row: any) => `${row.builtUpAreaSqFt} / ${row.builtUpAreaSqM}`
    },
    {
        key: 'rate',
        label: 'Rate',
        width: '96px',
        align: 'right',
        cellClassName: 'text-emerald-700 font-mono'
    },
    {
        key: 'taxLiability',
        label: 'Tax Liability',
        width: '128px',
        align: 'center',
        cellClassName: 'font-mono',
        render: (val: any) => val || '-'
    },
    {
        key: 'rentMy',
        label: 'Rent M/Y',
        width: '112px',
        align: 'right',
        cellClassName: 'font-mono'
    },
    {
        key: 'rentalValue',
        label: 'Rental Value',
        width: '128px',
        align: 'right',
        cellClassName: 'font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    },
    {
        key: 'depreciation',
        label: 'Depreciation',
        width: '112px',
        align: 'right',
        cellClassName: 'font-mono'
    },
    {
        key: 'alv',
        label: 'ALV',
        width: '128px',
        align: 'right',
        cellClassName: 'font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    },
    {
        key: 'mr',
        label: 'M&R',
        width: '96px',
        align: 'right',
        cellClassName: 'font-mono'
    },
    {
        key: 'rv',
        label: 'RV',
        width: '128px',
        align: 'right',
        cellClassName: 'font-bold font-mono',
        render: (val: any) => val.toLocaleString()
    },
    {
        key: 'status',
        label: 'Status',
        width: '96px',
        align: 'center',
        render: (val: any) => (
            <span className={cn(
                "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
                val === 'Same' && "bg-emerald-100 text-emerald-800 border-emerald-200",
                val === 'Changed' && "bg-amber-100 text-amber-800 border-amber-200",
                val === 'New' && "bg-rose-100 text-rose-800 border-rose-200"
            )}>
                {val}
            </span>
        )
    }
];

export function NewFloorDetails({ 
    data, 
    isAutoScrolling, 
    onToggleAutoScroll 
}: NewFloorDetailsProps) {
    return (
        <div className="flex-grow flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-blue-950">New Floor Details</h4>
                <EyeIconButton
                    onClick={onToggleAutoScroll}
                    isAutoScrolling={isAutoScrolling}
                    startTitle="Start Auto Scroll"
                    stopTitle="Stop Auto Scroll"
                />
            </div>

            <div id="new-table-container" className="min-w-0">
                <MasterTable
                    columns={newColumns}
                    data={data}
                    paginationConfig={{ enabled: false }}
                    tableClassName="w-max min-w-full text-xs font-medium border-collapse"
                    theadClassName="bg-[#d9e3ec] text-black font-bold border-b border-gray-300 [&_th]:whitespace-nowrap [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-r [&_th]:border-gray-300/60 text-center font-sans"
                    rowClassName={(row) => cn(
                        "transition-colors [&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200/60",
                        row.status === 'Same' && "bg-emerald-50/40 hover:bg-emerald-50/70 text-emerald-950",
                        row.status === 'Changed' && "bg-amber-50/40 hover:bg-amber-50/70 text-amber-950",
                        row.status === 'New' && "bg-rose-50/40 hover:bg-rose-50/70 text-rose-950"
                    )}
                    height="xs"
                />
            </div>
        </div>
    );
}