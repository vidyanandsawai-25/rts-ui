"use client";

import React from "react";
import type { UsePropertySearchResultsProps } from "@/types/property-search.types";

const DEFAULT_PAGE_SIZE = 10;

type PaginationState = {
  resultsKey: string;
  pageNumber: number;
  pageSize: number;
};

function getResultsKey(results: UsePropertySearchResultsProps["results"]): string {
  if (!results?.length) return "";
  return `${results.length}:${results[0]?.id}:${results.at(-1)?.id}`;
}

/**
 * Client-side pagination for an SSR-supplied result list.
 * The full dataset is fetched once via `PageSize=-1`; the table slices it locally.
 */
export function usePropertySearchResults({
  results,
}: UsePropertySearchResultsProps) {
  const resultsKey = React.useMemo(() => getResultsKey(results), [results]);
  const [pagination, setPagination] = React.useState<PaginationState>(() => ({
    resultsKey: getResultsKey(results),
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }));

  const pageNumber =
    pagination.resultsKey === resultsKey ? pagination.pageNumber : 1;
  const pageSize = pagination.pageSize;

  const filteredData = React.useMemo(() => results ?? [], [results]);
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(pageNumber, totalPages);

  const paginatedData = React.useMemo(() => {
    const start = (safePageNumber - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePageNumber, pageSize]);

  const handlePageChange = React.useCallback(
    (page: number) => {
      setPagination((prev) => ({
        resultsKey,
        pageNumber: page,
        pageSize: prev.pageSize,
      }));
    },
    [resultsKey]
  );

  const handlePageSizeChange = React.useCallback(
    (size: number) => {
      setPagination({
        resultsKey,
        pageNumber: 1,
        pageSize: size,
      });
    },
    [resultsKey]
  );

  return {
    filteredData,
    paginatedData,
    pageNumber: safePageNumber,
    pageSize,
    totalCount,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
}
