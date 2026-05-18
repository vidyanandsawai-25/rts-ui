"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type {
  WaterConnection,
  WaterConnectionPageData,
} from "@/types/waterconnection.types";
import { 
  deleteWaterConnectionAction,
  getWaterConnectionPageData
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
}

export default function WaterConnectionPage({ initialData, propertyId }: WaterConnectionPageProps) {
  const t = useTranslations("waterConnection");
  const { confirm } = useConfirm();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WaterConnection | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState<WaterConnectionPageData>(initialData);
  const isFirstRender = useRef(true);

  // Fetch data from server when page or pageSize changes (but not on initial mount)
  useEffect(() => {
    // Skip first render since we already have initialData
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWaterConnectionPageData(propertyId, page, pageSize);
        setPageData(data);
      } catch (error) {
        console.error("Failed to fetch water connections:", error);
        toast.error(t("error.description"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, page, pageSize, t]);

  const stats = useMemo(() => computeStats(pageData.connections), [pageData.connections]);

  const totalPages = Math.max(1, Math.ceil(pageData.totalCount / pageSize));

  const handleAdd = () => {
    setEditingConnection(null);
    setDrawerOpen(true);
  };

  const handleEdit = (connection: WaterConnection) => {
    setEditingConnection(connection);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditingConnection(null);
  };

  const handleSaved = () => {
    setPage(1);
    // Trigger re-fetch by updating a dependency (page will change)
    // Or we can manually fetch here
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWaterConnectionPageData(propertyId, 1, pageSize);
        setPageData(data);
        setPage(1);
      } catch (error) {
        console.error("Failed to refresh water connections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const handlePageChange = useCallback((p: number) => setPage(p), []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleDelete = (connection: WaterConnection) => {
    confirm({
      variant: "delete",
      meta: { name: connection.connectionNo },
      onConfirm: async () => {
        const result = await deleteWaterConnectionAction(connection.id);
        if (result.ok) {
          toast.success(t("delete.success"));
          // Refresh data after delete
          const data = await getWaterConnectionPageData(propertyId, page, pageSize);
          setPageData(data);
        } else {
          toast.error(result.error ?? t("delete.error"));
        }
      },
    });
  };

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
          onPageSizeChange={handlePageSizeChange}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
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
