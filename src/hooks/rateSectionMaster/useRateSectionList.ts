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
  
  // Track local search value - only used while user is typing
  const [localSearchValue, setLocalSearchValue] = useState(initialSearch);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
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

  // The effective search value: use local while typing, URL otherwise
  const searchValue = isUserTyping ? localSearchValue : initialSearch;

  // Debounced URL update when user types
  useEffect(() => {
    if (!isUserTyping) return;
    
    const timer = setTimeout(() => {
      const currentQ = searchParams?.get("q") || "";
      if (localSearchValue.trim() !== currentQ.trim()) {
        const params = new URLSearchParams(searchParams?.toString());
        if (localSearchValue.trim()) {
          params.set("q", localSearchValue.trim());
        } else {
          params.delete("q");
        }
        params.set("ratesectionpage", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
      // Reset typing flag after URL is updated
      setIsUserTyping(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchValue, isUserTyping, router, pathname, searchParams]);

  // Custom setter that marks user as typing
  const handleSearchChange = useCallback((value: string) => {
    setIsUserTyping(true);
    setLocalSearchValue(value);
  }, []);

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
    setSearchValue: handleSearchChange,
    totalPages,
    effectivePageSize,
    changePageSize,
    handlePageChange
  };
}
