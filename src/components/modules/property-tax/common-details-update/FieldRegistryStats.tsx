"use client";

import { cn } from "@/lib/utils/cn";

import { BulkUpdateMaster } from "@/types/common-details-update/common-details-update.types";

interface FieldRegistryStatsProps {
  t: (key: string) => string;
  fields: BulkUpdateMaster[];
}

export const FieldRegistryStats = ({ t, fields }: FieldRegistryStatsProps) => {


  const totalEligible = fields.length;
  const activeFieldsCount = fields.filter(f => f.isActive).length;
  const generalUserAllowedCount = fields.filter(f => f.apiRoute && !f.apiRoute.includes("Approval") && f.isActive).length;
  const approvalRequiredCount = fields.filter(f => f.apiRoute && f.apiRoute.includes("Approval") && f.isActive).length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label={t("fieldRegistry.stats.totalEligible")}
        value={totalEligible}
        color="blue"
      />
      <StatCard
        label={t("fieldRegistry.stats.activeFields")}
        value={activeFieldsCount}
        color="green"
      />
      <StatCard
        label={t("fieldRegistry.stats.generalUserAllowed")}
        value={generalUserAllowedCount}
        color="amber"
      />
      <StatCard
        label={t("fieldRegistry.stats.approvalRequired")}
        value={approvalRequiredCount}
        color="purple"
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: "blue" | "green" | "amber" | "purple";
}

const StatCard = ({ label, value, color }: StatCardProps) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
  };

  return (
    <div className={cn("rounded-lg border p-4", colorClasses[color])}>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};
