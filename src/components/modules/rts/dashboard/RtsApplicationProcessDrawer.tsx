'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FileText,
  GitCommit,
  Paperclip,
  Pencil,
  RotateCcw,
  Save,
  Shield,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Badge,
  Button,
  Drawer,
  Input,
  Label,
  TextArea,
  ViewButton,
  type ButtonVariant,
} from '@/components/common';
import { ApprovalStagesTimeline } from '@/components/modules/rts';
import {
  rejectApprovalApplicationAction,
  verifyAndCorrectApprovalAction,
  verifyAndSendToApproveAction,
  verifyApprovalDocumentsAction,
  type RtsApplicationProcessData,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import { getDocumentDownloadUrl } from '@/lib/api/rts/rts-document-utils';
import type {
  RtsApplicationApprovalFieldValuePayload,
  RtsApplicationViewDetailField,
} from '@/types/rts/application-approval.types';
import { toast } from 'sonner';

export interface RtsApplicationProcessDrawerRecord {
  applicationId: number;
  appId: string;
  citizenName: string;
  submittedDate: string;
  slaLimit: number;
  serviceName: string;
  applicationStatus: string;
}

interface RtsApplicationProcessDrawerProps {
  open: boolean;
  record: RtsApplicationProcessDrawerRecord | null;
  data: RtsApplicationProcessData | null;
  onClose: () => void;
  onOpenDocument: (documentGuid: string) => void;
  onSuccess?: () => void;
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

function getInitialFieldValues(data: RtsApplicationProcessData | null): Record<string, string> {
  return Object.fromEntries(
    (data?.details?.applicationDetails ?? []).map((field) => [field.fieldDefinitionId.toString(), field.value ?? ''])
  );
}

function getInitialOpenGroups(data: RtsApplicationProcessData | null, fallbackTitle: string): Record<string, boolean> {
  return Object.fromEntries(
    (data?.details?.applicationDetails ?? []).map((field) => [field.fieldGroup || fallbackTitle, true])
  );
}

function createFieldUpdatePayload(
  field: RtsApplicationViewDetailField,
  value: string
): RtsApplicationApprovalFieldValuePayload {
  const normalizedValue = value.trim();
  const fieldType = field.fieldType.toLowerCase();
  const payload: RtsApplicationApprovalFieldValuePayload = {
    isActive: true,
    updatedBy: 0,
    fieldDefinitionId: field.fieldDefinitionId,
    textValue: null,
    numberValue: null,
    dateValue: null,
    booleanValue: null,
    documentGuid: null,
  };

  if (fieldType.includes('number')) {
    const numberValue = Number(normalizedValue);
    payload.numberValue = normalizedValue && Number.isFinite(numberValue) ? numberValue : null;
    return payload;
  }

  if (fieldType.includes('date')) {
    payload.dateValue = normalizedValue || null;
    return payload;
  }

  if (fieldType.includes('checkbox') || fieldType.includes('boolean') || fieldType.includes('switch')) {
    payload.booleanValue = ['true', '1', 'yes'].includes(normalizedValue.toLowerCase());
    return payload;
  }

  payload.textValue = normalizedValue || null;
  return payload;
}

const ACTIONS: Array<{
  key: 'canVerifyDocument' | 'canApprove' | 'canReject' | 'canReturn' | 'canPay' | 'canViewNoteSheet';
  labelKey: 'verifyDocuments' | 'approveApplication' | 'rejectApplication' | 'returnToCitizen' | 'recordPayment' | 'viewNoteSheet';
  icon: typeof Shield;
  variant: ButtonVariant;
}> = [
    { key: 'canVerifyDocument', labelKey: 'verifyDocuments', icon: CheckCircle2, variant: 'primary' },
    { key: 'canApprove', labelKey: 'approveApplication', icon: Check, variant: 'success' },
    { key: 'canReject', labelKey: 'rejectApplication', icon: XCircle, variant: 'danger' },
    { key: 'canReturn', labelKey: 'returnToCitizen', icon: RotateCcw, variant: 'secondary' },
    { key: 'canPay', labelKey: 'recordPayment', icon: Shield, variant: 'primary' },
    { key: 'canViewNoteSheet', labelKey: 'viewNoteSheet', icon: FileText, variant: 'secondary' },
  ];

function statusBadgeVariant(status: string): 'success' | 'destructive' | 'warning' | 'secondary' {
  const normalized = status.toLowerCase();
  if (normalized.includes('approv') || normalized.includes('complete')) return 'success';
  if (normalized.includes('reject')) return 'destructive';
  if (normalized.includes('return') || normalized.includes('revert')) return 'warning';
  return 'secondary';
}

export default function RtsApplicationProcessDrawer({
  open,
  record,
  data,
  onClose,
  onOpenDocument,
  onSuccess,
}: RtsApplicationProcessDrawerProps) {
  const t = useTranslations('rts.applicationDashboard.processDrawer');
  const tCommon = useTranslations('common');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => getInitialOpenGroups(data, t('generalDetails')));
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [officerRemark, setOfficerRemark] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [initialFieldValues, setInitialFieldValues] = useState<Record<string, string>>(() => getInitialFieldValues(data));
  const [editedFieldValues, setEditedFieldValues] = useState<Record<string, string>>(() => getInitialFieldValues(data));
  const [isSubmittingDecision, startDecisionTransition] = useTransition();

  const applicationId = record?.applicationId;

  const loading = Boolean(open && record && !data);

  const fieldGroups = useMemo(() => {
    const groups = new Map<string, NonNullable<RtsApplicationProcessData['details']>['applicationDetails']>();
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

  const stages = data?.stages ?? null;

  const verification = data?.verification ?? null;
  const availableActions = verification
    ? ACTIONS.filter((action) => verification[action.key])
    : [];

  const expandAll = () => {
    setOpenGroups(Object.fromEntries(fieldGroups.map((group) => [group.title, true])));
  };

  const collapseAll = () => {
    setOpenGroups(Object.fromEntries(fieldGroups.map((group) => [group.title, false])));
  };

  const headerStatus = verification?.applicationStatus || record?.applicationStatus || '';
  const headerStage = verification?.stageName || (loading ? t('loading') : t('processTitle'));
  const headerApplicationNo = verification?.applicationNo || record?.appId || '';
  const activeDocument = documents[Math.min(activeDocumentIndex, Math.max(documents.length - 1, 0))] ?? null;
  const isFieldDataChanged = Object.keys(editedFieldValues).some(
    (fieldId) => editedFieldValues[fieldId] !== initialFieldValues[fieldId]
  );

  const closeDrawer = () => {
    setOpenGroups({});
    setActiveDocumentIndex(0);
    setOfficerRemark('');
    setIsEditing(false);
    setInitialFieldValues({});
    setEditedFieldValues({});
    onClose();
  };

  const notifyActionUnavailable = () => {
    toast.info(t('actionsUnavailable'));
  };

  const submitDecision = (actionKey: 'canVerifyDocument' | 'canApprove' | 'canReject') => {
    if (!applicationId) return;

    if (!officerRemark.trim()) {
      toast.error(t('remarkRequired'));
      return;
    }

    startDecisionTransition(async () => {
      const result = actionKey === 'canVerifyDocument'
        ? await verifyApprovalDocumentsAction(applicationId, officerRemark)
        : actionKey === 'canApprove'
          ? await verifyAndSendToApproveAction(applicationId, officerRemark)
          : await rejectApprovalApplicationAction(applicationId, officerRemark);

      if (!result.success) {
        toast.error(result.message || t('actionFailed'));
        return;
      }

      toast.success(
        result.message || (
          actionKey === 'canVerifyDocument'
            ? t('documentsVerified')
            : actionKey === 'canApprove'
              ? t('applicationSentForApproval')
              : t('rejectApplication')
        )
      );
      setOfficerRemark('');
      onSuccess?.();
    });
  };

  const submitFieldUpdates = () => {
    if (!applicationId || !data?.details) return;

    if (!officerRemark.trim()) {
      toast.error(t('remarkRequired'));
      return;
    }

    const fieldValue = data.details.applicationDetails
      .filter((field) => {
        const fieldId = field.fieldDefinitionId.toString();
        return editedFieldValues[fieldId] !== initialFieldValues[fieldId];
      })
      .map((field) => createFieldUpdatePayload(
        field,
        editedFieldValues[field.fieldDefinitionId.toString()] ?? ''
      ));

    startDecisionTransition(async () => {
      const result = await verifyAndCorrectApprovalAction(applicationId, officerRemark, fieldValue);

      if (!result.success) {
        toast.error(result.message || t('actionFailed'));
        return;
      }

      toast.success(result.message || t('submitChanges'));
      setInitialFieldValues(editedFieldValues);
      setIsEditing(false);
      onSuccess?.();
    });
  };

  if (!record) return null;

  return (
    <Drawer
      open={open}
      onClose={closeDrawer}
      width="xl"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center justify-start gap-2">
            {availableActions.map((action) => (
              <Button
                key={action.key}
                type="button"
                size="xs"
                variant={action.variant}
                icon={action.icon}
                disabled={isSubmittingDecision}
                onClick={() => {
                  if (
                    action.key === 'canVerifyDocument' ||
                    action.key === 'canApprove' ||
                    action.key === 'canReject'
                  ) {
                    submitDecision(action.key);
                    return;
                  }
                  notifyActionUnavailable();
                }}
                className="rounded-lg px-3 text-xs font-bold"
              >
                {t(action.labelKey)}
              </Button>
            ))}
          </div>
          <div className="flex items-center">
            <Button variant="secondary" onClick={closeDrawer} size="xs" className="rounded-lg px-5 text-xs font-bold">
              {tCommon('buttons.close')}
            </Button>
          </div>
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
              <p className="truncate text-base font-extrabold">{headerStage}</p>
              <p className="truncate text-[11px] font-semibold text-blue-100"><u>{t('applicationNumber')}</u> : {headerApplicationNo}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {headerStatus && <Badge variant={statusBadgeVariant(headerStatus)}>{headerStatus}</Badge>}
            {/* <button
              type="button"
              onClick={closeDrawer}
              aria-label={tCommon('buttons.close')}
              title={tCommon('buttons.close')}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button> */}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 xl:overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">
              {t('loading')}
            </div>
          ) : (
            <div className="grid min-h-0 grid-cols-1 gap-2 xl:h-full xl:grid-cols-[28rem_minmax(0,1fr)]">
              <aside className="space-y-2 xl:self-start">
                <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('documents')}</h2>
                    </div>
                    {activeDocument?.isUploaded && (
                      <div className="flex shrink-0 gap-1.5">
                        <ViewButton size="xs" onClick={() => onOpenDocument(activeDocument.guid)} className="rounded-lg px-2 text-[11px]">
                          {t('view')}
                        </ViewButton>
                        <Button type="button" size="xs" variant="secondary" icon={Download} onClick={() => window.open(getDocumentDownloadUrl(activeDocument.guid), '_blank')} className="rounded-lg px-2 text-[11px]">
                          {t('download')}
                        </Button>
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
                        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-white/80">
                          <FileText className="h-9 w-9 text-blue-500" />
                        </div>
                        {documents.length > 1 && (
                          <>
                            <button
                              type="button"
                              aria-label={t('previousDocument')}
                              onClick={() => setActiveDocumentIndex((index) => (index - 1 + documents.length) % documents.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-blue-600 shadow-sm hover:bg-blue-50"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={t('nextDocument')}
                              onClick={() => setActiveDocumentIndex((index) => (index + 1) % documents.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-blue-600 shadow-sm hover:bg-blue-50"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="truncate text-xs font-extrabold text-slate-800" title={activeDocument.name}>{activeDocument.name}</p>
                        <span className="mr-2.5 shrink-0 text-[11px] font-semibold text-slate-400">
                          {t('documentPosition', { current: Math.min(activeDocumentIndex, documents.length - 1) + 1, total: documents.length })}
                        </span>
                      </div>
                      <div>
                        <p className={`mt-1 text-[11px] font-bold ${activeDocument.isUploaded ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {activeDocument.isUploaded ? t('uploaded') : activeDocument.isRequired ? t('requiredMissing') : t('optionalMissing')}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                    {/* <Shield className="h-4 w-4 text-blue-600" /> */}
                    <GitCommit className="size-5 text-blue-600 shrink-0" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('approvalStages')}</h2>
                  </div>
                  {data?.errors.stages ? (
                    <p className="text-xs font-medium text-rose-600">{t('stagesUnavailable')}</p>
                  ) : !stages?.approvalStages.length ? (
                    <p className="text-xs font-medium text-slate-500">{t('noStages')}</p>
                  ) : (
                    <ApprovalStagesTimeline
                      stages={stages.approvalStages.map((stage) => ({
                        id: stage.approvalFlowStageId,
                        stageName: stage.stageName,
                        stageOrder: stage.stageOrder,
                        status: stage.status,
                        remark: stage.remark,
                      }))}
                      completedCount={stages.completedStages}
                      currentStageIndex={(() => {
                        const index = stages.approvalStages.findIndex((stage) => stage.isCurrentStage);
                        return index >= 0 ? index : undefined;
                      })()}
                    />
                  )}
                </section>

                <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('allowedWorkflowActions')}</h2>
                  </div>
                  <TextArea
                    label={t('officerRemarks')}
                    required
                    rows={4}
                    className="min-h-24 text-xs"
                    value={officerRemark}
                    onChange={(event) => setOfficerRemark(event.target.value)}
                    placeholder={t('remarkPlaceholder')}
                  />
                </section>
              </aside>

              <section className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm xl:flex xl:h-full xl:min-h-0 xl:flex-col">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">{t('applicationDetails')}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <button type="button" onClick={expandAll} className="hover:text-blue-900">{t('expandAll')}</button>
                    <span className="text-slate-300">|</span>
                    <button type="button" onClick={collapseAll} className="hover:text-blue-900">{t('collapseAll')}</button>
                    {verification?.canEdit && (
                      <Button
                        type="button"
                        size="xs"
                        variant="edit"
                        icon={Pencil}
                        onClick={() => setIsEditing((editing) => !editing)}
                        className="ml-2 rounded-lg"
                      >
                        {isEditing ? t('cancelEdit') : t('edit')}
                      </Button>
                    )}
                    {verification?.canEdit && isEditing && isFieldDataChanged && (
                      <Button
                        type="button"
                        size="xs"
                        variant="primary"
                        icon={Save}
                        disabled={isSubmittingDecision}
                        onClick={submitFieldUpdates}
                        className="rounded-lg"
                      >
                        {t('submitChanges')}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
                  {data?.errors.details ? (
                    <p className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                      {t('detailsUnavailable')}
                    </p>
                  ) : fieldGroups.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-medium text-slate-500">
                      {t('noDetails')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {fieldGroups.map((group) => {
                        const isOpen = openGroups[group.title] ?? true;
                        const declarationGroup = isDeclarationGroup(group.title);
                        return (
                          <article key={group.title} className="overflow-hidden rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setOpenGroups((current) => ({ ...current, [group.title]: !isOpen }))}
                              className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-blue-50/60"
                            >
                              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-900">
                                {group.title} <span className="ml-1 text-[10px] text-blue-600">({t('fieldCount', { count: group.fields.length })})</span>
                              </span>
                              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                            </button>
                            {isOpen && (declarationGroup ? (
                              <div className="p-4">
                                {group.fields.map((field) => (
                                  <div key={field.fieldDefinitionId} className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4">
                                    <div className="flex items-start gap-3">
                                      <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold leading-relaxed text-slate-800">
                                          {field.fieldLabel || t('declarationAccepted')}
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-emerald-700">{t('acceptedByApplicant')}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                {group.fields.map((field) => (
                                  <div key={field.fieldDefinitionId} className="min-w-0">
                                    <Label htmlFor={`field-${field.fieldDefinitionId}`} className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-600">
                                      {field.fieldLabel}
                                    </Label>
                                    <Input
                                      fullWidth
                                      // label={field.fieldLabel}
                                      value={editedFieldValues[field.fieldDefinitionId.toString()] ?? ''}
                                      disabled={!isEditing}
                                      onChange={(event) => setEditedFieldValues((values) => ({
                                        ...values,
                                        [field.fieldDefinitionId.toString()]: event.target.value,
                                      }))}
                                      className="h-9 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-700 disabled:opacity-100"
                                    />
                                  </div>
                                ))}
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
  );
}
