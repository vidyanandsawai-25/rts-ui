"use client";

import { useEffect, useState, useCallback, useTransition, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import CommonPropertyTable from "./CommonPropertyTable";
import { toast } from "sonner";
import { ApartmentQCDetail } from "@/types/apartmentQC.types";
import { getApartmentQCColumns } from "./apartmentQC.columns";
import { transformApartmentData } from "./apartmentQC.utils";

interface ResidentialProps {
  initialData: ApartmentQCDetail[];
  initialTotalCount: number;
  initialPageNumber: number;
  initialPageSize: number;
  initialTotalPages: number;
  initialSearchTerm: string;
  error?: string;
}

const Residential = ({
  initialData,
  initialTotalCount,
  initialPageNumber,
  initialPageSize,
  initialTotalPages,
  initialSearchTerm,
  error,
}: ResidentialProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const activeTab = searchParams.get("subTab") || "rateable";

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

  const tAqc = useTranslations("appartmentQC");
  const columns = useMemo(() => getApartmentQCColumns('residential', activeTab, tAqc), [activeTab, tAqc]);
  const transformedData = useMemo(() => transformApartmentData(initialData, 'residential'), [initialData]);

  return (
    <div className="p-4">
      <CommonPropertyTable
        columns={columns} data={transformedData} title={tAqc("apartmentTabs.residentialTitle")} activeTab={activeTab}
        searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); updateQueryParams({ searchTerm: q, pageNumber: 1 }); }}
        onRowClick={(row) => router.push(`/property-tax/appartmentQC/residential/edit/${row.id}`)}
        loading={isPending} isAutoScrolling={isAutoScrolling} onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
        pageNumber={initialPageNumber} pageSize={initialPageSize} totalCount={initialTotalCount} totalPages={initialTotalPages}
        onPageChange={(p) => updateQueryParams({ pageNumber: p })} onPageSizeChange={(s) => updateQueryParams({ pageSize: s, pageNumber: 1 })}
      />
    </div>
  );
};

export default Residential;
