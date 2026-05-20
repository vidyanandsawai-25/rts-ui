import React from "react";
import { Activity, DollarSign, Droplets, StopCircle } from "lucide-react";

interface StatsData {
  totalConnections: number;
  activeConnections: number;
  stoppedConnections: number;
  yearlyRevenue: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ label, value, icon, gradient }: StatCardProps) {
  return (
    <div className={`${gradient} rounded-xl p-5 text-white flex items-center justify-between`}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">
          {label}
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="opacity-30 text-white">{icon}</div>
    </div>
  );
}

interface PropertyStatsCardsProps {
  stats: StatsData;
  labels: {
    totalConnections: string;
    activeConnections: string;
    stoppedConnections: string;
    yearlyRevenue: string;
  };
}

export function PropertyStatsCards({ stats, labels }: PropertyStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label={labels.totalConnections}
        value={stats.totalConnections}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        icon={<Droplets size={48} />}
      />
      <StatCard
        label={labels.activeConnections}
        value={stats.activeConnections}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
        icon={<Activity size={48} />}
      />
      <StatCard
        label={labels.stoppedConnections}
        value={stats.stoppedConnections}
        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        icon={<StopCircle size={48} />}
      />
      <StatCard
        label={labels.yearlyRevenue}
        value={`₹${stats.yearlyRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        gradient="bg-gradient-to-br from-purple-500 to-pink-500"
        icon={<DollarSign size={48} />}
      />
    </div>
  );
}
