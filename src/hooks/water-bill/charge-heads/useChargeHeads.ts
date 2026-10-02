import { useMemo, useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast, useConfirm } from "@/components/common";
import { useDebounce } from "@/hooks/useDebounce";
import { getChargeHeadColumns } from "@/components/modules/water-bill/charge-heads/chargeHeadColumns";
import { getChargeHeadsUrl } from "@/constants/waterBillRoutes";
import type {
  ChargeHead,
  CreateChargeHeadDto,
  UseChargeHeadsProps,
  ChargeHeadFormState,
} from "@/types/waterBill/chargeHeads.types";

export function useChargeHeads({
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
}: UseChargeHeadsProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const toast = useToast();
  const t = useTranslations("chargeHeads");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeDrawer, setActiveDrawer] = useState<"add" | "edit" | null>(drawer);

  const [prevDrawer, setPrevDrawer] = useState(drawer);
  if (drawer !== prevDrawer) {
    setPrevDrawer(drawer);
    setActiveDrawer(drawer);
  }

  const [editingData, setEditingData] = useState<ChargeHead | null>(initialEditingData);
  const [prevInitialEditingData, setPrevInitialEditingData] = useState(initialEditingData);

  if (initialEditingData !== prevInitialEditingData) {
    setPrevInitialEditingData(initialEditingData);
    if (initialEditingData) {
      setEditingData(initialEditingData);
    }
  }

  const [search, setSearch] = useState(initialSearchTerm || "");
  const debouncedSearch = useDebounce(search, 1000);
  const isFirstMount = useRef(true);

  const [sortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder] = useState<"asc" | "desc" | undefined>(initialSortOrder);

  // Server data is the single source of truth - no stale row merge
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

      if (newSearch) params.set("searchTerm", newSearch);

      const activeSortBy = newSortBy !== undefined ? newSortBy : sortBy;
      const activeSortOrder =
        newSortOrder !== undefined ? newSortOrder : sortOrder;

      if (activeSortBy) params.set("sortBy", activeSortBy);
      if (activeSortOrder) params.set("sortOrder", activeSortOrder);

      startTransition(() => {
        router.push(getChargeHeadsUrl(locale, `?${params.toString()}`));
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
    const currentTrimmed = (initialSearchTerm || "").trim();

    if (trimmedDebounced !== currentTrimmed) {
      navigateWithParams(
        1,
        pageSize,
        trimmedDebounced || undefined
      );
    }
  }, [
    debouncedSearch,
    initialSearchTerm,
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

  const columns = useMemo(
    () => getChargeHeadColumns(t, tCommon),
    [t, tCommon]
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
    setActiveDrawer("add");
    setEditingData(null);

    startTransition(() => {
      router.push(getChargeHeadsUrl(locale, "/add"));
    });
  };

  const handleEdit = (row: ChargeHead) => {
    setActiveDrawer("edit");
    setEditingData(row);

    startTransition(() => {
      router.push(getChargeHeadsUrl(locale, `/edit/${row.id}`));
    });
  };

  const handleFormClose = () => {
    setActiveDrawer(null);
    setEditingData(null);

    startTransition(() => {
      router.push(getChargeHeadsUrl(locale));
    });
  };

  const handleFormSubmit = async (data: CreateChargeHeadDto) => {
    setIsSubmitting(true);

    const activeMode = activeDrawer || drawer;
    const currentEdit = editingData || initialEditingData;

    try {
      let result: ChargeHeadFormState;

      if (activeMode === "edit" && currentEdit?.id && updateAction) {
        result = await updateAction(
          currentEdit.id,
          { success: false },
          data
        );
      } else if (createAction) {
        result = await createAction(
          { success: false },
          data
        );
      } else {
        throw new Error(t("errors.noMutationAction"));
      }

      if (result.success) {
        toast.success(
          result.message ||
          (activeMode === "edit"
            ? t("messages.updateSuccess")
            : t("messages.createSuccess"))
        );

        setActiveDrawer(null);
        setEditingData(null);

        startTransition(() => {
          router.push(getChargeHeadsUrl(locale));
          router.refresh();
        });
      } else {
        toast.error(
          result.message || tCommon("errors.unexpectedError")
        );
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : tCommon("errors.unexpectedError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (row: ChargeHead) => {
    confirm({
      variant: "delete",
      title: t("confirm.deleteTitle"),
      description: t("confirm.deleteDescription"),
      meta: { name: row.name, id: row.id },

      onConfirm: async () => {
        if (!deleteAction) {
          toast.error(t("errors.noDeleteAction"));
          return;
        }

        try {
          const res = await deleteAction(row.id);
          if (res.success) {
            toast.success(res.message || t("messages.deleteSuccess"));
            startTransition(() => {
              router.refresh();
            });
          } else {
            toast.error(res.message || t("errors.deleteFailed"));
          }
        } catch (err: unknown) {
          toast.error(
            err instanceof Error ? err.message : t("errors.deleteFailed")
          );
        }
      },
    });
  };

  return {
    search,
    records,
    columns,
    isPending,
    isSubmitting,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    activeDrawer,
    editingData,
    handleSearchChange,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormClose,
    handleFormSubmit,
  };
}