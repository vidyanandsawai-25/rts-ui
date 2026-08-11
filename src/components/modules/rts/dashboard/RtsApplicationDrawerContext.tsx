'use client';

import {
  Download,
  Eye,
  FileText,
  GitCommit,
  Paperclip,
  Shield,
  UserCheck,
} from 'lucide-react';

import { ApprovalStagesTimeline } from '@/components/modules/rts';
import { Button, ViewButton } from '@/components/common';
import { Badge, Drawer } from '@/components/common';
import { useTranslations } from 'next-intl';
import type { RtsApplicationProcessData } from '@/app/[locale]/rts/dashboard/rts-applications/actions';

import { getDocumentDownloadUrl } from '@/lib/api/rts/rts-document-utils';

export interface RtsApplicationViewDrawerRecord {
  appId: string;
  citizenName: string;
  submittedDate: string;
  slaLimit: number;
  serviceName: string;
  departmentName: string;
  applicationStatus: string;
}

interface ApplicationDrawerContentProps {
  record: RtsApplicationViewDrawerRecord;
  data: RtsApplicationProcessData | null;
  onOpenFullDetails?: () => void;
  onOpenDocument: (documentGuid: string) => void;
}

interface RtsApplicationViewDrawerProps {
  open: boolean;
  record: RtsApplicationViewDrawerRecord | null;
  data: RtsApplicationProcessData | null;
  onClose: () => void;
  onOpenFullDetails?: () => void;
  onOpenDocument: (documentGuid: string) => void;
}

interface DisplayDocument {
  id: string | number;
  label: string;
  guid: string;
  fileName: string;
  fileSize: string;
  downloadUrl: string;
}

function ApplicationDrawerContent({ record, data, onOpenFullDetails, onOpenDocument }: ApplicationDrawerContentProps) {
  const detail = data?.details ?? null;
  const stages = data?.stages ?? null;
  const loading = !data;

  // Real document list from viewDetails.documents or answerGroups
  const rawDocs = [
    ...(detail?.documents ?? []).filter((document) => document.isUploaded && document.documentGuid).map((d, idx) => ({
      id: d.documentId || idx + 1,
      label: d.documentName || 'Document',
      guid: d.documentGuid || '',
      size: d.fileSizeBytes ? `${(d.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Attachment',
    })),
  ];

  const uniqueGuids = new Set<string>();
  const documents: DisplayDocument[] = [];
  for (const doc of rawDocs) {
    if (doc.guid && !uniqueGuids.has(doc.guid)) {
      uniqueGuids.add(doc.guid);
      documents.push({
        id: doc.id,
        label: doc.label,
        guid: doc.guid,
        fileName: `${doc.label.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: doc.size,
        downloadUrl: getDocumentDownloadUrl(doc.guid),
      });
    }
  }

  const handleDownload = (doc: DisplayDocument) => {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50/50">
      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
        {/* Basic Common Application Details */}
        <section className="rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase border-b border-slate-100 pb-2">
            <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
            Application Overview & SLA Status
          </h3>
          <div className="grid grid-cols-2 gap-3.5 text-xs font-medium">
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Application No</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block" title={record.appId}>
                {record.appId}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Applicant Name</span>
              <span className="font-bold text-slate-800 truncate block" title={record.citizenName}>
                {record.citizenName}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Submitted Date</span>
              <span className="font-bold text-slate-800">{record.submittedDate}</span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">SLA Timeline</span>
              <span className="font-extrabold text-blue-700">{record.slaLimit} Days</span>
            </div>
          </div>
        </section>

        {/* Uploaded Documents Section */}
        <section className="rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
              Uploaded Documents & Attachments
            </h3>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {documents.length} Files Attached
            </span>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs font-medium text-slate-400">
              Loading documents...
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[13px] font-bold text-slate-800 truncate block"
                        title={doc.label}
                      >
                        {doc.label}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 truncate">
                        {doc.fileName} • {doc.fileSize}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <ViewButton
                      size="xs"
                      onClick={() => onOpenDocument(doc.guid)}
                      aria-label={`View ${doc.label}`}
                      title={`View ${doc.label}`}
                      className="rounded-lg px-3 text-[11px]"
                    >
                      View
                    </ViewButton>

                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => handleDownload(doc)}
                      aria-label={`Download ${doc.label}`}
                      title={`Download ${doc.label}`}
                      className="rounded-lg px-3 text-[11px]"
                      icon={Download}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-medium text-slate-400">
              No uploaded documents attached to this application.
            </div>
          )}
        </section>

        {/* Approval Workflow Stages Timeline */}
        <section className="rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <GitCommit className="size-5 text-blue-600 shrink-0" />
              Approval Workflow Timeline
            </h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {stages?.approvalStages.length || 0} Stages Recorded
            </span>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs font-medium text-slate-400">
              Loading workflow stages...
            </div>
          ) : stages?.approvalStages && stages.approvalStages.length > 0 ? (
            <ApprovalStagesTimeline
              stages={stages.approvalStages.map((stg) => ({
                id: stg.approvalFlowStageId,
                stageName: stg.stageName,
                stageOrder: stg.stageOrder,
                status: stg.status,
                remark: stg.remark || undefined,
                assignedToName: stg.assignedToName || undefined,
              }))}
              completedCount={stages.completedStages || 0}
              currentStageIndex={(() => {
                const index = stages.approvalStages.findIndex((stage) => stage.isCurrentStage);
                return index >= 0 ? index : undefined;
              })()}
            />
          ) : (
            <div className="py-6 text-center text-xs font-medium text-slate-400">
              No approval workflow stages recorded for this application.
            </div>
          )}
        </section>

        {/* ================= SECTION 3: FULL DETAILS & DECISION ACTION BANNER ================= */}
        {onOpenFullDetails && (
          <section className="rounded-xl border border-blue-200/90 bg-blue-50/80 p-4.5 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-950">
              <Shield className="h-4.5 w-4.5 text-blue-600 shrink-0" />
              <h4 className="text-xs font-extrabold uppercase tracking-wide">
                Need Full Field Values & Officer Decision Workflow?
              </h4>
            </div>
            <p className="text-[11.5px] text-blue-800/90 font-medium leading-relaxed">
              Open complete application form fields, document verification checklist, and decision controls.
            </p>
            <Button
              variant="primary"
              icon={Eye}
              onClick={onOpenFullDetails}
              className="w-full justify-center py-2.5 text-xs font-bold rounded-xl shadow-sm"
            >
              View Complete Application Details & Process
            </Button>
          </section>
        )}
      </div>

    </div>
  );
}

function statusBadgeVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' {
  const normalized = status.toLowerCase();
  if (normalized === 'approved') return 'success';
  if (normalized === 'rejected') return 'destructive';
  if (normalized === 'returned' || normalized === 'reverted') return 'warning';
  return 'secondary';
}

export default function RtsApplicationViewDrawer({
  open,
  record,
  data,
  onClose,
  onOpenFullDetails,
  onOpenDocument,
}: RtsApplicationViewDrawerProps) {
  const tCommon = useTranslations('common');

  if (!record) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      hideHeader
      bodyClassName="relative overflow-hidden"
      title={
        <div className="flex w-full items-center justify-between pr-2 border-b-2 border-blue-200">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold text-slate-800">{record.serviceName}</div>
            </div>
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-3">
            <Badge variant={statusBadgeVariant(record.applicationStatus)}>{record.applicationStatus}</Badge>
          </div>
        </div>
      }
      footer={
        <Button variant="secondary" onClick={onClose} size="sm" className="rounded-xl text-xs font-bold">
          {tCommon('buttons.close')}
        </Button>
      }
    >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143D7D] px-5 py-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold">{record.serviceName}</div>
              <div className="truncate text-[11px] font-semibold text-blue-100">{record.departmentName}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge variant={statusBadgeVariant(record.applicationStatus)}>{record.applicationStatus}</Badge>
            {/* <button
              type="button"
              onClick={onClose}
              aria-label={tCommon('buttons.close')}
              title={tCommon('buttons.close')}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button> */}
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <ApplicationDrawerContent
            record={record}
            data={data}
            onOpenFullDetails={onOpenFullDetails}
            onOpenDocument={onOpenDocument}
          />
        </div>
      </div>
    </Drawer>
  );
}
