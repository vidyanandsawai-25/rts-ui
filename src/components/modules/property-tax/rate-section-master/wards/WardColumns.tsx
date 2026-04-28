"use client";

import { Column } from "@/components/common/MasterTable";
import { SectionItem, GetWardColumnsParams } from "@/types/rateSectionMaster.types";
import { StatusBadge } from "@/components/common/StatusBadge";

export function getWardColumns({
  t,
}: GetWardColumnsParams): Column<SectionItem>[] {
  return [
    {
      key: "wardNo",
      label: t('wards.wardNo'),
      render: (_, row) => (
        <div className="flex justify-center">
          <StatusBadge label={String(row.wardNo ?? row.WardNo ?? "-")} variant="info" />
        </div>
      ),
    },
  ];
}
