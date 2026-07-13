"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DepartmentCarousel from "@/components/common/DepartmentCarousel";
import ServiceGrid from "@/components/common/ServiceGrid";
import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";

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
  displayOrder: number;
};

export type SearchService = Service & {
  __deptId: string;
  __deptName: string;
};

type DepartmentCarsoulClientProps = {
  departments: Department[];
};

const UI = {
  available: { en: "Available Services", hi: "Available Services", mr: "Available Services" },
  found: { en: "Services Found", hi: "Services Found", mr: "Services Found" },
  clear: { en: "Clear", hi: "Clear", mr: "Clear" },
  searchResults: { en: "Search Results", hi: "Search Results", mr: "Search Results" },
} as const;

const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, " ").trim();

function safeLang(v: unknown): Language {
  return v === "hi" || v === "mr" || v === "en" ? (v as Language) : "en";
}

function pickLangText(v: LangText | string | undefined, lang: Language): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.hi || v.mr;
}

function allLabels(v: LangText | string | undefined): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  return [v.en, v.hi, v.mr].filter(Boolean) as string[];
}

export default function DepartmentCarsoulClient({ departments }: DepartmentCarsoulClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptFromUrl = (searchParams.get("deptId") ?? "").trim();

  const { language } = useLanguage();
  const lang = safeLang(language);
  const localePrefix = `/${lang}`;

  const qRaw = (searchParams.get("q") ?? "").trim();
  const qNorm = normalize(qRaw);

  const matchedDepts = useMemo(() => {
    if (!qNorm) return [] as Department[];
    return departments.filter((department) =>
      allLabels(department.name).some((label) => normalize(label).includes(qNorm) || qNorm.includes(normalize(label))),
    );
  }, [departments, qNorm]);

  const exactDeptMatches = useMemo(() => {
    if (!qNorm) return [] as Department[];
    return matchedDepts.filter((department) => allLabels(department.name).some((label) => normalize(label) === qNorm));
  }, [matchedDepts, qNorm]);

  const results = useMemo(() => {
    if (!qNorm) return [] as SearchService[];

    const addMeta = (department: Department, service: Service): SearchService => ({
      ...service,
      __deptId: department.id,
      __deptName: pickLangText(department.name, lang) ?? department.id,
    });

    if (exactDeptMatches.length > 0) {
      return exactDeptMatches.flatMap((department) => department.services.map((service) => addMeta(department, service)));
    }

    const deptServices = matchedDepts.flatMap((department) => department.services.map((service) => addMeta(department, service)));
    const serviceMatches = departments.flatMap((department) =>
      department.services
        .filter((service) => {
          const labels = [
            ...allLabels(service.name as LangText),
            ...allLabels(service.title as LangText),
            typeof service.serviceName === "string" ? service.serviceName : "",
          ].filter(Boolean);
          return labels.some((label) => normalize(String(label)).includes(qNorm));
        })
        .map((service) => addMeta(department, service)),
    );

    return Array.from(new Map([...deptServices, ...serviceMatches].map((service) => [service.id, service])).values());
  }, [departments, exactDeptMatches, lang, matchedDepts, qNorm]);

  const selectedDeptId = useMemo(() => {
    if (deptFromUrl) return deptFromUrl;
    return departments[0]?.id || "";
  }, [deptFromUrl, departments]);

  const carouselDeptId = useMemo(() => {
    if (!qNorm) return selectedDeptId;
    if (exactDeptMatches.length === 1) return exactDeptMatches[0].id;
    if (matchedDepts.length === 1) return matchedDepts[0].id;
    return selectedDeptId;
  }, [exactDeptMatches, matchedDepts, qNorm, selectedDeptId]);

  const activeDeptObj = departments.find((department) => department.id === carouselDeptId);
  const activeDeptLabel = activeDeptObj ? pickLangText(activeDeptObj.name, lang) : "";

  useEffect(() => {
    if (!deptFromUrl && departments[0]) {
      router.replace(`${localePrefix}/service/dashboard?deptId=${encodeURIComponent(departments[0].id)}`, { scroll: false });
    }
  }, [deptFromUrl, departments, localePrefix, router]);

  const handleDeptChange = (deptId: string) => {
    const params = new URLSearchParams();
    params.set("deptId", deptId);
    const q = (searchParams.get("q") ?? "").trim();
    if (q) params.set("q", q);
    router.replace(`${localePrefix}/service/dashboard?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-3 flex flex-col gap-3 md:mt-4">
      <div className="w-full lg:hidden">
        <div
          className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 sm:-mx-4 sm:px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {departments.map((department) => {
            const isActive = department.id === carouselDeptId && !qNorm;
            const label = pickLangText(department.name, lang) ?? department.id;
            return (
              <button
                key={department.id}
                type="button"
                onClick={() => !qNorm && handleDeptChange(department.id)}
                disabled={!!qNorm}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                } ${qNorm ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-10 xl:gap-14">
        <div className="hidden flex-shrink-0 justify-center lg:flex lg:w-[300px] xl:w-[340px]">
          <DepartmentCarousel
            departments={departments}
            activeDept={carouselDeptId}
            onChange={handleDeptChange}
            disabled={!!qNorm}
          />
        </div>

        <div className="min-w-0 flex-1 w-full">
          <div className="mb-3 flex w-full flex-col gap-2 rounded-xl border border-[#f0e8ff] bg-gradient-to-r from-[#fff5f7] via-[#f8f9fe] to-[#fff6ef] px-3 py-2 shadow-sm sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex flex-1 justify-center text-center">
              {qNorm ? (
                <h2 className="truncate px-2 text-sm font-semibold text-gray-700 sm:text-base md:text-lg">
                  {exactDeptMatches.length === 1
                    ? `---- ${pickLangText(exactDeptMatches[0].name, lang)} ----`
                    : `${UI.searchResults[lang]} - \"${qRaw}\"`}
                </h2>
              ) : (
                <h2 className="truncate px-2 text-sm font-semibold text-gray-700 sm:text-base md:text-lg">
                  ---- {activeDeptLabel} ----
                </h2>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1 text-xs text-gray-700 shadow">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>
                {qNorm
                  ? `${results.length} ${UI.found[lang]}`
                  : `${activeDeptObj?.services.length ?? 0} ${UI.available[lang]}`}
              </span>
            </div>

            {qNorm ? (
              <button
                onClick={() => router.replace(`${localePrefix}/service/dashboard`, { scroll: false })}
                className="shrink-0 self-center rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-gray-50 sm:self-auto"
              >
                {UI.clear[lang]}
              </button>
            ) : null}
          </div>

          {qNorm ? (
            <ServiceGrid departments={departments} services={results} />
          ) : (
            <ServiceGrid departments={departments} deptId={selectedDeptId} />
          )}
        </div>
      </div>
    </div>
  );
}
