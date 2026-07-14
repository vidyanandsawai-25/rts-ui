"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DepartmentCarousel from "@/components/common/DepartmentCarousel";
import ServiceGrid from "@/components/common/ServiceGrid";
import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Save, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  LayoutDashboard
} from "lucide-react";

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

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedTrackApp, setSelectedTrackApp] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load submissions
        const apps = JSON.parse(window.localStorage.getItem("rtsApplications") || "{}");
        setSubmissions(Object.values(apps));

        // Load drafts
        const localDrafts: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("rtsDraft:")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              localDrafts.push({
                key,
                ...parsed
              });
            }
          }
        }
        localDrafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setDrafts(localDrafts);
      } catch (e) {
        console.error("Error loading dashboard local data:", e);
      }
    }
  }, []);

  const getServiceNameFromId = (serviceId: string) => {
    for (const dept of departments) {
      const match = dept.services.find(s => String(s.id) === String(serviceId));
      if (match) {
        return pickLangText(match.name as LangText, lang) || match.serviceName || `Service #${serviceId}`;
      }
    }
    return `Service #${serviceId}`;
  };

  // Helper count details
  const totalSubmissionsCount = submissions.length;
  const approvedCount = submissions.filter(s => s.status === "approved" || s.status === "completed").length;
  const pendingCount = submissions.filter(s => s.status === "pending" || s.status === "in_progress" || !s.status).length;
  const totalDraftsCount = drafts.length;

  const totalActionsCount = totalSubmissionsCount + totalDraftsCount;
  const approvedPct = totalActionsCount > 0 ? (approvedCount / totalActionsCount) * 100 : 0;
  const pendingPct = totalActionsCount > 0 ? (pendingCount / totalActionsCount) * 100 : 0;
  const draftsPct = totalActionsCount > 0 ? (totalDraftsCount / totalActionsCount) * 100 : 0;

  // Render the Overview Panel
  const renderDashboardOverview = () => {
    return (
      <div className="space-y-6">
        {/* Welcome message banner */}
        <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-teal-500 via-teal-660 to-emerald-600 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10 pointer-events-none">
            <LayoutDashboard size={200} />
          </div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-xl sm:text-2xl font-black">
              {lang === "mr" ? "आपले स्वागत आहे, नागरिक!" : lang === "hi" ? "आपका स्वागत है, नागरिक!" : "Welcome Back, Citizen!"}
            </h1>
            <p className="text-xs sm:text-sm text-teal-50 font-semibold max-w-xl leading-relaxed">
              {lang === "mr"
                ? "अकोला महानगरपालिका सेवा पोर्टलवर आपले स्वागत आहे. येथे तुम्ही तुमचे अर्ज ट्रॅक करू शकता, नवीन अर्ज सबमिट करू शकता किंवा अर्धवट राहिलेले मसुदे पूर्ण करू शकता."
                : lang === "hi"
                  ? "अकोला नगर निगम सेवा पोर्टल पर आपका स्वागत है। यहां आप अपने आवेदनों को ट्रैक कर सकते हैं, नए आवेदन जमा कर सकते हैं या अधूरे मसुदों को पूरा कर सकते हैं।"
                  : "Welcome to the Akola Municipal Corporation Right to Service Portal. Track your active applications, finish pending drafts, and review approved requests."}
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Total */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">
                {lang === "mr" ? "एकूण अर्ज" : lang === "hi" ? "कुल आवेदन" : "Total Applications"}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalSubmissionsCount}</span>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                {lang === "mr" ? "एकूण सादर केलेले अर्ज" : lang === "hi" ? "कुल सबमिट किए गए" : "Submitted applications"}
              </p>
            </div>
          </div>

          {/* Card 2: Approved */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">
                {lang === "mr" ? "मंजूर" : lang === "hi" ? "स्वीकृत" : "Approved"}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{approvedCount}</span>
              <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <span>{approvedCount > 0 ? "🎉" : ""}</span>
                <span>{lang === "mr" ? "पूर्ण झालेले" : lang === "hi" ? "पूर्ण हुए" : "Completed requests"}</span>
              </p>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">
                {lang === "mr" ? "प्रलंबित" : lang === "hi" ? "लंबित" : "Pending"}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{pendingCount}</span>
              <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                {lang === "mr" ? "सत्यापनांतर्गत" : lang === "hi" ? "सत्यापन के तहत" : "Under verification"}
              </p>
            </div>
          </div>

          {/* Card 4: Drafts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-550 font-bold uppercase tracking-wider">
                {lang === "mr" ? "मसुदे जतन" : lang === "hi" ? "मसुदा सहेजा" : "Drafts"}
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center">
                <Save size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalDraftsCount}</span>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                {lang === "mr" ? "अपूर्ण अर्ज फॉर्म" : lang === "hi" ? "अपूर्ण आवेदन पत्र" : "Unfinished forms"}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Proportion Bar */}
        {totalActionsCount > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                {lang === "mr" ? "अर्ज स्थिती विश्लेषण" : lang === "hi" ? "आवेदन स्थिति विश्लेषण" : "Application Status Distribution"}
              </h3>
              <span className="text-[10px] text-slate-500 font-bold">
                {totalActionsCount} {lang === "mr" ? "एकूण उपक्रम" : lang === "hi" ? "कुल गतिविधियां" : "Total items"}
              </span>
            </div>

            {/* Stacked Proportional Bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {approvedCount > 0 && (
                <div 
                  className="h-full bg-gradient-to-r from-emerald-450 to-emerald-500 transition-all" 
                  style={{ width: `${approvedPct}%` }}
                  title={`Approved: ${approvedCount}`}
                />
              )}
              {pendingCount > 0 && (
                <div 
                  className="h-full bg-gradient-to-r from-amber-450 to-amber-500 transition-all" 
                  style={{ width: `${pendingPct}%` }}
                  title={`Pending: ${pendingCount}`}
                />
              )}
              {totalDraftsCount > 0 && (
                <div 
                  className="h-full bg-gradient-to-r from-teal-450 to-teal-500 transition-all" 
                  style={{ width: `${draftsPct}%` }}
                  title={`Drafts: ${totalDraftsCount}`}
                />
              )}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-start gap-4 flex-wrap text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>{lang === "mr" ? "मंजूर" : lang === "hi" ? "स्वीकृत" : "Approved"} ({approvedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>{lang === "mr" ? "प्रलंबित" : lang === "hi" ? "लंबित" : "Pending"} ({pendingCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-500" />
                <span>{lang === "mr" ? "मसुदे" : lang === "hi" ? "मसुदा" : "Drafts"} ({totalDraftsCount})</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic section split: Left side submissions table, Right side saved drafts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions Section */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-teal-605" />
              <h3 className="text-sm font-black text-slate-805 uppercase tracking-wide">
                {lang === "mr" ? "अलीकडील अर्ज" : lang === "hi" ? "हाल के आवेदन" : "Recent Submissions"}
              </h3>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-400" />
                <p>{lang === "mr" ? "कोणताही सादर केलेला अर्ज आढळला नाही." : lang === "hi" ? "कोई सबमिट किया गया आवेदन नहीं मिला।" : "No submitted applications found."}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{lang === "mr" ? "अर्ज सुरू करण्यासाठी डावीकडून विभाग निवडा." : lang === "hi" ? "आवेदन शुरू करने के लिए बाईं ओर से विभाग चुनें।" : "Select a department from the left menu to start."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((app: any) => {
                  const isTrackingOpen = selectedTrackApp?.id === app.id;
                  return (
                    <div 
                      key={app.id} 
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 hover:border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-black text-slate-400">{app.id}</span>
                          <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{app.serviceName}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{app.submittedDate}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === "approved" || app.status === "completed"
                              ? "bg-green-50 text-green-705 border border-green-200"
                              : "bg-amber-50 text-amber-705 border border-amber-200"
                          }`}>
                            {app.status === "approved" || app.status === "completed"
                              ? (lang === "mr" ? "मंजूर" : lang === "hi" ? "स्वीकृत" : "Approved")
                              : (lang === "mr" ? "प्रलंबित" : lang === "hi" ? "लंबित" : "Pending")}
                          </span>
                          <button
                            onClick={() => {
                              if (isTrackingOpen) setSelectedTrackApp(null);
                              else setSelectedTrackApp(app);
                            }}
                            className="text-[10px] font-black text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg"
                          >
                            <span>{isTrackingOpen ? (lang === "mr" ? "ट्रॅकर लपवा" : lang === "hi" ? "ट्रैकर छिपाएं" : "Hide Tracker") : (lang === "mr" ? "स्थिती ट्रॅक करा" : lang === "hi" ? "स्थिति ट्रैक करें" : "Track Status")}</span>
                            <span>&darr;</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Tracking Timeline */}
                      {isTrackingOpen && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span>{lang === "mr" ? "प्रक्रिया प्रगती" : lang === "hi" ? "प्रक्रिया प्रगति" : "Process Progress"}</span>
                            <span className="text-teal-600">{app.progress}%</span>
                          </div>
                          
                          {/* Segment progress bar */}
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${app.progress}%` }} />
                          </div>

                          {/* Approval Stages Timeline */}
                          <div className="space-y-3 pt-1">
                            {app.stages?.map((stage: any, index: number) => {
                              const isStageDone = stage.status === "approved" || stage.status === "completed";
                              const isStagePending = stage.status === "pending";
                              return (
                                <div key={stage.stage} className="relative flex gap-3 text-xs leading-tight">
                                  {/* Left side indicator node */}
                                  <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                      isStageDone 
                                        ? "bg-green-500 text-white shadow-sm" 
                                        : isStagePending 
                                          ? "bg-amber-500 text-white shadow-sm ring-4 ring-amber-100" 
                                          : "bg-slate-200 text-slate-600"
                                    }`}>
                                      {stage.stage}
                                    </div>
                                    {index < app.stages.length - 1 && (
                                      <div className={`w-0.5 h-10 ${isStageDone ? "bg-green-500" : "bg-slate-200"}`} />
                                    )}
                                  </div>

                                  {/* Right side content box */}
                                  <div className="flex-1 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <h5 className="font-extrabold text-slate-800 text-[11px]">{stage.name}</h5>
                                      <span className={`text-[9px] font-bold ${isStageDone ? "text-green-600" : "text-amber-605"}`}>
                                        {isStageDone ? (lang === "mr" ? "पूर्ण" : "Complete") : (lang === "mr" ? "प्रलंबित" : "Pending")}
                                      </span>
                                    </div>
                                    {stage.officer && stage.officer !== "-" && (
                                      <p className="text-[10px] text-slate-500 mb-1">{lang === "mr" ? "अधिकारी" : "Officer"}: <strong>{stage.officer}</strong></p>
                                    )}
                                    {stage.remark && (
                                      <div className="text-[10px] text-slate-605 bg-white border border-slate-100 rounded-lg p-1.5 mt-1 font-medium italic">
                                        "{stage.remark}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drafts Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Save className="w-4 h-4 text-teal-605" />
              <h3 className="text-sm font-black text-slate-805 uppercase tracking-wide">
                {lang === "mr" ? "जतन केलेले मसुदे" : lang === "hi" ? "सहेजे गए मसुदे" : "Saved Drafts"}
              </h3>
            </div>

            {drafts.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200/60 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold space-y-1">
                <Save className="w-5 h-5 mx-auto text-slate-350" />
                <p>{lang === "mr" ? "कोणताही मसुदा आढळला नाही." : lang === "hi" ? "कोई मसुदा नहीं मिला।" : "No drafts found."}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {drafts.slice(0, 4).map((draft: any) => {
                  const serviceTitle = getServiceNameFromId(draft.serviceId);
                  const formattedDate = new Date(draft.savedAt).toLocaleDateString();
                  return (
                    <div 
                      key={draft.key} 
                      className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug">{serviceTitle}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{lang === "mr" ? "जतन केले:" : lang === "hi" ? "सहेजा गया:" : "Saved:"} {formattedDate}</p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">{lang === "mr" ? "अपूर्ण" : lang === "hi" ? "अपूर्ण" : "Draft"}</span>
                        <button
                          onClick={() => router.push(`/${lang}/service/${draft.serviceId}`)}
                          className="text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-sm cursor-pointer"
                        >
                          <span>{lang === "mr" ? "फॉर्म सुरू करा" : lang === "hi" ? "शुरू करें" : "Resume"}</span>
                          <ArrowRight size={10} className="stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

  const selectedDeptId = deptFromUrl; // Can be "" if Dashboard Overview is active

  const carouselDeptId = useMemo(() => {
    if (!qNorm) return selectedDeptId;
    if (exactDeptMatches.length === 1) return exactDeptMatches[0].id;
    if (matchedDepts.length === 1) return matchedDepts[0].id;
    return selectedDeptId;
  }, [exactDeptMatches, matchedDepts, qNorm, selectedDeptId]);

  const activeDeptObj = departments.find((department) => department.id === carouselDeptId);
  const activeDeptLabel = activeDeptObj ? pickLangText(activeDeptObj.name, lang) : "";

  // No auto-redirect on mount anymore. If deptFromUrl is empty, we show Dashboard Overview.

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
          className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 sm:-mx-4 sm:px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Dashboard Overview Mobile Tab */}
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
            <span className="whitespace-nowrap">{lang === "mr" ? "डॅशबोर्ड" : lang === "hi" ? "डैशबोर्ड" : "Dashboard"}</span>
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
          {/* Render Dashboard Overview if no department is selected and no search query */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
