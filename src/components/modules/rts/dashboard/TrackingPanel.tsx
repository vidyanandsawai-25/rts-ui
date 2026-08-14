"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, GitCommit, Paperclip, Search } from "lucide-react";

import { Button, DocumentViewerModal, Input, ViewButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ApprovalStagesTimeline } from "@/components/modules/rts";
import { getApplicationDetailAction, type RtsApplicationDetailData } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import { getCitizenMisApplications } from "@/app/[locale]/service/dashboard/actions";
import {
  getCitizenRtsDocumentDownloadUrl,
  getCitizenRtsDocumentViewUrl,
} from "@/lib/api/rts/rtsdocument.client";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

function normalizedStatus(status: string): "approved" | "rejected" | "pending" {
  const value = status.toLowerCase();
  if (value.includes("approved")) return "approved";
  if (value.includes("rejected") || value.includes("failed") || value.includes("discarded")) return "rejected";
  return "pending";
}

function formatSubmittedDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function TrackingPanel() {
  const [applications, setApplications] = useState<RtsMisDashboardUserApplicationItem[]>([]);
  const [applicationNo, setApplicationNo] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<RtsMisDashboardUserApplicationItem | null>(null);
  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingDocument, setViewingDocument] = useState<{ fileUrl: string; fileName: string; label: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCitizenMisApplications()
      .then((items) => {
        if (!cancelled) setApplications(items);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load your applications.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const documents = useMemo(
    () => [
      ...(detail?.documents ?? []).map((document, index) => ({
        id: document.documentId || index + 1,
        label: document.documentName || "Document Attachment",
        guid: document.documentGuid || "",
        size: document.fileSizeBytes ? `${(document.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : "Attachment",
      })),
      ...(detail?.answerGroups ?? [])
        .flatMap((group) => group.answers)
        .filter((answer) => answer.documentGuid)
        .map((answer, index) => ({
          id: answer.fieldDefinitionId || index + 1,
          label: answer.label || "Document Attachment",
          guid: answer.documentGuid || "",
          size: "Attachment",
        })),
    ],
    [detail]
  );

  const openApplication = async (candidate: RtsMisDashboardUserApplicationItem) => {
    setApplicationNo(candidate.applicationNo);
    setSelectedApplication(candidate);
    setDetail(null);
    setError("");
    setLoading(true);

    try {
      const response = await getApplicationDetailAction(candidate.applicationNo);
      if (!response) {
        setError("Application details are unavailable.");
        return;
      }
      setDetail(response);
    } catch {
      setError("Application details are unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const trackApplication = () => {
    const match = applications.find((application) => application.applicationNo.toLowerCase() === applicationNo.trim().toLowerCase());
    if (!match) {
      setSelectedApplication(null);
      setDetail(null);
      setError("Application not found in your applications.");
      return;
    }
    void openApplication(match);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={applicationNo}
          onChange={(event) => setApplicationNo(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && trackApplication()}
          placeholder="Enter application number"
          className="flex-1"
        />
        <Button type="button" onClick={trackApplication} aria-label="Track application">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {applications.length > 0 && !selectedApplication && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          {applications.map((application) => (
            <button
              key={application.applicationNo}
              type="button"
              onClick={() => void openApplication(application)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-800">{application.serviceName}</span>
                <span className="block text-[11px] font-medium text-slate-500">{application.applicationNo}</span>
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-slate-500">{application.status}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</p>}
      {loading && <p className="py-8 text-center text-xs font-medium text-slate-500">Loading application details...</p>}

      {selectedApplication && detail && !loading && (
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">Application Summary</h4>
            <div className="mt-3 grid grid-cols-2 gap-3.5 text-xs font-bold text-slate-700">
              <div><span className="block text-[9px] font-bold uppercase text-slate-500">Application Number</span>{selectedApplication.applicationNo}</div>
              <div><span className="block text-[9px] font-bold uppercase text-slate-500">Submitted Date</span>{formatSubmittedDate(selectedApplication.submittedDate)}</div>
              <div><span className="block text-[9px] font-bold uppercase text-slate-500">SLA Timeline</span><span className="text-blue-700">{selectedApplication.sla} Days</span></div>
              <div>
                <span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">Status</span>
                {normalizedStatus(selectedApplication.status) === "approved" ? <StatusBadge value activeLabel="Approved" /> : normalizedStatus(selectedApplication.status) === "rejected" ? <StatusBadge value={false} inactiveLabel="Rejected" /> : <StatusBadge variant="pending" label="Pending" />}
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
            <h4 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase text-slate-800"><Paperclip className="h-4 w-4 text-blue-600" />Submitted Documents ({documents.length})</h4>
            {documents.length ? documents.map((document) => (
              <div key={`${document.id}-${document.guid}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                <div className="flex min-w-0 items-center gap-3"><FileText className="h-4 w-4 shrink-0 text-blue-600" /><span className="truncate font-bold text-slate-800">{document.label}</span></div>
                {document.guid && <div className="flex shrink-0 gap-2"><ViewButton size="xs" onClick={() => setViewingDocument({ fileUrl: getCitizenRtsDocumentViewUrl(document.guid), fileName: `${document.label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`, label: document.label })}>View</ViewButton><Button type="button" size="xs" variant="secondary" icon={Download} onClick={() => window.open(getCitizenRtsDocumentDownloadUrl(document.guid), "_blank")}>Download</Button></div>}
              </div>
            )) : <p className="py-2 text-center text-xs font-medium text-slate-400">No uploaded document attachments found for this application.</p>}
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
            <h4 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase text-slate-800"><GitCommit className="h-4 w-4 text-blue-600" />Approval Workflow Timeline</h4>
            {detail.approvalStages?.length ? <ApprovalStagesTimeline stages={detail.approvalStages.map((stage) => ({ id: stage.approvalFlowStageId, stageName: stage.stageName, stageOrder: stage.stageOrder, status: stage.status, remark: stage.remark || undefined, userName: stage.userName || undefined, firstName: stage.firstName || undefined, lastName: stage.lastName || undefined, createdDate: stage.createdDate || undefined }))} completedCount={detail.completedStages || 0} currentStageIndex={detail.approvalStages.findIndex((stage) => stage.isCurrentStage)} /> : <p className="py-2 text-center text-xs font-medium text-slate-400">No approval workflow stages recorded for this application.</p>}
          </section>
        </div>
      )}

      {viewingDocument && <DocumentViewerModal isOpen onClose={() => setViewingDocument(null)} fileUrl={viewingDocument.fileUrl} fileName={viewingDocument.fileName} label={viewingDocument.label} loadPreviewAsBlob />}
    </div>
  );
}
