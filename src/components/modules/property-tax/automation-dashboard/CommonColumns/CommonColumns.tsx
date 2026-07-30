 

import { MapPin } from 'lucide-react';
import { Column } from '@/components/common/AutomationTable';
import { ReactNode } from 'react';
import Link from 'next/link';

export const getCommonSrColumn = <T extends { sr: string | number, isTotal?: boolean }>(): Column<T> => ({
    key: 'sr' as keyof T,
    label: '',
    align: 'center',
    cellClassName: 'p-3 text-slate-900 font-bold border-l-2 border-l-transparent border-r border-slate-300',
    render: (val, row) => row.isTotal ? null : (val as ReactNode)
});

export const getCommonDivisionColumn = <T extends { sr: string | number, division: string, isTotal?: boolean }>(
    onDivisionClick?: (divisionCode: string) => void,
    divisionLinkHref?: (divisionCode: string) => string
): Column<T> => ({
    key: 'division' as keyof T,
    label: '',
    align: 'left',
    cellClassName: '!p-0 border-r border-slate-300 border-l-2 border-l-transparent group-hover:border-l-indigo-500',
    render: (val, row) => {
        if (row.isTotal) {
            return <div className="text-black font-bold text-center w-full block p-3">{row.sr}</div>;
        }
        if (val !== '') {
            const code = typeof val === 'string' ? val.split(' - ')[0] : '';
            const content = (
                <>
                    <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-950 font-bold text-[13px] whitespace-nowrap">{val as ReactNode}</span>
                </>
            );

            if (divisionLinkHref && code) {
                return (
                    <Link
                        href={divisionLinkHref(code)}
                        className="flex items-center gap-2 w-full h-full p-3 cursor-pointer hover:bg-indigo-50/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {content}
                    </Link>
                );
            }

            return (
                <div
                    className="flex items-center gap-2 w-full h-full p-3 cursor-pointer hover:bg-indigo-50/50 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onDivisionClick && code) {
                            onDivisionClick(code);
                        }
                    }}
                >
                    {content}
                </div>
            );
        }
        return null;
    }
});

export const getCommonWardColumn = <T extends { sr: string | number, wardNo: string, isTotal?: boolean }>(): Column<T> => ({
    key: 'wardNo' as keyof T,
    label: '',
    align: 'left',
    cellClassName: 'p-3 border-r flex justify-center items-center border-slate-300 cursor-pointer hover:bg-indigo-50/50 transition-colors border-l-2 border-l-transparent group-hover:border-l-indigo-500',
    render: (val, row) => {
        if (row.isTotal) {
            return <div className="text-black font-bold text-center w-full block">{row.sr}</div>;
        }
        if (val !== '') {
            return (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-slate-950 font-bold text-[14px] whitespace-nowrap">{val as ReactNode}</span>
                </div>
            );
        }
        return null;
    }
});
