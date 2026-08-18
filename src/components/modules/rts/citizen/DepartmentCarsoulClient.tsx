"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import DepartmentCarousel from "@/components/common/DepartmentCarousel";
import ServiceGrid from "@/components/common/ServiceGrid";
import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Search,
  Eye,
  LayoutDashboard,
  CreditCard,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import TableHeader from "@/components/common/TableHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import RtsCitizenViewDetailsDrawer from "@/components/modules/rts/citizen/RtsCitizenViewDetailsDrawer";
import { PaymentCheckoutModal } from "@/components/modules/rts/citizen/PaymentCheckoutModal";
import { PaymentReceiptModal } from "@/components/modules/rts/citizen/PaymentReceiptModal";
import { getPaymentReceiptAction } from "@/app/[locale]/service/payment/actions";
import type { PaymentReceiptResult } from "@/lib/api/rts/rtspayment.service";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

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
  userApplications: RtsMisDashboardUserApplicationItem[];
  upicId?: string;
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function allLabels(deptName: LangText) {
  return [deptName.en, deptName.hi, deptName.mr].filter(Boolean) as string[];
}

function pickLangText(v: LangText | string | undefined, lang: Language): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.hi || v.mr;
}

type CitizenApplication = RtsMisDashboardUserApplicationItem & {
  normalizedStatus: "pending" | "approved" | "rejected";
};

function normalizeApplicationStatus(status?: string | null): "pending" | "approved" | "rejected" {
  const normalized = (status ?? "").toLowerCase().trim();
  if (normalized.includes("approv") || normalized.includes("स्वीकृत") || normalized.includes("मान्य")) {
    return "approved";
  }
  if (normalized.includes("reject") || normalized.includes("नाकार") || normalized.includes("अमान्य")) {
    return "rejected";
  }
  return "pending";
}

function safeLang(lang: Language): Language {
  return lang === "mr" || lang === "hi" || lang === "en" ? lang : "en";
}

function formatSubmittedDate(dateString?: string, language?: Language): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const locale = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DepartmentCarsoulClient({ departments, userApplications, upicId }: DepartmentCarsoulClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptFromUrl = (searchParams.get("deptId") ?? "").trim();

  const { language } = useLanguage();
  const lang = safeLang(language);
  const t = useTranslations('rts.citizenDashboard');
  const tCommon = useTranslations('common');
  const localePrefix = `/${lang}`;

  const [activeDrawerApp, setActiveDrawerApp] = useState<CitizenApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutAppData, setCheckoutAppData] = useState<{
    applicationId: number;
    applicationNo: string;
    serviceName: string;
    fees: number;
  } | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [paidAppMap, setPaidAppMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const checkPaidStatuses = async () => {
      const feeApplications = userApplications.filter((app) => {
        const matched = departments
          .flatMap((d) => d.services)
          .find((s) => {
            const sNameEn = typeof s.name === "string" ? s.name : (s.name as any)?.en;
            const sNameMr = typeof s.name === "object" ? (s.name as any)?.mr : undefined;
            const targetName = app.serviceName?.toLowerCase().trim();
            return (
              (sNameEn && sNameEn.toLowerCase().trim() === targetName) ||
              (sNameMr && sNameMr.toLowerCase().trim() === targetName) ||
              (s.serviceName && s.serviceName.toLowerCase().trim() === targetName)
            );
          });
        const isFeesReq = (matched as any)?.feesRequired === true;
        const dynamicFee = Number((matched as any)?.fees) || 0;
        return isFeesReq && dynamicFee > 0 && !(matched as any)?.serviceUrl;
      });

      for (const app of feeApplications) {
        const appId = parseInt(app.applicationNo.replace(/\D/g, ""), 10);
        if (appId) {
          try {
            const res = await getPaymentReceiptAction(appId);
            if (isMounted && res.success && res.data) {
              setPaidAppMap((prev) => ({ ...prev, [app.applicationNo]: true }));
            }
          } catch {
            // ignore
          }
        }
      }
    };

    void checkPaidStatuses();
    return () => {
      isMounted = false;
    };
  }, [userApplications, departments]);

  const handleViewReceipt = async (applicationNo: string) => {
    const appId = parseInt(applicationNo.replace(/\D/g, ""), 10);
    if (!appId) {
      toast.error(lang === "mr" ? "अवैध अर्ज क्रमांक." : "Invalid application number.");
      return;
    }
    setIsReceiptLoading(true);
    try {
      const res = await getPaymentReceiptAction(appId);
      if (res.success && res.data) {
        setReceiptModalData(res.data);
      } else {
        toast.error(lang === "mr" ? "या अर्जाची पावती उपलब्ध नाही किंवा शुल्क अद्याप प्रलंबित आहे." : "Receipt not found for this application.");
      }
    } catch {
      toast.error(lang === "mr" ? "पावती मिळवताना त्रुटी आली." : "Error retrieving receipt.");
    } finally {
      setIsReceiptLoading(false);
    }
  };

  const applications = useMemo<CitizenApplication[]>(
    () => userApplications.map((application) => ({
      ...application,
      normalizedStatus: normalizeApplicationStatus(application.status),
    })),
    [userApplications]
  );

  const totalSubmissionsCount = applications.length;
  const approvedCount = applications.filter((application) => application.normalizedStatus === "approved").length;
  const pendingCount = applications.filter((application) => application.normalizedStatus === "pending").length;
  const rejectedCount = applications.filter((application) => application.normalizedStatus === "rejected").length;

  const filteredSubmissions = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const serviceName = app.serviceName.toLowerCase();
    const appId = app.applicationNo.toLowerCase();
    return serviceName.includes(query) || appId.includes(query);
  });

  const renderDashboardOverview = () => {
    return (
      <div className="space-y-5">
        <TableHeader
          title={t('dashboardTitle')}
          subtitle={t('dashboardSubtitle')}
          icon={LayoutDashboard}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('totalApplications')}</p>
              <p className="mt-0.5 text-xl font-extrabold text-slate-900">{totalSubmissionsCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-blue-50/50 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('approvedApplications')}</p>
              <p className="mt-0.5 text-xl font-extrabold text-emerald-600">{approvedCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-emerald-50/50 text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('pendingApplications')}</p>
              <p className="mt-0.5 text-xl font-extrabold text-amber-600">{pendingCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-amber-50/50 text-amber-500 group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('rejectedApplications')}</p>
              <p className="mt-0.5 text-xl font-extrabold text-rose-600">{rejectedCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-rose-50/50 text-rose-600 group-hover:scale-105 transition-transform shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t('applicationsTimeline')}</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold">
                {t('timelineDescription')}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={13} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">{t('noApplications')}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('noApplicationsDesc')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                    <th className="py-2 px-3 rounded-l-lg">{t('application')}</th>
                    <th className="py-2 px-3">{t('submittedOn')}</th>
                    <th className="py-2 px-3">{t('slaTimeline')}</th>
                    <th className="py-2 px-3">{t('statusAndStage')}</th>
                    <th className="py-2 px-3">{lang === "mr" ? "शासकीय शुल्क" : lang === "hi" ? "शासकीय शुल्क" : "Fee Payment"}</th>
                    <th className="py-2 px-3 text-right rounded-r-lg">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((app, index) => {
                    const isAppApproved = app.normalizedStatus === "approved";
                    const isAppRejected = app.normalizedStatus === "rejected";
                    const serviceName = lang === "mr" && app.serviceNameLocal ? app.serviceNameLocal : app.serviceName;

                    const matchedService = departments
                      .flatMap((d) => d.services)
                      .find((s) => {
                        const sNameEn = typeof s.name === "string" ? s.name : (s.name as any)?.en;
                        const sNameMr = typeof s.name === "object" ? (s.name as any)?.mr : undefined;
                        const targetName = app.serviceName?.toLowerCase().trim();
                        return (
                          (sNameEn && sNameEn.toLowerCase().trim() === targetName) ||
                          (sNameMr && sNameMr.toLowerCase().trim() === targetName) ||
                          (s.serviceName && s.serviceName.toLowerCase().trim() === targetName)
                        );
                      });

                    const hasExternalServiceUrl = !!(matchedService as any)?.serviceUrl;
                    const isFeesRequired = (matchedService as any)?.feesRequired === true;
                    const dynamicServiceFee = Number((matchedService as any)?.fees) || 0;

                    const isExternalPortalApp = hasExternalServiceUrl || !matchedService;
                    const isPaidExplicitly =
                      paidAppMap[app.applicationNo] === true ||
                      app.status?.toLowerCase().includes("payment received") ||
                      app.status?.toLowerCase().includes("payment success") ||
                      app.status?.toLowerCase().includes("payment completed") ||
                      app.status?.toLowerCase().includes("paid") ||
                      app.status?.toLowerCase().includes("शुल्क प्राप्त");

                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">{app.applicationNo}</span>
                          <span className="font-bold text-slate-900">{serviceName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{formatSubmittedDate(app.submittedDate, lang)}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50/70 text-blue-700 border border-blue-100">
                            {app.sla} {t('days')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {isAppApproved ? (
                              <StatusBadge value={true} activeLabel={t('approved')} />
                            ) : isAppRejected ? (
                              <StatusBadge value={false} inactiveLabel={t('rejected')} />
                            ) : (
                              <StatusBadge variant="pending" label={t('pending')} />
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {isExternalPortalApp ? (
                            <span className="text-slate-400 font-bold text-sm tracking-widest pl-2">—</span>
                          ) : !isFeesRequired || dynamicServiceFee === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {lang === "mr" ? "विनामूल्य" : lang === "hi" ? "निःशुल्क" : "Free"}
                            </span>
                          ) : isPaidExplicitly ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {lang === "mr" ? "प्राप्त" : lang === "hi" ? "प्राप्त" : "Paid"}
                              </span>
                              <button
                                type="button"
                                disabled={isReceiptLoading}
                                onClick={() => handleViewReceipt(app.applicationNo)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition-all"
                                title="पावती पहा"
                              >
                                <Printer className="w-3 h-3 text-slate-600" />
                                {lang === "mr" ? "पावती" : lang === "hi" ? "रसीद" : "Receipt"}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {lang === "mr" ? "बाकी" : lang === "hi" ? "लंबित" : "Pending"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCheckoutAppData({
                                  applicationId: parseInt(app.applicationNo.replace(/\D/g, ""), 10) || 1,
                                  applicationNo: app.applicationNo,
                                  serviceName: serviceName || app.serviceName,
                                  fees: dynamicServiceFee
                                })}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all"
                              >
                                <CreditCard className="w-3 h-3" />
                                {lang === "mr" ? `शुल्क भरा (₹${dynamicServiceFee})` : lang === "hi" ? `शुल्क भरें (₹${dynamicServiceFee})` : `Pay Fee (₹${dynamicServiceFee})`}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setActiveDrawerApp(app)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg cursor-pointer"
                            title={t('viewDetails')}
                          >
                            <Eye size={12} />
                            <span>{t('viewDetails')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeDrawerApp && (
          <RtsCitizenViewDetailsDrawer
            application={activeDrawerApp}
            language={lang}
            onClose={() => setActiveDrawerApp(null)}
          />
        )}

        {checkoutAppData && (
          <PaymentCheckoutModal
            applicationId={checkoutAppData.applicationId}
            applicationNo={checkoutAppData.applicationNo}
            serviceName={checkoutAppData.serviceName}
            fees={checkoutAppData.fees}
            onClose={() => setCheckoutAppData(null)}
            onSuccess={(receipt) => {
              setCheckoutAppData(null);
              setReceiptModalData(receipt);
              if (checkoutAppData?.applicationNo) {
                setPaidAppMap((prev) => ({ ...prev, [checkoutAppData.applicationNo]: true }));
              }
            }}
          />
        )}

        {receiptModalData && (
          <PaymentReceiptModal
            receipt={receiptModalData}
            onClose={() => setReceiptModalData(null)}
          />
        )}
      </div>
    );
  };
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

  const results = (() => {
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
  })();

  const selectedDeptId = deptFromUrl;

  const carouselDeptId = useMemo(() => {
    if (!qNorm) return selectedDeptId;
    if (exactDeptMatches.length === 1) return exactDeptMatches[0].id;
    if (matchedDepts.length === 1) return matchedDepts[0].id;
    return selectedDeptId;
  }, [exactDeptMatches, matchedDepts, qNorm, selectedDeptId]);

  const activeDeptObj = departments.find((department) => department.id === carouselDeptId);
  const activeDeptLabel = activeDeptObj ? pickLangText(activeDeptObj.name, lang) : "";

  const handleDeptChange = (deptId: string) => {
    const params = new URLSearchParams();
    if (deptId) {
      params.set("deptId", deptId);
    }
    const q = (searchParams.get("q") ?? "").trim();
    if (q) params.set("q", q);

    const queryString = params.toString();
    router.replace(`${localePrefix}/service/dashboard${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  return (
    <div className="mt-3 flex flex-col gap-3 md:mt-4">
      <div className="w-full lg:hidden">
        <div
          className="mx-3 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 sm:-mx-4 sm:px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            onClick={() => !qNorm && handleDeptChange("")}
            disabled={!!qNorm}
            className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              (!carouselDeptId && !qNorm)
                ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50'
            } ${qNorm ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <span className="whitespace-nowrap">{t('dashboard')}</span>
          </button>

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

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 xl:gap-8 lg:max-h-[calc(100vh-230px)]">
        <div className="hidden flex-shrink-0 justify-center lg:flex lg:w-[300px] xl:w-[340px] lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto lg:pr-1" style={{ scrollbarWidth: "thin" }}>
          <DepartmentCarousel
            departments={departments}
            activeDept={carouselDeptId}
            onChange={handleDeptChange}
            disabled={!!qNorm}
          />
        </div>

        <div className="min-w-0 flex-1 w-full lg:max-h-[calc(100vh-230px)] lg:overflow-y-auto lg:pr-2" style={{ scrollbarWidth: "thin" }}>
          {!carouselDeptId && !qNorm ? (
            renderDashboardOverview()
          ) : (
            <>
              <div className="mb-3 flex w-full flex-col gap-2 rounded-xl border border-[#f0e8ff] bg-gradient-to-r from-[#fff5f7] via-[#f8f9fe] to-[#fff6ef] px-3 py-2 shadow-sm sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex flex-1 justify-center text-center">
                  {qNorm ? (
                    <h2 className="truncate px-2 text-sm font-semibold text-gray-700 sm:text-base md:text-lg">
                      {exactDeptMatches.length === 1
                        ? `---- ${pickLangText(exactDeptMatches[0].name, lang)} ----`
                        : `${t('searchResults')} - \"${qRaw}\"`}
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
                      ? `${results.length} ${t('servicesFound')}`
                      : `${activeDeptObj?.services.length ?? 0} ${t('availableServices')}`}
                  </span>
                </div>

                {qNorm ? (
                  <button
                    onClick={() => router.replace(`${localePrefix}/service/dashboard`, { scroll: false })}
                    className="shrink-0 self-center rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-gray-50 sm:self-auto"
                  >
                    {tCommon('buttons.clear')}
                  </button>
                ) : null}
              </div>

              {qNorm ? (
                <ServiceGrid departments={departments} services={results} upicId={upicId} />
              ) : (
                <ServiceGrid departments={departments} deptId={selectedDeptId} upicId={upicId} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
