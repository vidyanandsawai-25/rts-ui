"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmProvider, MasterTable, StatusBadge, useConfirm } from "@/components/common";
import type { Column } from "@/components/common";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
import { deletePropertyAction } from "@/app/[locale]/property-tax/zone-master/actions";
import type { DirectPropertyDeleteRow } from "@/types/zoneMaster.types";

interface DirectPropertyDeleteSectionProps {
  propertyId: string;
  wardNo?: string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  categoryName?: string | null;
  subRows?: DirectPropertyDeleteRow[];
  onSubRowDeleted?: () => void;
  onDeleted: () => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
}

function DirectPropertyDeleteSectionInner({
  propertyId,
  wardNo,
  propertyNo,
  partitionNo,
  categoryName,
  subRows,
  onSubRowDeleted,
  onDeleted,
  t,
}: DirectPropertyDeleteSectionProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const createDeleteHandler = useCallback(
    (rowPropertyId: string, rowPropertyNo: string, callback: () => void) => () => {
      confirm({
        variant: "delete",
        title: t("createProperty.deletePropertyConfirm"),
        description: t("createProperty.deleteSinglePropertyDesc"),
        onConfirm: async () => {
          setIsDeleting(true);
          try {
            const result = await deletePropertyAction(rowPropertyId);
            if (result.success) {
              toast.success(t("createProperty.propertyDeleteSuccess"));
              callback();
              router.refresh();
            } else {
              toast.error(result.error || t("createProperty.failedToDeleteProperty"));
            }
          } catch {
            toast.error(t("createProperty.failedToDeleteProperty"));
          } finally {
            setIsDeleting(false);
          }
        },
      });
    },
    [confirm, router, t]
  );

  const mainRow: DirectPropertyDeleteRow = {
    propertyId,
    wardNo: wardNo || "-",
    propertyNo: propertyNo || "-",
    partitionNo: partitionNo || "-",
    categoryName: categoryName || "-",
  };

  const hasSubRows = subRows && subRows.length > 0;
  const tableData = hasSubRows ? subRows : [mainRow];

  const columns: Column<DirectPropertyDeleteRow & Record<string, unknown>>[] = [
    {
      key: "propertyIdentifier",
      label: `${t("propertyList.columns.wardNo")} - ${t("createProperty.propertyNoLabel")} - ${t("createProperty.partitionNumber")}`,
      render: (_value, currentRow) => {
        const item = currentRow as DirectPropertyDeleteRow;
        return (
          <span className="font-medium text-gray-800">
            {item.wardNo} - {item.propertyNo} - {item.partitionNo}
          </span>
        );
      },
    },
    {
      key: "categoryName",
      label: t("createProperty.category"),
      render: (value) =>
        value && value !== "-" ? (
          <StatusBadge label={value as string} variant="info" />
        ) : (
          "-"
        ),
    },
    {
      key: "propertyId",
      label: t("createProperty.action"),
      align: "center",
      render: (_value, currentRow) => {
        const item = currentRow as DirectPropertyDeleteRow;
        const callback = hasSubRows ? (onSubRowDeleted ?? (() => {})) : onDeleted;
        return (
          <IconOnlyActionButton
            icon={Trash2}
            onClick={createDeleteHandler(item.propertyId, item.propertyNo, callback)}
            aria-label={t("createProperty.deletePropertyConfirm")}
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-red-500 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          {t("createProperty.property")}
        </h4>
      </div>

      <MasterTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={tableData as unknown as Record<string, unknown>[]}
        loading={isDeleting}
        emptyText={t("createProperty.noPropertiesFound")}
        height="xs"
        paginationConfig={{ enabled: false }}
      />
    </div>
  );
}

export function DirectPropertyDeleteSection(props: DirectPropertyDeleteSectionProps) {
  return (
    <ConfirmProvider>
      <DirectPropertyDeleteSectionInner {...props} />
    </ConfirmProvider>
  );
}
