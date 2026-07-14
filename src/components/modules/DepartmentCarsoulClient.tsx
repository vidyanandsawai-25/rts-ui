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
  AlertCircle,
  AlertTriangle,
  Search,
  Eye,
  Download,
  LayoutDashboard
} from "lucide-react";
import TableHeader from "@/components/common/TableHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Drawer } from "@/components/common/Drawer";

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

// ==========================================
// START MOCK DATA FOR LOCAL DEVELOPMENT (EASY TO REMOVE)
// ==========================================
const MOCK_APPLICATIONS = [
  {
    id: "APP-2026-9872",
    serviceId: "7176",
    serviceName: "Property Tax Assessment (नवीन मालमत्ता कर आकारणी)",
    submittedDate: "2026-07-10",
    status: "pending",
    progress: 40,
    stages: [
      { stage: 1, name: "Application Scrutiny", status: "completed", officer: "Assistant Commissioner (Tax)", remark: "Documents verified and found in order." },
      { stage: 2, name: "Site Verification & Measurement", status: "pending", officer: "Tax Inspector", remark: "Site visit scheduled for 15th July." },
      { stage: 3, name: "Tax Valuation Assessment", status: "not_started", officer: "Valuation Officer", remark: "-" },
      { stage: 4, name: "Final Approval & Certificate", status: "not_started", officer: "Deputy Commissioner", remark: "-" }
    ]
  },
  {
    id: "APP-2026-4421",
    serviceId: "7174",
    serviceName: "Water Connection Permission (नवीन नळ जोडणी परवाना)",
    submittedDate: "2026-07-08",
    status: "approved",
    progress: 100,
    stages: [
      { stage: 1, name: "Feasibility Check", status: "completed", officer: "Junior Engineer (Water)", remark: "Connection point located and approved." },
      { stage: 2, name: "Security Deposit Payment Verification", status: "completed", officer: "Accounts Clerk", remark: "Payment of ₹4500 received and approved." },
      { stage: 3, name: "Connection Permission Approval", status: "completed", officer: "Executive Engineer", remark: "Sanctioned connection permission." }
    ]
  },
  {
    id: "APP-2026-1102",
    serviceId: "7190",
    serviceName: "Fire NOC - Renewal (अग्निशमन दाखला नूतनीकरण)",
    submittedDate: "2026-07-05",
    status: "rejected",
    progress: 66,
    stages: [
      { stage: 1, name: "Document Verification", status: "completed", officer: "Station Officer (Fire)", remark: "Identity proofs and layouts verified." },
      { stage: 2, name: "On-site Fire Safety Inspection", status: "rejected", officer: "Fire Officer", remark: "Inadequate number of fire extinguishers found on premises. Renewal rejected." }
    ]
  }
];
// ==========================================
// END MOCK DATA FOR LOCAL DEVELOPMENT
// ==========================================

export default function DepartmentCarsoulClient({ departments }: DepartmentCarsoulClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deptFromUrl = (searchParams.get("deptId") ?? "").trim();

  const { language } = useLanguage();
  const lang = safeLang(language);
  const localePrefix = `/${lang}`;

  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [activeDrawerApp, setActiveDrawerApp] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const apps = JSON.parse(window.localStorage.getItem("rtsApplications") || "{}");
        const localApps = Object.values(apps);
        // Fallback to mock data for local development if empty
        if (localApps.length === 0) {
          setSubmissions(MOCK_APPLICATIONS);
        } else {
          setSubmissions(localApps);
        }
      } catch (e) {
        console.error("Error loading dashboard local data:", e);
      }
    }
  }, []);

  // Helper count details
  const totalSubmissionsCount = submissions.length;
  const approvedCount = submissions.filter(s => s.status === "approved" || s.status === "completed").length;
  const pendingCount = submissions.filter(s => s.status === "pending" || s.status === "in_progress" || !s.status).length;
  const rejectedCount = submissions.filter(s => s.status === "rejected" || s.status === "discarded" || s.status === "failed").length;

  const getSlaDays = (serviceId: string) => {
    const id = String(serviceId);
    if (id === "7176") return lang === "mr" ? "१५ दिवस" : lang === "hi" ? "15 दिन" : "15 Days";
    if (id === "7174") return lang === "mr" ? "७ दिवस" : lang === "hi" ? "7 दिन" : "7 Days";
    if (id === "7190") return lang === "mr" ? "१० दिवस" : lang === "hi" ? "10 दिन" : "10 Days";
    return lang === "mr" ? "१५ दिवस" : lang === "hi" ? "15 दिन" : "15 Days";
  };

  // Filter submissions by query
  const filteredSubmissions = submissions.filter(app => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const serviceName = (app.serviceName || "").toLowerCase();
    const appId = (app.id || "").toLowerCase();
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
                  {filteredSubmissions.map((app: any) => {
                    const isAppApproved = app.status === "approved" || app.status === "completed";
                    const isAppRejected = app.status === "rejected" || app.status === "failed" || app.status === "discarded";

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">{app.id}</span>
                          <span className="font-bold text-slate-900 text-xs">{app.serviceName}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{app.submittedDate}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50/70 text-blue-700 border border-blue-100">
                            {getSlaDays(app.serviceId)}
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
                            <span className="text-[10px] text-slate-400 font-bold">({app.progress}%)</span>
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
                    {activeDrawerApp.id}
                  </span>
                  <h2 className="text-sm font-black text-slate-800 leading-snug">
                    {activeDrawerApp.serviceName}
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
                      {lang === "mr" ? "अर्जदाराचे नाव" : lang === "hi" ? "आवेदक का नाम" : "Applicant Name"}
                    </span>
                    <span className="text-slate-900 font-extrabold">
                      {activeDrawerApp.id === "APP-2026-9872" 
                        ? (lang === "mr" ? "श्याम पांडुरंग आठवले" : "Shyam Pandurang Athawale")
                        : activeDrawerApp.id === "APP-2026-4421"
                          ? (lang === "mr" ? "रवींद्र दिनकर जोशी" : "Ravindra Dinkar Joshi")
                          : (lang === "mr" ? "सुनील विश्वास पाटील" : "Sunil Vishwas Patil")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "सादर तारीख" : lang === "hi" ? "जमा तारीख" : "Submitted Date"}
                    </span>
                    <span className="text-slate-900 font-extrabold">{activeDrawerApp.submittedDate}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "हमी कालावधी (SLA)" : lang === "hi" ? "SLA समय सीमा" : "SLA Timeline"}
                    </span>
                    <span className="text-blue-700 font-extrabold">{getSlaDays(activeDrawerApp.serviceId)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {lang === "mr" ? "अंतिम तारीख (SLA)" : lang === "hi" ? "नियत तिथि (SLA)" : "SLA Deadline"}
                    </span>
                    <span className="text-amber-700 font-extrabold">
                      {activeDrawerApp.id === "APP-2026-9872" ? "2026-07-25" : activeDrawerApp.id === "APP-2026-4421" ? "2026-07-15" : "2026-07-15"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    {lang === "mr" ? "मंजुरी प्रक्रिया" : lang === "hi" ? "स्वीकृति प्रक्रिया" : "Approval Stages"}
                  </h4>
                  <span className="text-blue-700 text-xs font-black bg-blue-50/70 border border-blue-100 px-2.5 py-0.5 rounded-full">
                    {activeDrawerApp.progress}% {lang === "mr" ? "पूर्ण" : "Done"}
                  </span>
                </div>

                <div className="space-y-4 pl-1">
                  {activeDrawerApp.stages?.map((stage: any, index: number) => {
                    const isStageDone = stage.status === "approved" || stage.status === "completed";
                    const isStagePending = stage.status === "pending";
                    return (
                      <div key={stage.stage} className="relative flex gap-3 text-xs leading-tight">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                            isStageDone 
                              ? "bg-emerald-600 text-white" 
                              : isStagePending 
                                ? "bg-amber-500 text-white ring-4 ring-amber-100" 
                                : "bg-slate-205 text-slate-700 border border-slate-300"
                          }`}>
                            {stage.stage}
                          </div>
                          {index < activeDrawerApp.stages.length - 1 && (
                            <div className={`w-0.5 h-10 ${isStageDone ? "bg-emerald-600" : "bg-slate-300"}`} />
                          )}
                        </div>

                        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h5 className="font-extrabold text-slate-900 text-xs">{stage.name}</h5>
                            <span className={`text-[9px] font-black uppercase ${isStageDone ? "text-emerald-700" : "text-amber-700"}`}>
                              {isStageDone ? (lang === "mr" ? "पूर्ण" : "Complete") : (lang === "mr" ? "प्रलंबित" : "Pending")}
                            </span>
                          </div>
                          {stage.officer && stage.officer !== "-" && (
                            <p className="text-[10px] text-slate-800 mb-1.5">
                              {lang === "mr" ? "प्राधिकृत अधिकारी" : "Authorized Officer"}: <strong className="text-slate-900 font-extrabold">{stage.officer}</strong>
                            </p>
                          )}
                          {stage.remark && (
                            <div className="text-[10px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold italic leading-relaxed">
                              "{stage.remark}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submitted Documents Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                  {lang === "mr" ? "सादर केलेली कागदपत्रे" : lang === "hi" ? "जमा किए गए दस्तावेज़" : "Submitted Documents"}
                </h4>

                <div className="space-y-2">
                  {[
                    { name: lang === "mr" ? "ओळख पुरावा (आधार कार्ड)" : lang === "hi" ? "पहचान प्रमाण (आधार)" : "Identity Proof (Aadhaar Card)", size: "1.2 MB" },
                    { name: lang === "mr" ? "मालमत्ता खरेदी पत्र / करार" : lang === "hi" ? "संपत्ति शीर्षक विलेख" : "Property Ownership Deed / Agreement", size: "3.4 MB" },
                    { name: lang === "mr" ? "अग्निशमन विभाग नाहरकत प्रमाणपत्र" : lang === "hi" ? "अग्निशमन विभाग एनओसी" : "NOC from Fire Department", size: "2.1 MB" }
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-black text-slate-800 truncate leading-snug">{doc.name}</span>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">{doc.size}</span>
                        </div>
                      </div>
                      <button className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-50 transition-colors border border-slate-200 cursor-pointer" title="Download Document">
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Drawer>
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
