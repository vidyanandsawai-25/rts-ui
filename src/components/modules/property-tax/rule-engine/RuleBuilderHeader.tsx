'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Displays the Rule Engine page header with icon, title, and placeholder rule counters. */
export default function RuleBuilderHeader() {
  const t = useTranslations('ruleEngine');

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t('header.title')}</h1>
            <p className="text-xs text-gray-500 font-medium">
              {t('header.subtitle')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

