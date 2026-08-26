'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FileCheck2,
  FileText,
  GitCommit,
  IndianRupee,
  LoaderCircle,
  Paperclip,
  Printer,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ApprovalStagesTimeline } from '@/components/modules/rts';
import RtsApplicationNoteSheetModal from '@/components/modules/rts/dashboard/RtsApplicationNoteSheetModal';
import { PaymentReceiptModal } from '@/components/modules/rts/citizen/PaymentReceiptModal';
import RtsCertificateApprovalModal from '@/components/modules/rts/dashboard/RtsCertificateApprovalModal';
import PrintableCertificateModal from '@/components/modules/rts/citizen/PrintableCertificateModal';
import { Badge, Button, Drawer, Input, Label, ViewButton } from '@/components/common';
import type { RtsApplicationFullDetailData } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import { getPaymentReceiptAction } from '@/app/[locale]/service/payment/actions';
import { getAdminRtsDocumentDownloadUrl, getAdminRtsDocumentViewUrl } from '@/lib/api/rts/rtsdocument.client';
import { getApplicationFieldDisplayLabel } from '@/lib/utils/rts/application-field-label';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';

export interface RtsApplicationFullDetailRecord {
  applicationId: number;
  appId: string;
  citizenName?: string;
  submittedDate?: string;
  serviceName: string;
  departmentName?: string;
  applicationStatus: string;
}

interface RtsApplicationFullDetailViewProps {
  open: boolean;
  record: RtsApplicationFullDetailRecord | null;
  data: RtsApplicationFullDetailData | null;
  onClose: () => void;
  onOpenDocument: (documentGuid: string) => void;
}

interface DisplayDocument {
  id: number;
  name: string;
  guid: string;
  isRequired: boolean;
  isUploaded: boolean;
}

function isDeclarationGroup(title: string): boolean {
  return title.trim().toLowerCase().includes('declaration');
}

function statusBadgeVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' {
  const normalized = status.toLowerCase();
  if (normalized.includes('approv') || normalized.includes('complete')) return 'success';
  if (normalized.includes('reject')) return 'destructive';
  if (normalized.includes('return') || normalized.includes('revert')) return 'warning';
  return 'secondary';
}

export default function RtsApplicationFullDetailView({
  open,
  record,
  data,
  onClose,
  onOpenDocument,
}: RtsApplicationFullDetailViewProps) {
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [documentPreviewType, setDocumentPreviewType] = useState<'image' | 'file' | null>(null);
  const [documentPreviewError, setDocumentPreviewError] = useState<string | null>(null);
  const [isDocumentPreviewLoading, setIsDocumentPreviewLoading] = useState(false);
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [isPrintCertModalOpen, setIsPrintCertModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const loading = Boolean(open && record && !data);
  const fieldGroups = useMemo(() => {
    const groups = new Map<string, NonNullable<RtsApplicationFullDetailData['details']>['applicationDetails']>();
    for (const field of data?.details?.applicationDetails ?? []) {
      const title = field.fieldGroup || t('generalDetails');
      const fields = groups.get(title) ?? [];
      fields.push(field);
      groups.set(title, fields);
    }

    return Array.from(groups.entries()).map(([title, fields]) => ({
      title,
      fields: [...fields].sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  }, [data?.details?.applicationDetails, t]);

  const documents = useMemo<DisplayDocument[]>(
    () =>
      (data?.details?.documents ?? []).map((document, index) => ({
        id: document.fieldDefinitionId ?? document.documentId ?? index + 1,
        name: document.documentName || t('documentFallback'),
        guid: document.documentGuid || '',
        isRequired: Boolean(document.isRequired),
        isUploaded: Boolean(document.isUploaded && document.documentGuid),
      })),
    [data?.details?.documents, t]
  );

  const activeDocument = documents[Math.min(activeDocumentIndex, Math.max(documents.length - 1, 0))] ?? null;
  const stages = data?.stages ?? null;
  const payment = data?.payment ?? null;
  const currentStageIndex = stages?.approvalStages.findIndex((stage) => stage.isCurrentStage) ?? -1;
  const isFreeService = Boolean(payment && (!payment.isFeeRequired || payment.requiredFee <= 0));
  const isPaymentSuccessful = payment?.paymentStatus.trim().toLowerCase() === 'success';
  const canViewReceipt = Boolean(isPaymentSuccessful && payment?.receiptNo);

  useEffect(() => {
    setActiveDocumentIndex(0);
    setOpenGroups({});
  }, [record?.appId]);

  useEffect(() => {
    if (!open || !activeDocument?.isUploaded || !activeDocument.guid) {
      setDocumentPreviewUrl(null);
      setDocumentPreviewType(null);
      setDocumentPreviewError(null);
      setIsDocumentPreviewLoading(false);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;
    setDocumentPreviewUrl(null);
    setDocumentPreviewType(null);
    setDocumentPreviewError(null);
    setIsDocumentPreviewLoading(true);

    void (async () => {
      try {
        const response = await fetch(getAdminRtsDocumentViewUrl(activeDocument.guid), { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Document preview request failed.');

        const blob = await response.blob();
        if (!blob.size) throw new Error('The document preview is empty.');
        if (!active) return;

        if (blob.type.toLowerCase().startsWith('image/')) {
          objectUrl = URL.createObjectURL(blob);
          setDocumentPreviewUrl(objectUrl);
          setDocumentPreviewType('image');
        } else {
          setDocumentPreviewType('file');
        }
      } catch {
        if (active) setDocumentPreviewError(t('previewUnavailable'));
      } finally {
        if (active) setIsDocumentPreviewLoading(false);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeDocument?.guid, activeDocument?.isUploaded, open, t]);

  if (!record) return null;

  const isApproved = record.applicationStatus?.toLowerCase().includes('approv');
  const expandAll = () => setOpenGroups(Object.fromEntries(fieldGroups.map((group) => [group.title, true])));
  const collapseAll = () => setOpenGroups(Object.fromEntries(fieldGroups.map((group) => [group.title, false])));

  const handleViewReceipt = async () => {
    setIsReceiptLoading(true);
    try {
      const result = await getPaymentReceiptAction(record.applicationId);
      if (result.success && result.data) {
        setReceiptModalData(result.data);
      } else {
        toast.error(t('receiptUnavailable'));
      }
    } catch {
      toast.error(t('receiptUnavailable'));
    } finally {
      setIsReceiptLoading(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width="xl"
        hideHeader
        bodyClassName="relative overflow-hidden"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={FileText}
                size="xs"
                onClick={() => setIsNoteSheetOpen(true)}
                className="rounded-lg px-3 text-xs font-bold"
              >
                {t('viewNoteSheet')}
              </Button>
              {canViewReceipt && (
                <Button
                  type="button"
                  variant="secondary"
                  icon={Printer}
                  size="xs"
                  disabled={isReceiptLoading}
                  onClick={handleViewReceipt}
                  className="rounded-lg border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  {t('viewReceipt')}
                </Button>
              )}
              {isApproved && (
                <Button
                  type="button"
                  icon={FileCheck2}
                  size="xs"
                  onClick={() => setIsPrintCertModalOpen(true)}
                  className="rounded-lg px-3 text-xs font-bold bg-[#4b70a6] hover:bg-[#3d5a8a] text-white"
                >
                  {t('viewCertificate')}
                </Button>
              )}
            </div>
            <Button variant="secondary" onClick={onClose} size="xs" className="rounded-lg px-5 text-xs font-bold">
              {tCommon('buttons.close')}
            </Button>
          </div>
        }
      >
      <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-slate-50">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-blue-200 bg-[#143D7D] px-5 py-3 text-white shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold">{t('fullDetailViewTitle')}</p>
              <p className="truncate text-[11px] font-semibold text-blue-100"><u>{t('applicationNumber')}</u> : {record.appId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPrintCertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                  <FileCheck2 className="h-4 w-4" />
                  {t('viewAndPrintCertificate')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-lg text-xs font-bold transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('editCertificate')}
                </button>
              </>
            )}
            {record.applicationStatus && <Badge variant={statusBadgeVariant(record.applicationStatus)}>{record.applicationStatus}</Badge>}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 xl:overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">{t('loading')}</div>
          ) : (
            <div className="grid min-h-0 grid-cols-1 gap-2 xl:h-full xl:items-stretch xl:grid-cols-[28rem_minmax(0,1fr)]">
              <aside className="xl:h-full xl:min-h-0 xl:self-stretch">
                <div className="space-y-2 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-1">
                  <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-blue-600" />
                        <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('documents')}</h2>
                      </div>
                      {activeDocument?.isUploaded && (
                        <div className="flex shrink-0 gap-1.5">
                          <ViewButton size="xs" onClick={() => onOpenDocument(activeDocument.guid)} className="rounded-lg px-2 text-[11px]">{t('view')}</ViewButton>
                          <Button type="button" size="xs" variant="secondary" icon={Download} onClick={() => window.open(getAdminRtsDocumentDownloadUrl(activeDocument.guid), '_blank')} className="rounded-lg px-2 text-[11px]">{t('download')}</Button>
                        </div>
                      )}
                    </div>
                    {data?.errors.details ? (
                      <p className="text-xs font-medium text-rose-600">{t('detailsUnavailable')}</p>
                    ) : documents.length === 0 ? (
                      <p className="text-xs font-medium text-slate-500">{t('noDocuments')}</p>
                    ) : activeDocument ? (
                      <div className="space-y-2">
                        <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-3">
                          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-white/80">
                            {isDocumentPreviewLoading ? <LoaderCircle className="h-7 w-7 animate-spin text-blue-500" /> : documentPreviewType === 'image' && documentPreviewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={documentPreviewUrl} alt={activeDocument.name} className="h-45 w-full object-contain" />
                            ) : documentPreviewError ? <p className="px-4 text-center text-[11px] font-semibold text-slate-500">{documentPreviewError}</p> : (
                              <div className="flex flex-col items-center gap-1.5 px-4 text-center">
                                <FileText className="h-8 w-8 text-rose-500" />
                                <p className="line-clamp-2 text-[11px] font-bold text-slate-600">{activeDocument.name}</p>
                              </div>
                            )}
                          </div>
                          {documents.length > 1 && (
                            <>
                              <button type="button" aria-label={t('previousDocument')} onClick={() => setActiveDocumentIndex((index) => (index - 1 + documents.length) % documents.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-blue-600 shadow-sm hover:bg-blue-50"><ChevronLeft className="h-4 w-4" /></button>
                              <button type="button" aria-label={t('nextDocument')} onClick={() => setActiveDocumentIndex((index) => (index + 1) % documents.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-blue-600 shadow-sm hover:bg-blue-50"><ChevronRight className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-1">
                          <p className="truncate text-xs font-extrabold text-slate-800">{activeDocument.name}</p>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{t('documentPosition', { current: activeDocumentIndex + 1, total: documents.length })}</span>
                        </div>
                        <p className={`text-[11px] font-bold ${activeDocument.isUploaded ? 'text-emerald-600' : activeDocument.isRequired ? 'text-rose-600' : 'text-slate-500'}`}>
                          {activeDocument.isUploaded ? t('uploaded') : activeDocument.isRequired ? t('requiredMissing') : t('optionalMissing')}
                        </p>
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <GitCommit className="size-5 shrink-0 text-blue-600" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('approvalStages')}</h2>
                    </div>
                    {data?.errors.stages ? <p className="text-xs font-medium text-rose-600">{t('stagesUnavailable')}</p> : !stages?.approvalStages.length ? <p className="text-xs font-medium text-slate-500">{t('noStages')}</p> : (
                      <ApprovalStagesTimeline
                        stages={stages.approvalStages.map((stage) => ({
                          id: stage.approvalFlowStageId,
                          stageName: stage.stageName,
                          stageOrder: stage.stageOrder,
                          status: stage.status,
                          remark: stage.remark,
                          userName: stage.userName,
                          firstName: stage.firstName,
                          lastName: stage.lastName,
                          createdDate: stage.createdDate,
                        }))}
                        completedCount={stages.completedStages}
                        currentStageIndex={currentStageIndex >= 0 ? currentStageIndex : undefined}
                      />
                    )}
                  </section>

                  {payment && (
                    isFreeService ? (
                      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-xs font-extrabold text-emerald-900">{t('freeService')}</p>
                            <p className="mt-1 text-[11px] font-medium text-emerald-700">{t('noGovernmentFeeRequired')}</p>
                          </div>
                        </div>
                      </section>
                    ) : isPaymentSuccessful ? (
                      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-emerald-900">{t('governmentFeePaid', { amount: payment.requiredFee })}</p>
                            {payment.receiptNo && <p className="mt-1 truncate text-[11px] font-medium text-emerald-700">{t('receiptNumber', { receiptNo: payment.receiptNo })}</p>}
                            <p className="mt-1 text-[11px] font-medium text-emerald-700">{t('officialReceiptAvailable')}</p>
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <IndianRupee className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-xs font-extrabold text-amber-900">{t('governmentFeePending', { amount: payment.requiredFee })}</p>
                            <p className="mt-1 text-[11px] font-medium text-amber-700">{t('paymentRequiredToProceed')}</p>
                          </div>
                        </div>
                      </section>
                    )
                  )}
                </div>
              </aside>

              <section className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm xl:flex xl:h-full xl:min-h-0 xl:self-stretch xl:flex-col">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">{t('applicationDetails')}</h2></div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <button type="button" onClick={expandAll} className="hover:text-blue-900">{t('expandAll')}</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" onClick={collapseAll} className="hover:text-blue-900">{t('collapseAll')}</button>
                  </div>
                </div>
                <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
                  {data?.errors.details ? <p className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">{t('detailsUnavailable')}</p> : fieldGroups.length === 0 ? <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-medium text-slate-500">{t('noDetails')}</p> : (
                    <div className="space-y-3">
                      {fieldGroups.map((group) => {
                        const isOpen = openGroups[group.title] ?? true;
                        const declarationGroup = isDeclarationGroup(group.title);
                        return (
                          <article key={group.title} className="overflow-hidden rounded-xl border border-slate-200">
                            <button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.title]: !isOpen }))} className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-blue-50/60">
                              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-900">{group.title} <span className="ml-1 text-[10px] text-blue-600">({t('fieldCount', { count: group.fields.length })})</span></span>
                              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                            </button>
                            {isOpen && (declarationGroup ? (
                              <div className="p-4">
                                {group.fields.map((field) => <div key={field.fieldDefinitionId} className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" /><div><p className="text-sm font-semibold leading-relaxed text-slate-800">{getApplicationFieldDisplayLabel(field, locale, t('declarationAccepted'))}</p><p className="mt-1 text-xs font-bold text-emerald-700">{t('acceptedByApplicant')}</p></div></div></div>)}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                {group.fields.map((field) => <div key={field.fieldDefinitionId} className="min-w-0"><Label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-600">{getApplicationFieldDisplayLabel(field, locale, t('documentFallback'))}</Label><Input fullWidth value={field.value ?? ''} disabled className="h-9 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-700 disabled:opacity-100" /></div>)}
                              </div>
                            ))}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </Drawer>

      <RtsApplicationNoteSheetModal
        isOpen={isNoteSheetOpen}
        onClose={() => setIsNoteSheetOpen(false)}
        record={{
          applicationId: record.applicationId,
          appId: record.appId,
          citizenName: record.citizenName || '',
          submittedDate: record.submittedDate || '',
          slaLimit: 0,
          serviceName: record.serviceName,
          departmentName: record.departmentName || '',
          applicationStatus: record.applicationStatus,
        }}
        data={
          data
            ? {
                currentUserId: null,
                currentUserName: null,
                details: data.details,
                stages: data.stages,
                verification: null,
                errors: {
                  details: data.errors.details,
                  stages: data.errors.stages,
                  verification: null,
                },
              }
            : null
        }
      />

      {receiptModalData && (
        <PaymentReceiptModal
          receipt={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {isCertModalOpen && record && (
        <RtsCertificateApprovalModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          applicationId={record.applicationId}
          applicationNo={record.appId}
          serviceName={record.serviceName}
          applicantName={record.citizenName || ''}
          onApproved={() => {
            setIsCertModalOpen(false);
          }}
        />
      )}

      {isPrintCertModalOpen && record && (
        <PrintableCertificateModal
          isOpen={isPrintCertModalOpen}
          onClose={() => setIsPrintCertModalOpen(false)}
          applicationNo={record.appId}
        />
      )}
    </>
  );
}
