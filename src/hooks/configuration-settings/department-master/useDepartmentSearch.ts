"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseDepartmentSearchProps {
  pageSize: number;
  startTransition: (callback: () => void) => void;
  status?: string;
}

export function useDepartmentSearch({
  pageSize,
  startTransition,
  status: initialStatus,
}: UseDepartmentSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || initialStatus || "");

  // Sync internal state with URL search params (important for back/forward navigation)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(urlSearch);
    }
    const urlStatus = searchParams.get("status") || "";
    if (urlStatus !== selectedStatus) {
      setSelectedStatus(urlStatus);
    }
  }, [searchParams, search, selectedStatus]);

  const currentSearchTerm = searchParams.get("search") || "";
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateUrl = useCallback((newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    
    if (newSearch) params.set("search", newSearch);
    else params.delete("search");
    
    if (newStatus) params.set("status", newStatus);
    else params.delete("status");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, pageSize, pathname, router, startTransition]);

  const handleSearchChange = (val: string) => {
    setSearch(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      updateUrl(val, selectedStatus);
    }, 500);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    // The Select component might pass the value as the second argument
    const val = value !== undefined ? value : e.target.value;
    setSelectedStatus(val);
    updateUrl(search, val);
  };

  return {
    search,
    currentSearchTerm,
    handleSearchChange,
    selectedStatus,
    handleStatusChange,
  };
}
