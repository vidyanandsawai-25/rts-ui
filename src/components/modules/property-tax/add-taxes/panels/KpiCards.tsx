'use client';

import { useTranslations } from 'next-intl';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

export function KpiCards({ api }: Props) {
  const t = useTranslations('addTaxes');
  const { summary } = api;

  const cards = [
    { key: 'totalProperties', value: summary.totalProperties, color: 'text-gray-900' },
    { key: 'eligibleRecords', value: summary.eligibleRecords, color: 'text-blue-700' },
    { key: 'skippedRecords', value: summary.skippedRecords, color: 'text-amber-700' },
    { key: 'runningJobs', value: summary.runningJobs, color: 'text-green-700' },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ key, value, color }) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">{t(`kpi.${key}`)}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
