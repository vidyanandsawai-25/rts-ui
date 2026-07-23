"use client";

import { ToggleSwitch } from "@/components/common/ToggleSwitch";

export interface StatusToggleProps {
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  activeText?: string;
  inactiveText?: string;
  disabled?: boolean;
}

export function StatusToggle({
  isActive,
  onToggle,
  label = "Status",
  activeText = "Active",
  inactiveText = "Inactive",
  disabled = false,
}: StatusToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
      <div>
        <label className="text-xs font-medium text-slate-700 block">{label}</label>
        <span className={`text-xs font-semibold ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
          {isActive ? activeText : inactiveText}
        </span>
      </div>
      <ToggleSwitch
        checked={isActive}
        onChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
}
