import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

interface UseRtsFieldSearchProps {
  pageSize: number;
  locale: string;
  sortBy?: string;
  sortOrder?: string;
  startTransition: (callback: () => void) => void;
}

export function useRtsFieldSearch({
  pageSize,
  locale,
  sortBy,
  sortOrder,
  startTransition,
}: UseRtsFieldSearchProps) {
  const searchParams = useSearchParams();
  const currentSearchTerm = searchParams.get("q") || "";
  const [search, setSearch] = useState(currentSearchTerm);
  const [prevSearch, setPrevSearch] = useState(currentSearchTerm);

  if (currentSearchTerm !== prevSearch) {
    setPrevSearch(currentSearchTerm);
    setSearch(currentSearchTerm);
  }

  useSearchNavigation({
    search,
    currentSearchTerm,
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/rts/fields",
    startTransition,
  });

  const handleSearchChange = (value: string) => {
    const sanitized = value.replace(TEXT_SANITIZE, "");
    setSearch(sanitized);
  };

  return {
    search,
    currentSearchTerm,
    handleSearchChange,
  };
}
