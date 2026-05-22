/**
 * Grievance Category Master Component (Server Component)
 *
 * Pure SSR container component that renders the Grievance Category page.
 * All data is received as props from the page component.
 * No client-side state management.
 *
 * @module GrievanceCategoryMaster
 */
import type { ReactElement } from 'react';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AlertCircle, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/components/common';

import { GrievanceCategoryList } from './GrievanceCategoryList';
import { GrievanceCategoryFilter } from './GrievanceCategoryFilter';
import { StatCard } from './StatCard';
import { AddCategoryButton } from './AddCategoryButton';
import type { GrievanceCategoryMasterViewProps } from '@/types/grievance-category-master/grievance-category-props.types';

function ListLoadingFallback(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="h-12 bg-slate-100 dark:bg-slate-800/50" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-t border-slate-200 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * GrievanceCategoryMaster Component (Server Component)
 */
export async function GrievanceCategoryMaster({
  locale,
  data = [],
  departments = [],
  stats,
  pageSize: initialPageSize = 10,
  page: initialPage = 1,
  totalCount = 0,
  initialSearch = '',
  initialDepartment = 'all',
  initialStatus = 'all',
  children,
}: GrievanceCategoryMasterViewProps): Promise<ReactElement> {
  // Use the root namespace to be more robust
  const t = await getTranslations({ locale, namespace: 'grievanceCategory' });
  const tMaster = (key: string) => t(`master.${key}`);
  const tList = (key: string) => t(`list.${key}`);

  const currentPage = initialPage;
  const currentPageSize = initialPageSize;

  const { total, critical, active, avgSla } = stats;

  const addParams = new URLSearchParams();
  addParams.set('page', String(currentPage));
  addParams.set('pageSize', String(currentPageSize));
  if (initialSearch) addParams.set('search', initialSearch);
  if (initialDepartment && initialDepartment !== 'all') {
    addParams.set('department', String(initialDepartment));
  }
  if (initialStatus !== null && initialStatus !== 'all') {
    addParams.set('status', String(initialStatus));
  }

  const addPath = `/${locale}/configuration-settings/grievance-category-master/add?${addParams.toString()}`;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-500">
      <PageContainer className="px-1 sm:px-3 md:px-4 lg:px-6 py-2 md:py-4 w-full">
        {/* Header Section */}
        <header className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 md:p-6">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {tMaster('title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[10px] sm:text-xs md:text-sm line-clamp-1 opacity-90">
                  {tMaster('description') || ''}
                </p>
              </div>
            </div>

            <AddCategoryButton addPath={addPath} label={tMaster('add')} />
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            label={tMaster('stats.total')}
            value={total}
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            label={tMaster('stats.critical')}
            value={critical}
            icon={AlertCircle}
            color="rose"
          />
          <StatCard label={tMaster('stats.sla')} value={avgSla} icon={Clock} color="indigo" />
          <StatCard
            label={tMaster('stats.active')}
            value={active}
            icon={TrendingUp}
            color="amber"
          />
        </div>

        {/* Main Content Area */}
        <div className="relative">
          <Suspense fallback={<ListLoadingFallback />}>
            <GrievanceCategoryList
              locale={locale}
              categories={data}
              totalCount={totalCount}
              page={currentPage}
              pageSize={currentPageSize}
              departments={departments}
              searchParams={{
                search: initialSearch,
                department: initialDepartment,
                status: initialStatus,
              }}
              headerTitle={tMaster('tableTitle')}
              headerSubtitle={tMaster('tableSubtitle')}
              emptyText={tList('empty')}
              headerExtra={
                <div className="flex-1 w-full">
                  <GrievanceCategoryFilter
                    locale={locale}
                    initialSearch={initialSearch}
                    initialDepartment={initialDepartment}
                    initialStatus={initialStatus}
                    departments={departments}
                  />
                </div>
              }
            />
          </Suspense>
        </div>

        {children}
      </PageContainer>
    </div>
  );
}
