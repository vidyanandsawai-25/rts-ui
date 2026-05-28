"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  ConfirmProvider,
  MasterTable,
  ToggleSwitch,
  useConfirm,
} from "@/components/common";
import type { Column } from "@/components/common";
import { Button } from "@/components/common/ActionButton";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
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

function PropertyAmenitySectionInner({ propertyId }: { propertyId: string }) {
  const { confirm } = useConfirm();

  // ── Wings ──────────────────────────────────
  const [wings, setWings] = useState<SocietyWingDetailItem[]>([]);
  const [wingsLoading, setWingsLoading] = useState(false);
  const [wingOpen, setWingOpen] = useState(false);
  const [selectedSocietyDetailId, setSelectedSocietyDetailId] = useState<number | null>(null);
  const wingContainerRef = useRef<HTMLDivElement>(null);

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
    const label = isAmenity ? "amenity" : "property";
    confirm({
      variant: "delete",
      title: `Delete ${isAmenity ? "Amenity" : "Property"}`,
      description: `Are you sure you want to delete this ${label}? This action cannot be undone.`,
      onConfirm: async () => {
        const result = await deletePropertyAmenityAction(item.propertyId);
        if (result.success) {
          toast.success(`${isAmenity ? "Amenity" : "Property"} deleted successfully`);
          refreshTable();
        } else {
          toast.error(result.error || `Failed to delete ${label}`);
        }
      },
    });
  };

  // ── Bulk delete ────────────────────────────
  const handleBulkDelete = () => {
    const ids = Array.from(selectedRows);
    const label = isAmenity ? "amenities" : "properties";
    confirm({
      variant: "delete",
      title: `Delete Selected ${isAmenity ? "Amenities" : "Properties"}`,
      description: `Are you sure you want to delete ${ids.length} selected ${label}? This action cannot be undone.`,
      onConfirm: async () => {
        const result = await deleteMultiplePropertiesAmenitiesAction(ids);
        if (result.success) {
          toast.success(`${ids.length} ${label} deleted successfully`);
          refreshTable();
        } else {
          toast.error(result.error || `Failed to delete selected ${label}`);
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
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          disabled={tableData.length === 0}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      ),
      width: "48px",
      align: "center",
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={selectedRows.has((row as SocietyAmenityDetailItem).propertyId)}
          onChange={() => toggleRow((row as SocietyAmenityDetailItem).propertyId)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      ),
    },
    {
      key: "wardNo",
      label: "Ward Name",
    },
    {
      key: "propertyNo",
      label: "Property No",
    },
    {
      key: "partitionNo",
      label: "Partition Number",
    },
    {
      key: "partType",
      label: "Action",
      align: "center",
      render: (_value, row) => (
        <IconOnlyActionButton
          icon={Trash2}
          onClick={() => handleSingleDelete(row as unknown as SocietyAmenityDetailItem)}
          aria-label="Delete row"
          variant="ghost"
          size="sm"
          disabled={selectedRows.size > 0 || tableLoading}
          className="text-red-500 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
        />
      ),
    },
  ];

  const selectedWing = wings.find((w) => w.societyDetailId === selectedSocietyDetailId);

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">Wings</h4>
      </div>

      <div className="p-3 rounded-lg border border-blue-100 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Wings associated with this property
          </span>
        </div>

        {/* Wing dropdown */}
        {wingsLoading ? (
          <div className="h-10 rounded-md bg-gray-100 animate-pulse" />
        ) : wings.length === 0 ? (
          <p className="text-sm text-gray-500">No wings available for this property.</p>
        ) : (
          <div ref={wingContainerRef} className="relative w-full">
            <button
              type="button"
              className={cn(
                "flex items-center justify-between w-full h-10 px-4",
                "border border-gray-300 rounded-md bg-white text-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              )}
              onClick={() => setWingOpen((prev) => !prev)}
              onBlur={(e) => {
                if (!wingContainerRef.current?.contains(e.relatedTarget as Node)) {
                  setWingOpen(false);
                }
              }}
            >
              <span
                className={cn(
                  "truncate text-left flex-1 text-sm",
                  !selectedWing ? "text-gray-400" : "text-gray-800"
                )}
              >
                {selectedWing
                  ? `${selectedWing.wingNo} - ${selectedWing.wingName}`
                  : "Select a wing"}
              </span>
              <ChevronDown className="ml-2 w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {wingOpen && (
              <ul
                className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto top-full mt-1"
                onMouseDown={(e) => e.preventDefault()}
              >
                {wings.map((wing) => (
                  <li
                    key={wing.societyDetailId}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 cursor-pointer transition-colors hover:bg-blue-50",
                      selectedSocietyDetailId === wing.societyDetailId &&
                        "bg-blue-50 text-blue-700 font-semibold"
                    )}
                    onClick={() => {
                      setSelectedSocietyDetailId(wing.societyDetailId);
                      setWingOpen(false);
                      setIsAmenity(false);
                    }}
                  >
                    <span className="text-sm text-gray-800 font-medium">
                      {wing.wingNo} - {wing.wingName}
                    </span>
                    <span className="ml-4 shrink-0 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full">
                      {wing.propertyCount}{" "}
                      {wing.propertyCount === 1 ? "Property" : "Properties"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                Properties
              </span>
              <ToggleSwitch
                checked={isAmenity}
                onChange={setIsAmenity}
                showPopup={false}
                activeLabel="Amenities"
                inactiveLabel="Properties"
              />
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isAmenity ? "text-blue-700" : "text-gray-400"
                )}
              >
                Amenities
              </span>
            </div>

            {/* Table */}
            <MasterTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={tableData as unknown as Record<string, unknown>[]}
              loading={tableLoading}
              emptyText={isAmenity ? "No amenities found." : "No properties found."}
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
                  Delete Selected ({selectedRows.size})
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
