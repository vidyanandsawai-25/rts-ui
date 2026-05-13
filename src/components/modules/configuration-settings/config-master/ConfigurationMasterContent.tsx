import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import { ConfigurationCards } from './ConfigurationCards';
import { ConfigurationList } from './ConfigurationList';
import { ConfigSearchBar } from './ConfigSearchBar';
import type { ConfigCategory, ConfigItem } from '@/types/configMaster.types';
import { UserRole } from '@/types/common.types';

interface ConfigurationMasterContentProps {
  categories: ConfigCategory[];
  activeCategoryId: string;
  activeCategory: ConfigCategory;
  displayItems: ConfigItem[];
  search?: string;
  locale: string;
  role: UserRole | null;
  noSearchResultsLabel: string;
  noItemsFoundLabel: string;
  searchTipLabel: string;
}

export function ConfigurationMasterContent({
  categories,
  activeCategoryId,
  activeCategory,
  displayItems,
  search,
  locale,
  role,
  noSearchResultsLabel,
  noItemsFoundLabel,
  searchTipLabel,
}: ConfigurationMasterContentProps) {
  return (
    <div className="flex-1 px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="max-w-500 mx-auto space-y-8">
        <section className="space-y-6">
          <ConfigurationCards
            categories={categories}
            activeCategoryId={activeCategoryId}
            search={search}
          />
          <div className="w-full">
            <ConfigSearchBar />
          </div>
        </section>

        <main className="min-h-150">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-950 overflow-visible">
            <CardContent className="p-0 sm:p-1 overflow-visible">
              {displayItems.length > 0 ? (
                <ConfigurationList
                  items={displayItems}
                  activeCategory={activeCategory}
                  searchTerm={search}
                  locale={locale}
                  role={role}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm font-semibold">
                    {search ? noSearchResultsLabel : noItemsFoundLabel}
                  </p>
                  {search && (
                    <p className="text-xs mt-2 opacity-60">
                      {searchTipLabel}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
