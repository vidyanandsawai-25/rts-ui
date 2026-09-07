"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  Layers,
  Loader2,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Modal, OfficialCertificateSheet } from "@/components/common";
import {
  getCertificatePreviewAction,
  issueCertificateAction,
  uploadManualCertificateAction,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type { CertificatePreviewResponse } from "@/types/rts/certificate.types";

import { useLocale, useTranslations } from "next-intl";

interface RtsCertificateApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  applicationNo: string;
  applicantName?: string;
  serviceName?: string;
  onApproved: () => void;
}

export default function RtsCertificateApprovalModal({
  isOpen,
  onClose,
  applicationId,
  applicationNo,
  applicantName,
  serviceName,
  onApproved,
}: RtsCertificateApprovalModalProps) {
  const locale = useLocale();
  const t = useTranslations("rts.applicationDashboard.processDrawer.certificateApproval");

  const [isPending, startTransition] = useTransition();
  const [loadingPreview, setLoadingPreview] = useState(true);

  const [previewData, setPreviewData] = useState<CertificatePreviewResponse | null>(null);
  const [officerInputs, setOfficerInputs] = useState<Record<string, string>>({
    OfficerRemark: "",
  });

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadedDocGuid, setUploadedDocGuid] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);

  const isManualMode = previewData?.certificateType === 2;

  const getOfficerFieldLabel = (field: NonNullable<CertificatePreviewResponse["requiredOfficerFields"]>[number]) =>
    locale === "en"
      ? field.fieldLabelEnglish || field.fieldLabelMarathi || field.fieldKey
      : field.fieldLabelMarathi || field.fieldLabelEnglish || field.fieldKey;

  const handleManualFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId.toString());

      const res = await uploadManualCertificateAction(formData);
      if (res.success && res.data) {
        setUploadedDocGuid(res.data.documentGuid);
        setUploadedFileName(res.data.fileName || file.name);
        setUploadedFileSize(res.data.fileSizeBytes || file.size);
        toast.success(t("uploadSuccess"));
      } else {
        toast.error(res.error || t("uploadFailed"));
      }
    } catch {
      toast.error(t("serverError"));
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Fetch initial preview
  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isCurrent = true;
    const loadInitialPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await getCertificatePreviewAction(applicationId, {});
        if (!isCurrent) return;
        if (res.success && res.data) {
          setPreviewData(res.data);
          // Initialize any required officer fields with default values
          if (res.data.requiredOfficerFields && res.data.requiredOfficerFields.length > 0) {
            setOfficerInputs((prev) => {
              const next = { ...prev };
              for (const f of res.data.requiredOfficerFields) {
                if (next[f.fieldKey] === undefined) {
                  next[f.fieldKey] = f.defaultValue || "";
                }
              }
              return next;
            });
          }
        } else {
          toast.error(res.error || t("previewLoadFailed"));
        }
      } catch {
        if (isCurrent) {
          toast.error(t("serverConnectionFailed"));
        }
      } finally {
        if (isCurrent) setLoadingPreview(false);
      }
    };

    void loadInitialPreview();
    return () => {
      isCurrent = false;
    };
  }, [isOpen, applicationId, t]);

  const loadPreview = async (inputs?: Record<string, string>) => {
    setLoadingPreview(true);
    try {
      const activeInputs = inputs || officerInputs;
      const res = await getCertificatePreviewAction(applicationId, activeInputs);
      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        toast.error(res.error || t("previewLoadFailed"));
      }
    } catch {
      toast.error(t("serverConnectionFailed"));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setOfficerInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleIssueAndApprove = () => {
    const isManual = isManualMode;

    // Validate mandatory officer fields from template configuration (only in non-manual mode)
    if (!isManual && previewData?.requiredOfficerFields && previewData.requiredOfficerFields.length > 0) {
      for (const field of previewData.requiredOfficerFields) {
        if (field.isMandatory && !officerInputs[field.fieldKey]?.trim()) {
          toast.warning(
            t("enterField", { field: getOfficerFieldLabel(field) })
          );
          return;
        }
      }
    }

    const finalRemark = (officerInputs["OfficerRemark"] || officerInputs["OfficerRemarks"] || "").trim();
    if (!finalRemark && (!previewData?.requiredOfficerFields || previewData.requiredOfficerFields.length === 0 || isManual)) {
      toast.warning(t("officerRemarkRequired"));
      return;
    }

    if (isManual && !uploadedDocGuid) {
      toast.warning(
        t("manualFileRequired")
      );
      return;
    }

    startTransition(async () => {
      const res = await issueCertificateAction(
        applicationId,
        officerInputs,
        undefined,
        finalRemark,
        true,
        isManual ? 2 : 1,
        uploadedDocGuid || undefined
      );

      if (res.success) {
        toast.success(
          isManual ? t("manualApprovalSuccess") : t("issueSuccess")
        );
        onApproved();
        onClose();
      } else {
        toast.error(res.error || t("issueFailed"));
      }
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("title")}
      maxWidth="2xl"
      contentClassName="w-[calc(100vw-2rem)] max-w-7xl h-[min(90vh,900px)]"
      bodyClassName="!overflow-hidden !p-0 !bg-slate-100"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Top Header Bar with RTS Branding */}
        <div className="bg-[#1e293b] text-white px-5 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-t-lg border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">
                {t("applicationNumber")}: <span className="text-white font-bold">{applicationNo}</span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {applicantName || t("applicantFallback")} | {serviceName || t("serviceFallback")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-semibold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t("livePreview")}
            </span>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-slate-100 lg:grid-cols-12">
          {/* Keep officer inputs compact so the certificate receives the primary review space on desktop. */}
          <div className="min-h-0 space-y-4 overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-inner lg:col-span-4">
            {/* Citizen Application Data Quick Reference Accordion */}
            {previewData?.citizenAutoValues && Object.keys(previewData.citizenAutoValues).length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span>📋</span>
                    {t("citizenSubmittedDetails")}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    {t("forReference")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">{t("applicantLabel")}</span>{" "}
                    <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.ApplicantName || applicantName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("mobileLabel")}</span>{" "}
                    <span className="font-semibold text-slate-800 font-mono">{previewData.citizenAutoValues.ApplicantMobile || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("dateLabel")}</span>{" "}
                    <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.AppliedDate || "-"}</span>
                  </div>
                  {previewData.citizenAutoValues.SurveyPlotNo && (
                    <div>
                      <span className="text-slate-500">{t("surveyCtsLabel")}</span>{" "}
                      <span className="font-bold text-emerald-800">{previewData.citizenAutoValues.SurveyPlotNo}</span>
                    </div>
                  )}
                  {previewData.citizenAutoValues.LandArea && (
                    <div>
                      <span className="text-slate-500">{t("areaLabel")}</span>{" "}
                      <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.LandArea}</span>
                    </div>
                  )}
                  {previewData.citizenAutoValues.ApplicantAddress && (
                    <div className="col-span-2 text-[10px]">
                      <span className="text-slate-500">{t("addressLabel")}</span>{" "}
                      <span className="text-slate-700">{previewData.citizenAutoValues.ApplicantAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#4b70a6]" />
                {t("officerDecisionInputs")}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t("officerDecisionDescription")}
              </p>
            </div>

            {/* Upload Manual Certificate Box (Mode 2: Manual Certificate) */}
            {isManualMode && (
              <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-600" />
                    {t("uploadManualFile")}
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                    {t("acceptedFileTypes")}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {t("uploadManualDescription")}
                </p>

                <input
                  type="file"
                  id="manual-certificate-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleManualFileUpload}
                  disabled={isUploadingDoc || isPending}
                  className="hidden"
                />

                {!uploadedDocGuid ? (
                  <label
                    htmlFor="manual-certificate-file-input"
                    className={`w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer transition text-center ${
                      isUploadingDoc ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {isUploadingDoc ? (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    )}
                    <span className="text-xs font-bold text-blue-700">
                      {isUploadingDoc
                        ? t("uploading")
                        : t("selectFile")}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {t("acceptedFileTypes")}
                    </span>
                  </label>
                ) : (
                  <div className="bg-white border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{uploadedFileName}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          {uploadedFileSize ? `${(uploadedFileSize / 1024).toFixed(1)} KB` : t("uploaded")} •
                          <span className="text-emerald-800 ml-1">{t("attached")}</span>
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor="manual-certificate-file-input"
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer shrink-0 underline"
                    >
                      {t("change")}
                    </label>
                  </div>
                )}

                <div className="bg-amber-100/70 border border-amber-300/80 rounded-lg p-2 text-[10.5px] text-amber-900 font-bold flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {t("collectionNotice")}
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Officer Fields configured in Template (hidden in manual mode) */}
            <div className="space-y-3">
              {!isManualMode && previewData?.requiredOfficerFields && previewData.requiredOfficerFields.length > 0 ? (
                previewData.requiredOfficerFields.map((field) => {
                  const val = officerInputs[field.fieldKey] || "";
                  const label = getOfficerFieldLabel(field);
                  return (
                    <div key={field.fieldKey} className="space-y-1">
                      <label htmlFor={`officer-field-${field.fieldKey}`} className="block text-xs font-bold text-slate-700">
                        {label}
                        {field.isMandatory && <span className="ml-0.5 text-red-500">*</span>}
                      </label>
                      {field.fieldType === "textarea" ? (
                        <textarea
                          id={`officer-field-${field.fieldKey}`}
                          value={val}
                          onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                          onBlur={() => loadPreview(officerInputs)}
                          placeholder={t("fieldPlaceholder", { field: label })}
                          className="min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
                        />
                      ) : field.fieldType === "select" && field.options && field.options.length > 0 ? (
                        <select
                          id={`officer-field-${field.fieldKey}`}
                          value={val}
                          onChange={(e) => {
                            handleInputChange(field.fieldKey, e.target.value);
                            loadPreview({ ...officerInputs, [field.fieldKey]: e.target.value });
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
                        >
                          <option value="">{t("selectOption")}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`officer-field-${field.fieldKey}`}
                          type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
                          value={val}
                          onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                          onBlur={() => loadPreview(officerInputs)}
                          placeholder={t("fieldPlaceholder", { field: label })}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
                        />
                      )}
                    </div>
                  );
                })
              ) : null}

              {/* Officer Remark Field (Standard fallback if not explicitly in config) */}
              {(!previewData?.requiredOfficerFields ||
                !previewData.requiredOfficerFields.some((f) =>
                  f.fieldKey.toLowerCase() === "officerremark" || f.fieldKey.toLowerCase() === "officerremarks"
                )) && (
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="certificate-officer-remark" className="block text-xs font-bold text-slate-700">
                    {t("officerRemark")}
                    <span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <textarea
                    id="certificate-officer-remark"
                    value={officerInputs["OfficerRemark"] || ""}
                    onChange={(event) => handleInputChange("OfficerRemark", event.target.value)}
                    onBlur={() => loadPreview(officerInputs)}
                    placeholder={t("officerRemarkPlaceholder")}
                    className="min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
                  />
                </div>
              )}
              <p className="text-[10px] text-slate-500">
                {t("previewRefreshHint")}
              </p>
            </div>
          </div>

          {/* Right Column: Live Real-time Certificate Preview */}
          <div className="relative flex min-h-0 flex-col items-center justify-start overflow-x-hidden overflow-y-auto p-4 lg:col-span-8">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                {isManualMode ? t("manualPreview") : t("liveCertificatePreview")}
              </span>

              {uploadedDocGuid && (
                <a
                  href={`/api/rts/documents/${uploadedDocGuid}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("openInNewTab")}
                </a>
              )}

              {!isManualMode && (
                <button
                  type="button"
                  onClick={() => loadPreview(officerInputs)}
                  className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold"
                  title={t("refresh")}
                >
                  <RotateCw className={`w-3 h-3 ${loadingPreview ? "animate-spin" : ""}`} />
                  {t("refresh")}
                </button>
              )}
            </div>

            {loadingPreview ? (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 shadow-xs text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b70a6] mb-2" />
                <span className="text-xs font-semibold">{t("generatingCertificate")}</span>
              </div>
            ) : isManualMode ? (
              <div className="w-full space-y-3">
                {/* Mandatory Statutory Notice */}
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 flex items-start gap-2.5 text-amber-950 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold">
                      {t("statutoryNoticeTitle")}
                    </h5>
                    <p className="text-xs font-semibold text-amber-900 mt-0.5">
                      {t("statutoryNoticeDescription")}
                    </p>
                  </div>
                </div>

                {uploadedDocGuid ? (
                  <div className="w-full bg-white rounded-xl border border-slate-300 shadow-xs p-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {uploadedFileName || t("uploadedCertificate")}
                        </span>
                      </div>
                      <a
                        href={`/api/rts/documents/${uploadedDocGuid}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#4b70a6] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t("download")}
                      </a>
                    </div>
                    {/* Embedded preview */}
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50 min-h-[500px]">
                      {uploadedFileName?.toLowerCase().endsWith(".pdf") ? (
                        <iframe
                          src={`/api/rts/documents/${uploadedDocGuid}/view`}
                          className="w-full h-[540px] border-none"
                          title={t("manualCertificatePdf")}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <img
                            src={`/api/rts/documents/${uploadedDocGuid}/view`}
                            alt={t("manualCertificate")}
                            className="max-h-[520px] object-contain rounded-md shadow-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-amber-300 p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-sm font-bold text-slate-800">
                        {t("manualNotUploaded")}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("manualNotUploadedDescription")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : previewData?.mergedHtml ? (
              <OfficialCertificateSheet htmlContent={previewData.mergedHtml} />
            ) : (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 text-slate-400">
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-xs">{t("noTemplate")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isManualMode ? t("manualApprovalHint") : t("digitalApprovalHint")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending} className="text-xs rounded-xl">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleIssueAndApprove}
              icon={Award}
              iconPosition="left"
              size="sm"
              type="button"
              isLoading={isPending}
              data-testid="approve-issue-button"
              disabled={
                isPending ||
                loadingPreview ||
                (isManualMode && (!uploadedDocGuid || !(officerInputs["OfficerRemark"] || "").trim())) ||
                (!isManualMode &&
                  Boolean(previewData?.requiredOfficerFields?.length) &&
                  previewData!.requiredOfficerFields.some(
                    (f) => f.isMandatory && !officerInputs[f.fieldKey]?.trim()
                  )) ||
                (!isManualMode &&
                  !previewData?.requiredOfficerFields?.length &&
                  !(officerInputs["OfficerRemark"] || "").trim())
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 rounded-xl px-4 py-2 cursor-pointer transition-all"
            >
              {/* <Award className="w-4 h-4" /> */}
              {isPending
                ? t("processing")
                : isManualMode
                  ? t("attachAndApprove")
                  : t("approveAndIssue")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
