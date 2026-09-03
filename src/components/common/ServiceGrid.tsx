"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as Icons from "lucide-react";
import { Clock, CreditCard, LoaderCircle, Scale, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/Providers/LanguageProvider";
import {
  getInternalRtsServiceHref,
  isExternalServiceUrl,
  isServiceUrlStruck,
  openExternalServiceTab,
  navigateExternalServiceTab,
  prepareExternalServiceNavigation,
} from "@/lib/utils/rts/service-navigation";
import {
  getServiceDetailsModalInfoAction,
  resolveExternalServiceNavigationAction,
} from "@/app/[locale]/service/dashboard/actions";
import type { Language } from "@/types/language.type";
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
  serviceUrl?: string | null;
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
  upicId?: string;
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



export default function ServiceGrid({
  departments,
  deptId,
  services,
  lang,
  upicId,
}: ServiceGridProps) {
  const { language } = useLanguage();
  const activeLang = safeLang(lang ?? language);
  const t = useTranslations("rts.serviceGrid");
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isCreatingExternalApplication, startExternalTransition] = useTransition();

  const [modalDetails, setModalDetails] = useState<{
    loading: boolean;
    documents: { en: string; mr?: string; hi?: string }[];
    receivingOfficer: string;
    receivingOfficerDetails: {
      fullName: string | null;
      userName: string | null;
      designation: string | null;
    };
    receivingOfficers: Array<{
      stageOrder: number;
      fullName: string | null;
      userName: string | null;
      designation: string | null;
      zoneName?: string | null;
      mobileNo?: string | null;
      email?: string | null;
      officeAddress?: string | null;
    }>;
  }>({
    loading: false,
    documents: [],
    receivingOfficer: '-',
    receivingOfficerDetails: { fullName: null, userName: null, designation: null },
    receivingOfficers: [],
  });

  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  useEffect(() => {
    if (!isDetailsOpen || !selectedServiceId) {
      setModalDetails({
        loading: false,
        documents: [],
        receivingOfficer: '-',
        receivingOfficerDetails: { fullName: null, userName: null, designation: null },
        receivingOfficers: [],
      });
      setSelectedZoneIndex(0);
      return;
    }

    let active = true;
    setModalDetails((prev) => ({ ...prev, loading: true }));
    setSelectedZoneIndex(0);

    void (async () => {
      try {
        const info = await getServiceDetailsModalInfoAction(Number(selectedServiceId), activeLang);
        if (!active) return;
        setModalDetails({
          loading: false,
          documents: info.documents,
          receivingOfficer: info.receivingOfficer,
          receivingOfficerDetails: info.receivingOfficerDetails,
          receivingOfficers: info.receivingOfficers,
        });
      } catch {
        if (!active) return;
        setModalDetails({
          loading: false,
          documents: [],
          receivingOfficer: '-',
          receivingOfficerDetails: { fullName: null, userName: null, designation: null },
          receivingOfficers: [],
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [isDetailsOpen, selectedServiceId]);

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
      : list.find((service) => String(service.id) === String(selectedServiceId)) ??
      departments.flatMap((department) => department.services).find((service) => String(service.id) === String(selectedServiceId));

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
    const rawUrl = typeof service.serviceUrl === "string" ? service.serviceUrl.trim() : "";
    const locale = params.locale && ["en", "hi", "mr"].includes(params.locale) ? params.locale : "en";

    // 1. '#' or placeholder -> Struck: Do NOT redirect anywhere and do NOT show form
    if (isServiceUrlStruck(rawUrl)) {
      setApplyError(
        locale === "mr"
          ? "ही सेवा सध्या प्रगतीपथावर आहे / उपलब्ध नाही."
          : locale === "hi"
            ? "यह सेवा वर्तमान में उपलब्ध नहीं है।"
            : "This service is currently under development / not available."
      );
      return;
    }

    // 2. Valid URL -> External Redirect Logic (Passes UPIC if citizen is logged in)
    if (isExternalServiceUrl(rawUrl)) {
      const navigation = prepareExternalServiceNavigation(rawUrl, upicId);

      if (!navigation.ok && navigation.reason === "invalid-url") {
        setApplyError(t("invalidServiceUrl"));
        return;
      }

      const externalTab = openExternalServiceTab();
      if (!externalTab) {
        setApplyError(
          locale === "mr"
            ? "तुमच्या ब्राउझरने नवीन टॅब ब्लॉक केला आहे. कृपया पॉप-अपला परवानगी द्या."
            : locale === "hi"
              ? "आपके ब्राउज़र ने नया टैब ब्लॉक कर दिया है। कृपया पॉप-अप की अनुमति दें।"
              : "Your browser blocked the external service tab. Please allow pop-ups and try again."
        );
        return;
      }

      startExternalTransition(async () => {
        const result = await resolveExternalServiceNavigationAction(Number(service.id));

        if (!result.success) {
          externalTab.close();
          if (result.errorCode === "login-required") {
            router.push(`/${locale}/service/login?externalServiceId=${encodeURIComponent(service.id)}`);
            return;
          }

          setApplyError(result.error);
          return;
        }

        saveDeptServiceContext(service);
        setIsDetailsOpen(false);
        setSelectedServiceId(null);
        navigateExternalServiceTab(externalTab, result.destination);
      });
      return;
    }

    // 3. null / empty -> Show dynamic fields form
    saveDeptServiceContext(service);
    const deptToUseId = dept?.id ?? service.__deptId;
    const serviceHref = getInternalRtsServiceHref(locale, service.id, deptToUseId);

    setIsDetailsOpen(false);
    setSelectedServiceId(null);
    router.push(serviceHref);
  };

  if (list.length === 0) {
    if (!services && !deptId) {
      return <div className="p-10 text-center text-gray-400">{t("selectDept")}</div>;
    }
    return <div className="p-10 text-center text-gray-400">{t("noServices")}</div>;
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
            t("serviceFallback");

          return (
            <div
              key={service.id}
              onClick={() => {
                setApplyError(null);
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
            : t("serviceGrid.serviceDetails");

          const deptName = selectedDept
            ? getTransText(
              (selectedDept.name as any)?.mr || "",
              (selectedDept.name as any)?.hi || "",
              (selectedDept.name as any)?.en || ""
            )
            : "";

          let transSla = "7 Days";
          if (selectedService?.sla !== undefined && selectedService?.sla !== null) {
            transSla = typeof selectedService.sla === "number"
              ? `${selectedService.sla} ${t("days")}`
              : String(selectedService.sla);
          }

          let transFees = "Free";
          if (selectedService?.feesRequired === false) {
            transFees = t("free");
          } else if (selectedService?.fees !== undefined && selectedService?.fees !== null) {
            transFees = Number(selectedService.fees) > 0 ? `₹${selectedService.fees}` : t("free");
          }

          const fallbackOfficer =
            modalDetails.receivingOfficer && modalDetails.receivingOfficer !== '-'
              ? modalDetails.receivingOfficer
              : (selectedService?.receivingOfficer as string) || (selectedService?.officerName as string) || '-';
          const fullName = modalDetails.receivingOfficerDetails.fullName || fallbackOfficer;
          const officerDisplay = modalDetails.receivingOfficerDetails.userName
            ? `${fullName} (${modalDetails.receivingOfficerDetails.userName})`
            : fullName;
          const receivingOfficers = modalDetails.receivingOfficers;

          const transDocs: string[] = modalDetails.documents.map((doc) => {
            if (activeLang === 'mr') return doc.mr || doc.en;
            if (activeLang === 'hi') return doc.hi || doc.en;
            return doc.en;
          });

          return (
            <Modal
              open={isDetailsOpen}
              onClose={() => {
                setIsDetailsOpen(false);
                setSelectedServiceId(null);
                setApplyError(null);
              }}
              title={serviceName || t("serviceDetails")}
              subtitle={deptName}
              maxWidth="md"
            >
              <div className="space-y-5 text-left">
                {applyError ? (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {applyError}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">
                        {t("timeLimitSla")}
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
                        {t("feesCharges")}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">{transFees}</p>
                    </div>
                  </div>

                </div>

                <section className="rounded-xl border border-emerald-200/90 bg-emerald-50/50 p-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 leading-none">
                          {t("receivingOfficer")}
                        </p>
                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 leading-tight">
                          {activeLang === 'mr' ? 'प्रभाग समितीनिहाय पदनिर्देशित अधिकारी' : 'Prabhag Samiti-wise Designated Officers'}
                        </p>
                      </div>
                    </div>
                    {receivingOfficers.length > 1 && (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {receivingOfficers.length} {activeLang === 'mr' ? 'प्रभाग' : 'Prabhags'}
                      </span>
                    )}
                  </div>

                  {receivingOfficers.length > 0 ? (
                    <div className="pt-2 space-y-2">
                      {/* Prabhag Samiti Tabs if multiple zones */}
                      {receivingOfficers.length > 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white rounded-lg border border-emerald-200/80">
                          {receivingOfficers.map((officer, idx) => (
                            <button
                              key={`${officer.stageOrder}-${idx}`}
                              type="button"
                              onClick={() => setSelectedZoneIndex(idx)}
                              className={`py-1.5 px-2 text-xs font-bold rounded-md transition-all text-center truncate ${
                                selectedZoneIndex === idx
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                              }`}
                              title={officer.zoneName || `Prabhag ${idx + 1}`}
                            >
                              {officer.zoneName || `Prabhag ${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Compact Card for Selected Prabhag Samiti */}
                      {(() => {
                        const activeOfficer = receivingOfficers[selectedZoneIndex] || receivingOfficers[0];
                        if (!activeOfficer) return null;

                        return (
                          <div className="bg-white rounded-lg border border-emerald-200 p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-900 leading-snug">
                                  {activeOfficer.fullName || '-'}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                                  {activeOfficer.designation || '-'}
                                </span>
                              </div>
                              {activeOfficer.officeAddress && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <span className="text-xs">📍</span>
                                  <span className="truncate">{activeOfficer.officeAddress}</span>
                                </p>
                              )}
                            </div>

                            {activeOfficer.mobileNo && (
                              <a
                                href={`tel:${activeOfficer.mobileNo}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors shrink-0"
                                title={`Call ${activeOfficer.fullName}`}
                              >
                                <span>📞</span>
                                <span>{activeOfficer.mobileNo}</span>
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="pt-2 text-sm font-bold text-slate-700">
                      {officerDisplay}
                    </p>
                  )}
                </section>

                <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3">
                  <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>{t("mandatoryDocsRequired")}</span>
                  </h5>
                  {modalDetails.loading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold py-2">
                      <LoaderCircle className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading required documents...</span>
                    </div>
                  ) : transDocs.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-semibold list-disc pl-5">
                      {transDocs.map((doc, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold italic">
                      {t("noDocsSpecified")}
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
                      setApplyError(null);
                    }}
                    className="font-bold"
                  >
                    {t("close")}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isCreatingExternalApplication}
                    onClick={() => {
                      if (selectedService) {
                        handleApplyClick(selectedService);
                      }
                    }}
                    className="font-extrabold"
                  >
                    <>{t("applyProcess")} &rarr;</>
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
