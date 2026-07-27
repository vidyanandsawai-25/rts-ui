import { ArrowUpDown } from 'lucide-react';
import { RtsServiceApiItem } from '@/types/rts/service.types';
import { StatusBadge } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';

type Translate = (key: string) => string;

export const getRtsServiceColumns = (
  t: Translate,
  tCommon: Translate,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
): Column<RtsServiceApiItem>[] => [
  {
    key: 'serviceName',
    label: (
      <button
        onClick={() => onSort?.('serviceName')}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t('serviceName')}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (_value, row) => (
      <div className="space-y-0.5">
        <div className="font-semibold text-slate-950">{row.serviceName}</div>
        <div className="text-[10px] text-slate-400 font-medium">/{row.serviceUrl || '-'}</div>
      </div>
    ),
  },
  {
    key: 'serviceNameLocal',
    label: <span className="font-bold text-slate-800">{t('localName')}</span>,
    render: (_value, row) => <span className="text-slate-700">{row.serviceNameLocal || '-'}</span>,
  },
  {
    key: 'sla',
    label: (
      <button
        onClick={() => onSort?.('sla')}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t('slaDays')}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (_value, row) => (
      <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
        {row.sla ?? '-'} {t('days')}
      </span>
    ),
  },
  {
    key: 'fees',
    label: <span className="font-bold text-slate-800">{t('fees')}</span>,
    render: (_value, row) => (
      <span className="text-slate-700 font-mono text-xs">
        {row.isFeesRequired ? `₹${row.fees ?? 0}` : t('free')}
      </span>
    ),
  },
  {
    key: 'displayOrder',
    label: <span className="font-bold text-slate-800">{t('displayOrder')}</span>,
    render: (_value, row) => (
      <span className="text-slate-500 font-mono text-xs">{row.displayOrder}</span>
    ),
  },
  {
    key: 'isActive',
    label: <span className="font-bold text-slate-800">{tCommon('table.columns.status')}</span>,
    render: (_value, row) => (
      <StatusBadge
        value={row.isActive}
        activeLabel={tCommon('status.active')}
        inactiveLabel={tCommon('status.inactive')}
      />
    ),
  },
];
