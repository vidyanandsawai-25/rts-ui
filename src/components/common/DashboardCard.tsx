import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
 
export interface DashboardCardProps {
    label: string;
    value: string | number;
    subLabel?: string;
    icon?: ReactNode;
    iconBg?: string;
    valueColor?: string;
    className?: string;
}
export const DashboardCard = ({
    label,
    value,
    subLabel,
    icon,
    iconBg = "bg-slate-100 text-slate-700",
    valueColor = "text-slate-900",
    className = "",
}: DashboardCardProps) => {
    const baseClasses = cn(
        "relative flex items-center gap-4 rounded-md bg-white px-4 py-1 border border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        className
    );
    return (
        <div
            className={baseClasses}
            role="region"
            aria-label={label}
        >
            {/* Accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1A86E8] rounded-l-md" />
            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <p
                    className={cn("mt-1 text-xl font-bold", valueColor)}
                    title={String(value)}
                >
                    {value}
                </p>
                {subLabel && (
                    <p className="mt-0.5 text-xs text-slate-500">{subLabel}</p>
                )}
            </div>
            {/* Icon */}
            {icon && (
                <div
                    className={cn(
                        "h-9 w-9 rounded flex items-center justify-center border border-slate-300",
                        iconBg
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            )}
        </div>
    );
};
 
DashboardCard.displayName = "DashboardCard";