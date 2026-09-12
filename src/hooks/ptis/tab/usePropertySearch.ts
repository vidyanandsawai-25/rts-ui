import { useState, useCallback, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { propertySearchSchema } from '@/lib/validations/ptis.schema';

export function usePropertySearch() {
  const t = useTranslations('ptis');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchingProperty, setIsSearchingProperty] = useState(false);

  // Turn off searching state when the Next.js page transition is complete
  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        setIsSearchingProperty(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  const updateUrl = useCallback(
    (params: Record<string, string | null>, customPath?: string): boolean | 'no-op' => {
      try {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
          if (value === null || value === '') {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        });

        const query = newParams.toString();
        const targetPathname = customPath || pathname;
        const currentFull = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const targetFull = `${targetPathname}${query ? `?${query}` : ''}`;

        if (currentFull === targetFull) {
          return 'no-op';
        }

        startTransition(() => {
          router.replace(targetFull, { scroll: false });
        });

        return true;
      } catch (_error) {
        return false;
      }
    },
    [searchParams, pathname, router]
  );

  const handleSearchProperty = useCallback(
    async (searchData: {
      wardNo: string;
      propertyNo: string;
      partitionNo: string;
      wardId: number | null;
      propertyId: string | null;
      category?: number;
      categoryLabel?: string;
      societyDetailId?: number | string | null;
      wingDetailId?: number | string | null;
      societyId?: number | string | null;
      wingId?: number | string | null;
    }): Promise<void> => {
      // Validate with Zod
      const validation = propertySearchSchema.safeParse(searchData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        return;
      }

      setIsSearchingProperty(true);

      try {
        // Extract locale prefix from pathname (e.g. /en/... or /mr/...)
        const segments = pathname.split('/').filter(Boolean);
        const locale =
          segments[0] && segments[0].length <= 5 && !segments[0].includes('property-tax')
            ? segments[0]
            : 'en';

        let targetPath: string | undefined = undefined;
        const isPartitionEmpty =
          !searchData.partitionNo ||
          searchData.partitionNo.trim() === '' ||
          searchData.partitionNo === '-' ||
          searchData.partitionNo === '0';

        const isApartmentSociety =
          searchData.category === 0 ||
          searchData.categoryLabel?.toLowerCase() === 'apartment society property' ||
          ((searchData.category === 1 || String(searchData.categoryLabel).toLowerCase().includes('apartment')) &&
            isPartitionEmpty &&
            searchData.categoryLabel?.toLowerCase() !== 'individual property' &&
            searchData.category !== 2);

        if (isApartmentSociety) {
          targetPath = `/${locale}/property-tax/ptis/apartment`;
        } else if (searchData.category !== undefined || searchData.categoryLabel !== undefined) {
          targetPath = `/${locale}/property-tax/ptis`;
        }

        const params: Record<string, string | null> = {
          wardNo: searchData.wardNo,
          propertyNo: searchData.propertyNo,
          partitionNo: searchData.partitionNo,
          wardId: searchData.wardId ? searchData.wardId.toString() : null,
          propertyId: searchData.propertyId,
          societyDetailId: searchData.societyDetailId ? String(searchData.societyDetailId) : null,
          wingDetailId: searchData.wingDetailId ? String(searchData.wingDetailId) : null,
          societyId: searchData.societyId ? String(searchData.societyId) : null,
          wingId: searchData.wingId ? String(searchData.wingId) : null,
          wingName: null,
          valuationTab: null,
          appartmentTab: null,
          subTab: null,
          pageNumber: null,
          searchTerm: null,
          drawer: null,
          photoCategoryIndex: null,
          selectedImageIndex: null,
          viewMode: null,
          action: null,
        };

        const result = updateUrl(params, targetPath);

        if (result !== true) {
          setIsSearchingProperty(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[usePropertySearch] Exception during search:', error);
        }
        toast.error(t('search.errors.navigationFailed'));
        setIsSearchingProperty(false);
      }
    },
    [updateUrl, t, pathname]
  );

  return {
    isSearching: isSearchingProperty,
    handleSearchProperty,
    updateUrl,
  };
}
