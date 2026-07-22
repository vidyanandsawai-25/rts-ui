"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { useToast } from "@/components/common";
import type { GstMasterProps, GstMaster } from "@/types/asset-masters/gst-master.types";
import { getGstMasterColumns } from "@/components/modules/assets/configuration/master-data/gst-master/GstMasterColumns";
import { deleteGstMasterAction } from "@/app/[locale]/assets/configuration/master-data/gst-master/action";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

export function useGstMasterList({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  sortBy,
  sortOrder,
  searchTerm,
}: GstMasterProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("gstMaster");
  const tCommon = useTranslations("common");
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [search, setSearch] = React.useState(searchTerm ?? "");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm ?? "");
    }, 0);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const pathname = usePathname();
  const isSubRoute = pathname !== `/${locale}/assets/configuration/master-data/gst-master`.replace(/\/+/g, "/");

  useSearchNavigation({
    search,
    currentSearchTerm: searchTerm ?? "",
    pageSize,
    locale,
    sortBy,
    sortOrder,
    basePath: "/assets/configuration/master-data/gst-master",
    startTransition: isSubRoute ? () => {} : startTransition,
  });

  React.useEffect(() => {
    const allowedSizes = [10, 20, 30, 40, 50];
    let hasChanged = false;
    const params = new URLSearchParams(window.location.search);

    if (!allowedSizes.includes(pageSize)) {
      const fallbackSize = allowedSizes.reduce((prev, curr) =>
        Math.abs(curr - pageSize) < Math.abs(prev - pageSize) ? curr : prev
      );
      params.set("pageSize", String(fallbackSize));
      hasChanged = true;
    }

    const rawPageStr = params.get("page");
    if (rawPageStr !== null) {
      const rawPage = parseInt(rawPageStr, 10);
      if (!Number.isFinite(rawPage) || rawPage < 1) {
        params.set("page", "1");
        hasChanged = true;
      } else if (totalPages > 0 && rawPage > totalPages) {
        params.set("page", String(totalPages));
        hasChanged = true;
      }
    }

    if (hasChanged) {
      router.replace(`/${locale}/assets/configuration/master-data/gst-master?${params.toString()}`);
    }
  }, [pageNumber, pageSize, totalPages, locale, router]);

  const buildUrl = React.useCallback(
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
      if (searchTerm?.trim()) params.set("q", searchTerm.trim());
      if (newSortBy) params.set("sortBy", newSortBy);
      if (newSortOrder) params.set("sortOrder", newSortOrder);

      return `/${locale}/assets/configuration/master-data/gst-master?${params.toString()}`;
    },
    [locale]
  );

  const handleSort = React.useCallback(
    (columnKey: string) => {
      startTransition(() => {
        const nextOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
        router.push(buildUrl(pageNumber, pageSize, search, columnKey, nextOrder));
      });
    },
    [sortBy, sortOrder, pageNumber, pageSize, search, buildUrl, router]
  );

  const columns = React.useMemo(
    () =>
      getGstMasterColumns({
        t,
        tCommon,
        sortBy,
        sortOrder,
        onSort: handleSort,
      }),
    [t, tCommon, sortBy, sortOrder, handleSort]
  );

  const changePage = React.useCallback(
    (p: number) => {
      startTransition(() => {
        router.push(buildUrl(p, pageSize, search, sortBy, sortOrder));
      });
    },
    [pageSize, search, sortBy, sortOrder, buildUrl, router]
  );

  const changePageSize = React.useCallback(
    (size: number) => {
      startTransition(() => {
        router.push(buildUrl(1, size, search, sortBy, sortOrder));
      });
    },
    [search, sortBy, sortOrder, buildUrl, router]
  );

  const handleDelete = React.useCallback(
    (row: GstMaster) => {
      confirm({
        variant: "delete",
        title: `${t("taxCode")}: ${row.taxCode}`,
        description: `${t("deleteConfirm")}`,
        meta: {
          name: row.taxName,
        },
        onConfirm: async () => {
          const fd = new FormData();
          fd.append("id", String(row.id));
          const res = await deleteGstMasterAction(fd);
          if (res?.success) {
            toast.success(t("form.messages.deleteSuccess"));
            startTransition(() => router.refresh());
          } else {
            toast.error(res?.message || tCommon("errors.deleteError"));
          }
        },
      });
    },
    [confirm, router, t, tCommon, toast]
  );

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  return {
    router,
    locale,
    t,
    tCommon,
    isPending,
    search,
    setSearch,
    columns,
    changePage,
    changePageSize,
    handleDelete,
    start,
    end,
  };
}
