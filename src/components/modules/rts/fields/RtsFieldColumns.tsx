import { ArrowUpDown } from 'lucide-react';
import { RtsFieldDefinitionApiItem } from '@/types/rts/field-definition.types';
import { StatusBadge } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';

type Translate = (key: string) => string;

export const getRtsFieldColumns = (
  t: Translate,
  tCommon: Translate,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
): Column<RtsFieldDefinitionApiItem>[] => [
  {
    key: 'fieldLabel',
    label: (
      <button
        onClick={() => onSort?.('fieldLabel')}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t('fieldLabel')}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (_value, row) => (
      <div className="space-y-0.5">
        <div className="font-semibold text-slate-950">{row.fieldLabel}</div>
        <div className="text-[10px] text-slate-400 font-mono font-bold">{row.fieldCode}</div>
      </div>
    ),
  },
  {
    key: 'fieldLabelLocal',
    label: <span className="font-bold text-slate-800">{t('fieldLabelLocal')}</span>,
    render: (_value, row) => <span className="text-slate-700">{row.fieldLabelLocal || '-'}</span>,
  },
  {
    key: 'fieldType',
    label: <span className="font-bold text-slate-800">{t('fieldType')}</span>,
    render: (_value, row) => (
      <span className="text-slate-500 font-mono text-xs capitalize bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
        {row.fieldType}
      </span>
    ),
  },
  {
    key: 'fieldGroup',
    label: <span className="font-bold text-slate-800">{t('fieldGroup')}</span>,
    render: (_value, row) => (
      <span className="text-slate-600 text-xs font-semibold">{row.fieldGroup || t('general')}</span>
    ),
  },
  {
    key: 'isRequired',
    label: <span className="font-bold text-slate-800">{t('isRequired')}</span>,
    render: (_value, row) => (
      <span
        className={`text-xs font-bold ${
          row.isRequired
            ? 'text-red-600 bg-red-50 border-red-100'
            : 'text-slate-500 bg-slate-50 border-slate-200'
        } px-2 py-0.5 rounded border`}
      >
        {row.isRequired ? t('required') : t('optional')}
      </span>
    ),
  },
  {
    key: 'displayOrder',
    label: <span className="font-bold text-slate-800">{t('displayOrder')}</span>,
    render: (_value, row) => (
      <span className="text-slate-600 font-mono text-xs">{row.displayOrder}</span>
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
