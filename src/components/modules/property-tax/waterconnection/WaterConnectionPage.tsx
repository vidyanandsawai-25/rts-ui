"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type {
  WaterConnection,
  WaterConnectionFormModel,
  WaterConnectionPageData,
  TapSizeValue,
  BillingCategory,
} from "@/types/waterconnection.types";
import { TAP_SIZE_RATES } from "@/types/waterconnection.types";
import { PropertyStatsCards } from "./PropertyStatsCards";
import { PropertyInfoCard } from "./PropertyInfoCard";
import { ConnectionsTable } from "./ConnectionsTable";
import { AddConnectionDrawer } from "./AddConnectionDrawer";

let nextId = 100;

function computeStats(connections: WaterConnection[]) {
  const active = connections.filter((c) => c.isActive);
  return {
    totalConnections: connections.length,
    activeConnections: active.length,
    stoppedConnections: connections.length - active.length,
    yearlyRevenue: active.reduce((sum, c) => sum + c.applicableCharges, 0),
  };
}

interface WaterConnectionPageProps {
  initialData: WaterConnectionPageData;
}

export default function WaterConnectionPage({ initialData }: WaterConnectionPageProps) {
  const t = useTranslations("waterConnection");
  const { confirm } = useConfirm();

  const [connections, setConnections] = useState<WaterConnection[]>(initialData.connections);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WaterConnection | null>(null);

  const stats = useMemo(() => computeStats(connections), [connections]);

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

  const handleSave = (data: WaterConnectionFormModel) => {
    const tapSize = data.tapSize as TapSizeValue;
    const applicableRate = TAP_SIZE_RATES[tapSize] ?? data.applicableRate;
    const yearlyCharges = data.isActive ? applicableRate * 12 : 0;

    if (data.id != null) {
      // Update existing
      setConnections((prev) =>
        prev.map((c) =>
          c.id === data.id
            ? {
                ...c,
                connectionNo: data.connectionNo,
                meterNo: data.meterNo,
                type: data.type,
                tapSize: data.tapSize,
                applicableRate,
                applicableCharges: yearlyCharges,
                installDate: data.installDate,
                isActive: data.isActive,
                status: data.isActive,
                stoppedDate: !data.isActive
                  ? new Date().toLocaleDateString("en-IN")
                  : c.stoppedDate,
              }
            : c
        )
      );
    } else {
      // Add new
      const todayStr = new Date().toLocaleDateString("en-IN");
      const newConnection: WaterConnection = {
        id: ++nextId,
        connectionNo: data.connectionNo,
        meterNo: data.meterNo,
        type: data.type,
        tapSize: data.tapSize,
        applicableRate,
        category: "Yearly" as BillingCategory,
        applicableCharges: yearlyCharges,
        installDate: data.installDate,
        activatedDate: todayStr,
        isActive: true,
        status: true,
      };
      setConnections((prev) => [...prev, newConnection]);
    }
  };

  const handleDelete = (connection: WaterConnection) => {
    confirm({
      variant: "delete",
      meta: { name: connection.connectionNo },
      onConfirm: async () => {
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
        toast.success(t("delete.success"));
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
                {initialData.property.propertyNo}
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
          property={initialData.property}
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
          propertyNo={initialData.property.propertyNo}
          connections={connections}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Drawer for Add / Edit */}
      <AddConnectionDrawer
        open={drawerOpen}
        editingConnection={editingConnection}
        onClose={handleClose}
        onSave={handleSave}
      />
    </PageContainer>
  );
}
