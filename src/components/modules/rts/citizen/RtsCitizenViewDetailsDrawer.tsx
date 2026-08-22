"use client";

import { useEffect, useState } from "react";
import { Download, FileText, GitCommit, Paperclip, CreditCard, Printer, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { getApplicationDetailAction, type RtsApplicationDetailData } from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import { ApprovalStagesTimeline } from "@/components/modules/rts";
import RtsApplicationDocumentView from "@/components/modules/rts/dashboard/RtsApplicationDocumentView";
import { Button, Drawer, ViewButton } from "@/components/common";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  downloadRtsDocument,
  getCitizenRtsDocumentDownloadUrl,
  getCitizenRtsDocumentViewUrl,
} from "@/lib/api/rts/rtsdocument.client";
import { PaymentCheckoutModal } from "@/components/modules/rts/citizen/PaymentCheckoutModal";
import { PaymentReceiptModal } from "@/components/modules/rts/citizen/PaymentReceiptModal";
import { getPaymentReceiptAction } from "@/app/[locale]/service/payment/actions";
import type { PaymentReceiptResult } from "@/lib/api/rts/rtspayment.service";
import type { Language } from "@/types/language.type";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";

type RtsCitizenViewDetailsDrawerProps = {
  application: RtsMisDashboardUserApplicationItem | null;
  language: Language;
  onClose: () => void;
  /** SSR-loaded for the dashboard route; the local fetch remains a fallback for other consumers. */
  detailData?: RtsApplicationDetailData | null;
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
  onOpenPayment,
  onOpenReceipt,
}: RtsCitizenViewDetailsDrawerProps) {
  const t = useTranslations("rts.citizenDashboard");
  const tCommon = useTranslations("common");
  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
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

  if (!application) return null;

  const resolvedDetail = detailData ?? detail;
  const isLoadingDetails = detailData ? false : loading;
  const normalizedStatus = normalizeStatus(application.status);
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

            {/* Dynamic Payment Status Card */}
            {(() => {
              const dynamicFees = resolvedDetail?.verification?.serviceFees ?? 50;
              const isPaid = resolvedDetail?.verification
                ? Boolean(resolvedDetail.verification.isPaid)
                : Boolean(
                    receiptModalData ||
                    resolvedDetail?.verification?.receiptNo ||
                    application.status?.toLowerCase().includes("payment received") ||
                    application.status?.toLowerCase().includes("payment success") ||
                    application.status?.toLowerCase().includes("payment completed") ||
                    application.status?.toLowerCase().includes("paid") ||
                    application.status?.toLowerCase().includes("शुल्क प्राप्त")
                  );
              const receiptNo = resolvedDetail?.verification?.receiptNo || receiptModalData?.receiptNo;

              return !isPaid ? (
                <section className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-amber-900">
                          {language === "mr" ? `शासकीय सेवा शुल्क प्रलंबित: ₹${dynamicFees}.00` : language === "hi" ? `शासकीय सेवा शुल्क लंबित: ₹${dynamicFees}.00` : `Government Fee Pending: ₹${dynamicFees}.00`}
                        </p>
                        <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                          {language === "mr"
                            ? "अर्जावर पुढील प्रक्रिया सुरू करण्यासाठी शुल्क भरणे आवश्यक आहे."
                            : language === "hi"
                              ? "आवेदन पर आगे की प्रक्रिया के लिए शुल्क का भुगतान अनिवार्य है।"
                              : "Payment is required for application processing to proceed."}
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
                      {language === "mr" ? "आताच शुल्क भरा" : language === "hi" ? "अभी शुल्क भरें" : "Pay Fee Now"}
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
                          {language === "mr" ? `शासकीय सेवा शुल्क प्राप्त (Fee Paid): ₹${dynamicFees}.00` : language === "hi" ? `शासकीय सेवा शुल्क प्राप्त: ₹${dynamicFees}.00` : `Government Fee Paid: ₹${dynamicFees}.00`}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-700">
                          {receiptNo ? `पावती क्र. : ${receiptNo}` : (language === "mr" ? "अधिकृत शासकीय ई-पावती उपलब्ध आहे" : language === "hi" ? "आधिकारिक सरकारी ई-रसीद उपलब्ध है" : "Official municipal e-receipt is available")}
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
                      className="rounded-lg text-xs font-bold text-emerald-800 border-emerald-300 bg-white hover:bg-emerald-50 shrink-0"
                    >
                      {language === "mr" ? "पावती पहा" : language === "hi" ? "रसीद देखें" : "View Receipt"}
                    </Button>
                  </div>
                </section>
              );
            })()}

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
                  {t("stages", { count: resolvedDetail?.approvalStages?.length || 0 })}
                </span>
              </div>
              {resolvedDetail?.approvalStages?.length ? (
                <ApprovalStagesTimeline
                  stages={resolvedDetail.approvalStages.map((stage) => ({
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
                  completedCount={resolvedDetail.completedStages || 0}
                  currentStageIndex={(() => {
                    const index = resolvedDetail.approvalStages.findIndex((stage) => stage.isCurrentStage);
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
          fees={resolvedDetail?.verification?.serviceFees ?? 50}
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
    </>
  );
}
