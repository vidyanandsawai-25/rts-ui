import { useMemo, useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast, useConfirm } from "@/components/common";
import { useDebounce } from "@/hooks/useDebounce";
import { getTariffColumns } from "@/components/modules/water-bill/tariff-workbench/tariffColumns";
import { getTariffWorkbenchUrl } from "@/constants/waterBillRoutes";
import type {
  TariffWorkbench as TariffWorkbenchType,
  CreateTariffWorkbenchDto,
  TariffWorkbenchFormState,
  UseTariffWorkbenchProps,
} from "@/types/waterBill/tariffWorkbench.types";

export type { UseTariffWorkbenchProps };

export function useTariffWorkbench({
  pagedData,
  initialData,
  locale,
  drawer = null,
  initialEditingData = null,
  initialSortBy,
  initialSortOrder,
  initialSearchTerm,
  createAction,
  updateAction,
  deleteAction,
}: UseTariffWorkbenchProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("tariffWorkbench");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState(initialSearchTerm || "");
  const [prevInitialSearchTerm, setPrevInitialSearchTerm] = useState(initialSearchTerm);
  const debouncedSearch = useDebounce(search, 1000);
  const isFirstMount = useRef(true);
  const lastNavigatedSearchRef = useRef((initialSearchTerm || "").trim());

  if (initialSearchTerm !== prevInitialSearchTerm) {
    setPrevInitialSearchTerm(initialSearchTerm);
    setSearch(initialSearchTerm || "");
  }

  useEffect(() => {
    lastNavigatedSearchRef.current = (initialSearchTerm || "").trim();
  }, [initialSearchTerm]);

  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    initialSortOrder
  );

  // Server data is single source of truth - no stale row merge
  const records = useMemo(
    () => pagedData?.items ?? initialData ?? [],
    [pagedData, initialData]
  );

  const pageNumber = pagedData?.pageNumber ?? 1;
  const pageSize = pagedData?.pageSize ?? 10;
  const totalCount = pagedData?.totalCount ?? records.length;

  const totalPages =
    pagedData?.totalPages && pagedData.totalPages > 0
      ? pagedData.totalPages
      : Math.ceil(totalCount / (pageSize || 1)) || 1;

  const navigateWithParams = useCallback(
    (
      newPage: number,
      newPageSize: number,
      newSearch?: string,
      newSortBy?: string,
      newSortOrder?: "asc" | "desc"
    ) => {
      const params = new URLSearchParams();

      params.set("pageNumber", String(newPage));
      params.set("pageSize", String(newPageSize));

      if (newSearch) {
        params.set("searchTerm", newSearch);
      }

      const activeSortBy =
        newSortBy !== undefined ? newSortBy : sortBy;

      const activeSortOrder =
        newSortOrder !== undefined
          ? newSortOrder
          : sortOrder;

      if (activeSortBy) {
        params.set("sortBy", activeSortBy);
      }

      if (activeSortOrder) {
        params.set("sortOrder", activeSortOrder);
      }

      startTransition(() => {
        router.push(getTariffWorkbenchUrl(locale, `?${params.toString()}`));
      });
    },
    [locale, router, sortBy, sortOrder]
  );

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const trimmedDebounced = debouncedSearch.trim();

    if (trimmedDebounced !== lastNavigatedSearchRef.current) {
      lastNavigatedSearchRef.current = trimmedDebounced;
      navigateWithParams(
        1,
        pageSize,
        trimmedDebounced || undefined
      );
    }
  }, [
    debouncedSearch,
    navigateWithParams,
    pageSize,
  ]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchSubmit = () => {
    const trimmedSearch = search.trim();

    navigateWithParams(
      1,
      pageSize,
      trimmedSearch || undefined
    );
  };

  const handleSort = useCallback(
    (key: string) => {
      const nextOrder: "asc" | "desc" =
        sortBy === key && sortOrder === "asc"
          ? "desc"
          : "asc";

      setSortBy(key);
      setSortOrder(nextOrder);

      navigateWithParams(
        1,
        pageSize,
        search.trim() || undefined,
        key,
        nextOrder
      );
    },
    [
      navigateWithParams,
      pageSize,
      search,
      sortBy,
      sortOrder,
    ]
  );

  const columns = useMemo(
    () =>
      getTariffColumns(
        t,
        tCommon,
        sortBy,
        sortOrder,
        handleSort
      ),
    [t, tCommon, sortBy, sortOrder, handleSort]
  );

  const handlePageChange = (p: number) => {
    navigateWithParams(
      p,
      pageSize,
      search.trim() || undefined
    );
  };

  const handlePageSizeChange = (size: number) => {
    navigateWithParams(
      1,
      size,
      search.trim() || undefined
    );
  };

  const handleAdd = () => {
    router.push(getTariffWorkbenchUrl(locale, "/add"));
  };

  const handleEdit = (row: TariffWorkbenchType) => {
    router.push(getTariffWorkbenchUrl(locale, `/edit/${row.id}`));
  };

  const handleFormClose = () => {
    router.push(getTariffWorkbenchUrl(locale));
  };

  const handleFormSubmit = async (
    data: CreateTariffWorkbenchDto
  ) => {
    setIsSubmitting(true);

    try {
      let result: TariffWorkbenchFormState;

      if (
        drawer === "edit" &&
        initialEditingData?.id &&
        updateAction
      ) {
        result = await updateAction(
          initialEditingData.id,
          { success: false },
          data
        );
      } else if (createAction) {
        result = await createAction(
          { success: false },
          data
        );
      } else {
        throw new Error(
          t("errors.noMutationAction")
        );
      }

      if (result.success) {
        toast.success(
          result.message ||
          (drawer === "edit"
            ? t("messages.updateSuccess")
            : t("messages.createSuccess"))
        );

        router.push(getTariffWorkbenchUrl(locale));
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(
          result.message ||
            tCommon("errors.unexpectedError")
        );
      }
    } catch {
      toast.error(
        tCommon("errors.unexpectedError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (
    row: TariffWorkbenchType
  ) => {
    confirm({
      variant: "delete",
      title: t("confirm.deleteTitle"),
      description: t("confirm.deleteDescription"),
      meta: {
        name: row.tariffCode || row.tariffName,
        id: row.id,
      },

      onConfirm: async () => {
        if (!deleteAction) {
          toast.error(
            t("errors.noDeleteAction")
          );
          return;
        }

        try {
          const result = await deleteAction(row.id);

          if (result.success) {
            toast.success(
              result.message || t("messages.deleteSuccess")
            );
            startTransition(() => {
              router.refresh();
            });
          } else {
            toast.error(
              result.message ||
                tCommon("errors.unexpectedError")
            );
          }
        } catch {
          toast.error(
            tCommon("errors.unexpectedError")
          );
        }
      },
    });
  };

  return {
    t,
    tCommon,
    search,
    records,
    columns,
    isPending,
    isSubmitting,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    handleSearchChange,
    handleSearchSubmit,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormClose,
    handleFormSubmit,
  };
}