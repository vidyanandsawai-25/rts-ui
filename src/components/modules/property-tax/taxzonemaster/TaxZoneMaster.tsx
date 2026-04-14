
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import TableHeader from "@/components/common/TableHeader";
import type { TaxZone } from "@/types/taxzone.types";
import { deleteTaxZoneAction } from "@/app/[locale]/property-tax/taxzone/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput } from "@/components/common";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useTranslations, useLocale } from "next-intl";
import { getTaxZoneColumns } from "./columns";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

export interface TaxZoneMasterProps {
  data: TaxZone[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export default function TaxZoneMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
}: TaxZoneMasterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();

  // Satisfy TypeScript's noUnusedLocals check by explicitly referencing JSX components
  void SearchInput; void EditButton; void DeleteButton;

  // const [search, setSearch] = useState("");
  //   const searchFromUrl =
  //   typeof window !== "undefined"
  //     ? new URLSearchParams(window.location.search).get("search") ?? ""
  //     : "";

  // const [search, setSearch] = useState(searchFromUrl);
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("search") ?? "";
  });

  const searchActive = search.trim().length > 0;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [, setAllRecords] = useState<TaxZone[] | null>(null);
  const [loadingAll] = useState(false);

  const t = useTranslations("taxZone");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const normalizedData = useMemo(
    () => (data ?? []).map((x) => ({ ...x, status: x.isActive })),
    [data]
  );

  const columns = useMemo(() => getTaxZoneColumns(t), [t]);

  // const sourceForFilter = useMemo(
  //   () => (searchActive ? allRecords ?? [] : normalizedData),
  //   [searchActive, allRecords, normalizedData]
  // );


  /**
   * ✅ FRONTEND FILTER DISABLED
   * Backend already filtered data
   */

  // const effectivePageNumber = searchActive ? searchPage : pageNumber;
  // const effectiveTotalCount = searchActive ? filteredAll.length : totalCount;
  // const effectiveTotalPages = searchActive
  //   ? Math.max(1, Math.ceil(filteredAll.length / pageSize))
  //   : totalPages;
  const effectivePageNumber = pageNumber;
  const effectiveTotalCount = totalCount;
  const effectiveTotalPages = totalPages;


  // const tableRows = useMemo(() => {
  //   if (!searchActive) return normalizedData;
  //   const start = (effectivePageNumber - 1) * pageSize;
  //   return filteredAll.slice(start, start + pageSize);
  // }, [searchActive, normalizedData, filteredAll, effectivePageNumber, pageSize]);

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
        type: "Tax Zone",
      },
      onConfirm: async () => {
        try {
          const fd = new FormData();
          fd.append("taxZoneId", String(row.taxZoneId));
          await deleteTaxZoneAction(fd);

          toast.success(t("delete.success"));
          setAllRecords(null);
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
        {/* <TableHeader
          title="Tax Zone Master"
          subtitle="Manage zones and their types"
          icon={MapPin}
          actionLabel="Add Zone"
          actionIcon={Plus}
          onActionClick={() => router.push("/taxzone/add")}
        /> */}
        <TableHeader
          title={t("list.title")}
          subtitle={t("list.subtitle")}
          icon={MapPin}
          actionLabel={t("list.buttons.add")}
          onActionClick={() => router.push(`/${locale}/property-tax/taxzone/add`)}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("list.filters.search")}
                className="mb-0 w-100 text-gray-900"
              />
            </div>
          }
        />

        {searchActive && (
          <div className="flex items-center justify-between bg-cyan-50 p-3 rounded-xl text-sm text-cyan-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {loadingAll
                ? "Searching..."
                //  : `Found ${effectiveTotalCount} records`}
                : `Found ${totalCount} records`}
            </div>
            {/* <button
              onClick={() => setSearch("")}
              className="font-medium hover:underline"
            >
              Clear
            </button> */}
            <button
              onClick={() => {
                setSearch("");
                // router.push(`/taxzone?page=1&pageSize=${pageSize}`);
                router.push(`/${locale}/property-tax/taxzone?page=1&pageSize=${pageSize}`);
              }}
              className="font-medium hover:underline"
            >
              {tCommon("buttons.clear")}
            </button>
          </div>
        )}

        <MasterTable<TaxZone>
          columns={columns}
          data={tableRows}
          loading={loadingAll}
          pageNumber={effectivePageNumber}
          pageSize={pageSize}
          totalCount={effectiveTotalCount}
          totalPages={effectiveTotalPages}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          // onEdit={(row) => router.push(`/taxzone/edit/${row.taxZoneNo}`)}
          renderActions={(row) => (
            <>
              <EditButton
                aria-label="Edit"
                onClick={() =>
                  router.push(`/${locale}/property-tax/taxzone/edit/${row.taxZoneId}`)
                }
              />
              <DeleteButton aria-label="Delete" onClick={() => handleDelete(row)} />
            </>
          )}
          actionLabel={t("list.table.actions")}
          getRowKey={(row) => row.taxZoneId}
        />
      </div>
    </PageContainer>
  );
}

