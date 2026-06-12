'use client';

import { useTranslations } from 'next-intl';
import { Calendar, CalendarX, FileMinus, FilePlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi, OperationType } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

interface OpConfig {
  key: OperationType;
  icon: React.ReactNode;
  border: string;
  bg: string;
  activeBg: string;
  badge: string;
  activeBadge: string;
  permKey: keyof AddTaxesConsoleApi['permissions'];
}

const OP_CONFIGS: OpConfig[] = [
  {
    key: 'AddTax',
    icon: <FilePlus className="h-5 w-5" />,
    border: 'border-l-green-500',
    bg: 'hover:bg-green-50',
    activeBg: 'bg-green-50 ring-1 ring-green-400',
    badge: 'bg-green-100 text-green-700',
    activeBadge: 'bg-green-600 text-white',
    permKey: 'addTax',
  },
  {
    key: 'QuarterlyAdd',
    icon: <Calendar className="h-5 w-5" />,
    border: 'border-l-orange-400',
    bg: 'hover:bg-orange-50',
    activeBg: 'bg-orange-50 ring-1 ring-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    activeBadge: 'bg-orange-500 text-white',
    permKey: 'quarterlyAdd',
  },
  {
    key: 'RemoveTax',
    icon: <FileMinus className="h-5 w-5" />,
    border: 'border-l-red-500',
    bg: 'hover:bg-red-50',
    activeBg: 'bg-red-50 ring-1 ring-red-400',
    badge: 'bg-red-100 text-red-700',
    activeBadge: 'bg-red-600 text-white',
    permKey: 'removeTax',
  },
  {
    key: 'QuarterlyRemove',
    icon: <CalendarX className="h-5 w-5" />,
    border: 'border-l-purple-500',
    bg: 'hover:bg-purple-50',
    activeBg: 'bg-purple-50 ring-1 ring-purple-400',
    badge: 'bg-purple-100 text-purple-700',
    activeBadge: 'bg-purple-600 text-white',
    permKey: 'quarterlyRemove',
  },
];

const OP_LABEL_KEYS: Record<OperationType, string> = {
  AddTax: 'addTax',
  QuarterlyAdd: 'quarterlyAdd',
  RemoveTax: 'removeTax',
  QuarterlyRemove: 'quarterlyRemove',
};

export function OperationPanel({ api }: Props) {
  const t = useTranslations('addTaxes');

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900">{t('operations.sectionTitle')}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{t('operations.sectionDesc')}</p>
      </div>

      <div className="flex flex-col gap-2">
        {OP_CONFIGS.map((cfg) => {
          const allowed = api.permissions[cfg.permKey];
          const isActive = api.operation === cfg.key;
          const labelKey = OP_LABEL_KEYS[cfg.key];

          return (
            <button
              key={cfg.key}
              type="button"
              disabled={!allowed}
              onClick={() => allowed && api.setOperation(cfg.key)}
              className={cn(
                'flex items-center gap-3 rounded-md border border-l-4 p-3 text-left transition-all',
                cfg.border,
                isActive ? cfg.activeBg : cfg.bg,
                allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="shrink-0 text-gray-500">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t(`operations.labels.${labelKey}`)}</p>
                <p className="text-xs text-gray-500">{t(`operations.descriptions.${labelKey}`)}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                  isActive ? cfg.activeBadge : cfg.badge,
                )}
              >
                {allowed ? t('operations.badges.allowed') : t('operations.badges.restricted')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2.5 text-xs text-blue-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{t('operations.hint')}</span>
      </div>
    </div>
  );
}
