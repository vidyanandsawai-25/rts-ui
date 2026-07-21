"use client";

import { MapPin, Grid, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ScopeOption {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  { id: 1, label: "Zone / Node", sublabel: "Zone-wise selection", icon: MapPin },
  { id: 2, label: "Ward / Sector", sublabel: "Multi ward selection", icon: Grid },
  { id: 3, label: "Building Wise", sublabel: "Building level", icon: Building2 },
  { id: 4, label: "Property Range", sublabel: "From-to property range", icon: Home },
];

interface ScopeSelectionCardProps {
  selectedCategory: number;
  onChange: (categoryId: number) => void;
}

export function ScopeSelectionCard({ selectedCategory, onChange }: ScopeSelectionCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-800">1. Scope Selection</h3>
        <p className="text-sm text-slate-500">Choose scope. Only relevant fields appear below.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SCOPE_OPTIONS.map((option) => {
          const isSelected = selectedCategory === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all bg-white relative",
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-50"
                  : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1",
                  isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                0{option.id}
              </div>
              <Icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isSelected ? "text-blue-600" : "text-slate-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold text-center leading-tight",
                  isSelected ? "text-blue-700" : "text-slate-700"
                )}
              >
                {option.label}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">{option.sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
