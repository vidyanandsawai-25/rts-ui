"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AssessmentYearRangeConfig } from "@/types/assessment-year-range.types";

interface UseAssessmentYearRangePaginationProps {
  config: AssessmentYearRangeConfig;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  locale: string;
  startTransition: (callback: () => void) => void;
}

export function useAssessmentYearRangePagination({
  config,
  pageNumber,
  pageSize,
  totalCount,
  locale,
  startTransition,
}: UseAssessmentYearRangePaginationProps) {
  const router = useRouter();

  const buildUrl = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));
      return `/${locale}${config.routePath}?${params.toString()}`;
    },
    [locale, config.routePath]
  );

  const changePage = useCallback(
    (p: number): void => {
      startTransition(() => {
        router.push(buildUrl(p, pageSize));
      });
    },
    [pageSize, router, startTransition, buildUrl]
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      startTransition(() => {
        router.push(buildUrl(1, Number(value)));
      });
    },
    [router, buildUrl, startTransition]
  );

  // Footer pagination calculations
  const start = totalCount === 0 ? 0 : ((pageNumber || 1) - 1) * (pageSize || 10) + 1;
  const end = Math.min(start + (pageSize || 10) - 1, totalCount);
  const total = totalCount || 0;

  return {
    buildUrl,
    changePage,
    handlePageSizeChange,
    paginationInfo: {
      start,
      end,
      total,
    },
  };
}
