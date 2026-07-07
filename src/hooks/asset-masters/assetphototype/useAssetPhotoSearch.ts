"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

interface UseAssetPhotoSearchProps {
  pageSize: number;
  locale: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useAssetPhotoSearch({
  pageSize,
  locale,
  sortBy,
  sortOrder,
}: UseAssetPhotoSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const handleSearchChange = useCallback((value: string) => {
    let sanitized = value.replace(TEXT_SANITIZE, "");
    sanitized = sanitized.trimStart().replace(/\s{2,}/g, " ");
    setSearch(sanitized);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    if (debouncedSearch.trim()) {
      params.set("q", debouncedSearch.trim());
    }
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    router.push(`/${locale}/assets/configuration/master-data/asset-photo-type?${params.toString()}`);
  }, [debouncedSearch, pageSize, locale, sortBy, sortOrder, router]);

  return {
    search,
    currentSearchTerm: debouncedSearch.trim() || undefined,
    handleSearchChange,
  };
}
