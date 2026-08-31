"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  Search,
  User,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Drawer, Input } from "@/components/common";
import {
  getApplicationDetailAction,
  type RtsApplicationDetailData,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import {
  searchCitizenMisApplicationsAction,
} from "@/app/[locale]/service/dashboard/actions";
import {
  getPaymentStatusAction,
  getPaymentReceiptAction,
  getPaymentReceiptByNoAction,
} from "@/app/[locale]/service/payment/actions";
import { PaymentCheckoutModal } from "./PaymentCheckoutModal";
import { PaymentReceiptModal } from "./PaymentReceiptModal";
import PrintableCertificateModal from "./PrintableCertificateModal";
import CitizenResubmitDrawer from "./CitizenResubmitDrawer";
import type { PaymentReceiptResult, PaymentStatusResult } from "@/lib/api/rts/rtspayment.service";
import type { RtsApplicationApprovalStage } from "@/types/rts/application-approval.types";
import type { RtsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import { CreditCard, Receipt, ShieldCheck } from "lucide-react";

type ApplicationAndTrackingDrawerProps = {
  open: boolean;
  onClose: () => void;
  initialSearchValue?: string;
  initialReceiptValue?: string;
};

type StageVisual = "approved" | "rejected" | "current" | "pending";
type ApplicationStatusVisual = "approved" | "rejected" | "reverted" | "pending";

const COPY = {
  searchPlaceholder: "UPIC ID किंवा अर्ज क्रमांक प्रविष्ट करा / Enter UPIC or Application No",
  searchButton: "शोधा / Search",
  enterSearchValue: "कृपया UPIC ID किंवा अर्ज क्रमांक प्रविष्ट करा. / Please enter a UPIC ID or application number.",
  noApplication: "कोणतेही अर्ज आढळले नाहीत. / No applications found for this value.",
  unableToLoadApplications: "अर्जांची माहिती लोड करता आली नाही. / Unable to load applications.",
  unableToLoad: "अर्जाचा तपशील लोड करता आला नाही. / Unable to load application details.",
  loading: "शोधत आहे... / Loading applications...",
  loadingDetails: "तपशील लोड करत आहे... / Loading application details...",
  searchResults: "शोध निकाल / Search Results",
  selectApplication: "तपशील पाहण्यासाठी अर्जावर क्लिक करा. / Click an application to view details.",
  backToResults: "निकाल पृष्ठावर परत जा / Back to Results",
  applicationId: "अर्ज क्रमांक / Application ID",
  overallProgress: "एकूण प्रगती / Overall Progress",
  approvalStages: "मंजुरी टप्पे / Approval Stages",
  officer: "अधिकारी / Officer",
  remark: "शेरा / Remark",
  noRemarks: "कोणताही शेरा उपलब्ध नाही. / No remarks recorded.",
  approved: "मंजूर / Approved",
  rejected: "नामंजूर / Rejected",
  inProgress: "प्रगतीपथावर / In Progress",
  pending: "प्रलंबित / Pending",
} as const;

function isTerminalStage(stage: RtsApplicationApprovalStage): boolean {
  const status = stage.status?.trim().toLowerCase() ?? "";
  return status.includes("reject") || status.includes("return") || status.includes("revert");
}

function isPaymentStage(stage: RtsApplicationApprovalStage): boolean {
  return (stage.status?.trim().toLowerCase() ?? "").includes("payment");
}

function statusVisual(
  stage: RtsApplicationApprovalStage,
  index: number,
  terminalStageIndex: number
): StageVisual {
  const status = stage.status?.trim().toLowerCase() ?? "";

  // A terminal decision stops visual progression even if the API flags a later stage as current.
  if (terminalStageIndex >= 0 && index > terminalStageIndex) return "pending";
  if (status.includes("reject")) return "rejected";
  if (isPaymentStage(stage)) return "current";
  if (status.includes("approved") || status.includes("verified") || status.includes("completed")) {
    return "approved";
  }
  if (stage.isCurrentStage || status.includes("progress") || status.includes("correction")) return "current";
  return "pending";
}

function statusLabel(visual: StageVisual): string {
  if (visual === "approved") return COPY.approved;
  if (visual === "rejected") return COPY.rejected;
  if (visual === "current") return COPY.inProgress;
  return COPY.pending;
}

function applicationStatusVisual(status: string): ApplicationStatusVisual {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes("reject") || normalizedStatus.includes("disapprove")) return "rejected";
  if (normalizedStatus.includes("revert") || normalizedStatus.includes("return")) return "reverted";
  if (
    normalizedStatus.includes("approve") ||
    normalizedStatus.includes("accept") ||
    normalizedStatus.includes("process") ||
    normalizedStatus.includes("done") ||
    normalizedStatus.includes("verified")
  ) {
    return "approved";
  }
  return "pending";
}

function ApplicationStatusIndicator({ status }: { status: string }) {
  const visual = applicationStatusVisual(status);
  const styles = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-rose-200 bg-rose-50 text-rose-700",
    reverted: "border-orange-300 bg-orange-50 text-orange-800",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
  }[visual];
  const Icon = visual === "approved" ? CheckCircle2 : visual === "rejected" ? XCircle : visual === "reverted" ? RotateCcw : Clock3;

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${styles}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function stageStyle(visual: StageVisual) {
  if (visual === "approved") {
    return {
      card: "border-emerald-300 bg-emerald-50/40",
      marker: "bg-emerald-500 text-white",
      badge: "bg-emerald-100 text-emerald-700",
      connector: "bg-emerald-300",
    };
  }
  if (visual === "rejected") {
    return {
      card: "border-rose-300 bg-rose-50/40",
      marker: "bg-rose-500 text-white",
      badge: "bg-rose-100 text-rose-700",
      connector: "bg-rose-300",
    };
  }
  if (visual === "current") {
    return {
      card: "border-amber-300 bg-amber-50/40",
      marker: "bg-amber-500 text-white",
      badge: "bg-amber-100 text-amber-700",
      connector: "bg-amber-300",
    };
  }
  return {
    card: "border-slate-200 bg-white",
    marker: "bg-slate-200 text-slate-600",
    badge: "bg-slate-100 text-slate-600",
    connector: "bg-slate-200",
  };
}

function formatStageTimestamp(value: string | null | undefined): { date: string; time: string } | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    date: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date),
    time: new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(date),
  };
}

function formatSubmittedDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function progressPercentage(detail: RtsApplicationDetailData): number {
  const total = detail.totalApprovalStages ?? detail.approvalStages?.length ?? 0;
  if (total <= 0) return 0;
  return Math.round(((detail.completedStages ?? 0) / total) * 100);
}

export default function ApplicationAndTrackingDrawer({
  open,
  onClose,
  initialSearchValue,
  initialReceiptValue,
}: ApplicationAndTrackingDrawerProps) {
  const t = useTranslations("rts.citizenHeader");
  const [searchValue, setSearchValue] = useState("");
  const [applications, setApplications] = useState<RtsMisDashboardUserApplicationItem[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<RtsMisDashboardUserApplicationItem | null>(null);
  const [detail, setDetail] = useState<RtsApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentStatusResult | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptResult | null>(null);

  useEffect(() => {
    if (open) {
      if (initialReceiptValue && initialReceiptValue.trim()) {
        const rcpNo = initialReceiptValue.trim();
        setLoading(true);
        setError("");
        void (async () => {
          try {
            const res = await getPaymentReceiptByNoAction(rcpNo);
            if (res.success && res.data) {
              setReceiptModalData(res.data);
              if (res.data.applicationNo) {
                setSearchValue(res.data.applicationNo);
                const searchRes = await searchCitizenMisApplicationsAction(res.data.applicationNo);
                if (searchRes?.success && searchRes.items.length > 0) {
                  setApplications(searchRes.items);
                  void selectApplication(searchRes.items[0]);
                }
              }
            } else {
              setSearchValue(rcpNo);
              const response = await searchCitizenMisApplicationsAction(rcpNo);
              if (response?.success && response.items.length > 0) {
                setApplications(response.items);
                void selectApplication(response.items[0]);
              } else {
                setError(COPY.noApplication);
              }
            }
          } catch {
            setError(COPY.unableToLoadApplications);
          } finally {
            setLoading(false);
          }
        })();
      } else if (initialSearchValue && initialSearchValue.trim()) {
        const val = initialSearchValue.trim();
        setSearchValue(val);
        setApplications([]);
        setSelectedApplication(null);
        setDetail(null);
        setPaymentInfo(null);
        setError("");
        setLoading(true);

        if (val.toUpperCase().startsWith("REC") || val.includes("/")) {
          void (async () => {
            try {
              const res = await getPaymentReceiptByNoAction(val);
              if (res.success && res.data) {
                setReceiptModalData(res.data);
              }
              const response = await searchCitizenMisApplicationsAction(val);
              if (response?.success && response.items.length > 0) {
                setApplications(response.items);
                if (response.items.length === 1) {
                  void selectApplication(response.items[0]);
                }
              } else if (!res.data) {
                setError(COPY.noApplication);
              }
            } catch {
              setError(COPY.unableToLoadApplications);
            } finally {
              setLoading(false);
            }
          })();
        } else {
          void (async () => {
            try {
              const response = await searchCitizenMisApplicationsAction(val);
              if (!response || !response.success || response.items.length === 0) {
                setError(COPY.noApplication);
                return;
              }
              setApplications(response.items);
              if (response.items.length === 1) {
                void selectApplication(response.items[0]);
              } else if (response.items.length > 1) {
                const exact = response.items.find(
                  (item) => item.applicationNo.trim().toLowerCase() === val.toLowerCase()
                );
                if (exact) {
                  void selectApplication(exact);
                }
              }
            } catch {
              setError(COPY.unableToLoadApplications);
            } finally {
              setLoading(false);
            }
          })();
        }
      }
    }
  }, [open, initialSearchValue, initialReceiptValue]);

  const searchApplications = async () => {
    const normalizedSearchValue = searchValue.trim();
    if (!normalizedSearchValue) {
      setError(COPY.enterSearchValue);
      return;
    }

    setApplications([]);
    setSelectedApplication(null);
    setDetail(null);
    setPaymentInfo(null);
    setError("");
    setLoading(true);

    try {
      const response = await searchCitizenMisApplicationsAction(normalizedSearchValue);
      if (!response) {
        setError(COPY.noApplication);
        return;
      }
      if (!response.success) {
        setError(response.error || COPY.noApplication);
        return;
      }
      setApplications(response.items);
      if (response.items.length === 0) {
        setError(COPY.noApplication);
      } else if (response.items.length === 1) {
        void selectApplication(response.items[0]);
      } else {
        const exact = response.items.find(
          (item) => item.applicationNo.trim().toLowerCase() === normalizedSearchValue.toLowerCase()
        );
        if (exact) {
          void selectApplication(exact);
        }
      }
    } catch {
      setError(COPY.unableToLoadApplications);
    } finally {
      setLoading(false);
    }
  };

  const selectApplication = async (application: RtsMisDashboardUserApplicationItem) => {
    setSelectedApplication(application);
    setDetail(null);
    setPaymentInfo(null);
    setError("");
    setLoading(true);

    const numericId = parseInt(application.applicationNo.replace(/\D/g, ''), 10);
    if (Number.isFinite(numericId) && numericId > 0) {
      getPaymentStatusAction(numericId).then((res) => {
        if (res.success && res.data) {
          setPaymentInfo(res.data);
        }
      }).catch(() => {});
    }

    try {
      const response = await getApplicationDetailAction(application.applicationNo);
      if (!response) {
        setError(COPY.unableToLoad);
        return;
      }
      setDetail(response);
    } catch {
      setError(COPY.unableToLoad);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchValue("");
    setApplications([]);
    setSelectedApplication(null);
    setDetail(null);
    setPaymentInfo(null);
    setError("");
    setLoading(false);
    onClose();
  };

  const returnToResults = () => {
    setSelectedApplication(null);
    setDetail(null);
    setPaymentInfo(null);
    setError("");
    setLoading(false);
  };

  const stages = detail?.approvalStages ?? [];
  const hasWorkflowStages = stages.length > 0;
  const progress = detail ? progressPercentage(detail) : 0;
  const terminalStageIndex = stages.findIndex(isTerminalStage);

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">{t("applicationsTitle")}</h3>
        </div>
      }
    >
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="w-full max-w-[420px] rounded-xl border border-fuchsia-100 bg-white p-2 shadow-sm">
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  fullWidth
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && void searchApplications()}
                  placeholder={COPY.searchPlaceholder}
                  className="border-fuchsia-300 focus:border-fuchsia-500 focus:ring-fuchsia-200"
                />
              </div>
              <Button
                type="button"
                onClick={() => void searchApplications()}
                aria-label={COPY.searchButton}
                className="bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!selectedApplication && (
            <aside className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              <p className="font-semibold">{t("trackingSearchHelpTitle")}</p>
              <p className="mt-0.5">{t("trackingSearchHelp")}</p>
            </aside>
          )}

          {error && <p className="border-l-4 border-rose-400 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
          {loading && <p className="py-12 text-center text-xs font-medium text-slate-500">{selectedApplication ? COPY.loadingDetails : COPY.loading}</p>}

          {applications.length > 0 && !selectedApplication && !loading && (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-800">{COPY.searchResults}</h4>
                <p className="text-xs text-slate-500">{COPY.selectApplication}</p>
              </div>
              <div className="grid gap-2">
                {applications.map((application, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => void selectApplication(application)}
                    className="rounded-lg border border-fuchsia-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-fuchsia-400 hover:bg-fuchsia-50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800">{application.serviceName}</p>
                        <ApplicationStatusIndicator status={application.status} />
                      </div>
                      <p className="mt-1 text-xs font-medium text-fuchsia-700">{application.applicationNo}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{formatSubmittedDate(application.submittedDate)}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedApplication && detail && !loading && (
            <>
              <button
                type="button"
                onClick={returnToResults}
                className="group inline-flex items-center gap-2 self-start rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-xs font-bold text-fuchsia-700 shadow-sm transition hover:border-fuchsia-400 hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-100 transition-transform group-hover:-translate-x-0.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
                {COPY.backToResults}
              </button>
              <section className="rounded-lg border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-violet-50 p-3 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium text-slate-800">{selectedApplication.serviceName}</h4>
                  <ApplicationStatusIndicator status={selectedApplication.status} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{formatSubmittedDate(selectedApplication.submittedDate)}</p>
                <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="tracked-application-id">
                  {COPY.applicationId}
                </label>
                <input
                  id="tracked-application-id"
                  readOnly
                  value={selectedApplication.applicationNo}
                  className="mt-1 h-8 w-full rounded border-2 border-fuchsia-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none"
                />
                {hasWorkflowStages && (
                  <>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>{COPY.overallProgress}</span>
                      <span className="font-bold text-fuchsia-700">{progress}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-600" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                )}

                {/* Government Payment Status & Pay Now Banner */}
                {paymentInfo?.isFeeRequired === false || (paymentInfo?.requiredFee !== undefined && Number(paymentInfo.requiredFee) <= 0) ? (
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-sm flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Free Municipal Service / मोफत शासकीय सेवा
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        No payment required for this service • कोणतेही शुल्क आवश्यक नाही
                      </div>
                    </div>
                  </div>
                ) : paymentInfo?.isFeeRequired === true && Number(paymentInfo.requiredFee) > 0 ? (
                  <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${paymentInfo?.paymentStatus === 'SUCCESS' || paymentInfo?.paymentStatus === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'}`}>
                        {paymentInfo?.paymentStatus === 'SUCCESS' || paymentInfo?.paymentStatus === 'Success' ? <ShieldCheck className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {paymentInfo?.paymentStatus === 'SUCCESS' || paymentInfo?.paymentStatus === 'Success'
                            ? `Fee Paid / भरलेले शुल्क: ₹${Number(paymentInfo.requiredFee).toFixed(2)}`
                            : `Government Fee / शासकीय शुल्क: ₹${Number(paymentInfo.requiredFee).toFixed(2)}`}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {paymentInfo?.paymentStatus === 'SUCCESS' || paymentInfo?.paymentStatus === 'Success'
                            ? `Receipt: ${paymentInfo?.receiptNo || 'Confirmed'} • Paid Online`
                            : 'Payment Status: Pending / शुल्क बाकी'}
                        </div>
                      </div>
                    </div>

                    {paymentInfo?.paymentStatus === 'SUCCESS' || paymentInfo?.paymentStatus === 'Success' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (paymentInfo?.receiptNo) {
                            const resByNo = await getPaymentReceiptByNoAction(paymentInfo.receiptNo);
                            if (resByNo.success && resByNo.data) {
                              setReceiptModalData(resByNo.data);
                              return;
                            }
                          }
                          const numericId = parseInt(selectedApplication.applicationNo.replace(/\D/g, ''), 10);
                          const res = await getPaymentReceiptAction(numericId);
                          if (res.success && res.data) {
                            setReceiptModalData(res.data);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        View Receipt / पावती
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Now / शुल्क भरा
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Issued Official Certificate Banner if Approved */}
                {((selectedApplication.status && selectedApplication.status.toLowerCase() === 'approved') || (detail?.applicationStatus && detail.applicationStatus.toLowerCase() === 'approved')) && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-900">
                          अधिकृत प्रमाणपत्र जारी झाले आहे (Certificate Issued)
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium">
                          डिजिटल स्वाक्षरी व QR कोडसह अधिकृत प्रमाणपत्र उपलब्ध आहे
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Certificate
                    </button>
                  </div>
                )}
                {/* Reverted / Correction Required Alert Banner */}
                {((selectedApplication.status && (selectedApplication.status.toLowerCase().includes('revert') || selectedApplication.status.toLowerCase().includes('return'))) || (detail?.applicationStatus && (detail.applicationStatus.toLowerCase().includes('revert') || detail.applicationStatus.toLowerCase().includes('return')))) && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-orange-50/90 border border-orange-200 shadow-sm flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-orange-950">
                          अर्ज त्रुटी दुरुस्तीसाठी परत पाठवला आहे (Application Reverted)
                        </div>
                        <div className="text-[11px] text-orange-800 font-medium mt-0.5">
                          अधिकाऱ्याने अर्जात अतिरिक्त माहिती किंवा कागदपत्रांची पूर्तता करण्यास सांगितले आहे.
                        </div>
                        {detail?.remark && (
                          <div className="mt-2 p-2 rounded-lg bg-white/80 border border-orange-200 text-xs text-orange-900">
                            <strong>अधिकाऱ्याचा शेरा:</strong> {detail.remark}
                          </div>
                        )}
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setShowResubmitModal(true)}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            अर्जात दुरुस्ती करा व पुन्हा सादर करा (Edit & Resubmit)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disapproved / Rejected Alert Banner */}
                {((selectedApplication.status && (selectedApplication.status.toLowerCase().includes('reject') || selectedApplication.status.toLowerCase().includes('disapprove'))) || (detail?.applicationStatus && (detail.applicationStatus.toLowerCase().includes('reject') || detail.applicationStatus.toLowerCase().includes('disapprove')))) && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 shadow-sm flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-rose-950">
                          अर्ज नामंजूर केला आहे (Application Disapproved / Rejected)
                        </div>
                        <div className="text-[11px] text-rose-800 font-medium mt-0.5">
                          सदर अर्ज नियमांनुसार किंवा अपात्रतेमुळे नामंजूर करण्यात आला आहे.
                        </div>
                        {detail?.remark && (
                          <div className="mt-2 p-2 rounded-lg bg-white/80 border border-rose-200 text-xs text-rose-900">
                            <strong>नामंजूर करण्याचे कारण / शेरा:</strong> {detail.remark}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {hasWorkflowStages && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-300 to-fuchsia-500" />
                    <h4 className="text-sm font-medium text-slate-700">{COPY.approvalStages}</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-fuchsia-500 to-fuchsia-300" />
                  </div>

                  <div className="space-y-2">
                    {stages.map((stage, index) => {
                      const visual = statusVisual(stage, index, terminalStageIndex);
                      const styles = stageStyle(visual);
                      const hasPaymentStatus = visual === "current" && isPaymentStage(stage);
                      const stageTimestamp = formatStageTimestamp(stage.createdDate ?? stage.completedDate);
                      const officerName = [stage.firstName, stage.lastName].filter(Boolean).join(" ") || stage.userName || stage.assignedToName || "-";

                      return (
                        <div key={stage.approvalFlowStageId} className="relative pl-9">
                          <div className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${styles.marker}`}>
                            {visual === "approved" ? <CheckCircle2 className="h-4 w-4" /> : visual === "rejected" ? <XCircle className="h-4 w-4" /> : stage.stageOrder}
                          </div>
                          {index < stages.length - 1 && <div className={`absolute left-[13px] top-7 h-[calc(100%-12px)] w-0.5 ${styles.connector}`} />}
                          <article className={`rounded-lg border-2 px-4 py-3 shadow-sm ${hasPaymentStatus ? "border-lime-300 bg-lime-50/60" : styles.card}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h5 className="font-medium text-slate-800">{stage.stageName}</h5>
                                <p className="mt-1 text-xs text-slate-600">{COPY.officer}: <span className="font-semibold">{officerName}</span></p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}>{statusLabel(visual)}</span>
                            </div>
                            {stageTimestamp && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>{stageTimestamp.date}</span>
                                <Clock3 className="ml-2 h-3.5 w-3.5" />
                                <span>{stageTimestamp.time}</span>
                              </div>
                            )}
                            <div className="mt-3 rounded-lg border border-fuchsia-100 bg-fuchsia-50/60 px-3 py-2 text-xs text-slate-600">
                              <span className="font-medium">{COPY.remark}: </span>
                              {stage.remark?.trim() || COPY.noRemarks}
                            </div>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showPaymentModal && selectedApplication && paymentInfo?.isFeeRequired === true && Number(paymentInfo.requiredFee) > 0 && (
        <PaymentCheckoutModal
          applicationId={parseInt(selectedApplication.applicationNo.replace(/\D/g, ''), 10)}
          applicationNo={selectedApplication.applicationNo}
          serviceName={selectedApplication.serviceName}
          customerName={(selectedApplication as any).applicantName || (detail as any)?.applicantName}
          customerMobile={(selectedApplication as any).mobileNo || (detail as any)?.mobileNo}
          fees={paymentInfo.requiredFee}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(receipt) => {
            setReceiptModalData(receipt);
            setPaymentInfo((prev) => prev ? { ...prev, paymentStatus: 'Success', receiptNo: receipt.receiptNo } : null);
          }}
        />
      )}

      {receiptModalData && (
        <PaymentReceiptModal
          receipt={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {showCertificateModal && selectedApplication && (
        <PrintableCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          applicationNo={selectedApplication.applicationNo}
        />
      )}

      {showResubmitModal && selectedApplication && (
        <CitizenResubmitDrawer
          isOpen={showResubmitModal}
          onClose={() => setShowResubmitModal(false)}
          applicationId={detail?.verification?.applicationId || parseInt(selectedApplication.applicationNo.replace(/\D/g, ""), 10) || 0}
          applicationNo={selectedApplication.applicationNo}
          serviceId={detail?.verification?.serviceId || (selectedApplication as any)?.serviceId || (selectedApplication as any)?.govtServiceCode}
          serviceName={selectedApplication.serviceName}
          officerRemark={detail?.remark || stages.find((s) => s.remark)?.remark || ""}
          answerGroups={detail?.answerGroups || []}
          documents={detail?.documents || []}
          onSuccess={() => {
            void selectApplication(selectedApplication);
          }}
        />
      )}
    </Drawer>
  );
}
