"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Info,
  LayoutDashboard,
  TriangleAlert,
} from "lucide-react";

import { Card, MasterTable, SearchInput } from "@/components/common";
import type { Column } from "@/components/common/MasterTable";
import { CloseIconButton } from "@/components/common/ActionButtons";

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
  serviceName: string;
  departmentId: string;
  submittedDate: string;
  slaLimit: number;
  pendingDays: number;
  inProgressDays: number;
  needsInfoDays: number;
  verificationDays: number;
  totalTat: number;
  outcome: "Within SLA" | "SLA breached" | "At risk";
  applicationStatus: "Approved" | "Pending" | "Rejected";
}

interface DepartmentTatRecord {
  key: "propertyTax" | "tradeLicense" | "waterConnection" | "townPlanning";
  total: number;
  pending: number;
  inProgress: number;
  needsInfo: number;
  verification: number;
  stageDays: {
    pending: number;
    inProgress: number;
    needsInfo: number;
    verification: number;
  };
}


const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const DEPARTMENT_TAT_DATA: DepartmentTatRecord[] = [
  {
    key: "propertyTax",
    total: 6.8,
    pending: 22,
    inProgress: 37,
    needsInfo: 26,
    verification: 15,
    stageDays: {
      pending: 1.5,
      inProgress: 2.5,
      needsInfo: 1.8,
      verification: 1.0,
    },
  },
  {
    key: "tradeLicense",
    total: 9.0,
    pending: 22,
    inProgress: 33,
    needsInfo: 28,
    verification: 17,
    stageDays: {
      pending: 2.0,
      inProgress: 3.0,
      needsInfo: 2.5,
      verification: 1.5,
    },
  },
  {
    key: "waterConnection",
    total: 17.7,
    pending: 20,
    inProgress: 34,
    needsInfo: 28,
    verification: 18,
    stageDays: {
      pending: 3.5,
      inProgress: 6.0,
      needsInfo: 5.0,
      verification: 3.2,
    },
  },
  {
    key: "townPlanning",
    total: 17.5,
    pending: 23,
    inProgress: 31,
    needsInfo: 28,
    verification: 18,
    stageDays: {
      pending: 4.0,
      inProgress: 5.5,
      needsInfo: 4.8,
      verification: 3.2,
    },
  },
];


function normalizeApplicationStatus(
  value: unknown
): "Approved" | "Pending" | "Rejected" {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized.includes("approve") ||
    normalized.includes("complete") ||
    normalized.includes("success")
  ) {
    return "Approved";
  }

  if (
    normalized.includes("reject") ||
    normalized.includes("cancel") ||
    normalized.includes("decline")
  ) {
    return "Rejected";
  }

  return "Pending";
}

export default function CmsMulyamapan({
  data,
  masters,
  locale,
}: CmsMulyamapanProps) {
  const t = useTranslations("rts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SlaRecord | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(
        locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN"
      ),
    [locale]
  );

  const formatDays = (value: number | string) =>
    t("mulyamapan.units.dayShort", { value });


  const slaRecords = useMemo<SlaRecord[]>(() => {
    return data.map((application) => {
      const applicationNumber = Number.parseInt(application.id, 10) || 1000;
      const statusSource = application as CmsApplication & {
        status?: string;
        applicationStatus?: string;
        currentStatus?: string;
      };
      const applicationStatus = normalizeApplicationStatus(
        statusSource.applicationStatus ??
          statusSource.currentStatus ??
          statusSource.status
      );
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
        serviceName: application.serviceName,
        departmentId: application.departmentId,
        submittedDate:
          application.submissionDate ||
          application.createdAt ||
          application.applicationDate ||
          "",
        slaLimit,
        pendingDays,
        inProgressDays,
        needsInfoDays,
        verificationDays,
        totalTat,
        outcome,
        applicationStatus,
      };
    });
  }, [data]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.toLocaleLowerCase(locale).trim();

    return slaRecords.filter((record) => {
      return (
        !query ||
        record.appId.toLocaleLowerCase(locale).includes(query) ||
        record.citizenName.toLocaleLowerCase(locale).includes(query) ||
        record.serviceName.toLocaleLowerCase(locale).includes(query)
      );
    });
  }, [locale, searchTerm, slaRecords]);

  const statusSummary = useMemo(() => {
    return slaRecords.reduce(
      (summary, record) => {
        summary.total += 1;

        if (record.applicationStatus === "Approved") {
          summary.approved += 1;
        } else if (record.applicationStatus === "Rejected") {
          summary.rejected += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      }
    );
  }, [slaRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, pageNumber, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const getOutcomeLabel = (outcome: SlaRecord["outcome"]) => {
    if (outcome === "Within SLA") {
      return t("mulyamapan.outcomes.withinSla");
    }

    if (outcome === "SLA breached") {
      return t("mulyamapan.outcomes.slaBreached");
    }

    return t("mulyamapan.outcomes.atRisk");
  };

  const columns = useMemo<Column<SlaRecord>[]>(
    () => [
      {
        key: "appId",
        label: t("applicationDashboard.table.applicationAndService"),
        width: "32%",
        render: (_value, row) => (
          <div>
            <div className="text-[9px] font-bold text-slate-400">
              {row.appId}
            </div>
            <div className="mt-1 text-[11px] font-extrabold text-slate-900">
              {row.serviceName}
            </div>
          </div>
        ),
      },
      {
        key: "submittedDate",
        label: t("applicationDashboard.table.submittedDate"),
        width: "20%",
        render: (value) => (
          <span>{String(value || "-")}</span>
        ),
      },
      {
        key: "slaLimit",
        label: t("applicationDashboard.table.slaTimeline"),
        width: "16%",
        align: "center",
        render: (value) => (
          <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-700">
            {formatDays(String(value))}
          </span>
        ),
      },
      {
        key: "applicationStatus",
        label: t("applicationDashboard.table.statusAndStage"),
        width: "20%",
        align: "center",
        render: (_value, row) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
              row.applicationStatus === "Approved"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : row.applicationStatus === "Rejected"
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-amber-300 bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                row.applicationStatus === "Approved"
                  ? "bg-emerald-500"
                  : row.applicationStatus === "Rejected"
                    ? "bg-rose-500"
                    : "bg-amber-500"
              }`}
            />
            {t(
              `applicationDashboard.status.${row.applicationStatus.toLowerCase()}`
            )}
          </span>
        ),
      },
    ],
    [t]
  );

  const metricCards = [
    {
      key: "total",
      icon: FileText,
      label: t("applicationDashboard.cards.totalApplications"),
      value: statusSummary.total,
      borderClassName: "border-l-blue-600",
      valueClassName: "text-slate-900",
      iconClassName: "border-blue-100 bg-blue-50 text-blue-600",
    },
    {
      key: "approved",
      icon: CheckCircle2,
      label: t("applicationDashboard.cards.approved"),
      value: statusSummary.approved,
      borderClassName: "border-l-emerald-600",
      valueClassName: "text-emerald-600",
      iconClassName: "border-emerald-100 bg-emerald-50 text-emerald-600",
    },
    {
      key: "pending",
      icon: Clock3,
      label: t("applicationDashboard.cards.pending"),
      value: statusSummary.pending,
      borderClassName: "border-l-amber-500",
      valueClassName: "text-amber-600",
      iconClassName: "border-amber-100 bg-amber-50 text-amber-600",
    },
    {
      key: "rejected",
      icon: TriangleAlert,
      label: t("applicationDashboard.cards.rejected"),
      value: statusSummary.rejected,
      borderClassName: "border-l-rose-600",
      valueClassName: "text-rose-600",
      iconClassName: "border-rose-100 bg-rose-50 text-rose-600",
    },
  ];

  const chartLegend = [
    { colorClass: "bg-amber-400", label: t("applicationDashboard.graph.stages.pending") },
    { colorClass: "bg-[#4b70a6]", label: t("applicationDashboard.graph.stages.inProgress") },
    { colorClass: "bg-purple-400", label: t("applicationDashboard.graph.stages.needsInfo") },
    { colorClass: "bg-emerald-500", label: t("applicationDashboard.graph.stages.verification") },
  ];

  const dialogStages = selectedRecord
    ? [
        {
          color: "bg-amber-400",
          label: t("applicationDashboard.dialog.stages.clerkAllocation"),
          days: selectedRecord.pendingDays,
        },
        {
          color: "bg-[#4b70a6]",
          label: t("applicationDashboard.dialog.stages.officialScrutiny"),
          days: selectedRecord.inProgressDays,
        },
        {
          color: "bg-purple-400",
          label: t("applicationDashboard.dialog.stages.queryResolution"),
          days: selectedRecord.needsInfoDays,
        },
        {
          color: "bg-emerald-500",
          label: t("applicationDashboard.dialog.stages.finalSignOff"),
          days: selectedRecord.verificationDays,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <Card
        padding="sm"
        className="flex items-center gap-4 rounded-2xl border-slate-200 bg-white shadow-sm"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {t("applicationDashboard.title")}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {t("applicationDashboard.subtitle")}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card
            key={metric.key}
            padding="none"
            className={`flex min-h-[72px] items-center justify-between rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm ${metric.borderClassName}`}
          >
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-slate-500">
                {metric.label}
              </div>
              <div
                className={`mt-1 text-xl font-extrabold leading-none ${metric.valueClassName}`}
              >
                {numberFormatter.format(metric.value)}
              </div>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${metric.iconClassName}`}
            >
              <metric.icon className="h-5 w-5" strokeWidth={2} />
            </div>
          </Card>
        ))}
      </div>

      <Card
        padding="sm"
        className="space-y-3 border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <FileText className="h-4 w-4 text-blue-600" />
              {t("applicationDashboard.applications.title")}
            </h2>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              {t("applicationDashboard.applications.description")}
            </p>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t("applicationDashboard.applications.searchPlaceholder")}
            className="mb-0 w-full sm:w-[260px]"
          />
        </div>

        <MasterTable<SlaRecord>
          columns={columns}
          data={paginatedRecords}
          emptyText={t("applicationDashboard.applications.empty")}
          getRowKey={(row) => row.id}
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => setSelectedRecord(row)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-700 transition hover:bg-blue-100"
              aria-label={t("applicationDashboard.actions.viewDetailsAria", {
                appId: row.appId,
              })}
            >
              <Eye className="h-3 w-3" />
              {t("applicationDashboard.actions.viewDetails")}
            </button>
          )}
          actionLabel={t("applicationDashboard.table.actions")}
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
          maxBodyHeightClassName="max-h-[520px]"
          containerClassName="gap-0 [&>div]:!border-0 [&>div]:!shadow-none [&>div]:!rounded-none"
          theadClassName="!bg-slate-50 !from-slate-50 !via-slate-50 !to-slate-50 hover:!from-slate-50 hover:!via-slate-50 hover:!to-slate-50 [&_th]:!text-slate-700"
          tableClassName="[&_thead_tr]:border-b [&_thead_tr]:border-slate-200 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr]:bg-white [&_tbody_tr:hover]:bg-slate-50/70 [&_th]:uppercase"
          footerLeftContent={
            <span className="text-[12px] text-slate-400">
              {t("applicationDashboard.pagination.showing", {
                shown: numberFormatter.format(paginatedRecords.length),
                total: numberFormatter.format(filteredRecords.length),
              })}
            </span>
          }
          footerClassName="!border-slate-100 !bg-white !shadow-none"
          footerLeftClassName="text-slate-400"
        />
      </Card>


      <Card padding="sm" className="space-y-4 border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#243B7C]">
            {t("applicationDashboard.graph.title")}
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-400">
            {t("applicationDashboard.graph.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          {chartLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded ${item.colorClass}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {DEPARTMENT_TAT_DATA.map((department) => (
            <div key={department.key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>
                  {t(`applicationDashboard.graph.departments.${department.key}`)}
                </span>
                <span className="font-extrabold text-slate-800">
                  {t("applicationDashboard.units.days", {
                    value: department.total.toFixed(1),
                  })}
                </span>
              </div>

              <div className="flex h-5 w-full overflow-hidden rounded-lg border border-slate-100 shadow-inner">
                <div
                  style={{ width: `${department.pending}%` }}
                  className="bg-amber-400 transition hover:opacity-90"
                  title={t("applicationDashboard.graph.stageTooltip", {
                    stage: t("applicationDashboard.graph.stages.pending"),
                    value: department.stageDays.pending,
                  })}
                />
                <div
                  style={{ width: `${department.inProgress}%` }}
                  className="bg-[#4b70a6] transition hover:opacity-90"
                  title={t("applicationDashboard.graph.stageTooltip", {
                    stage: t("applicationDashboard.graph.stages.inProgress"),
                    value: department.stageDays.inProgress,
                  })}
                />
                <div
                  style={{ width: `${department.needsInfo}%` }}
                  className="bg-purple-400 transition hover:opacity-90"
                  title={t("applicationDashboard.graph.stageTooltip", {
                    stage: t("applicationDashboard.graph.stages.needsInfo"),
                    value: department.stageDays.needsInfo,
                  })}
                />
                <div
                  style={{ width: `${department.verification}%` }}
                  className="bg-emerald-500 transition hover:opacity-90"
                  title={t("applicationDashboard.graph.stageTooltip", {
                    stage: t("applicationDashboard.graph.stages.verification"),
                    value: department.stageDays.verification,
                  })}
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
              title={t("applicationDashboard.actions.close")}
              onClick={() => setSelectedRecord(null)}
            />

            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 pr-8">
              <Info className="h-5 w-5 text-[#4b70a6]" />
              <h3
                id="sla-analysis-title"
                className="text-sm font-extrabold text-slate-800"
              >
                {t("applicationDashboard.dialog.title", {
                  appId: selectedRecord.appId,
                })}
              </h3>
            </div>

            <div className="space-y-4 text-[13px] text-slate-700">
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    {t("applicationDashboard.dialog.citizenName")}
                  </span>
                  <p className="font-semibold text-slate-700">
                    {selectedRecord.citizenName}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    {t("applicationDashboard.dialog.serviceCategory")}
                  </span>
                  <p className="font-semibold text-slate-700">
                    {selectedRecord.serviceName}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <span className="block text-[11px] font-bold uppercase text-slate-400">
                  {t("applicationDashboard.dialog.stageWiseDuration")}
                </span>

                {dialogStages.map((stage) => (
                  <div
                    key={stage.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                      {stage.label}
                    </span>
                    <span className="whitespace-nowrap font-bold text-slate-800">
                      {t("applicationDashboard.units.days", { value: stage.days })}
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
                      {t("applicationDashboard.dialog.slaStatus")}{" "}
                      {getOutcomeLabel(selectedRecord.outcome)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400">
                      {t("applicationDashboard.dialog.targetVsActual")}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {t("applicationDashboard.dialog.targetActualValues", {
                        actual: selectedRecord.totalTat,
                        target: selectedRecord.slaLimit,
                      })}
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