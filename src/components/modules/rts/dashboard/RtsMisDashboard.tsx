"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileSpreadsheet,
  BarChart3,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Timer,
} from "lucide-react";
import { Button, Card, Input, MasterTable } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { Select } from "@/components/common/select";
import type { RtsMisDashboardData } from "@/types/rts-dashboard.types";

interface DashboardProps {
  misDashboardData: RtsMisDashboardData;
}

interface DepartmentalStatsRow extends Record<string, unknown> {
  srNo: number;
  deptId: string;
  deptName: string;
  totalServices: number;
  totalApps: number;
  rtsApps: number;
  asApps: number;
  pendingApps: number;
  approvedApps: number;
  rejectedApps: number;
  overdueCount: number;
  avgSlaValue: number;
  avgSla: string;
}

interface ServiceStatsRow extends Record<string, unknown> {
  srNo: number;
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  totalApps: number;
  rtsApps: number;
  asApps: number;
  pendingApps: number;
  approvedApps: number;
  rejectedApps: number;
  overdueCount: number;
  avgSlaValue: number;
  avgSla: string;
}

const PIE_COLORS = [
  "#0B5CD5", "#F39C12", "#27AE60", "#B22222", "#8A2BE2",
  "#008B8B", "#C66922", "#228B22", "#551A8B", "#3F7C9E",
  "#0F7A3F", "#FF8C00"
];

function createMisIdentifier(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

function formatSla(value: number, lang: "en" | "mr") {
  const normalized = Number.isFinite(value) ? value : 0;
  return lang === "en" ? `${normalized.toFixed(1)} Days` : `${normalized.toFixed(1)} दिवस`;
}

export default function RtsMisDashboard({ misDashboardData }: DashboardProps) {
  const [lang, _setLang] = useState<"en" | "mr">("en");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedServiceDeptId, setSelectedServiceDeptId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const departmentalStats = useMemo<DepartmentalStatsRow[]>(() => {
    return (misDashboardData.departmentWiseData ?? []).map((department, index) => {
      const deptName = department.departmentName?.trim() || `Department ${index + 1}`;
      const deptId = department.departmentId != null
        ? String(department.departmentId)
        : `department-${createMisIdentifier(deptName, String(index + 1))}`;
      const avgSlaValue = Number(department.sla ?? 0);

      return {
        srNo: index + 1,
        deptId,
        deptName,
        totalServices: Number(department.totalServices ?? 0),
        totalApps: Number(department.totalApplications ?? 0),
        rtsApps: Number(department.fromRTS ?? 0),
        asApps: Number(department.fromAapleSarkar ?? 0),
        pendingApps: Number(department.pending ?? 0),
        approvedApps: Number(department.approved ?? 0),
        rejectedApps: Number(department.rejected ?? 0),
        overdueCount: Number(department.overdueCount ?? 0),
        avgSlaValue,
        avgSla: formatSla(avgSlaValue, lang),
      };
    });
  }, [lang, misDashboardData.departmentWiseData]);

  const serviceStats = useMemo<ServiceStatsRow[]>(() => {
    return (misDashboardData.serviceWiseData ?? []).map((service, index) => {
      const apiDepartmentName = service.departmentName?.trim();
      const departmentId = service.departmentId != null
        ? String(service.departmentId)
        : apiDepartmentName
          ? `department-${createMisIdentifier(apiDepartmentName, String(index + 1))}`
          : "unmapped";
      const departmentName = apiDepartmentName || "Other Services";
      const avgSlaValue = Number(service.sla ?? 0);

      return {
        srNo: index + 1,
        serviceId: `${departmentId}-${createMisIdentifier(service.serviceName, String(index + 1))}`,
        serviceName: service.serviceName,
        departmentId,
        departmentName,
        totalApps: Number(service.totalApplications ?? 0),
        rtsApps: Number(service.rtsApplications ?? 0),
        asApps: Number(service.aapleSarkarApplications ?? 0),
        pendingApps: Number(service.pending ?? 0),
        approvedApps: Number(service.approved ?? 0),
        rejectedApps: Number(service.rejected ?? 0),
        overdueCount: Number(service.overdueCount ?? 0),
        avgSlaValue,
        avgSla: formatSla(avgSlaValue, lang),
      };
    });
  }, [lang, serviceWiseData => misDashboardData.serviceWiseData]);

  useEffect(() => {
    if (!selectedDeptId && departmentalStats.length > 0) {
      setSelectedDeptId(departmentalStats[0].deptId);
    }
  }, [departmentalStats, selectedDeptId]);

  const selectedDept = useMemo(
    () => departmentalStats.find((department) => department.deptId === selectedDeptId) ?? departmentalStats[0] ?? null,
    [departmentalStats, selectedDeptId]
  );

  const selectedDeptStats = useMemo(() => {
    if (!selectedDept) return null;

    const totalApps = selectedDept.totalApps;
    const rtsPct = totalApps > 0 ? Math.round((selectedDept.rtsApps / totalApps) * 100) : 0;
    const asPct = totalApps > 0 ? Math.round((selectedDept.asApps / totalApps) * 100) : 0;
    const approvedPct = totalApps > 0 ? Math.round((selectedDept.approvedApps / totalApps) * 100) : 0;
    const pendingPct = totalApps > 0 ? Math.round((selectedDept.pendingApps / totalApps) * 100) : 0;
    const rejectedPct = totalApps > 0 ? Math.round((selectedDept.rejectedApps / totalApps) * 100) : 0;

    return {
      deptName: selectedDept.deptName,
      totalApps,
      rtsApps: selectedDept.rtsApps,
      asApps: selectedDept.asApps,
      approvedApps: selectedDept.approvedApps,
      pendingApps: selectedDept.pendingApps,
      rejectedApps: selectedDept.rejectedApps,
      overdueCount: selectedDept.overdueCount,
      avgSlaVal: selectedDept.avgSlaValue,
      rtsPct,
      asPct,
      approvedPct,
      pendingPct,
      rejectedPct,
    };
  }, [selectedDept]);

  const serviceDeptOptions = useMemo(
    () => [
      {
        value: "all",
        label: lang === "en" ? "All Departments" : "सर्व विभाग",
      },
      ...departmentalStats.map((department) => ({
        value: department.deptId,
        label: department.deptName,
      })),
    ],
    [departmentalStats, lang]
  );

  const filteredServiceStats = useMemo(() => {
    if (selectedServiceDeptId === "all") return serviceStats;

    const departmentServices = serviceStats.filter(
      (service) => service.departmentId === selectedServiceDeptId
    );

    const visibleServices = departmentServices.length > 0 ? departmentServices : serviceStats;

    return visibleServices.map((service, index) => ({ ...service, srNo: index + 1 }));
  }, [selectedServiceDeptId, serviceStats]);

  const dashboardStats = useMemo(() => {
    const totals = departmentalStats.reduce(
      (acc, department) => {
        acc.total += department.totalApps;
        acc.pending += department.pendingApps;
        acc.approved += department.approvedApps;
        acc.rejected += department.rejectedApps;
        acc.slaViolations += department.overdueCount;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        slaViolations: 0,
      }
    );

    return {
      ...totals,
      clerkCorrectionPending: 0,
    };
  }, [departmentalStats]);

  const metrics = [
    {
      count: String(dashboardStats.total),
      label: "Total Applications",
      labelMr: "एकूण अर्ज",
      detail: "All Submitted",
      detailMr: "सर्व सादर अर्ज",
      icon: FileText,
      iconClassName: "bg-blue-50 text-[#0B5CD5] ring-blue-100",
      detailClassName: "text-[#0B5CD5]",
    },
    {
      count: String(dashboardStats.pending),
      label: "Pending Verification",
      labelMr: "पडताळणी प्रलंबित",
      detail: "In Progress",
      detailMr: "प्रक्रियेत",
      icon: Clock3,
      iconClassName: "bg-amber-50 text-[#F39C12] ring-amber-100",
      detailClassName: "text-[#C66922]",
    },
    {
      count: String(dashboardStats.approved),
      label: "Approved Applications",
      labelMr: "मंजूर अर्ज",
      detail: "Completed",
      detailMr: "पूर्ण झाले",
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-[#27AE60] ring-emerald-100",
      detailClassName: "text-[#0F7A3F]",
    },
    {
      count: String(dashboardStats.rejected),
      label: "Rejected Applications",
      labelMr: "नाकारलेले अर्ज",
      detail: "Not Approved",
      detailMr: "मंजूर नाही",
      icon: XCircle,
      iconClassName: "bg-rose-50 text-[#B22222] ring-rose-100",
      detailClassName: "text-[#B22222]",
    },
    {
      count: String(dashboardStats.slaViolations),
      label: "OverDue Applications",
      labelMr: "SLA उल्लंघन अर्ज",
      detail: "Requires Attention",
      detailMr: "लक्ष आवश्यक",
      icon: Timer,
      iconClassName: "bg-violet-50 text-[#8A2BE2] ring-violet-100",
      detailClassName: "text-[#551A8B]",
    },
  ];

  const departmentColumns = useMemo<Column<DepartmentalStatsRow>[]>(() => [
    {
      key: "srNo",
      label: lang === "en" ? "Sr. No." : "अनु. क्र.",
      align: "center",
      headerClassName: "border-r border-blue-300/60 text-center text-white w-16",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => (
        <span className={`block px-1 py-1 font-extrabold ${selectedDeptId === row.deptId ? "text-[#0B5CD5]" : "text-slate-900"}`}>
          {row.srNo}
        </span>
      ),
    },
    {
      key: "deptName",
      label: lang === "en" ? "Department" : "विभाग",
      headerClassName: "border-r border-blue-300/60 text-left text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => <span className={`font-bold ${selectedDeptId === row.deptId ? "text-[#0B5CD5]" : "text-slate-900"}`}>{row.deptName}</span>,
    },
    { key: "totalServices", label: lang === "en" ? "Total Services" : "एकूण सेवा", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-slate-700">{String(value ?? 0)}</span> },
    { key: "totalApps", label: lang === "en" ? "Total Applications" : "एकूण अर्ज", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100 bg-slate-50/30", render: (value) => <span className="font-extrabold text-slate-800">{String(value ?? 0)}</span> },
    { key: "rtsApps", label: lang === "en" ? "From RTS" : "आरटीएसकडून", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#4B0082]">{String(value ?? 0)}</span> },
    { key: "asApps", label: lang === "en" ? "From Aaple Sarkar" : "आपले सरकारकडून", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "pendingApps", label: lang === "en" ? "Pending" : "प्रलंबित", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "approvedApps", label: lang === "en" ? "Approved" : "मंजूर", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#0F7A3F]">{String(value ?? 0)}</span> },
    { key: "rejectedApps", label: lang === "en" ? "Rejected" : "नाकारलेले", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#B22222]">{String(value ?? 0)}</span> },
    { key: "overdueCount", label: lang === "en" ? "OverDue Count" : "ओव्हरड्यू संख्या", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-rose-700">{String(value ?? 0)}</span> },
    { key: "avgSla", label: lang === "en" ? "Avg. SLA" : "सरासरी SLA", align: "center", headerClassName: "text-center text-white", render: (value) => <span className="font-extrabold text-[#008B8B]">{String(value ?? "-")}</span> },
  ], [lang, selectedDeptId]);

  const serviceColumns = useMemo<Column<ServiceStatsRow>[]>(() => [
    { key: "srNo", label: lang === "en" ? "Sr. No." : "अनु. क्र.", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white w-14", cellClassName: "border-r border-slate-100 bg-slate-50/50", render: (value) => <span className="font-extrabold text-slate-900">{String(value ?? 0)}</span> },
    {
      key: "serviceName",
      label: lang === "en" ? "Service Name" : "सेवेचे नाव",
      headerClassName: "border-r border-blue-300/60 text-left text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row, index) => (
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
          {row.serviceName}
        </div>
      ),
    },
    { key: "totalApps", label: lang === "en" ? "Total Applications" : "एकूण अर्ज", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100 bg-slate-50/30", render: (value) => <span className="font-extrabold text-slate-800">{String(value ?? 0)}</span> },
    { key: "rtsApps", label: lang === "en" ? "Source: RTS" : "स्रोत: आरटीएस", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#4B0082]">{String(value ?? 0)}</span> },
    { key: "asApps", label: lang === "en" ? "Source: Aaple Sarkar" : "स्रोत: आपले सरकार", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "pendingApps", label: lang === "en" ? "Pending" : "प्रलंबित", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "approvedApps", label: lang === "en" ? "Approved" : "मंजूर", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#0F7A3F]">{String(value ?? 0)}</span> },
    { key: "rejectedApps", label: lang === "en" ? "Rejected" : "नाकारलेले", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#B22222]">{String(value ?? 0)}</span> },
    { key: "overdueCount", label: lang === "en" ? "OverDue Count" : "ओव्हरड्यू संख्या", align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-rose-700">{String(value ?? 0)}</span> },
    { key: "avgSla", label: lang === "en" ? "Avg. Processing Time (SLA)" : "सरासरी प्रक्रिया वेळ (SLA)", align: "center", headerClassName: "text-center text-white", render: (value) => <span className="font-extrabold text-[#008B8B]">{String(value ?? "-")}</span> },
  ], [lang]);

  const pieSegments = useMemo(() => {
    const total = filteredServiceStats.reduce((sum, row) => sum + row.totalApps, 0);
    if (total === 0) return [];

    let cumulative = 0;

    return filteredServiceStats.map((service, index) => {
      const pct = service.totalApps / total;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const cx = 90;
      const cy = 90;
      const r = 75;
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
        color: PIE_COLORS[index % PIE_COLORS.length],
        pct: Math.round(pct * 100),
        name: service.serviceName,
        lx,
        ly,
        midAngle,
      };
    });
  }, [filteredServiceStats]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {lang === "en" ? "RTS MIS Dashboard" : "आरटीएस एमआयएस डॅशबोर्ड"}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
            <span className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {lang === "en" ? "From" : "पासून"}
            </span>
            <Input
              id="dashboard-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              aria-label={lang === "en" ? "From date" : "सुरुवातीची तारीख"}
              className="h-8 min-w-[132px] cursor-pointer border-0 bg-transparent px-1 text-[12px] font-semibold text-slate-700 shadow-none focus-visible:ring-0"
            />
            <span className="font-bold text-slate-300">|</span>
            <span className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {lang === "en" ? "To" : "पर्यंत"}
            </span>
            <Input
              id="dashboard-date-to"
              type="date"
              min={dateFrom || undefined}
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              aria-label={lang === "en" ? "To date" : "शेवटची तारीख"}
              className="h-8 min-w-[132px] cursor-pointer border-0 bg-transparent px-1 text-[12px] font-semibold text-slate-700 shadow-none focus-visible:ring-0"
            />
            {(dateFrom || dateTo) && (
              <Button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                aria-label={lang === "en" ? "Clear date filter" : "तारीख फिल्टर साफ करा"}
                title={lang === "en" ? "Clear dates" : "तारखा साफ करा"}
                className="ml-1 h-7 min-h-0 px-2 text-[10px] font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            padding="none"
            className="group flex min-h-[112px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 mr-3 shrink-0 items-center justify-center rounded-full ring-4 ${metric.iconClassName}`}>
              <metric.icon className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold leading-tight text-slate-500">
                {lang === "en" ? metric.label : metric.labelMr}
              </div>
              <div className="mt-1 text-2xl font-extrabold leading-none text-slate-800">{metric.count}</div>
              <div className={`mt-2 text-[11px] font-bold ${metric.detailClassName}`}>
                {lang === "en" ? metric.detail : metric.detailMr}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card className="w-full overflow-hidden border border-slate-200 bg-white p-4 shadow-sm lg:w-[70%]">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#0a3275]">
              <FileSpreadsheet className="h-5 w-5 text-[#0B5CD5]" />
              {lang === "en" ? "Departmental Service Applications Breakdown" : "विभाग निहाय सेवा अर्ज गोषवारा"}
            </h2>
            <span className="animate-pulse rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-[#0F7A3F]">
              {lang === "en" ? "Click row to visualize" : "पाहण्यासाठी रो वर क्लिक करा"}
            </span>
          </div>
          <MasterTable<DepartmentalStatsRow>
            columns={departmentColumns}
            data={departmentalStats}
            emptyText={lang === "en" ? "No data." : "माहिती नाही."}
            getRowKey={(row) => row.deptId}
            onRowClick={(row) => setSelectedDeptId(row.deptId)}
            rowClassName={(row) => (selectedDeptId === row.deptId ? "bg-blue-50" : "")}
            maxBodyHeightClassName="max-h-[360px]"
            theadClassName="bg-[#0A3275]"
            tableClassName="border-collapse text-left text-sm"
            containerClassName="gap-0"
          />
        </Card>

        <Card className="flex w-full flex-col gap-3 self-start border border-slate-200 bg-white p-4 shadow-sm lg:w-[30%]">
          <div className="border-b border-slate-100 pb-1.5">
            <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-800">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0B5CD5]" />
              {selectedDeptStats?.deptName}
            </h3>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === "en" ? "Interactive Data Visualization" : "परस्परसंवादी डेटा व्हिज्युअलायझेशन"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[13px] font-bold text-[#303031]">
              <span>{lang === "en" ? "Source Share" : "स्रोत विभागणी"}</span>
              <span>{selectedDeptStats?.totalApps ?? 0} {lang === "en" ? "Apps" : "अर्ज"}</span>
            </div>
            {(selectedDeptStats?.totalApps ?? 0) === 0 ? (
              <div className="flex h-8 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-400">
                {lang === "en" ? "No applications registered" : "कोणतेही अर्ज नाहीत"}
              </div>
            ) : (
              <div className="mb-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                <div className="flex h-5 w-full overflow-hidden rounded-lg bg-slate-100">
                  <div
                    style={{ width: `${selectedDeptStats?.rtsPct ?? 0}%` }}
                    className="flex h-full items-center justify-center bg-[#0B5CD5] text-[11px] font-extrabold text-white transition-all duration-500"
                    title={`RTS: ${selectedDeptStats?.rtsApps ?? 0}`}
                  >
                    {(selectedDeptStats?.rtsPct ?? 0) > 20 && `${selectedDeptStats?.rtsPct}%`}
                  </div>
                  <div
                    style={{ width: `${selectedDeptStats?.asPct ?? 0}%` }}
                    className="flex h-full items-center justify-center bg-[#F39C12] text-[11px] font-extrabold text-white transition-all duration-500"
                    title={`Aaple Sarkar: ${selectedDeptStats?.asApps ?? 0}`}
                  >
                    {(selectedDeptStats?.asPct ?? 0) > 20 && `${selectedDeptStats?.asPct}%`}
                  </div>
                </div>
                <div className="flex items-center justify-between px-0.5 text-[11px] font-bold">
                  <div className="flex items-center gap-1 text-[#0B5CD5]"><span className="h-1.5 w-1.5 rounded-full bg-[#0B5CD5]" /><span>RTS ({selectedDeptStats?.rtsApps ?? 0})</span></div>
                  <div className="flex items-center gap-1 text-[#C66922]"><span className="h-1.5 w-1.5 rounded-full bg-[#F39C12]" /><span>Aaple Sarkar ({selectedDeptStats?.asApps ?? 0})</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="block text-[13px] font-bold text-[#0a3275]">
              {lang === "en" ? "Application Status Distribution" : "अर्ज स्थिती वितरण"}
            </span>
            <div className="mb-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              {[
                { label: lang === "en" ? "Approved" : "मंजूर", pct: selectedDeptStats?.approvedPct ?? 0, count: selectedDeptStats?.approvedApps ?? 0, color: "bg-[#27AE60]", text: "text-[#0F7A3F]" },
                { label: lang === "en" ? "Pending" : "प्रलंबित", pct: selectedDeptStats?.pendingPct ?? 0, count: selectedDeptStats?.pendingApps ?? 0, color: "bg-[#F39C12]", text: "text-[#C66922]" },
                { label: lang === "en" ? "Rejected" : "नाकारलेले", pct: selectedDeptStats?.rejectedPct ?? 0, count: selectedDeptStats?.rejectedApps ?? 0, color: "bg-[#B22222]", text: "text-[#B22222]" },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={item.text}>{item.label}</span>
                    <span className="text-slate-700">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div style={{ width: `${item.pct}%` }} className={`${item.color} h-full rounded-full transition-all duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="block text-[13px] font-bold text-[#0a3275]">
              {lang === "en" ? "SLA Target Efficiency" : "SLA कामगिरी"}
            </span>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm">
              <div className="space-y-0.5">
                <div className="text-[12px] font-bold text-slate-600">{lang === "en" ? "SLA Speed Performance" : "SLA वेग कामगिरी"}</div>
                <div className="text-[11px] font-bold text-slate-400">{lang === "en" ? "Target SLA: 10.0 Days" : "उद्दिष्ट: १०.० दिवस"}</div>
              </div>
              <div className="flex flex-col items-end justify-center leading-tight">
                <span className="text-xl font-extrabold text-[#008B8B]">{selectedDeptStats?.avgSlaVal ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-500">{lang === "en" ? "Days" : "दिवस"}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#0B5CD5]" />
            <h2 className="text-sm font-bold text-[#0a3275]">
              {lang === "en" ? "Service-wise Applications Breakdown" : "सेवा निहाय अर्ज गोषवारा"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {lang === "en" ? "Filter by Dept:" : "विभाग निवडा:"}
            </label>
            <div className="min-w-[180px]">
              <Select
                options={serviceDeptOptions}
                value={selectedServiceDeptId}
                onChange={(_event, value) => setSelectedServiceDeptId(value)}
                placeholder={lang === "en" ? "All Departments" : "सर्व विभाग"}
                selectSize="sm"
                ariaLabel={lang === "en" ? "Filter services by department" : "विभागानुसार सेवा फिल्टर करा"}
                className="text-[12px] font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <MasterTable<ServiceStatsRow>
            columns={serviceColumns}
            data={filteredServiceStats}
            emptyText={lang === "en" ? "No services found for this department." : "विभागासाठी सेवा उपलब्ध नाही."}
            getRowKey={(row) => row.serviceId}
            theadClassName="bg-[#0A3275]"
            tableClassName="border-collapse text-left text-sm"
            containerClassName="gap-0"
          />

          <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm lg:w-[30%]">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#0B5CD5]" />
              <span className="text-[13px] font-bold text-slate-700">
                {lang === "en" ? "Applications by Service" : "सेवेनुसार अर्ज"}
              </span>
            </div>

            {filteredServiceStats.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm font-bold text-slate-400">
                {lang === "en" ? "No data" : "माहिती नाही"}
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-3">
                <svg viewBox="0 0 180 180" className="h-64 w-64 drop-shadow-sm">
                  {pieSegments.map((segment, index) => (
                    <path
                      key={index}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-300 hover:opacity-75"
                    >
                      <title>{segment.name}: {segment.pct}%</title>
                    </path>
                  ))}
                  <circle cx="90" cy="90" r="38" fill="white" />
                  <text x="90" y="85" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                    {lang === "en" ? "Total" : "एकूण"}
                  </text>
                  <circle cx="90" cy="90" r="38" fill="white" />
                  <text x="90" y="102" textAnchor="middle" fontSize="16" fontWeight="800" fill="#4b70a6">
                    {filteredServiceStats.reduce((sum, row) => sum + row.totalApps, 0)}
                  </text>
                </svg>

                <div className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
                  {filteredServiceStats.map((service, index) => {
                    const total = filteredServiceStats.reduce((sum, row) => sum + row.totalApps, 0);
                    const pct = total > 0 ? Math.round((service.totalApps / total) * 100) : 0;

                    return (
                      <div key={service.serviceId} className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="flex-1 truncate text-[10px] font-semibold text-slate-600">{service.serviceName}</span>
                        <span className="flex-shrink-0 text-[10px] font-bold text-slate-400">{pct}%</span>
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
