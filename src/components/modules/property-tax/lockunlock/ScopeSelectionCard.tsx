"use client";

import { MapPin, Grid, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { useTranslations } from "next-intl";

interface ScopeOption {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

interface ScopeSelectionCardProps {
  selectedCategory: number;
  onChange: (categoryId: number) => void;
}

export function ScopeSelectionCard({ selectedCategory, onChange }: ScopeSelectionCardProps) {
  const t = useTranslations("lockUnlock.scopeSelectionCard");

  const SCOPE_OPTIONS: ScopeOption[] = [
    { id: 1, label: t("options.1.label"), sublabel: t("options.1.sublabel"), icon: MapPin },
    { id: 2, label: t("options.2.label"), sublabel: t("options.2.sublabel"), icon: Grid },
    { id: 3, label: t("options.3.label"), sublabel: t("options.3.sublabel"), icon: Building2 },
    { id: 4, label: t("options.4.label"), sublabel: t("options.4.sublabel"), icon: Home },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{t("title")}</h3>
        <p className="text-sm text-slate-500">{t("description")}</p>
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
                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all bg-white relative",
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
