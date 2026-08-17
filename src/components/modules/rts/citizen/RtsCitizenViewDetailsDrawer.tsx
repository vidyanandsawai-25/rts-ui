"use client";

import { useEffect, useState } from "react";
import { Download, FileText, GitCommit, Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";

import { getApplicationDetailAction, type RtsApplicationDetailData } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import { ApprovalStagesTimeline } from "@/components/modules/rts";
import { Button, DocumentViewerModal, Drawer, ViewButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getCitizenRtsDocumentDownloadUrl, getCitizenRtsDocumentViewUrl } from "@/lib/api/rts/rtsdocument.client";
import type { Language } from "@/types/language.type";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

type RtsCitizenViewDetailsDrawerProps = {
  application: RtsMisDashboardUserApplicationItem | null;
  language: Language;
  onClose: () => void;
};

type NormalizedStatus = "approved" | "rejected" | "pending";

function normalizeStatus(status: string): NormalizedStatus {
  const normalized = status.toLowerCase();
  if (normalized.includes("approved")) return "approved";
  if (normalized.includes("rejected") || normalized.includes("failed") || normalized.includes("discarded")) {
    return "rejected";
  }
  return "pending";
}

function formatSubmittedDate(value: string, locale: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function RtsCitizenViewDetailsDrawer({
  application,
  language,
  onClose,
}: RtsCitizenViewDetailsDrawerProps) {
  const t = useTranslations("rts.citizenDashboard");
  const tCommon = useTranslations("common");
  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{
    fileUrl: string;
    fileName: string;
    label: string;
  } | null>(null);
  const applicationNumber = application?.applicationNo;

  useEffect(() => {
    if (!applicationNumber) return;

    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);
      setDetail(null);
      try {
        const data = await getApplicationDetailAction(applicationNumber);
        if (!cancelled) setDetail(data ?? null);
      } catch (error) {
        console.error("Failed to fetch citizen application detail:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDetails();
    return () => {
      cancelled = true;
    };
  }, [applicationNumber]);

  if (!application) return null;

  const normalizedStatus = normalizeStatus(application.status);
  const documents = [
    ...(detail?.documents ?? []).map((document, index) => ({
      id: document.documentId || index + 1,
      label: document.documentName || t("documentAttachment"),
      guid: document.documentGuid || "",
      size: document.fileSizeBytes ? `${(document.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : t("attachment"),
    })),
    ...(detail?.answerGroups ?? [])
      .flatMap((group) => group.answers)
      .filter((answer) => answer.documentGuid)
      .map((answer, index) => ({
        id: answer.fieldDefinitionId || index + 1,
        label: answer.label || t("documentAttachment"),
        guid: answer.documentGuid || "",
        size: t("attachment"),
      })),
  ];

  return (
    <>
      <Drawer
        open
        onClose={onClose}
        width="md"
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
              <FileText size={16} />
            </div>
            <div className="space-y-0.5">
              <span className="rounded bg-slate-200/60 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400">
                {application.applicationNo}
              </span>
              <h2 className="text-sm font-black leading-snug text-slate-800">
                {(language === "mr" || language === "hi") && application.serviceNameLocal
                  ? application.serviceNameLocal
                  : application.serviceName}
              </h2>
            </div>
          </div>
        }
        footer={
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {tCommon("buttons.close")}
          </Button>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs font-medium text-slate-400">{t("loadingApplicationDetails")}</div>
        ) : (
          <div className="space-y-5 p-5">
            <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">{t("applicationSummary")}</h4>
              <div className="grid grid-cols-2 gap-3.5 text-xs font-bold text-slate-700">
                <div>
                  <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-500">{t("applicationNumber")}</span>
                  <span className="font-extrabold text-slate-900">{application.applicationNo}</span>
                </div>
                <div>
                  <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-500">{t("submittedDate")}</span>
                  <span className="font-extrabold text-slate-900">{formatSubmittedDate(application.submittedDate, language)}</span>
                </div>
                <div>
                  <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-500">{t("slaTimeline")}</span>
                  <span className="font-extrabold text-blue-700">{application.sla} {t("days")}</span>
                </div>
                <div>
                  <span className="mb-0.5 block text-[9px] font-bold uppercase text-slate-500">{t("status")}</span>
                  {normalizedStatus === "approved" ? (
                    <StatusBadge value activeLabel={t("approved")} />
                  ) : normalizedStatus === "rejected" ? (
                    <StatusBadge value={false} inactiveLabel={t("rejected")} />
                  ) : (
                    <StatusBadge variant="pending" label={t("pending")} />
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
              <h4 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase text-slate-800">
                <Paperclip className="h-4 w-4 text-blue-600" />
                {t("uploadedDocuments", { count: documents.length })}
              </h4>
              {documents.length ? (
                <div className="space-y-2.5">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                      <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-slate-800" title={document.label}>{document.label}</div>
                          <div className="text-[10px] font-medium text-slate-400">{document.size}</div>
                        </div>
                      </div>
                      {document.guid && (
                        <div className="flex shrink-0 items-center gap-2">
                          <ViewButton
                            size="xs"
                            onClick={() => setViewingDoc({
                              fileUrl: getCitizenRtsDocumentViewUrl(document.guid),
                              fileName: `${document.label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
                              label: document.label,
                            })}
                          >
                            {t("view")}
                          </ViewButton>
                          <Button type="button" variant="secondary" size="xs" icon={Download} onClick={() => window.open(getCitizenRtsDocumentDownloadUrl(document.guid), "_blank")}>
                            {t("download")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-xs font-medium text-slate-400">{t("noUploadedDocuments")}</p>
              )}
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800">
                  <GitCommit className="h-4 w-4 text-blue-600" />
                  {t("approvalWorkflow")}
                </h4>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  {t("stages", { count: detail?.approvalStages?.length || 0 })}
                </span>
              </div>
              {detail?.approvalStages?.length ? (
                <ApprovalStagesTimeline
                  stages={detail.approvalStages.map((stage) => ({
                    id: stage.approvalFlowStageId,
                    stageName: stage.stageName,
                    stageOrder: stage.stageOrder,
                    status: stage.status,
                    remark: stage.remark || undefined,
                    userName: stage.userName || undefined,
                    firstName: stage.firstName || undefined,
                    lastName: stage.lastName || undefined,
                    createdDate: stage.createdDate || undefined,
                    assignedRole: stage.assignedToRole || undefined,
                    assignedToName: stage.assignedToName || undefined,
                  }))}
                  completedCount={detail.completedStages || 0}
                  currentStageIndex={(() => {
                    const index = detail.approvalStages.findIndex((stage) => stage.isCurrentStage);
                    return index >= 0 ? index : undefined;
                  })()}
                />
              ) : (
                <p className="py-2 text-center text-xs font-medium text-slate-400">{t("noApprovalStages")}</p>
              )}
            </section>
          </div>
        )}
      </Drawer>

      {viewingDoc && (
        <DocumentViewerModal
          isOpen
          onClose={() => setViewingDoc(null)}
          fileUrl={viewingDoc.fileUrl}
          fileName={viewingDoc.fileName}
          label={viewingDoc.label}
          loadPreviewAsBlob
        />
      )}
    </>
  );
}
