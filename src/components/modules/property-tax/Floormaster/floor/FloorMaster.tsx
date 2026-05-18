"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Layers } from "lucide-react";

import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput, Select } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { TEXT_SANITIZE } from "@/lib/utils/validation";

import type { Floor, FloorMasterProps } from "@/types/floor.types";

import { deleteFloorAction } from "@/app/[locale]/property-tax/floormaster/actions";
import { floorColumns } from "./floorColumns";

/* ================= MAIN ================= */
export default function FloorMaster({
  floorPaged,
  sortBy,
  sortOrder,
}: Readonly<FloorMasterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("floor.floor");
  const tCommon = useTranslations("common");

  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();

  const {
    items: data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } = floorPaged;

  const currentSearchTerm = searchParams.get("q") || "";

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState(currentSearchTerm);
  const [prevSearch, setPrevSearch] = useState(currentSearchTerm);

  // Sync search state with URL
  if (currentSearchTerm !== prevSearch) {
    setPrevSearch(currentSearchTerm);
    setSearch(currentSearchTerm);
  }

  // Debounced search navigation
  useSearchNavigation({
    search,
    currentSearchTerm,
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/property-tax/floormaster/floor",
    startTransition,
  });

  const handleSearchChange = (value: string) => {
    // Sanitize search input to prevent special characters
    const sanitized = value.replace(TEXT_SANITIZE, "");
    setSearch(sanitized);
  };

  /* ================= URL BUILDER ================= */
  const buildUrl = useCallback(
    (
      page: number,
      size: number,
      searchTerm?: string,
      newSortBy?: string,
      newSortOrder?: string
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));

      if (searchTerm) params.set("q", searchTerm);
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder) params.set("sortOrder", newSortOrder);

      return `/${locale}/property-tax/floormaster/floor?${params.toString()}`;
    },
    [locale]
  );

  /* ================= SORTING ================= */
  const handleSort = useCallback(
    (columnKey: string) => {
      let newSortOrder: string = "asc";

      // Toggle sort order if clicking the same column
      if (sortBy === columnKey) {
        if (sortOrder === "asc") {
          newSortOrder = "desc";
        } else if (sortOrder === "desc") {
          // Reset to no sorting
          router.push(buildUrl(1, pageSize, currentSearchTerm));
          return;
        }
      }

      router.push(buildUrl(1, pageSize, currentSearchTerm, columnKey, newSortOrder));
    },
    [sortBy, sortOrder, router, buildUrl, pageSize, currentSearchTerm]
  );

  const columns = floorColumns(t, tCommon, sortBy, sortOrder, handleSort);

  /* ================= PAGINATION ================= */
  const changePage = (p: number) => {
    router.push(buildUrl(p, pageSize, currentSearchTerm, sortBy, sortOrder));
  };

  /* ================= EDIT ================= */
  const handleEdit = useCallback(
    (row: Floor) => {
      router.push(`/${locale}/property-tax/floormaster/floor/edit/${row.id}`);
    },
    [router, locale]
  );

  /* ================= DELETE ================= */
  const handleDelete = useCallback(
    (row: Floor) => {
      confirm({
        variant: "delete",
        title: `${t("table.columns.floorCode")}: ${row.floorCode}`,
        description: t("delete.confirmDescription"),
        meta: { name: row.description },

        onConfirm: async () => {
          const result = await deleteFloorAction(row.id);

          if (result.success) {
            toast.success(t("messages.deleteSuccess"));
            router.refresh();
          } else {
            let msg = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              msg = t("messages.deleteInUse");
            } else if (result.statusCode === 404) {
              msg = tCommon("errors.notFound");
            } else if (result.messageKey) {
              // Translate i18n key from server
              msg = t(result.messageKey);
            } else if (result.message) {
              // Display raw error message from API
              msg = result.message;
            }

            toast.error(msg);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );

  /* ================= FOOTER ================= */
  const start =
    totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <MasterTable<Floor>
        columns={columns}
        data={data}
        loading={isPending}
        height="lg"
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={changePage}
        renderActions={(row) => (
          <>
            <EditButton onClick={() => handleEdit(row)} />
            <DeleteButton onClick={() => handleDelete(row)} />
          </>
        )}

          actionLabel={tCommon("table.columns.actions")}

          paginationConfig={{ enabled: true, showPageSizeSelector: false }}

          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {totalCount} {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e) => {
                    startTransition(() => {
                      router.push(
                        buildUrl(1, Number(e.target.value), currentSearchTerm, sortBy, sortOrder)
                      );
                    });
                  }}
                  options={[10, 20, 30, 50].map((s) => ({
                    label: String(s),
                    value: String(s),
                  }))}
                  selectSize="sm"
                  className="w-20"
                  ariaLabel={tCommon("table.rowsPerPage") || "Rows per page"}
                />
              </div>
            </div>
          }

          getRowKey={(row) => String(row.id)}
        />
      </div>
    </PageContainer>
  );
}