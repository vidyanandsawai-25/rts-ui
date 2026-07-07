"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { ToggleSwitch, ValidationMessage } from "@/components/common";
import { cn } from "@/lib/utils/cn";

interface StatusToggleCardProps {
  isEdit: boolean;
  isActive: boolean;
  onToggle: () => void;
  error?: string;
  statusLabel: string;
  activeLabel: string;
  inactiveLabel: string;
}

export const StatusToggleCard = React.forwardRef<HTMLButtonElement, StatusToggleCardProps>(
  ({
    isEdit,
    isActive,
    onToggle,
    error,
    statusLabel,
    activeLabel,
    inactiveLabel,
  }, ref) => {
    if (!isEdit) return null;

    return (
      <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
        <div
          className={cn(
            "rounded-xl p-3 flex items-center justify-between transition-colors",
            isActive ? "border border-blue-200 bg-[#F0F6FF]" : "border border-gray-200 bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
              )}
            >
              {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
            </div>
            <div>
              <div className={cn("font-medium", isActive ? "text-[#1E3A8A]" : "text-gray-700")}>
                {statusLabel}
              </div>
              <div className={cn("text-sm", isActive ? "text-gray-500" : "text-gray-400")}>
                {isActive ? activeLabel : inactiveLabel}
              </div>
            </div>
          </div>
          <ToggleSwitch ref={ref} checked={isActive} onChange={onToggle} showPopup={false} />
        </div>

        <ValidationMessage message={error} visible={!!error} />
      </div>
    );
  }
);

StatusToggleCard.displayName = "StatusToggleCard";
