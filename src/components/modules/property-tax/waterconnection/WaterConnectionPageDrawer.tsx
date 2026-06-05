"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { Select } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ConnectionsTable } from "./ConnectionsTable";
import { AddConnectionDrawer } from "./AddConnectionDrawer";
import type {
  WaterConnection,
  WaterConnectionPageData,
} from "@/types/waterconnection.types";
import {
  getWaterConnectionPageData,
  deleteWaterConnectionAction,
  getWaterConnectionsOnlyAction,
  getAllWaterConnectionsAction,
} from "@/app/[locale]/property-tax/waterconnection/action";

function computeStats(connections: WaterConnection[]) {
  const active = connections.filter((c) => c.isActive);
  return {
    totalConnections: connections.length,
    activeConnections: active.length,
    stoppedConnections: connections.length - active.length,
    yearlyRevenue: active.reduce((sum, c) => sum + (c.applicableCharges ?? 0), 0),
  };
}

interface WaterConnectionPageDrawerProps {
  open: boolean;
  propertyId: number | null;
  onClose: () => void;
}

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 10;

export function WaterConnectionPageDrawer({
  open,
  propertyId,
  onClose,
}: WaterConnectionPageDrawerProps) {
  const t = useTranslations("waterConnection");
  const tCommon = useTranslations("common");
  const { confirm } = useConfirm();

  const [pageData, setPageData] = useState<WaterConnectionPageData | null>(null);
  const [allConnections, setAllConnections] = useState<WaterConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [page, setPage] = useState(INITIAL_PAGE);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);

  // Add/Edit connection drawer state
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WaterConnection | null>(null);

  /* =========== INITIAL DATA FETCH =========== */
  useEffect(() => {
    if (!open || !propertyId) {
      setPageData(null);
      setAllConnections([]);
      setPage(INITIAL_PAGE);
      setPageSize(INITIAL_PAGE_SIZE);
      return;
    }

    let cancelled = false;
    setInitialLoading(true);

    getWaterConnectionPageData(propertyId, INITIAL_PAGE, INITIAL_PAGE_SIZE)
      .then((data) => {
        if (!cancelled) {
          setPageData(data);
          setAllConnections(data.connections);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load water connection data.");
        }
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propertyId]);

  /* =========== FETCH ALL CONNECTIONS (for stats) =========== */
  const refreshAllConnections = useCallback(async () => {
    if (!propertyId) return;
    try {
      const connections = await getAllWaterConnectionsAction(propertyId);
      setAllConnections(connections);
    } catch {
      // Silently fail — table still works
    }
  }, [propertyId]);

  /* =========== PAGED CONNECTIONS FETCH =========== */
  const fetchConnections = useCallback(
    async (newPage: number, newPageSize: number) => {
      if (!propertyId) return;
      setLoading(true);
      try {
        const result = await getWaterConnectionsOnlyAction(propertyId, newPage, newPageSize);
        setPageData((prev) =>
          prev
            ? {
                ...prev,
                connections: result.connections,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                pageNumber: result.pageNumber,
                pageSize: result.pageSize,
              }
            : prev
        );
      } catch {
        toast.error(t("error.description"));
      } finally {
        setLoading(false);
      }
    },
    [propertyId, t]
  );

  /* =========== PAGINATION =========== */
  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
      fetchConnections(p, pageSize);
    },
    [pageSize, fetchConnections]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPage(1);
      setPageSize(size);
      fetchConnections(1, size);
    },
    [fetchConnections]
  );

  /* =========== ADD / EDIT / CLOSE =========== */
  const handleAdd = useCallback(() => {
    setEditingConnection(null);
    setAddDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((connection: WaterConnection) => {
    setEditingConnection(connection);
    setAddDrawerOpen(true);
  }, []);

  const handleAddDrawerClose = useCallback(() => {
    setAddDrawerOpen(false);
    setEditingConnection(null);
  }, []);

  const handleSaved = useCallback(() => {
    setPage(1);
    fetchConnections(1, pageSize);
    refreshAllConnections();
  }, [fetchConnections, refreshAllConnections, pageSize]);

  /* =========== DELETE =========== */
  const handleDelete = useCallback(
    (connection: WaterConnection) => {
      confirm({
        variant: "delete",
        meta: { name: connection.connectionNo },
        onConfirm: async () => {
          const result = await deleteWaterConnectionAction(connection.id);
          if (result.ok) {
            toast.success(t("delete.success"));
            const targetPage =
              pageData && pageData.connections.length === 1 && page > 1 ? page - 1 : page;
            if (targetPage !== page) setPage(targetPage);
            await fetchConnections(targetPage, pageSize);
            refreshAllConnections();
          } else {
            toast.error(result.error ?? t("delete.error"));
          }
        },
      });
    },
    [confirm, page, pageSize, pageData, t, fetchConnections, refreshAllConnections]
  );

  const stats = useMemo(() => computeStats(allConnections), [allConnections]);
  const totalPages = pageData
    ? pageData.totalPages ?? Math.max(1, Math.ceil(pageData.totalCount / pageSize))
    : 1;

  /* =========== DRAWER TITLE =========== */
  const drawerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
        <Droplets className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900 leading-tight">{t("page.title")}</h2>
          {pageData && (
            <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {pageData.property.propertyNo}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-tight">{t("page.subtitle")}</p>
      </div>
    </div>
  );

  /* =========== RENDER =========== */
  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={drawerTitle}
        width="xl"
      >
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-blue-600">
            <Loader2 size={36} className="animate-spin" />
            <span className="text-sm font-medium text-slate-500">Loading…</span>
          </div>
        ) : pageData ? (
          <div className="space-y-3 p-3">
            {/* Stats — compact row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: t("stats.totalConnections"), value: stats.totalConnections, color: "blue" },
                { label: t("stats.activeConnections"), value: stats.activeConnections, color: "green" },
                { label: t("stats.stoppedConnections"), value: stats.stoppedConnections, color: "orange" },
                { label: t("stats.yearlyRevenue"), value: `₹${stats.yearlyRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "purple" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`bg-${color}-50 border border-${color}-100 rounded-lg px-3 py-2 flex flex-col gap-0.5`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
                  <div className={`text-base font-bold text-${color}-700`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Property Info — full card with all fields */}
            <PropertyInfoCard
              property={pageData.property}
              labels={{
                owner: t("property.owner"),
                contact: t("property.contact"),
                email: t("property.email"),
                address: t("property.address"),
                propertyNo: t("property.propertyNo"),
                zone: t("property.zone"),
                ward: t("property.ward"),
                buildingType: t("property.buildingType"),
              }}
            />

            {/* Connections Table */}
            <ConnectionsTable
              propertyNo={pageData.property.propertyNo}
              connections={pageData.connections}
              totalCount={pageData.totalCount}
              pageNumber={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              footerLeft={
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    {tCommon("table.showingEntries", {
                      start: pageData.totalCount === 0 ? 0 : (page - 1) * pageSize + 1,
                      end: Math.min(page * pageSize, pageData.totalCount),
                      total: pageData.totalCount,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                    <Select
                      value={String(pageSize)}
                      onChange={(_e, value) => handlePageSizeChange(Number(value))}
                      options={[10, 20, 30, 50].map((s) => ({
                        label: String(s),
                        value: String(s),
                      }))}
                      selectSize="sm"
                      className="w-20"
                      ariaLabel={tCommon("table.rowsPerPage")}
                    />
                  </div>
                </div>
              }
            />
          </div>
        ) : null}
      </Drawer>

      {/* Nested drawer for Add/Edit connection */}
      {pageData && (
        <AddConnectionDrawer
          open={addDrawerOpen}
          propertyId={propertyId!}
          editingConnection={editingConnection}
          typeOptions={pageData.typeOptions}
          sizeOptions={pageData.sizeOptions}
          statusOptions={pageData.statusOptions}
          rateMasters={pageData.rateMasters}
          onClose={handleAddDrawerClose}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
