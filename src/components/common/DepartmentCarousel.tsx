"use client";

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
  displayOrder: number;
  services: unknown[];
};

const ICONS = Icons as unknown as Record<string, LucideIcon>;

const UI = {
  available: { en: "Available Services", hi: "उपलब्ध सेवाएँ", mr: "उपलब्ध सेवा" },
} as const;

const gradients = [
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #FFC3A0 0%, #FFAFBD 100%)",
  "linear-gradient(135deg, #FFE6C7 0%, #FFC478 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
];

function safeLang(v: unknown): Language {
  return v === "hi" || v === "mr" || v === "en" ? (v as Language) : "en";
}

function pickLangText(v: LangText | string | undefined, lang: Language): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.hi || v.mr;
}

export default function DepartmentCarousel({
  departments,
  activeDept,
  onChange,
  disabled = false,
}: DepartmentCarouselProps) {
  const { language } = useLanguage();
  const lang = safeLang(language);

  // Sort by DisplayOrder from DB — fully dynamic, no hardcoding
  const deptList = useMemo(() => {
    const list = departments as unknown as Department[];
    return [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [departments]);

  const activeIndex = useMemo(
    () => deptList.findIndex((d) => d.id === activeDept),
    [deptList, activeDept]
  );

  // If activeDept is missing/invalid, auto-select first department (safe fallback)
  useEffect(() => {
    if (disabled) return;
    if (deptList.length === 0) return;
    if (activeIndex >= 0 || activeDept === "" || activeDept === "dashboard") return;
    onChange(deptList[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, deptList, disabled, activeDept]);

  if (deptList.length === 0) return null;

  return (
    <div className="mt-2 w-full max-w-[360px]">
      <div className="flex flex-col mx-3 my-1.5">
        {/* Dashboard Overview button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("")}
          className={[
            "w-full flex items-center gap-3 my-1.5 rounded-xl border bg-white p-2.5 transition group",
            "hover:shadow-md hover:border-gray-300",
            (activeDept === "" || activeDept === "dashboard") ? "ring-2 ring-teal-500 border-teal-200 bg-teal-50/5" : "border-gray-200",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)" }}
          >
            <Icons.LayoutDashboard size={24} />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-bold text-gray-900 truncate">
              {lang === "mr" ? "डॅशबोर्ड विहंगावलोकन" : lang === "hi" ? "डैशबोर्ड" : "Dashboard Overview"}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
              {lang === "mr" ? "स्थिती आणि प्रगती" : lang === "hi" ? "स्थिति और प्रगति" : "Status & Progress"}
            </div>
          </div>
        </button>

        {deptList.map((dept, index) => {
          const isActive = dept.id === activeDept;

          const IconComp = dept.icon && ICONS[dept.icon] ? ICONS[dept.icon] : ICONS.Circle;

          const deptName = pickLangText(dept.name, lang) ?? dept.id;
          const gradient = gradients[index % gradients.length];

          return (
            <button
              key={dept.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dept.id)}
              className={[
                "w-full flex items-center gap-3 my-1.5 rounded-xl border bg-white p-2 transition group",
                "hover:shadow-md hover:border-gray-300",
                isActive ? "ring-2 ring-orange-400 border-orange-200" : "border-gray-200",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ background: gradient }}
              >
                <IconComp size={24} />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-bold text-gray-900 truncate">{deptName}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {dept.services.length} {UI.available[lang]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
