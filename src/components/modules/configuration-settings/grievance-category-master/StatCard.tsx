import type { ReactElement } from 'react';
import { Card, CardContent } from '@/components/common';
import type { StatCardProps } from '@/types/grievance-category-master/grievanceCategory.types';

/**
 * Simple, clean StatCard Component as per the user's preferred design.
 */
export function StatCard({ label, value, icon: Icon, color }: StatCardProps): ReactElement {
  const colorSchemes = {
    rose: {
      text: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-900/30',
      iconBorder: 'border-rose-100 dark:border-rose-800',
    },
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconBorder: 'border-blue-100 dark:border-blue-800',
    },
    indigo: {
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconBorder: 'border-indigo-100 dark:border-indigo-800',
    },
    amber: {
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconBorder: 'border-amber-100 dark:border-amber-800',
    },
  };

  const scheme = (color && colorSchemes[color as keyof typeof colorSchemes]) || colorSchemes.blue;

  return (
    <Card
      className="h-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl bg-white dark:bg-slate-900"
      padding="none"
    >
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {label}
            </span>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {value}
            </span>
          </div>

          <div
            className={`w-14 h-14 flex items-center justify-center rounded-2xl border ${scheme.iconBg} ${scheme.iconBorder} ${scheme.text} shadow-sm`}
          >
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
