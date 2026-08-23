import { ArrowUpDown } from 'lucide-react';
import { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import { StatusBadge } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';

type Translate = (key: string) => string;

export const getRtsDepartmentColumns = (
  t: Translate,
  tCommon: Translate,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
): Column<RtsDepartmentApiItem>[] => [
  {
    key: 'departmentName',
    label: (
      <button
        onClick={() => onSort?.('departmentName')}
        className="flex items-center gap-1 font-bold cursor-pointer"
      >
        <span>{t('deptName')}</span>
        <ArrowUpDown size={14} />
      </button>
    ),
    render: (_value, row) => (
      <span className="font-semibold text-slate-900">{row.departmentName}</span>
    ),
  },
  {
    key: 'departmentNameLocal',
    label: <span className="font-bold">{t('localName')}</span>,
    render: (_value, row) => (
      <span className="text-slate-600">{row.departmentNameLocal || '-'}</span>
    ),
  },
  {
    key: 'departmentIcon',
    label: <span className="font-bold">{t('icon')}</span>,
    render: (_value, row) => (
      <span className="font-mono text-xs text-slate-500">{row.departmentIcon || '-'}</span>
    ),
  },
  {
    key: 'displayOrder',
    label: (
      <button
        onClick={() => onSort?.('displayOrder')}
        className="flex items-center gap-1 font-bold cursor-pointer"
      >
        <span>{t('displayOrder')}</span>
        <ArrowUpDown size={14} />
      </button>
    ),
    render: (_value, row) => <span className="text-slate-600 font-mono">{row.displayOrder}</span>,
  },
  {
    key: 'isActive',
    label: <span className="font-bold">{tCommon('table.columns.status')}</span>,
    render: (_value, row) => (
      <StatusBadge
        value={row.isActive}
        activeLabel={tCommon('status.active')}
        inactiveLabel={tCommon('status.inactive')}
      />
    ),
  },
];
