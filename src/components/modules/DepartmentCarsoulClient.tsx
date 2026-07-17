"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import DepartmentCarousel from "@/components/common/DepartmentCarousel";
import ServiceGrid from "@/components/common/ServiceGrid";

import { useLanguage } from "@/components/Providers/LanguageProvider";
import type { Language } from "@/types/language.type";
<<<<<<< Updated upstream
=======
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  Search,
  Eye,
  LayoutDashboard
} from "lucide-react";
import TableHeader from "@/components/common/TableHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Drawer } from "@/components/common/Drawer";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts-dashboard.types";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
  userApplications: RtsMisDashboardUserApplicationItem[];
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
/** ─── Component ─────────────────────────────────────────── */
export default function DepartmentCarsoulClient({ departments }: DepartmentCarsoulClientProps) {
=======
type CitizenApplication = RtsMisDashboardUserApplicationItem & {
  normalizedStatus: "approved" | "rejected" | "pending";
};

function normalizeApplicationStatus(status: string): CitizenApplication["normalizedStatus"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("approved")) return "approved";
  if (normalized.includes("rejected") || normalized.includes("failed") || normalized.includes("discarded")) {
    return "rejected";
  }
  return "pending";
}

function formatSubmittedDate(value: string, locale: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DepartmentCarsoulClient({ departments, userApplications }: DepartmentCarsoulClientProps) {
>>>>>>> Stashed changes
  const router = useRouter();
  const searchParams = useSearchParams();

  const DEFAULT_DEPT = "property-tax";
  const deptFromUrl = (searchParams.get("deptId") ?? "").trim();
  const [activeDept, setActiveDept] = useState<string>(deptFromUrl || DEFAULT_DEPT);

  const { language } = useLanguage();
  const lang = safeLang(language);
  const localePrefix = `/${lang}`;

<<<<<<< Updated upstream
  const qRaw  = (searchParams.get("q") ?? "").trim();
=======
  const [activeDrawerApp, setActiveDrawerApp] = useState<CitizenApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Render the Overview Panel
  const renderDashboardOverview = () => {
    return (
      <div className="space-y-5">
        {/* TableHeader standard common component */}
        <TableHeader
          title={lang === "mr" ? "माझा नागरिक डॅशबोर्ड" : lang === "hi" ? "मेरा नागरिक डैशबोर्ड" : "Citizen Dashboard"}
          subtitle={lang === "mr" ? "तुमचे सादर केलेले सर्व अर्ज आणि लोकसेवा हक्क (SLA) प्रगती" : lang === "hi" ? "आपके सभी जमा किए गए आवेदन और लोक सेवा अधिकार (SLA) प्रगति" : "Track all your submitted applications and Right to Service (SLA) statuses"}
          icon={LayoutDashboard}
        />

        {/* Customized Premium Status-Colored KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total */}
          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "mr" ? "एकूण अर्ज" : lang === "hi" ? "कुल आवेदन" : "Total Applications"}</p>
              <p className="mt-0.5 text-xl font-extrabold text-slate-900">{totalSubmissionsCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-blue-50/50 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Approved */}
          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "mr" ? "मंजूर अर्ज" : lang === "hi" ? "स्वीकृत आवेदन" : "Approved"}</p>
              <p className="mt-0.5 text-xl font-extrabold text-emerald-600">{approvedCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-emerald-50/50 text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "mr" ? "प्रलंबित अर्ज" : lang === "hi" ? "लंबित आवेदन" : "Pending"}</p>
              <p className="mt-0.5 text-xl font-extrabold text-amber-600">{pendingCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-amber-50/50 text-amber-500 group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Rejected */}
          <div className="relative flex items-center gap-4 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-600 rounded-l-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "mr" ? "नामंजूर अर्ज" : lang === "hi" ? "नामंजूर आवेदन" : "Rejected"}</p>
              <p className="mt-0.5 text-xl font-extrabold text-rose-600">{rejectedCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center border border-slate-200 bg-rose-50/50 text-rose-600 group-hover:scale-105 transition-transform shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Applications List Table Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{lang === "mr" ? "तुमचे अर्ज आणि हमी कालावधी" : lang === "hi" ? "आपके आवेदन एवं गारंटी समय सीमा" : "Your Applications & SLA Timeline"}</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold">
                {lang === "mr" ? "अधिनियमानुसार प्रत्येक सेवेचा हमी कालावधी निश्चित आहे." : lang === "hi" ? "अधिनियम के तहत प्रत्येक सेवा की गारंटी समय सीमा तय है।" : "Each municipal service is bound by legal Right to Service delivery timelines."}
              </p>
            </div>
            {/* Inline search filter box */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={13} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "mr" ? "अर्ज आयडी किंवा नावाने शोधा..." : lang === "hi" ? "आईडी या नाम से खोजें..." : "Search by ID or service name..."}
                className="w-full pl-8.5 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/30"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 mx-auto text-slate-350 mb-1" />
              <p>{lang === "mr" ? "कोणताही अर्ज आढळला नाही." : lang === "hi" ? "कोई आवेदन नहीं मिला।" : "No applications found."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2 px-3 rounded-l-lg">{lang === "mr" ? "अर्ज आयडी व सेवा" : lang === "hi" ? "आवेदन आईडी और सेवा" : "Application ID & Service"}</th>
                    <th className="py-2 px-3">{lang === "mr" ? "सादर तारीख" : lang === "hi" ? "सबमिट तारीख" : "Submitted Date"}</th>
                    <th className="py-2 px-3">{lang === "mr" ? "हमी कालावधी (SLA)" : lang === "hi" ? "गारंटी समय सीमा (SLA)" : "SLA Timeline"}</th>
                    <th className="py-2 px-3">{lang === "mr" ? "सद्य स्थिती" : lang === "hi" ? "स्थिति" : "Status & Stage"}</th>
                    <th className="py-2 px-3 text-right rounded-r-lg">{lang === "mr" ? "कृती" : lang === "hi" ? "कार्रवाई" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((app, index) => {
                    const isAppApproved = app.normalizedStatus === "approved";
                    const isAppRejected = app.normalizedStatus === "rejected";
                    const serviceName = lang === "mr" && app.serviceNameLocal ? app.serviceNameLocal : app.serviceName;

                    return (
                      <tr key={`${app.applicationNo}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">{app.applicationNo}</span>
                          <span className="font-bold text-slate-900 text-xs">{serviceName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{formatSubmittedDate(app.submittedDate, lang)}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50/70 text-blue-700 border border-blue-100">
                            {app.sla} {lang === "mr" ? "दिवस" : lang === "hi" ? "दिन" : "Days"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {isAppApproved ? (
                              <StatusBadge value={true} activeLabel={lang === "mr" ? "मंजूर" : lang === "hi" ? "स्वीकृत" : "Approved"} />
                            ) : isAppRejected ? (
                              <StatusBadge value={false} inactiveLabel={lang === "mr" ? "नामंजूर" : lang === "hi" ? "नामंजूर" : "Rejected"} />
                            ) : (
                              <StatusBadge variant="pending" label={lang === "mr" ? "प्रलंबित" : lang === "hi" ? "लंबित" : "Pending"} />
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setActiveDrawerApp(app)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-755 transition-all bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>{lang === "mr" ? "तपशील पहा" : lang === "hi" ? "विवरण देखें" : "View Details"}</span>
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

        {/* Slide-over Side Drawer using standard common Drawer component */}
        {activeDrawerApp && (
          <Drawer
            open={!!activeDrawerApp}
            onClose={() => setActiveDrawerApp(null)}
            width="md"
            title={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileText size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    {activeDrawerApp.applicationNo}
                  </span>
                  <h2 className="text-sm font-black text-slate-800 leading-snug">
                    {lang === "mr" && activeDrawerApp.serviceNameLocal
                      ? activeDrawerApp.serviceNameLocal
                      : activeDrawerApp.serviceName}
                  </h2>
                </div>
              </div>
            }
            footer={
              <button
                onClick={() => setActiveDrawerApp(null)}
                className="bg-slate-205 hover:bg-slate-300 text-slate-800 font-black text-xs px-4.5 py-2 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                {lang === "mr" ? "बंद करा" : lang === "hi" ? "बंद करें" : "Close"}
              </button>
            }
          >
            {/* Drawer Body Content */}
            <div className="p-5 space-y-5">
              {/* SLA & Submitted Info Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                  {lang === "mr" ? "अर्जाचा तपशील" : lang === "hi" ? "आवेदन का विवरण" : "Application Details"}
                </h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs font-bold text-slate-700">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "अर्ज क्रमांक" : lang === "hi" ? "आवेदन क्रमांक" : "Application Number"}
                    </span>
                    <span className="text-slate-900 font-extrabold">{activeDrawerApp.applicationNo}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "सादर तारीख" : lang === "hi" ? "जमा तारीख" : "Submitted Date"}
                    </span>
                    <span className="text-slate-900 font-extrabold">{formatSubmittedDate(activeDrawerApp.submittedDate, lang)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "हमी कालावधी (SLA)" : lang === "hi" ? "SLA समय सीमा" : "SLA Timeline"}
                    </span>
                    <span className="text-blue-700 font-extrabold">
                      {activeDrawerApp.sla} {lang === "mr" ? "दिवस" : lang === "hi" ? "दिन" : "Days"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "स्थिती" : lang === "hi" ? "स्थिति" : "Status"}
                    </span>
                    {activeDrawerApp.normalizedStatus === "approved" ? (
                      <StatusBadge value activeLabel={lang === "mr" ? "मंजूर" : lang === "hi" ? "स्वीकृत" : "Approved"} />
                    ) : activeDrawerApp.normalizedStatus === "rejected" ? (
                      <StatusBadge value={false} inactiveLabel={lang === "mr" ? "नामंजूर" : lang === "hi" ? "अस्वीकृत" : "Rejected"} />
                    ) : (
                      <StatusBadge variant="pending" label={lang === "mr" ? "प्रलंबित" : lang === "hi" ? "लंबित" : "Pending"} />
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Drawer>
        )}
      </div>
    );
  };
  const qRaw = (searchParams.get("q") ?? "").trim();
>>>>>>> Stashed changes
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
