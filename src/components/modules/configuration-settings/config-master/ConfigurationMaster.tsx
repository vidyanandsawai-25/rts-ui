import { ConfigModalsController } from './ConfigModalsController';
import { getTranslations } from 'next-intl/server';
import { ConfigItem, ConfigCategory } from '@/types/configMaster.types';
import type { DepartmentApiResponse } from '@/types/configMaster.types';
import { UserRole } from '@/types/common.types';
import { ConfigurationMasterHeader } from './ConfigurationMasterHeader';
import { ConfigurationMasterContent } from './ConfigurationMasterContent';

export async function ConfigurationMaster({
  categories,
  initialItems,
  departmentData,
  categoryId,
  search,
  action,
  editCategory,
  editKey,
  configKeyId,
  locale,
  role,
}: {
  categories: ConfigCategory[];
  initialItems: ConfigItem[];
  departmentData: DepartmentApiResponse[] | null;
  categoryId?: string;
  search?: string;
  action?: string;
  editCategory?: string;
  editKey?: string;
  configKeyId?: string;
  locale: string;
  role: UserRole | null;
}) {
  const t = await getTranslations('configMaster');
  const isAdmin = role === UserRole.ADMIN;

  const activeCategoryId = categoryId || categories[0]?.id || 'all';

  // Apply search filter locally on the server if needed (redundant if page.tsx does it, but safe)
  let displayItems = initialItems;
  if (search && search.length > 0) {
    const searchLower = search.toLowerCase();
    displayItems = displayItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchLower))
    );
  }

  // Ensure we have an active category even if categories list is empty
  // Provide a fully shaped fallback to satisfy ConfigCategory type and prevent runtime errors
  const fallbackCategory: ConfigCategory = {
    id: '',
    code: 'N/A',
    name: '...',
    displayOrder: 0,
    isActive: false,
    color: 'rose',
    icon: 'Shield',
    count: 0,
    total: 0
  };

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0] || fallbackCategory;

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
      <ConfigurationMasterHeader
        title={t('title')}
        subtitle={t('subtitle')}
        systemLevelLabel={t('systemLevel')}
        addCategoryLabel={t('addCategory')}
        addConfigKeyLabel={t('addConfigKey')}
        activeCategoryId={activeCategoryId}
        search={search}
        isAdmin={isAdmin}
      />

      <ConfigurationMasterContent
        categories={categories}
        activeCategoryId={activeCategoryId}
        activeCategory={activeCategory}
        displayItems={displayItems}
        search={search}
        locale={locale}
        role={role}
        noSearchResultsLabel={t('noSearchResults', { search: search || '' })}
        noItemsFoundLabel={t('noItemsFound', { category: activeCategory.name })}
        searchTipLabel={t('searchTip') || 'Try adjusting your search terms or category filter.'}
      />

      <ConfigModalsController
        categories={categories}
        items={displayItems}
        departmentData={departmentData as DepartmentApiResponse[] | null}
        role={role}
        serverAction={action}
        serverEditCategory={editCategory}
        serverEditKey={editKey}
        serverConfigKeyId={configKeyId}
      />
    </div>
  );
}
