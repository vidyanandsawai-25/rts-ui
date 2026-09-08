import { ToggleSwitch } from '@/components/common';
import type { Column } from '@/components/common';
import { TaxCalculationItem } from '@/types/applicable-taxes.types';
import { Droplet, Flame, TreePine, Banknote, Building2, Map, BookOpen, Briefcase } from 'lucide-react';

const getTaxIcon = (name: string) => {
  const lName = name.toLowerCase();
  if (lName.includes('fire')) return <Flame size={16} className="text-orange-500" />;
  if (lName.includes('tree')) return <TreePine size={16} className="text-green-500" />;
  if (lName.includes('water') || lName.includes('sewage')) return <Droplet size={16} className="text-blue-500" />;
  if (lName.includes('education')) return <BookOpen size={16} className="text-indigo-500" />;
  if (lName.includes('employment')) return <Briefcase size={16} className="text-stone-500" />;
  if (lName.includes('building')) return <Building2 size={16} className="text-red-500" />;
  if (lName.includes('road')) return <Map size={16} className="text-emerald-500" />;
  if (lName.includes('general')) return <span className="font-bold text-blue-600 text-[10px]">GT</span>;
  return <Banknote size={16} className="text-slate-500" />;
};

export const getColumns = (
  t: (key: string) => string,
  handleToggleStatus: (id: number, newVal: boolean, taxHead: string) => void
): Column<TaxCalculationItem>[] => [
    {
      key: 'taxName' as keyof TaxCalculationItem,
      label: t('taxHead')?.toUpperCase() || 'TAX HEAD',
      width: '25%',
      cellClassName: 'py-3 px-4',
      render: (_val: unknown, row: TaxCalculationItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
            {getTaxIcon(row.taxName)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm">{row.taxName}</span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">{row.descriptions || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'types' as keyof TaxCalculationItem,
      label: t('applicableTo') || 'APPLICABLE TO',
      width: '15%',
      cellClassName: 'py-3 px-4 text-xs text-slate-500 font-medium text-center',
      render: (val: unknown) => {
        const types = val as string;
        if (!types) return '—';
        if (types.includes('R') && types.includes('C')) return t('residentialAndShop') || 'Residential + Shop';
        if (types.includes('R')) return t('residential') || 'Residential';
        if (types.includes('C')) return t('commercialOnly') || 'Commercial only';
        return t('wholeProperty') || 'Whole Property';
      },
    },
    {
      key: 'baseTypes' as keyof TaxCalculationItem,
      label: t('method') || 'METHOD',
      width: '10%',
      cellClassName: 'py-3 px-4 text-xs text-slate-500 font-medium text-center',
      render: (val: unknown, row: TaxCalculationItem) => (val as string) || row.resultModes || '—'
    },
    {
      key: 'averageTaxPercentage' as keyof TaxCalculationItem,
      label: t('ruleRate') || 'RULE / RATE',
      width: '15%',
      cellClassName: 'py-3 px-4 text-xs text-slate-500 font-medium text-center',
      render: (val: unknown, row: TaxCalculationItem) => {
        if (val === null || val === undefined) {
          if (row.resultBases && row.resultValues) {
            return `${row.resultBases} / ${row.resultValues}`;
          }
          return row.resultBases || row.resultValues || '—';
        }
        return `${val}%`;
      }
    },
    {
      key: 'calculationMode' as keyof TaxCalculationItem,
      label: t('calculation') || 'CALCULATION',
      width: '15%',
      cellClassName: 'py-3 px-4 text-xs text-slate-500 font-medium',
      render: (val: unknown) => (val as string) || '—'
    },
    {
      key: 'isActive' as keyof TaxCalculationItem,
      label: t('statusOnOff') || 'STATUS ON / OFF',
      width: '10%',
      align: 'center' as const,
      cellClassName: 'py-3 px-4 text-center',
      render: (_val: unknown, row: TaxCalculationItem) => {
        const isEffectiveActive = Boolean(row.isApplicable && row.isActive);
        return (
          <div className="flex items-center gap-2 justify-center">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isEffectiveActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
                }`}
            >
              {isEffectiveActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
            </span>
            <ToggleSwitch
              checked={isEffectiveActive}
              onChange={(newVal) => handleToggleStatus(row.taxId, newVal, row.taxName)}
              showPopup={false}
              id={`toggle-${row.taxId}`}
            />
          </div>
        );
      },
    },
    {
      key: 'taxAmount' as keyof TaxCalculationItem,
      label: t('amount') || 'AMOUNT',
      width: '10%',
      align: 'right' as const,
      cellClassName: 'py-3 px-4 font-bold text-slate-800 text-sm whitespace-nowrap',
      render: (val: unknown) => `${t('currencySymbol')} ${(val as number)?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`
    }
  ];