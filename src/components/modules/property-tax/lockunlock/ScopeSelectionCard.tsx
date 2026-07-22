"use client";

import { MapPin, Grid, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { Card } from "@/components/common";


const SCOPE_ICONS = [
  { id: 1, key: "zone", icon: MapPin },
  { id: 2, key: "ward", icon: Grid },
  { id: 3, key: "building", icon: Building2 },
  { id: 4, key: "propertyRange", icon: Home },
];

interface ScopeSelectionCardProps {
  selectedCategory: number;
  onChange: (categoryId: number) => void;
}

export function ScopeSelectionCard({ selectedCategory, onChange }: ScopeSelectionCardProps) {
  const t = useTranslations("lockUnlock");
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{t("scopeSelectionCard.title")}</h3>
        <p className="text-sm text-slate-500">{t("scopeSelectionCard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SCOPE_ICONS.map((option) => {
          const isSelected = selectedCategory === option.id;
          const Icon = option.icon;

          return (
            <Card
              key={option.id}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              padding="none"
              onClick={() => onChange(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.id);
                }
              }}
              className={cn(
                "flex items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50",
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-50"
                  : "border-slate-100 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 shrink-0",
                  isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                0{option.id}
              </div>
              <Icon
                className={cn(
                  "w-5 h-5 mb-1 shrink-0",
                  isSelected ? "text-blue-600" : "text-slate-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold text-center leading-tight whitespace-normal text-left",
                  isSelected ? "text-blue-700" : "text-slate-700"
                )}
              >
                {t(`scopeSelectionCard.options.${option.key}.label`)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight whitespace-normal text-left hidden sm:inline-block">
                {t(`scopeSelectionCard.options.${option.key}.sublabel`)}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
