"use client";

import { Column } from "@/components/common/MasterTable";
import { Badge } from "@/components/common";
import { PenLine, Building2 } from "lucide-react";

export interface WingSummary {
  wingName: string;
  count: number;
  wingId: number;
  wingNo?: string;
  societyDetailId: number;
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
          <button
            onClick={() => onEditWing(row)}
            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors group"
            title={t("partitionForm.wing.table.editWingName")}
          >
            <PenLine size={16} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Update Wing Structure Button */}
          <button
            onClick={() => onUpdateStructure(row)}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors group"
            title={t("partitionForm.wing.table.updateWing")}
          >
            <Building2 size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];
}
