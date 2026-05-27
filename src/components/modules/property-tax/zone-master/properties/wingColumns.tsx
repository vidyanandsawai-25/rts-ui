"use client";

import { Column } from "@/components/common/MasterTable";
import { Badge } from "@/components/common";
import { PenLine, Building2 } from "lucide-react";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";

export interface WingSummary {
  wingName: string;
  count: number;
  wingId: number;
  wingNo?: string;
  societyDetailId: number;
  [key: string]: unknown;
}

interface GetWingColumnsParams {
  t: (key: string) => string;
  onEditWing: (row: WingSummary) => void;
  onUpdateStructure: (row: WingSummary) => void;
}

export function getWingColumns({
  t,
  onEditWing,
  onUpdateStructure,
}: GetWingColumnsParams): Column<WingSummary & Record<string, unknown>>[] {
  return [
    {
      label: t("partitionForm.wing.table.wingName"),
      key: "wingName",
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          {row.wingNo && (
            <Badge variant="default" size="md" className="font-bold">
              {row.wingNo}
            </Badge>
          )}
          <span className="font-medium text-gray-700">{row.wingName}</span>
        </div>
      ),
    },
    {
      label: t("partitionForm.wing.table.totalProperties"),
      key: "count",
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
            {row.count} {t("partitionForm.wing.table.properties")}
          </div>
        </div>
      ),
    },
    {
      label: t("partitionForm.wing.table.actions"),
      key: "wingId",
      align: "center",
      render: (_value, row) => (
        <div className="flex items-center justify-center gap-1">
          {/* Edit Wing Name Button */}
          <IconOnlyActionButton
            icon={PenLine}
            onClick={() => onEditWing(row)}
            aria-label={t("partitionForm.wing.table.editWingName")}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
          />

          {/* Update Wing Structure Button */}
          <IconOnlyActionButton
            icon={Building2}
            onClick={() => onUpdateStructure(row)}
            aria-label={t("partitionForm.wing.table.updateWing")}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
          />
        </div>
      ),
    },
  ];
}
