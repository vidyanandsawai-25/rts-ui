import { Shield, Search } from 'lucide-react';
import { CategoryEditDeleteActions, CategoryBulkActions } from './ConfigCategoryActions';
import { ConfigItemRow } from './ConfigItemRow';
import { type ConfigItem, CATEGORY_COLORS, CATEGORY_ICONS, ConfigCategory } from '@/types/configMaster.types';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/common';
import { UserRole } from '@/types/common.types';

export interface ConfigurationListProps {
  items: ConfigItem[];
  activeCategory: ConfigCategory;
  searchTerm?: string;
  locale: string;
  role: UserRole | null;
}

/**
 * ConfigurationList - Displays a list of configuration items.
 * Refactored to use ConfigItemRow and standard Card component.
 */
export async function ConfigurationList({
  items,
  activeCategory,
  searchTerm = '',
  locale,
  role,
}: ConfigurationListProps) {
  const t = await getTranslations('configMaster');
  const isAdmin = role === UserRole.ADMIN;
  const colors = CATEGORY_COLORS[activeCategory.color] || CATEGORY_COLORS['rose'];
  const Icon = CATEGORY_ICONS[activeCategory.icon] || Shield;

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <Card variant="default" padding="none" className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl shadow-sm border border-white/20", colors.badge)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">{activeCategory.name}</h2>
          </div>
        </Card>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">
            {t('noItemsFound', { category: activeCategory.name })}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
            {t('searchTip')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <Card variant="default" padding="none" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl shadow-sm border border-white/20 transition-transform group-hover:scale-105",
            colors.badge
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {activeCategory.name}
              </h2>
              {isAdmin && <CategoryEditDeleteActions categoryId={activeCategory.id} categoryName={activeCategory.name} />}
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              {items.filter(i => i.isEnabled).length} {t('list.configurationsActive')}
            </p>
          </div>
        </div>

        {isAdmin && <CategoryBulkActions categoryId={activeCategory.id} categoryName={activeCategory.name} />}
      </Card>

      {/* Config Items List */}
      <div className="grid grid-cols-1 gap-3 pb-24 overflow-visible">
        {items.map((item) => (
          <ConfigItemRow
            key={item.id}
            item={item}
            searchTerm={searchTerm}
            locale={locale}
            role={role}
          />
        ))}
      </div>
    </div>
  );
}

