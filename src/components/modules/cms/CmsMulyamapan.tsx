"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  CheckCircle,
  Info,
  Sparkles,
} from "lucide-react";

import {
  Card,
  MasterTable,
  SearchInput,
} from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { Select } from "@/components/common/select";
import {
  CloseIconButton,
  DownloadButton,
  ViewButton,
} from "@/components/common/ActionButtons";

import type { CmsApplication } from "@/lib/mock/rts/cms";

interface CmsMulyamapanProps {
  data: CmsApplication[];
  masters: {
    departments: Array<{ id: string; name: string }>;
    services: Array<{ id: string; name: string; departmentId: string }>;
  };
  locale: string;
}

interface SlaRecord extends Record<string, unknown> {
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const MONTH_OPTIONS = [
  { value: "June 2026", label: "June 2026" },
  { value: "May 2026", label: "May 2026" },
  { value: "April 2026", label: "April 2026" },
];

const DEPARTMENT_TAT_DATA = [
  {
    nameEn: "Property Tax",
    nameMr: "मालमत्ता कर",
    total: 6.8,
    pending: 22,
    inProgress: 37,
    needsInfo: 26,
    verification: 15,
    titles: ["Pending: 1.5d", "In Progress: 2.5d", "Needs Info: 1.8d", "Verification: 1.0d"],
  },
  {
    nameEn: "Trade License",
    nameMr: "व्यावसायिक परवाना",
    total: 9.0,
    pending: 22,
    inProgress: 33,
    needsInfo: 28,
    verification: 17,
    titles: ["Pending: 2.0d", "In Progress: 3.0d", "Needs Info: 2.5d", "Verification: 1.5d"],
  },
  {
    nameEn: "Water Connection",
    nameMr: "जलजोडणी",
    total: 17.7,
    pending: 20,
    inProgress: 34,
    needsInfo: 28,
    verification: 18,
    titles: ["Pending: 3.5d", "In Progress: 6.0d", "Needs Info: 5.0d", "Verification: 3.2d"],
  },
  {
    nameEn: "Town Planning",
    nameMr: "नगर रचना",
    total: 17.5,
    pending: 23,
    inProgress: 31,
    needsInfo: 28,
    verification: 18,
    titles: ["Pending: 4.0d", "In Progress: 5.5d", "Needs Info: 4.8d", "Verification: 3.2d"],
  },
];

export default function CmsMulyamapan({
  data,
  masters,
  locale,
}: CmsMulyamapanProps) {
  const lang = locale === "mr" ? "mr" : "en";

  const [filterDept, setFilterDept] = useState("All");
  const [filterMonth, setFilterMonth] = useState("June 2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState<SlaRecord | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const departmentOptions = useMemo(
    () => [
      {
        value: "All",
        label: lang === "en" ? "All departments" : "सर्व विभाग",
      },
      ...masters.departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    ],
    [lang, masters.departments]
  );

  const outcomeOptions = useMemo(
    () => [
      {
        value: "All",
        label: lang === "en" ? "All outcomes" : "सर्व निष्कर्ष",
      },
      {
        value: "Within SLA",
        label: lang === "en" ? "Within SLA" : "SLA मर्यादेत",
      },
      {
        value: "SLA breached",
        label: lang === "en" ? "SLA breached" : "SLA उल्लंघन",
      },
      {
        value: "At risk",
        label: lang === "en" ? "At risk" : "धोक्यात",
      },
    ],
    [lang]
  );

  const slaRecords = useMemo<SlaRecord[]>(() => {
    return data.map((application) => {
      const applicationNumber = Number.parseInt(application.id, 10) || 1000;

      const pendingDays = (applicationNumber % 3) + 1;
      const inProgressDays = (applicationNumber % 4) + 2;
      const needsInfoDays =
        applicationNumber % 5 === 0 ? 0 : (applicationNumber % 3) + 1;
      const verificationDays = applicationNumber % 2 === 0 ? 1 : 2;

      const totalTat =
        pendingDays + inProgressDays + needsInfoDays + verificationDays;
      const slaLimit = application.slaDays || 15;

      let outcome: SlaRecord["outcome"] = "Within SLA";
      if (totalTat > slaLimit) {
        outcome = "SLA breached";
      } else if (slaLimit - totalTat <= 2) {
        outcome = "At risk";
      }

      return {
        id: application.id,
        appId: application.applicationNo,
        citizenName: application.citizenName,
        citizenNameMr: application.citizenName,
        serviceName: application.serviceName,
        serviceNameMr: application.serviceName,
        departmentId: application.departmentId,
        slaLimit,
        pendingDays,
        inProgressDays,
        needsInfoDays,
        verificationDays,
        totalTat,
        outcome,
      };
    });
  }, [data]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return slaRecords.filter((record) => {
      const departmentMatches =
        filterDept === "All" || record.departmentId === filterDept;
      const outcomeMatches =
        filterOutcome === "All" || record.outcome === filterOutcome;
      const textMatches =
        !query ||
        record.appId.toLowerCase().includes(query) ||
        record.citizenName.toLowerCase().includes(query) ||
        record.serviceName.toLowerCase().includes(query);

      return departmentMatches && outcomeMatches && textMatches;
    });
  }, [filterDept, filterOutcome, searchTerm, slaRecords]);

  const summary = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        avgTat: "0.0",
        avgPending: "0.0",
        avgInProgress: "0.0",
        bottleneck: "N/A",
      };
    }

    const totals = filteredRecords.reduce(
      (accumulator, record) => ({
        tat: accumulator.tat + record.totalTat,
        pending: accumulator.pending + record.pendingDays,
        inProgress: accumulator.inProgress + record.inProgressDays,
        needsInfo: accumulator.needsInfo + record.needsInfoDays,
        verification: accumulator.verification + record.verificationDays,
      }),
      { tat: 0, pending: 0, inProgress: 0, needsInfo: 0, verification: 0 }
    );

    const stages = [
      { name: lang === "en" ? "Pending" : "प्रलंबित", value: totals.pending },
      {
        name: lang === "en" ? "In Progress" : "प्रक्रियेत",
        value: totals.inProgress,
      },
      {
        name: lang === "en" ? "Needs Info" : "माहिती आवश्यक",
        value: totals.needsInfo,
      },
      {
        name: lang === "en" ? "Verification" : "पडताळणी",
        value: totals.verification,
      },
    ].sort((first, second) => second.value - first.value);

    return {
      avgTat: (totals.tat / filteredRecords.length).toFixed(1),
      avgPending: (totals.pending / filteredRecords.length).toFixed(1),
      avgInProgress: (totals.inProgress / filteredRecords.length).toFixed(1),
      bottleneck: stages[0]?.name ?? "N/A",
    };
  }, [filteredRecords, lang]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, pageNumber, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [filterDept, filterMonth, filterOutcome, searchTerm, pageSize]);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const getOutcomeLabel = (outcome: SlaRecord["outcome"]) => {
    if (lang === "en") return outcome;
    if (outcome === "Within SLA") return "SLA मर्यादेत";
    if (outcome === "SLA breached") return "SLA उल्लंघन";
    return "धोक्यात";
  };

  const columns = useMemo<Column<SlaRecord>[]>(
    () => [
      {
        key: "appId",
        label: lang === "en" ? "App ID" : "अर्जाचा आयडी",
        width: "130px",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 font-bold text-slate-800",
      },
      {
        key: "citizenName",
        label: lang === "en" ? "Citizen" : "नागरिक",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 font-medium text-slate-700",
        render: (_value, row) =>
          lang === "en" ? row.citizenName : row.citizenNameMr,
      },
      {
        key: "serviceName",
        label: lang === "en" ? "Service" : "सेवा",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 text-slate-500",
        render: (_value, row) =>
          lang === "en" ? row.serviceName : row.serviceNameMr,
      },
      {
        key: "slaLimit",
        label: lang === "en" ? "SLA (days)" : "SLA (दिवस)",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        render: (value) => (
          <span className="font-bold text-slate-500">{String(value)}d</span>
        ),
      },
      {
        key: "pendingDays",
        label: lang === "en" ? "Pending" : "प्रलंबित",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 bg-amber-50/50",
        render: (value) => (
          <span className="font-medium text-amber-700">{String(value)}d</span>
        ),
      },
      {
        key: "inProgressDays",
        label: lang === "en" ? "In progress" : "प्रक्रियेत",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 bg-blue-50/30",
        render: (value) => (
          <span className="font-medium text-blue-700">{String(value)}d</span>
        ),
      },
      {
        key: "needsInfoDays",
        label: lang === "en" ? "Needs info" : "माहिती आवश्यक",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 bg-purple-50/30",
        render: (value) => {
          const days = Number(value ?? 0);
          return (
            <span className="font-medium text-purple-700">
              {days > 0 ? `${days}d` : "—"}
            </span>
          );
        },
      },
      {
        key: "verificationDays",
        label: lang === "en" ? "Verification" : "पडताळणी",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100 bg-emerald-50/30",
        render: (value) => (
          <span className="font-medium text-emerald-700">{String(value)}d</span>
        ),
      },
      {
        key: "totalTat",
        label: lang === "en" ? "Total TAT" : "एकूण वेळ",
        align: "center",
        headerClassName: "border-r border-blue-300/60 text-white",
        cellClassName: "border-r border-slate-100",
        render: (_value, row) => (
          <span className="font-extrabold text-slate-800">
            {row.totalTat.toFixed(1)}d
            {row.totalTat > row.slaLimit && (
              <span className="ml-1 text-[10px] font-semibold text-rose-600">
                (+{(row.totalTat - row.slaLimit).toFixed(0)}d)
              </span>
            )}
          </span>
        ),
      },
      {
        key: "outcome",
        label: lang === "en" ? "Outcome" : "निष्कर्ष",
        align: "center",
        render: (_value, row) => (
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${
              row.outcome === "Within SLA"
                ? "border-green-200 bg-green-50 text-green-700"
                : row.outcome === "SLA breached"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {getOutcomeLabel(row.outcome)}
          </span>
        ),
      },
    ],
    [lang]
  );

  const metricCards = [
    {
      key: "avg-tat",
      borderClass: "border-[#4b70a6]",
      label:
        lang === "en"
          ? "Avg total TAT (days)"
          : "एकूण सरासरी वेळ (दिवस)",
      value: `${summary.avgTat}d`,
      content: (
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-600">
          <ArrowDown className="h-3 w-3" />
          {lang === "en" ? "0.4 vs last month" : "मागील महिन्यापेक्षा 0.4 कमी"}
        </span>
      ),
    },
    {
      key: "avg-pending",
      borderClass: "border-amber-500",
      label:
        lang === "en"
          ? "Avg time — Pending stage"
          : "सरासरी वेळ — प्रलंबित टप्पा",
      value: `${summary.avgPending}d`,
      content: (
        <span className="text-[11px] text-slate-400">
          {lang === "en" ? "days before assignment" : "नियुक्तीपूर्वीचे दिवस"}
        </span>
      ),
    },
    {
      key: "avg-progress",
      borderClass: "border-blue-500",
      label:
        lang === "en"
          ? "Avg time — In progress"
          : "सरासरी वेळ — प्रक्रियेत",
      value: `${summary.avgInProgress}d`,
      content: (
        <span className="text-[11px] text-slate-400">
          {lang === "en" ? "days officer processing" : "अधिकारी प्रक्रिया दिवस"}
        </span>
      ),
    },
    {
      key: "bottleneck",
      borderClass: "border-purple-500",
      label: lang === "en" ? "Bottleneck stage" : "सर्वात संथ टप्पा",
      value: summary.bottleneck,
      valueClass: "text-purple-700",
      content: (
        <span className="text-[11px] text-slate-400">
          {lang === "en" ? "highest time spent here" : "या टप्प्यावर सर्वाधिक वेळ"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        padding="sm"
        className="flex flex-col justify-between gap-4 border-slate-200 shadow-sm sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {lang === "en" ? "Dashboard" : "डॅशबोर्ड"}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {lang === "en"
              ? "Application-wise SLA evaluation and stage tracking"
              : "अर्जनिहाय SLA मूल्यांकन आणि टप्पा ट्रॅकिंग"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[180px]">
            <Select
              options={departmentOptions}
              value={filterDept}
              onChange={(_event, value) => setFilterDept(value)}
              placeholder={lang === "en" ? "All departments" : "सर्व विभाग"}
              selectSize="sm"
              ariaLabel={
                lang === "en"
                  ? "Filter by department"
                  : "विभागानुसार फिल्टर"
              }
            />
          </div>

          <div className="min-w-[140px]">
            <Select
              options={MONTH_OPTIONS}
              value={filterMonth}
              onChange={(_event, value) => setFilterMonth(value)}
              placeholder={lang === "en" ? "Select month" : "महिना निवडा"}
              selectSize="sm"
              ariaLabel={lang === "en" ? "Filter by month" : "महिन्यानुसार फिल्टर"}
            />
          </div>

          <DownloadButton
            type="button"
            label={lang === "en" ? "Export" : "निर्यात करा"}
            size="sm"
            onClick={() => window.alert("Exporting SLA evaluation report...")}
            className="rounded-xl"
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card
            key={metric.key}
            padding="sm"
            className={`flex flex-col justify-between rounded-2xl border-l-4 bg-white shadow-sm ${metric.borderClass}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {metric.label}
            </div>
            <div className="mt-2 flex flex-col gap-0.5">
              <span
                className={`text-2xl font-extrabold ${
                  metric.valueClass ?? "text-slate-800"
                }`}
              >
                {metric.value}
              </span>
              {metric.content}
            </div>
          </Card>
        ))}
      </div>

      <Card padding="sm" className="space-y-3 border-slate-200 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#243B7C]">
            <Activity className="h-5 w-5 text-[#4b70a6]" />
            {lang === "en"
              ? "Application-wise SLA breakdown"
              : "अर्ज निहाय वेळ मापन गोषवारा"}
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={
                lang === "en"
                  ? "Search App ID or citizen..."
                  : "अर्जदार नाव किंवा आयडी..."
              }
              className="mb-0 w-full sm:w-[290px]"
            />

            <div className="min-w-[170px]">
              <Select
                options={outcomeOptions}
                value={filterOutcome}
                onChange={(_event, value) => setFilterOutcome(value)}
                placeholder={
                  lang === "en" ? "All outcomes" : "सर्व निष्कर्ष"
                }
                selectSize="sm"
                ariaLabel={
                  lang === "en"
                    ? "Filter by SLA outcome"
                    : "SLA निष्कर्षानुसार फिल्टर"
                }
              />
            </div>
          </div>
        </div>

        <MasterTable<SlaRecord>
          columns={columns}
          data={paginatedRecords}
          emptyText={
            lang === "en"
              ? "No applications matched the tracking criteria."
              : "ट्रॅकिंग निकषांशी जुळणारे अर्ज आढळले नाहीत."
          }
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <ViewButton
              type="button"
              aria-label={
                lang === "en"
                  ? `Analyse ${row.appId}`
                  : `${row.appId} चे विश्लेषण करा`
              }
              onClick={() => setSelectedRecord(row)}
              className="mx-auto"
            />
          )}
          actionLabel={lang === "en" ? "Actions" : "कृती"}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={filteredRecords.length}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          paginationConfig={{
            enabled: true,
            showPageSizeSelector: true,
          }}
          maxBodyHeightClassName="max-h-auto"
          containerClassName="gap-0"
          theadClassName="!bg-[#4b70a6] !from-[#4b70a6] !via-[#4b70a6] !to-[#4b70a6] hover:!from-[#4b70a6] hover:!via-[#4b70a6] hover:!to-[#4b70a6] [&_th]:!text-white"
          tableClassName="border-collapse text-left text-[13px] [&_th:last-child]:border-l [&_th:last-child]:border-blue-300/60 [&_td:last-child]:border-l [&_td:last-child]:border-slate-100"
          footerLeftContent={
            <span className="text-[13px] text-slate-400">
              {lang === "en"
                ? `Showing ${paginatedRecords.length} of ${filteredRecords.length} filtered applications`
                : `${filteredRecords.length} पैकी ${paginatedRecords.length} फिल्टर केलेले अर्ज दाखवत आहे`}
            </span>
          }
        />
      </Card>

      <Card padding="sm" className="space-y-4 border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#243B7C]">
            {lang === "en"
              ? "Department-wise avg TAT — all stages"
              : "विभाग निहाय सरासरी वेळ मापन — सर्व टप्पे"}
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-400">
            {lang === "en"
              ? "Stacked representation of stage-duration split"
              : "टप्पानिहाय कालावधीचे स्टॅक्ड प्रतिनिधित्व"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          {[
            ["bg-amber-400", lang === "en" ? "Pending" : "प्रलंबित"],
            ["bg-[#4b70a6]", lang === "en" ? "In Progress" : "प्रक्रियेत"],
            ["bg-purple-400", lang === "en" ? "Needs Info" : "माहिती आवश्यक"],
            ["bg-emerald-500", lang === "en" ? "Verification" : "पडताळणी"],
          ].map(([colorClass, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded ${colorClass}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {DEPARTMENT_TAT_DATA.map((department) => (
            <div key={department.nameEn} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>
                  {lang === "en"
                    ? department.nameEn
                    : `${department.nameMr} (${department.nameEn})`}
                </span>
                <span className="font-extrabold text-slate-800">
                  {department.total.toFixed(1)}{" "}
                  {lang === "en" ? "Days" : "दिवस"}
                </span>
              </div>

              <div className="flex h-5 w-full overflow-hidden rounded-lg border border-slate-100 shadow-inner">
                <div
                  style={{ width: `${department.pending}%` }}
                  className="bg-amber-400 transition hover:opacity-90"
                  title={department.titles[0]}
                />
                <div
                  style={{ width: `${department.inProgress}%` }}
                  className="bg-[#4b70a6] transition hover:opacity-90"
                  title={department.titles[1]}
                />
                <div
                  style={{ width: `${department.needsInfo}%` }}
                  className="bg-purple-400 transition hover:opacity-90"
                  title={department.titles[2]}
                />
                <div
                  style={{ width: `${department.verification}%` }}
                  className="bg-emerald-500 transition hover:opacity-90"
                  title={department.titles[3]}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sla-analysis-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <Card
            padding="md"
            className="relative w-full max-w-lg overflow-hidden border-slate-200 bg-white shadow-2xl"
          >
            <CloseIconButton
              title={lang === "en" ? "Close" : "बंद करा"}
              onClick={() => setSelectedRecord(null)}
            />

            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 pr-8">
              <Info className="h-5 w-5 text-[#4b70a6]" />
              <h3
                id="sla-analysis-title"
                className="text-sm font-extrabold text-slate-800"
              >
                {lang === "en"
                  ? `SLA Timeline Analysis: ${selectedRecord.appId}`
                  : `SLA कालरेषा विश्लेषण: ${selectedRecord.appId}`}
              </h3>
            </div>

            <div className="space-y-4 text-[13px] text-slate-700">
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    {lang === "en" ? "Citizen Name" : "नागरिकाचे नाव"}
                  </span>
                  <p className="font-semibold text-slate-700">
                    {lang === "en"
                      ? selectedRecord.citizenName
                      : selectedRecord.citizenNameMr}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    {lang === "en" ? "Service Category" : "सेवा प्रकार"}
                  </span>
                  <p className="font-semibold text-slate-700">
                    {lang === "en"
                      ? selectedRecord.serviceName
                      : selectedRecord.serviceNameMr}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <span className="block text-[11px] font-bold uppercase text-slate-400">
                  {lang === "en" ? "Stage-wise duration" : "टप्पानिहाय कालावधी"}
                </span>

                {[
                  {
                    color: "bg-amber-400",
                    label:
                      lang === "en"
                        ? "1. Clerk Allocation (Pending)"
                        : "1. लिपिक नियुक्ती (प्रलंबित)",
                    days: selectedRecord.pendingDays,
                  },
                  {
                    color: "bg-[#4b70a6]",
                    label:
                      lang === "en"
                        ? "2. Official Scrutiny (In progress)"
                        : "2. अधिकृत छाननी (प्रक्रियेत)",
                    days: selectedRecord.inProgressDays,
                  },
                  {
                    color: "bg-purple-400",
                    label:
                      lang === "en"
                        ? "3. Query Resolution (Needs info)"
                        : "3. प्रश्न निराकरण (माहिती आवश्यक)",
                    days: selectedRecord.needsInfoDays,
                  },
                  {
                    color: "bg-emerald-500",
                    label:
                      lang === "en"
                        ? "4. Final Sign-off (Verification)"
                        : "4. अंतिम मंजुरी (पडताळणी)",
                    days: selectedRecord.verificationDays,
                  },
                ].map((stage) => (
                  <div
                    key={stage.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                      {stage.label}
                    </span>
                    <span className="whitespace-nowrap font-bold text-slate-800">
                      {stage.days} {lang === "en" ? "Days" : "दिवस"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {selectedRecord.outcome === "Within SLA" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle
                        className={`h-4 w-4 ${
                          selectedRecord.outcome === "SLA breached"
                            ? "text-rose-600"
                            : "text-amber-500"
                        }`}
                      />
                    )}
                    <span className="font-bold text-slate-700">
                      {lang === "en" ? "SLA Status:" : "SLA स्थिती:"}{" "}
                      {getOutcomeLabel(selectedRecord.outcome)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400">
                      {lang === "en" ? "Target vs Actual" : "लक्ष्य व प्रत्यक्ष"}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {selectedRecord.totalTat}d / {selectedRecord.slaLimit}d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}