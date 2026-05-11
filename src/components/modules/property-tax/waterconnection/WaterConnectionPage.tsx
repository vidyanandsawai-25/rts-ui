"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/common";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type {
  WaterConnection,
  WaterConnectionPageData,
} from "@/types/waterconnection.types";
import { deleteWaterConnectionAction } from "@/app/[locale]/property-tax/waterconnection/action";
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
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<WaterConnection | null>(null);

  const stats = useMemo(() => computeStats(initialData.connections), [initialData.connections]);

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
    router.refresh();
  };

  const handleDelete = (connection: WaterConnection) => {
    confirm({
      variant: "delete",
      meta: { name: connection.connectionNo },
      onConfirm: async () => {
        const result = await deleteWaterConnectionAction(connection.id);
        if (result.ok) {
          toast.success(t("delete.success"));
          router.refresh();
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
          connections={initialData.connections}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Drawer for Add / Edit */}
      <AddConnectionDrawer
        open={drawerOpen}
        propertyId={propertyId}
        editingConnection={editingConnection}
        typeOptions={initialData.typeOptions}
        sizeOptions={initialData.sizeOptions}
        statusOptions={initialData.statusOptions}
        rateMasters={initialData.rateMasters}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </PageContainer>
  );
}
