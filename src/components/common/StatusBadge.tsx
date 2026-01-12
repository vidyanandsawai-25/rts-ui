import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  value: string | number | boolean | null | undefined;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  value,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  const isActive =
    String(value ?? "").toLowerCase() === "active" ||
    String(value) === "1" ||
    String(value).toLowerCase() === "true";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border whitespace-nowrap",
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
          : "bg-rose-50 text-rose-700 border-rose-300"
      )}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
