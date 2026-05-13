import { ConfigurationMaster } from '@/components/modules/configuration-settings/config-master/ConfigurationMaster';
import { configMasterService } from '@/lib/api/configMaster.service';
import { getDepartmentConfigurationAction } from '@/app/[locale]/configuration-settings/config-master/actions';
import { getSessionRole } from './actions/utils';
import { UserRole, type ActionResult } from '@/types/common.types';
import type { ConfigCategory, ConfigItem, DepartmentApiResponse } from '@/types/configMaster.types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Configuration Master | NTIS',
  description: 'Configure global and department-specific security settings',
};

export default async function ConfigMasterPage({
  params: _params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await _params;
  const rawSearchParams = await searchParams;
  
  // Safely extract search params on the server for Full SSR support
  const configKeyId = typeof rawSearchParams.configKeyId === 'string' ? rawSearchParams.configKeyId : undefined;
  const categoryId = typeof rawSearchParams.categoryId === 'string' ? rawSearchParams.categoryId : undefined;
  const search = typeof rawSearchParams.search === 'string' ? rawSearchParams.search : undefined;
  const action = typeof rawSearchParams.action === 'string' ? rawSearchParams.action : undefined;
  const editCategory = typeof rawSearchParams.editCategory === 'string' ? rawSearchParams.editCategory : undefined;
  const editKey = typeof rawSearchParams.editKey === 'string' ? rawSearchParams.editKey : undefined;

  // Server-side data fetching & Session check
  const [categoriesRes, role]: [ActionResult<ConfigCategory[]>, UserRole | null] = await Promise.all([
    configMasterService.getAllCategories(),
    getSessionRole(),
  ]);

  if (!categoriesRes.success) {
    throw new Error(categoriesRes.error || "Failed to fetch configuration categories");
  }
  const categories: ConfigCategory[] = categoriesRes.data || [];

  const activeCategoryId = categoryId || categories[0]?.id || 'all';
  const isGlobalSearch = !!search && search.length >= 2;
  const itemsCategoryToFetch = isGlobalSearch ? 'all' : activeCategoryId;

  const parsedConfigKeyId = configKeyId && !isNaN(parseInt(configKeyId)) ? parseInt(configKeyId) : null;
  const shouldLoadDepartmentData = parsedConfigKeyId !== null;

  const [itemsRes, departmentDataRes] = await Promise.all([
    configMasterService.getItemsByCategory(itemsCategoryToFetch),
    shouldLoadDepartmentData
      ? getDepartmentConfigurationAction(parsedConfigKeyId)
      : Promise.resolve(null),
  ]);

  // Handle items fetch gracefully - don't throw, let component show error state
  const items: ConfigItem[] = itemsRes.success ? (itemsRes.data || []) : [];

  const departmentData: DepartmentApiResponse[] | null =
    departmentDataRes?.success && departmentDataRes.data ? departmentDataRes.data : null;

  return (
    <ConfigurationMaster
      categories={categories}
      initialItems={items}
      departmentData={departmentData}
      categoryId={activeCategoryId}
      search={search}
      action={action}
      editCategory={editCategory}
      editKey={editKey}
      configKeyId={configKeyId}
      locale={locale}
      role={role}
    />
  );
}
