import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';
import type { TabNavigationProps } from '@/types/applicable-taxes.types';

export function ApplicableTaxesTabNavigation({ applicableCount, exemptedCount }: TabNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('applicableTaxes');

  const locale = (params.locale as string) || 'en';

  const searchQuery = searchParams.get('search') || '';

  // Local state for immediate typing feedback
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync localSearch when URL search parameter changes externally during render
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  // Debounce local search value
  const debouncedSearch = useDebounce(localSearch, 300);

  // Build query string helper (memoized)
  const getQueryString = useCallback((override: Record<string, string>) => {
    const queryParams = new URLSearchParams(searchParams.toString());

    const currentSearch = override.search !== undefined ? override.search : localSearch;
    if (currentSearch) {
      queryParams.set('search', currentSearch);
    } else {
      queryParams.delete('search');
    }
    return queryParams.toString();
  }, [searchParams, localSearch]);

  // Trigger router update when debouncedSearch value changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      const newQuery = getQueryString({ search: debouncedSearch });
      router.replace(`${pathname}?${newQuery}`);
    }
  }, [debouncedSearch, searchQuery, getQueryString, pathname, router]);

  // Determine active tab based on pathname
  const isExempted = pathname.includes('/exempted');

  const sections = [
    {
      id: 'applicable',
      label: t('applicable') || 'Applicable',   
      path: `/${locale}/property-tax/ptis/applicable-taxes/applicable`,
      isActive: !isExempted,
      count: applicableCount,
    },
    {
      id: 'exempted',
      label: t('exempted') || 'Exempted',     
      path: `/${locale}/property-tax/ptis/applicable-taxes/exempted`,
      isActive: isExempted,
      count: exemptedCount,
    },
  ];

  return (
    <div className="flex flex-row items-center justify-between gap-3 mb-4 bg-white p-0">
      {/* Search Input on Left */}
      <div className="relative flex-1 min-w-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder={t('searchPlaceholder') || 'Search tax head'}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Tabs on Right */}
      <nav className="flex gap-2 shrink-0">
        {sections.map((section) => {
          const sectionHref = `${section.path}?${getQueryString({})}`;
          return (
            <Link
              key={section.id}
              href={sectionHref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-[8px] text-[11px] font-bold transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md ',
                section.isActive
                  ? 'bg-linear-to-br from-blue-500 to-blue-600 border-blue-700 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              <span>{section.label}</span>
              <span className={cn(
                'inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[9px] font-extrabold ml-0.5',
                section.isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
              )}>
                {section.count}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


export default ApplicableTaxesTabNavigation;