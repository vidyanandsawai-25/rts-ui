"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SectionItem, WardTableProps } from "@/types/rateSectionMaster.types";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton } from "@/components/common";
import { getWardColumns } from "./WardColumns";

export default function WardTable({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  emptyText
}: WardTableProps) {
  const t = useTranslations("rateSectionMaster");

  const columns = useMemo(
    () =>
      getWardColumns({
        t,
      }),
    [t]
  );

  return (
    <MasterTable<SectionItem>
      columns={columns}
      data={data}
      renderActions={(row) => (
        <>
          <EditButton size="xs" onClick={() => onEdit(row)} />
          <DeleteButton size="xs" onClick={() => onDelete(row)} />
        </>
      )}
      emptyText={emptyText}
      height="md"
      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      paginationConfig={{ enabled: true, showPageSizeSelector: true }}
    />
  );
}
