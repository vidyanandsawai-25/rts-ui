"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { HardHat } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import type { ConstructionType } from "@/types/construction.types";
import { deleteConstructionTypeAction } from "@/app/[locale]/property-tax/constructiontype/action";
import TableHeader from "@/components/common/TableHeader";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput, Select } from "@/components/common";
import { getConstructionTypeColumns } from "./ConstructionTypeColumns";
import { TEXT_SANITIZE } from "@/lib/utils/validation";



/* ================= PROPS ================= */
interface Props {
  data: ConstructionType[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/* ================= PAGE ================= */
export function ConstructionTypeMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
}: Props): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ===== TRANSLATIONS ===== */
  const t = useTranslations("construction.constructionType");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  /* ================= SEARCH ================= */
  const currentSearchTerm = searchParams.get("q") || "";
  const [search, setSearch] = useState(currentSearchTerm);
  const { confirm } = useConfirm();

  /* ================= URL BUILDER ================= */
  const buildUrl = React.useCallback(
    (page: number, size: number, searchTerm?: string) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));
      if (searchTerm) {
        params.set("q", searchTerm);
      }
      return `/${locale}/property-tax/constructiontype?${params.toString()}`;
    },
    [locale]
  );

  // Sync search state with URL on mount/navigation
  useEffect(() => {
    setSearch(currentSearchTerm);
  }, [currentSearchTerm]);

  // Debounced search - navigate to URL with search parameter
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
      router.push(`/${locale}/property-tax/constructiontype?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, pageSize, router, locale, currentSearchTerm]);

  /* ================= TABLE COLUMNS ================= */
  const columns = getConstructionTypeColumns(t);

  /* ================= PAGINATION ================= */
  const changePage = (p: number): void => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));

    if (currentSearchTerm) {
      params.set("q", currentSearchTerm);
    }

    router.push(`/${locale}/property-tax/constructiontype?${params.toString()}`);
  };

  const handleEdit = useCallback(
    (row: ConstructionType) => {
      router.push(`/${locale}/property-tax/constructiontype/edit/${row.constructionTypeId}`);
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: ConstructionType) => {
      confirm({
        variant: "delete",
        title: `${t("list.table.constructionCode")}: ${row.constructionCode}`,
        description: `${t("delete.confirmDescription")}`,
        meta: {

          name: row.description,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("constructionTypeId", String(row.constructionTypeId));

          const result = await deleteConstructionTypeAction(fd);

          if (result.success) {
            toast.success(
              t("success.deleted", { code: row.constructionCode })
            );
            router.refresh();
          } else {
            // Show appropriate error message based on status code
            let errorMessage = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              // Record linked with another record or in use
              errorMessage = t("apiErrors.inUse");
            } else if (result.statusCode === 400) {
              // Bad request / validation error
              errorMessage = t("apiErrors.validationError");
            } else if (result.statusCode === 404) {
              errorMessage = t("apiErrors.notFound");
            } else if (result.message) {
              errorMessage = result.message;
            }

            toast.error(errorMessage);
          }
        },
      });
    },
    [confirm, router, t, tCommon]
  );

  /* ================= UI ================= */
  // Footer values
  const start = totalCount === 0 ? 0 : ((pageNumber || 1) - 1) * (pageSize || 10) + 1;
  const end = Math.min(start + (pageSize || 10) - 1, totalCount);
  const total = totalCount || 0;

  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader
          title={t("list.title")}
          subtitle={t("list.subtitle")}
          icon={HardHat}
          actionLabel={t("list.buttons.add")}
          onActionClick={() => router.push(`/${locale}/property-tax/constructiontype/add`)}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={search}
                onChange={(value) => {
                  // Sanitize search input to prevent special characters
                  const sanitized = value.replace(TEXT_SANITIZE, "");
                  setSearch(sanitized);
                }}
                placeholder={t("list.filters.search") || "Search Construction Type..."}
                className="mb-0 w-100 text-gray-900"
              />
            </div>
          }
        />

        <MasterTable<ConstructionType>
          columns={columns}
          data={data}
          loading={false}
          height="lg"
          // Pagination handled internally by MasterTable
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}

          // Actions in last column
          renderActions={(row) => (
            <>
              <EditButton
                aria-label={tCommon("table.actions.edit")}
                onClick={() => handleEdit(row)}
              />
              <DeleteButton
                aria-label={tCommon("table.actions.delete")}
                onClick={() => handleDelete(row)}
              />
            </>
          )}
          actionLabel={tCommon("table.columns.actions")}


          paginationConfig={{ enabled: true, showPageSizeSelector: false }}

          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {total} {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(value) =>
                    router.push(
                      buildUrl(1, Number(value), currentSearchTerm)
                    )
                  }
                  options={[10, 20, 30, 40, 50].map((s) => ({
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

          getRowKey={(row) => String(row.constructionTypeId)}
        />
      </div>
    </PageContainer>
  );
}