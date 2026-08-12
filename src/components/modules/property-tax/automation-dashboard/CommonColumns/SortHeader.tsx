import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortDirection, SortConfig } from '@/lib/utils/automation-dashboard/sortUtils';

export type ViewType = 'zone' | 'ward';

export const SortIconComponent = ({ direction, viewType }: { direction: SortDirection, viewType: ViewType }) => {
    if (viewType === 'ward') {
        return <ArrowUpDown className="inline-block ml-1 w-4 h-4 text-slate-400 opacity-60" />;
    }
    if (direction === 'asc') {
        return <ArrowUp className="inline-block ml-1 w-4 h-4 text-slate-500" strokeWidth={2.5} />;
    }
    if (direction === 'desc') {
        return <ArrowDown className="inline-block ml-1 w-4 h-4 text-slate-500" strokeWidth={2.5} />;
    }
    return <ArrowUpDown className="inline-block ml-1 w-4 h-4 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-indigo-400 transition-all" />;
};

export const renderSortableHeader = <T,>(
    title: string,
    sortKey: keyof T | null,
    sortConfig?: SortConfig<T> | null,
    onSort?: (key: keyof T) => void,
    alignLeft: boolean = false,
    viewType: ViewType = 'zone'
) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig.direction : null;
    const isSortable = sortKey && viewType !== 'ward';

    return (
        <div 
            className={`flex items-center ${alignLeft ? 'justify-start' : 'justify-center'} gap-1 font-bold text-[14px] text-slate-700 ${isSortable ? 'cursor-pointer select-none group' : ''}`}
            onClick={() => isSortable && sortKey && onSort?.(sortKey)}
        >
            <span className={alignLeft ? 'text-[15px] uppercase' : ''}>{title}</span>
            {sortKey && (
                <SortIconComponent direction={direction} viewType={viewType} />
            )}
        </div>
    );
};
