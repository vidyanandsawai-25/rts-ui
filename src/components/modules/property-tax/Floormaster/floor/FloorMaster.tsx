
"use client";

import {
  useCallback,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useLocale,
  useTranslations,
} from "next-intl";
import { toast } from "sonner";
import { Select } from "@/components/common/select";
import { PageContainer } from "@/components/common/PageContainer";
import { MasterTable } from "@/components/common/MasterTable";
import { useConfirm } from "@/components/common/ConfirmProvider";

import type {
  Floor,
  FloorPagedResponse,
} from "@/types/floor.types";

import { deleteFloorAction } from "@/app/[locale]/property-tax/floormaster/actions";
import { DeleteButton, EditButton } from "@/components/common";
import { floorColumns } from "./columns";


/* ============================================================
   PROPS
============================================================ */

interface Props {
  floorPaged: FloorPagedResponse;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function FloorPage({
  floorPaged,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const t = useTranslations("floor.floor");

  const { confirm } = useConfirm();

  const {
    items: data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } = floorPaged;

  /* ============================================================
     URL BUILDER (DRY)
  ============================================================ */

  const buildUrl = useCallback(
    (page: number, size: number, query?: string) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(size));

      if (query?.trim()) {
        params.set("q", query.trim());
      }

      return `/${locale}/property-tax/floormaster/floor?${params.toString()}`;
    },
    [locale]
  );

  /* ============================================================
     SEARCH
  ============================================================ */

  const currentSearchTerm =
    searchParams.get("q") ?? "";

  /* ============================================================
     PAGINATION
  ============================================================ */

  const changePage = useCallback(
    (page: number) => {
      router.push(
        buildUrl(
          page,
          pageSize,
          currentSearchTerm
        )
      );
    },
    [
      router,
      pageSize,
      currentSearchTerm,
      buildUrl,
    ]
  );

  const total = totalCount;

  /* ============================================================
     PAGE SIZE
  ============================================================ */

  // No local pageSize state; use MasterTable's onPageSizeChange

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = useCallback(
  (row: Floor) => {
    confirm({
      variant: "delete",
      title: t("delete.confirmTitle", {
        id: row.floorCode,
      }),
      description: t("delete.confirmDescription"),
      meta: {
        id: row.floorCode,
        name: row.description,
      },
   onConfirm: async () => {
  try {
    const result = await deleteFloorAction(row.floorId);

    if (result.success) {
      toast.success(t("messages.deleteSuccess"));
      router.refresh();
      return;
    }

    // Handle specific backend key
    if (result.error === "floor.messages.deleteInUse") {
      toast.error(t("messages.deleteInUse"));
    } else {
      toast.error(result.error || t("messages.deleteFailed"));
    }

  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : t("messages.deleteFailed")
    );
  }
},
    });
  },
  [confirm, t, router]
);

  /* ============================================================
     TABLE COLUMNS
  ============================================================ */

  const columns = floorColumns(t);
  /* ============================================================
     UI
  ============================================================ */

 return (
  <PageContainer>
    <div className="w-full">

      <MasterTable<Floor>
        columns={columns}
        data={data}
        loading={false}
        height="lg"
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
         
        onPageChange={changePage}
        onPageSizeChange={(size) => {
          router.push(buildUrl(1, size, currentSearchTerm));
        }}
        

        // Disable internal selector
        paginationConfig={{ enabled: true, showPageSizeSelector: false }}

        // Custom footer
       footerLeftContent={
  <div className="flex items-center gap-1 ">
    {t('table.pagination.showing')}
    <Select
      options={[5, 10, 20, 50].map((s) => ({ label: String(s), value: String(s) }))}
      value={String(pageSize)}
      onChange={(val) => router.push(buildUrl(1, Number(val), currentSearchTerm))}
      selectSize="sm"
      className="min-w-[60px] border-blue-200"
      aria-label="Rows per page"
    />
    <span>{t('table.pagination.entries', { total })}</span>
  </div>
}


       renderActions={(row) => (
  <>
    <EditButton
      onClick={() =>
        router.push(
          `/${locale}/property-tax/floormaster/floor/edit/${row.floorId}`
        )
      }
    />
    <DeleteButton
      onClick={() => handleDelete(row)}
    />
  </>
)}

        getRowKey={(row) => row.floorId}

        
      />

    </div>
  </PageContainer>
);
}