"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ActionButton } from "@/components/common/ActionButtons";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label?: string;
  options: Option[];
  value: string[]; // single selected value
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
  autoClose?: boolean;
}

export function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  className,
  allowEmpty = false,
  autoClose = true,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedValue = value[0];

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- SELECT VALUE ---------------- */
  const selectValue = (val: string) => {
    if (!allowEmpty || selectedValue !== val) {
      onChange([val]);
    }
    if (autoClose) setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* ---------- TRIGGER (ActionButton) ---------- */}
      <ActionButton
        variant="secondary"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        label={selectedValue ?? placeholder}
        className="
          min-w-[72px]
          justify-between
          border-[#DCEAFF]
          text-gray-700
          hover:bg-[#EEF5FF]
        "
        icon={ChevronDown}
      />

      {/* ---------- DROPDOWN ---------- */}
      {open && (
        <div
          className="
            absolute z-50 mt-1 w-full
            bg-white
            border border-[#DCEAFF]
            rounded-lg
            shadow-lg
            overflow-hidden
          "
        >
          <div className="max-h-56 overflow-auto py-1">
            {options.map((opt) => {
              const selected = opt.value === selectedValue;

              return (
                <div
                  key={opt.value}
                  onClick={() => selectValue(opt.value)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm cursor-pointer",
                    "hover:bg-[#EEF5FF]",
                    selected &&
                      "bg-[#EAF2FF] text-blue-700 font-medium"
                  )}
                >
                  <span>{opt.label}</span>

                  {selected && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
