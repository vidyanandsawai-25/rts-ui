"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  ConfirmProvider,
  MasterTable,
  SearchSelect,
  ToggleSwitch,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common";
import { Button } from "@/components/common/ActionButton";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
import { Checkbox } from "@/components/common/checkbox";
import {
  getSocietyWingDetailsAction,
  getSocietyAmenityDetailsAction,
  deletePropertyAmenityAction,
  deleteMultiplePropertiesAmenitiesAction,
} from "@/app/[locale]/property-tax/zone-master/actions";
import type { SocietyWingDetailItem } from "@/types/zone-master/properties/society-wing-details.types";
import type { SocietyAmenityDetailItem } from "@/types/zone-master/properties/society-amenity-details.types";

type TableRow = SocietyAmenityDetailItem & Record<string, unknown>;

/* ─────────────────────────────────────────────
   Inner component (needs ConfirmProvider above)
───────────────────────────────────────────── */

import { useTranslations } from "next-intl";

function PropertyAmenitySectionInner({ propertyId }: { propertyId: string }) {
  const { confirm } = useConfirm();
  const t = useTranslations("zoneMaster");

  // ── Wings ──────────────────────────────────
  const [wings, setWings] = useState<SocietyWingDetailItem[]>([]);
  const [wingsLoading, setWingsLoading] = useState(false);
  const [selectedSocietyDetailId, setSelectedSocietyDetailId] = useState<number | null>(null);

  // ── Toggle ─────────────────────────────────
  const [isAmenity, setIsAmenity] = useState(false);

  // ── Table ──────────────────────────────────
  const [tableData, setTableData] = useState<SocietyAmenityDetailItem[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // ── Load wings when property changes ───────
  useEffect(() => {
    if (!propertyId) {
      setWings([]);
      setSelectedSocietyDetailId(null);
      return;
    }

    let cancelled = false;
    setWingsLoading(true);
    setSelectedSocietyDetailId(null);
    setTableData([]);
    setSelectedRows(new Set());
    setIsAmenity(false);

    getSocietyWingDetailsAction(Number(propertyId))
      .then((result) => {
        if (cancelled) return;
        setWings(result.success && result.data ? result.data : []);
      })
      .catch(() => { if (!cancelled) setWings([]); })
      .finally(() => { if (!cancelled) setWingsLoading(false); });

    return () => { cancelled = true; };
  }, [propertyId]);

  // ── Load table when wing / toggle changes ──
  const loadTable = useCallback(
    (sdId: number, amenity: boolean) => {
      setTableLoading(true);
      setSelectedRows(new Set());

      getSocietyAmenityDetailsAction(sdId, amenity)
        .then((result) => {
          setTableData(result.success && result.data ? result.data : []);
        })
        .catch(() => setTableData([]))
        .finally(() => setTableLoading(false));
    },
    []
  );

  useEffect(() => {
    if (!selectedSocietyDetailId) {
      setTableData([]);
      setSelectedRows(new Set());
      return;
    }
    loadTable(selectedSocietyDetailId, isAmenity);
  }, [selectedSocietyDetailId, isAmenity, loadTable]);

  const refreshTable = useCallback(() => {
    if (selectedSocietyDetailId) loadTable(selectedSocietyDetailId, isAmenity);
  }, [selectedSocietyDetailId, isAmenity, loadTable]);

  // ── Selection helpers ──────────────────────
  const allSelected = tableData.length > 0 && selectedRows.size === tableData.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    setSelectedRows(
      allSelected ? new Set() : new Set(tableData.map((r) => r.propertyId))
    );
  };

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Single delete ──────────────────────────
  const handleSingleDelete = (item: SocietyAmenityDetailItem) => {
    const label = isAmenity ? t("createProperty.amenity") : t("createProperty.property");
    confirm({
      variant: "delete",
      title: isAmenity ? t("createProperty.deleteAmenityConfirm") : t("createProperty.deletePropertyConfirm"),
      description: isAmenity ? t("createProperty.deleteSingleAmenityDesc") : t("createProperty.deleteSinglePropertyDesc"),
      onConfirm: async () => {
        const result = await deletePropertyAmenityAction(item.propertyId);
        if (result.success) {
          toast.success(isAmenity ? t("createProperty.amenityDeleteSuccess") : t("createProperty.propertyDeleteSuccess"));
          refreshTable();
        } else {
          toast.error(result.error || (isAmenity ? t("createProperty.failedToDeleteAmenity") : t("createProperty.failedToDeleteProperty")));
        }
      },
    });
  };

  // ── Bulk delete ────────────────────────────
  const handleBulkDelete = () => {
    const ids = Array.from(selectedRows);
    confirm({
      variant: "delete",
      title: isAmenity
        ? t("createProperty.deleteSelectedAmenitiesTitle")
        : t("createProperty.deleteSelectedPropertiesTitle"),
      description: isAmenity
        ? t("createProperty.deleteSelectedAmenitiesDesc", { count: ids.length })
        : t("createProperty.deleteSelectedPropertiesDesc", { count: ids.length }),
      onConfirm: async () => {
        const result = await deleteMultiplePropertiesAmenitiesAction(ids);
        if (result.success) {
          toast.success(
            isAmenity
              ? t("createProperty.amenitiesDeletedSuccess", { count: ids.length })
              : t("createProperty.propertiesDeletedSuccess", { count: ids.length })
          );
          refreshTable();
        } else {
          toast.error(
            result.error ||
              (isAmenity
                ? t("createProperty.failedToDeleteSelectedAmenities")
                : t("createProperty.failedToDeleteSelectedProperties"))
          );
        }
      },
    });
  };

  // ── Table columns ──────────────────────────
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const columns: Column<TableRow>[] = [
    {
      key: "propertyId",
      label: (
        <Checkbox
          ref={headerCheckboxRef}
          checked={allSelected}
          onCheckedChange={toggleSelectAll}
          disabled={tableData.length === 0}
          aria-label="Select all"
        />
      ),
      width: "48px",
      align: "center",
      render: (_value, row) => (
        <Checkbox
          checked={selectedRows.has((row as SocietyAmenityDetailItem).propertyId)}
          onCheckedChange={() => toggleRow((row as SocietyAmenityDetailItem).propertyId)}
          aria-label="Select row"
        />
      ),
    },
    {
      key: "wardNo",
      label: t("createProperty.wardName"),
    },
    {
      key: "propertyNo",
      label: t("createProperty.propertyNoLabel"),
    },
    {
      key: "partitionNo",
      label: t("createProperty.partitionNumber"),
    },
    {
      key: "partType",
      label: t("createProperty.action"),
      align: "center",
      render: (_value, row) => (
        <IconOnlyActionButton
          icon={Trash2}
          onClick={() => handleSingleDelete(row as unknown as SocietyAmenityDetailItem)}
          aria-label={t("createProperty.deleteAmenityConfirm")}
          variant="ghost"
          size="sm"
          disabled={selectedRows.size > 0 || tableLoading}
          className="text-red-500 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
        />
      ),
    },
  ];

  const selectedWing = wings.find((w) => w.societyDetailId === selectedSocietyDetailId);
  const wingOptions = wings.map((wing) => ({
  label: `${wing.wingNo} - ${wing.wingName}`,
  value: wing.societyDetailId.toString(),
}));

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">{t("createProperty.wings")}</h4>
      </div>

      <div className="p-3 rounded-lg border border-blue-100 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            {t("createProperty.wingsAssociated")}
          </span>
        </div>

        {/* Wing dropdown */}
        {wingsLoading ? (
          <div className="h-10 rounded-md bg-gray-100 animate-pulse" />
        ) : wings.length === 0 ? (
          <p className="text-sm text-gray-500">{t("createProperty.noWingsAvailable")}</p>
        ) : (
          <SearchSelect
  id="wing-select"
  name="wingSelect"
  options={wingOptions}
  value={selectedSocietyDetailId?.toString() || ""}
  placeholder={t("createProperty.selectAWing")}
  onChange={(_, value) => {
    setSelectedSocietyDetailId(Number(value));
    setIsAmenity(false);
  }}
  isLoading={wingsLoading}
  noOptionsPlaceholder={t("createProperty.noWingsAvailable")}
/>
        )}

        {/* Toggle + table (shown only after a wing is selected) */}
        {selectedSocietyDetailId !== null && (
          <>
            {/* Properties / Amenities toggle */}
            <div className="flex items-center gap-3 pt-1">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  !isAmenity ? "text-blue-700" : "text-gray-400"
                )}
              >
                {t("createProperty.properties")}
              </span>
              <ToggleSwitch
                checked={isAmenity}
                onChange={setIsAmenity}
                showPopup={false}
                activeLabel={t("createProperty.amenities")}
                inactiveLabel={t("createProperty.properties")}
              />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isAmenity ? "text-blue-700" : "text-gray-400"
                )}
              >
                {t("createProperty.amenities")}
              </span>
            </div>

            {/* Table */}
            <MasterTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={tableData as unknown as Record<string, unknown>[]}
              loading={tableLoading}
              emptyText={isAmenity ? t("createProperty.noAmenitiesFound") : t("createProperty.noPropertiesFound")}
              height="sm"
              paginationConfig={{ enabled: false }}
            />

            {/* Bulk delete button */}
            {selectedRows.size > 0 && (
              <div className="pt-1">
                <Button
                  variant="danger"
                  onClick={handleBulkDelete}
                  disabled={tableLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("createProperty.deleteSelectedCount", { count: selectedRows.size })}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Public export – wraps inner with ConfirmProvider
───────────────────────────────────────────── */

export function PropertyAmenitySection({ propertyId }: { propertyId: string }) {
  return (
    <ConfirmProvider>
      <PropertyAmenitySectionInner propertyId={propertyId} />
    </ConfirmProvider>
  );
}
