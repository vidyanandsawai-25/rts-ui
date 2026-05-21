/**
 * Add Grievance Category Page (Server Component)
 * Fetches departments server-side and renders the add form inside a drawer.
 */
import type { ReactElement } from 'react';
import { Suspense } from 'react';
import { locales } from '@/i18n/config';
import { notFound } from 'next/navigation';
import {
  GrievanceCategoryMaster,
  GrievanceCategoryFormServer,
  GrievanceCategoryDrawerClient,
} from '@/components/modules/configuration-settings/grievance-category-master';
import { getGrievanceCategoryMasterData } from '../data-fetcher';
import { buildMasterUrl, normalizeMasterSearchParams } from '../search-params';

function AddPageLoadingFallback(): ReactElement {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="px-1 sm:px-3 md:px-4 lg:px-6 py-2 md:py-4 w-full space-y-6">
        <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AddGrievanceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<ReactElement> {
  const { locale } = await params;
  const sParams = await searchParams;
  const normalizedSearchParams = normalizeMasterSearchParams(sParams);

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  let data;
  try {
    data = await getGrievanceCategoryMasterData(normalizedSearchParams);
  } catch (error) {
    const { ApiError } = await import('@/lib/utils/api');
    if (error instanceof ApiError && error.statusCode === 401) {
      const { redirect } = await import('next/navigation');
      redirect(`/${locale}/login`);
    }
    throw error;
  }

  const { pagedData, departments, stats, pageSize, page, totalCount, search } = data;
  const returnPath = buildMasterUrl(locale, {
    ...normalizedSearchParams,
    page: String(page),
    pageSize: String(pageSize),
  });

  return (
    <Suspense fallback={<AddPageLoadingFallback />}>
      <div className="h-full">
        <GrievanceCategoryMaster
          locale={locale}
          data={pagedData}
          departments={departments}
          stats={stats}
          pageSize={pageSize}
          page={page}
          totalCount={totalCount}
          initialSearch={search ?? ''}
          initialDepartment={normalizedSearchParams.department ?? 'all'}
          initialStatus={normalizedSearchParams.status ?? 'all'}
        >
          <GrievanceCategoryDrawerClient returnPath={returnPath}>
            <GrievanceCategoryFormServer
              editingCategory={null}
              departments={departments}
              locale={locale}
              returnPath={returnPath}
            />
          </GrievanceCategoryDrawerClient>
        </GrievanceCategoryMaster>
      </div>
    </Suspense>
  );
}
