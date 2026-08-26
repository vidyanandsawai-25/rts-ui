"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Award,
  FileText,
  Layers,
  ListPlus,
  Loader2,
  Plus,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Modal } from "@/components/common";
import {
  getCertificatePreviewAction,
  issueCertificateAction,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type {
  CertificatePreviewResponse,
  OfficerFieldConfig,
} from "@/types/rts/certificate.types";

interface CustomDynamicField {
  id: string;
  key: string;
  label: string;
  value: string;
}

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
  const [officerInputs, setOfficerInputs] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomDynamicField[]>([]);
  const [customConditions, setCustomConditions] = useState("");
  const [actionRemark, setActionRemark] = useState("");

  // New Custom Field input state
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [showAddCustomField, setShowAddCustomField] = useState(false);

  // Fetch initial preview
  useEffect(() => {
    if (isOpen && applicationId) {
      loadPreview({}, "");
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
    loadPreview(updated, customConditions);
  };

  const handleCustomFieldValChange = (key: string, value: string) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    );
    const updated = { ...officerInputs, [key]: value };
    setOfficerInputs(updated);
    loadPreview(updated, customConditions);
  };

  const handleAddCustomField = () => {
    if (!newFieldKey.trim()) {
      toast.error("कृपया फील्ड की (इंग्रजी नाव, उदा. MarksHindi, G.R.No) प्रविष्ट करा.");
      return;
    }
    const cleanKey = newFieldKey.trim().replace(/\s+/g, "");
    const label = newFieldLabel.trim() || cleanKey;

    if (customFields.some((f) => f.key === cleanKey) || officerInputs[cleanKey] !== undefined) {
      toast.error("हे फील्ड आधीच अस्तित्वात आहे.");
      return;
    }

    const newField: CustomDynamicField = {
      id: Date.now().toString(),
      key: cleanKey,
      label,
      value: "",
    };

    setCustomFields((prev) => [...prev, newField]);
    setNewFieldKey("");
    setNewFieldLabel("");
    setShowAddCustomField(false);
    toast.success(`'${label}' हे नवीन फील्ड जोडले गेले!`);
  };

  const handleRemoveCustomField = (key: string) => {
    setCustomFields((prev) => prev.filter((f) => f.key !== key));
    const updated = { ...officerInputs };
    delete updated[key];
    setOfficerInputs(updated);
    loadPreview(updated, customConditions);
  };

  const handleCustomConditionChange = (value: string) => {
    setCustomConditions(value);
    loadPreview(officerInputs, value);
  };

  const handleIssueAndApprove = () => {
    if (!actionRemark.trim()) {
      toast.error("कृपया मंजुरी शेरा (Approval Remark) प्रविष्ट करा.");
      return;
    }

    startTransition(async () => {
      const res = await issueCertificateAction(
        applicationId,
        officerInputs,
        customConditions || undefined,
        actionRemark.trim(),
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

  const fieldsToRender: OfficerFieldConfig[] =
    previewData?.requiredOfficerFields && previewData.requiredOfficerFields.length > 0
      ? previewData.requiredOfficerFields
      : [
          {
            fieldKey: "OrderNo",
            fieldLabelMarathi: "जावक / आदेश क्रमांक",
            fieldLabelEnglish: "Outward / Order No",
            fieldType: "text",
            isMandatory: true,
          },
          {
            fieldKey: "ValidityPeriod",
            fieldLabelMarathi: "परवाना वैधता मुदत",
            fieldLabelEnglish: "Validity Period",
            fieldType: "text",
            isMandatory: false,
          },
          {
            fieldKey: "ChallanNo",
            fieldLabelMarathi: "शुल्क पावती क्र.",
            fieldLabelEnglish: "Challan / Receipt No",
            fieldType: "text",
            isMandatory: false,
          },
        ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="प्रमाणपत्र निर्णय, संपादन व डिजिटल स्वाक्षरी (Certificate Decision & Live Preview)"
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
                अर्ज क्र.: <span className="text-white font-bold">{applicationNo}</span>
              </div>
              <div className="text-sm font-bold text-slate-100">
                {applicantName || "अर्जदार"} | {serviceName || "लोकसेवा"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-semibold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Real-Time २-Way Live Dynamic Merging
            </span>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100">
          {/* Left Column: Officer Inputs & Custom Fields (5 Cols) */}
          <div className="lg:col-span-5 p-4 overflow-y-auto bg-white border-r border-slate-200 space-y-4 shadow-inner">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#4b70a6]" />
                १. अधिकाऱ्याने भरावयाची अधिकृत माहिती (Officer Inputs)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                माहिती टाईप करताच उजवीकडील प्रमाणपत्रात ती थेट लाईव्ह अपडेट होईल.
              </p>
            </div>

            {/* Configured Officer Fields */}
            <div className="space-y-3">
              {fieldsToRender.map((field) => (
                <div key={field.fieldKey} className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    {field.fieldLabelMarathi || field.fieldLabelEnglish || field.fieldKey}
                    {field.isMandatory && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.fieldType === "textarea" ? (
                    <textarea
                      rows={3}
                      value={officerInputs[field.fieldKey] || ""}
                      onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                      placeholder={`${field.fieldLabelMarathi || field.fieldLabelEnglish} प्रविष्ट करा...`}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#4b70a6] focus:border-[#4b70a6] text-slate-800"
                    />
                  ) : (
                    <Input
                      type={
                        field.fieldType === "number"
                          ? "number"
                          : field.fieldType === "date"
                            ? "date"
                            : "text"
                      }
                      value={officerInputs[field.fieldKey] || ""}
                      onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                      placeholder={`${field.fieldLabelMarathi || field.fieldLabelEnglish} प्रविष्ट करा...`}
                      className="text-xs rounded-lg"
                    />
                  )}
                </div>
              ))}

              {/* Dynamic Added Custom Fields */}
              {customFields.map((cf) => (
                <div key={cf.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-[#4b70a6]">
                      {cf.label} <span className="text-[10px] text-slate-400 font-mono">([[{cf.key}]])</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cf.key)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    value={cf.value}
                    onChange={(e) => handleCustomFieldValChange(cf.key, e.target.value)}
                    placeholder={`${cf.label} चे मूल्य प्रविष्ट करा...`}
                    className="text-xs rounded-lg bg-white"
                  />
                </div>
              ))}

              {/* Add Custom Field Section */}
              <div className="pt-1">
                {!showAddCustomField ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomField(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4b70a6] hover:text-[#3d5a8a] py-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />+ अतिरिक्त फील्ड / माहिती जोडा (Add Custom Field)
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2 text-xs">
                    <div className="font-bold text-blue-900 flex items-center justify-between">
                      <span>नवीन सानुकूल फील्ड जोडा:</span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomField(false)}
                        className="text-blue-500 hover:text-blue-800 text-[11px]"
                      >
                        रद्द
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="फील्ड की (उदा. SeatNo, GRNo)"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="लेबल (उदा. आसन क्रमांक)"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      onClick={handleAddCustomField}
                      className="w-full bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs py-1.5"
                    >
                      फील्ड समाविष्ट करा
                    </Button>
                  </div>
                )}
              </div>

              {/* Special Conditions */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  विशेष अटी व शर्ती (Special Conditions)
                </label>
                <textarea
                  rows={2}
                  value={customConditions}
                  onChange={(e) => handleCustomConditionChange(e.target.value)}
                  placeholder="अटी व शर्ती प्रविष्ट करा..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#4b70a6] text-slate-800"
                />
              </div>

              {/* Standard Conditions Presets from Template Master */}
              {previewData?.defaultConditions && previewData.defaultConditions.length > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <ListPlus className="w-3.5 h-3.5 text-indigo-600" />
                    टेम्पलेटमधील मानक अटी (क्लिक करून जोडा):
                  </div>
                  <div className="space-y-1">
                    {previewData.defaultConditions.map((cond, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = customConditions ? customConditions + "\n" : "";
                          handleCustomConditionChange(current + `${idx + 1}. ${cond}`);
                        }}
                        className="text-left w-full text-[11px] text-slate-600 hover:text-[#4b70a6] hover:bg-blue-50/70 p-1 rounded transition-colors block border border-transparent hover:border-blue-200"
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
                  placeholder="मंजुरी शेरा प्रविष्ट करा (उदा. कागदपत्रे व नोंदी तपासून दाखला जारी करण्यास मंजुरी)..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#4b70a6] text-slate-800"
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
                className="text-[11px] text-[#4b70a6] hover:text-[#3d5a8a] flex items-center gap-1 font-semibold"
                title="रिफ्रेश करा"
              >
                <RotateCw className={`w-3 h-3 ${loadingPreview ? "animate-spin" : ""}`} />
                रिफ्रेश करा
              </button>
            </div>

            {loadingPreview ? (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 shadow-xs text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#4b70a6] mb-2" />
                <span className="text-xs font-semibold">प्रमाणपत्र तयार होत आहे...</span>
              </div>
            ) : previewData?.mergedHtml ? (
              <div
                className="bg-white rounded-lg shadow-md border border-slate-300 w-full overflow-hidden scale-[0.92] origin-top transition-all"
                dangerouslySetInnerHTML={{ __html: previewData.mergedHtml }}
              />
            ) : (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-300 text-slate-400">
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
            <span>मंजूर करताच डिजिटल स्वाक्षरी व QR कोडसह अधिकृत प्रमाणपत्र जारी होईल.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isPending} className="text-xs rounded-xl">
              रद्द करा (Cancel)
            </Button>
            <Button
              onClick={handleIssueAndApprove}
              disabled={isPending || loadingPreview || !actionRemark.trim()}
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
