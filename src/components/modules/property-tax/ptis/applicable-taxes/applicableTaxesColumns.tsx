import { ToggleSwitch } from '@/components/common';
import type { Column } from '@/components/common';
import { TaxApplicabilityItem } from '@/types/applicable-taxes.types';

export const getColumns = (
  t: (key: string) => string,
  handleToggleStatus: (id: number, newVal: boolean, taxHead: string) => void
): Column<TaxApplicabilityItem>[] => [
  {
    key: 'taxHead' as keyof TaxApplicabilityItem,
    label: t('taxHead'),
    width: '40%',
    cellClassName: 'border-y border-[#DCEAFF] border-l rounded-l-xl py-2 px-3 bg-white font-extrabold text-slate-800 shadow-sm leading-tight text-xs',
  },
  {
    key: 'taxPercentage' as keyof TaxApplicabilityItem,
    label: t('rate'),
    width: '25%',
    align: 'center' as const,
    cellClassName: 'border-y border-[#DCEAFF] py-2 px-3 bg-white font-extrabold text-[#0B3C8E] shadow-sm text-xs',
    render: (val: unknown) => `${Number(typeof val === 'number' ? val : 0).toFixed(2)}%`,
  },
  {
    key: 'isApplicable' as keyof TaxApplicabilityItem,
    label: t('headStatus'),
    width: '35%',
    align: 'center' as const,
    cellClassName: 'border-y border-[#DCEAFF] border-r rounded-r-xl py-2 px-2 bg-white shadow-sm text-xs',
    render: (_val: unknown, row: TaxApplicabilityItem) => {
      const isEffectiveActive = Boolean(row.isApplicable && row.isActive);
      return (
        <div className="flex items-center gap-1.5 justify-center whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isEffectiveActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isEffectiveActive ? t('active') : t('inactive')}
          </span>
          <ToggleSwitch
            checked={isEffectiveActive}
            onChange={(newVal) => handleToggleStatus(row.taxId, newVal, row.taxHead)}
            showPopup={false}
            id={`toggle-${row.taxId}`}
          />
        </div>
      );
    },
  },
];