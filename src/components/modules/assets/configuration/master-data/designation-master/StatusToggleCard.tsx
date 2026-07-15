"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { ToggleSwitch, ValidationMessage } from "@/components/common";
import { cn } from "@/lib/utils/cn";

interface StatusToggleCardProps {
  statusToggleRef: React.RefObject<HTMLButtonElement | null>;
  isActive: boolean;
  handleToggleStatus: (checked: boolean) => void;
  statusLabel: string;
  statusDescription: string;
  activeText: string;
  inactiveText: string;
  errorMessage?: string;
}

export function StatusToggleCard({
  statusToggleRef,
  isActive,
  handleToggleStatus,
  statusLabel,
  statusDescription,
  activeText,
  inactiveText,
  errorMessage,
}: StatusToggleCardProps) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
      <div
        className={cn(
          "rounded-xl p-3 flex items-center justify-between",
          isActive
            ? "border border-blue-200 bg-[#F0F6FF]"
            : "border border-gray-200 bg-gray-50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-full",
              isActive
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-900"
            )}
          >
            {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{statusLabel}</div>
            <div className="text-sm text-gray-500">
              {statusDescription}
              {isActive ? ` ${activeText}` : ` ${inactiveText}`}
            </div>
          </div>
        </div>

        <ToggleSwitch
          ref={statusToggleRef}
          checked={isActive}
          onChange={handleToggleStatus}
          showPopup={false}
          activeLabel={activeText}
          inactiveLabel={inactiveText}
        />
      </div>
      <ValidationMessage message={errorMessage} className="mt-2" />
    </div>
  );
}
