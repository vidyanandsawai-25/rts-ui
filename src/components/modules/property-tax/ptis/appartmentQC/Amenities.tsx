'use client';

import { useEffect, useState, useCallback, useTransition, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CommonPropertyTable from './CommonPropertyTable';
import { toast } from "sonner";
import { ApartmentQCDetail } from '@/types/apartmentQC.types';
import { getApartmentQCColumns } from './apartmentQC.columns';
import { transformApartmentData } from './apartmentQC.utils';
import { useColumnFilters } from "@/hooks/apartmentQc/useColumnFilters";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

interface AmenitiesProps {
  initialData: ApartmentQCDetail[];
  initialTotalCount: number;
  initialPageNumber: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialSearchTerm: string;
  wardId?: number | string;
  propertyNo?: string;
  error?: string;
}

const Amenities = ({
  initialData,
  initialTotalCount,
  initialPageNumber,
  initialPageSize,
  initialTotalPages,
  initialSearchTerm,
  wardId = '',
  propertyNo = '',
  error,
}: AmenitiesProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const activeTab = searchParams.get('subTab') || 'rateable';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';

  // Column filters
  const { activeFilters, handleFilterChange, fetchFilterOptions } = useColumnFilters({
    wardId,
    propertyNo,
  });

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const updateQueryParams = useCallback((newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [pathname, router, searchParams]);

  const handleRowClick = useCallback((row: Record<string, unknown>) => {
    const rowId = String(row.id || row.propertyId || 'new');
    router.push(`${pathname}/edit/${rowId}`);
  }, [pathname, router]);

  const handleSort = useCallback((columnKey: string) => {
    const nextSortOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    updateQueryParams({ sortBy: columnKey, sortOrder: nextSortOrder, pageNumber: 1 });
  }, [sortBy, sortOrder, updateQueryParams]);

  const tAqc = useTranslations("appartmentQC");
  const columns = useMemo(() => getApartmentQCColumns('amenities', activeTab, tAqc, initialPageNumber, initialPageSize), [activeTab, tAqc, initialPageNumber, initialPageSize]);
  const transformedData = useMemo(() => transformApartmentData(initialData, 'amenities'), [initialData]);

  return (
    <div className="space-y-6">
      <CommonPropertyTable
        columns={columns} data={transformedData as Record<string, unknown>[]} title={tAqc("apartmentTabs.amenitiesTitle")} activeTab={activeTab}
        searchQuery={searchQuery} onSearchChange={(q) => { 
          const sanitized = q.replace(TEXT_SANITIZE, '');
          setSearchQuery(sanitized); 
          updateQueryParams({ searchTerm: sanitized, pageNumber: 1 }); 
        }}
        onRowClick={handleRowClick}
        loading={isPending} isAutoScrolling={isAutoScrolling} onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
        pageNumber={initialPageNumber} pageSize={initialPageSize} totalCount={initialTotalCount} totalPages={initialTotalPages}
        onPageChange={(p) => updateQueryParams({ pageNumber: p })} onPageSizeChange={(s) => updateQueryParams({ pageSize: s, pageNumber: 1 })}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onFetchFilterOptions={fetchFilterOptions}
      />
    </div>
  );
};

export default Amenities;
