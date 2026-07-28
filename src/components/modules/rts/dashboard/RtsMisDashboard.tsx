"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  CornerDownRight,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  PieChart,
  Timer,
  X,
  XCircle,
} from "lucide-react";
import { Button, Card, Input, MasterTable } from "@/components/common";
import type { Column } from "@/components/common";
import { Select } from "@/components/common/select";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PageNumberButton,
  PrevPageButton,
} from "@/components/common/ActionButtons";
import type {
  RtsMisDashboardData,
  RtsMisDashboardModuleName,
} from "@/types/rts/rtsmisdashboard.types";

interface DashboardProps {
  misDashboardData: RtsMisDashboardData;
  getDepartmentServices: (
    departmentId: number,
    departmentName: string,
    moduleName: RtsMisDashboardModuleName
  ) => Promise<RtsMisDashboardData>;
}

interface DepartmentRow {
  srNo: number;
  id: string;
  name: string;
  slug: string;
  totalServices: number;
  totalApplications: number;
  fromRts: number;
  fromAapleSarkar: number;
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
  sla: number;
}

interface ServiceRow {
  srNo: number;
  id: string;
  name: string;
  totalApplications: number;
  fromRts: number;
  fromAapleSarkar: number;
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
  sla: number;
}

interface MisTableRow extends Record<string, unknown> {
  id: string;
  kind: "department" | "service" | "loading" | "error" | "empty";
  srNo: number | null;
  name: string;
  totalServices: number | null;
  totalApplications: number | null;
  fromRts: number | null;
  fromAapleSarkar: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  overdue: number | null;
  sla: number | null;
  department?: DepartmentRow;
  error?: string;
}

const DEPARTMENT_PAGE_SIZE = 15;
const PIE_COLORS = ["#0B5CD5", "#F39C12", "#27AE60", "#B22222", "#8A2BE2", "#008B8B", "#64748B"];
const DONUT_CIRCUMFERENCE = 2 * Math.PI * 42;

interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

type PaginationToken = number | "dots";
type PieChartView = "department" | "service";
type ApplicationSource = "rts" | "aapleSarkar" | "offline";

function getModuleName(applicationSource: ApplicationSource): RtsMisDashboardModuleName {
  if (applicationSource === "rts") return "RTS";
  if (applicationSource === "aapleSarkar") return "AapleSarkar";
  return "Offline";
}

function getPaginationTokens(currentPage: number, totalPages: number): PaginationToken[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

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
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <FirstPageButton disabled={currentPage === 1} onClick={() => onPageChange(1)} />
      <PrevPageButton disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} />
      {getPaginationTokens(currentPage, totalPages).map((token, index) =>
        token === "dots" ? (
          <span key={`dots-${index}`} className="px-2 text-slate-400">...</span>
        ) : (
          <PageNumberButton key={token} page={token} active={currentPage === token} onClick={() => onPageChange(token)} />
        )
      )}
      <NextPageButton disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} />
      <LastPageButton disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} />
    </div>
  );
}

function createIdentifier(value: string, fallback: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
}

function getDepartmentNameKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toAlphabeticalLabel(index: number) {
  let value = index;
  let label = "";

  do {
    label = String.fromCharCode(97 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return `${label}.`;
}

function buildPieData(
  rows: Array<{ label: string; value: number }>,
  otherLabel: string
): PieDataPoint[] {
  const sortedRows = rows
    .filter((row) => row.value > 0)
    .sort((first, second) => second.value - first.value);
  const topRows = sortedRows.slice(0, 6);
  const otherValue = sortedRows.slice(6).reduce((total, row) => total + row.value, 0);
  const visibleRows = otherValue > 0 ? [...topRows, { label: otherLabel, value: otherValue }] : topRows;

  return visibleRows.map((row, index) => ({
    ...row,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));
}

function DonutChart({
  data,
  total,
  totalLabel,
  noDataLabel,
  loading = false,
  loadingLabel,
  formatNumber,
}: {
  data: PieDataPoint[];
  total: number;
  totalLabel: string;
  noDataLabel: string;
  loading?: boolean;
  loadingLabel: string;
  formatNumber: (value: number) => string;
}) {
  if (loading) {
    return <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs font-bold text-slate-500">{loadingLabel}</div>;
  }

  if (total === 0) {
    return <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs font-bold text-slate-500">{noDataLabel}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <svg viewBox="0 0 180 180" className="h-40 w-40" role="img" aria-label={totalLabel}>
          <circle cx="90" cy="90" r="42" fill="none" stroke="#E2E8F0" strokeWidth="24" />
          {data.map((item, index) => {
            const length = (item.value / total) * DONUT_CIRCUMFERENCE;
            const offset = data.slice(0, index).reduce(
              (totalLength, previousItem) => totalLength + (previousItem.value / total) * DONUT_CIRCUMFERENCE,
              0
            );
            return <circle key={item.label} cx="90" cy="90" r="42" fill="none" stroke={item.color} strokeWidth="24" strokeDasharray={`${length} ${DONUT_CIRCUMFERENCE - length}`} strokeDashoffset={-offset} strokeLinecap="butt" transform="rotate(-90 90 90)" />;
          })}
          <text x="90" y="84" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">{totalLabel}</text>
          <text x="90" y="102" textAnchor="middle" className="fill-slate-900 text-[18px] font-extrabold">{formatNumber(total)}</text>
        </svg>
      </div>
      <div className="space-y-1.5">
        {data.map((item) => {
          const percentage = Math.round((item.value / total) * 100);
          return <div key={item.label} className="flex items-center gap-2 text-[11px] font-bold text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="shrink-0 text-slate-900">{formatNumber(item.value)} ({percentage}%)</span></div>;
        })}
      </div>
    </div>
  );
}

export default function RtsMisDashboard({ misDashboardData, getDepartmentServices }: DashboardProps) {
  const locale = useLocale();
  const t = useTranslations("rts");
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [departmentPage, setDepartmentPage] = useState(1);
  const [applicationSource, setApplicationSource] = useState<ApplicationSource>("rts");
  const [pieChartView, setPieChartView] = useState<PieChartView>("department");
  const [expandedDepartmentId, setExpandedDepartmentId] = useState<string | null>(null);
  const [sourceDashboardData, setSourceDashboardData] = useState<RtsMisDashboardData | null>(null);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [servicesByDepartment, setServicesByDepartment] = useState<Record<string, ServiceRow[]>>({});
  const [loadingDepartmentId, setLoadingDepartmentId] = useState<string | null>(null);
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});
  const activeServiceRequests = useRef(new Set<string>());
  const previousApplicationSource = useRef(applicationSource);

  const formatNumber = (value: number) => numberFormatter.format(value);
  const moduleName = getModuleName(applicationSource);
  const dashboardData = sourceDashboardData ?? misDashboardData;
  const initialDepartmentIdsByName = useMemo(() => new Map(
    (misDashboardData.departmentWiseData ?? [])
      .filter((department) => department.departmentId != null && department.departmentName?.trim())
      .map((department) => [
        getDepartmentNameKey(department.departmentName ?? ""),
        Number(department.departmentId),
      ])
  ), [misDashboardData.departmentWiseData]);

  const departments = useMemo<DepartmentRow[]>(() => (
    dashboardData.departmentWiseData ?? []
  ).map((department, index) => {
    const name = department.departmentName?.trim() || t("misDashboard.departmentFallback", { number: index + 1 });
    const departmentId = department.departmentId ?? initialDepartmentIdsByName.get(getDepartmentNameKey(name));
    const id = String(departmentId ?? `department-${createIdentifier(name, String(index + 1))}`);

    return {
      srNo: index + 1,
      id,
      name,
      slug: createIdentifier(name, `department-${index + 1}`),
      totalServices: Number(department.totalServices ?? 0),
      totalApplications: Number(department.totalApplications ?? 0),
      fromRts: Number(department.fromRTS ?? 0),
      fromAapleSarkar: Number(department.fromAapleSarkar ?? 0),
      pending: Number(department.pending ?? 0),
      approved: Number(department.approved ?? 0),
      rejected: Number(department.rejected ?? 0),
      overdue: Number(department.overdueCount ?? 0),
      sla: Number(department.sla ?? 0),
    };
  }), [dashboardData.departmentWiseData, initialDepartmentIdsByName, t]);

  const expandedDepartment = useMemo(
    () => departments.find((department) => department.id === expandedDepartmentId) ?? null,
    [departments, expandedDepartmentId]
  );
  const selectedDepartment = expandedDepartment ?? departments[0] ?? null;

  const filteredDepartments = departments;

  const totals = useMemo(() => departments.reduce(
    (current, department) => ({
      total: current.total + department.totalApplications,
      pending: current.pending + department.pending,
      approved: current.approved + department.approved,
      rejected: current.rejected + department.rejected,
      overdue: current.overdue + department.overdue,
    }),
    { total: 0, pending: 0, approved: 0, rejected: 0, overdue: 0 }
  ), [departments]);

  const departmentTotalPages = Math.max(1, Math.ceil(filteredDepartments.length / DEPARTMENT_PAGE_SIZE));
  const expandedDepartmentIndex = filteredDepartments.findIndex((department) => department.id === expandedDepartment?.id);
  const currentDepartmentPage = expandedDepartmentIndex >= 0
    ? Math.floor(expandedDepartmentIndex / DEPARTMENT_PAGE_SIZE) + 1
    : Math.min(departmentPage, departmentTotalPages);
  const paginatedDepartments = useMemo(() => {
    const start = (currentDepartmentPage - 1) * DEPARTMENT_PAGE_SIZE;
    return filteredDepartments.slice(start, start + DEPARTMENT_PAGE_SIZE);
  }, [currentDepartmentPage, filteredDepartments]);

  const fetchDepartmentServices = useCallback(async (department: DepartmentRow) => {
    if (servicesByDepartment[department.id] || activeServiceRequests.current.has(department.id)) return;

    const numericId = Number(department.id);
    if (!Number.isFinite(numericId)) {
      setServiceErrors((current) => ({ ...current, [department.id]: t("misDashboard.serviceLoadFailed") }));
      return;
    }

    activeServiceRequests.current.add(department.id);
    setLoadingDepartmentId(department.id);
    setServiceErrors((current) => {
      const { [department.id]: _removed, ...remaining } = current;
      return remaining;
    });

    try {
      const response = await getDepartmentServices(numericId, department.name, moduleName);
      const mappedServices = (response.serviceWiseData ?? []).map((service, index): ServiceRow => ({
        srNo: index + 1,
        id: `${department.id}-${createIdentifier(service.serviceName, String(index + 1))}`,
        name: service.serviceName,
        totalApplications: Number(service.totalApplications ?? 0),
        fromRts: Number(service.rtsApplications ?? 0),
        fromAapleSarkar: Number(service.aapleSarkarApplications ?? 0),
        pending: Number(service.pending ?? 0),
        approved: Number(service.approved ?? 0),
        rejected: Number(service.rejected ?? 0),
        overdue: Number(service.overdueCount ?? 0),
        sla: Number(service.sla ?? 0),
      }));
      setServicesByDepartment((current) => ({ ...current, [department.id]: mappedServices }));
    } catch {
      setServiceErrors((current) => ({ ...current, [department.id]: t("misDashboard.serviceLoadFailed") }));
    } finally {
      activeServiceRequests.current.delete(department.id);
      setLoadingDepartmentId((current) => current === department.id ? null : current);
    }
  }, [getDepartmentServices, moduleName, servicesByDepartment, t]);

  const fetchDepartmentServicesRef = useRef(fetchDepartmentServices);

  useEffect(() => {
    fetchDepartmentServicesRef.current = fetchDepartmentServices;
  }, [fetchDepartmentServices]);

  useEffect(() => {
    if (previousApplicationSource.current === applicationSource) return;
    previousApplicationSource.current = applicationSource;

    let cancelled = false;

    void getDepartmentServices(1, "Property Tax", moduleName)
      .then((data) => {
        if (!cancelled) setSourceDashboardData(data);
      })
      .catch(() => {
        if (!cancelled) setSourceDashboardData(null);
      })
      .finally(() => {
        if (!cancelled) setIsSourceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationSource, getDepartmentServices, moduleName]);

  useEffect(() => {
    if (!expandedDepartmentId) return;

    const requestTimer = window.setTimeout(() => {
      const department = departments.find((item) => item.id === expandedDepartmentId);
      if (department) void fetchDepartmentServicesRef.current(department);
    }, 0);

    return () => window.clearTimeout(requestTimer);
  }, [departments, expandedDepartmentId]);

  const toggleDepartment = (department: DepartmentRow) => {
    setExpandedDepartmentId((current) => current === department.id ? null : department.id);
  };

  const changeDepartmentPage = (page: number) => {
    setDepartmentPage(page);
    setExpandedDepartmentId(null);
  };

  const metrics = [
    { count: totals.total, label: t("misDashboard.totalApplications"), detail: t("misDashboard.allSubmitted"), icon: FileText, colors: "bg-blue-50 text-[#0B5CD5] ring-blue-100", detailColor: "text-[#0B5CD5]" },
    { count: totals.pending, label: t("misDashboard.pendingVerification"), detail: t("misDashboard.inProgress"), icon: Clock3, colors: "bg-amber-50 text-[#F39C12] ring-amber-100", detailColor: "text-[#C66922]" },
    { count: totals.approved, label: t("misDashboard.approvedApplications"), detail: t("misDashboard.completed"), icon: CheckCircle2, colors: "bg-emerald-50 text-[#27AE60] ring-emerald-100", detailColor: "text-[#0F7A3F]" },
    { count: totals.rejected, label: t("misDashboard.rejectedApplications"), detail: t("misDashboard.notApproved"), icon: XCircle, colors: "bg-rose-50 text-[#B22222] ring-rose-100", detailColor: "text-[#B22222]" },
    { count: totals.overdue, label: t("misDashboard.overdueApplications"), detail: t("misDashboard.requiresAttention"), icon: Timer, colors: "bg-violet-50 text-[#8A2BE2] ring-violet-100", detailColor: "text-[#551A8B]" },
  ];

  const approvalDistribution = selectedDepartment ? [
    { label: t("misDashboard.approved"), value: selectedDepartment.approved, color: "bg-[#27AE60]", text: "text-[#0F7A3F]" },
    { label: t("misDashboard.pending"), value: selectedDepartment.pending, color: "bg-[#F39C12]", text: "text-[#C66922]" },
    { label: t("misDashboard.rejected"), value: selectedDepartment.rejected, color: "bg-[#B22222]", text: "text-[#B22222]" },
  ] : [];

  const departmentPieData = useMemo(() => buildPieData(
    departments.map((department) => ({ label: department.name, value: department.totalApplications })),
    t("misDashboard.other")
  ), [departments, t]);
  const servicePieData = useMemo(() => {
    const rows = expandedDepartment
      ? (servicesByDepartment[expandedDepartment.id] ?? []).map((service) => ({
        label: service.name,
        value: service.totalApplications,
      }))
      : (dashboardData.serviceWiseData ?? []).map((service) => ({
        label: service.serviceName,
        value: Number(service.totalApplications ?? 0),
      }));

    return buildPieData(rows, t("misDashboard.other"));
  }, [dashboardData.serviceWiseData, expandedDepartment, servicesByDepartment, t]);
  const activePieData = pieChartView === "department" ? departmentPieData : servicePieData;
  const activePieTotal = activePieData.reduce((total, item) => total + item.value, 0);
  const isServicePieLoading = pieChartView === "service" && loadingDepartmentId === expandedDepartment?.id;

  const tableRows = useMemo<MisTableRow[]>(() => {
    return paginatedDepartments.flatMap((department) => {
      const rows: MisTableRow[] = [{
        id: department.id,
        kind: "department",
        srNo: department.srNo,
        name: department.name,
        totalServices: department.totalServices,
        totalApplications: department.totalApplications,
        fromRts: department.fromRts,
        fromAapleSarkar: department.fromAapleSarkar,
        pending: department.pending,
        approved: department.approved,
        rejected: department.rejected,
        overdue: department.overdue,
        sla: department.sla,
        department,
      }];

      if (expandedDepartment?.id !== department.id) return rows;

      const services = servicesByDepartment[department.id];
      const error = serviceErrors[department.id];
      if (loadingDepartmentId === department.id || (!services && !error)) {
        rows.push({ id: `${department.id}-loading`, kind: "loading", srNo: null, name: t("misDashboard.loadingServices"), totalServices: null, totalApplications: null, fromRts: null, fromAapleSarkar: null, pending: null, approved: null, rejected: null, overdue: null, sla: null });
      } else if (error) {
        rows.push({ id: `${department.id}-error`, kind: "error", srNo: null, name: "", totalServices: null, totalApplications: null, fromRts: null, fromAapleSarkar: null, pending: null, approved: null, rejected: null, overdue: null, sla: null, department, error });
      } else if (services.length === 0) {
        rows.push({ id: `${department.id}-empty`, kind: "empty", srNo: null, name: t("misDashboard.noServicesFound"), totalServices: null, totalApplications: null, fromRts: null, fromAapleSarkar: null, pending: null, approved: null, rejected: null, overdue: null, sla: null });
      } else {
        rows.push(...services.map((service) => ({
          id: service.id,
          kind: "service" as const,
          srNo: service.srNo,
          name: service.name,
          totalServices: null,
          totalApplications: service.totalApplications,
          fromRts: service.fromRts,
          fromAapleSarkar: service.fromAapleSarkar,
          pending: service.pending,
          approved: service.approved,
          rejected: service.rejected,
          overdue: service.overdue,
          sla: service.sla,
        })));
      }

      return rows;
    });
  }, [expandedDepartment, loadingDepartmentId, paginatedDepartments, serviceErrors, servicesByDepartment, t]);

  const tableColumns = useMemo<Column<MisTableRow>[]>(() => {
    const numberCell = (value: unknown) => value === null ? "" : numberFormatter.format(Number(value));
    const metricColumn = (key: keyof MisTableRow, label: string, width: string, cellClassName = ""): Column<MisTableRow> => ({
      key,
      label,
      width,
      align: "center",
      headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold",
      cellClassName: `text-center font-bold ${cellClassName}`,
      render: (value, row) => row.kind === "department" || row.kind === "service" ? numberCell(value) : "",
    });

    return [
      {
        key: "srNo", label: t("misDashboard.srNo"), width: "56px", align: "center", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "text-center font-extrabold", render: (value, row) => {
          if (row.kind === "department") return String(value ?? "");
          if (row.kind === "service") return toAlphabeticalLabel(Number(value) - 1);
          return "";
        }
      },
      {
        key: "name", label: "Departments and Services", width: "220px", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "font-bold text-slate-900", render: (_value, row) => {
          if (row.kind === "service") return <span className="flex items-start gap-2 break-words pl-2 text-left leading-5 text-slate-700"><CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" /><span>{row.name}</span></span>;
          if (row.kind === "loading" || row.kind === "empty") return <span className="block break-words pl-5 text-slate-500">{row.name}</span>;
          if (row.kind === "error" && row.department) return <div className="flex items-center gap-3 pl-5 text-rose-600"><span>{row.error}</span><Button type="button" size="sm" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => fetchDepartmentServices(row.department!)}>{t("misDashboard.retry")}</Button></div>;
          const isExpanded = expandedDepartment?.id === row.id;
          return (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-[#0B5CD5] shadow-sm">
                <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </span>
              <span className="min-w-0 flex-1 break-words leading-5">{row.name}</span>
              <span title={`${row.totalServices ?? 0} ${t("misDashboard.totalServices")}`} className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-extrabold text-[#0B5CD5]">{row.totalServices ?? 0}</span>
            </div>
          );
        }
      },
      // metricColumn("totalServices", t("misDashboard.totalServices")),
      metricColumn("totalApplications", t("misDashboard.totalApplications"), "120px", "font-extrabold"),
      // metricColumn("fromRts", t("misDashboard.fromRts"), "95px", "text-[#4B0082]"),
      // metricColumn("fromAapleSarkar", t("misDashboard.fromAapleSarkar"), "120px", "text-[#C66922]"),
      metricColumn("pending", t("misDashboard.pending"), "90px", "text-[#C66922]"),
      metricColumn("approved", t("misDashboard.approved"), "90px", "text-[#0F7A3F]"),
      metricColumn("rejected", t("misDashboard.rejected"), "90px", "text-[#B22222]"),
      metricColumn("overdue", t("misDashboard.overdueCount"), "105px", "text-rose-700"),
      { key: "sla", label: t("misDashboard.avgSla"), width: "95px", align: "center", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "text-center font-extrabold text-[#008B8B]", render: (value, row) => row.kind === "department" || row.kind === "service" ? t("misDashboard.daysValue", { value: Number(value).toFixed(1) }) : "" },
    ];
  }, [expandedDepartment, fetchDepartmentServices, numberFormatter, t]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"><LayoutDashboard className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{t("misDashboard.title")}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500">{t("misDashboard.from")}</span>
          <Input id="dashboard-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label={t("misDashboard.fromDate")} className="h-8 min-w-[132px] border-0 bg-transparent px-1 text-[12px] font-semibold shadow-none focus-visible:ring-0" />
          <span className="font-bold text-slate-300">|</span>
          <span className="text-[11px] font-bold text-slate-500">{t("misDashboard.to")}</span>
          <Input id="dashboard-date-to" type="date" min={dateFrom || undefined} value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label={t("misDashboard.toDate")} className="h-8 min-w-[132px] border-0 bg-transparent px-1 text-[12px] font-semibold shadow-none focus-visible:ring-0" />
          {(dateFrom || dateTo) && <Button type="button" onClick={() => { setDateFrom(""); setDateTo(""); }} aria-label={t("misDashboard.clearDates")} title={t("misDashboard.clearDatesTitle")} className="h-7 min-h-0 px-2 text-[10px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500"><X className="h-3.5 w-3.5" /></Button>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label} padding="none" className="flex min-h-[112px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ${metric.colors}`}><metric.icon className="h-6 w-6" strokeWidth={2.2} /></div>
            <div className="min-w-0"><div className="text-[10px] font-bold leading-tight text-slate-500">{metric.label}</div><div className="mt-1 text-2xl font-extrabold leading-none text-slate-800">{formatNumber(metric.count)}</div><div className={`mt-2 text-[11px] font-bold ${metric.detailColor}`}>{metric.detail}</div></div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card className="w-full overflow-hidden border border-slate-200 bg-white p-4 shadow-sm lg:w-[70%]">
          <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#0a3275]"><FileSpreadsheet className="h-5 w-5 text-[#0B5CD5]" />{t("misDashboard.departmentServiceBreakdown")}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-auto flex flex-row">
                <p className="text-[11px] font-bold text-slate-500">{t("misDashboard.applicationSource")}: </p>
                <Select
                  value={applicationSource}
                  options={[
                    { value: "rts", label: "RTS" },
                    { value: "aapleSarkar", label: "AapleSarkar" },
                    { value: "offline", label: "Offline" }
                  ]}
                  onChange={(_event, value) => {
                    const nextSource = value as ApplicationSource;
                    if (nextSource === applicationSource) return;
                    setDepartmentPage(1);
                    setServicesByDepartment({});
                    setServiceErrors({});
                    setLoadingDepartmentId(null);
                    setSourceDashboardData(null);
                    setIsSourceLoading(true);
                    setExpandedDepartmentId(null);
                    setApplicationSource(nextSource);
                  }}
                  ariaLabel={t("misDashboard.applicationSource")}
                  // label={}
                  selectSize="sm"
                />
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-[#0F7A3F]">{t("misDashboard.clickToVisualize")}</span>
            </div>
          </div>
          <MasterTable<MisTableRow>
            columns={tableColumns}
            data={tableRows}
            loading={isSourceLoading}
            getRowKey={(row) => row.id}
            emptyText={t("misDashboard.noData")}
            maxBodyHeightClassName="h-[645px] max-h-[645px]"
            tableClassName="table-fixed border-collapse text-left text-sm text-slate-900"
            containerClassName="gap-0"
            theadClassName="bg-[#0A3275]"
            rowClassName={(row) => {
              if (row.kind === "service") return "cursor-default bg-slate-50/90 hover:!bg-slate-100";
              if (row.kind === "loading" || row.kind === "empty") return "cursor-default bg-slate-50 text-slate-500";
              if (row.kind === "error") return "cursor-default bg-rose-50/60";
              return expandedDepartment?.id === row.id ? "bg-blue-50/70 hover:!bg-blue-100/70" : "bg-white";
            }}
            onRowClick={(row) => {
              if (row.kind === "department" && row.department) toggleDepartment(row.department);
            }}
            footerRightContent={<TablePagination currentPage={currentDepartmentPage} totalPages={departmentTotalPages} onPageChange={changeDepartmentPage} />}
            footerClassName="!border-t-0 !bg-white !px-0 !pb-0 !shadow-none"
          />
        </Card>

        <div className="w-full space-y-4 lg:w-[30%]">
          <Card className="flex h-[325px] flex-col gap-3 self-start border border-slate-200 bg-white p-4 shadow-sm">
            <div className="border-b border-slate-100 pb-1.5"><h3 className="flex items-center gap-1.5 text-base font-bold text-slate-800"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0B5CD5]" />{selectedDepartment?.name}</h3><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("misDashboard.interactiveVisualization")}</p></div>
            <div className="space-y-1"><span className="block text-[13px] font-bold text-[#0a3275]">{t("misDashboard.applicationStatusDistribution")}</span><div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2">{approvalDistribution.map((item) => { const percentage = selectedDepartment && selectedDepartment.totalApplications > 0 ? Math.round((item.value / selectedDepartment.totalApplications) * 100) : 0; return <div key={item.label} className="space-y-0.5"><div className="flex justify-between text-[11px] font-bold"><span className={item.text}>{item.label}</span><span className="text-slate-800">{t("misDashboard.countWithPercentage", { count: item.value, percentage })}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div style={{ width: `${percentage}%` }} className={`${item.color} h-full rounded-full`} /></div></div>; })}</div></div>
            <div className="space-y-1"><span className="block text-[13px] font-bold text-[#0a3275]">{t("misDashboard.slaTargetEfficiency")}</span><div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2"><div><div className="text-[12px] font-bold text-slate-600">{t("misDashboard.slaSpeedPerformance")}</div><div className="text-[11px] font-bold text-slate-400">{t("misDashboard.targetSla")}</div></div><div className="text-right"><div className="text-xl font-extrabold text-[#008B8B]">{formatNumber(selectedDepartment?.sla ?? 0)}</div><div className="text-[10px] font-bold text-slate-500">{t("misDashboard.days")}</div></div></div></div>
          </Card>
          <Card className="border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0a3275]"><PieChart className="h-4 w-4 text-[#0B5CD5]" />{t("misDashboard.applicationShare")}</h3>
              <div role="tablist" aria-label={t("misDashboard.applicationShare")} className="flex rounded-lg bg-slate-100 p-0.5">
                <button type="button" role="tab" aria-selected={pieChartView === "department"} onClick={() => setPieChartView("department")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${pieChartView === "department" ? "bg-white text-[#0B5CD5] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{t("misDashboard.department")}</button>
                <button type="button" role="tab" aria-selected={pieChartView === "service"} onClick={() => setPieChartView("service")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${pieChartView === "service" ? "bg-white text-[#0B5CD5] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{t("misDashboard.service")}</button>
              </div>
            </div>
            <DonutChart
              data={activePieData}
              total={activePieTotal}
              totalLabel={t("misDashboard.total")}
              noDataLabel={t("misDashboard.noData")}
              loading={isServicePieLoading}
              loadingLabel={t("misDashboard.loadingServices")}
              formatNumber={formatNumber}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
