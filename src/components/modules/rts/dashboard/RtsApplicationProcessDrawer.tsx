'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  Award,
  Check,
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
  Pencil,
  Printer,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

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
import { useConfirm } from '@/components/common/ConfirmProvider';
import { ApprovalStagesTimeline } from '@/components/modules/rts';
import RtsApplicationNoteSheetModal from '@/components/modules/rts/dashboard/RtsApplicationNoteSheetModal';
import RtsCertificateApprovalModal from '@/components/modules/rts/dashboard/RtsCertificateApprovalModal';
import PrintableCertificateModal from '@/components/modules/rts/citizen/PrintableCertificateModal';
import { RtsRecordOfflinePaymentModal } from '@/components/modules/rts/dashboard/RtsRecordOfflinePaymentModal';
import { PaymentReceiptModal } from '@/components/modules/rts/citizen/PaymentReceiptModal';
import { getPaymentReceiptAction } from '@/app/[locale]/service/payment/actions';
import type { PaymentReceiptResult } from '@/lib/api/rts/rtspayment.service';
import {
  rejectApprovalApplicationAction,
  revertApprovalApplicationAction,
  verifyAndCorrectApprovalAction,
  verifyAndSendToApproveAction,
  verifyApprovalDocumentsAction,
  type RtsApplicationProcessData,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import { getAdminRtsDocumentDownloadUrl, getAdminRtsDocumentViewUrl } from '@/lib/api/rts/rtsdocument.client';
import { hasApprovalOfficerAccess } from '@/lib/utils/rts/approval-officer-access';
import { getRtsApplicationStatusBadgeProps } from '@/lib/utils/rts/application-status-badge';
import { getApplicationFieldDisplayLabel } from '@/lib/utils/rts/application-field-label';
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
  departmentName?: string;
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

type DecisionActionKey = 'canVerifyDocument' | 'canApprove' | 'canReject' | 'canReturn';

const DECISION_CONFIRMATION_TITLE_KEYS: Record<
  DecisionActionKey,
  'confirmVerificationAction' | 'confirmApprovalAction' | 'confirmRejectAction' | 'confirmRevertAction'
> = {
  canVerifyDocument: 'confirmVerificationAction',
  canApprove: 'confirmApprovalAction',
  canReject: 'confirmRejectAction',
  canReturn: 'confirmRevertAction',
};

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
  key: 'canVerifyDocument' | 'canApprove' | 'canReject' | 'canReturn' | 'canPay';
  labelKey: 'verifyDocuments' | 'approveApplication' | 'rejectApplication' | 'revertToCitizen' | 'recordPayment';
  icon: typeof Shield;
  variant: ButtonVariant;
}> = [
    { key: 'canVerifyDocument', labelKey: 'verifyDocuments', icon: CheckCircle2, variant: 'primary' },
    { key: 'canApprove', labelKey: 'approveApplication', icon: Check, variant: 'success' },
    { key: 'canReject', labelKey: 'rejectApplication', icon: XCircle, variant: 'danger' },
    { key: 'canReturn', labelKey: 'revertToCitizen', icon: RotateCcw, variant: 'secondary' },
    { key: 'canPay', labelKey: 'recordPayment', icon: IndianRupee, variant: 'primary' },
  ];

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
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(
    locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN',
  );
  const { confirm } = useConfirm();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => getInitialOpenGroups(data, t('generalDetails')));
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [officerRemark, setOfficerRemark] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [initialFieldValues, setInitialFieldValues] = useState<Record<string, string>>(() => getInitialFieldValues(data));
  const [editedFieldValues, setEditedFieldValues] = useState<Record<string, string>>(() => getInitialFieldValues(data));
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [isOfflinePaymentModalOpen, setIsOfflinePaymentModalOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [isSubmittingDecision, startDecisionTransition] = useTransition();
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [documentPreviewType, setDocumentPreviewType] = useState<'image' | 'file' | null>(null);
  const [documentPreviewError, setDocumentPreviewError] = useState<string | null>(null);
  const [isDocumentPreviewLoading, setIsDocumentPreviewLoading] = useState(false);
  const accessToastKey = useRef<string | null>(null);

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
  const [isPaidLocal, setIsPaidLocal] = useState<boolean | null>(null);
  const [receiptNoLocal, setReceiptNoLocal] = useState<string | null>(null);
  const [isPrintCertModalOpen, setIsPrintCertModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    if (verification) {
      setIsPaidLocal(Boolean(verification.isPaid));
      setReceiptNoLocal(verification.receiptNo ?? null);
    }
  }, [verification]);

  const effectiveIsPaid = isPaidLocal ?? verification?.isPaid ?? false;
  const effectiveReceiptNo = receiptNoLocal ?? verification?.receiptNo ?? null;
  const isFreeService = Boolean(
    verification && (
      verification.feesRequired === false ||
      Number(verification.serviceFees ?? 0) <= 0
    )
  );

  const hasOfficerAccess = hasApprovalOfficerAccess(data?.currentUserId, verification?.officerId);
  const availableActions = (verification && hasOfficerAccess)
    ? ACTIONS.filter((action) => {
        if (action.key === 'canPay') {
          // If already paid, DO NOT show "Record Payment" button!
          if (effectiveIsPaid) return false;
          return Boolean(verification.canPay || (verification.feesRequired && !effectiveIsPaid));
        }
        return Boolean(verification[action.key]);
      })
    : [];

  const predefinedRemarkOptions = [
    ...(verification?.canVerifyDocument
      ? [
          t('remarkVerifyDocumentsValid'),
          t('remarkVerifyDocumentsComplete'),
        ]
      : []),
    ...(verification?.canApprove
      ? [
          t('remarkApproveRequirementsMet'),
          t('remarkApproveApplicationReviewed'),
        ]
      : []),
    ...(verification?.canReject
      ? [
          t('remarkRejectInvalidDocuments'),
          t('remarkRejectEligibilityNotMet'),
        ]
      : []),
    ...(verification?.canReturn
      ? [
          t('remarkRevertCorrectionRequired'),
          t('remarkRevertAdditionalInformation'),
        ]
      : []),
    ...(verification?.canEdit
      ? [
          t('remarkEditApplicationCorrected'),
          t('remarkEditDetailsUpdated'),
        ]
      : []),
  ];
  const selectedPredefinedRemark = predefinedRemarkOptions.includes(officerRemark) ? officerRemark : '';

  useEffect(() => {
    if (!open || !verification || hasOfficerAccess) {
      accessToastKey.current = null;
      return;
    }

    const toastKey = `${verification.applicationId}:${verification.stageId}:${data?.currentUserId ?? 'anonymous'}`;
    if (accessToastKey.current === toastKey) return;

    accessToastKey.current = toastKey;
    toast.error(
      t('officerProcessUnauthorized', {
        name: data?.currentUserName || t('user'),
        stageName: verification.stageName,
      })
    );
  }, [data?.currentUserId, data?.currentUserName, hasOfficerAccess, open, t, verification]);

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

  useEffect(() => {
    if (!open || !activeDocument?.isUploaded || !activeDocument.guid) {
      // Reset browser-preview state when the drawer has no active uploaded document.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        if (!response.ok) throw new Error(`Document preview request failed (${response.status}).`);

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

  const closeDrawer = () => {
    setOpenGroups({});
    setActiveDocumentIndex(0);
    setOfficerRemark('');
    setIsEditing(false);
    setInitialFieldValues({});
    setEditedFieldValues({});
    onClose();
  };

  const applicantName = useMemo(() => {
    return (
      data?.details?.applicationDetails?.find(
        (f) => f.fieldLabel?.includes('नाव') || f.fieldLabel?.toLowerCase().includes('name')
      )?.value || record?.citizenName || ''
    );
  }, [data?.details?.applicationDetails, record?.citizenName]);

  const handleViewReceipt = async () => {
    if (receiptModalData) {
      setReceiptModalData({ ...receiptModalData });
      return;
    }
    if (!applicationId) return;
    setIsReceiptLoading(true);
    try {
      const res = await getPaymentReceiptAction(applicationId);
      if (res.success && res.data) {
        setReceiptModalData(res.data);
      } else {
        toast.error('पावती उपलब्ध नाही किंवा मिळवता आली नाही.');
      }
    } catch {
      toast.error('पावती मिळवताना त्रुटी आली.');
    } finally {
      setIsReceiptLoading(false);
    }
  };

  const notifyActionUnavailable = () => {
    toast.info(t('actionsUnavailable'));
  };

  const requestDecisionConfirmation = (actionKey: DecisionActionKey) => {
    if (!applicationId) return;

    if (!hasOfficerAccess) {
      toast.error(t('officerAccessDenied'));
      return;
    }

    if (actionKey === 'canApprove' && verification?.feesRequired && !effectiveIsPaid) {
      toast.warning(`नागरिकाचे शासकीय शुल्क (₹${verification.serviceFees ?? 0}) प्रलंबित असल्याने अर्ज मंजूर करता येणार नाही. प्रथम शुल्क जमा करणे आवश्यक आहे.`);
      return;
    }

    if (!officerRemark.trim()) {
      toast.error(t('remarkRequired'));
      return;
    }

    const isDestructive = actionKey === 'canReject' || actionKey === 'canReturn';
    const confirmationServiceName = record?.serviceName || verification?.serviceName || '';

    confirm({
      variant: isDestructive ? 'warning' : 'info',
      title: t(DECISION_CONFIRMATION_TITLE_KEYS[actionKey]),
      description: `${t('confirmDecisionDescription')}\n\n${t('confirmDecisionContext', {
        applicationNo: headerApplicationNo,
        serviceName: confirmationServiceName,
      })}`,
      confirmText: t('confirmDecision'),
      cancelText: t('cancelDecision'),
      onConfirm: () => submitDecision(actionKey),
    });
  };

  const submitDecision = (actionKey: DecisionActionKey) => {
    if (!applicationId) return;

    startDecisionTransition(async () => {
      const result = actionKey === 'canVerifyDocument'
        ? await verifyApprovalDocumentsAction(applicationId, officerRemark)
        : actionKey === 'canApprove'
          ? await verifyAndSendToApproveAction(applicationId, officerRemark)
          : actionKey === 'canReject'
            ? await rejectApprovalApplicationAction(applicationId, officerRemark)
            : await revertApprovalApplicationAction(applicationId, officerRemark);

      if (!result.success) {
        toast.error(
          result.errorCode === 'OFFICER_ACCESS_DENIED'
            ? t('officerAccessDenied')
            : result.message || t('actionFailed')
        );
        return;
      }

      toast.success(
        result.message || (
          actionKey === 'canVerifyDocument'
            ? t('documentsVerified')
            : actionKey === 'canApprove'
              ? t('applicationSentForApproval')
              : actionKey === 'canReject'
                ? t('rejectApplication')
                : t('revertApplication')
        )
      );
      setOfficerRemark('');
      onSuccess?.();
    });
  };

  const submitFieldUpdates = () => {
    if (!applicationId || !data?.details) return;

    if (!hasOfficerAccess) {
      toast.error(t('officerAccessDenied'));
      return;
    }

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
        toast.error(
          result.errorCode === 'OFFICER_ACCESS_DENIED'
            ? t('officerAccessDenied')
            : result.message || t('actionFailed')
        );
        return;
      }

      toast.success(result.message || t('submitChanges'));
      setInitialFieldValues(editedFieldValues);
      setIsEditing(false);
      setOfficerRemark('');
      onSuccess?.();
    });
  };

  if (!record) return null;

  return (
    <>
      <Drawer
      open={open}
      onClose={closeDrawer}
      width="xl"
      hideHeader
      bodyClassName="relative overflow-hidden"
      footer={
        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <div className="flex flex-wrap items-center justify-start gap-2">
              {availableActions.map((action) => {
                const isEditLockedWorkflowAction = isEditing;
                const isApproveBlockedByFee =
                  (action.key === 'canApprove' || action.key === 'canVerifyDocument') &&
                  Boolean(verification?.feesRequired && !effectiveIsPaid);
                const isRecordPaymentDisabled = action.key === 'canPay' && isFreeService;

                const actionLabel = action.key === 'canPay'
                  ? 'शुल्क स्वीकारा (Record Payment)'
                  : action.key === 'canApprove'
                    ? (verification?.isFinalStage ? 'अंतिम मंजूर करा (Approve)' : 'पुढील टप्प्यावर पाठवा (Forward)')
                    : t(action.labelKey);

                return (
                  <Button
                    key={action.key}
                    type="button"
                    size="xs"
                    variant={action.variant}
                    icon={action.icon}
                    disabled={
                      isSubmittingDecision ||
                      !hasOfficerAccess ||
                      isEditLockedWorkflowAction ||
                      isApproveBlockedByFee ||
                      isRecordPaymentDisabled
                    }
                    title={
                      !hasOfficerAccess
                        ? t('officerAccessDenied')
                        : isEditLockedWorkflowAction
                          ? t('finishEditBeforeWorkflowAction')
                        : isApproveBlockedByFee
                          ? 'शासकीय शुल्क प्रलंबित असल्याने कार्यवाही / मंजुरी करता येत नाही. प्रथम शुल्क स्वीकारा.'
                          : isRecordPaymentDisabled
                            ? t('recordPaymentNotRequired')
                            : undefined
                    }
                    onClick={() => {
                      if (action.key === 'canPay') {
                        if (isFreeService) return;
                        setIsOfflinePaymentModalOpen(true);
                        return;
                      }
                      if (action.key === 'canApprove') {
                        requestDecisionConfirmation('canApprove');
                        return;
                      }
                      if (
                        action.key === 'canVerifyDocument' ||
                        action.key === 'canReject' ||
                        action.key === 'canReturn'
                      ) {
                        requestDecisionConfirmation(action.key);
                        return;
                      }
                      notifyActionUnavailable();
                    }}
                    className="rounded-lg px-3 text-xs font-bold"
                  >
                    {actionLabel}
                  </Button>
                );
              })}

              {/* Certificate: Visible to Final Stage Officer or when application is approved */}
              {Boolean(
                verification?.isFinalStage ||
                verification?.applicationStatus?.toLowerCase() === 'approved' ||
                record?.applicationStatus?.toLowerCase() === 'approved' ||
                (data?.verification?.applicationStatus && data.verification.applicationStatus.toLowerCase() === 'approved')
              ) && (
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  icon={Award}
                  onClick={() => setIsCertModalOpen(true)}
                  className="rounded-lg px-3 text-xs font-bold text-purple-800 border-purple-300 bg-purple-50 hover:bg-purple-100"
                >
                  प्रमाणपत्र (Certificate)
                </Button>
              )}

              {/* Note Sheet: Visible to ALL officers once first verification is done / history exists */}
              {Boolean(
                verification?.canViewNoteSheet ||
                (verification?.stageOrder && verification.stageOrder > 1) ||
                (data?.stages && (data.stages.completedStages ?? 0) > 0)
              ) && (
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  icon={FileText}
                  onClick={() => setIsNoteSheetOpen(true)}
                  className="rounded-lg px-3 text-xs font-bold text-blue-800 border-blue-300 bg-blue-50 hover:bg-blue-100"
                >
                  टिप्पणी पहा (Note Sheet)
                </Button>
              )}

              {/* Payment Receipt: Visible to ALL officers once payment is recorded */}
              {Boolean(effectiveIsPaid || verification?.receiptNo) && (
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  icon={Printer}
                  disabled={isReceiptLoading}
                  onClick={handleViewReceipt}
                  className="rounded-lg px-3 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                >
                  पावती पहा (Receipt)
                </Button>
              )}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center">
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
              <p className="truncate text-[10px] font-semibold text-blue-100/90">
                <span className="font-extrabold"><u>{t('departmentName')}:</u></span> <span className="font-extrabold">{record?.departmentName || '-'}</span>
                <span className="px-1">•</span>
                <span className="font-extrabold"><u>{t('serviceName')}:</u></span> <span className="font-extrabold">{record?.serviceName || '-'}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerStatus?.toLowerCase().includes('approv') && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPrintCertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                  <FileCheck2 className="h-4 w-4" />
                  प्रमाणपत्र पहा व प्रिंट करा
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-lg text-xs font-bold transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  प्रमाणपत्र संपादन
                </button>
              </>
            )}
            {headerStatus && <Badge {...getRtsApplicationStatusBadgeProps(headerStatus)}>{headerStatus}</Badge>}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 xl:overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">
              {t('loading')}
            </div>
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
                        <ViewButton size="xs" onClick={() => onOpenDocument(activeDocument.guid)} className="rounded-lg px-2 text-[11px]">
                          {t('view')}
                        </ViewButton>
                        <Button type="button" size="xs" variant="secondary" icon={Download} onClick={() => window.open(getAdminRtsDocumentDownloadUrl(activeDocument.guid), '_blank')} className="rounded-lg px-2 text-[11px]">
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
                        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-white/80">
                          {isDocumentPreviewLoading ? (
                            <LoaderCircle className="h-7 w-7 animate-spin text-blue-500" />
                          ) : documentPreviewType === 'image' && documentPreviewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={documentPreviewUrl} alt={activeDocument.name} className="h-45 w-full object-contain" />
                          ) : documentPreviewError ? (
                            <p className="px-4 text-center text-[11px] font-semibold text-slate-500">{documentPreviewError}</p>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 px-4 text-center">
                              <FileText className="h-8 w-8 text-rose-500" />
                              <p className="line-clamp-2 text-[11px] font-bold text-slate-600" title={activeDocument.name}>{activeDocument.name}</p>
                            </div>
                          )}
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
                      <div className="flex min-w-0 items-center justify-between gap-0.5">
                        <p className="truncate text-xs font-extrabold text-slate-800" title={activeDocument.name}>{activeDocument.name}</p>
                        <span className="mr-2.5 shrink-0 text-[11px] font-semibold text-slate-400">
                          {t('documentPosition', {
                            current: numberFormatter.format(Math.min(activeDocumentIndex, documents.length - 1) + 1),
                            total: numberFormatter.format(documents.length),
                          })}
                        </span>
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold ${activeDocument.isUploaded ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                        userName: stage.userName,
                        firstName: stage.firstName,
                        lastName: stage.lastName,
                        createdDate: stage.createdDate,
                      }))}
                      completedCount={stages.completedStages}
                      currentStageIndex={(() => {
                        const index = stages.approvalStages.findIndex((stage) => stage.isCurrentStage);
                        return index >= 0 ? index : undefined;
                      })()}
                    />
                  )}
                </section>

                {/* Payment Status Banner */}
                {verification && (
                  isFreeService ? (
                    <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-3.5 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-emerald-900">{t('freeService')}</p>
                          <p className="text-[11px] font-medium text-emerald-700">{t('noGovernmentFeeRequired')}</p>
                        </div>
                      </div>
                    </section>
                  ) : effectiveIsPaid ? (
                    <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-emerald-900">
                              शासकीय शुल्क प्राप्त (Fee Paid): ₹{verification?.serviceFees ?? 0}
                            </p>
                            <p className="text-[11px] font-medium text-emerald-700">
                              पावती क्र. : {effectiveReceiptNo || 'उपलब्ध'}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="xs"
                          variant="secondary"
                          icon={Printer}
                          disabled={isReceiptLoading}
                          onClick={handleViewReceipt}
                          className="rounded-lg text-[11px] font-bold text-emerald-800 border-emerald-300 bg-white hover:bg-emerald-50 shrink-0"
                        >
                          पावती पहा
                        </Button>
                      </div>
                    </section>
                  ) : (verification.feesRequired || (verification.serviceFees ?? 0) > 0) ? (
                    <section className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-3.5 shadow-sm">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                            <IndianRupee className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-amber-900">
                              शासकीय शुल्क प्रलंबित: ₹{verification?.serviceFees ?? 0}
                            </p>
                            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                              नागरिकाने ऑनलाइन भरावे किंवा CFC काऊंटरवर जमा करावे. शुल्क भरल्याशिवाय अंतिम मंजुरी देता येणार नाही.
                            </p>
                          </div>
                        </div>
                        {hasOfficerAccess && (
                          <div className="pt-1 flex justify-end">
                            <Button
                              type="button"
                              size="xs"
                              variant="primary"
                              icon={IndianRupee}
                              onClick={() => setIsOfflinePaymentModalOpen(true)}
                              className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 font-bold shadow-xs"
                            >
                              काऊंटर शुल्क स्वीकारा (Record Payment)
                            </Button>
                          </div>
                        )}
                      </div>
                    </section>
                  ) : null
                )}

                {hasOfficerAccess ? (
                  <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm mb-1">
                    <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">{t('allowedWorkflowActions')}</h2>
                    </div>
                    <div className="mb-3 space-y-1.5">
                      <Label htmlFor="predefined-officer-remark" className="text-xs font-bold text-slate-700">
                        {t('predefinedRemarks')}
                      </Label>
                      <select
                        id="predefined-officer-remark"
                        value={selectedPredefinedRemark}
                        disabled={isSubmittingDecision || predefinedRemarkOptions.length === 0}
                        onChange={(event) => setOfficerRemark(event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">{t('selectPredefinedRemark')}</option>
                        {predefinedRemarkOptions.map((remark) => (
                          <option key={remark} value={remark}>{remark}</option>
                        ))}
                      </select>
                      <p className="text-[10px] font-medium text-slate-500">{t('predefinedRemarkHint')}</p>
                    </div>
                    <TextArea
                      label={t('officerRemarks')}
                      required
                      rows={4}
                      className="min-h-24 text-xs"
                      value={officerRemark}
                      disabled={isSubmittingDecision}
                      onChange={(event) => setOfficerRemark(event.target.value)}
                      placeholder={t('remarkPlaceholder')}
                    />
                  </section>
                ) : null}
                </div>
              </aside>

              <section className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm xl:flex xl:h-full xl:min-h-0 xl:self-stretch xl:flex-col">
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
                        disabled={!hasOfficerAccess || isSubmittingDecision}
                        title={!hasOfficerAccess ? t('officerAccessDenied') : undefined}
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
                        disabled={isSubmittingDecision || !hasOfficerAccess}
                        title={!hasOfficerAccess ? t('officerAccessDenied') : undefined}
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
                                {group.title} <span className="ml-1 text-[10px] text-blue-600">({t('fieldCount', { count: numberFormatter.format(group.fields.length) })})</span>
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
                                          {getApplicationFieldDisplayLabel(field, locale, t('declarationAccepted'))}
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
                                      {getApplicationFieldDisplayLabel(field, locale, t('documentFallback'))}
                                    </Label>
                                    <Input
                                      fullWidth
                                      // label={field.fieldLabel}
                                      value={editedFieldValues[field.fieldDefinitionId.toString()] ?? ''}
                                      disabled={!isEditing || !hasOfficerAccess}
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

      <RtsApplicationNoteSheetModal
        isOpen={isNoteSheetOpen}
        onClose={() => setIsNoteSheetOpen(false)}
        record={record}
        data={data}
      />

      {isOfflinePaymentModalOpen && applicationId && (
        <RtsRecordOfflinePaymentModal
          open={isOfflinePaymentModalOpen}
          onClose={() => setIsOfflinePaymentModalOpen(false)}
          applicationId={applicationId}
          applicationNo={headerApplicationNo}
          serviceName={record?.serviceName || verification?.serviceName || undefined}
          serviceFees={verification?.serviceFees}
          applicantName={applicantName}
          onSuccess={(receipt) => {
            setIsOfflinePaymentModalOpen(false);
            setIsPaidLocal(true);
            setReceiptNoLocal(receipt.receiptNo);
            setReceiptModalData(receipt);
            toast.success(`ऑफलाइन शुल्क ₹${receipt.amount} यशस्वीरीत्या जमा झाले. पावती क्र. ${receipt.receiptNo}`);
            onSuccess?.();
          }}
        />
      )}

      {receiptModalData && (
        <PaymentReceiptModal
          receipt={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {isCertModalOpen && applicationId && (
        <RtsCertificateApprovalModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          applicationId={applicationId}
          applicationNo={headerApplicationNo}
          serviceName={record?.serviceName || verification?.serviceName || undefined}
          applicantName={applicantName}
          onApproved={() => {
            setIsCertModalOpen(false);
            onSuccess?.();
          }}
        />
      )}

      {isPrintCertModalOpen && (
        <PrintableCertificateModal
          isOpen={isPrintCertModalOpen}
          onClose={() => setIsPrintCertModalOpen(false)}
          applicationId={applicationId || undefined}
          applicationNo={headerApplicationNo}
        />
      )}
    </>
  );
}
