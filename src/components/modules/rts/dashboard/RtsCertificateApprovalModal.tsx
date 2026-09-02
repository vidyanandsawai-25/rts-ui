"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Award,
  FileText,
  Layers,
  Loader2,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Modal, OfficialCertificateSheet } from "@/components/common";
import {
  getCertificatePreviewAction,
  issueCertificateAction,
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
  const [officerRemark, setOfficerRemark] = useState("");

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

  const loadPreview = async (remark: string) => {
    setLoadingPreview(true);
    try {
      const normalizedRemark = remark.trim();
      const officerInputs = normalizedRemark ? { OfficerRemark: normalizedRemark } : {};
      const res = await getCertificatePreviewAction(applicationId, officerInputs);
      if (res.success && res.data) {
        setPreviewData(res.data);
        if (Object.keys(inputs).length === 0 && res.data.requiredOfficerFields) {
          const auto = res.data.citizenAutoValues || {};
          const initialInputs: Record<string, string> = {};
          for (const f of res.data.requiredOfficerFields) {
            const key = f.fieldKey || (f as any).key || "";
            if (key && (auto[key] || f.defaultValue)) {
              initialInputs[key] = auto[key] || f.defaultValue || "";
            }
          }
          if (Object.keys(initialInputs).length > 0) {
            setOfficerInputs((prev) => ({ ...initialInputs, ...prev }));
          }
        }
      } else {
        toast.error(res.error || (isMr ? "प्रमाणपत्र पूर्वदृश्य मिळवण्यात अडचण आली." : "Failed to load certificate preview."));
      }
    } catch {
      toast.error(isMr ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server connection failed.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleIssueAndApprove = () => {
    const finalRemark = officerRemark.trim();
    if (!finalRemark) {
      toast.warning(isMr ? "कृपया अधिकाऱ्याचा शेरा प्रविष्ट करा." : "Please enter the officer remark.");
      return;
    }

    startTransition(async () => {
      const res = await issueCertificateAction(
        applicationId,
        { OfficerRemark: finalRemark },
        undefined,
        finalRemark,
        true
      );

      if (res.success) {
        toast.success(isMr ? "अधिकृत प्रमाणपत्र यशस्वीरीत्या जारी झाले व डिजिटल स्वाक्षरी करण्यात आली!" : "Official certificate issued and digitally signed successfully!");
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
                {isMr ? "१. अधिकाऱ्याचा शेरा" : "1. Officer Remark"}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMr ? "हा शेरा प्रमाणपत्रातील {{OfficerRemark}} टॅगच्या ठिकाणी दिसेल." : "This remark appears at the {{OfficerRemark}} tag in the certificate."}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="certificate-officer-remark" className="block text-xs font-bold text-slate-700">
                {isMr ? "अधिकाऱ्याचा शेरा" : "Officer Remark"}
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <textarea
                id="certificate-officer-remark"
                value={officerRemark}
                onChange={(event) => setOfficerRemark(event.target.value)}
                onBlur={() => loadPreview(officerRemark)}
                placeholder={isMr ? "प्रमाणपत्रावर दाखवायचा अधिकाऱ्याचा शेरा येथे प्रविष्ट करा..." : "Enter the officer remark to display on the certificate..."}
                className="min-h-40 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4b70a6]/30"
              />
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
                {isMr ? "२. लाईव्ह प्रमाणपत्र पूर्वदृश्य" : "2. Live Certificate Preview"}
              </span>

              <button
                type="button"
                onClick={() => loadPreview(officerRemark)}
                className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold"
                title={isMr ? "रिफ्रेश करा" : "Refresh"}
              >
                <RotateCw className={`w-3 h-3 ${loadingPreview ? "animate-spin" : ""}`} />
                {isMr ? "रिफ्रेश करा" : "Refresh"}
              </button>
            </div>

            {loadingPreview ? (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 shadow-xs text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b70a6] mb-2" />
                <span className="text-xs font-semibold">{isMr ? "प्रमाणपत्र तयार होत आहे..." : "Generating certificate..."}</span>
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
            <span>{isMr ? "मंजूर करताच डिजिटल स्वाक्षरी व QR कोडसह अधिकृत प्रमाणपत्र जारी होईल." : "Approval issues the official certificate with a digital signature and QR code."}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending} className="text-xs rounded-xl">
              {isMr ? "रद्द करा" : "Cancel"}
            </Button>
            <Button
              onClick={handleIssueAndApprove}
              disabled={isPending || loadingPreview || !officerRemark.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 rounded-xl px-4 py-2"
            >
              <Award className="w-4 h-4" />
              {isPending ? "प्रक्रिया होत आहे..." : "मंजूर करा व डिजिटल स्वाक्षरीने जारी करा (Sign & Approve)"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
