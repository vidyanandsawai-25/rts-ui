'use client';

import { useRef, useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/useDebounce";
import { TableData } from "@/types/PropertyMedia/PropertyMedia.types";
import { PropertyMediaCategoryEnum } from "@/lib/constants/propertyMedia.constants";

export interface UseGapAnalysisProps {
  tableData?: TableData;
}

/**
 * Sanitizes search input:
 * - Allows characters (including multilingual letters & marks) and numbers.
 * - Disallows special characters.
 * - Disallows leading space.
 * - Normalizes consecutive spaces to a single space.
 */
export const sanitizeSearchInput = (value: string): string => {
  return value
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
    .replace(/^\s+/, "")
    .replace(/\s+/g, " ");
};

export function useGapAnalysis() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("propertyMedia");

  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

 
  // URL Parameters as Single Source of Truth

  const activeCategory = (searchParams.get("category") || "").toLowerCase()  as string| "";
  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";

  // Local state for immediate typing feedback
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const lastPushedQueryRef = useRef(searchQuery);

  // Only update local state if URL was changed externally
  useEffect(() => {
    if (searchQuery !== lastPushedQueryRef.current) {
      lastPushedQueryRef.current = searchQuery;
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  
  // URL Update Helper

  const updateQueries = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === "") {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });

        const queryString = params.toString();
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(nextUrl, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Debounced Search Sync to URL

  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== searchQuery.trim()) {
      lastPushedQueryRef.current = trimmed;
      updateQueries({ q: trimmed || null });
    }
  }, [debouncedSearch, searchQuery, updateQueries]);

  // Input & Filter Handlers

  const handleSearchChange = useCallback((value: string) => {
    const sanitized = sanitizeSearchInput(value);
    setSearchTerm(sanitized);
  }, []);

  const handleCategoryClick = useCallback(
    (category: string) => {
      updateQueries({ category: category || null });
    },
    [updateQueries]
  );

  const handleShowAll = useCallback(() => {
    updateQueries({ category: null });
  }, [updateQueries]);

  const handleFilterClick = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      updateQueries({ page });
    },
    [updateQueries]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      updateQueries({ pageSize: size, page: 1 });
    },
    [updateQueries]
  );


  // Derived Category Label & Show All State

  const isShowAllDisabled = !activeCategory;

  const currentCategoryLabel = useMemo(() => {
    if (!activeCategory) {
      return t("detailedCoverageHeader.allItems");
    }
    switch (activeCategory) {
      case String(PropertyMediaCategoryEnum.PHOTO):
        return t("gapAnalysis.categories.photo");
      case String(PropertyMediaCategoryEnum.PLAN):
        return t("gapAnalysis.categories.plan");
      case String(PropertyMediaCategoryEnum.DOCUMENT):
        return t("gapAnalysis.categories.document");
      default:
        return activeCategory;
    }
  }, [activeCategory, t]);

  return {
    // References
    searchInputRef,
    // URL States
    activeCategory,
    searchQuery,
    searchTerm,
    isPending,
    // UI Helpers
    currentCategoryLabel,
    isShowAllDisabled,
    // Handlers
    handleSearchChange,
    handleCategoryClick,
    handleShowAll,
    handleFilterClick,
    handlePageChange,
    handlePageSizeChange,
    sanitizeSearch: sanitizeSearchInput,
    t,
  };
}
