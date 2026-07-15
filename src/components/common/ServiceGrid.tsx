"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Clock, CreditCard, Scale, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";
import { rtsServiceDetails } from "@/data/rtsServiceDetails";
import { Modal } from "./Modal";
import { Button } from "./ActionButton";

type LangText =
  | { en?: string; hi?: string; mr?: string }
  | (Record<string, string | undefined> & { en?: string; hi?: string; mr?: string });

type Service = {
  id: string;
  icon?: string;
  name?: LangText | string;
  title?: LangText | string;
  serviceName?: string;
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
  selectDept: { en: "Select a department", hi: "????? ????? ?????", mr: "????? ????? ?????" },
  noServices: { en: "No services found", hi: "??? ???? ???? ????", mr: "???? ?????? ????" },
  serviceFallback: { en: "Service", hi: "????", mr: "????" },
  serviceDetails: { en: "Service Details", hi: "???? ?????", mr: "???? ?????" },
  close: { en: "Close", hi: "??? ????", mr: "??? ???" },
  apply: { en: "Apply / Process", hi: "????? ????????? ???? ????", mr: "???? ??????????? ??????? ???" },
} as const;

export default function ServiceGrid({
  departments,
  deptId,
  services,
  lang,
}: ServiceGridProps) {
  const { language } = useLanguage();
  const activeLang = safeLang(lang ?? language);
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getTransText = (mr: string, hi: string, en: string) => {
    if (activeLang === "mr") return mr;
    if (activeLang === "hi") return hi;
    return en;
  };

  const dept = deptId ? departments.find((d) => d.id === deptId) : undefined;
  const list: Service[] = services ?? dept?.services ?? [];
  const selectedService =
    selectedServiceId == null
      ? undefined
      : list.find((service) => service.id === selectedServiceId) ??
        departments.flatMap((department) => department.services).find((service) => service.id === selectedServiceId);

  const saveDeptServiceContext = (service: Service) => {
    const deptToUse =
      dept ?? (service.__deptId ? departments.find((d) => d.id === service.__deptId) : undefined);

    if (!deptToUse) return;

    localStorage.setItem("selectedDeptId", deptToUse.id);
    localStorage.setItem("selectedDeptName", JSON.stringify(deptToUse.name));
    localStorage.setItem("selectedServiceName", JSON.stringify(service.name));
    localStorage.setItem("selectedDeptServicesCount", String(deptToUse.services.length));
  };

  const handleApplyClick = (service: Service) => {
    saveDeptServiceContext(service);
    const deptToUseId = dept?.id ?? service.__deptId;
    const serviceHref = deptToUseId
      ? `/service/${service.id}?deptId=${encodeURIComponent(deptToUseId)}`
      : `/service/${service.id}`;

    router.push(serviceHref);
  };

  if (list.length === 0) {
    if (!services && !deptId) {
      return <div className="p-10 text-center text-gray-400">{UI.selectDept[activeLang]}</div>;
    }
    return <div className="p-10 text-center text-gray-400">{UI.noServices[activeLang]}</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 pr-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {list.map((service, index) => {
          const iconKey = service.icon ?? "FileText";
          const Icon = ICONS[iconKey] ?? ICONS.FileText;
          const gradient = gradients[index % gradients.length];

          const label =
            pickLangText(service.name as any, activeLang) ??
            pickLangText(service.title as any, activeLang) ??
            (typeof service.serviceName === "string" ? service.serviceName : undefined) ??
            UI.serviceFallback[activeLang];

          return (
            <div
              key={service.id}
              onClick={() => {
                setSelectedServiceId(service.id);
                setIsDetailsOpen(true);
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
              <div className="flex flex-col items-center text-center space-y-3 w-full">
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

                <h3 className="text-sm xl:text-base leading-tight text-gray-900 group-hover:text-gray-700 font-bold min-h-[2.5rem]">
                  {label}
                </h3>
              </div>
            </div>
          );
        })}
        {isDetailsOpen && selectedServiceId && (() => {
          const selectedDept =
            dept ??
            (selectedService?.__deptId
              ? departments.find((department) => department.id === selectedService.__deptId)
              : departments.find((department) =>
                  department.services.some((service) => service.id === selectedServiceId)
                ));

          const serviceName = selectedService
            ? typeof selectedService.name === "string"
              ? selectedService.name
              : getTransText(
                  (selectedService.name as any)?.mr || "",
                  (selectedService.name as any)?.hi || "",
                  (selectedService.name as any)?.en || selectedService.serviceName || ""
                )
            : UI.serviceDetails[activeLang];

          const deptName = selectedDept
            ? getTransText(
                (selectedDept.name as any)?.mr || "",
                (selectedDept.name as any)?.hi || "",
                (selectedDept.name as any)?.en || ""
              )
            : "";

          const details = rtsServiceDetails[selectedServiceId];
          
          let transSla = "7 Days";
          if (selectedService?.sla !== undefined && selectedService?.sla !== null) {
            transSla = typeof selectedService.sla === "number"
              ? `${selectedService.sla} ${getTransText("दिवस", "दिन", "Days")}`
              : String(selectedService.sla);
          } else if (details) {
            transSla = getTransText(details.sla.mr, details.sla.hi, details.sla.en);
          }

          let transFees = "Free";
          if (selectedService?.feesRequired === false) {
            transFees = getTransText("मोफत", "निःशुल्क", "Free");
          } else if (selectedService?.fees !== undefined && selectedService?.fees !== null) {
            transFees = `₹${selectedService.fees}`;
          } else if (details) {
            transFees = getTransText(details.fees.mr, details.fees.hi, details.fees.en);
          }

          const transOfficer = details ? getTransText(details.officer.mr, details.officer.hi, details.officer.en) : "-";
          const transDocs = details ? (activeLang === "mr" ? details.documents.mr : activeLang === "hi" ? details.documents.hi : details.documents.en) : [];

          return (
            <Modal
              open={isDetailsOpen}
              onClose={() => {
                setIsDetailsOpen(false);
                setSelectedServiceId(null);
              }}
              title={serviceName || UI.serviceDetails[activeLang]}
              subtitle={deptName}
              maxWidth="md"
            >
              <div className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                        {activeLang === "mr" ? "??????? (SLA)" : activeLang === "hi" ? "??? ???? (SLA)" : "Time Limit (SLA)"}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transSla}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                        {activeLang === "mr" ? "????? / ????" : activeLang === "hi" ? "????? / ??????" : "Fees / Charges"}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transFees}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                        {activeLang === "mr" ? "???????? ???????" : activeLang === "hi" ? "???????? ???????" : "Receiving Officer"}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transOfficer}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3">
                  <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>
                      {activeLang === "mr"
                        ? "?????? ???????? ?????????"
                        : activeLang === "hi"
                          ? "?????? ???????? ????????"
                          : "Mandatory Documents Required"}
                    </span>
                  </h5>
                  {transDocs.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-semibold list-disc pl-5">
                      {transDocs.map((doc, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold italic">
                      {activeLang === "mr"
                        ? "?? ???????? ??????? ????????? ???? ?????? ?????."
                        : activeLang === "hi"
                          ? "?? ???? ?? ??? ??? ???????? ????????? ???? ????"
                          : "No documents specified for this service."}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedServiceId(null);
                    }}
                    className="font-bold"
                  >
                    {UI.close[activeLang]}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedServiceId(null);
                      if (selectedService) {
                        handleApplyClick(selectedService);
                      }
                    }}
                    className="font-extrabold"
                  >
                    {UI.apply[activeLang]} &rarr;
                  </Button>
                </div>
              </div>
            </Modal>
          );
        })()}
      </div>
    </div>
  );
}
