"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import DepartmentCarousel from "@/components/common/DepartmentCarousel";
import ServiceGrid from "@/components/common/ServiceGrid";

import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";

/** ─── Types ─────────────────────────────────────────────── */
type LangText = { en?: string; hi?: string; mr?: string } & Record<string, string | undefined>;

type Service = {
  id: string;
  icon?: string;
  name?: LangText | string;
  title?: LangText | string;
  serviceName?: string;
  [key: string]: unknown;
};

type Department = {
  id: string;
  name: LangText;
  services: Service[];
  image: string;
  icon?: string;
};

export type SearchService = Service & {
  __deptId: string;
  __deptName: string;
};

type DepartmentCarsoulClientProps = {
  departments: Department[];
};

/** ─── i18n UI labels ─────────────────────────────────────── */
const UI = {
  available:     { en: "Available Services", hi: "उपलब्ध सेवाएँ",  mr: "उपलब्ध सेवा" },
  found:         { en: "Services Found",     hi: "सेवाएँ मिलीं",   mr: "सेवा सापडल्या" },
  clear:         { en: "Clear",             hi: "हटाएँ",           mr: "काढा" },
  searchResults: { en: "Search Results",    hi: "खोज परिणाम",     mr: "शोध निकाल" },
  departments:   { en: "Departments",       hi: "विभाग",           mr: "विभाग" },
} as const;

/** ─── Helpers ───────────────────────────────────────────── */
const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, " ").trim();

function safeLang(v: unknown): Language {
  return v === "hi" || v === "mr" || v === "en" ? (v as Language) : "en";
}

function pickLangText(v: LangText | string | undefined, lang: Language): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.hi || v.mr;
}

/** Search across all available langs so search works even after switching language */
function allLabels(v: LangText | string | undefined): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  return [v.en, v.hi, v.mr].filter(Boolean) as string[];
}

/** ─── Component ─────────────────────────────────────────── */
export default function DepartmentCarsoulClient({ departments }: DepartmentCarsoulClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const DEFAULT_DEPT = "property-tax";
  const deptFromUrl = (searchParams.get("deptId") ?? "").trim();
  const [activeDept, setActiveDept] = useState<string>(deptFromUrl || DEFAULT_DEPT);

  const { language } = useLanguage();
  const lang = safeLang(language);
  const localePrefix = `/${lang}`;

  const qRaw  = (searchParams.get("q") ?? "").trim();
  const qNorm = normalize(qRaw);

  // ── Search logic ──────────────────────────────────────────
  const matchedDepts = useMemo<Department[]>(() => {
    if (!qNorm) return [];
    return departments.filter((d) => {
      const labels = allLabels(d?.name);
      return labels.some((lbl) => normalize(lbl).includes(qNorm) || qNorm.includes(normalize(lbl)));
    });
  }, [departments, qNorm]);

  const exactDeptMatches = useMemo<Department[]>(() => {
    if (!qNorm) return [];
    return matchedDepts.filter((d) =>
      allLabels(d?.name).some((lbl) => normalize(lbl) === qNorm)
    );
  }, [qNorm, matchedDepts]);

  const results = useMemo<SearchService[]>(() => {
    if (!qNorm) return [];

    const addMeta = (d: Department, s: Service): SearchService => ({
      ...s,
      __deptId: d.id,
      __deptName: pickLangText(d.name, lang) ?? d.id,
    });

    // Exact dept match → all services in that dept
    if (exactDeptMatches.length > 0) {
      return exactDeptMatches.flatMap((d) => d.services.map((s) => addMeta(d, s)));
    }

    // Partial dept match → all services in matched depts
    const deptServices = matchedDepts.flatMap((d) => d.services.map((s) => addMeta(d, s)));

    // Service-name match across all depts
    const serviceMatches = departments.flatMap((d) =>
      d.services
        .filter((s) => {
          const labels = [
            ...allLabels(s.name as LangText),
            ...allLabels(s.title as LangText),
            typeof s.serviceName === "string" ? s.serviceName : "",
          ].filter(Boolean);
          return labels.some((lbl) => normalize(String(lbl)).includes(qNorm));
        })
        .map((s) => addMeta(d, s))
    );

    const combined = [...deptServices, ...serviceMatches];
    return Array.from(new Map(combined.map((s) => [s.id, s])).values());
  }, [departments, qNorm, matchedDepts, exactDeptMatches, lang]);

  const carouselDeptId = useMemo(() => {
    if (!qNorm) return activeDept;
    if (exactDeptMatches.length === 1) return exactDeptMatches[0].id;
    if (matchedDepts.length === 1) return matchedDepts[0].id;
    return activeDept;
  }, [activeDept, qNorm, exactDeptMatches, matchedDepts]);

  const activeDeptObj   = departments.find((d) => d.id === carouselDeptId);
  const activeDeptLabel = activeDeptObj ? pickLangText(activeDeptObj.name, lang) : "";

  // Restore active dept from URL on browser back navigation
  useEffect(() => {
    const d = (searchParams.get("deptId") ?? "").trim();
    if (d && d !== activeDept) setActiveDept(d);
    if (!d && activeDept !== DEFAULT_DEPT) {
      router.replace(
        `${localePrefix}/service/dashboard?deptId=${encodeURIComponent(activeDept)}`,
        { scroll: false }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Shared onChange handler ───────────────────────────────
  const handleDeptChange = (deptId: string) => {
    setActiveDept(deptId);
    const params = new URLSearchParams();
    params.set("deptId", deptId);
    const q = (searchParams.get("q") ?? "").trim();
    if (q) params.set("q", q);
    router.replace(`${localePrefix}/service/dashboard?${params.toString()}`, { scroll: false });
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 mt-3 md:mt-4">

      {/* ── MOBILE: Horizontal scrollable department tabs (< lg) ── */}
      <div className="lg:hidden w-full">
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {departments.map((dept) => {
            const isActive = dept.id === carouselDeptId && !qNorm;
            const label = pickLangText(dept.name, lang) ?? dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => !qNorm && handleDeptChange(dept.id)}
                disabled={!!qNorm}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all
                  ${isActive
                    ? "bg-teal-600 text-white border-teal-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                  }
                  ${qNorm ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP: Left carousel + Right content (≥ lg) ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 xl:gap-14">

        {/* Vertical Carousel Sidebar — hidden on mobile, shown on lg+ */}
        <div className="hidden lg:flex lg:w-[300px] xl:w-[340px] justify-center flex-shrink-0">
          <DepartmentCarousel
            departments={departments}
            activeDept={carouselDeptId}
            onChange={handleDeptChange}
            disabled={!!qNorm}
          />
        </div>

        {/* Right — Service header + grid */}
        <div className="flex-1 w-full min-w-0">
          {/* Status bar */}
          <div
            className="w-full py-2 px-3 sm:px-4 rounded-xl shadow-sm mb-3 md:mb-4
              flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
              bg-gradient-to-r from-[#fff5f7] via-[#f8f9fe] to-[#fff6ef]
              border border-[#f0e8ff]"
          >
            <div className="flex-1 flex justify-center text-center">
              {qNorm ? (
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 truncate px-2">
                  {exactDeptMatches.length === 1
                    ? `—— ${pickLangText(exactDeptMatches[0].name, lang)} ——`
                    : `${UI.searchResults[lang]} — "${qRaw}"`}
                </h2>
              ) : (
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 truncate px-2">
                  —— {activeDeptLabel} ——
                </h2>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-full shadow text-gray-700 text-xs border border-gray-100 shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>
                {qNorm
                  ? `${results.length} ${UI.found[lang]}`
                  : `${activeDeptObj?.services.length ?? 0} ${UI.available[lang]}`}
              </span>
            </div>

            {qNorm && (
              <button
                onClick={() => router.replace(`${localePrefix}/service/dashboard`, { scroll: false })}
                className="text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 shrink-0 self-center sm:self-auto"
              >
                {UI.clear[lang]}
              </button>
            )}
          </div>

          {/* Service grid */}
          {qNorm ? (
            <ServiceGrid departments={departments} services={results} />
          ) : (
            <ServiceGrid departments={departments} deptId={activeDept} />
          )}
        </div>
      </div>
    </div>
  );
}
