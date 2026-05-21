/**
 * Edit Grievance Category Page (Server Component)
 * Fetches the category by ID and background data server-side,
 * then renders the edit form inside a drawer over the master list.
 */
import type { ReactElement } from 'react';
import { Suspense } from 'react';
import { locales } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { getGrievanceCategoryById } from '@/lib/api/configuration-settings/grievance-category-master/grievanceCategory.service';
import {
  GrievanceCategoryMaster,
  GrievanceCategoryFormServer,
  GrievanceCategoryDrawerClient,
} from '@/components/modules/configuration-settings/grievance-category-master';
import { getGrievanceCategoryMasterData } from '../../data-fetcher';
import { buildMasterUrl, normalizeMasterSearchParams } from '../../search-params';

function EditPageLoadingFallback(): ReactElement {
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

interface EditPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditGrievanceCategoryPage({
  params,
  searchParams,
}: EditPageProps): Promise<ReactElement> {
  const { locale, id: rawId } = await params;
  const sParams = await searchParams;
  const normalizedSearchParams = normalizeMasterSearchParams(sParams);

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const id = parseInt(rawId, 10);
  if (Number.isNaN(id) || id <= 0) {
    notFound();
  }

  // Fetch both the specific category and the background list data in parallel
  const [category, masterData] = await Promise.all([
    getGrievanceCategoryById(id),
    getGrievanceCategoryMasterData(normalizedSearchParams),
  ]);

  if (!category || !category.success || !category.data) {
    notFound();
  }

  const { pagedData, departments, stats, pageSize, page, totalCount, search } = masterData;
  const returnPath = buildMasterUrl(locale, {
    ...normalizedSearchParams,
    page: String(page),
    pageSize: String(pageSize),
  });

  return (
    <Suspense fallback={<EditPageLoadingFallback />}>
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
          <GrievanceCategoryDrawerClient isEdit returnPath={returnPath}>
            <GrievanceCategoryFormServer
              editingCategory={category.data}
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
