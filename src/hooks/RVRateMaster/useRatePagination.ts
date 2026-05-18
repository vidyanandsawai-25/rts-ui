import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { IZoneDescription } from "@/types/RVRateMaster";

interface UseRatePaginationProps {
  paginatedZonesData?: {
    items: IZoneDescription[];
    totalPages: number;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
  zoneDescriptions: IZoneDescription[];
}

/**
 * Hook for managing matrix grid pagination
 */
export function useRatePagination({
  paginatedZonesData,
  zoneDescriptions,
}: UseRatePaginationProps) {
  const router = useRouter();

  // Pagination state for matrix grid
  const [matrixPageNumber, setMatrixPageNumber] = useState(paginatedZonesData?.pageNumber ?? 1);
  const [matrixPageSize, setMatrixPageSize] = useState(paginatedZonesData?.pageSize ?? 10);
  const [matrixTotalPages, setMatrixTotalPages] = useState(paginatedZonesData?.totalPages ?? Math.ceil(zoneDescriptions.length / 10));
  const [matrixTotalCount, setMatrixTotalCount] = useState(paginatedZonesData?.totalCount ?? zoneDescriptions.length);
  const [paginatedZoneDescriptions, setPaginatedZoneDescriptions] = useState(paginatedZonesData?.items ?? zoneDescriptions.slice(0, 10));

  // Sync paginated zone data from server-provided props when they change
  useEffect(() => {
    if (paginatedZonesData) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setPaginatedZoneDescriptions(paginatedZonesData.items);
      setMatrixTotalPages(paginatedZonesData.totalPages);
      setMatrixTotalCount(paginatedZonesData.totalCount);
      setMatrixPageNumber(paginatedZonesData.pageNumber);
      setMatrixPageSize(paginatedZonesData.pageSize);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [paginatedZonesData]);

  // Handle pagination changes via URL navigation
  const handleMatrixPaginationChange = (newPageNumber: number, newPageSize: number) => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    params.set('matrixPage', String(newPageNumber));
    params.set('matrixPageSize', String(newPageSize));
    
    setMatrixPageNumber(newPageNumber);
    setMatrixPageSize(newPageSize);
    
    const pathname = window.location.pathname;
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  return {
    matrixPageNumber,
    matrixPageSize,
    matrixTotalPages,
    matrixTotalCount,
    paginatedZoneDescriptions,
    handleMatrixPaginationChange,
  };
}
