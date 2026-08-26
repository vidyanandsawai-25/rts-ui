"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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
    moduleName: RtsMisDashboardModuleName,
    fromDate?: string,
    toDate?: string
  ) => Promise<RtsMisDashboardData>;
  filters: {
    applicationSource: ApplicationSource;
    pageNumber: number;
    status: MisStatusFilter | "";
    fromDate: string;
    toDate: string;
  };
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

const DEPARTMENT_PAGE_SIZE = 10;
const PIE_COLORS = ["#0B5CD5", "#F39C12", "#27AE60", "#B22222", "#8A2BE2", "#008B8B", "#64748B"];
const DONUT_CIRCUMFERENCE = 2 * Math.PI * 42;

interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

type PaginationToken = number | "dots";
type ApplicationSource = "rts" | "aaple-sarkar" | "offline";
type MisStatusFilter = "Pending" | "Approved" | "Rejected" | "Overdue";
type MisSortKey = "srNo" | "name" | "totalApplications" | "pending" | "approved" | "rejected" | "overdue" | "sla";
type SortDirection = "asc" | "desc";

function getModuleName(applicationSource: ApplicationSource): RtsMisDashboardModuleName {
  if (applicationSource === "aaple-sarkar") return "AapleSarkar";
  if (applicationSource === "offline") return "Offline";
  return "RTS";
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
  const topRows = sortedRows.slice(0, 5);
  const otherValue = sortedRows.slice(5).reduce((total, row) => total + row.value, 0);
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
    return <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs font-bold text-slate-500">{loadingLabel}</div>;
  }

  if (total === 0) {
    return <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs font-bold text-slate-500">{noDataLabel}</div>;
  }

  return (
    <div className="space-y-2 w-full h-auto">
      <div className="flex justify-center">
        <svg viewBox="0 0 180 180" className="h-56 w-full" role="img" aria-label={totalLabel}>
          <circle cx="90" cy="90" r="42" fill="none" stroke="#E2E8F0" strokeWidth="28" />
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
      <div className="space-y-0.8">
        {data.map((item) => {
          const percentage = Math.round((item.value / total) * 100);
          return <div key={item.label} className="flex items-center gap-2 text-[11px] font-bold text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="shrink-0 text-slate-900">{formatNumber(item.value)} ({percentage}%)</span></div>;
        })}
      </div>
    </div>
  );
}

export default function RtsMisDashboard({ misDashboardData, getDepartmentServices, filters }: DashboardProps) {
  const locale = useLocale();
  const t = useTranslations("rts");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applicationSource, pageNumber, status, fromDate, toDate } = filters;
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [expandedDepartmentId, setExpandedDepartmentId] = useState<string | null>(null);
  const [servicesByDepartment, setServicesByDepartment] = useState<Record<string, ServiceRow[]>>({});
  const [loadingDepartmentId, setLoadingDepartmentId] = useState<string | null>(null);
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: MisSortKey; direction: SortDirection } | null>(null);
  const activeServiceRequests = useRef(new Set<string>());
  const previousDashboardFilterKey = useRef(`${applicationSource}:${status}:${fromDate}:${toDate}`);

  const formatNumber = (value: number) => numberFormatter.format(value);
  const moduleName = getModuleName(applicationSource);
  const dashboardData = misDashboardData;
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
  const compareMisRows = useCallback((first: Pick<DepartmentRow, MisSortKey>, second: Pick<DepartmentRow, MisSortKey>) => {
    if (!sort) return 0;

    let result: number;
    if (sort.key === "name") {
      result = new Intl.Collator(locale, { numeric: true, sensitivity: "base" }).compare(first.name, second.name);
    } else {
      result = Number(first[sort.key]) - Number(second[sort.key]);
    }

    return sort.direction === "asc" ? result : -result;
  }, [locale, sort]);

  const statusMetric = status === "Pending"
    ? "pending"
    : status === "Approved"
      ? "approved"
      : status === "Rejected"
        ? "rejected"
        : status === "Overdue"
          ? "overdue"
          : null;

  const filteredDepartments = useMemo(() => {
    const statusRows = statusMetric
      ? departments.filter((department) => department[statusMetric] > 0)
      : departments;
    return sort ? [...statusRows].sort(compareMisRows) : statusRows;
  }, [compareMisRows, departments, sort, statusMetric]);

  const toggleSort = useCallback((key: MisSortKey) => {
    setSort((current) => (
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    ));
  }, []);

  const sortableHeader = useCallback((key: MisSortKey, label: string) => {
    const isActive = sort?.key === key;
    const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        aria-label={label}
        aria-pressed={isActive}
        className="group inline-flex items-center gap-1 rounded px-0.5 py-0.5 text-inherit transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <span>{label}</span>
        <Icon aria-hidden className={`size-3 shrink-0 ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
      </button>
    );
  }, [sort, toggleSort]);

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
  const currentDepartmentPage = Math.min(pageNumber, departmentTotalPages);
  const paginatedDepartments = useMemo(() => {
    const start = (currentDepartmentPage - 1) * DEPARTMENT_PAGE_SIZE;
    return filteredDepartments.slice(start, start + DEPARTMENT_PAGE_SIZE);
  }, [currentDepartmentPage, filteredDepartments]);
  const departmentPageStart = filteredDepartments.length === 0
    ? 0
    : (currentDepartmentPage - 1) * DEPARTMENT_PAGE_SIZE + 1;
  const departmentPageEnd = Math.min(
    currentDepartmentPage * DEPARTMENT_PAGE_SIZE,
    filteredDepartments.length
  );

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
      const response = await getDepartmentServices(
        numericId,
        department.name,
        moduleName,
        fromDate,
        toDate
      );
      const services = (response.serviceWiseData ?? []).map((service, index): ServiceRow => ({
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
      setServicesByDepartment((current) => ({ ...current, [department.id]: services }));
    } catch {
      setServiceErrors((current) => ({ ...current, [department.id]: t("misDashboard.serviceLoadFailed") }));
    } finally {
      activeServiceRequests.current.delete(department.id);
      setLoadingDepartmentId((current) => current === department.id ? null : current);
    }
  }, [fromDate, getDepartmentServices, moduleName, servicesByDepartment, t, toDate]);

  useEffect(() => {
    if (!expandedDepartment) return;

    const requestTimer = window.setTimeout(() => {
      void fetchDepartmentServices(expandedDepartment);
    }, 0);

    return () => window.clearTimeout(requestTimer);
  }, [expandedDepartment, fetchDepartmentServices]);

  useEffect(() => {
    const filterKey = `${applicationSource}:${status}:${fromDate}:${toDate}`;
    if (previousDashboardFilterKey.current === filterKey) return;
    previousDashboardFilterKey.current = filterKey;
    activeServiceRequests.current.clear();
    setExpandedDepartmentId(null);
    setServicesByDepartment({});
    setLoadingDepartmentId(null);
    setServiceErrors({});
  }, [applicationSource, fromDate, status, toDate]);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("AppliSource") === "aapleSarkar") params.set("AppliSource", "aaple-sarkar");
    params.delete("Deparment");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const toggleDepartment = (department: DepartmentRow) => {
    setExpandedDepartmentId((current) => current === department.id ? null : department.id);
  };

  const changeDepartmentPage = (page: number) => {
    setExpandedDepartmentId(null);
    updateUrl({ PageNumber: String(page) });
  };

  const changeFromDate = (value: string) => {
    const nextToDate = value && toDate && toDate < value ? "" : toDate;
    updateUrl({
      FromDate: value || null,
      ToDate: nextToDate || null,
      PageNumber: "1",
    });
  };

  const changeToDate = (value: string) => {
    if (value && fromDate && value < fromDate) return;
    updateUrl({ ToDate: value || null, PageNumber: "1" });
  };

  const clearDates = () => {
    updateUrl({ FromDate: null, ToDate: null, PageNumber: "1" });
  };

  const changeStatusFilter = (nextStatus: MisStatusFilter | null) => {
    updateUrl({ Status: nextStatus, PageNumber: "1" });
  };

  const metrics = [
    { count: totals.total, label: t("misDashboard.totalApplications"), detail: t("misDashboard.allSubmitted"), icon: FileText, colors: "bg-blue-50 text-[#0B5CD5] ring-blue-100", detailColor: "text-[#0B5CD5]", statusFilter: null },
    { count: totals.pending, label: t("misDashboard.pendingVerification"), detail: t("misDashboard.inProgress"), icon: Clock3, colors: "bg-amber-50 text-[#F39C12] ring-amber-100", detailColor: "text-[#C66922]", statusFilter: "Pending" },
    { count: totals.approved, label: t("misDashboard.approvedApplications"), detail: t("misDashboard.completed"), icon: CheckCircle2, colors: "bg-emerald-50 text-[#27AE60] ring-emerald-100", detailColor: "text-[#0F7A3F]", statusFilter: "Approved" },
    { count: totals.rejected, label: t("misDashboard.rejectedApplications"), detail: t("misDashboard.notApproved"), icon: XCircle, colors: "bg-rose-50 text-[#B22222] ring-rose-100", detailColor: "text-[#B22222]", statusFilter: "Rejected" },
    { count: totals.overdue, label: t("misDashboard.overdueApplications"), detail: t("misDashboard.requiresAttention"), icon: Timer, colors: "bg-violet-50 text-[#8A2BE2] ring-violet-100", detailColor: "text-[#551A8B]", statusFilter: "Overdue" },
  ];

  const visualizationSummary = expandedDepartment
    ? {
      totalApplications: expandedDepartment.totalApplications,
      approved: expandedDepartment.approved,
      pending: expandedDepartment.pending,
      rejected: expandedDepartment.rejected,
    }
    : {
      totalApplications: totals.total,
      approved: totals.approved,
      pending: totals.pending,
      rejected: totals.rejected,
    };
  const approvalDistribution = [
    { label: t("misDashboard.approved"), value: visualizationSummary.approved, color: "bg-[#27AE60]", text: "text-[#0F7A3F]" },
    { label: t("misDashboard.pending"), value: visualizationSummary.pending, color: "bg-[#F39C12]", text: "text-[#C66922]" },
    { label: t("misDashboard.rejected"), value: visualizationSummary.rejected, color: "bg-[#B22222]", text: "text-[#B22222]" },
  ];

  const departmentPieData = useMemo(() => buildPieData(
    departments.map((department) => ({ label: department.name, value: department.totalApplications })),
    t("misDashboard.other")
  ), [departments, t]);
  const servicePieData = useMemo(() => buildPieData(
    expandedDepartment
      ? (servicesByDepartment[expandedDepartment.id] ?? []).map((service) => ({
        label: service.name,
        value: service.totalApplications,
      }))
      : [],
    t("misDashboard.other")
  ), [expandedDepartment, servicesByDepartment, t]);
  const activePieData = expandedDepartment ? servicePieData : departmentPieData;
  const activePieTotal = activePieData.reduce((total, item) => total + item.value, 0);
  const isServicePieLoading = Boolean(expandedDepartment && loadingDepartmentId === expandedDepartment.id);

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
      } else {
        const statusServices = statusMetric
          ? services.filter((service) => service[statusMetric] > 0)
          : services;

        if (statusServices.length === 0) {
          rows.push({ id: `${department.id}-empty`, kind: "empty", srNo: null, name: t("misDashboard.noServicesFound"), totalServices: null, totalApplications: null, fromRts: null, fromAapleSarkar: null, pending: null, approved: null, rejected: null, overdue: null, sla: null });
        } else {
          const sortedServices = sort
            ? [...statusServices].sort(compareMisRows)
            : statusServices;
          rows.push(...sortedServices.map((service) => ({
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
      }

      return rows;
    });
  }, [compareMisRows, expandedDepartment, loadingDepartmentId, paginatedDepartments, serviceErrors, servicesByDepartment, sort, statusMetric, t]);

  const tableColumns = useMemo<Column<MisTableRow>[]>(() => {
    const numberCell = (value: unknown) => value === null ? "" : numberFormatter.format(Number(value));
    const metricColumn = (key: Exclude<MisSortKey, "srNo" | "name">, label: string, width: string, cellClassName = ""): Column<MisTableRow> => ({
      key,
      label: sortableHeader(key, label),
      width,
      align: "center",
      headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold",
      cellClassName: `text-center font-bold ${cellClassName}`,
      render: (value, row) => row.kind === "department" || row.kind === "service" ? numberCell(value) : "",
    });

    return [
      {
        key: "srNo", label: sortableHeader("srNo", t("misDashboard.srNo")), width: "56px", align: "center", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "text-center font-extrabold", render: (value, row) => {
          if (row.kind === "department") return String(value ?? "");
          if (row.kind === "service") return toAlphabeticalLabel(Number(value) - 1);
          return "";
        }
      },
      {
        key: "name", label: sortableHeader("name", "Departments and Services"), width: "220px", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "font-bold text-slate-900", render: (_value, row) => {
          if (row.kind === "service") return <span className="flex items-start gap-2 break-words pl-2 text-left leading-5 text-slate-700"><CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" /><span>{row.name}</span></span>;
          if (row.kind === "loading" || row.kind === "empty") return <span className="block break-words pl-5 text-slate-500">{row.name}</span>;
          if (row.kind === "error" && row.department) return <div className="flex items-center gap-3 pl-5 text-rose-600"><span>{row.error}</span><Button type="button" size="sm" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => fetchDepartmentServices(row.department!)}>{t("misDashboard.retry")}</Button></div>;
          const isExpanded = expandedDepartment?.id === row.id;
          return (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-[#0B5CD5] shadow-sm">
                <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </span>
              <span className="min-w-0 break-words leading-5">{row.name}</span>
              <span title={`${row.totalServices ?? 0} ${t("misDashboard.totalServices")}`} className="inline-flex h-5 min-w-5 ml-3 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-extrabold text-[#0B5CD5]">{row.totalServices ?? 0}</span>
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
      { key: "sla", label: sortableHeader("sla", t("misDashboard.avgSla")), width: "95px", align: "center", headerClassName: "bg-[#0A3275] text-white text-[11px] font-bold", cellClassName: "text-center font-extrabold text-[#008B8B]", render: (value, row) => row.kind === "department" || row.kind === "service" ? t("misDashboard.daysValue", { value: Number(value).toFixed(1) }) : "" },
    ];
  }, [expandedDepartment, fetchDepartmentServices, numberFormatter, sortableHeader, t]);

  return (
    <div className="space-y-3">
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"><LayoutDashboard className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{t("misDashboard.title")}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500">{t("misDashboard.from")}</span>
          <Input id="dashboard-date-from" type="date" value={fromDate} onChange={(event) => changeFromDate(event.target.value)} aria-label={t("misDashboard.fromDate")} className="h-8 min-w-[132px] border-0 bg-transparent px-1 text-[12px] font-semibold shadow-none focus-visible:ring-0" />
          <span className="font-bold text-slate-300">|</span>
          <span className="text-[11px] font-bold text-slate-500">{t("misDashboard.to")}</span>
          <Input id="dashboard-date-to" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => changeToDate(event.target.value)} aria-label={t("misDashboard.toDate")} className="h-8 min-w-[132px] border-0 bg-transparent px-1 text-[12px] font-semibold shadow-none focus-visible:ring-0" />
          {(fromDate || toDate) && <Button type="button" size="sm" onClick={clearDates} aria-label={t("misDashboard.clearDates")} title={t("misDashboard.clearDatesTitle")} className="h-5 min-h-0 px-1 text-[10px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500"><X className="size-3.5" /></Button>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => {
          const isActive = metric.statusFilter === status;
          return (
            <Card key={metric.label} padding="none" className={`rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}>
              <button
                type="button"
                onClick={() => changeStatusFilter(
                  isActive ? null : metric.statusFilter as MisStatusFilter | null
                )}
                aria-pressed={isActive}
                className="flex min-h-[112px] w-full items-center gap-3 px-4 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ${metric.colors}`}><metric.icon className="h-6 w-6" strokeWidth={2.2} /></div>
                <div className="min-w-0"><div className="text-[10px] font-bold leading-tight text-slate-500">{metric.label}</div><div className="mt-1 text-2xl font-extrabold leading-none text-slate-800">{formatNumber(metric.count)}</div><div className={`mt-2 text-[11px] font-bold ${metric.detailColor}`}>{metric.detail}</div></div>
              </button>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
        <Card className="w-full overflow-hidden border border-slate-200 bg-white p-4 shadow-sm lg:w-[80%]">
          <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#0a3275]"><FileSpreadsheet className="h-5 w-5 text-[#0B5CD5]" />{t("misDashboard.departmentServiceBreakdown")}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-auto flex flex-row items-center">
                <p className="text-[11px] w-auto text-right font-bold text-slate-500">{t("misDashboard.applicationSource")}: </p>
                <Select
                  className="ml-1 w-[150px]"
                  value={applicationSource}
                  options={[
                    { value: "rts", label: "RTS" },
                    { value: "aaple-sarkar", label: "Aaple Sarkar" },
                    { value: "offline", label: "Offline" }
                  ]}
                  onChange={(_event, value) => {
                    const nextSource = value as ApplicationSource;
                    if (nextSource === applicationSource) return;
                    updateUrl({ AppliSource: nextSource, PageNumber: "1" });
                  }}
                  ariaLabel={t("misDashboard.applicationSource")}
                  selectSize="sm"
                />
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-[#0F7A3F]">{t("misDashboard.clickToVisualize")}</span>
            </div>
          </div>
          <MasterTable<MisTableRow>
            columns={tableColumns}
            data={tableRows}
            getRowKey={(row) => row.id}
            emptyText={t("misDashboard.noData")}
            maxBodyHeightClassName="h-[502px]"
            tableClassName="table-fixed border-collapse text-left text-sm text-slate-900"
            containerClassName="gap-0"
            theadClassName="bg-[#0A3275]"
            rowClassName={(row) => {
              const minimumRowHeight = "h-[46px]";
              if (row.kind === "service") return `${minimumRowHeight} cursor-default bg-slate-50/90 hover:!bg-slate-100`;
              if (row.kind === "loading" || row.kind === "empty") return `${minimumRowHeight} cursor-default bg-slate-50 text-slate-500`;
              if (row.kind === "error") return `${minimumRowHeight} cursor-default bg-rose-50/60`;
              return expandedDepartment?.id === row.id
                ? `${minimumRowHeight} bg-blue-50/70 hover:!bg-blue-100/70`
                : `${minimumRowHeight} bg-white`;
            }}
            onRowClick={(row) => {
              if (row.kind === "department" && row.department) toggleDepartment(row.department);
            }}

            paginationConfig={{
              enabled: true,
              showPageSizeSelector: false
            }}
            footerLeftContent={
              <span className="whitespace-nowrap my-1.5">
                {tCommon("table.showingEntries", {
                  start: departmentPageStart,
                  end: departmentPageEnd,
                  total: filteredDepartments.length,
                })}
              </span>
            }
            footerRightContent={<TablePagination currentPage={currentDepartmentPage} totalPages={departmentTotalPages} onPageChange={changeDepartmentPage} />}
            footerClassName="!border-t-0 !bg-white !shadow-none"
          />
        </Card>

        <div className="w-full space-y-2 lg:w-[20%]">
          <Card className="flex h-[238px] flex-col justify-between gap-2 self-start border border-slate-200 bg-white p-3 shadow-sm">

            {/* Main header */}
            <div className="flex items-start justify-between gap-2">

              {/* Department */}
              <div className="min-w-0 pt-1">
                <h3 className="flex items-center gap-0.5 text-base font-bold text-slate-800">
                  {/* <span className="size-2.5 shrink-0 rounded-full bg-[#0B5CD5]" /> */}

                  <span>
                    {expandedDepartment?.name ?? t("misDashboard.allDepartments")}
                  </span>
                </h3>

                <p className=" text-[10px] font-bold uppercase truncate leading-4 tracking-wider text-slate-400">
                  {t("misDashboard.interactiveVisualization")}
                </p>
              </div>

              {expandedDepartment && (
                <div className="w-[108px] rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-2 py-2 shadow-sm">
                  <p className="text-center text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    {t("misDashboard.slaTargetEfficiency")}
                  </p>

                  <div className="mt-1 flex items-center justify-center gap-y-1 gap-x-1">
                    <span className="text-[16px] font-extrabold leading-none text-[#008B8B]">
                      {formatNumber(expandedDepartment.sla)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {t("misDashboard.days")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Application status */}
            <div className="space-y-0.5 border-t border-slate-100 pt-2">
              <span className="block text-[13px] font-bold text-[#0a3275]">
                {t("misDashboard.applicationStatusDistribution")}
              </span>

              <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-1.5">
                {approvalDistribution.map((item) => {
                  const percentage =
                    visualizationSummary.totalApplications > 0
                      ? Math.round(
                        (item.value / visualizationSummary.totalApplications) * 100
                      )
                      : 0;

                  return (
                    <div key={item.label} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={item.text}>
                          {item.label}
                        </span>

                        <span className="text-slate-800">
                          {t("misDashboard.countWithPercentage", {
                            count: item.value,
                            percentage,
                          })}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`${item.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          <Card className="h-[400px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0a3275] truncate"><PieChart className="h-4 w-4 text-[#0B5CD5]" />{t("misDashboard.applicationShare")}</h3>
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
