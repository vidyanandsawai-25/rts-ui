"use client";

import { useState, useMemo } from "react";
import {
  Users,
  FileSpreadsheet,
  BarChart3
} from "lucide-react";
import { Card } from "@/components/common";
import type { CmsApplication } from "@/lib/mock/rts/cms";

interface DashboardProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    slaViolations: number;
  };
  rtsDepartments: any[];
  applications?: CmsApplication[];
}

// Vibrant pie chart colours
const PIE_COLORS = [
  "#4b70a6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1",
  "#14b8a6", "#e11d48", "#7c3aed", "#0ea5e9", "#d97706"
];

export default function CmsDashboard({ stats: _stats, rtsDepartments = [], applications = [] }: DashboardProps) {

  // 1. Bilingual localization switcher
  const [lang, setLang] = useState<"en" | "mr">("en");
  const [selectedDeptId, setSelectedDeptId] = useState("birth-death");
  // Dropdown for Section 2 service-wise table: "all" = show every service
  const [selectedServiceDeptId, setSelectedServiceDeptId] = useState<string>("all");
  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // 2. Fallback stats
  const dashboardStats = useMemo(() => ({
    total: _stats?.total ?? 16,
    pending: _stats?.pending ?? 10,
    approved: _stats?.approved ?? 4,
    rejected: _stats?.rejected ?? 2,
    slaViolations: _stats?.slaViolations ?? 0,
    clerkCorrectionPending: 3
  }), [_stats]);

  const metrics = [
    { count: String(dashboardStats.total), label: "Total Applications", labelMr: "एकूण अर्ज", color: "border-[#4b70a6] text-[#4b70a6]", bg: "bg-blue-50/50" },
    { count: String(dashboardStats.pending), label: "Pending Verification", labelMr: "पडताळणी प्रलंबित", color: "border-amber-500 text-amber-600", bg: "bg-amber-50/50" },
    { count: String(dashboardStats.approved), label: "Approved Applications", labelMr: "मंजूर अर्ज", color: "border-emerald-500 text-emerald-600", bg: "bg-emerald-50/50" },
    { count: String(dashboardStats.rejected), label: "Rejected Applications", labelMr: "नाकारलेले अर्ज", color: "border-rose-500 text-rose-600", bg: "bg-rose-50/50" },
    { count: String(dashboardStats.slaViolations), label: "SLA Violated", labelMr: "SLA उल्लंघन अर्ज", color: "border-purple-500 text-purple-600", bg: "bg-purple-50/50" },
    { count: String(dashboardStats.clerkCorrectionPending), label: "Clerk Correction Pending", labelMr: "लिपिक दुरुस्ती प्रलंबित", color: "border-orange-400 text-orange-600", bg: "bg-orange-50/50" }
  ];

  // 3. matchDeptId helper
  const matchDeptId = (appDeptId: string, rtsDeptId: string) => {
    if (appDeptId === rtsDeptId) return true;
    if (appDeptId === "birth" && rtsDeptId === "birth-death") return true;
    if (appDeptId === "trade" && rtsDeptId === "trade-license") return true;
    if (appDeptId === "tax" && rtsDeptId === "property-tax") return true;
    return false;
  };

  // 4. Departmental overview stats (for Section 1 table)
  const departmentalStats = useMemo(() => {
    return rtsDepartments.map((dept, idx) => {
      const deptApps = (applications || []).filter(a => matchDeptId(a.departmentId, dept.id));
      const totalServices = dept.services?.length || 0;
      const totalApps = deptApps.length;
      const rtsApps = deptApps.filter(a => a.source === "RTS").length;
      const asApps = deptApps.filter(a => a.source === "Aaple Sarkar").length;
      const pendingApps = deptApps.filter(a => !["Approved", "Rejected"].includes(a.status)).length;
      const approvedApps = deptApps.filter(a => a.status === "Approved").length;
      const rejectedApps = deptApps.filter(a => a.status === "Rejected").length;
      const totalElapsed = deptApps.reduce((acc, a) => acc + (a.slaDays - a.remainingDays), 0);
      const avgSlaVal = deptApps.length > 0 ? (totalElapsed / deptApps.length).toFixed(1) : "6.5";
      const avgSla = lang === "en" ? `${avgSlaVal} Days` : `${avgSlaVal} दिवस`;
      return { srNo: idx + 1, deptName: lang === "en" ? dept.name.en : dept.name.mr || dept.name.en, totalServices, totalApps, rtsApps, asApps, pendingApps, approvedApps, rejectedApps, avgSla };
    });
  }, [rtsDepartments, applications, lang]);

  // 5. Selected dept for visualizer
  const selectedDept = useMemo(() => rtsDepartments.find(d => d.id === selectedDeptId) || rtsDepartments[0], [rtsDepartments, selectedDeptId]);

  const selectedDeptStats = useMemo(() => {
    if (!selectedDept) return null;
    const deptApps = (applications || []).filter(a => matchDeptId(a.departmentId, selectedDept.id));
    const totalApps = deptApps.length;
    const rtsApps = deptApps.filter(a => a.source === "RTS").length;
    const asApps = deptApps.filter(a => a.source === "Aaple Sarkar").length;
    const pendingApps = deptApps.filter(a => !["Approved", "Rejected"].includes(a.status)).length;
    const approvedApps = deptApps.filter(a => a.status === "Approved").length;
    const rejectedApps = deptApps.filter(a => a.status === "Rejected").length;
    const rtsPct = totalApps > 0 ? Math.round((rtsApps / totalApps) * 100) : 0;
    const asPct = totalApps > 0 ? Math.round((asApps / totalApps) * 100) : 0;
    const approvedPct = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
    const pendingPct = totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0;
    const rejectedPct = totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0;
    const totalElapsed = deptApps.reduce((acc, a) => acc + (a.slaDays - a.remainingDays), 0);
    const avgSlaVal = deptApps.length > 0 ? Number((totalElapsed / deptApps.length).toFixed(1)) : 6.5;
    return {
      deptName: lang === "en" ? selectedDept.name.en : selectedDept.name.mr || selectedDept.name.en,
      totalApps, rtsApps, asApps, rtsPct, asPct,
      pendingApps, approvedApps, rejectedApps,
      approvedPct, pendingPct, rejectedPct, avgSlaVal
    };
  }, [selectedDept, applications, lang]);

  // 6. Service-wise breakdown stats — all departments, keyed by serviceId
  const serviceStats = useMemo(() => {
    const serviceMap = new Map<string, {
      srNo: number; serviceId: string; serviceName: string; departmentId: string; departmentName: string;
      totalApps: number; rtsApps: number; asApps: number;
      pendingApps: number; approvedApps: number; rejectedApps: number;
      totalElapsed: number; avgSla: string;
    }>();

    (applications || []).forEach(app => {
      const key = app.serviceId;
      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          srNo: 0, serviceId: app.serviceId, serviceName: app.serviceName,
          departmentId: app.departmentId, departmentName: app.departmentName,
          totalApps: 0, rtsApps: 0, asApps: 0,
          pendingApps: 0, approvedApps: 0, rejectedApps: 0,
          totalElapsed: 0, avgSla: "0 Days"
        });
      }
      const entry = serviceMap.get(key)!;
      entry.totalApps++;
      if (app.source === "RTS") entry.rtsApps++;
      if (app.source === "Aaple Sarkar") entry.asApps++;
      if (!["Approved", "Rejected"].includes(app.status)) entry.pendingApps++;
      if (app.status === "Approved") entry.approvedApps++;
      if (app.status === "Rejected") entry.rejectedApps++;
      entry.totalElapsed += (app.slaDays - app.remainingDays);
    });

    let srNo = 1;
    return Array.from(serviceMap.values()).map(s => {
      const avgSlaVal = s.totalApps > 0 ? (s.totalElapsed / s.totalApps).toFixed(1) : "6.5";
      return { ...s, srNo: srNo++, avgSla: lang === "en" ? `${avgSlaVal} Days` : `${avgSlaVal} दिवस` };
    });
  }, [applications, lang]);

  // 6b. Filtered service stats — based on the Section 2 dropdown selection
  const filteredServiceStats = useMemo(() => {
    if (selectedServiceDeptId === "all") return serviceStats;
    return serviceStats.filter(s => matchDeptId(s.departmentId, selectedServiceDeptId)).map((s, i) => ({ ...s, srNo: i + 1 }));
  }, [serviceStats, selectedServiceDeptId]);

  // 7. Pie chart segments — from filteredServiceStats so it reacts to dropdown
  const pieSegments = useMemo(() => {
    const total = filteredServiceStats.reduce((s, r) => s + r.totalApps, 0);
    if (total === 0) return [];
    let cumulative = 0;
    return filteredServiceStats.map((s, i) => {
      const pct = s.totalApps / total;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const cx = 90, cy = 90, r = 75;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = pct > 0.5 ? 1 : 0;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const lx = cx + (r + 18) * Math.cos(midAngle);
      const ly = cy + (r + 18) * Math.sin(midAngle);
      return {
        path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: PIE_COLORS[i % PIE_COLORS.length],
        pct: Math.round(pct * 100),
        name: s.serviceName,
        lx, ly, midAngle
      };
    });
  }, [filteredServiceStats]);

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {lang === "en" ? "RTS Executive Dashboard" : "सेवा हक्क कार्यकारी डॅशबोर्ड"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "en" ? "Akola Municipal Corporation Inspired Layout • Live Verification Data" : "अकोला महानगरपालिका प्रणाली प्रेरित आराखडा • थेट पडताळणी माहिती"}
          </p>
        </div>
        {/* Right side: date filter + language toggle */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">

          {/* From – To date filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {lang === "en" ? "From" : "पासून"}
            </span>
            <input
              id="dashboard-date-from"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            />
            <span className="text-slate-300 font-bold">|</span>
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {lang === "en" ? "To" : "पर्यंत"}
            </span>
            <input
              id="dashboard-date-to"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition ml-1"
                title="Clear dates"
              >
                ✕
              </button>
            )}
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLang("en")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${lang === "en" ? "bg-[#4b70a6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>English</button>
            <button onClick={() => setLang("mr")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${lang === "mr" ? "bg-[#4b70a6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>मराठी</button>
          </div>
        </div>
      </div>

      {/* Generic Stats Cards — 6 cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m, idx) => (
          <div key={idx} className={`flex flex-col justify-between rounded-2xl border-l-4 p-4 shadow-sm transition hover:shadow bg-white ${m.color} ${m.bg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{lang === "en" ? m.label : m.labelMr}</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-800">{m.count}</div>
          </div>
        ))}
      </div>

      {/* SECTION 1: Departmental Breakdown + Graphical Visualizer */}
      {/* items-start: graphical card does NOT stretch to match the table's height */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        {/* Table 70% — fixed max-height with scroll */}
        <Card className="p-4 w-full lg:w-[70%] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-3">
            <h2 className="text-sm font-bold text-[#243B7C] flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#4b70a6]" />
              {lang === "en" ? "Departmental Service Applications Breakdown" : "विभाग निहाय सेवा अर्ज गोषवारा"}
            </h2>
            <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 animate-pulse">
              {lang === "en" ? "Click row to visualize" : "पाहण्यासाठी रो वर क्लिक करा"}
            </span>
          </div>
          {/* max-h scroll so the table never pushes the graphical card taller */}
          <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-xl border border-slate-100 shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#4b70a6] font-semibold text-white text-center sticky top-0 z-20">
                <tr>
                  <th className="p-3 border-r border-[#3d5a8a] text-center w-16">{lang === "en" ? "Sr. No." : "अनु. क्र."}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-left">{lang === "en" ? "Department" : "विभाग"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Total Services" : "एकूण सेवा"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Total Applications" : "एकूण अर्ज"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "From RTS" : "आरटीएस"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "From Aaple Sarkar" : "आपले सरकार"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Pending" : "प्रलंबित"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Approved" : "मंजूर"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Rejected" : "नाकारलेले"}</th>
                  <th className="p-3 text-center">{lang === "en" ? "Avg. SLA" : "सरासरी SLA"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center font-semibold text-slate-800">
                {departmentalStats.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-slate-400 font-bold">{lang === "en" ? "No data." : "माहिती नाही."}</td></tr>
                ) : departmentalStats.map((row) => {
                  const deptId = rtsDepartments[row.srNo - 1]?.id || "";
                  const isSelected = selectedDeptId === deptId;
                  return (
                    <tr key={row.srNo} className={`hover:bg-slate-50/70 transition cursor-pointer ${isSelected ? "bg-blue-50/50" : ""}`} onClick={() => setSelectedDeptId(deptId)}>
                      <td className={`p-3 border-r border-slate-100 font-extrabold text-slate-900 ${isSelected ? "bg-blue-100/50 border-l-4 border-l-[#4b70a6]" : "bg-slate-50/50"}`}>{row.srNo}</td>
                      <td className={`p-3 border-r border-slate-100 text-left font-bold ${isSelected ? "text-[#4b70a6]" : "text-slate-900"}`}>{row.deptName}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-slate-700">{row.totalServices}</td>
                      <td className="p-3 border-r border-slate-100 font-extrabold text-slate-800 bg-slate-50/30">{row.totalApps}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-indigo-700">{row.rtsApps}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-orange-700">{row.asApps}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-amber-600">{row.pendingApps}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-emerald-600">{row.approvedApps}</td>
                      <td className="p-3 border-r border-slate-100 font-bold text-rose-600">{row.rejectedApps}</td>
                      <td className="p-3 font-extrabold text-teal-600">{row.avgSla}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Graphical Representation 30% – completely free / auto height */}
        <Card className="p-4 w-full lg:w-[30%] border border-slate-200 bg-white shadow-sm flex flex-col gap-3 self-start">
          {/* Header */}
          <div className="border-b border-slate-100 pb-1.5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4b70a6] animate-pulse" />
              {selectedDeptStats?.deptName}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {lang === "en" ? "Interactive Data Visualization" : "परस्परसंवादी डेटा व्हिज्युअलायझेशन"}
            </p>
          </div>

          {/* Source Share */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[13px] font-bold text-slate-650">
              <span>{lang === "en" ? "Source Share" : "स्रोत विभागणी"}</span>
              <span>{selectedDeptStats?.totalApps} {lang === "en" ? "Apps" : "अर्ज"}</span>
            </div>
            {selectedDeptStats?.totalApps === 0 ? (
              <div className="h-8 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[12px] font-bold text-slate-400">
                {lang === "en" ? "No applications registered" : "कोणतेही अर्ज नाहीत"}
              </div>
            ) : (
              <div className="space-y-1.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <div className="h-5 w-full rounded-lg overflow-hidden flex bg-slate-100">
                  <div style={{ width: `${selectedDeptStats?.rtsPct || 0}%` }} className="bg-[#4b70a6] h-full transition-all duration-500 flex items-center justify-center text-[11px] font-extrabold text-white" title={`RTS: ${selectedDeptStats?.rtsApps}`}>
                    {(selectedDeptStats?.rtsPct || 0) > 20 && `${selectedDeptStats?.rtsPct}%`}
                  </div>
                  <div style={{ width: `${selectedDeptStats?.asPct || 0}%` }} className="bg-orange-500 h-full transition-all duration-500 flex items-center justify-center text-[11px] font-extrabold text-white" title={`Aaple Sarkar: ${selectedDeptStats?.asApps}`}>
                    {(selectedDeptStats?.asPct || 0) > 20 && `${selectedDeptStats?.asPct}%`}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold px-0.5">
                  <div className="flex items-center gap-1 text-[#4b70a6]"><span className="h-1.5 w-1.5 rounded-full bg-[#4b70a6]" /><span>RTS ({selectedDeptStats?.rtsApps})</span></div>
                  <div className="flex items-center gap-1 text-orange-600"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /><span>Aaple Sarkar ({selectedDeptStats?.asApps})</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar Graph */}
          <div className="space-y-1">
            <span className="text-[13px] font-bold text-slate-700 block">{lang === "en" ? "Application Status Distribution" : "अर्ज स्थिती वितरण"}</span>
            <div className="space-y-1.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
              {[
                { label: lang === "en" ? "Approved" : "मंजूर", pct: selectedDeptStats?.approvedPct || 0, count: selectedDeptStats?.approvedApps, color: "bg-emerald-500", text: "text-emerald-700" },
                { label: lang === "en" ? "Pending" : "प्रलंबित", pct: selectedDeptStats?.pendingPct || 0, count: selectedDeptStats?.pendingApps, color: "bg-amber-500", text: "text-amber-600" },
                { label: lang === "en" ? "Rejected" : "नाकारलेले", pct: selectedDeptStats?.rejectedPct || 0, count: selectedDeptStats?.rejectedApps, color: "bg-rose-500", text: "text-rose-600" }
              ].map(item => (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={item.text}>{item.label}</span>
                    <span className="text-slate-700">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${item.pct}%` }} className={`${item.color} h-full rounded-full transition-all duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA */}
          <div className="space-y-1">
            <span className="text-[13px] font-bold text-slate-700 block">{lang === "en" ? "SLA Target Efficiency" : "SLA कामगिरी"}</span>
            <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between border border-slate-100 shadow-sm">
              <div className="space-y-0.5">
                <div className="text-[12px] font-bold text-slate-600">{lang === "en" ? "SLA Speed Performance" : "SLA वेग कामगिरी"}</div>
                <div className="text-[11px] font-bold text-slate-400">{lang === "en" ? "Target SLA: 10.0 Days" : "उद्दिष्ट: १०.० दिवस"}</div>
              </div>
              <div className="flex flex-col items-end justify-center leading-tight">
                <span className="text-xl font-extrabold text-teal-600">{selectedDeptStats?.avgSlaVal}</span>
                <span className="text-[10px] font-bold text-slate-500">{lang === "en" ? "Days" : "दिवस"}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 2: Service-wise Applications Breakdown + Pie Chart */}
      <Card className="p-4 border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#4b70a6]" />
            <h2 className="text-sm font-bold text-[#243B7C]">
              {lang === "en" ? "Service-wise Applications Breakdown" : "सेवा निहाय अर्ज गोषवारा"}
            </h2>
          </div>
          {/* Department filter dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {lang === "en" ? "Filter by Dept:" : "विभाग निवडा:"}
            </label>
            <select
              id="service-dept-filter"
              value={selectedServiceDeptId}
              onChange={e => setSelectedServiceDeptId(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b70a6]/40 cursor-pointer hover:border-[#4b70a6] transition"
            >
              <option value="all">{lang === "en" ? "All Departments" : "सर्व विभाग"}</option>
              {rtsDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {lang === "en" ? dept.name.en : dept.name.mr || dept.name.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Service Table 70% */}
          <div className="w-full lg:w-[70%] overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#4b70a6] font-semibold text-white text-center sticky top-0 z-20">
                <tr>
                  <th className="p-3 border-r border-[#3d5a8a] text-center w-14">{lang === "en" ? "Sr. No." : "अनु. क्र."}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-left">{lang === "en" ? "Service Name" : "सेवेचे नाव"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Total Applications" : "एकूण अर्ज"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Source: RTS" : "स्रोत: आरटीएस"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Source: Aaple Sarkar" : "स्रोत: आपले सरकार"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Pending" : "प्रलंबित"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Approved" : "मंजूर"}</th>
                  <th className="p-3 border-r border-[#3d5a8a] text-center">{lang === "en" ? "Rejected" : "नाकारलेले"}</th>
                  <th className="p-3 text-center">{lang === "en" ? "Avg. Processing Time (SLA)" : "सरासरी वेळ (SLA)"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center font-semibold text-slate-800">
                {filteredServiceStats.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-slate-400 font-bold">{lang === "en" ? "No services found for this department." : "विभागासाठी सेवा उपलब्ध नाही."}</td></tr>
                ) : filteredServiceStats.map((row, i) => (
                  <tr key={row.serviceId} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 border-r border-slate-100 bg-slate-50/50 font-extrabold text-slate-900">{row.srNo}</td>
                    <td className="p-3 border-r border-slate-100 text-left font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {row.serviceName}
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-100 font-extrabold text-slate-800 bg-slate-50/30">{row.totalApps}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-indigo-700">{row.rtsApps}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-orange-700">{row.asApps}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-amber-600">{row.pendingApps}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-emerald-600">{row.approvedApps}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-rose-600">{row.rejectedApps}</td>
                    <td className="p-3 font-extrabold text-teal-600">{row.avgSla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie Chart 30% — clean donut with side-by-side legend */}
          <div className="w-full lg:w-[30%] flex flex-col gap-3 bg-slate-50/50 rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#4b70a6]" />
              <span className="text-[13px] font-bold text-slate-700">
                {lang === "en" ? "Applications by Service" : "सेवेनुसार अर्ज"}
              </span>
            </div>

            {filteredServiceStats.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-bold">
                {lang === "en" ? "No data" : "माहिती नाही"}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Donut chart — large & prominent */}
                <svg viewBox="0 0 180 180" className="w-64 h-64 drop-shadow-sm">
                  {pieSegments.map((seg, i) => (
                    <path
                      key={i}
                      d={seg.path}
                      fill={seg.color}
                      stroke="white"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:opacity-75 cursor-pointer"
                    >
                      <title>{seg.name}: {seg.pct}%</title>
                    </path>
                  ))}
                  <circle cx="90" cy="90" r="38" fill="white" />
                  <text x="90" y="85" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                    {lang === "en" ? "Total" : "एकूण"}
                  </text>
                  <text x="90" y="102" textAnchor="middle" fontSize="16" fontWeight="800" fill="#4b70a6">
                    {filteredServiceStats.reduce((s, r) => s + r.totalApps, 0)}
                  </text>
                </svg>

                {/* Compact 2-column legend — no bars */}
                <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {filteredServiceStats.map((s, i) => {
                    const total = filteredServiceStats.reduce((a, r) => a + r.totalApps, 0);
                    const pct = total > 0 ? Math.round((s.totalApps / total) * 100) : 0;
                    return (
                      <div key={s.serviceId} className="flex items-center gap-1.5 min-w-0">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[10px] font-semibold text-slate-600 truncate flex-1">{s.serviceName}</span>
                        <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
