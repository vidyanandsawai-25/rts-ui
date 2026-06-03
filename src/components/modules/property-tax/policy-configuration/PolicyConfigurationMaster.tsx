"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MasterTable } from "@/components/common/MasterTable";
import type { PolicyConfiguration, PolicyConfigurationMasterProps } from "@/types/policy-configuration.types";
import { deletePolicyConfigurationAction } from "@/app/[locale]/property-tax/policy-configuration/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { EditButton, DeleteButton } from "@/components/common/ActionButtons";
import { useTranslations, useLocale } from "next-intl";
import { getPolicyConfigurationColumns } from "./PolicyConfigurationColumn";
import { PageContainer, SearchInput } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { TEXT_SANITIZE } from "@/lib/utils/validation-rules";

export default function PolicyConfigurationMaster({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  search = "",
}: PolicyConfigurationMasterProps) {
  const router = useRouter();
  const { confirm } = useConfirm();

  const t = useTranslations("policyConfiguration");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const base = `/${locale}/property-tax/policy-configuration`;

  // Search input state
  const [searchTermState, setSearchTermState] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);

  // Sync search state with URL when search changes (Avoid useEffect to prevent cascading renders)
  if (search !== prevSearch) {
    setSearchTermState(search);
    setPrevSearch(search);
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTermState === search) return;
      
      const trimmed = searchTermState.trim();
      const url = trimmed
        ? `${base}?page=1&pageSize=${pageSize}&search=${encodeURIComponent(trimmed)}`
        : `${base}?page=1&pageSize=${pageSize}`;
      router.push(url);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTermState, search, base, pageSize, router]);

  const normalizedData = useMemo(
    () => (data ?? []).map((x) => ({ ...x, status: x.isActive })),
    [data]
  );

  const columns = useMemo(() => getPolicyConfigurationColumns(t), [t]);

  /**
   * ✅ BACKEND PAGINATION
   */
  const changePage = (p: number) => {
    const trimmedSearch = search.trim();
    const url = trimmedSearch
      ? `${base}?page=${p}&pageSize=${pageSize}&search=${encodeURIComponent(trimmedSearch)}`
      : `${base}?page=${p}&pageSize=${pageSize}`;
    router.push(url);
  };

  const changePageSize = (size: number) => {
    const trimmedSearch = search.trim();
    const url = trimmedSearch
      ? `${base}?page=1&pageSize=${size}&search=${encodeURIComponent(trimmedSearch)}`
      : `${base}?page=1&pageSize=${size}`;
    router.push(url);
  };

  const handleDelete = (row: PolicyConfiguration) => {
    confirm({
      variant: "delete",
      meta: {
        name: row.displayName,
      },
      onConfirm: async () => {
        try {
          const fd = new FormData();
          fd.append("id", String(row.id));
          fd.append("locale", locale);
          await deletePolicyConfigurationAction(fd);

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
          icon="settings"
          actionLabel={t("list.buttons.add")}
          onActionClick={() => {
            router.push(`${base}/add`);
          }}
          rightContent={
            <div className="flex w-full justify-end">
              <SearchInput
                value={searchTermState}
                onChange={(value) => setSearchTermState(value.replace(TEXT_SANITIZE, ""))}
                placeholder={t("list.filters.search") || "Search Policy Configuration..."}
                className="mb-0 w-full text-gray-900"
              />
            </div>
          }
        />

        <MasterTable<PolicyConfiguration>
          columns={columns}
          data={normalizedData}
          loading={false}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          
          renderActions={(row) => (
            <>
              <EditButton
                aria-label={tCommon("table.actions.edit")}
                onClick={() =>
                  router.push(`${base}/edit/${row.id}`)
                }
              />
              <DeleteButton aria-label={tCommon("table.actions.delete")} onClick={() => handleDelete(row)} />
            </>
          )}
          actionLabel={t("list.table.actions")}
          getRowKey={(row) => row.id}
        />
      </div>
    </PageContainer>
  );
}
