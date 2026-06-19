import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import type { Column } from '@/components/common';

export function useAppliedRulesColumns(locale: string) {
  const t = useTranslations('ptis');

  const columns: Column[] = [
    {
      key: 'applyOrder',
      label: t('appliedRules.columns.applyOrder'),
      align: 'center',
      width: '60px',
    },
    {
      key: 'ruleCategory',
      label: t('appliedRules.columns.ruleCategory'),
      align: 'center',
      width: '90px',
      render: (val: unknown) => (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-800 border border-slate-200 uppercase">
          {val as string}
        </span>
      ),
    },
    {
      key: 'ruleName',
      label: t('appliedRules.columns.ruleName'),
      align: 'left',
      cellClassName: 'font-medium text-slate-900',
    },
    {
      key: 'effectType',
      label: t('appliedRules.columns.effectType'),
      align: 'left',
      width: '120px',
      render: (val: unknown) => (
        <span className={cn(
          "px-2.5 py-0.5 text-xs font-semibold rounded border",
          String(val).toLowerCase().includes('decrease') 
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-green-50 text-green-700 border-green-100"
        )}>
          {val as string}
        </span>
      ),
    },
    {
      key: 'effectValue',
      label: t('appliedRules.columns.effectValue'),
      align: 'right',
      width: '90px',
      render: (val: unknown) => (
        <span className="font-semibold text-slate-800">
          {typeof val === 'number' ? val : '-'}
        </span>
      ),
    },
    {
      key: 'baseValue',
      label: t('appliedRules.columns.baseValue'),
      align: 'right',
      width: '100px',
      render: (val: unknown) => (
        <span className="font-semibold text-slate-700">
          {typeof val === 'number' ? val.toFixed(2) : '-'}
        </span>
      ),
    },
    {
      key: 'computedValue',
      label: t('appliedRules.columns.computedValue'),
      align: 'right',
      width: '110px',
      render: (val: unknown) => (
        <span className="font-bold text-indigo-600">
          {typeof val === 'number' ? val.toFixed(2) : '-'}
        </span>
      ),
    },
    {
      key: 'cumulativeValue',
      label: t('appliedRules.columns.cumulativeValue'),
      align: 'right',
      width: '110px',
      render: (val: unknown) => (
        <span className="font-bold text-emerald-600">
          {typeof val === 'number' ? val.toFixed(2) : '-'}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      label: t('appliedRules.columns.appliedAt'),
      align: 'left',
      width: '150px',
      render: (val: unknown) => (
        <span className="text-xs text-slate-500 font-mono">
          {val ? new Date(val as string).toLocaleString(locale === 'en' ? 'en-US' : locale === 'mr' ? 'mr-IN' : 'hi-IN') : '-'}
        </span>
      ),
    },
  ];

  return columns;
}
