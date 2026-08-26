"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Award,
  FileText,
  Layers,
  ListPlus,
  Loader2,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Modal } from "@/components/common";
import {
  getCertificatePreviewAction,
  issueCertificateAction,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type {
  CertificatePreviewResponse,
} from "@/types/rts/certificate.types";

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
  const [isPending, startTransition] = useTransition();
  const [loadingPreview, setLoadingPreview] = useState(true);

  const [previewData, setPreviewData] = useState<CertificatePreviewResponse | null>(null);
  const [officerInputs, setOfficerInputs] = useState<Record<string, string>>({
    OrderNo: `जा.क्र./मनपा/कर/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    ValidityPeriod: "३१ मार्च २०२७ पर्यंत",
    ChallanNo: `CHL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    SpecialConditions: "१. सदर बांधकाम/परवाना मंजूर नियमांच्या अधीन राहील.\n२. कोणतीही खोटी माहिती आढळल्यास परवाना रद्द केला जाईल.",
  });

  const [customConditions] = useState("");
  const [actionRemark, setActionRemark] = useState("सर्व कागदपत्रे व स्थळ पाहणी तपासून अंतिम प्रमाणपत्र जारी करण्यात येत आहे.");

  // Fetch initial preview
  useEffect(() => {
    if (isOpen && applicationId) {
      loadPreview(officerInputs, customConditions);
    }
  }, [isOpen, applicationId]);

  const loadPreview = async (inputs: Record<string, string>, conditions: string) => {
    setLoadingPreview(true);
    try {
      const res = await getCertificatePreviewAction(applicationId, inputs, conditions);
      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        toast.error(res.error || "पूर्वदृश्य तयार करताना त्रुटी आली.");
      }
    } catch (err) {
      console.error("Error loading preview:", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    const updated = { ...officerInputs, [key]: value };
    setOfficerInputs(updated);
    // Debounced or live refresh preview
    loadPreview(updated, customConditions);
  };

  const handleIssueAndApprove = () => {
    startTransition(async () => {
      const res = await issueCertificateAction(
        applicationId,
        officerInputs,
        customConditions || undefined,
        actionRemark,
        true
      );

      if (res.success) {
        toast.success("✅ प्रमाणपत्र यशस्वीरीत्या जारी झाले व अर्ज मंजूर करण्यात आला!");
        onApproved();
        onClose();
      } else {
        toast.error(res.error || "प्रमाणपत्र जारी करताना त्रुटी आली.");
      }
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="प्रमाणपत्र निर्णय व डिजिटल स्वाक्षरी (Certificate Decision & Real-Time Preview)"
      maxWidth="xl"
    >
      <div className="flex flex-col h-[82vh]">
        {/* Top Header info */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-t-lg border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">अर्ज क्र.: {applicationNo}</div>
              <div className="text-sm font-bold text-slate-100">{applicantName || "अर्जदार"} | {serviceName || "लोकसेवा"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              २-Way Live Dynamic Merging
            </span>
          </div>
        </div>

        {/* 2-Column Split Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100">
          {/* Left Column: Officer Inputs & Parameters (5 Cols) */}
          <div className="lg:col-span-5 p-4 overflow-y-auto bg-white border-r border-slate-200 space-y-4 shadow-inner">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                १. अधिकाऱ्याने भरावयाची अधिकृत माहिती (Officer Inputs)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                खालील माहिती टाईप करताच उजवीकडील प्रमाणपत्रात ती थेट लाईव्ह अपडेट होईल.
              </p>
            </div>

            {/* Dynamic Officer Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  जावक / आदेश क्रमांक <span className="text-red-500">*</span>
                </label>
                <Input
                  value={officerInputs.OrderNo || ""}
                  onChange={(e) => handleInputChange("OrderNo", e.target.value)}
                  placeholder="उदा. जा.क्र./मनपा/कर/२०२६/७८९"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    परवाना वैधता मुदत
                  </label>
                  <Input
                    value={officerInputs.ValidityPeriod || ""}
                    onChange={(e) => handleInputChange("ValidityPeriod", e.target.value)}
                    placeholder="उदा. ३१ मार्च २०२७ पर्यंत"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    शुल्क पावती क्रमांक
                  </label>
                  <Input
                    value={officerInputs.ChallanNo || ""}
                    onChange={(e) => handleInputChange("ChallanNo", e.target.value)}
                    placeholder="उदा. CHL-2026-0042"
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  विशेष अटी व शर्ती (Terms & Conditions)
                </label>
                <textarea
                  rows={4}
                  value={officerInputs.SpecialConditions || ""}
                  onChange={(e) => handleInputChange("SpecialConditions", e.target.value)}
                  placeholder="अटी प्रविष्ट करा..."
                  className="w-full p-2.5 text-xs rounded-md border border-slate-300 focus:ring-1 focus:ring-blue-500 leading-relaxed text-slate-800"
                />
              </div>

              {/* Standard Conditions Presets */}
              {previewData?.defaultConditions && previewData.defaultConditions.length > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <ListPlus className="w-3.5 h-3.5 text-indigo-600" />
                    मानक अटींचे प्रीसेट्स (क्लिक करून जोडा):
                  </div>
                  <div className="space-y-1">
                    {previewData.defaultConditions.map((cond, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = officerInputs.SpecialConditions ? officerInputs.SpecialConditions + "\n" : "";
                          handleInputChange("SpecialConditions", current + `${idx + 1}. ${cond}`);
                        }}
                        className="text-left w-full text-[11px] text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 p-1 rounded transition-colors block border border-transparent hover:border-blue-200"
                      >
                        + {cond}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Remark */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  मंजुरी शेरा / टिप्पणी (Approval Remark) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  placeholder="मंजुरी शेरा प्रविष्ट करा..."
                  className="w-full p-2 text-xs rounded-md border border-slate-300 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Real-time Certificate Preview (7 Cols) */}
          <div className="lg:col-span-7 p-4 overflow-y-auto flex flex-col justify-start items-center relative">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                २. लाईव्ह प्रमाणपत्र पूर्वदृश्य (Live Real-Time Certificate Preview)
              </span>

              <button
                type="button"
                onClick={() => loadPreview(officerInputs, customConditions)}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                title="रिफ्रेश करा"
              >
                <RotateCw className={`w-3 h-3 ${loadingPreview ? "animate-spin" : ""}`} />
                रिफ्रेश
              </button>
            </div>

            {loadingPreview ? (
              <div className="w-full h-80 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 shadow-sm text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-semibold">प्रमाणपत्र तयार होत आहे...</span>
              </div>
            ) : previewData?.mergedHtml ? (
              <div
                className="bg-white rounded-lg shadow-md border border-slate-300 w-full overflow-hidden scale-[0.92] origin-top transition-all"
                dangerouslySetInnerHTML={{ __html: previewData.mergedHtml }}
              />
            ) : (
              <div className="w-full h-80 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 text-slate-400">
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-xs">कोणतेही टेम्पलेट उपलब्ध नाही</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>मंजूर करताच डिजिटल स्वाक्षरी व QR कोडसह अधिकृत PDF तयार होईल.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending} className="text-xs">
              रद्द करा (Cancel)
            </Button>
            <Button
              onClick={handleIssueAndApprove}
              disabled={isPending || loadingPreview || !actionRemark.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              {isPending ? "प्रक्रिया होत आहे..." : "मंजूर करा व डिजिटल स्वाक्षरीने जारी करा (Approve & Issue Certificate)"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
