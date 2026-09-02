"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Download, FileText, GitCommit, Paperclip, CreditCard, Printer, CheckCircle2, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { getApplicationDetailAction, type RtsApplicationDetailData } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import { resolveCitizenResubmitNavigationAction } from "@/app/[locale]/service/dashboard/actions";
import { ApprovalStagesTimeline } from "@/components/modules/rts";
import RtsApplicationDocumentView from "@/components/modules/rts/dashboard/RtsApplicationDocumentView";
import PrintableCertificateModal from "@/components/modules/rts/citizen/PrintableCertificateModal";
import { Button, Drawer, ViewButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  downloadRtsDocument,
  getCitizenRtsDocumentDownloadUrl,
  getCitizenRtsDocumentViewUrl,
} from "@/lib/api/rts/rtsdocument.client";
import { PaymentCheckoutModal } from "@/components/modules/rts/citizen/PaymentCheckoutModal";
import { PaymentReceiptModal } from "@/components/modules/rts/citizen/PaymentReceiptModal";
import { getPaymentReceiptAction, getPaymentStatusAction } from "@/app/[locale]/service/payment/actions";
import type { PaymentReceiptResult, PaymentStatusResult } from "@/lib/api/rts/rtspayment.service";
import type { Language } from "@/types/language.type";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

type RtsCitizenViewDetailsDrawerProps = {
  application: RtsMisDashboardUserApplicationItem | null;
  language: Language;
  onClose: () => void;
  /** SSR-loaded for the dashboard route; the local fetch remains a fallback for other consumers. */
  detailData?: RtsApplicationDetailData | null;
  /** SSR-loaded payment state; fetched via action only for non-dashboard consumers. */
  paymentStatusData?: PaymentStatusResult | null;
  onOpenPayment?: (applicationNo: string) => void;
  onOpenReceipt?: (receiptNo: string, applicationNo: string) => void;
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
  detailData,
  paymentStatusData,
  onOpenPayment,
  onOpenReceipt,
}: RtsCitizenViewDetailsDrawerProps) {
  const t = useTranslations("rts.citizenDashboard");
  const locale = useLocale();
  const router = useRouter();
  const numberFormatter = new Intl.NumberFormat(
    locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN",
  );
  const tCommon = useTranslations("common");
  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOpeningResubmit, setIsOpeningResubmit] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [isPrintCertModalOpen, setIsPrintCertModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{
    fileUrl: string;
    downloadUrl: string;
    fileName: string;
    label: string;
  } | null>(null);
  const applicationNumber = application?.applicationNo;

  const handleDocumentDownload = async (document: { guid: string; label: string }) => {
    try {
      await downloadRtsDocument({
        url: getCitizenRtsDocumentDownloadUrl(document.guid),
        fallbackFileName: `${document.label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        errorMessage: t("downloadFailed"),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("downloadFailed"));
    }
  };

  const handleViewReceipt = async () => {
    if (!applicationNumber) return;
    const appId = parseInt(applicationNumber.replace(/\D/g, ""), 10);
    if (!appId) {
      toast.error(language === "mr" ? "अवैध अर्ज क्रमांक." : "Invalid application number.");
      return;
    }
    setIsReceiptLoading(true);
    try {
      const res = await getPaymentReceiptAction(appId);
      if (res.success && res.data) {
        if (onOpenReceipt) {
          onOpenReceipt(res.data.receiptNo, applicationNumber);
        } else {
          setReceiptModalData(res.data);
        }
      } else {
        toast.error(language === "mr" ? "या अर्जाची पावती उपलब्ध नाही किंवा शुल्क अद्याप प्रलंबित आहे." : "Receipt not found for this application.");
      }
    } catch {
      toast.error(language === "mr" ? "पावती मिळवताना त्रुटी आली." : "Error retrieving receipt.");
    } finally {
      setIsReceiptLoading(false);
    }
  };

  useEffect(() => {
    if (!applicationNumber) return;

    if (detailData) return;

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
  }, [applicationNumber, detailData]);

  useEffect(() => {
    if (!applicationNumber || paymentStatusData !== undefined) return;

    const applicationId = Number.parseInt(applicationNumber.replace(/\D/g, ""), 10);
    if (!Number.isFinite(applicationId) || applicationId <= 0) return;

    let cancelled = false;

    void getPaymentStatusAction(applicationId)
      .then((response) => {
        if (!cancelled) setPaymentStatus(response.success ? response.data ?? null : null);
      })
      .catch((error) => {
        console.error("Failed to fetch citizen payment status:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationNumber, paymentStatusData]);

  if (!application) return null;

  const resolvedDetail = detailData ?? detail;
  const resolvedPaymentStatus = paymentStatusData !== undefined
    ? paymentStatusData
    : paymentStatus?.applicationNo.trim().toLowerCase() === applicationNumber?.trim().toLowerCase()
      ? paymentStatus
      : null;
  const isLoadingDetails = detailData ? false : loading;
  const normalizedStatus = normalizeStatus(application.status);
  const isRevertedToCitizen = resolvedDetail?.isRevertedToCitizen === true;
  const revertedRemark = resolvedDetail?.remark || application.remark;
  const handleOpenResubmit = async () => {
    if (isOpeningResubmit) return;

    setIsOpeningResubmit(true);
    try {
      const result = await resolveCitizenResubmitNavigationAction(application.applicationNo);
      if (!result.success) {
        console.error("Unable to resolve citizen correction form:", result.error);
        toast.error(t("resubmitUnavailable"));
        return;
      }

      router.push(
        `/${locale}/service/${result.serviceId}?deptId=${result.departmentId}&applicationNo=${encodeURIComponent(result.applicationNo)}&applicationId=${result.applicationId}&mode=resubmit`
      );
    } catch (error) {
      console.error("Failed to open citizen correction form:", error);
      toast.error(t("resubmitUnavailable"));
    } finally {
      setIsOpeningResubmit(false);
    }
  };
  const documents = [
    ...(resolvedDetail?.documents ?? []).map((document, index) => ({
      id: document.documentId || index + 1,
      label: document.documentName || t("documentAttachment"),
      guid: document.documentGuid || "",
      size: document.fileSizeBytes ? `${(document.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : t("attachment"),
    })),
    ...(resolvedDetail?.answerGroups ?? [])
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
        {isLoadingDetails ? (
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

            {/* Reverted / Action Required Alert Card */}
            {isRevertedToCitizen && (
              <section className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-orange-50/50 p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs font-black text-orange-950">
                      {t("applicationRevertedTitle")}
                    </p>
                    <p className="text-[11px] font-medium text-orange-800">
                      {t("applicationRevertedDescription")}
                    </p>
                    {revertedRemark && (
                      <div className="p-2.5 rounded-lg bg-white/90 border border-orange-200 text-xs text-orange-950 font-medium">
                        <strong>{t("officerRemark")}:</strong> {revertedRemark}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Button
                    type="button"
                    size="xs"
                    variant="primary"
                    icon={RotateCcw}
                    disabled={isOpeningResubmit}
                    onClick={handleOpenResubmit}
                    className="rounded-lg text-xs font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-600/20 px-4 py-2"
                  >
                    {t("editAndResubmit")}
                  </Button>
                </div>
              </section>
            )}

            {/* Payment state is owned by /RTSPayment/status, not approval-officer metadata. */}
            {resolvedPaymentStatus && (() => {
              const requiredFee = Number(resolvedPaymentStatus.requiredFee);
              const isFeeRequired = resolvedPaymentStatus.isFeeRequired !== false && requiredFee > 0;
              const isPaid = resolvedPaymentStatus.paymentStatus.trim().toUpperCase() === "SUCCESS";
              const receiptNo = resolvedPaymentStatus.receiptNo || receiptModalData?.receiptNo;

              if (!isFeeRequired) {
                return (
                  <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-900">{t("freeService")}</p>
                        <p className="text-[11px] font-medium text-emerald-700">{t("noGovernmentFeeRequired")}</p>
                      </div>
                    </div>
                  </section>
                );
              }

              return !isPaid ? (
                <section className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-amber-900">
                          {t("governmentFeePending", { amount: requiredFee.toFixed(2) })}
                        </p>
                        <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                          {t("paymentRequiredToProceed")}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="xs"
                      variant="primary"
                      icon={CreditCard}
                      onClick={() => {
                        if (onOpenPayment) {
                          onOpenPayment(applicationNumber!);
                        } else {
                          setIsCheckoutOpen(true);
                        }
                      }}
                      className="rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 px-3"
                    >
                      {t("payFeeNow")}
                    </Button>
                  </div>
                </section>
              ) : (
                <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-900">
                          {t("governmentFeePaid", { amount: requiredFee.toFixed(2) })}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-700">
                          {receiptNo ? t("receiptNumber", { receiptNo }) : t("officialReceiptAvailable")}
                        </p>
                      </div>
                    </div>
                    {receiptNo && (
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        icon={Printer}
                        disabled={isReceiptLoading}
                        onClick={handleViewReceipt}
                        className="rounded-lg text-xs font-bold text-emerald-800 border-emerald-300 bg-white hover:bg-emerald-50 shrink-0"
                      >
                        {t("viewReceipt")}
                      </Button>
                    )}
                  </div>
                </section>
              );
            })()}

            {normalizedStatus === "approved" && (
              <section className="rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">
                        {language === "mr"
                          ? "आपला अर्ज मंजूर झाला असून अधिकृत प्रमाणपत्र तयार आहे!"
                          : "Your application has been approved and official certificate is issued!"}
                      </p>
                      <p className="text-[11px] font-medium text-emerald-700">
                        {language === "mr"
                          ? "खालील बटणावर क्लिक करून डिजिटल स्वाक्षरी असलेले प्रमाणपत्र पहा व डाउनलोड करा."
                          : "Click below to view and download your digitally signed certificate."}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="primary"
                    icon={Printer}
                    onClick={() => setIsPrintCertModalOpen(true)}
                    className="rounded-xl text-xs font-bold bg-[#4b70a6] hover:bg-[#3d5a8a] text-white shrink-0 px-4 py-2 shadow-sm"
                  >
                    {language === "mr" ? "प्रमाणपत्र पहा व प्रिंट करा" : "View & Print Certificate"}
                  </Button>
                </div>
              </section>
            )}

            {documents.length > 0 && (
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
                <h4 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase text-slate-800">
                  <Paperclip className="h-4 w-4 text-blue-600" />
                  {t("uploadedDocuments", { count: documents.length })}
                </h4>
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
                              downloadUrl: getCitizenRtsDocumentDownloadUrl(document.guid),
                              fileName: `${document.label.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
                              label: document.label,
                            })}
                          >
                            {t("view")}
                          </ViewButton>
                          <Button type="button" variant="secondary" size="xs" icon={Download} onClick={() => handleDocumentDownload(document)}>
                            {t("download")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {Boolean(resolvedDetail && resolvedDetail.approvalStages && resolvedDetail.approvalStages.length > 0) && (
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800">
                    <GitCommit className="h-4 w-4 text-blue-600" />
                    {t("approvalWorkflow")}
                  </h4>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    {t("stages", { count: numberFormatter.format(resolvedDetail?.approvalStages?.length ?? 0) })}
                  </span>
                </div>
                <ApprovalStagesTimeline
                  stages={(resolvedDetail!.approvalStages ?? []).map((stage) => ({
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
                  completedCount={resolvedDetail!.completedStages || 0}
                  currentStageIndex={(() => {
                    const index = (resolvedDetail!.approvalStages ?? []).findIndex((stage) => stage.isCurrentStage);
                    return index >= 0 ? index : undefined;
                  })()}
                />
              </section>
            )}
          </div>
        )}
      </Drawer>

      {viewingDoc && (
        <RtsApplicationDocumentView
          open
          onClose={() => setViewingDoc(null)}
          fileUrl={viewingDoc.fileUrl}
          downloadUrl={viewingDoc.downloadUrl}
          fileName={viewingDoc.fileName}
          label={viewingDoc.label}
        />
      )}

      {isCheckoutOpen && applicationNumber && (
        <PaymentCheckoutModal
          applicationId={parseInt(applicationNumber.replace(/\D/g, ""), 10) || 1}
          applicationNo={applicationNumber}
          serviceName={(language === "mr" || language === "hi") && application.serviceNameLocal ? application.serviceNameLocal : application.serviceName}
          fees={resolvedPaymentStatus?.requiredFee ?? 0}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(receipt) => {
            setIsCheckoutOpen(false);
            setReceiptModalData(receipt);
          }}
        />
      )}

      {receiptModalData && (
        <PaymentReceiptModal
          receipt={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {isPrintCertModalOpen && applicationNumber && (
        <PrintableCertificateModal
          isOpen={isPrintCertModalOpen}
          onClose={() => setIsPrintCertModalOpen(false)}
          applicationNo={applicationNumber}
        />
      )}

    </>
  );
}
