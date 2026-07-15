"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Search, Sparkles } from "lucide-react";

import { Card, Input } from "@/components/common";
import { Button } from "@/components/common/ActionButton";
import { Badge } from "@/components/common/Badge";
import { MasterTable, type Column } from "@/components/common/MasterTable";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/select";
import type { CmsApplication } from "@/lib/mock/rts/cms";

interface CmsInboxProps {
  data: CmsApplication[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
  locale: string;
  filters: {
    q: string;
    status: string;
    deptId: string;
    serviceId: string;
    priority: string;
    officerId: string;
  };
}

interface ComputedInboxRow extends Omit<CmsApplication, "source"> {
  category: string;
  categoryMr: string;
  documentStatus: string;
  documentStatusMr: string;
  scrutinyStage: string;
  lastDate: string;
  source: "RTS" | "Aaple Sarkar";
  assignedOfficer: string;
}

interface InboxTableRow extends Record<string, unknown> {
  id: string;
  applicationNo: string;
  source: string;
  citizenName: string;
  serviceName: string;
  departmentName: string;
  submissionDate: string;
  lastDate: string;
  remainingDays: number;
  status: string;
}

const TEXT = {
  en: {
    title: "Application queue",
    subtitle: "All incoming applications from RTS portal",
    showFilters: "Show More Filters",
    hideFilters: "Hide More Filters",
    export: "Export",
    totalApplications: "Total applications",
    officeApplications: "Applications received in office",
    onlineApplications: "Applications received online",
    pendingApplications: "Pending applications",
    rejectedApplications: "Applications rejected",
    approvedApplications: "Approved Application",
    clerkCorrection: "Clerk Correction Pending",
    asstSuperintendent: "Assistant Superintendent Pending",
    superintendent: "Superintendent of Tax Pending",
    search: "Search",
    searchPlaceholder: "Search by ID, name...",
    department: "Department",
    service: "Service",
    status: "Status",
    source: "Source",
    documents: "Documents",
    fromDate: "From Date",
    toDate: "To Date",
    clearFilters: "Clear Filters",
    loading: "Updating application queue...",
    empty: "No applications found",
    emptyHint: "Try adjusting your search keywords or active filters.",
    allDepartments: "All departments",
    allServices: "All services",
    allStatuses: "All statuses",
    allSources: "All Sources",
    allDocumentStatuses: "All document statuses",
    pendingAllocation: "Pending Allocation",
    verificationInProgress: "Verification In-Progress",
    approved: "Approved",
    rejected: "Rejected",
    allVerified: "All Verified",
    pendingCorrection: "Pending Correction",
    inReview: "In Review",
    appId: "App ID",
    citizen: "Citizen",
    appDate: "App Date",
    lastDate: "Last Date",
    remainingDays: "Remaining Days",
    actions: "Actions",
    daysLeft: "Days Left",
    viewDetails: "View Details",
    view: "View",
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} applications`,
    selected: (count: number) => `${count} selected`,
    bulkEscalate: "Bulk escalate",
    bulkAssign: "Bulk assign",
    previous: "Previous",
    next: "Next",
  },
  mr: {
    title: "अर्ज रांग",
    subtitle: "आरटीएस पोर्टलवरून आलेले सर्व अर्ज",
    showFilters: "अधिक फिल्टर्स दाखवा",
    hideFilters: "अधिक फिल्टर्स लपवा",
    export: "निर्यात करा",
    totalApplications: "एकूण अर्ज",
    officeApplications: "कार्यालयात प्राप्त झालेले अर्ज",
    onlineApplications: "ऑनलाइन प्राप्त झालेले अर्ज",
    pendingApplications: "प्रलंबित अर्ज",
    rejectedApplications: "नाकारलेले अर्ज",
    approvedApplications: "मंजूर अर्ज",
    clerkCorrection: "लिपिक दुरुस्ती प्रलंबित",
    asstSuperintendent: "सहाय्यक अधीक्षक प्रलंबित",
    superintendent: "कर अधीक्षक प्रलंबित",
    search: "शोधा",
    searchPlaceholder: "आयडी, नावाने शोधा...",
    department: "विभाग",
    service: "सेवा",
    status: "स्थिती",
    source: "स्रोत",
    documents: "दस्तऐवज",
    fromDate: "या तारखेपासून",
    toDate: "या तारखेपर्यंत",
    clearFilters: "फिल्टर्स साफ करा",
    loading: "अर्ज रांग अद्ययावत करत आहे...",
    empty: "कोणतेही अर्ज आढळले नाहीत",
    emptyHint: "शोध शब्द किंवा सक्रिय फिल्टर्स बदलून पाहा.",
    allDepartments: "सर्व विभाग",
    allServices: "सर्व सेवा",
    allStatuses: "सर्व स्थिती",
    allSources: "सर्व स्रोत",
    allDocumentStatuses: "सर्व दस्तऐवज स्थिती",
    pendingAllocation: "पडताळणी प्रलंबित",
    verificationInProgress: "पडताळणी सुरू",
    approved: "मंजूर",
    rejected: "नाकारलेले",
    allVerified: "सर्व पडताळणीकृत",
    pendingCorrection: "त्रुटी दुरुस्ती प्रलंबित",
    inReview: "पुनरावलोकनात",
    appId: "अर्जाचा आयडी",
    citizen: "नागरिक",
    appDate: "अर्ज दिनांक",
    lastDate: "अंतिम तारीख",
    remainingDays: "उर्वरित दिवस",
    actions: "कृती",
    daysLeft: "दिवस बाकी",
    viewDetails: "तपशील पहा",
    view: "पहा",
    showing: (shown: number, total: number) => `${total} पैकी ${shown} अर्ज दाखवत आहे`,
    selected: (count: number) => `${count} निवडले`,
    bulkEscalate: "सामूहिक एस्कलेट",
    bulkAssign: "सामूहिक नियुक्ती",
    previous: "मागील",
    next: "पुढील",
  },
} as const;

export default function CmsInbox({
  data,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  masters,
  locale,
  filters,
}: CmsInboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const lang = locale === "mr" ? "mr" : "en";
  const t = TEXT[lang];

  const [localSearch, setLocalSearch] = useState(filters.q);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const updateQueryParam = useCallback((key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set("page", "1");

    startTransition(() => {
      router.push(`/${locale}/rts-cms/inbox?${nextParams.toString()}`);
    });
  }, [locale, router, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.q) {
        updateQueryParam("q", localSearch);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [filters.q, localSearch, updateQueryParam]);

  const handleClearFilters = () => {
    setLocalSearch("");
    setSelectedIds([]);
    setFromDate("");
    setToDate("");
    startTransition(() => {
      router.push(`/${locale}/rts-cms/inbox`);
    });
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    startTransition(() => {
      router.push(`/${locale}/rts-cms/inbox?${nextParams.toString()}`);
    });
  };

  const filteredServicesList = masters.services.filter(
    (service) => filters.deptId === "All" || service.departmentId === filters.deptId
  );

  const computedData = useMemo<ComputedInboxRow[]>(
    () =>
      data.map((row) => {
        const appNum = parseInt(row.id, 10) || 1000;
        const category =
          appNum % 3 === 0 ? "Residential" : appNum % 3 === 1 ? "Commercial" : "Industrial";
        const categoryMr =
          appNum % 3 === 0 ? "निवासी" : appNum % 3 === 1 ? "व्यावसायिक" : "औद्योगिक";
        const documentStatus =
          appNum % 4 === 0 ? "Pending Correction" : appNum % 4 === 1 ? "In Review" : "All Verified";
        const documentStatusMr =
          appNum % 4 === 0 ? "त्रुटी दुरुस्ती प्रलंबित" : appNum % 4 === 1 ? "पुनरावलोकनात" : "सर्व पडताळणीकृत";

        let scrutinyStage = "Clerk Scrutiny";
        if (row.status === "Approved") scrutinyStage = "Final Approval Sign-off";
        else if (row.status === "Rejected") scrutinyStage = "Returned/Rejected";
        else if (row.status === "Verification In-Progress") scrutinyStage = "Field Inspection Phase";
        else if (row.status === "Pending Allocation") scrutinyStage = "Document Verification";

        const subDate = new Date(row.submissionDate);
        subDate.setDate(subDate.getDate() + row.slaDays);

        return {
          ...row,
          category,
          categoryMr,
          documentStatus,
          documentStatusMr,
          scrutinyStage,
          lastDate: subDate.toISOString().split("T")[0],
          source: row.source || (appNum % 2 === 0 ? "RTS" : "Aaple Sarkar"),
          assignedOfficer: row.assignedOfficerName || "Unassigned",
        };
      }),
    [data]
  );

  const stats = useMemo(() => {
    const total = computedData.length;
    const online = computedData.filter((app) => (parseInt(app.id, 10) || 0) % 3 === 0).length;
    const office = total - online;
    const pending = computedData.filter(
      (app) => app.status !== "Approved" && app.status !== "Rejected"
    ).length;
    const rejected = computedData.filter((app) => app.status === "Rejected").length;
    const approved = computedData.filter((app) => app.status === "Approved").length;
    const clerkCorrection = computedData.filter(
      (app) => app.documentStatus === "Pending Correction"
    ).length;
    const asstSuperintendent = computedData.filter(
      (app) => app.assignedOfficerId === "emp-103"
    ).length;
    const superintendent = computedData.filter(
      (app) => app.assignedOfficerId === "emp-104"
    ).length;

    return {
      total,
      office,
      online,
      pending,
      rejected,
      approved,
      clerkCorrection,
      asstSuperintendent,
      superintendent,
    };
  }, [computedData]);

  const filteredData = useMemo<InboxTableRow[]>(() => {
    return computedData
      .filter((row) => {
        const source = parseInt(row.id, 10) % 2 === 0 ? "RTS" : "Aaple Sarkar";
        const sourceMatch =
          filters.priority === "All" || source.toLowerCase() === filters.priority.toLowerCase();
        const documentMatch =
          filters.officerId === "All" ||
          row.documentStatus.toLowerCase() === filters.officerId.toLowerCase();
        const dateMatch = (!fromDate || row.submissionDate >= fromDate) && (!toDate || row.submissionDate <= toDate);

        return sourceMatch && documentMatch && dateMatch;
      })
      .map((row) => ({
        id: row.id,
        applicationNo: row.applicationNo,
        source: row.source,
        citizenName: row.citizenName,
        serviceName: row.serviceName,
        departmentName: row.departmentName,
        submissionDate: row.submissionDate,
        lastDate: row.lastDate,
        remainingDays: row.remainingDays,
        status: row.status,
      }));
  }, [computedData, filters.officerId, filters.priority, fromDate, toDate]);

  const departmentOptions = useMemo(
    () => [
      { value: "All", label: t.allDepartments },
      ...masters.departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    ],
    [masters.departments, t.allDepartments]
  );

  const serviceOptions = useMemo(
    () => [
      { value: "All", label: t.allServices },
      ...filteredServicesList.map((service) => ({
        value: service.id,
        label: service.name,
      })),
    ],
    [filteredServicesList, t.allServices]
  );

  const statusOptions = useMemo(
    () => [
      { value: "All", label: t.allStatuses },
      { value: "Pending Allocation", label: t.pendingAllocation },
      { value: "Verification In-Progress", label: t.verificationInProgress },
      { value: "Approved", label: t.approved },
      { value: "Rejected", label: t.rejected },
    ],
    [t]
  );

  const sourceOptions = useMemo(
    () => [
      { value: "All", label: t.allSources },
      { value: "RTS", label: "RTS" },
      { value: "Aaple Sarkar", label: "Aaple Sarkar" },
    ],
    [t.allSources]
  );

  const documentStatusOptions = useMemo(
    () => [
      { value: "All", label: t.allDocumentStatuses },
      { value: "All Verified", label: t.allVerified },
      { value: "Pending Correction", label: t.pendingCorrection },
      { value: "In Review", label: t.inReview },
    ],
    [t]
  );

  const allRowsSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  const getStatusBadgeClass = (status: string) => {
    if (status === "Approved") return "border-green-200 bg-green-50 text-green-700";
    if (status === "Rejected") return "border-rose-200 bg-rose-50 text-rose-700";
    if (status === "Pending Allocation") return "border-cyan-200 bg-cyan-50 text-cyan-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const getSourceBadgeClass = (source: string) =>
    source === "RTS"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-orange-200 bg-orange-50 text-orange-700";

  const getRemainingDaysBadgeClass = (remainingDays: number) => {
    if (remainingDays <= 3) return "border-rose-200 bg-rose-50 text-rose-700";
    if (remainingDays <= 7) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const tableColumns = useMemo<Column<InboxTableRow>[]>(
    () => [
      {
        key: "id",
        label: (
          <input
            type="checkbox"
            checked={allRowsSelected}
            onChange={(event) => {
              if (event.target.checked) {
                setSelectedIds(filteredData.map((item) => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
            className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
          />
        ),
        width: "56px",
        align: "center",
        headerClassName: "px-4 py-3 border-r border-[#3d5a8a] text-center text-white",
        cellClassName: "px-4 py-3 text-center",
        render: (_value, row) => (
          <div
            className={`-my-2 -ml-4 border-l-4 px-4 py-2 ${row.source === "RTS" ? "border-l-[#4b70a6]" : "border-l-orange-500"
              }`}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(row.id)}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedIds((previous) => [...previous, row.id]);
                } else {
                  setSelectedIds((previous) => previous.filter((id) => id !== row.id));
                }
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#4b70a6] focus:ring-[#4b70a6]"
            />
          </div>
        ),
      },
      {
        key: "applicationNo",
        label: t.appId,
        headerClassName: "px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 font-extrabold text-slate-900",
      },
      {
        key: "source",
        label: t.source,
        align: "center",
        headerClassName: "px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 text-center",
        render: (value) => (
          <Badge size="sm" className={getSourceBadgeClass(String(value ?? ""))}>
            {String(value ?? "") === "RTS" ? "RTS" : "Aaple Sarkar"}
          </Badge>
        ),
      },
      {
        key: "citizenName",
        label: t.citizen,
        headerClassName: "px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 font-bold text-slate-800",
      },
      {
        key: "serviceName",
        label: t.service,
        headerClassName: "px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3",
        render: (_value, row) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{row.serviceName}</span>
            <span className="text-[11px] font-bold text-slate-450">{row.departmentName}</span>
          </div>
        ),
      },
      {
        key: "submissionDate",
        label: t.appDate,
        headerClassName: "px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 font-bold text-slate-750",
      },
      {
        key: "lastDate",
        label: t.lastDate,
        headerClassName: "px-4 py-3 text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 font-bold text-slate-750",
      },
      {
        key: "remainingDays",
        label: t.remainingDays,
        align: "center",
        headerClassName: "px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 text-center",
        render: (value) => {
          const remainingDays = Number(value ?? 0);
          return (
            <Badge size="sm" className={getRemainingDaysBadgeClass(remainingDays)}>
              {lang === "en" ? `${remainingDays} ${t.daysLeft}` : `${remainingDays} ${t.daysLeft}`}
            </Badge>
          );
        },
      },
      {
        key: "status",
        label: t.status,
        align: "center",
        headerClassName: "px-4 py-3 text-center text-[12px] font-bold uppercase tracking-wider border-r border-[#3d5a8a] text-white",
        cellClassName: "px-4 py-3 text-center",
        render: (value) => (
          <Badge size="sm" className={getStatusBadgeClass(String(value ?? ""))}>
            {String(value ?? "")}
          </Badge>
        ),
      },
    ],
    [allRowsSelected, filteredData, lang, selectedIds, t]
  );

  return (
    <div className="space-y-4">
      <Card className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.title}</h1>
          {/* <p className="mt-0.5 text-[13px] text-slate-400">{t.subtitle}</p> */}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            aria-expanded={showFilters}
            icon={Search}
            className={`h-9 min-h-0 gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-bold shadow-sm transition ${showFilters
              ? "border-[#4b70a6] bg-[#4b70a6] text-white hover:bg-[#3d5a8a]"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
          >
            {showFilters ? t.hideFilters : t.showFilters}
          </Button>

          <Button
            type="button"
            onClick={() => window.alert("Exporting application records queue...")}
            icon={Download}
            className="h-9 min-h-0 gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            {t.export}
          </Button>
        </div>
      </Card>

      <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
        <Card className="min-w-[130px] flex-1 rounded-xl border-l-4 border-l-slate-400 bg-slate-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.totalApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-slate-800">{stats.total}</span>
          </div>
        </Card>
        <Card className="min-w-[150px] flex-1 rounded-xl border-l-4 border-l-pink-400 bg-pink-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700">{t.officeApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-pink-700">{stats.office}</span>
          </div>
        </Card>
        <Card className="min-w-[150px] flex-1 rounded-xl border-l-4 border-l-blue-400 bg-blue-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{t.onlineApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-blue-700">{stats.online}</span>
          </div>
        </Card>
        <Card className="min-w-[130px] flex-1 rounded-xl border-l-4 border-l-amber-500 bg-amber-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{t.pendingApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-amber-600">{stats.pending}</span>
          </div>
        </Card>
        <Card className="min-w-[130px] flex-1 rounded-xl border-l-4 border-l-rose-500 bg-rose-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">{t.rejectedApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-rose-600">{stats.rejected}</span>
          </div>
        </Card>
        <Card className="min-w-[130px] flex-1 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t.approvedApplications}</span>
            <span className="mt-1 text-lg font-extrabold text-emerald-600">{stats.approved}</span>
          </div>
        </Card>
        <Card className="min-w-[150px] flex-1 rounded-xl border-l-4 border-l-amber-500 bg-amber-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{t.clerkCorrection}</span>
            <span className="mt-1 text-lg font-extrabold text-amber-600">{stats.clerkCorrection}</span>
          </div>
        </Card>
        <div className="mx-1 self-stretch rounded border-r-4 border-blue-600" />
        <Card className="min-w-[180px] flex-1 rounded-xl border-l-4 border-l-indigo-500 bg-indigo-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">{t.asstSuperintendent}</span>
            <span className="mt-1 text-lg font-extrabold text-indigo-700">{stats.asstSuperintendent}</span>
          </div>
        </Card>
        <Card className="min-w-[180px] flex-1 rounded-xl border-l-4 border-l-cyan-500 bg-cyan-50/50 p-3 shadow-sm">
          <div className="flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">{t.superintendent}</span>
            <span className="mt-1 text-lg font-extrabold text-cyan-700">{stats.superintendent}</span>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.search}</label>
            <SearchInput
              value={localSearch}
              onChange={setLocalSearch}
              placeholder={t.searchPlaceholder}
              className="mb-0 w-full [&_input]:h-8  [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:py-1.5 [&_input]:text-[13px] [&_input]:font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.department}</label>
            <Select
              options={departmentOptions}
              value={filters.deptId}
              onChange={(_event, value) => updateQueryParam("deptId", value)}
              placeholder={t.allDepartments}
              selectSize="sm"
              ariaLabel={t.department}
              className="text-[13px] font-semibold text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.service}</label>
            <Select
              options={serviceOptions}
              value={filters.serviceId}
              onChange={(_event, value) => updateQueryParam("serviceId", value)}
              placeholder={t.allServices}
              selectSize="sm"
              ariaLabel={t.service}
              className="text-[13px] font-semibold text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.status}</label>
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(_event, value) => updateQueryParam("status", value)}
              placeholder={t.allStatuses}
              selectSize="sm"
              ariaLabel={t.status}
              className="text-[13px] font-semibold text-slate-800"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 items-end gap-4 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.source}</label>
              <Select
                options={sourceOptions}
                value={filters.priority}
                onChange={(_event, value) => updateQueryParam("priority", value)}
                placeholder={t.allSources}
                selectSize="sm"
                ariaLabel={t.source}
                className="text-[13px] font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.documents}</label>
              <Select
                options={documentStatusOptions}
                value={filters.officerId}
                onChange={(_event, value) => updateQueryParam("officerId", value)}
                placeholder={t.allDocumentStatuses}
                selectSize="sm"
                ariaLabel={t.documents}
                className="text-[13px] font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.fromDate}</label>
              <Input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-9 rounded-xl border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus-visible:border-teal-500 focus-visible:bg-white focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.toDate}</label>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="h-9 rounded-xl border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-800 focus-visible:border-teal-500 focus-visible:bg-white focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center justify-end pb-1.5 lg:col-span-4">
              <Button
                type="button"
                onClick={handleClearFilters}
                className="h-8 min-h-0 bg-transparent px-2 text-[13px] font-bold text-[#4b70a6] shadow-none hover:bg-blue-50"
              >
                {t.clearFilters}
              </Button>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-2">
          {isPending ? (
            <div className="flex h-64 items-center justify-center bg-white/50 backdrop-blur-sm">
              <span className="text-[13px] font-semibold text-slate-500">{t.loading}</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white py-20 text-center">
              <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
              <h3 className="text-[13px] font-bold text-slate-700">{t.empty}</h3>
              <p className="mt-1 max-w-[280px] text-[11px] text-slate-400">{t.emptyHint}</p>
            </div>
          ) : (
            <MasterTable<InboxTableRow>
              columns={tableColumns}
              data={filteredData}
              getRowKey={(row) => row.id}
              actionLabel={t.actions}
              pageNumber={pageNumber}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              paginationConfig={{ enabled: totalPages > 1, showPageSizeSelector: false }}
              footerLeftContent={
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-slate-400">{t.showing(filteredData.length, totalCount)}</span>
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-500">{t.selected(selectedIds.length)}</span>
                      <Button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.alert(`Escalating ${selectedIds.length} applications...`);
                          setSelectedIds([]);
                        }}
                        className="h-7 min-h-0 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-100"
                      >
                        {t.bulkEscalate}
                      </Button>
                      <Button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.alert(`Assigning ${selectedIds.length} applications to officer...`);
                          setSelectedIds([]);
                        }}
                        className="h-7 min-h-0 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#4b70a6] transition hover:bg-blue-100"
                      >
                        {t.bulkAssign}
                      </Button>
                    </div>
                  )}
                </div>
              }
              containerClassName="gap-0"
              maxBodyHeightClassName="max-h-auto"
              tableClassName="min-w-full border-collapse text-[13px] text-slate-600 [&_th]:!text-white [&_th]:border-r [&_th]:border-blue-300/60 [&_td]:border-r [&_td]:border-slate-100 [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0"
              theadClassName="!bg-[#0A3275] !from-[#0A3275] !via-[#0A3275] !to-[#0A3275] hover:!from-[#0A3275] hover:!via-[#0A3275] hover:!to-[#0A3275]"
              rowClassName={(row) =>
                row.source === "Aaple Sarkar"
                  ? "bg-[#fdfaf5] hover:!bg-[#faf2e6]"
                  : "bg-white hover:!bg-slate-50"
              }
              onRowClick={(row) => router.push(`/${locale}/rts-cms/applications/${row.id}`)}
              renderActions={(row) => (
                <div onClick={(event) => event.stopPropagation()}>
                  <Button
                    type="button"
                    onClick={() => router.push(`/${locale}/rts-cms/applications/${row.id}`)}
                    icon={Eye}
                    className="h-7 min-h-0 gap-1 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 text-[11px] font-bold text-[#4b70a6] transition hover:bg-slate-50"
                    title={t.viewDetails}
                  >
                    {t.view}
                  </Button>
                </div>
              )}
            />
          )}
        </div>

      </Card>
    </div>
  );
}
