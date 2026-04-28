import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UseRateSectionListParams {
  initialWardCounts: Record<string, number>;
  initialSearch: string;
  totalCount: number;
  pageSize: number;
}

export function useRateSectionList({
  initialWardCounts,
  initialSearch,
  totalCount,
  pageSize
}: UseRateSectionListParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [wardCounts, setWardCounts] = useState<Record<string, number>>(initialWardCounts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);

  const effectivePageSize = pageSize || 10;
  const totalPages = Math.ceil(totalCount / effectivePageSize);

  useEffect(() => {
    if (initialWardCounts && Object.keys(initialWardCounts).length > 0) {
      setWardCounts(prev => ({ ...prev, ...initialWardCounts }));
    }
  }, [initialWardCounts]);

  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams?.get("q") || "";
      if (searchValue.trim() !== currentQ.trim()) {
        const params = new URLSearchParams(searchParams?.toString());
        if (searchValue.trim()) {
          params.set("q", searchValue.trim());
        } else {
          params.delete("q");
        }
        params.set("ratesectionpage", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, router, pathname, searchParams]);

  const changePageSize = useCallback((size: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("ratesectionpagesize", size.toString());
    params.set("ratesectionpage", "1");
    params.set("wardpage", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ratesectionpage", page.toString());
    params.set("wardpage", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return {
    wardCounts,
    deletingId,
    setDeletingId,
    searchValue,
    setSearchValue,
    totalPages,
    effectivePageSize,
    changePageSize,
    handlePageChange
  };
}
