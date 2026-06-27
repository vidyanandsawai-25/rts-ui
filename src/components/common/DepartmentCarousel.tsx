"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";



interface DepartmentCarouselProps {
  departments: Department[];
  activeDept: string;
  onChange: (deptId: string) => void;
  disabled?: boolean;
}

type LangText = { en?: string; hi?: string; mr?: string } & Record<string, string | undefined>;
type Department = {
  id: string;
  name: LangText;
  icon?: string;
  image: string;
  services: unknown[];
};

const ICONS = Icons as unknown as Record<string, LucideIcon>;

const UI = {
  available: { en: "Available Services", hi: "उपलब्ध सेवाएँ", mr: "उपलब्ध सेवा" },
} as const;

function safeLang(v: unknown): Language {
  return v === "hi" || v === "mr" || v === "en" ? (v as Language) : "en";
}

function pickLangText(v: LangText | string | undefined, lang: Language): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.hi || v.mr;
}

// ---- ORDER YOU ASKED (based on English display name) ----
const DEPT_ORDER = [
  "Property Tax",
  "Trade License",
  "Water Connection",
  "NOC",
  "Birth & Death",
  "Town Planning",
  "Marriage Certificate",
  "Education",                         
  "Health",
  "Sanitation",
  "Tree",
];

const normalize = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "").trim();

const ORDER_MAP = new Map(DEPT_ORDER.map((n, i) => [normalize(n), i]));

export default function DepartmentCarousel({
  departments,
  activeDept,
  onChange,
  disabled = false,
}: DepartmentCarouselProps) {
  const { language } = useLanguage();
  const lang = safeLang(language);

  const deptList = useMemo(() => {
    const list = departments as unknown as Department[];

    // stable sort using requested order; anything not found goes to bottom
    return list
      .map((d, originalIndex) => ({ d, originalIndex }))
      .sort((a, b) => {
        const aNameEn = pickLangText(a.d.name, "en") ?? a.d.id;
        const bNameEn = pickLangText(b.d.name, "en") ?? b.d.id;

        const aKey = ORDER_MAP.has(normalize(aNameEn)) ? ORDER_MAP.get(normalize(aNameEn))! : 999;
        const bKey = ORDER_MAP.has(normalize(bNameEn)) ? ORDER_MAP.get(normalize(bNameEn))! : 999;

        if (aKey !== bKey) return aKey - bKey;
        return a.originalIndex - b.originalIndex;
      })
      .map((x) => x.d);
  }, [departments]);

  const activeIndex = useMemo(
    () => deptList.findIndex((d) => d.id === activeDept),
    [deptList, activeDept]
  );

  // If activeDept is missing/invalid, auto-select first department (safe fallback)
  useEffect(() => {
    if (disabled) return;
    if (deptList.length === 0) return;
    if (activeIndex >= 0) return;
    onChange(deptList[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, deptList, disabled]);

  if (deptList.length === 0) return null;

  return (
    <div className="mt-2 w-full max-w-[360px]">
      <div className="flex flex-col gap-2">
        {deptList.map((dept) => {
          const isActive = dept.id === activeDept;

          const IconComp = dept.icon && ICONS[dept.icon] ? ICONS[dept.icon] : ICONS.Circle;

          const deptName = pickLangText(dept.name, lang) ?? dept.id;

          return (
            <button
              key={dept.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dept.id)}
              className={[
                "w-full flex items-center gap-2 rounded-xl border bg-white px-2 py-2 transition",
                "hover:shadow-sm hover:border-gray-300",
                isActive ? "ring-2 ring-orange-400 border-orange-200" : "border-gray-200",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="relative h-10 w-14 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={dept.image}
                  alt={deptName}
                  fill
                  className="object-cover"
                  sizes="56px"
                  priority={isActive}
                />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg border border-gray-100">
                    <IconComp className="w-4 h-4 text-gray-800" />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{deptName}</div>
                    <div className="text-[11px] text-gray-600">
                      {dept.services.length} {UI.available[lang]}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
