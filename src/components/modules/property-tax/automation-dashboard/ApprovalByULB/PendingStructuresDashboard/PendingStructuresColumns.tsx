
import Link from 'next/link';
import { Column } from '@/components/common/AutomationTable';
import { X, Check } from 'lucide-react';
import { BuildingWiseItem, AuthoritySignature } from '@/types/automation-dashboard/approval-by-ulb/approval-by-ulb.type';

export type ExtendedBuildingWiseItem = BuildingWiseItem & {
    isTotal?: boolean;
    demand?: string | number;
    [key: string]: unknown;
};

export const getPendingStructuresColumns = (uniqueAuthorities: AuthoritySignature[] = [], t: (key: string) => string, locale: string = 'en'): Column<ExtendedBuildingWiseItem>[] => {
    const baseColumns: Column<ExtendedBuildingWiseItem>[] = [
        {
            key: 'sr',
            label: t('columns.sr'),
            align: 'center',
            cellClassName: 'font-semibold text-slate-700',
            colSpan: (row) => row.isTotal ? 3 : 1,
            render: (_val, row, index) => row.isTotal ? <span className="font-bold text-center block w-full text-slate-800">{t('total')}</span> : (index + 1)
        },
        {
            key: 'buildingNo',
            label: t('columns.buildingNo'),
            align: 'left',
            colSpan: (row) => row.isTotal ? 0 : 1,
            render: (_val, row) => {
                if (row.isTotal) return null;
                return (
                    <Link 
                        href={`/${locale}/property-tax/automation-dashboard/approval-by-ulb/building-wise-property/${row.buildingNo}`} 
                        className="text-gray-700 font-semibold hover:underline hover:text-indigo-800 transition-colors"
                    >
                        {row.buildingNo}
                    </Link>
                );
            }
        },
        {
            key: 'noticeNo',
            label: t('columns.noticeNo'),
            align: 'left',
            colSpan: (row) => row.isTotal ? 0 : 1
        },
        {
            key: 'units',
            label: t('columns.units'),
            align: 'center',
            cellClassName: 'font-semibold text-slate-700'
        },
        {
            key: 'demand',
            label: t('columns.demandCr'),
            align: 'center',
            cellClassName: 'font-semibold text-slate-700',
            render: (_val, row) => {
                if (row.isTotal) return row.demand;
                const demand = row.totalDemand || 0;
                if (demand >= 10000000) {
                    return `₹${(demand / 10000000).toFixed(2)}Cr`;
                } else if (demand >= 100000) {
                    return `₹${(demand / 100000).toFixed(2)}L`;
                }
                return `₹${demand}`;
            }
        }
    ];

    uniqueAuthorities.forEach(auth => {
        baseColumns.push({
            key: `auth_${auth.signAuthorityId}`,
            label: auth.authorityName,
            align: 'center',
            render: (_val, row) => {
                const sig = row.authoritySignatures?.find((s: AuthoritySignature) => s.signAuthorityId === auth.signAuthorityId);
                if (row.isTotal) {
                     return <span className="font-bold text-slate-800">{(row[`total_auth_${auth.signAuthorityId}`] as React.ReactNode) ?? sig?.isSigned ?? 0}</span>;
                    }
                if (sig) {
                    if (sig.isSigned === 1) {
                        return <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />;
                    } else if (sig.isSigned === 0) {
                        return <X className="w-4 h-4 text-red-500 mx-auto" strokeWidth={3} />;
                    }
                }
                return null;
            }
        });
    });

    return baseColumns;
};
