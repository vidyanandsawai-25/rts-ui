"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Select } from "@/components/common";
import type {
  WaterConnection,
  WaterConnectionPageData,
} from "@/types/waterconnection.types";
import {
  deleteWaterConnectionAction,
  getWaterConnectionsOnlyAction,
  getAllWaterConnectionsAction,
} from "@/app/[locale]/property-tax/waterconnection/action";
import { PropertyStatsCards } from "./PropertyStatsCards";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ConnectionsTable } from "./ConnectionsTable";
import { AddConnectionDrawer } from "./AddConnectionDrawer";

function computeStats(connections: WaterConnection[]) {
  const active = connections.filter((c) => c.isActive);
  return {
    totalConnections: connections.length,
    activeConnections: active.length,
    stoppedConnections: connections.length - active.length,
    yearlyRevenue: active.reduce((sum, c) => sum + (c.applicableCharges ?? 0), 0),
  };
}

interface WaterConnectionPageProps {
  initialData: WaterConnectionPageData;
  propertyId: number;
  initialPage: number;
  initialPageSize: number;
}

export default function WaterConnectionPage({
  initialData,
  propertyId,
  initialPage,
  initialPageSize,
}: WaterConnectionPageProps) {
  const t = useTranslations("waterConnection");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WaterConnection | null>(null);

  // Keep full page data (including lookups) from initial server load
  const [pageData, setPageData] = useState<WaterConnectionPageData>(initialData);
  const [loading, setLoading] = useState(false);

  // ALL connections (unpaged) for stats calculation
  const [allConnections, setAllConnections] = useState<WaterConnection[]>(initialData.connections);

  // Client-side pagination state — avoids full server re-render on page change
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  /* ================= URL SYNC (without full reload) ================= */
  const updateUrl = useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      params.set("pageSize", String(newPageSize));
      // Use replace to update URL without triggering a server re-render
      router.replace(`/${locale}/property-tax/waterconnection?${params.toString()}`, {
        scroll: false,
      });
    },
    [locale, searchParams, router]
  );

  /* ================= FAST CLIENT-SIDE FETCH (connections only) ================= */
  const fetchConnections = useCallback(
    async (newPage: number, newPageSize: number) => {
      setLoading(true);
      try {
        const result = await getWaterConnectionsOnlyAction(propertyId, newPage, newPageSize);
        setPageData((prev) => ({
          ...prev,
          connections: result.connections,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          pageNumber: result.pageNumber,
          pageSize: result.pageSize,
        }));
      } catch {
        toast.error(t("error.description"));
      } finally {
        setLoading(false);
      }
    },
    [propertyId, t]
  );

  /* ================= FETCH ALL CONNECTIONS FOR STATS ================= */
  // Fetch all connections on mount for accurate stats
  useEffect(() => {
    const fetchAllConnections = async () => {
      try {
        const connections = await getAllWaterConnectionsAction(propertyId);
        setAllConnections(connections);
      } catch {
        // Silently fail for stats — table will still work
      }
    };
    fetchAllConnections();
  }, [propertyId]);

  const refreshAllConnections = useCallback(async () => {
    try {
      const connections = await getAllWaterConnectionsAction(propertyId);
      setAllConnections(connections);
    } catch {
      // Silently fail for stats — table will still work
    }
  }, [propertyId]);

  /* ================= PAGINATION ================= */
  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
      updateUrl(p, pageSize);
      fetchConnections(p, pageSize);
    },
    [pageSize, updateUrl, fetchConnections]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPage(1);
      setPageSize(size);
      updateUrl(1, size);
      fetchConnections(1, size);
    },
    [updateUrl, fetchConnections]
  );

  /* ================= ADD / EDIT / CLOSE ================= */
  const handleAdd = useCallback(() => {
    setEditingConnection(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((connection: WaterConnection) => {
    setEditingConnection(connection);
    setDrawerOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    setEditingConnection(null);
  }, []);

  const handleSaved = useCallback(() => {
    setPage(1);
    updateUrl(1, pageSize);
    fetchConnections(1, pageSize);
    refreshAllConnections(); // Refresh stats after save
  }, [updateUrl, fetchConnections, refreshAllConnections, pageSize]);

  /* ================= DELETE ================= */
  const handleDelete = useCallback(
    (connection: WaterConnection) => {
      confirm({
        variant: "delete",
        meta: { name: connection.connectionNo },
        onConfirm: async () => {
          const result = await deleteWaterConnectionAction(connection.id);
          if (result.ok) {
            toast.success(t("delete.success"));
            // After delete, refresh current page connections only
            const targetPage =
              pageData.connections.length === 1 && page > 1 ? page - 1 : page;
            if (targetPage !== page) {
              setPage(targetPage);
              updateUrl(targetPage, pageSize);
            }
            await fetchConnections(targetPage, pageSize);
            refreshAllConnections(); // Refresh stats after delete
          } else {
            toast.error(result.error ?? t("delete.error"));
          }
        },
      });
    },
    [confirm, page, pageSize, pageData.connections.length, t, updateUrl, fetchConnections, refreshAllConnections]
  );

  const stats = useMemo(() => computeStats(allConnections), [allConnections]);
  const totalPages =
    pageData.totalPages ?? Math.max(1, Math.ceil(pageData.totalCount / pageSize));

  /* ================= UI ================= */
  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow text-white">
            <Droplets size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("page.title")}</h1>
            <p className="text-sm text-gray-500">
              {t("page.subtitle")} &bull;{" "}
              <span className="font-medium text-blue-600">
                {pageData.property.propertyNo}
              </span>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <PropertyStatsCards
          stats={stats}
          labels={{
            totalConnections: t("stats.totalConnections"),
            activeConnections: t("stats.activeConnections"),
            stoppedConnections: t("stats.stoppedConnections"),
            yearlyRevenue: t("stats.yearlyRevenue"),
          }}
        />

        {/* Property Info */}
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
                  onChange={(_e, value) => {
                    handlePageSizeChange(Number(value));
                  }}
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

      {/* Drawer for Add / Edit */}
      <AddConnectionDrawer
        open={drawerOpen}
        propertyId={propertyId}
        editingConnection={editingConnection}
        typeOptions={pageData.typeOptions}
        sizeOptions={pageData.sizeOptions}
        statusOptions={pageData.statusOptions}
        rateMasters={pageData.rateMasters}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </PageContainer>
  );
}
