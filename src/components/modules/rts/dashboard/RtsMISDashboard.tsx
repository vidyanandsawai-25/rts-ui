"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PageNumberButton,
  PrevPageButton,
} from "@/components/common/ActionButtons";
import { Select } from "@/components/common/select";
import type { CmsMisDashboardData } from "@/types/rts/rtsmisdashboard.types";

interface DashboardProps {
  misDashboardData: CmsMisDashboardData;
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

const DEPARTMENT_PAGE_SIZE = 6;
const SERVICE_PAGE_SIZE = 15;

type PaginationToken = number | "dots";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPaginationTokens(currentPage: number, totalPages: number): PaginationToken[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PaginationToken[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) tokens.push("dots");
  for (let page = start; page <= end; page += 1) tokens.push(page);
  if (end < totalPages - 1) tokens.push("dots");

  tokens.push(totalPages);
  return tokens;
}

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const tokens = buildPaginationTokens(currentPage, totalPages);

  return (
    <div className="flex items-center gap-2">
      <PrevPageButton
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      <div className="flex items-center gap-1">
        <FirstPageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        />

        {tokens.map((token, index) =>
          token === "dots" ? (
            <span key={`dots-${index}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <PageNumberButton
              key={token}
              page={token}
              active={currentPage === token}
              onClick={() => onPageChange(token)}
            />
          )
        )}

        <LastPageButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      </div>

      <NextPageButton
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
}

function createMisIdentifier(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}


export default function CmsDashboard({ misDashboardData }: DashboardProps) {
  const locale = useLocale();
  const t = useTranslations("rts");
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale]
  );
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedServiceDeptId, setSelectedServiceDeptId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [departmentPage, setDepartmentPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  const formatNumber = (value: unknown) =>
    numberFormatter.format(Number(value ?? 0));

  const departmentalStats = useMemo<DepartmentalStatsRow[]>(() => {
    return (misDashboardData.departmentWiseData ?? []).map((department, index) => {
      const deptName = department.departmentName?.trim() ||
        t("misDashboard.departmentFallback", { number: index + 1 });
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
        avgSla: t("misDashboard.daysValue", {
          value: avgSlaValue.toFixed(1),
        }),
      };
    });
  }, [misDashboardData.departmentWiseData, t]);

  const serviceStats = useMemo<ServiceStatsRow[]>(() => {
    return (misDashboardData.serviceWiseData ?? []).map((service, index) => {
      const apiDepartmentName = service.departmentName?.trim();
      const departmentId = service.departmentId != null
        ? String(service.departmentId)
        : apiDepartmentName
          ? `department-${createMisIdentifier(apiDepartmentName, String(index + 1))}`
          : "unmapped";
      const departmentName = apiDepartmentName || t("misDashboard.otherServices");
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
        avgSla: t("misDashboard.daysValue", {
          value: avgSlaValue.toFixed(1),
        }),
      };
    });
  }, [misDashboardData.serviceWiseData, t]);

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
        label: t("misDashboard.allDepartments"),
      },
      ...departmentalStats.map((department) => ({
        value: department.deptId,
        label: department.deptName,
      })),
    ],
    [departmentalStats, t]
  );

  const filteredServiceStats = useMemo(() => {
    if (selectedServiceDeptId === "all") return serviceStats;

    const departmentServices = serviceStats.filter(
      (service) => service.departmentId === selectedServiceDeptId
    );

    // Older MIS responses do not include service department metadata. In that
    // case, retain the complete API list instead of hiding all services.
    const visibleServices = departmentServices.length > 0 ? departmentServices : serviceStats;

    return visibleServices.map((service, index) => ({ ...service, srNo: index + 1 }));
  }, [selectedServiceDeptId, serviceStats]);

  const departmentTotalPages = Math.max(
    1,
    Math.ceil(departmentalStats.length / DEPARTMENT_PAGE_SIZE)
  );

  const serviceTotalPages = Math.max(
    1,
    Math.ceil(filteredServiceStats.length / SERVICE_PAGE_SIZE)
  );

  const paginatedDepartmentStats = useMemo(() => {
    const startIndex = (departmentPage - 1) * DEPARTMENT_PAGE_SIZE;
    return departmentalStats.slice(startIndex, startIndex + DEPARTMENT_PAGE_SIZE);
  }, [departmentPage, departmentalStats]);

  const paginatedServiceStats = useMemo(() => {
    const startIndex = (servicePage - 1) * SERVICE_PAGE_SIZE;
    return filteredServiceStats.slice(startIndex, startIndex + SERVICE_PAGE_SIZE);
  }, [filteredServiceStats, servicePage]);

  useEffect(() => {
    if (departmentPage > departmentTotalPages) {
      setDepartmentPage(departmentTotalPages);
    }
  }, [departmentPage, departmentTotalPages]);

  useEffect(() => {
    setServicePage(1);
  }, [selectedServiceDeptId]);

  useEffect(() => {
    if (servicePage > serviceTotalPages) {
      setServicePage(serviceTotalPages);
    }
  }, [servicePage, serviceTotalPages]);

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
      count: formatNumber(dashboardStats.total),
      label: t("misDashboard.totalApplications"),
      detail: t("misDashboard.allSubmitted"),
      icon: FileText,
      iconClassName: "bg-blue-50 text-[#0B5CD5] ring-blue-100",
      detailClassName: "text-[#0B5CD5]",
    },
    {
      count: formatNumber(dashboardStats.pending),
      label: t("misDashboard.pendingVerification"),
      detail: t("misDashboard.inProgress"),
      icon: Clock3,
      iconClassName: "bg-amber-50 text-[#F39C12] ring-amber-100",
      detailClassName: "text-[#C66922]",
    },
    {
      count: formatNumber(dashboardStats.approved),
      label: t("misDashboard.approvedApplications"),
      detail: t("misDashboard.completed"),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-50 text-[#27AE60] ring-emerald-100",
      detailClassName: "text-[#0F7A3F]",
    },
    {
      count: formatNumber(dashboardStats.rejected),
      label: t("misDashboard.rejectedApplications"),
      detail: t("misDashboard.notApproved"),
      icon: XCircle,
      iconClassName: "bg-rose-50 text-[#B22222] ring-rose-100",
      detailClassName: "text-[#B22222]",
    },
    {
      count: formatNumber(dashboardStats.slaViolations),
      label: t("misDashboard.overdueApplications"),
      detail: t("misDashboard.requiresAttention"),
      icon: Timer,
      iconClassName: "bg-violet-50 text-[#8A2BE2] ring-violet-100",
      detailClassName: "text-[#551A8B]",
    },
  ];

  const departmentColumns = useMemo<Column<DepartmentalStatsRow>[]>(() => [
    {
      key: "srNo",
      label: t("misDashboard.srNo"),
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
      label: t("misDashboard.department"),
      headerClassName: "border-r border-blue-300/60 text-left text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row) => <span className={`font-bold ${selectedDeptId === row.deptId ? "text-[#0B5CD5]" : "text-slate-900"}`}>{row.deptName}</span>,
    },
    { key: "totalServices", label: t("misDashboard.totalServices"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-slate-700">{String(value ?? 0)}</span> },
    { key: "totalApps", label: t("misDashboard.totalApplications"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100 bg-slate-50/30", render: (value) => <span className="font-extrabold text-slate-800">{String(value ?? 0)}</span> },
    { key: "rtsApps", label: t("misDashboard.fromRts"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#4B0082]">{String(value ?? 0)}</span> },
    { key: "asApps", label: t("misDashboard.fromAapleSarkar"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "pendingApps", label: t("misDashboard.pending"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "approvedApps", label: t("misDashboard.approved"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#0F7A3F]">{String(value ?? 0)}</span> },
    { key: "rejectedApps", label: t("misDashboard.rejected"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#B22222]">{String(value ?? 0)}</span> },
    { key: "overdueCount", label: t("misDashboard.overdueCount"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-rose-700">{String(value ?? 0)}</span> },
    { key: "avgSla", label: t("misDashboard.avgSla"), align: "center", headerClassName: "text-center text-white", render: (value) => <span className="font-extrabold text-[#008B8B]">{String(value ?? "-")}</span> },
  ], [t, selectedDeptId]);

  const serviceColumns = useMemo<Column<ServiceStatsRow>[]>(() => [
    { key: "srNo", label: t("misDashboard.srNo"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white w-14", cellClassName: "border-r border-slate-100 bg-slate-50/50", render: (value) => <span className="font-extrabold text-slate-900">{String(value ?? 0)}</span> },
    {
      key: "serviceName",
      label: t("misDashboard.serviceName"),
      headerClassName: "border-r border-blue-300/60 text-left text-white",
      cellClassName: "border-r border-slate-100",
      render: (_value, row, index) => (
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
          {row.serviceName}
        </div>
      ),
    },
    { key: "totalApps", label: t("misDashboard.totalApplications"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100 bg-slate-50/30", render: (value) => <span className="font-extrabold text-slate-800">{String(value ?? 0)}</span> },
    { key: "rtsApps", label: t("misDashboard.sourceRts"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#4B0082]">{String(value ?? 0)}</span> },
    { key: "asApps", label: t("misDashboard.sourceAapleSarkar"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "pendingApps", label: t("misDashboard.pending"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#C66922]">{String(value ?? 0)}</span> },
    { key: "approvedApps", label: t("misDashboard.approved"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#0F7A3F]">{String(value ?? 0)}</span> },
    { key: "rejectedApps", label: t("misDashboard.rejected"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-[#B22222]">{String(value ?? 0)}</span> },
    { key: "overdueCount", label: t("misDashboard.overdueCount"), align: "center", headerClassName: "border-r border-blue-300/60 text-center text-white", cellClassName: "border-r border-slate-100", render: (value) => <span className="font-bold text-rose-700">{String(value ?? 0)}</span> },
    { key: "avgSla", label: t("misDashboard.avgProcessingTime"), align: "center", headerClassName: "text-center text-white", render: (value) => <span className="font-extrabold text-[#008B8B]">{String(value ?? "-")}</span> },
  ], [t]);

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
            {t("misDashboard.title")}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
            <span className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {t("misDashboard.from")}
            </span>
            <Input
              id="dashboard-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              aria-label={t("misDashboard.fromDate")}
              className="h-8 min-w-[132px] cursor-pointer border-0 bg-transparent px-1 text-[12px] font-semibold text-slate-700 shadow-none focus-visible:ring-0"
            />
            <span className="font-bold text-slate-300">|</span>
            <span className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {t("misDashboard.to")}
            </span>
            <Input
              id="dashboard-date-to"
              type="date"
              min={dateFrom || undefined}
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              aria-label={t("misDashboard.toDate")}
              className="h-8 min-w-[132px] cursor-pointer border-0 bg-transparent px-1 text-[12px] font-semibold text-slate-700 shadow-none focus-visible:ring-0"
            />
            {(dateFrom || dateTo) && (
              <Button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                aria-label={t("misDashboard.clearDates")}
                title={t("misDashboard.clearDatesTitle")}
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
                {metric.label}
              </div>
              <div className="mt-1 text-2xl font-extrabold leading-none text-slate-800">{metric.count}</div>
              <div className={`mt-2 text-[11px] font-bold ${metric.detailClassName}`}>
                {metric.detail}
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
              {t("misDashboard.departmentalBreakdown")}
            </h2>
            <span className="animate-pulse rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-[#0F7A3F]">
              {t("misDashboard.clickToVisualize")}
            </span>
          </div>
          <MasterTable<DepartmentalStatsRow>
            columns={departmentColumns}
            data={paginatedDepartmentStats}
            pageSize={DEPARTMENT_PAGE_SIZE}
            emptyText={t("misDashboard.noData")}
            getRowKey={(row) => row.deptId}
            onRowClick={(row) => setSelectedDeptId(row.deptId)}
            rowClassName={(row) => (selectedDeptId === row.deptId ? "bg-blue-50" : "")}
            maxBodyHeightClassName="h-[315px] max-h-[315px]"
            theadClassName="bg-[#0A3275]"
            tableClassName="border-collapse text-left text-sm"
            containerClassName="gap-0"
            footerLeftContent={
              <span className="text-xs text-slate-500">
                {locale === "mr"
                  ? `${departmentalStats.length} पैकी ${
                      departmentalStats.length === 0
                        ? 0
                        : (departmentPage - 1) * DEPARTMENT_PAGE_SIZE + 1
                    } ते ${Math.min(
                      departmentPage * DEPARTMENT_PAGE_SIZE,
                      departmentalStats.length
                    )} नोंदी दाखवत आहे`
                  : `Showing ${
                      departmentalStats.length === 0
                        ? 0
                        : (departmentPage - 1) * DEPARTMENT_PAGE_SIZE + 1
                    } to ${Math.min(
                      departmentPage * DEPARTMENT_PAGE_SIZE,
                      departmentalStats.length
                    )} of ${departmentalStats.length} entries`}
              </span>
            }
            footerRightContent={
              <TablePagination
                currentPage={departmentPage}
                totalPages={departmentTotalPages}
                onPageChange={setDepartmentPage}
              />
            }
            footerClassName="!bg-white !shadow-none"
          />
        </Card>

        <Card className="flex h-[445px] flex-col gap-3 self-start border border-slate-200 bg-white p-4 shadow-sm lg:w-[30%]">
          <div className="border-b border-slate-100 pb-1.5">
            <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-800">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0B5CD5]" />
              {selectedDeptStats?.deptName}
            </h3>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t("misDashboard.interactiveVisualization")}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[13px] font-bold text-[#303031]">
              <span>{t("misDashboard.sourceShare")}</span>
              <span>
                {t("misDashboard.applicationsCount", {
                  count: selectedDeptStats?.totalApps ?? 0,
                })}
              </span>
            </div>
            {(selectedDeptStats?.totalApps ?? 0) === 0 ? (
              <div className="flex h-8 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-400">
                {t("misDashboard.noApplicationsRegistered")}
              </div>
            ) : (
              <div className="mb-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                <div className="flex h-5 w-full overflow-hidden rounded-lg bg-slate-100">
                  <div
                    style={{ width: `${selectedDeptStats?.rtsPct ?? 0}%` }}
                    className="flex h-full items-center justify-center bg-[#0B5CD5] text-[11px] font-extrabold text-white transition-all duration-500"
                    title={t("misDashboard.sourceTooltip", {
                      source: t("misDashboard.rts"),
                      count: selectedDeptStats?.rtsApps ?? 0,
                    })}
                  >
                    {(selectedDeptStats?.rtsPct ?? 0) > 20 && `${selectedDeptStats?.rtsPct}%`}
                  </div>
                  <div
                    style={{ width: `${selectedDeptStats?.asPct ?? 0}%` }}
                    className="flex h-full items-center justify-center bg-[#F39C12] text-[11px] font-extrabold text-white transition-all duration-500"
                    title={t("misDashboard.sourceTooltip", {
                      source: t("misDashboard.aapleSarkar"),
                      count: selectedDeptStats?.asApps ?? 0,
                    })}
                  >
                    {(selectedDeptStats?.asPct ?? 0) > 20 && `${selectedDeptStats?.asPct}%`}
                  </div>
                </div>
                <div className="flex items-center justify-between px-0.5 text-[11px] font-bold">
                  <div className="flex items-center gap-1 text-[#0B5CD5]"><span className="h-1.5 w-1.5 rounded-full bg-[#0B5CD5]" /><span>{t("misDashboard.sourceRtsLegend", { count: selectedDeptStats?.rtsApps ?? 0 })}</span></div>
                  <div className="flex items-center gap-1 text-[#C66922]"><span className="h-1.5 w-1.5 rounded-full bg-[#F39C12]" /><span>{t("misDashboard.sourceAapleSarkarLegend", { count: selectedDeptStats?.asApps ?? 0 })}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="block text-[13px] font-bold text-[#0a3275]">
              {t("misDashboard.applicationStatusDistribution")}
            </span>
            <div className="mb-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              {[
                { label: t("misDashboard.approved"), pct: selectedDeptStats?.approvedPct ?? 0, count: selectedDeptStats?.approvedApps ?? 0, color: "bg-[#27AE60]", text: "text-[#0F7A3F]" },
                { label: t("misDashboard.pending"), pct: selectedDeptStats?.pendingPct ?? 0, count: selectedDeptStats?.pendingApps ?? 0, color: "bg-[#F39C12]", text: "text-[#C66922]" },
                { label: t("misDashboard.rejected"), pct: selectedDeptStats?.rejectedPct ?? 0, count: selectedDeptStats?.rejectedApps ?? 0, color: "bg-[#B22222]", text: "text-[#B22222]" },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className={item.text}>{item.label}</span>
                    <span className="text-slate-700">
                      {t("misDashboard.countWithPercentage", {
                        count: item.count,
                        percentage: item.pct,
                      })}
                    </span>
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
              {t("misDashboard.slaTargetEfficiency")}
            </span>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm">
              <div className="space-y-0.5">
                <div className="text-[12px] font-bold text-slate-600">{t("misDashboard.slaSpeedPerformance")}</div>
                <div className="text-[11px] font-bold text-slate-400">{t("misDashboard.targetSla")}</div>
              </div>
              <div className="flex flex-col items-end mb-2 justify-center leading-tight">
                <span className="text-xl font-extrabold text-[#008B8B]">
                  {formatNumber(selectedDeptStats?.avgSlaVal ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {t("misDashboard.days")}
                </span>
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
              {t("misDashboard.serviceWiseBreakdown")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-[11px] font-bold text-slate-500">
              {t("misDashboard.filterByDept")}
            </label>
            <div className="min-w-[180px]">
              <Select
                options={serviceDeptOptions}
                value={selectedServiceDeptId}
                onChange={(_event, value) => setSelectedServiceDeptId(value)}
                placeholder={t("misDashboard.allDepartments")}
                selectSize="sm"
                ariaLabel={t("misDashboard.filterServicesByDepartment")}
                className="text-[12px] font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-evenly gap-4 lg:flex-row">
          <MasterTable<ServiceStatsRow>
            columns={serviceColumns}
            data={paginatedServiceStats}
            pageSize={SERVICE_PAGE_SIZE}
            emptyText={t("misDashboard.noServicesFound")}
            getRowKey={(row) => row.serviceId}
            // maxBodyHeightClassName="h-[660px] max-h-[660px]"
            theadClassName="bg-[#0A3275]"
            tableClassName="border-collapse text-left text-sm"
            containerClassName="gap-0"
            footerLeftContent={
              <span className="text-xs text-slate-500">
                {locale === "mr"
                  ? `${filteredServiceStats.length} पैकी ${
                      filteredServiceStats.length === 0
                        ? 0
                        : (servicePage - 1) * SERVICE_PAGE_SIZE + 1
                    } ते ${Math.min(
                      servicePage * SERVICE_PAGE_SIZE,
                      filteredServiceStats.length
                    )} नोंदी दाखवत आहे`
                  : `Showing ${
                      filteredServiceStats.length === 0
                        ? 0
                        : (servicePage - 1) * SERVICE_PAGE_SIZE + 1
                    } to ${Math.min(
                      servicePage * SERVICE_PAGE_SIZE,
                      filteredServiceStats.length
                    )} of ${filteredServiceStats.length} entries`}
              </span>
            }
            footerRightContent={
              <TablePagination
                currentPage={servicePage}
                totalPages={serviceTotalPages}
                onPageChange={setServicePage}
              />
            }
            footerClassName="!bg-white !shadow-none"
          />

          <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm lg:w-[30%]">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#0B5CD5]" />
              <span className="text-[13px] font-bold text-slate-700">
                {t("misDashboard.applicationsByService")}
              </span>
            </div>

            {filteredServiceStats.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm font-bold text-slate-400">
                {t("misDashboard.noDataShort")}
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
                      <title>
                        {t("misDashboard.servicePercentageTooltip", {
                          service: segment.name,
                          percentage: segment.pct,
                        })}
                      </title>
                    </path>
                  ))}
                  <circle cx="90" cy="90" r="38" fill="white" />
                  <text x="90" y="85" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                    {t("misDashboard.total")}
                  </text>
                  <text x="90" y="102" textAnchor="middle" fontSize="16" fontWeight="800" fill="#4b70a6">
                    {formatNumber(
                      filteredServiceStats.reduce(
                        (sum, row) => sum + row.totalApps,
                        0
                      )
                    )}
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