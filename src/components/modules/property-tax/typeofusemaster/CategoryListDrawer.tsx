"use client";
import { useState, useMemo, useTransition } from "react";
import { AddButton, EditButton, DeleteButton } from "@/components/common";
import { Drawer } from "@/components/common/Drawer";
import { Table } from "@/components/common/Table";
import { SearchInput } from "@/components/common/SearchInput";
import type { TypeOfUseCategory } from "@/types/typeOfUse.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { deleteTypeOfUseCategory } from "@/app/[locale]/property-tax/typeofusemaster/actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderHeart } from "lucide-react";
import type { TableColumn } from "@/types/common.types";
import { useTranslations, useLocale } from "next-intl";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";

interface CategoryListDrawerProps {
  categories: TypeOfUseCategory[];
}

export default function CategoryListDrawer({ categories }: CategoryListDrawerProps) {
  const t = useTranslations('typeofusemaster');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { confirm } = useConfirm();
  
  const initialSearchTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  useSearchNavigation({
    search: searchTerm,
    currentSearchTerm: initialSearchTerm,
    pageSize: 10,
    locale,
    basePath: "/property-tax/typeofusemaster/category",
    startTransition,
    debounceMs: 500,
    extraParams: {},
  });

  const handleDelete = (category: TypeOfUseCategory) => {
    confirm({
      variant: "delete",
      title: t("messages.deleteConfirmation"),
      meta: { name: category.typeOfUseCategoryName },
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await deleteTypeOfUseCategory(category.id);
          if (result.success) {
            toast.success(t("category.messages.categoryDeleted"));
            router.refresh();
          } else {
            toast.error(result.message || t("category.messages.deleteFailed"));
          }
        } catch {
          toast.error(t("category.messages.deleteFailed"));
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const columns = useMemo<TableColumn<TypeOfUseCategory>[]>(
    () => [
      {
        key: "typeOfUseCategoryCode",
        label: t("category.fields.categoryCode"),
      },
      {
        key: "typeOfUseCategoryName",
        label: t("category.fields.categoryName"),
      },
      {
        key: "isActive",
        label: t("category.fields.status"),
        render: (value) => (
          <StatusBadge value={value ? "Active" : "Inactive"} />
        ),
      },
      {
        key: "actions",
        label: t("table.columns.actions"),
        render: (_, row) => (
          <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
            <EditButton
              size="sm"
              title={t("buttons.edit") + " " + t("category.title")}
              onClick={() => router.push(`/property-tax/typeofusemaster/category/edit/${row.id}`)}
            />
            <DeleteButton
              size="sm"
              title={t("buttons.delete") + " " + t("category.title")}
              onClick={() => handleDelete(row)}
              disabled={isDeleting}
            />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, isDeleting]
  );

  return (
    <Drawer
      open
      onClose={() => router.push("/property-tax/typeofusemaster")}
      className="border-l-4 border-[#4F6A94]"
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <FolderHeart size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {t("category.title")}
            </div>
            <div className="text-sm text-slate-500">
              {t("category.searchPlaceholder")}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-5 bg-[#F8FAFF] min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("category.searchPlaceholder")}
              className="mb-0 text-gray-700 w-full"
            />
          </div>
          <AddButton
            size="md"
            label={t("category.addNew")}
            onClick={() => router.push("/property-tax/typeofusemaster/category/add")}
          />
        </div>

        <div className="rounded-xl border border-[#DCEAFF] bg-white shadow-sm overflow-hidden">
          <Table
            data={categories}
            columns={columns}
            emptyMessage={t("category.noCategories")}
          />
        </div>
      </div>
    </Drawer>
  );
}
