"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  History,
  Paperclip,
  Shield,
  Sparkles,
  Undo2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Badge, Card } from "@/components/common";
import RtsCertificateApprovalModal from "./RtsCertificateApprovalModal";
import PrintableCertificateModal from "../citizen/PrintableCertificateModal";
import type {
  RtsApplicationDetailData,
  SubmitApplicationActionResult,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type { WorkflowActionType } from "@/types/rts/workflow.types";

interface RtsApplicationDetailsProps {
  data: RtsApplicationDetailData;
  locale: string;
  submitAction: (
    applicationNo: string,
    actionType: WorkflowActionType,
    remark: string
  ) => Promise<SubmitApplicationActionResult>;
}

const ACTION_LABEL_KEY: Record<WorkflowActionType, string> = {
  verifyDocument: "applicationDetails.actions.verifyDocument",
  approve: "applicationDetails.actions.approve",
  reject: "applicationDetails.actions.reject",
  return: "applicationDetails.actions.return",
  pay: "applicationDetails.actions.recordPayment",
};

function statusVariant(status: string): "success" | "destructive" | "warning" | "secondary" {
  const normalized = status.toLowerCase();
  if (normalized.includes("approv")) return "success";
  if (normalized.includes("reject")) return "destructive";
  if (normalized.includes("return")) return "warning";
  return "secondary";
}

const DECISION_BUTTON_ORDER = ["pay", "approve", "reject", "return"] as const satisfies readonly WorkflowActionType[];

const DECISION_BUTTON_STYLE: Record<(typeof DECISION_BUTTON_ORDER)[number], string> = {
  pay: "bg-blue-600 hover:bg-blue-700",
  approve: "bg-green-600 hover:bg-green-700",
  reject: "bg-red-600 hover:bg-red-700",
  return: "bg-amber-500 hover:bg-amber-600",
};

export default function RtsApplicationDetails({
  data,
  locale,
  submitAction,
}: RtsApplicationDetailsProps) {
  const t = useTranslations("rts");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [remark, setRemark] = useState("");
  const [documentChecks, setDocumentChecks] = useState<Record<number, boolean>>({});
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isPrintCertModalOpen, setIsPrintCertModalOpen] = useState(false);

  const { workflow, answerGroups, applicationNo, applicationStatus, serviceName, departmentName } =
    data;

  const documentAnswers = useMemo(
    () => answerGroups.flatMap((group) => group.answers.filter((a) => a.documentGuid)),
    [answerGroups]
  );

  const availableActions = workflow?.availableActions ?? [];
  const normalizedStatus = applicationStatus.toLowerCase();
  // Only a "pending" application is actionable by an officer. Approved/rejected
  // are terminal; "returned" hands the application back to the citizen to
  // correct and resubmit, so it isn't actionable again until that happens
  // (server should flip status back to "pending" on resubmit).
  const isActionable = normalizedStatus === "pending";

  const currentStage = workflow?.currentStage ?? null;

  // Has the current stage's document set already been verified this time
  // through the stage? (relevant when the citizen Returns and resubmits, and
  // the application re-enters a stage it was already verified at previously.)
  const hasVerifiedCurrentStage = useMemo(() => {
    if (!workflow?.currentStage) return false;

    const enteredAt = workflow.stageEnteredAt ? new Date(workflow.stageEnteredAt).getTime() : 0;

    return workflow.history.some(
      (entry) =>
        entry.actionType === "VerifyDocument" &&
        entry.toStageId === workflow.currentStage!.id &&
        new Date(entry.actionDate).getTime() >= enteredAt
    );
  }, [workflow]);

  const needsVerificationGate =
    !!currentStage?.canVerifyDocument &&
    !hasVerifiedCurrentStage &&
    availableActions.includes("verifyDocument");

  const decisionActions = DECISION_BUTTON_ORDER.filter((action) =>
    availableActions.includes(action)
  );

  const allDocumentsReviewed =
    documentAnswers.length === 0 ||
    documentAnswers.every((doc) => documentChecks[doc.fieldDefinitionId]);

  const handleSubmit = (actionType: WorkflowActionType) => {
    if (!remark.trim()) {
      toast.error(t("applicationDetails.remarkRequired"));
      return;
    }

    startTransition(async () => {
      const result = await submitAction(applicationNo, actionType, remark.trim());

      if (result.success) {
        toast.success(t("applicationDetails.actionSubmitted"));
        setRemark("");
        setDocumentChecks({});
        router.refresh();
      } else {
        toast.error(result.message || t("applicationDetails.actionFailed"));
      }
    });
  };

  const handleVerifySubmit = () => {
    if (!allDocumentsReviewed) {
      toast.error(t("applicationDetails.verifyPage.allReviewedRequired"));
      return;
    }

    handleSubmit("verifyDocument");
  };

  const toggleDocumentCheck = (fieldDefinitionId: number) =>
    setDocumentChecks((prev) => ({ ...prev, [fieldDefinitionId]: !prev[fieldDefinitionId] }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/rts/dashboard/rts-applications`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{applicationNo}</h1>
              <Badge variant={statusVariant(applicationStatus)}>{applicationStatus}</Badge>
            </div>
            <p className="text-xs text-slate-500">
              {serviceName ?? t("applicationDetails.unknownService")}
              {departmentName ? ` • ${departmentName}` : ""}
            </p>
            {workflow?.currentStage && (
              <p className="mt-0.5 text-xs font-semibold text-[#4b70a6]">
                {t("applicationDetails.currentStage")}: {workflow.currentStage.stageName}
              </p>
            )}
          </div>
        </div>

        {workflow?.currentStage && isActionable && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="h-4 w-4 text-slate-400" />
            {t("applicationDetails.slaLabel")}: {workflow.currentStage.slaDays}{" "}
            {t("applicationDetails.days")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
              {t("applicationDetails.submittedAnswers")}
            </h3>

            {answerGroups.length === 0 ? (
              <p className="text-xs text-slate-400">{t("applicationDetails.noAnswers")}</p>
            ) : (
              <div className="space-y-5">
                {answerGroups.map((group) => (
                  <div key={group.groupTitle}>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4b70a6]">
                      {group.groupTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.answers
                        .filter((a) => !a.documentGuid)
                        .map((answer) => (
                          <div key={answer.fieldDefinitionId} className="text-xs">
                            <p className="font-semibold text-slate-400">{answer.label}</p>
                            <p className="mt-0.5 truncate whitespace-pre-wrap font-bold text-slate-800">
                              {answer.displayValue}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
              <Paperclip className="h-4 w-4" />
              {t("applicationDetails.attachedDocuments")}
            </h3>
            {documentAnswers.length === 0 ? (
              <p className="text-xs text-slate-400">
                {t("applicationDetails.noDocumentsForService")}
              </p>
            ) : (
              <div className="space-y-3">
                {documentAnswers.map((doc) => (
                  <div
                    key={doc.fieldDefinitionId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">{doc.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-800">
              <History className="h-4 w-4" />
              {t("applicationDetails.movementHistory")}
            </h3>

            {!workflow || workflow.history.length === 0 ? (
              <p className="text-xs text-slate-400">{t("applicationDetails.noHistory")}</p>
            ) : (
              <div className="relative ml-4 space-y-6 border-l border-slate-200">
                {workflow.history.map((entry) => (
                  <div key={entry.id} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[#4b70a6] bg-white" />
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>{entry.actionType}</span>
                        {entry.toStageName && (
                          <span className="text-slate-400">→ {entry.toStageName}</span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(entry.actionDate).toLocaleString()}
                        </span>
                      </div>
                      {entry.performedByUserName && (
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {t("applicationDetails.by")} {entry.performedByUserName}
                        </p>
                      )}
                      {entry.remark && (
                        <div className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs italic text-slate-600">
                          &ldquo;{entry.remark}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="sticky top-24 border border-[#4b70a6]/20 bg-slate-50/50 p-5 shadow-md">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-[#4b70a6]">
              <Shield className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {t("applicationDetails.decisionControl")}
              </h3>
            </div>

            {isActionable && !needsVerificationGate && decisionActions.length > 0 && (
              <p className="mb-4 rounded-lg bg-blue-50 p-3 text-[11px] leading-relaxed text-slate-600">
                {t("applicationDetails.decisionGuidance", {
                  stage: currentStage?.stageName ?? "",
                })}
              </p>
            )}

            {!isActionable ? (
              <div className="rounded-xl bg-slate-100/50 py-6 text-center text-slate-400">
                {normalizedStatus === "approved" && (
                  <>
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-xs font-bold text-slate-600 mb-3">
                      {t("applicationDetails.applicationClosed")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPrintCertModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      <FileCheck2 className="h-4 w-4" />
                      अधिकृत प्रमाणपत्र पहा व प्रिंट करा
                    </button>
                  </>
                )}
                {normalizedStatus === "rejected" && (
                  <>
                    <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                    <p className="text-xs font-bold text-slate-600">
                      {t("applicationDetails.applicationClosed")}
                    </p>
                  </>
                )}
                {normalizedStatus === "returned" && (
                  <>
                    <Undo2 className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                    <p className="text-xs font-bold text-slate-600">
                      {t("applicationDetails.awaitingResubmission")}
                    </p>
                  </>
                )}
              </div>
            ) : needsVerificationGate ? (
              <div className="space-y-4">
                <p className="rounded-lg bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
                  {t("applicationDetails.verifyGateDescription")}
                </p>

                {documentAnswers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500">
                      {t("applicationDetails.verifyPage.reviewed")}
                    </p>
                    {documentAnswers.map((doc) => (
                      <label
                        key={doc.fieldDefinitionId}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-50"
                      >
                        <span className="text-xs font-bold text-slate-700">{doc.label}</span>
                        <input
                          type="checkbox"
                          checked={!!documentChecks[doc.fieldDefinitionId]}
                          onChange={() => toggleDocumentCheck(doc.fieldDefinitionId)}
                          className="h-4 w-4"
                        />
                      </label>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="flex justify-between text-xs font-semibold text-slate-500">
                    {t("applicationDetails.remark")}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={t("applicationDetails.remarkPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 placeholder-slate-400 focus:border-[#4b70a6] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isPending || !allDocumentsReviewed}
                  onClick={handleVerifySubmit}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4b70a6] to-[#3d5a8a] py-2.5 text-xs font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending
                    ? t("applicationDetails.submitting")
                    : t("applicationDetails.verifyPage.submit")}
                </button>
              </div>
            ) : decisionActions.length === 0 ? (
              <p className="py-6 text-center text-xs font-semibold text-slate-400">
                {t("applicationDetails.noActionsAvailable")}
              </p>
            ) : (
              <div className="space-y-4">
                {/* Certificate Decision Feature for Approval Stages */}
                {decisionActions.includes("approve") && (
                  <div className="p-3 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        प्रमाणपत्र जारी करणे व अंतिम मंजुरी:
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700">
                      प्रमाणपत्रातील जावक क्र., मुदत व अटी भरून डिजिटल स्वाक्षरीने लगेच जारी करा.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCertModalOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      प्रमाणपत्र निर्णय व पूर्वदृश्य (Certificate & Sign)
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="flex justify-between text-xs font-semibold text-slate-500">
                    {t("applicationDetails.remark")}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder={t("applicationDetails.remarkPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 placeholder-slate-400 focus:border-[#4b70a6] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {decisionActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSubmit(action)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${DECISION_BUTTON_STYLE[action]}`}
                    >
                      {isPending ? t("applicationDetails.submitting") : t(ACTION_LABEL_KEY[action])}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Certificate Approval Modal */}
      {isCertModalOpen && (
        <RtsCertificateApprovalModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          applicationId={workflow?.applicationId || 0}
          applicationNo={applicationNo}
          serviceName={serviceName || ""}
          onApproved={() => {
            router.refresh();
          }}
        />
      )}

      {/* Printable Certificate Modal */}
      {isPrintCertModalOpen && (
        <PrintableCertificateModal
          isOpen={isPrintCertModalOpen}
          onClose={() => setIsPrintCertModalOpen(false)}
          applicationNo={applicationNo}
        />
      )}
    </div>
  );
}
