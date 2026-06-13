import { ToggleSwitch } from '@/components/common';
import type { Column } from '@/components/common';
import { TaxApplicabilityItem } from '@/types/applicable-taxes.types';

export const getColumns = (
  t: (key: string) => string,
  handleToggleStatus: (id: number, newVal: boolean, taxHead: string) => void
): Column<TaxApplicabilityItem>[] => [
    {
      key: 'taxHead' as keyof TaxApplicabilityItem,
      label: t('taxHead'),//25%
      width: '25%',
      cellClassName: 'border-y border-[#DCEAFF] border-l rounded-l-xl py-2 px-3 bg-white font-extrabold text-slate-800 shadow-sm leading-tight text-xs',
    },
    {
      key: 'calculationType' as keyof TaxApplicabilityItem,
      label: t('calculation'),//28
      width: '28%',
      cellClassName: 'border-y whitespace-nowrap border-[#DCEAFF] py-2 px-3 bg-white text-slate-400 font-bold shadow-sm text-xs',
      render: (val: unknown) => String(val || '—'),
    },
    {
      key: 'taxPercentage' as keyof TaxApplicabilityItem,
      label: t('rate'),//
      width: '15%',
      align: 'center' as const,
      cellClassName: 'border-y border-[#DCEAFF] py-2 px-3 bg-white font-extrabold text-[#0B3C8E] shadow-sm text-xs',
      render: (val: unknown) => `${Number(typeof val === 'number' ? val : 0).toFixed(2)}%`,
    },
    {
      key: 'isActive' as keyof TaxApplicabilityItem,
      label: t('headStatus'), //35%
      width: '28%',
      align: 'center' as const,
      cellClassName: 'border-y border-[#DCEAFF] border-r rounded-r-xl py-2 px-2 bg-white shadow-sm text-xs',
      render: (_val: unknown, row: TaxApplicabilityItem) => (
        <div className="flex items-center gap-1.5 justify-center whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
            {row.isActive ? t('active') : t('inactive')}
          </span>
          <ToggleSwitch
            checked={row.isActive}
            onChange={(newVal) => handleToggleStatus(row.taxId, newVal, row.taxHead)}
            showPopup={false}
            id={`toggle-${row.taxId}`}
          />
        </div>
      ),
    },
  ];