import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface UseRtsFieldPaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  locale: string;
  currentSearchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  startTransition: (callback: () => void) => void;
}

export function useRtsFieldPagination({
  pageNumber,
  pageSize,
  totalCount,
  locale,
  currentSearchTerm = "",
  sortBy = "",
  sortOrder = "",
  startTransition,
}: UseRtsFieldPaginationProps) {
  const router = useRouter();

  const buildUrl = useCallback(
    (page: number, size: number, search: string, sortCol: string, sortDir: string) => {
      const sp = new URLSearchParams();
      if (page > 1) sp.set("page", String(page));
      if (size !== 10) sp.set("pageSize", String(size));
      if (search) sp.set("q", search);
      if (sortCol) sp.set("sortBy", sortCol);
      if (sortDir) sp.set("sortOrder", sortDir);
      const queryStr = sp.toString();
      return `/${locale}/rts/fields${queryStr ? `?${queryStr}` : ""}`;
    },
    [locale]
  );

  const changePage = useCallback(
    (page: number) => {
      startTransition(() => {
        router.push(buildUrl(page, pageSize, currentSearchTerm, sortBy, sortOrder));
      });
    },
    [router, buildUrl, pageSize, currentSearchTerm, sortBy, sortOrder, startTransition]
  );

  const handlePageSizeChange = useCallback(
    (newSize: string) => {
      const sizeNum = parseInt(newSize, 10);
      startTransition(() => {
        router.push(buildUrl(1, sizeNum, currentSearchTerm, sortBy, sortOrder));
      });
    },
    [router, buildUrl, currentSearchTerm, sortBy, sortOrder, startTransition]
  );

  const paginationInfo = useMemo(() => {
    const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const end = Math.min(pageNumber * pageSize, totalCount);
    return { start, end, total: totalCount };
  }, [pageNumber, pageSize, totalCount]);

  return {
    buildUrl,
    changePage,
    handlePageSizeChange,
    paginationInfo,
  };
}
