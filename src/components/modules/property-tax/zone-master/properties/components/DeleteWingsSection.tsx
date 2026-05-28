"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, Building2, Info } from "lucide-react";
import { toast } from "sonner";
import { MasterTable } from "@/components/common";
import { Column } from "@/components/common/MasterTable";
import { Badge } from "@/components/common";
import { IconOnlyActionButton } from "@/components/common/ActionButtons";
import {
  fetchSocietyDetailsByPropertyAction,
  deleteSocietyDetailAction,
} from "@/app/[locale]/property-tax/zone-master/actions";
import { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";

interface DeleteWingSummary {
  wingName: string;
  wingId: number;
  wingNo?: string;
  count: number;
  societyDetailIds: number[];
}

interface DeleteWingsSectionProps {
  propertyId: string;
}

export function DeleteWingsSection({ propertyId }: DeleteWingsSectionProps) {
  const [societyDetails, setSocietyDetails] = useState<SocietyDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingWingId, setDeletingWingId] = useState<number | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setSocietyDetails([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSocietyDetailsByPropertyAction(Number(propertyId))
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setSocietyDetails(result.data.items ?? []);
        } else {
          setSocietyDetails([]);
        }
      })
      .catch(() => {
        if (!cancelled) setSocietyDetails([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const wingSummaries = useMemo<DeleteWingSummary[]>(() => {
    const groups = new Map<number, DeleteWingSummary>();

    societyDetails.forEach((item) => {
      const existing = groups.get(item.wingId);
      if (existing) {
        existing.count += 1;
        existing.societyDetailIds.push(item.id);
      } else {
        groups.set(item.wingId, {
          wingName: item.wingName,
          wingId: item.wingId,
          count: 1,
          societyDetailIds: [item.id],
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.wingName.localeCompare(b.wingName)
    );
  }, [societyDetails]);

  const handleDeleteWing = async (wing: DeleteWingSummary) => {
    setDeletingWingId(wing.wingId);
    try {
      const results = await Promise.all(
        wing.societyDetailIds.map((id) => deleteSocietyDetailAction(id))
      );

      const allSucceeded = results.every((r) => r.success);

      if (allSucceeded) {
        setSocietyDetails((prev) =>
          prev.filter((item) => item.wingId !== wing.wingId)
        );
        toast.success(`Wing "${wing.wingName}" deleted successfully`);
      } else {
        toast.error(`Failed to delete wing "${wing.wingName}"`);
      }
    } catch {
      toast.error(`Failed to delete wing "${wing.wingName}"`);
    } finally {
      setDeletingWingId(null);
    }
  };

  const columns: Column<DeleteWingSummary & Record<string, unknown>>[] = [
    {
      label: "Wing Name",
      key: "wingName",
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          {row.wingNo && (
            <Badge variant="default" size="md" className="font-bold">
              {row.wingNo}
            </Badge>
          )}
          <span className="font-medium text-gray-700">{row.wingName}</span>
        </div>
      ),
    },
    {
      label: "Properties",
      key: "count",
      render: (_value, row) => (
        <div className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100 inline-block">
          {row.count} {row.count === 1 ? "property" : "properties"}
        </div>
      ),
    },
    {
      label: "Action",
      key: "wingId",
      align: "center",
      render: (_value, row) => (
        <IconOnlyActionButton
          icon={Trash2}
          onClick={() => handleDeleteWing(row as unknown as DeleteWingSummary)}
          aria-label={`Delete wing ${row.wingName}`}
          variant="ghost"
          size="sm"
          disabled={deletingWingId !== null}
          className="text-red-500 hover:scale-110 transition-transform p-1.5 hover:bg-transparent"
        />
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">Wings</h4>
      </div>

      <div className="p-3 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Wings associated with this property
          </span>
        </div>

        <MasterTable
          columns={
            columns as unknown as Column<Record<string, unknown>>[]
          }
          data={
            wingSummaries as unknown as Record<string, unknown>[]
          }
          isLoading={loading}
          emptyText="No wings found for this property"
          height="xs"
          paginationConfig={{ enabled: false }}
        />
      </div>
    </div>
  );
}
