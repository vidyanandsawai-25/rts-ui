import {
  getMunicipalDashboardStats,
  getMunicipalAssetCategories,
  getMunicipalAssetTypes,
  getAssetsByTypeDetails,
} from '@/lib/api/asset/municipal-Asset/asset-dashboard.service';
import MunicipalAssetDashboard from '@/components/modules/assets/municipal-Asset/MunicipalAssetDashboard';
import { Suspense } from 'react';
import type { RawSearchParams } from '@/lib/utils/sanitize-params';
import type { AssetType, DashboardStatsResponse } from '@/types/asset/municipal-Asset/municipal-asset.types';

// Force dynamic rendering for this page — ensures every request fetches fresh
// data from the API rather than using a cached RSC response.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams & { assetTypeId?: string; drawerPage?: string }>;
}

export default async function MunicipalAssetPage({ params, searchParams }: PageProps) {
  // In Next.js 15, `params` and `searchParams` are Promises that must be
  // awaited. Even when values are not directly used in this component, awaiting
  // them is required to opt into dynamic rendering per Next.js conventions.
  await params;
  const sParams = await searchParams;

  const rawAssetTypeId = sParams?.assetTypeId;
  const assetTypeId = rawAssetTypeId ? Number(rawAssetTypeId) : null;
  const rawDrawerPage = sParams?.drawerPage;
  const drawerPage = rawDrawerPage ? Number(rawDrawerPage) : 1;

  // Fetch stats, master lists, and optional drawer details in parallel using dedicated municipal asset service
  const [initialStats, masterCategories, masterTypes, drawerRes] = await Promise.all([
    getMunicipalDashboardStats().catch((err) => {
      console.error('Stats fetch failed:', err);
      return null;
    }),
    getMunicipalAssetCategories().catch((err) => {
      console.error('Categories fetch failed:', err);
      return [];
    }),
    getMunicipalAssetTypes().catch((err) => {
      console.error('Types fetch failed:', err);
      return [];
    }),
    assetTypeId && !isNaN(assetTypeId)
      ? getAssetsByTypeDetails(assetTypeId, drawerPage, 10)
          .then((data) => ({ success: true as const, data }))
          .catch((err) => {
            console.error('Drawer assets fetch failed:', err);
            return null;
          })
      : Promise.resolve(null),
  ]);

  const initialDrawerData = drawerRes?.success ? drawerRes.data : null;

  const selectedAssetType =
    assetTypeId && !isNaN(assetTypeId)
      ? masterTypes.find((t) => t.id === assetTypeId) ?? ({ id: assetTypeId, typeName: 'Asset Details' } as AssetType)
      : null;

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden">
      <div className="flex-1 p-2 bg-slate-50/50 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-[99%]">
          {/*
            The Suspense boundary here provides a client-side fallback UI for
            the initial hydration pass of MunicipalAssetDashboard. Route-level
            streaming is handled by loading.tsx.
          */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            }
          >
            <MunicipalAssetDashboard
              initialStats={initialStats as DashboardStatsResponse | null}
              masterCategories={masterCategories}
              masterTypes={masterTypes}
              selectedAssetType={selectedAssetType}
              initialDrawerData={initialDrawerData}
              activeDrawerPage={drawerPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
