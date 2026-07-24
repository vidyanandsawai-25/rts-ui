'use client';

import { useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AddButton, Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import { Building2 } from 'lucide-react';
import { AssetCategoryCard } from './AssetCategoryCard';
import { getCategoryMeta, themes } from './dashboardHelpers';
import { AssetTypeDetailsDrawer } from './AssetTypeDetailsDrawer';
import type { MunicipalAssetDashboardProps, AssetType } from '@/types/asset/municipal-Asset/municipal-asset.types';
import { useMunicipalAssetDashboard } from '@/hooks/asset/municipal-Asset/useMunicipalAssetDashboard';
import { useLocaleRouter } from '@/hooks/asset/municipal-Asset/useLocaleRouter';
import { MUNICIPAL_ASSET_ROUTES } from '@/lib/routes/municipal-asset.routes';

export default function MunicipalAssetDashboard({
  initialStats = null,
  masterCategories = [],
  masterTypes = [],
  selectedAssetType: serverSelectedType = null,
  initialDrawerData = null,
  activeDrawerPage = 1,
}: MunicipalAssetDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useLocaleRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('municipalAsset.dashboard');

  // Force an RSC fetch request to appear in the Network tab on load.
  // Uses startTransition (same pattern as asset masters) so the refresh
  // does not block concurrent React rendering.
  useEffect(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const {
    categories,
    typesByCategory,
    visibleExamples,
    setVisibleExamples,
    dashboardStats,
  } = useMunicipalAssetDashboard(initialStats, masterCategories, masterTypes);

  const handleSelectCategory = (categoryId: number) => {
    push(MUNICIPAL_ASSET_ROUTES.assetRegister(categoryId));
  };

  const handleSelectType = (type: AssetType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('assetTypeId', String(type.id));
    params.delete('drawerPage');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('assetTypeId');
    params.delete('drawerPage');
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleDrawerPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('drawerPage', String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6 pb-4">
      <Card variant="bordered" padding="none" className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="bg-white px-6 pb-0 pt-8">
            <CardHeader className="mb-3 p-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 opacity-40 blur-[4px]" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-lg">
                      <Building2 className="h-5 w-5 text-white drop-shadow" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-black leading-tight tracking-tight text-[#1a1a2e]">
                        {t('title')}
                      </CardTitle>
                      <span className="rounded-full border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-violet-700">
                        MC-EMS
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium">
                      <span className="font-bold text-violet-600">{t('marathiTitle')}</span>
                      <span className="inline-block h-0.5 w-0.5 rounded-full bg-slate-300" />
                      <span className="text-slate-400">{t('subtitle')}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="flex items-center justify-between border-t border-municipal-primary/8 py-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-bold text-emerald-700">{t('totalCategories')}</span>
                  <span className="text-sm font-black text-emerald-800">
                    {dashboardStats?.totalCategories ?? categories.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">{t('totalAssets')}</span>
                  <span className="text-sm font-black text-slate-800">{dashboardStats?.totalAssets ?? 0}</span>
                </div>
              </div>
              <AddButton
                label={t('addNewAsset')}
                onClick={() => push(MUNICIPAL_ASSET_ROUTES.addNewAsset())}
                className="h-auto rounded-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-[11px] font-bold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="px-8 pb-0 pt-6">
        {!dashboardStats ? (
          <Card variant="bordered" className="mx-auto max-w-md border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16 opacity-70">
              <div className="mb-4 size-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{t('loading')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {categories.map((category, index) => {
              const meta = getCategoryMeta(category.categoryName);
              let themeContext = themes[meta.id];
              if (!themeContext) {
                const themeKeys = Object.keys(themes);
                const assignedKey = themeKeys[category.id % themeKeys.length];
                themeContext = themes[assignedKey] ?? themes.building;
              }
              const stat = dashboardStats?.categoryStats.find((s) => s.categoryId === category.id);
              const assetCount = stat?.registeredAssets ?? stat?.totalCategoryItem ?? 0;
              const totalValue = stat?.totalValue ?? null;
              return (
                <AssetCategoryCard
                  key={category.id}
                  index={index}
                  category={category}
                  assetCount={assetCount}
                  totalValue={totalValue}
                  meta={meta}
                  theme={themeContext}
                  catTypes={typesByCategory[category.id] ?? []}
                  visibleCount={visibleExamples[category.id.toString()] ?? 5}
                  onVisibleCountChange={(count) =>
                    setVisibleExamples((prev) => ({ ...prev, [category.id.toString()]: count }))
                  }
                  onSelectCategory={() => handleSelectCategory(category.id)}
                  onSelectType={(type) => handleSelectType(type)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AssetTypeDetailsDrawer
        isOpen={!!serverSelectedType}
        onClose={handleCloseDrawer}
        assetType={serverSelectedType}
        data={initialDrawerData}
        loading={isPending}
        pageNumber={activeDrawerPage}
        onPageChange={handleDrawerPageChange}
      />
    </div>
  );
}
