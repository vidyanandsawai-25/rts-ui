import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  value?: string | number | boolean | null | undefined;
  activeLabel?: string;
  inactiveLabel?: string;
  variant?: 'status' | 'pending' | 'success' | 'error' | 'warning';
  label?: string;
  className?: string;
}

export function StatusBadge({
  value,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  variant = 'status',
  label,
  className,
}: StatusBadgeProps) {
  const isActive =
    String(value ?? "").toLowerCase() === "active" ||
    String(value) === "1" ||
    String(value).toLowerCase() === "true" ||
    value === true;

  const getVariantStyles = () => {
    switch (variant) {
      case 'pending':
        return "bg-amber-50 text-amber-700 border-amber-300";
      case 'success':
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case 'error':
        return "bg-rose-50 text-rose-700 border-rose-300";
      case 'warning':
        return "bg-amber-50 text-amber-700 border-amber-300";
      case 'status':
      default:
        return isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
          : "bg-rose-50 text-rose-700 border-rose-300";
    }
  };

  const Icon = variant === 'pending' || variant === 'warning' || (variant === 'status' && !isActive)
    ? AlertCircle
    : CheckCircle;

  const displayLabel = label || (isActive ? activeLabel : inactiveLabel);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border whitespace-nowrap",
        getVariantStyles(),
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {displayLabel}
    </span>
  );
}
