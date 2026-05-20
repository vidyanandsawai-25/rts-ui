/**
 * Grievance Category Master Page (Server Component)
 * Fetches data server-side and passes to client components
 */

import type { ReactElement } from 'react';
import { Suspense } from 'react';
import { GrievanceCategoryMaster } from '@/components/modules/configuration-settings/grievance-category-master';
import { locales } from '@/i18n/config';
import { notFound, redirect } from 'next/navigation';

import { getGrievanceCategoryMasterData } from './data-fetcher';
import { buildMasterUrl, normalizeMasterSearchParams } from './search-params';

function MasterPageLoadingFallback(): ReactElement {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="px-1 sm:px-3 md:px-4 lg:px-6 py-2 md:py-4 w-full space-y-6">
        <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GrievanceCategoryMasterPage({
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

  // Early validation BEFORE fetching data - avoid unnecessary API calls
  const hasPageParam = normalizedSearchParams.page !== undefined;
  const hasPageSizeParam = normalizedSearchParams.pageSize !== undefined;
  const needsPageParam = !hasPageParam;
  const needsPageSizeParam = !hasPageSizeParam;

  // If critical params are missing, redirect early (before API call)
  if (needsPageParam || needsPageSizeParam) {
    const requestedPageSize = hasPageSizeParam
      ? parseInt(normalizedSearchParams.pageSize as string, 10)
      : 10;

    redirect(
      buildMasterUrl(locale, {
        ...normalizedSearchParams,
        page: '1',
        pageSize: String(requestedPageSize || 10),
      })
    );
  }

  let data;
  try {
    data = await getGrievanceCategoryMasterData(normalizedSearchParams);
  } catch (error) {
    const { ApiError } = await import('@/lib/utils/api');
    if (error instanceof ApiError && error.statusCode === 401) {
      redirect(`/${locale}/login`);
    }
    throw error;
  }

  const { pagedData, departments, stats, pageSize, page, totalCount, search } = data;

  // Additional validation after fetch - page out of bounds check
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const requestedPage = parseInt(normalizedSearchParams.page as string, 10);
  const requestedPageSize = parseInt(normalizedSearchParams.pageSize as string, 10);

  // Check if page is out of bounds or pageSize mismatch
  const pageOutOfBounds = requestedPage < 1 || (totalCount > 0 && requestedPage > totalPages);
  const pageSizeMismatch = requestedPageSize !== pageSize;

  if (pageOutOfBounds || pageSizeMismatch) {
    // Determine the correct page number
    const validPage = pageOutOfBounds
      ? Math.max(1, Math.min(requestedPage, totalPages))
      : requestedPage;

    redirect(
      buildMasterUrl(locale, {
        ...normalizedSearchParams,
        page: String(validPage),
        pageSize: String(pageSize),
      })
    );
  }

  return (
    <Suspense fallback={<MasterPageLoadingFallback />}>
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
        />
      </div>
    </Suspense>
  );
}
