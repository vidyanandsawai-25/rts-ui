"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Droplets } from "lucide-react";
import { MasterTable } from "@/components/common/MasterTable";
import { EditButton, DeleteButton, AddButton } from "@/components/common/ActionButtons";
import { Badge } from "@/components/common";
import type { WaterConnection } from "@/types/waterconnection.types";
import { getWaterConnectionColumns } from "./WaterConnectionColumns";

interface ConnectionsTableProps {
  propertyNo: string;
  connections: WaterConnection[];
  onAdd: () => void;
  onEdit: (connection: WaterConnection) => void;
  onDelete: (connection: WaterConnection) => void;
}

export function ConnectionsTable({
  propertyNo,
  connections,
  onAdd,
  onEdit,
  onDelete,
}: ConnectionsTableProps) {
  const t = useTranslations("waterConnection");
  const tCommon = useTranslations("common");

  const columns = useMemo(() => getWaterConnectionColumns(t), [t]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-blue-50 rounded-lg">
            <Droplets size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{t("list.title")}</div>
            <div className="text-xs text-gray-500">
              {t("list.subtitle").replace("{propertyNo}", propertyNo)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            {t("list.connections").replace("{count}", String(connections.length))}
          </Badge>
          <AddButton
            size="sm"
            label={t("list.buttons.add")}
            onClick={onAdd}
          />
        </div>
      </div>

      {/* Table */}
      <MasterTable<WaterConnection>
        columns={columns}
        data={connections}
        loading={false}
        paginationConfig={{ enabled: false }}
        renderActions={(row) => (
          <>
            <EditButton
              aria-label={tCommon("table.actions.edit")}
              onClick={() => onEdit(row)}
            />
            <DeleteButton
              aria-label={tCommon("table.actions.delete")}
              onClick={() => onDelete(row)}
            />
          </>
        )}
        actionLabel={t("list.table.actions")}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}
