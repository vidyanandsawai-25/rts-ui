import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UseSearchNavigationProps {
  search: string;
  currentSearchTerm: string;
  pageSize: number;
  locale: string;
  sortBy?: string;
  sortOrder?: string;
  basePath: string;
  debounceMs?: number;
  startTransition: (callback: () => void) => void;
}

export function useSearchNavigation({
  search,
  currentSearchTerm,
  pageSize,
  locale,
  sortBy,
  sortOrder,
  basePath,
  debounceMs = 500,
  startTransition,
}: UseSearchNavigationProps) {
  const router = useRouter();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Only trigger when user changes search term, not on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (search === currentSearchTerm) return;

    const timer = setTimeout(() => {
      const trimmedSearch = search.trim();
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", String(pageSize));
      
      if (trimmedSearch) {
        params.set("q", trimmedSearch);
      }
      
      // Preserve sort params when searching
      if (sortBy) {
        params.set("sortBy", sortBy);
      }
      if (sortOrder) {
        params.set("sortOrder", sortOrder);
      }
      
      startTransition(() => {
        router.push(`/${locale}${basePath}?${params.toString()}`);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, pageSize, router, locale, currentSearchTerm, sortBy, sortOrder, basePath, debounceMs, startTransition]);
}