"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmProvider, MasterTable, StatusBadge, useConfirm } from "@/components/common";
import type { Column } from "@/components/common";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
import { deletePropertyAction } from "@/app/[locale]/property-tax/zone-master/actions";

interface DirectPropertyDeleteRow {
  propertyId: string;
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  categoryName: string;
}

interface DirectPropertyDeleteSectionProps {
  propertyId: string;
  wardNo?: string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  categoryName?: string | null;
  onDeleted: () => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
}

function DirectPropertyDeleteSectionInner({
  propertyId,
  wardNo,
  propertyNo,
  partitionNo,
  categoryName,
  onDeleted,
  t,
}: DirectPropertyDeleteSectionProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isDeleting, setIsDeleting] = useState(false);

  const row: DirectPropertyDeleteRow = {
    propertyId,
    wardNo: wardNo || "-",
    propertyNo: propertyNo || "-",
    partitionNo: partitionNo || "-",
    categoryName: categoryName || "-",
  };

  const handleDelete = useCallback(() => {
    confirm({
      variant: "delete",
      title: t("createProperty.deletePropertyConfirm"),
      description: t("createProperty.deleteSinglePropertyDesc"),
      meta: { id: propertyId, name: propertyNo || propertyId },
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await deletePropertyAction(propertyId);
          if (result.success) {
            toast.success(t("createProperty.propertyDeleteSuccess"));
            onDeleted();
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
  }, [confirm, onDeleted, propertyId, propertyNo, router, t]);

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
      render: () => (
        <IconOnlyActionButton
          icon={Trash2}
          onClick={handleDelete}
          aria-label={t("createProperty.deletePropertyConfirm")}
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          className="text-red-500 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
        />
      ),
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
        data={[row] as unknown as Record<string, unknown>[]}
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
