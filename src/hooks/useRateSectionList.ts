import { useState, useEffect, useCallback, useMemo } from "react";
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

  // Track ward counts with accumulation/merging behavior
  // This ensures counts persist even when a rate section isn't currently selected
  const [wardCounts, setWardCounts] = useState<Record<string, number>>(initialWardCounts);
  
  // Track search value - needs to sync with URL for back/forward navigation
  const [searchValue, setSearchValue] = useState(initialSearch);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const effectivePageSize = pageSize || 10;
  const totalPages = Math.ceil(totalCount / effectivePageSize);

  // Merge new ward counts into existing state (accumulate over time)
  // Uses useMemo to avoid creating new objects on every render
  const shouldUpdateWardCounts = useMemo(() => {
    if (!initialWardCounts || Object.keys(initialWardCounts).length === 0) return false;
    // Check if any new counts differ from current state
    return Object.keys(initialWardCounts).some(
      key => wardCounts[key] !== initialWardCounts[key]
    );
  }, [initialWardCounts, wardCounts]);

  // Update ward counts when new data arrives
  if (shouldUpdateWardCounts) {
    setWardCounts(prev => ({ ...prev, ...initialWardCounts }));
  }

  // Sync searchValue with URL changes (back/forward navigation)
  // Only update if initialSearch differs from current searchValue
  if (initialSearch !== searchValue && searchParams.get("q") === initialSearch) {
    setSearchValue(initialSearch);
  }

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
