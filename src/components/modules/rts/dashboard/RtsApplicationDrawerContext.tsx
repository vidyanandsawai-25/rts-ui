'use client';

import { Check, Download, Eye, FileText, LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Drawer, StatusBadge, ToastContainer } from '@/components/common';
import { Button } from '@/components/common/ActionButton';
import { useTranslations } from 'next-intl';
import type { RtsApplicationApprovalDetails } from '@/types/rts/rtsapplicationapprovel.types';
import { RtsApplicationDocumentPreview } from './RtsApplicationDocumentPreview';

interface DrawerRecord {
  applicationId: number;
  applicationNo: string;
  serviceName: string | null;
  departmentName: string | null;
  submittedDate: string;
  slaLimit: string | number | null;
  applicationStatus: string;
}

interface Props {
  open: boolean;
  record: DrawerRecord;
  detail: RtsApplicationApprovalDetails | null;
  onClose: () => void;
}

interface ToastNotification {
  id: string;
  type: 'error' | 'info';
  message: string;
}

interface DocumentPreview {
  documentGuid: string;
  documentName: string;
  fileUrl: string;
  mimeType: string;
}

function getDocumentUrl(documentGuid: string, action: 'view' | 'download'): string {
  return `/api/rts/documents/${encodeURIComponent(documentGuid)}/${action}`;
}

function getDownloadFileName(contentDisposition: string | null, fallbackName: string): string {
  const encodedMatch = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const plainMatch = contentDisposition?.match(/filename\s*=\s*"?([^";]+)"?/i);
  let candidate = plainMatch?.[1] ?? fallbackName;

  if (encodedMatch) {
    try {
      candidate = decodeURIComponent(encodedMatch[1]);
    } catch {
      candidate = encodedMatch[1];
    }
  }

  return candidate.replace(/[\\/:*?"<>|]/g, '_').trim() || 'document';
}

export default function ApplicationDrawerContent({ open, record, detail, onClose }: Props) {
  const t = useTranslations('rts');
  const tCommon = useTranslations('common');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeDocumentAction, setActiveDocumentAction] = useState<string | null>(null);
  const [preview, setPreview] = useState<DocumentPreview | null>(null);

  const normalizedStatus = record.applicationStatus.trim().toLowerCase();

  const addToast = (type: ToastNotification['type'], message: string) => {
    setToasts((current) => [
      ...current.slice(-2),
      { id: `${Date.now()}-${Math.random()}`, type, message },
    ]);
  };

  const closePreview = () => {
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.fileUrl);
    };
  }, [preview]);

  const handleDocumentDownload = async (documentGuid: string, documentName: string) => {
    const actionKey = `${documentGuid}:download`;
    setActiveDocumentAction(actionKey);

    try {
      const response = await fetch(getDocumentUrl(documentGuid, 'download'));
      if (!response.ok) throw new Error('Document download failed');

      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = getDownloadFileName(response.headers.get('content-disposition'), documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 0);
    } catch {
      addToast('error', t('applicationDashboard.drawer.downloadFailed'));
    } finally {
      setActiveDocumentAction(null);
    }
  };

  const handleDocumentView = async (documentGuid: string, documentName: string) => {
    const actionKey = `${documentGuid}:view`;
    setActiveDocumentAction(actionKey);

    try {
      const response = await fetch(getDocumentUrl(documentGuid, 'view'));
      if (!response.ok) throw new Error('Document view failed');

      const blob = await response.blob();
      setPreview({
        documentGuid,
        documentName,
        fileUrl: URL.createObjectURL(blob),
        mimeType: blob.type || response.headers.get('content-type') || 'application/octet-stream',
      });
    } catch {
      addToast('error', t('applicationDashboard.drawer.previewFailed'));
    } finally {
      setActiveDocumentAction(null);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      hideHeader
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          {tCommon('buttons.close')}
        </Button>
      }
    >
      <div className="min-h-full">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-blue-200 bg-[#143D7D] px-5 py-2.5 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-white">
                {record.serviceName ?? t('applicationDashboard.table.na')}
              </div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-blue-100">
                {record.departmentName ?? t('applicationDashboard.drawer.notAvailable')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon('buttons.close')}
            className="ml-3 flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-5 p-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              {t('applicationDashboard.drawer.applicationDetails')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <div className="mb-0.5 text-[9px] font-bold uppercase text-slate-500">
                {t('applicationDashboard.table.applicationNo')}
              </div>
              <div className="text-xs font-extrabold text-slate-900">{record.applicationNo}</div>
            </div>

            <div>
              <div className="mb-0.5 text-[9px] font-bold uppercase text-slate-500">
                {t('applicationDashboard.drawer.submittedDate')}
              </div>
              <div className="text-xs font-extrabold text-slate-900">{record.submittedDate}</div>
            </div>

            <div>
              <div className="mb-0.5 text-[9px] font-bold uppercase text-slate-500">
                {t('applicationDashboard.drawer.slaTimeline')}
              </div>
              <div className="text-xs font-extrabold text-blue-700">
                {record.slaLimit ?? t('applicationDashboard.drawer.notAvailable')}
              </div>
            </div>

            <div>
              <div className="mb-0.5 text-[9px] font-bold uppercase text-slate-500">
                {t('applicationDashboard.drawer.status')}
              </div>
              {normalizedStatus === 'pending' ? (
                <StatusBadge variant="pending" label={record.applicationStatus} className="px-2 py-0.5 text-[10px]" />
              ) : (
                <StatusBadge
                  variant="info"
                  label={record.applicationStatus || t('applicationDashboard.drawer.notAvailable')}
                  className="rounded-md px-2 py-0.5 text-[10px]"
                />
              )}
            </div>

          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
              {t('applicationDashboard.drawer.approvalStages')}
            </h3>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
              {detail
                ? `${detail.completedStages} of ${detail.totalApprovalStages} Done`
                : t('applicationDashboard.drawer.stageProgress')}
            </span>
          </div>

          {detail?.approvalStages.length ? (
            <div className="space-y-2">
              {detail.approvalStages.map((stage, index) => {
              const normalizedStageStatus = stage.status.trim().toLowerCase();
              const isComplete = normalizedStageStatus === 'completed' || normalizedStageStatus === 'approved';
              const isInProgress = stage.isCurrentStage && !isComplete;
              const tone = isComplete
                ? 'border-emerald-200 bg-emerald-50/60'
                : isInProgress
                  ? 'border-amber-300 bg-amber-50/60'
                  : 'border-slate-200 bg-slate-50';
              const indicator = isComplete
                ? 'bg-emerald-500 text-white'
                : isInProgress
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 text-slate-500';

              return (
                <div key={stage.approvalFlowStageId} className="relative flex gap-3">
                  <div className="flex w-5 shrink-0 flex-col items-center">
                    <span className={`z-10 flex size-5 items-center justify-center rounded-full text-[10px] font-black ${indicator}`}>
                      {isComplete ? <Check className="size-3" strokeWidth={3} /> : stage.stageOrder || index + 1}
                    </span>
                    {index < detail.approvalStages.length - 1 && <span className="min-h-10 flex-1 mt-2 w-px bg-slate-200" />}
                  </div>
                  <div className={`mb-0.5 min-w-0 flex-1 rounded-lg border px-3 py-2 ${tone}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-extrabold text-slate-800">
                          {stage.stageName}
                        </h4>
                        <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-slate-500">
                          {stage.remark || (isInProgress ? 'Application is awaiting action at this stage.' : stage.status)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-700'
                            : isInProgress
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isInProgress ? 'In Progress' : stage.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] font-medium text-slate-400">
              {t('applicationDashboard.drawer.noApprovalStages')}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-800">
              {t('applicationDashboard.drawer.submittedDocuments')}
            </h3>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              {t('applicationDashboard.drawer.submittedDocumentsDescription')}
            </p>
          </div>

          {detail?.documents.length ? (
            <div className="space-y-2">
              {detail.documents.map((doc) => (
                <div
                  key={doc.fieldDefinitionId}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-extrabold text-slate-800">{doc.documentName}</div>
                    <div className="mt-0.5 text-[10px] font-medium text-slate-400">
                      {doc.isUploaded
                        ? t('applicationDashboard.drawer.documentAttached')
                        : doc.isRequired
                          ? 'Missing - required for approval'
                          : t('applicationDashboard.drawer.notAvailable')}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      disabled={!doc.isUploaded || !doc.documentGuid || activeDocumentAction === `${doc.documentGuid}:view`}
                      aria-label={
                        doc.isUploaded && doc.documentGuid
                          ? t('applicationDashboard.drawer.viewDocument', { name: doc.documentName })
                          : t('applicationDashboard.drawer.previewUnavailable')
                      }
                      onClick={() => doc.documentGuid && handleDocumentView(doc.documentGuid, doc.documentName)}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:opacity-60"
                    >
                      {activeDocumentAction === `${doc.documentGuid}:view` ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={!doc.isUploaded || !doc.documentGuid || activeDocumentAction === `${doc.documentGuid}:download`}
                      aria-label={
                        doc.isUploaded && doc.documentGuid
                          ? t('applicationDashboard.drawer.downloadDocument', { name: doc.documentName })
                          : t('applicationDashboard.drawer.downloadUnavailable')
                      }
                      onClick={() => doc.documentGuid && handleDocumentDownload(doc.documentGuid, doc.documentName)}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:opacity-60"
                    >
                      {activeDocumentAction === `${doc.documentGuid}:download` ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] font-medium text-slate-400">
              {t('applicationDashboard.drawer.noSubmittedDocuments')}
            </div>
          )}
        </section>
        </div>
      </div>
      {preview && (
        <RtsApplicationDocumentPreview
          documentName={preview.documentName}
          fileUrl={preview.fileUrl}
          mimeType={preview.mimeType}
          isDownloading={activeDocumentAction === `${preview.documentGuid}:download`}
          onClose={closePreview}
          onDownload={() => handleDocumentDownload(preview.documentGuid, preview.documentName)}
        />
      )}
      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </Drawer>
  );
}
