"use client";

import { useState, useMemo } from "react";
import { Search, Sparkles, Download, ArrowDown, Activity, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card } from "@/components/common";
import type { CmsApplication } from "@/lib/mock/rts/cms";

interface CmsMulyamapanProps {
  data: CmsApplication[];
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
  locale: string;
}

interface SlaRecord {
  id: string;
  appId: string;
  citizenName: string;
  citizenNameMr: string;
  serviceName: string;
  serviceNameMr: string;
  departmentId: string;
  slaLimit: number;
  pendingDays: number;
  inProgressDays: number;
  needsInfoDays: number;
  verificationDays: number;
  totalTat: number;
  outcome: "Within SLA" | "SLA breached" | "At risk";
}

export default function CmsMulyamapan({ data, masters, locale }: CmsMulyamapanProps) {
  const lang = locale === "mr" ? "mr" : "en";

  // Date filters states
  const [filterDept, setFilterDept] = useState("All");
  const [filterMonth, setFilterMonth] = useState("June 2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("All");

  // Selected row for detail analysis popup
  const [selectedRecord, setSelectedRecord] = useState<SlaRecord | null>(null);

  // Generate deterministic SLA tracking metrics from applications list
  const slaRecords: SlaRecord[] = useMemo(() => {
    return data.map(app => {
      const appNum = parseInt(app.id, 10) || 1000;
      
      // Mapped Stage breakdown timings (in days)
      const pendingDays = (appNum % 3) + 1; // 1 to 3 days
      const inProgressDays = (appNum % 4) + 2; // 2 to 5 days
      const needsInfoDays = appNum % 5 === 0 ? 0 : (appNum % 3) + 1; // 0 to 3 days
      const verificationDays = appNum % 2 === 0 ? 1 : 2; // 1 to 2 days

      const totalTat = pendingDays + inProgressDays + needsInfoDays + verificationDays;
      const slaLimit = app.slaDays || 15;

      let outcome: "Within SLA" | "SLA breached" | "At risk" = "Within SLA";
      if (totalTat > slaLimit) {
        outcome = "SLA breached";
      } else if (slaLimit - totalTat <= 2) {
        outcome = "At risk";
      }

      return {
        id: app.id,
        appId: app.applicationNo,
        citizenName: app.citizenName,
        citizenNameMr: app.citizenName, // fallback to normal citizenName
        serviceName: app.serviceName,
        serviceNameMr: app.serviceName, // fallback
        departmentId: app.departmentId,
        slaLimit,
        pendingDays,
        inProgressDays,
        needsInfoDays,
        verificationDays,
        totalTat,
        outcome
      };
    });
  }, [data]);

  // Filtering records
  const filteredRecords = useMemo(() => {
    return slaRecords.filter(rec => {
      const deptMatch = filterDept === "All" || rec.departmentId === filterDept;
      
      const outcomeMatch = filterOutcome === "All" || rec.outcome === filterOutcome;

      const q = searchTerm.toLowerCase().trim();
      const textMatch =
        !q ||
        rec.appId.toLowerCase().includes(q) ||
        rec.citizenName.toLowerCase().includes(q) ||
        rec.serviceName.toLowerCase().includes(q);

      return deptMatch && outcomeMatch && textMatch;
    });
  }, [slaRecords, filterDept, filterOutcome, searchTerm]);

  // Summary Metrics calculations
  const summary = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { avgTat: 0, avgPending: 0, avgInProgress: 0, bottleneck: "N/A" };
    }
    const totalTatSum = filteredRecords.reduce((sum, r) => sum + r.totalTat, 0);
    const totalPendingSum = filteredRecords.reduce((sum, r) => sum + r.pendingDays, 0);
    const totalInProgressSum = filteredRecords.reduce((sum, r) => sum + r.inProgressDays, 0);
    const totalNeedsInfoSum = filteredRecords.reduce((sum, r) => sum + r.needsInfoDays, 0);
    const totalVerificationSum = filteredRecords.reduce((sum, r) => sum + r.verificationDays, 0);

    const len = filteredRecords.length;

    // Bottleneck stage selection
    const stages = [
      { name: "Pending", val: totalPendingSum },
      { name: "In Progress", val: totalInProgressSum },
      { name: "Needs Info", val: totalNeedsInfoSum },
      { name: "Verification", val: totalVerificationSum }
    ];
    stages.sort((a, b) => b.val - a.val);

    return {
      avgTat: (totalTatSum / len).toFixed(1),
      avgPending: (totalPendingSum / len).toFixed(1),
      avgInProgress: (totalInProgressSum / len).toFixed(1),
      bottleneck: stages[0].name
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-4">
      {/* 1. Header with Filters & Export */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {lang === "en" ? "मूल्यांकन — SLA evaluation" : "मूल्यांकन — SLA मापन"}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {lang === "en" ? "Stage wise time tracking per application" : "कार्यप्रवाह टप्पा निहाय वेळ मापन प्रति अर्ज"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="All">{lang === "en" ? "All departments" : "सर्व विभाग"}</option>
            {masters.departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="June 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
            <option value="April 2026">April 2026</option>
          </select>

          <button
            onClick={() => window.alert("Exporting SLA evaluation report...")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-650 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* 2. Top SLA Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-[#4b70a6] p-4 shadow-sm bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Avg total TAT (days)" : "एकूण सरासरी वेळ (दिवस)"}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{summary.avgTat}d</span>
            <span className="text-[11px] font-bold text-green-600 flex items-center gap-0.5">
              <ArrowDown className="h-3 w-3" />
              0.4 vs last month
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-amber-500 p-4 shadow-sm bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Avg time — Pending stage" : "सरासरी वेळ — प्रलंबित टप्पा"}
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-2xl font-extrabold text-slate-800">{summary.avgPending}d</span>
            <span className="text-[11px] text-slate-400 mt-0.5">days before assignment</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-blue-500 p-4 shadow-sm bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Avg time — In progress" : "सरासरी वेळ — प्रक्रियेत"}
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-2xl font-extrabold text-slate-800">{summary.avgInProgress}d</span>
            <span className="text-[11px] text-slate-400 mt-0.5">days officer processing</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-purple-500 p-4 shadow-sm bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Bottleneck stage" : "सर्वात संथ टप्पा"}
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-2xl font-extrabold text-purple-700">{summary.bottleneck}</span>
            <span className="text-[11px] text-slate-400 mt-0.5">highest time spent here</span>
          </div>
        </div>
      </div>

      {/* 3. Main SLA Evaluation Breakdown Table */}
      <Card className="p-4 border border-slate-200 bg-white shadow-sm space-y-3">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-1.5 sm:flex-row sm:items-center">
          <h2 className="text-sm font-bold text-[#243B7C] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#4b70a6]" />
            <span>
              {lang === "en" ? "Application-wise SLA breakdown" : "अर्ज निहाय वेळ मापन गोषवारा"}
            </span>
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder={lang === "en" ? "Search App ID or citizen..." : "अर्जदार नाव किंवा आयडी..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-[13px] text-slate-700 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <select
              value={filterOutcome}
              onChange={e => setFilterOutcome(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[13px] text-slate-700 focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All outcomes</option>
              <option value="Within SLA">Within SLA</option>
              <option value="SLA breached">SLA breached</option>
              <option value="At risk">At risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left text-[13px] text-slate-600">
            <thead className="bg-[#4b70a6] text-white font-bold">
              <tr>
                <th className="p-3 w-32 border-r border-[#3d5a8a]">{lang === "en" ? "App ID" : "अर्जाचा आयडी"}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{lang === "en" ? "Citizen" : "नागरिक"}</th>
                <th className="p-3 border-r border-[#3d5a8a]">{lang === "en" ? "Service" : "सेवा"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "SLA (days)" : "SLA (दिवस)"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "Pending" : "प्रलंबित"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "In progress" : "प्रक्रियेत"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "Needs info" : "माहिती आवश्यक"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "Verification" : "पडताळणी"}</th>
                <th className="p-3 text-center font-bold border-r border-[#3d5a8a]">{lang === "en" ? "Total TAT" : "एकूण वेळ"}</th>
                <th className="p-3 text-center border-r border-[#3d5a8a]">{lang === "en" ? "Outcome" : "निष्कर्ष"}</th>
                <th className="p-3 text-center">{lang === "en" ? "Actions" : "कृती"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 font-semibold">
                    <Sparkles className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                    No applications matched the tracking criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-800">{row.appId}</td>
                    <td className="p-3 font-medium text-slate-700">{row.citizenName}</td>
                    <td className="p-3 text-slate-500">{row.serviceName}</td>
                    <td className="p-3 text-center font-bold text-slate-500">{row.slaLimit}d</td>
                    <td className="p-3 text-center bg-amber-50/50 text-amber-700 font-medium">{row.pendingDays}d</td>
                    <td className="p-3 text-center bg-blue-50/30 text-blue-700 font-medium">{row.inProgressDays}d</td>
                    <td className="p-3 text-center bg-purple-50/30 text-purple-700 font-medium">
                      {row.needsInfoDays > 0 ? `${row.needsInfoDays}d` : "—"}
                    </td>
                    <td className="p-3 text-center bg-emerald-50/30 text-emerald-700 font-medium">{row.verificationDays}d</td>
                    <td className="p-3 text-center font-extrabold text-slate-800">
                      {row.totalTat}.0d
                      {row.totalTat > row.slaLimit && (
                        <span className="text-[10px] text-rose-600 font-semibold ml-1">
                          (+{(row.totalTat - row.slaLimit).toFixed(0)}d)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                          row.outcome === "Within SLA"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : row.outcome === "SLA breached"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        {row.outcome}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="text-[12px] font-bold text-[#4b70a6] hover:underline"
                      >
                        Analyse
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-[13px] text-slate-400 pl-1 pt-1">
          Showing {filteredRecords.length} of {slaRecords.length} applications
        </div>
      </Card>

      {/* 4. Bottom Department-wise stacked visual representation */}
      <Card className="p-4 border border-slate-200 bg-white shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#243B7C]">
            {lang === "en" ? "Department-wise avg TAT — all stages" : "विभाग निहाय सरासरी वेळ मापन — सर्व टप्पे"}
          </h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Stacked representation of stages duration split</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-650">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-400" />
            <span>Pending (प्रलंबित)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-[#4b70a6]" />
            <span>In Progress (प्रक्रियेत)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-purple-400" />
            <span>Needs Info (माहिती आवश्यक)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span>Verification (पडताळणी)</span>
          </div>
        </div>

        {/* CSS Horizontal Stacked Bar Charts */}
        <div className="space-y-4 pt-2">
          {/* Department 1: Property Tax */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Property Tax (मालमत्ता कर)</span>
              <span className="font-extrabold text-slate-800">6.8 Days</span>
            </div>
            <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-100 shadow-inner">
              <div style={{ width: "22%" }} className="bg-amber-405 bg-amber-400 hover:opacity-90 transition" title="Pending: 1.5d" />
              <div style={{ width: "37%" }} className="bg-[#4b70a6] hover:opacity-90 transition" title="In Progress: 2.5d" />
              <div style={{ width: "26%" }} className="bg-purple-400 hover:opacity-90 transition" title="Needs Info: 1.8d" />
              <div style={{ width: "15%" }} className="bg-emerald-500 hover:opacity-90 transition" title="Verification: 1.0d" />
            </div>
          </div>

          {/* Department 2: Trade License */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Trade License (व्यावसायिक परवाना)</span>
              <span className="font-extrabold text-slate-800">9.0 Days</span>
            </div>
            <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-100 shadow-inner">
              <div style={{ width: "22%" }} className="bg-amber-400 hover:opacity-90 transition" title="Pending: 2.0d" />
              <div style={{ width: "33%" }} className="bg-[#4b70a6] hover:opacity-90 transition" title="In Progress: 3.0d" />
              <div style={{ width: "28%" }} className="bg-purple-400 hover:opacity-90 transition" title="Needs Info: 2.5d" />
              <div style={{ width: "17%" }} className="bg-emerald-500 hover:opacity-90 transition" title="Verification: 1.5d" />
            </div>
          </div>

          {/* Department 3: Water Connection */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Water Connection (जलजोडणी)</span>
              <span className="font-extrabold text-slate-800">17.7 Days</span>
            </div>
            <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-100 shadow-inner">
              <div style={{ width: "20%" }} className="bg-amber-400 hover:opacity-90 transition" title="Pending: 3.5d" />
              <div style={{ width: "34%" }} className="bg-[#4b70a6] hover:opacity-90 transition" title="In Progress: 6.0d" />
              <div style={{ width: "28%" }} className="bg-purple-400 hover:opacity-90 transition" title="Needs Info: 5.0d" />
              <div style={{ width: "18%" }} className="bg-emerald-500 hover:opacity-90 transition" title="Verification: 3.2d" />
            </div>
          </div>

          {/* Department 4: Town Planning */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Town Planning (नगर रचना)</span>
              <span className="font-extrabold text-slate-800">17.5 Days</span>
            </div>
            <div className="flex h-5 w-full rounded-lg overflow-hidden border border-slate-100 shadow-inner">
              <div style={{ width: "23%" }} className="bg-amber-400 hover:opacity-90 transition" title="Pending: 4.0d" />
              <div style={{ width: "31%" }} className="bg-[#4b70a6] hover:opacity-90 transition" title="In Progress: 5.5d" />
              <div style={{ width: "28%" }} className="bg-purple-400 hover:opacity-90 transition" title="Needs Info: 4.8d" />
              <div style={{ width: "18%" }} className="bg-emerald-500 hover:opacity-90 transition" title="Verification: 3.2d" />
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Detail Analysis Overlay Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[#4b70a6]" />
                <h3 className="text-sm font-extrabold text-slate-800">
                  SLA Timeline Analysis: {selectedRecord.appId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-[13px] text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Citizen Name</span>
                  <p className="font-semibold text-slate-700">{selectedRecord.citizenName}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Service Category</span>
                  <p className="font-semibold text-slate-700">{selectedRecord.serviceName}</p>
                </div>
              </div>

              {/* Stage timelines progress representation */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Stage wise duration</span>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      1. Clerk Allocation (Pending)
                    </span>
                    <span className="font-bold text-slate-800">{selectedRecord.pendingDays} Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#4b70a6]" />
                      2. Official Scrutiny (In progress)
                    </span>
                    <span className="font-bold text-slate-800">{selectedRecord.inProgressDays} Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-purple-400" />
                      3. Query Resolution (Needs info)
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedRecord.needsInfoDays > 0 ? `${selectedRecord.needsInfoDays} Days` : "0 Days (No query)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      4. Final Sign-off (Verification)
                    </span>
                    <span className="font-bold text-slate-800">{selectedRecord.verificationDays} Days</span>
                  </div>
                </div>
              </div>

              {/* SLA Target Comparison */}
              <div className="border-t border-slate-100 pt-3 mt-3">
                <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {selectedRecord.outcome === "Within SLA" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : selectedRecord.outcome === "SLA breached" ? (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-bold text-slate-700">SLA Status: {selectedRecord.outcome}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-450 block">Target vs Actual</span>
                    <span className="font-extrabold text-slate-800">
                      {selectedRecord.totalTat}d / {selectedRecord.slaLimit}d
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
