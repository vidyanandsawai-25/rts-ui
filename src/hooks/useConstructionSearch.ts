import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

interface UseConstructionSearchProps {
  pageSize: number;
  locale: string;
  sortBy?: string;
  sortOrder?: string;
  startTransition: (callback: () => void) => void;
}

export function useConstructionSearch({
  pageSize,
  locale,
  sortBy,
  sortOrder,
  startTransition,
}: UseConstructionSearchProps) {
  const searchParams = useSearchParams();
  const currentSearchTerm = searchParams.get("q") || "";
  const [search, setSearch] = useState(currentSearchTerm);

  // Sync search state with URL on mount/navigation
  useEffect(() => {
    setSearch(currentSearchTerm);
  }, [currentSearchTerm]);

  // Debounced search navigation
  useSearchNavigation({
    search,
    currentSearchTerm,
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/property-tax/constructiontype",
    startTransition,
  });

  const handleSearchChange = (value: string) => {
    // Sanitize search input to prevent special characters
    const sanitized = value.replace(TEXT_SANITIZE, "");
    setSearch(sanitized);
  };

  return {
    search,
    currentSearchTerm,
    handleSearchChange,
  };
}