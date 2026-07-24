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
    (params: Record<string, string | null>): boolean | 'no-op' => {
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
        const currentQuery = searchParams.toString();

        if (query === currentQuery) {
          return 'no-op';
        }

        startTransition(() => {
          router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
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
        const params: Record<string, string | null> = {
          wardNo: searchData.wardNo,
          propertyNo: searchData.propertyNo,
          partitionNo: searchData.partitionNo,
          wardId: searchData.wardId ? searchData.wardId.toString() : null,
          propertyId: searchData.propertyId,
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

        const result = updateUrl(params);

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
    [updateUrl, t]
  );

  return {
    isSearching: isSearchingProperty,
    handleSearchProperty,
    updateUrl,
  };
}
