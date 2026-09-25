"use client";

import { CheckCircle2, X } from "lucide-react";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { ValidationMessage } from "@/components/common/ValidationMessage";
import { cn } from "@/lib/utils/cn";

export interface CategoryStatusCardProps {
  isActive: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  onLabel: string;
  offLabel: string;
  error?: string;
}

export function CategoryStatusCard({
  isActive,
  onChange,
  title,
  onLabel,
  offLabel,
  error,
}: Readonly<CategoryStatusCardProps>) {
  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-white p-4">
      <div
        className={cn(
          "rounded-xl p-3 flex items-center justify-between",
          isActive ? "border border-blue-200 bg-[#F0F6FF]" : "border border-gray-200 bg-gray-50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-full",
              isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-900"
            )}
          >
            {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
          </div>
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-500">{isActive ? onLabel : offLabel}</div>
          </div>
        </div>
        <ToggleSwitch checked={isActive} onChange={onChange} showPopup={false} />
      </div>
      <ValidationMessage message={error} visible={Boolean(error)} />
    </div>
  );
}
