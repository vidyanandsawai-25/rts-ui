import { BuildingIcon, Building2, CheckCircle2, Globe2 } from "lucide-react";
import { Card, CardContent } from "@/components/common";
import { cn } from "@/lib/utils/cn";
import type { Office } from "@/types/office.types";

interface OfficeStatsCardsProps {
  data: Office[];
  totalCount: number;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export function OfficeStatsCards({ data, totalCount, t, tCommon }: OfficeStatsCardsProps) {
  const stats = [
    {
      label: t("stats.total"),
      value: totalCount,
      icon: BuildingIcon,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-600"
    },
    {
      label: t("stats.headOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.type === "Head Office").length,
      icon: Building2,
      bgColor: "bg-purple-500",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-600"
    },
    {
      label: t("stats.activeOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.isActive).length,
      icon: CheckCircle2,
      bgColor: "bg-green-500",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "bg-green-600"
    },
    {
      label: t("stats.regionalOffices"),
      subLabel: tCommon("table.onThisPage"),
      value: data.filter(o => o.type === "Regional Office").length,
      icon: Globe2,
      bgColor: "bg-orange-500",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      accentColor: "bg-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden border-none bg-white shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                    {"subLabel" in stat && (
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {stat.subLabel}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                    stat.iconBg,
                    stat.iconColor
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className={cn(
                "absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-150",
                stat.bgColor
              )} />
              <div className={cn(
                "absolute top-0 left-0 h-full w-1.5 transition-all duration-300",
                stat.accentColor
              )} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
