
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import TableHeader from "@/components/common/TableHeader";
import type { TaxZone, TaxZoneMasterProps } from "@/types/taxzone.types";
import { deleteTaxZoneAction } from "@/app/[locale]/property-tax/taxzone/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput } from "@/components/common";
import { EditButton, DeleteButton, AddButton } from "@/components/common/ActionButtons";
import { useTranslations, useLocale } from "next-intl";
import { getTaxZoneColumns } from "./TaxZoneColumn";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

export default function TaxZoneMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  search: initialSearch = "",
}: TaxZoneMasterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState(initialSearch);

  // const searchActive = search.trim().length > 0;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useTranslations("taxZone");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const normalizedData = useMemo(
    () => (data ?? []).map((x) => ({ ...x, status: x.isActive })),
    [data]
  );

  const columns = useMemo(() => getTaxZoneColumns(t), [t]);

  // Sync search state when initialSearch prop changes (e.g., browser back/forward navigation)
  useEffect(() => {
    // Only update if value has actually changed to prevent cascading renders
    if (search !== initialSearch) {
      setSearch(initialSearch);
      // Clear any pending debounce timer to prevent stale searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }
  }, [initialSearch, search]);

  // Cleanup timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /**
   * ✅ FRONTEND FILTER DISABLED
   * Backend already filtered data
   */

  const effectivePageNumber = pageNumber;
  const effectiveTotalCount = totalCount;
  const effectiveTotalPages = totalPages;


  const tableRows = normalizedData;

  /**
   * ✅ BACKEND PAGINATION
   */
  const changePage = (p: number) => {
    const trimmedSearch = search.trim();
    const url = trimmedSearch
      ? `/${locale}/property-tax/taxzone?page=${p}&pageSize=${pageSize}&search=${encodeURIComponent(trimmedSearch)}`
      : `/${locale}/property-tax/taxzone?page=${p}&pageSize=${pageSize}`;
    router.push(url);
  };

  const changePageSize = (size: number) => {
    const trimmedSearch = search.trim();
    const url = trimmedSearch
      ? `/${locale}/property-tax/taxzone?page=1&pageSize=${size}&search=${encodeURIComponent(trimmedSearch)}`
      : `/${locale}/property-tax/taxzone?page=1&pageSize=${size}`;
    router.push(url);
  };

  const handleSearchChange = (value: string) => {
    // Sanitize search input
    const sanitized = value.replace(TEXT_SANITIZE, "");
    setSearch(sanitized);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce URL update
    searchTimeoutRef.current = setTimeout(() => {
      const trimmedSearch = sanitized.trim();
      
      if (trimmedSearch) {
        // Navigate with search parameter
        router.push(
          `/${locale}/property-tax/taxzone?page=1&pageSize=${pageSize}&search=${encodeURIComponent(trimmedSearch)}`
        );
      } else {
        // Clear search from URL
        router.push(`/${locale}/property-tax/taxzone?page=1&pageSize=${pageSize}`);
      }
    }, 400);
  };

  const handleDelete = (row: TaxZone) => {
    confirm({
      variant: "delete",
      meta: {
        name: row.taxZoneType,
      },
      onConfirm: async () => {
        try {
          const fd = new FormData();
          fd.append("taxZoneId", String(row.taxZoneId));
          fd.append("locale", locale);
          await deleteTaxZoneAction(fd);

          toast.success(t("delete.success"));

          router.refresh();
        }
        catch (error) {
          toast.error(t("delete.error"));
          console.error(error);
        }
      },
    });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        
        <TableHeader
          title={t("list.title")}
          subtitle={t("list.subtitle")}
          icon={MapPin}
          rightContent={
            <div className="flex items-center gap-2 w-full justify-end">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("list.filters.search")}
                className="mb-0 w-full text-gray-900"
              />
              <AddButton
              size="sm"
                label={t("list.buttons.add")}
                onClick={() => router.push(`/${locale}/property-tax/taxzone/add`)}
              />
            </div>
          }
        />

        <MasterTable<TaxZone>
          columns={columns}
          data={tableRows}
          loading={false}
          pageNumber={effectivePageNumber}
          pageSize={pageSize}
          totalCount={effectiveTotalCount}
          totalPages={effectiveTotalPages}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          
          renderActions={(row) => (
            <>
              <EditButton
                aria-label={tCommon("table.actions.edit")}
                onClick={() =>
                  router.push(`/${locale}/property-tax/taxzone/edit/${row.taxZoneId}`)
                }
              />
              <DeleteButton aria-label={tCommon("table.actions.delete")} onClick={() => handleDelete(row)} />
            </>
          )}
          actionLabel={t("list.table.actions")}
          getRowKey={(row) => row.taxZoneId}
        />
      </div>
    </PageContainer>
  );
}

