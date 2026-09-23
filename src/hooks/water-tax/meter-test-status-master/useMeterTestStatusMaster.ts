"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { MeterTestStatus, MeterTestStatusFormModel, MeterTestStatusProps } from "@/types/water-bill/meter-test-status-master.types";
import { getMeterTestStatusColumns } from "@/components/modules/water-tax/meter-test-status-master/MeterTestStatusColumns";
import { createMeterTestStatusAction, updateMeterTestStatusAction, deleteMeterTestStatusAction } from "@/app/[locale]/water-bill/meterteststatusmaster/action";

import { useTranslations } from "next-intl";
import { TEXT_SANITIZE } from "@/lib/utils/validation-rules";

export function useMeterTestStatusMaster({
  pageSize,
  sortBy,
  sortOrder,
}: MeterTestStatusProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("meterTestStatusMaster");

  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MeterTestStatus | null>(null);

  const handleSort = useCallback(
    (columnKey: string) => {
      let newSortOrder = "asc";
      if (sortBy === columnKey) {
        newSortOrder = sortOrder === "asc" ? "desc" : "asc";
      }
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", String(pageSize));
      if (searchTerm) params.set("q", searchTerm);
      params.set("sortBy", columnKey);
      params.set("sortOrder", newSortOrder);

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [sortBy, sortOrder, pageSize, searchTerm, router]
  );

  const columns = getMeterTestStatusColumns(sortBy, sortOrder, handleSort, t);

  const handleSearchChange = useCallback((val: string) => {
    const sanitized = val.replace(TEXT_SANITIZE, "");
    setSearchTerm(sanitized);
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    if (sanitized) params.set("q", sanitized);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [pageSize, sortBy, sortOrder, router]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    if (searchTerm) params.set("q", searchTerm);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [pageSize, searchTerm, sortBy, sortOrder, router]);

  const handlePageSizeChange = useCallback((newSize: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", newSize);
    if (searchTerm) params.set("q", searchTerm);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [searchTerm, sortBy, sortOrder, router]);

  const handleOpenAdd = useCallback(() => {
    setEditingItem(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: MeterTestStatus) => {
    setEditingItem(item);
    setDrawerOpen(true);
  }, []);

  const mapApiError = useCallback(
    (res: { statusCode?: number; message?: string }) => {
      const code = res.statusCode ?? 0;
      const msg = (res.message || "").toLowerCase();

      if (
        code === 409 ||
        msg.includes("duplicate") ||
        msg.includes("already exists") ||
        msg.includes("already exist")
      ) {
        return t("messages.duplicateRecord");
      }
      if (code === 404) {
        return t("messages.notFound");
      }
      if (code >= 500) {
        return t("messages.operationFailed");
      }
      return res.message || t("messages.operationFailed");
    },
    [t]
  );

  const handleFormSubmit = useCallback(async (formData: MeterTestStatusFormModel) => {
    let res;
    if (editingItem && editingItem.id > 0) {
      res = await updateMeterTestStatusAction(formData);
    } else {
      res = await createMeterTestStatusAction(formData);
    }

    if (res.success) {
      toast.success(editingItem ? t("messages.updateSuccess") : t("messages.createSuccess"));
      startTransition(() => {
        router.refresh();
      });
    } else {
      const errorMsg = mapApiError(res);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  }, [editingItem, router, t, mapApiError]);

  const handleDelete = useCallback((row: MeterTestStatus) => {
    const codeVal = row.meterTestStatusCode || row.code || "";
    confirm({
      variant: "delete",
      title: t("confirm.deleteTitle", { code: codeVal }),
      description: t("confirm.deleteDescription"),
      meta: {
        name: row.meterTestStatus,
      },
      onConfirm: async () => {
        const res = await deleteMeterTestStatusAction(row.id);
        if (res.success) {
          toast.success(t("messages.deleteSuccess"));
          startTransition(() => {
            router.refresh();
          });
        } else {
          toast.error(res.message || t("messages.deleteFailed"));
        }
      },
    });
  }, [confirm, router, t]);

  return {
    isPending,
    searchTerm,
    drawerOpen,
    editingItem,
    columns,
    setDrawerOpen,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleOpenAdd,
    handleOpenEdit,
    handleFormSubmit,
    handleDelete,
  };
}
