"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ConfirmProvider,
  MasterTable,
  StatusBadge,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
import { Checkbox } from "@/components/common/checkbox";
import { deletePropertyAction, deleteBulkPropertiesAction } from "@/app/[locale]/property-tax/zone-master/actions";
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

  // ✅ selection state (like amenities)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const hasSubRows = subRows && subRows.length > 0;

  const mainRow: DirectPropertyDeleteRow = {
    propertyId,
    wardNo: wardNo || "",
    propertyNo: propertyNo || "",
    partitionNo: partitionNo || "",
    categoryName: categoryName || "",
  };
  // Always holds the latest selectedRows so onConfirm never reads a stale closure
  const selectedRowsRef = useRef(selectedRows);
  selectedRowsRef.current = selectedRows;

  const handleBulkDelete = useCallback(() => {
    const currentIds = Array.from(selectedRowsRef.current);
    const count = currentIds.length;
    if (count === 0) return;

    const callback = hasSubRows ? (onSubRowDeleted ?? (() => {})) : onDeleted;

    confirm({
      variant: "delete",
      title: t("createProperty.deleteSelectedPropertiesTitle"),
      description: t("createProperty.deleteSelectedPropertiesDesc", { count }),
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await deleteBulkPropertiesAction(currentIds);

          if (result.success) {
            toast.success(result.message ?? t("createProperty.propertyDeleteSuccess"));
            setSelectedRows(new Set());
            callback();
            router.refresh();
          } else {
            toast.error(result.error ?? t("createProperty.failedToDeleteProperty"));
          }
        } catch {
          toast.error(t("createProperty.failedToDeleteProperty"));
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }, [confirm, router, t, hasSubRows, onSubRowDeleted, onDeleted]);
  const tableData = hasSubRows ? subRows : [mainRow];

  // ==============================
  // Selection logic
  // ==============================

  const allSelected =
    tableData.length > 0 &&
    selectedRows.size === tableData.length;

  const someSelected =
    selectedRows.size > 0 && selectedRows.size < tableData.length;

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(tableData.map((r) => r.propertyId)));
    }
  }, [allSelected, tableData]);

  const toggleRow = useCallback((id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ==============================
  // Delete handler
  // ==============================

  const createDeleteHandler = useCallback(
    (rowPropertyId: string, rowPropertyNo: string, callback: () => void) => () => {
      confirm({
        variant: "delete",
        title: t("createProperty.deletePropertyConfirm"),
        description: t("createProperty.deleteSinglePropertyDesc"),
        meta: { name: rowPropertyNo },
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

  // ==============================
  // Columns
  // ==============================

  const columns: Column<DirectPropertyDeleteRow & Record<string, unknown>>[] = [
    
    {
      key: "select",
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={toggleSelectAll}
          disabled={tableData.length === 0}
        />
      ),
      width: "48px",
      align: "center",
      render: (_value, row) => {
        const item = row as DirectPropertyDeleteRow;

        return (
          <Checkbox
            checked={selectedRows.has(item.propertyId)}
            onCheckedChange={() => toggleRow(item.propertyId)}
          />
        );
      },
    },

    // Property identifier
    {
      key: "propertyIdentifier",
      label: t("createProperty.propertyNoLabel"),
      render: (_value, currentRow) => {
        const item = currentRow as DirectPropertyDeleteRow;

        return (
          <span className="font-medium text-gray-800">
            {[item.wardNo, item.propertyNo, item.partitionNo]
              .filter(Boolean)
              .join(" - ")}
          </span>
        );
      },
    },

    // Category
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

    // Action
    {
      key: "propertyId",
      label: t("createProperty.action"),
      align: "center",
      render: (_value, currentRow) => {
        const item = currentRow as DirectPropertyDeleteRow;

        const callback = hasSubRows
          ? (onSubRowDeleted ?? (() => {}))
          : onDeleted;

        return (
          <IconOnlyActionButton
            icon={Trash2}
            onClick={createDeleteHandler(
              item.propertyId,
              item.propertyNo,
              callback
            )}
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
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          {t("createProperty.property")}
        </h4>
      </div>

      {/* Table */}
      <MasterTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={tableData as unknown as Record<string, unknown>[]}
        loading={isDeleting}
        emptyText={t("createProperty.noPropertiesFound")}
        height="xs"
        paginationConfig={{ enabled: false }}
      />
      {selectedRows.size > 0 && (
  <div className="flex justify-end pt-2">
    <button
      onClick={handleBulkDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
    >
      <Trash2 className="w-4 h-4" />
      {t("createProperty.deleteSelectedCount", { count: selectedRows.size })}
    </button>
  </div>
)}
    </div>
  );
}

export function DirectPropertyDeleteSection(
  props: DirectPropertyDeleteSectionProps
) {
  return (
    <ConfirmProvider>
      <DirectPropertyDeleteSectionInner {...props} />
    </ConfirmProvider>
  );
}