'use client';

import { Card } from '@/components/common/Card';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { CheckCircle2, Settings } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, ConfigCategory } from '@/types/configMaster.types';

interface CategoryCardProps {
  category: ConfigCategory;
  isActive: boolean;
  search?: string;
}

export function CategoryCard({ category, isActive, search }: CategoryCardProps) {
  const t = useTranslations('configMaster');
  const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.rose;
  const Icon = CATEGORY_ICONS[category.icon] || Settings;
  
  const params = new URLSearchParams();
  params.set('categoryId', category.id);
  if (search) params.set('search', search);
  const progress = category.total > 0 ? (category.count / category.total) * 100 : 0;

  return (
    <NextLink
      href={`?${params.toString()}`}
      scroll={false}
      className="w-full block"
    >
      <Card
        className={cn(
          'cursor-pointer h-full border transition-all duration-300 relative overflow-hidden p-2.5 sm:p-3',
          'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]',
          isActive
            ? `bg-white dark:bg-slate-800 shadow-sm border-indigo-200 dark:border-indigo-900/50`
            : 'bg-white/80 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
        )}
      >
        {/* Check Icon (Active Only) - Matching the purple checkmark in screenshot */}
        {isActive && (
          <div className="absolute top-2 right-2 text-indigo-500 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-3.5 h-3.5 fill-indigo-50 dark:fill-indigo-900/20" />
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Colored Icon Box */}
          <div className={cn(
            'shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
            colors.badge
          )}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className={cn(
              "text-xs sm:text-sm font-semibold leading-tight mb-1 line-clamp-2",
              isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
            )}>
              {category.name}
            </h3>
            
            {/* Progress Bar with Gradient and Glow */}
            <div className="mt-4 sm:mt-5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">{t('card.active')}</span>
                <span className={cn("transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div 
                className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${category.name} ${t('card.active')}`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)] relative",
                    category.color === 'rose' && "bg-linear-to-r from-rose-400 to-rose-600",
                    category.color === 'emerald' && "bg-linear-to-r from-emerald-400 to-emerald-600",
                    category.color === 'blue' && "bg-linear-to-r from-blue-400 to-blue-600",
                    category.color === 'violet' && "bg-linear-to-r from-violet-400 to-violet-600",
                    category.color === 'purple' && "bg-linear-to-r from-purple-400 to-purple-600",
                    category.color === 'cyan' && "bg-linear-to-r from-cyan-400 to-cyan-600"
                  )}
                  style={{ width: `${progress}%` }}
                >
                  {/* Subtle sheen effect */}
                  <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </NextLink>
  );
}
