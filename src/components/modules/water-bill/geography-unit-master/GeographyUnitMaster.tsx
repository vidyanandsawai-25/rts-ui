"use client";

import React, { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MapPinned, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { Button } from "@/components/common/ActionButton";
import type { GeographyUnit, GeographyUnitProps } from "@/types/geographyUnit.types";
import { deleteGeographyUnitAction } from "@/app/[locale]/water-bill/geography-unit-master/action";
import TableHeader from "@/components/common/TableHeader";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PageContainer, SearchInput, Select } from "@/components/common";
import { GeographyUserManualModal } from "../geography-shared/GeographyUserManualModal";
import { getGeographyUnitColumns } from "./GeographyUnitColumns";
import { useGeographyUnitSearch } from "@/hooks/geographyunitmaster/useGeographyUnitSearch";
import { useGeographyUnitPagination } from "@/hooks/geographyunitmaster/useGeographyUnitPagination";

/* ================= PAGE ================= */
export function GeographyUnitMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
}: GeographyUnitProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("geographyUnitMaster");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { confirm } = useConfirm();
  const [isPending, startTransition] = React.useTransition();

  const openUserManual = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("showUserManual", "true");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const { search, currentSearchTerm, handleSearchChange } = useGeographyUnitSearch({
    pageSize,
    locale,
    startTransition,
  });

  const { changePage, handlePageSizeChange, paginationInfo } = useGeographyUnitPagination({
    pageNumber,
    pageSize,
    totalCount,
    locale,
    currentSearchTerm,
    startTransition,
  });

  const columns = getGeographyUnitColumns(t);

  const handleEdit = useCallback(
    (row: GeographyUnit) => {
      startTransition(() => {
        router.push(`/${locale}/water-bill/geography-unit-master/edit/${row.id}`);
      });
    },
    [router, locale]
  );

  const handleDelete = useCallback(
    (row: GeographyUnit) => {
      confirm({
        variant: "delete",
        title: `${t("list.table.unitCode")}: ${row.geographyUnitCode}`,
        description: t("delete.confirmDescription"),
        meta: {
          name: row.geographyUnitName,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const result = await deleteGeographyUnitAction(fd);
          if (result.success) {
            toast.success(t("success.deleted", { code: row.geographyUnitCode }));
            startTransition(() => {
              router.refresh();
            });
          } else {
            let errorMessage = tCommon("errors.deleteError");

            if (result.statusCode === 409) {
              errorMessage = t("apiErrors.inUse");
            } else if (result.statusCode === 400) {
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

  const { start, end, total } = paginationInfo;
  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader
          title={t("list.title")}
          subtitle={t("list.subtitle")}
          icon={MapPinned}
          actionLabel={t("list.buttons.add")}
          onActionClick={() => {
            startTransition(() => {
              router.push(`/${locale}/water-bill/geography-unit-master/add`);
            });
          }}
          rightContent={
            <div
              className={
                locale === "en"
                  ? "flex items-center gap-2 w-[27rem] max-[899px]:w-full justify-end"
                  : "flex items-center gap-2 w-full justify-end"
              }
            >
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder={t("list.filters.search")}
                className="mb-0 w-full text-gray-900"
              />
              <Button variant="secondary" size="sm" icon={BookOpen} onClick={openUserManual}>
                {tCommon("buttons.userManual")}
              </Button>
            </div>
          }
        />
        <MasterTable<GeographyUnit>
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
              <EditButton aria-label={tCommon("table.actions.edit")} onClick={() => handleEdit(row)} />
              <DeleteButton aria-label={tCommon("table.actions.delete")} onClick={() => handleDelete(row)} />
            </>
          )}
          actionLabel={tCommon("table.columns.actions")}
          paginationConfig={{ enabled: true, showPageSizeSelector: false }}
          footerLeftContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {start} {tCommon("table.to")} {end} {tCommon("table.of")} {total}{" "}
                {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
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
          getRowKey={(row) => String(row.id)}
        />
      </div>
      <GeographyUserManualModal />
    </PageContainer>
  );
}
