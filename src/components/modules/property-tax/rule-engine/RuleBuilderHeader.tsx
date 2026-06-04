'use client';

import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';

interface RuleBuilderHeaderProps {
  locale: string;
}

/** Displays the Rule Engine page header with icon, title, and back button. */
export default function RuleBuilderHeader({ locale }: RuleBuilderHeaderProps) {
  const t = useTranslations('ruleEngine');
  const router = useRouter();

  return (
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

      <Button
        type="button"
        variant="secondary"
        onClick={() => router.push(`/${locale}/property-tax/rule-engine`)}
        className="h-10 px-4 font-medium flex items-center gap-2 text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('header.backToList')}
      </Button>
    </div>
  );
}

