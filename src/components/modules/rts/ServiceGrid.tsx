"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { MoveRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLocale } from "next-intl";
import { getServiceFormConfig } from "@/data/serviceFormConfig";
type Language = "en" | "hi" | "mr";

/** Types */
type LangText =
  | { en?: string; hi?: string; mr?: string }
  | (Record<string, string | undefined> & { en?: string; hi?: string; mr?: string });

type Service = {
  id: string;
  icon?: string;
  name?: LangText | string;
  title?: LangText | string;
  serviceName?: string;

  // search results add these meta fields
  __deptId?: string;
  __deptName?: string;

  [key: string]: unknown;
};

type Department = {
  id: string;
  name: LangText;
  services: Service[];
};
const ICONS = Icons as unknown as Record<string, LucideIcon>;

interface ServiceGridProps {
  departments: Department[];
  deptId?: string;
  services?: Service[];

  /** ✅ optional override */
  lang?: Language;
}

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
  return (v as any)[lang] || (v as any).en || (v as any).hi || (v as any).mr;
}

const UI = {
  selectDept: { en: "Select a department", hi: "कृपया विभाग चुनें", mr: "कृपया विभाग निवडा" },
  noServices: { en: "No services found", hi: "कोई सेवा नहीं मिली", mr: "सेवा सापडली नाही" },
  serviceFallback: { en: "Service", hi: "सेवा", mr: "सेवा" },
} as const;

export default function ServiceGrid({
  departments,
  deptId,
  services,
  lang,
}: ServiceGridProps) {
  const locale = useLocale();
  const language = locale as Language;
  const activeLang = safeLang(lang ?? language);

  const dept = deptId ? departments.find((d) => d.id === deptId) : undefined;
  const list: Service[] = services ?? dept?.services ?? [];

  if (list.length === 0) {
    if (!services && !deptId) {
      return <div className="p-10 text-center text-gray-400">{UI.selectDept[activeLang]}</div>;
    }
    return <div className="p-10 text-center text-gray-400">{UI.noServices[activeLang]}</div>;
  }

  const saveDeptServiceContext = (service: Service) => {
    const deptToUse =
      dept ?? (service.__deptId ? departments.find((d) => d.id === service.__deptId) : undefined);

    if (!deptToUse) return;

    localStorage.setItem("selectedDeptId", deptToUse.id);
    localStorage.setItem("selectedDeptName", JSON.stringify(deptToUse.name));
    localStorage.setItem("selectedServiceName", JSON.stringify(service.name));
    localStorage.setItem("selectedDeptServicesCount", String(deptToUse.services.length));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 pr-4">
        {list.map((s, index) => {
          const iconKey = s.icon ?? "FileText";
          const Icon = ICONS[iconKey] ?? ICONS.FileText;
          const gradient = gradients[index % gradients.length];

          const label =
            pickLangText(s.name as any, activeLang) ??
            pickLangText(s.title as any, activeLang) ??
            (typeof s.serviceName === "string" ? s.serviceName : undefined) ??
            UI.serviceFallback[activeLang];

          const deptToUseId = dept?.id ?? s.__deptId;
          const hasForm = !!getServiceFormConfig(s.id);
          const serviceHref = deptToUseId
            ? `/service/${s.id}?deptId=${encodeURIComponent(deptToUseId)}`
            : `/service/${s.id}`;

          return (
            <Link
              key={s.id}
              href={hasForm ? serviceHref : "#"}
              onClick={(e) => {
                if (!hasForm) {
                  e.preventDefault();
                  const msg = activeLang === "mr" 
                    ? `${label} अर्ज सेवा सध्या उपलब्ध नाही (डेमो).` 
                    : activeLang === "hi" 
                      ? `${label} आवेदन सेवा अभी उपलब्ध नहीं है (डेमो)।` 
                      : `${label} application service is not available (Demo).`;
                  alert(msg);
                } else {
                  saveDeptServiceContext(s);
                }
              }}
              className="
                rounded-2xl p-4 border-2 border-gray-200
                bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)]
                hover:border-gray-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]
                transition-all duration-300 cursor-pointer
                group relative mt-3
                flex flex-col items-center text-center space-y-3
              "
            >
              <div
                className="
                  w-14 h-14 rounded-full flex items-center justify-center
                  shadow-md group-hover:scale-110 group-hover:-translate-y-1
                  transition-transform
                "
                style={{ background: gradient }}
              >
                <Icon className="text-white" size={30} />
              </div>

              <h3 className="text-sm xl:text-base leading-tight min-h-[2.5rem] text-gray-900 group-hover:text-gray-700 font-medium">
                {label}
              </h3>

              <MoveRight
                size={18}
                className="
                  absolute bottom-3 right-3 text-gray-300
                  opacity-0 -translate-x-2
                  group-hover:opacity-100 group-hover:translate-x-0
                  group-hover:text-gray-700
                  transition-all duration-300
                "
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
