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

import { useLocale } from "next-intl";

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
  const currentLocale = useLocale();
  const isMr = currentLocale === "mr";

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

  const handleManualFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isMr ? "फाईलचा आकार जास्तीत जास्त १० MB असावा." : "File size must not exceed 10 MB.");
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
        toast.success(isMr ? "मॅन्युअल प्रमाणपत्र फाईल यशस्वीरीत्या अपलोड झाली!" : "Manual certificate uploaded successfully!");
      } else {
        toast.error(res.error || (isMr ? "फाईल अपलोड करताना अडचण आली." : "Failed to upload file."));
      }
    } catch {
      toast.error(isMr ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server error during file upload.");
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
          toast.error(res.error || (isMr ? "प्रमाणपत्र पूर्वदृश्य मिळवण्यात अडचण आली." : "Failed to load certificate preview."));
        }
      } catch {
        if (isCurrent) {
          toast.error(isMr ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server connection failed.");
        }
      } finally {
        if (isCurrent) setLoadingPreview(false);
      }
    };

    void loadInitialPreview();
    return () => {
      isCurrent = false;
    };
  }, [isOpen, applicationId, isMr]);

  const loadPreview = async (inputs?: Record<string, string>) => {
    setLoadingPreview(true);
    try {
      const activeInputs = inputs || officerInputs;
      const res = await getCertificatePreviewAction(applicationId, activeInputs);
      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        toast.error(res.error || (isMr ? "प्रमाणपत्र पूर्वदृश्य मिळवण्यात अडचण आली." : "Failed to load certificate preview."));
      }
    } catch {
      toast.error(isMr ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server connection failed.");
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
            isMr
              ? `कृपया '${field.fieldLabelMarathi || field.fieldKey}' माहिती प्रविष्ट करा.`
              : `Please enter '${field.fieldLabelEnglish || field.fieldKey}'.`
          );
          return;
        }
      }
    }

    const finalRemark = (officerInputs["OfficerRemark"] || officerInputs["OfficerRemarks"] || "").trim();
    if (!finalRemark && (!previewData?.requiredOfficerFields || previewData.requiredOfficerFields.length === 0 || isManual)) {
      toast.warning(isMr ? "कृपया अधिकाऱ्याचा शेरा प्रविष्ट करा." : "Please enter the officer remark.");
      return;
    }

    if (isManual && !uploadedDocGuid) {
      toast.warning(
        isMr
          ? "कृपया मॅन्युअल प्रमाणपत्राची फाईल (PDF/Image) अपलोड करा."
          : "Please upload the manual certificate file (PDF/Image)."
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
          isManual
            ? (isMr
                ? "मॅन्युअल प्रमाणपत्र यशस्वीरीत्या अपलोड झाले व अर्ज मंजूर करण्यात आला!"
                : "Manual certificate uploaded and application approved successfully!")
            : (isMr
                ? "अधिकृत प्रमाणपत्र यशस्वीरीत्या जारी झाले व डिजिटल स्वाक्षरी करण्यात आली!"
                : "Official certificate issued and digitally signed successfully!")
        );
        onApproved();
        onClose();
      } else {
        toast.error(res.error || (isMr ? "प्रमाणपत्र जारी करताना त्रुटी आली." : "Error while issuing certificate."));
      }
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isMr ? "प्रमाणपत्र निर्णय, संपादन व डिजिटल स्वाक्षरी" : "Certificate Decision, Edit & Digital Signature"}
      maxWidth="xl"
    >
      <div className="flex flex-col h-[84vh]">
        {/* Top Header Bar with RTS Branding */}
        <div className="bg-[#1e293b] text-white px-5 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-t-lg border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">
                {isMr ? "अर्ज क्र." : "App No."}: <span className="text-white font-bold">{applicationNo}</span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {applicantName || (isMr ? "अर्जदार" : "Applicant")} | {serviceName || (isMr ? "लोकसेवा" : "Public Service")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-semibold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {isMr ? "थेट लाईव्ह डायनॅमिक प्रिव्ह्यू" : "Live Real-Time Dynamic Preview"}
            </span>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100">
          {/* Left Column: Officer Inputs & Custom Fields (5 Cols) */}
          <div className="lg:col-span-5 p-4 overflow-y-auto bg-white border-r border-slate-200 space-y-4 shadow-inner">
            {/* Citizen Application Data Quick Reference Accordion */}
            {previewData?.citizenAutoValues && Object.keys(previewData.citizenAutoValues).length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span>📋</span>
                    {isMr ? "नागरिकाने सादर केलेला अर्ज तपशील" : "Citizen Submitted Details"}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    {isMr ? "तपासणीसाठी उपलब्ध" : "For Reference"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">{isMr ? "अर्जदार:" : "Applicant:"}</span>{" "}
                    <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.ApplicantName || applicantName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{isMr ? "मोबाईल:" : "Mobile:"}</span>{" "}
                    <span className="font-semibold text-slate-800 font-mono">{previewData.citizenAutoValues.ApplicantMobile || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{isMr ? "अर्ज दिनांक:" : "Date:"}</span>{" "}
                    <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.AppliedDate || "-"}</span>
                  </div>
                  {previewData.citizenAutoValues.SurveyPlotNo && (
                    <div>
                      <span className="text-slate-500">{isMr ? "सर्व्हे/सीटीएस:" : "Survey/CTS:"}</span>{" "}
                      <span className="font-bold text-emerald-800">{previewData.citizenAutoValues.SurveyPlotNo}</span>
                    </div>
                  )}
                  {previewData.citizenAutoValues.LandArea && (
                    <div>
                      <span className="text-slate-500">{isMr ? "क्षेत्रफळ:" : "Area:"}</span>{" "}
                      <span className="font-semibold text-slate-800">{previewData.citizenAutoValues.LandArea}</span>
                    </div>
                  )}
                  {previewData.citizenAutoValues.ApplicantAddress && (
                    <div className="col-span-2 text-[10px]">
                      <span className="text-slate-500">{isMr ? "पत्ता:" : "Address:"}</span>{" "}
                      <span className="text-slate-700">{previewData.citizenAutoValues.ApplicantAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#4b70a6]" />
                {isMr ? "१. अधिकारी निर्णय व फील्ड्स" : "1. Officer Decision & Inputs"}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMr
                  ? "या सेवेसाठी निश्चित केलेली सर्व फील्ड्स व अंतिम शेरा भरा."
                  : "Fill all designated fields and final remark for this certificate."}
              </p>
            </div>

            {/* Upload Manual Certificate Box (Mode 2: Manual Certificate) */}
            {isManualMode && (
              <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-xl p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-600" />
                    {isMr ? "मॅन्युअल प्रमाणपत्र फाईल अपलोड करा" : "Upload Manual Certificate File"}
                  </span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                    PDF / Image
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {isMr
                    ? "सदर सेवेसाठी महापालिकेद्वारे मॅन्युअली तयार केलेले प्रमाणपत्र येथे अपलोड करणे आवश्यक आहे."
                    : "Upload the manually prepared physical certificate document for this application."}
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
                        ? (isMr ? "अपलोड होत आहे..." : "Uploading...")
                        : (isMr ? "फाईल निवडा (Choose File)" : "Select File")}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF, JPG, PNG (कमाल १० MB)
                    </span>
                  </label>
                ) : (
                  <div className="bg-white border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{uploadedFileName}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          {uploadedFileSize ? `${(uploadedFileSize / 1024).toFixed(1)} KB` : "Uploaded"} •
                          <span className="text-emerald-800 ml-1">जोडण्यात आले ✓</span>
                        </p>
                      </div>
                    </div>
                    <label
                      htmlFor="manual-certificate-file-input"
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer shrink-0 underline"
                    >
                      {isMr ? "बदला" : "Change"}
                    </label>
                  </div>
                )}

                <div className="bg-amber-100/70 border border-amber-300/80 rounded-lg p-2 text-[10.5px] text-amber-900 font-bold flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {isMr
                      ? "महत्त्वाची सूचना: सदर मूळ अधिकृत प्रमाणपत्र संबंधित विभागामधून जमा (collect) करून घ्यावे."
                      : "Important Notice: Original physical certificate must be collected from the respective department."}
                  </span>
                </div>
              </div>
            )}

            {/* Dynamic Officer Fields configured in Template (hidden in manual mode) */}
            <div className="space-y-3">
              {!isManualMode && previewData?.requiredOfficerFields && previewData.requiredOfficerFields.length > 0 ? (
                previewData.requiredOfficerFields.map((field) => {
                  const val = officerInputs[field.fieldKey] || "";
                  const label = isMr ? (field.fieldLabelMarathi || field.fieldLabelEnglish) : (field.fieldLabelEnglish || field.fieldLabelMarathi);
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
                          placeholder={`${label} प्रविष्ट करा...`}
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
                          <option value="">-- निवडा --</option>
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
                          placeholder={`${label} प्रविष्ट करा...`}
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
                    {isMr ? "अधिकाऱ्याचा अंतिम शेरा (Officer Remark)" : "Officer Remark"}
                    <span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <textarea
                    id="certificate-officer-remark"
                    value={officerInputs["OfficerRemark"] || ""}
                    onChange={(event) => handleInputChange("OfficerRemark", event.target.value)}
                    onBlur={() => loadPreview(officerInputs)}
                    placeholder={isMr ? "प्रमाणपत्रावर दाखवायचा अधिकाऱ्याचा शेरा येथे प्रविष्ट करा..." : "Enter the officer remark to display on the certificate..."}
                    className="min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
                  />
                </div>
              )}
              <p className="text-[10px] text-slate-500">
                {isMr ? "पूर्वदृश्य अद्ययावत करण्यासाठी मजकूर भरल्यानंतर बाहेर क्लिक करा किंवा Refresh वापरा." : "Click outside after editing, or use Refresh, to update the preview."}
              </p>
            </div>
          </div>

          {/* Right Column: Live Real-time Certificate Preview (7 Cols) */}
          <div className="lg:col-span-7 p-4 overflow-y-auto flex flex-col justify-start items-center relative">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                {isManualMode
                  ? (isMr ? "२. जोडलेले मॅन्युअल प्रमाणपत्र पूर्वदृश्य" : "2. Attached Manual Certificate Preview")
                  : (isMr ? "२. लाईव्ह प्रमाणपत्र पूर्वदृश्य" : "2. Live Certificate Preview")}
              </span>

              {uploadedDocGuid && (
                <a
                  href={`/api/rts/documents/${uploadedDocGuid}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isMr ? "नवीन टॅबमध्ये पहा" : "Open in new tab"}
                </a>
              )}

              {!isManualMode && (
                <button
                  type="button"
                  onClick={() => loadPreview(officerInputs)}
                  className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold"
                  title={isMr ? "रिफ्रेश करा" : "Refresh"}
                >
                  <RotateCw className={`w-3 h-3 ${loadingPreview ? "animate-spin" : ""}`} />
                  {isMr ? "रिफ्रेश करा" : "Refresh"}
                </button>
              )}
            </div>

            {loadingPreview ? (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 shadow-xs text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b70a6] mb-2" />
                <span className="text-xs font-semibold">{isMr ? "प्रमाणपत्र तयार होत आहे..." : "Generating certificate..."}</span>
              </div>
            ) : isManualMode ? (
              <div className="w-full space-y-3">
                {/* Mandatory Statutory Notice */}
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 flex items-start gap-2.5 text-amber-950 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold">
                      {isMr ? "महत्त्वाची वैधानिक सूचना (Statutory Notice):" : "Important Statutory Notice:"}
                    </h5>
                    <p className="text-xs font-semibold text-amber-900 mt-0.5">
                      {isMr
                        ? "⚠️ सदर मूळ अधिकृत प्रमाणपत्र अर्जदाराने संबंधित विभागामधून जमा (collect) करून घ्यावे."
                        : "⚠️ The original official certificate must be collected by the applicant from the respective department."}
                    </p>
                  </div>
                </div>

                {uploadedDocGuid ? (
                  <div className="w-full bg-white rounded-xl border border-slate-300 shadow-xs p-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {uploadedFileName || (isMr ? "अपलोड केलेले प्रमाणपत्र" : "Uploaded Certificate")}
                        </span>
                      </div>
                      <a
                        href={`/api/rts/documents/${uploadedDocGuid}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#4b70a6] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isMr ? "डाऊनलोड करा" : "Download"}
                      </a>
                    </div>
                    {/* Embedded preview */}
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50 min-h-[500px]">
                      {uploadedFileName?.toLowerCase().endsWith(".pdf") ? (
                        <iframe
                          src={`/api/rts/documents/${uploadedDocGuid}/view`}
                          className="w-full h-[540px] border-none"
                          title="Manual Certificate PDF"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <img
                            src={`/api/rts/documents/${uploadedDocGuid}/view`}
                            alt="Manual Certificate"
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
                        {isMr ? "मॅन्युअल प्रमाणपत्र अद्याप अपलोड केलेले नाही" : "Manual Certificate Not Uploaded Yet"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isMr
                          ? "सदर सेवेसाठी महापालिकेद्वारे मॅन्युअली तयार केलेले प्रमाणपत्र डाव्या बाजूच्या पॅनेलमधून निवडून अपलोड करा. त्यानंतरच अर्ज मंजूर करता येईल."
                          : "Please select and upload the manually prepared corporation certificate from the left panel. Approval is enabled after upload."}
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
                <span className="text-xs">{isMr ? "कोणतेही टेम्पलेट उपलब्ध नाही" : "No template available"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isManualMode
                ? (isMr
                    ? "मंजूर करताच मॅन्युअल प्रमाणपत्र नागरिकाला उपलब्ध होईल व मूळ प्रत जमा करण्याची सूचना दिसेल."
                    : "On approval, the manual certificate becomes available to the citizen with collection notice.")
                : (isMr
                    ? "मंजूर करताच डिजिटल स्वाक्षरी व QR कोडसह अधिकृत प्रमाणपत्र जारी होईल."
                    : "Approval issues the official certificate with a digital signature and QR code.")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending} className="text-xs rounded-xl">
              {isMr ? "रद्द करा" : "Cancel"}
            </Button>
            <Button
              onClick={handleIssueAndApprove}
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
              <Award className="w-4 h-4" />
              {isPending
                ? (isMr ? "प्रक्रिया होत आहे..." : "Processing...")
                : isManualMode
                ? (isMr ? "मॅन्युअल प्रमाणपत्र जोडून मंजूर करा (Approve & Attach)" : "Attach Manual Certificate & Approve")
                : (isMr ? "मंजूर करा व डिजिटल स्वाक्षरीने जारी करा (Sign & Approve)" : "Approve & Issue with Digital Signature")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
