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
import { Button, Input, Modal, OfficialCertificateSheet } from "@/components/common";
import {
  getCertificatePreviewAction,
  issueCertificateAction,
} from "@/app/[locale]/rts/dashboard/rts-applications/actions";
import type {
  CertificatePreviewResponse,
  OfficerFieldConfig,
} from "@/types/rts/certificate.types";

import { useLocale } from "next-intl";

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
  const currentLocale = useLocale();
  const isMr = currentLocale === "mr";

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

  const handleInputChange = (key: string, value: string) => {
    const nextInputs = { ...officerInputs, [key]: value };
    setOfficerInputs(nextInputs);
    loadPreview(nextInputs, customConditions);
  };

  const handleConditionsChange = (text: string) => {
    setCustomConditions(text);
    loadPreview(officerInputs, text);
  };

  const handleCustomFieldValueChange = (key: string, value: string) => {
    setCustomFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
    handleInputChange(key, value);
  };

  const handleAddCustomField = () => {
    if (!newFieldKey.trim()) {
      toast.warning(isMr ? "कृपया फील्डचे नाव (Key) प्रविष्ट करा." : "Please enter field key.");
      return;
    }
    const cleanKey = newFieldKey.trim().replace(/[^a-zA-Z0-9_]/g, "");
    const cleanLabel = newFieldLabel.trim() || cleanKey;

    const newField: CustomDynamicField = {
      id: Date.now().toString(),
      key: cleanKey,
      label: cleanLabel,
      value: "",
    };

    setCustomFields((prev) => [...prev, newField]);
    setNewFieldKey("");
    setNewFieldLabel("");
    setShowAddCustomField(false);
    toast.success(isMr ? `फील्ड [[${cleanKey}]] जोडली गेली.` : `Field [[${cleanKey}]] added.`);
  };

  const handleRemoveCustomField = (id: string, key: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    const nextInputs = { ...officerInputs };
    delete nextInputs[key];
    setOfficerInputs(nextInputs);
    loadPreview(nextInputs, customConditions);
  };

  const handleIssueAndApprove = () => {
    const finalRemark = actionRemark.trim() || (isMr ? "प्रमाणपत्र अधिकृतरीत्या जारी करण्यात आले." : "Certificate officially issued.");

    startTransition(async () => {
      const res = await issueCertificateAction(
        applicationId,
        officerInputs,
        customConditions || undefined,
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

  // Robust helper to extract key and human-readable label
  const getFieldKey = (f: any): string => {
    return f.fieldKey || f.FieldKey || f.key || f.fieldName || f.name || "";
  };

  const getFieldLabel = (f: any): string => {
    const key = getFieldKey(f);
    const standardNameMarathi: Record<string, string> = {
      OrderNo: "जावक / आदेश क्रमांक",
      OutwardNo: "जावक क्रमांक",
      ValidityPeriod: "परवाना वैधता मुदत",
      ChallanNo: "शुल्क पावती क्र.",
      ReceiptNo: "शुल्क पावती क्रमांक",
      InspectionRemark: "स्थळ पाहणी व छाननी शेरा",
      SpecificValidityNote: "विशेष वैधता नोंद",
      ZoneType: "मंजूर झोन प्रकार",
      SurveyNo: "सीटीएस / सर्व्हे क्र.",
      BuildingPermitNo: "बांधकाम परवानगी क्र.",
      ArchitectName: "वास्तुविशारद / अभियंता नाव",
      ReservationDetails: "आरक्षण तपशील / शेरा",
      RoadWidth: "रस्त्याची रुंदी",
    };
    const standardNameEnglish: Record<string, string> = {
      OrderNo: "Outward / Order No",
      OutwardNo: "Outward No",
      ValidityPeriod: "Validity Period",
      ChallanNo: "Challan / Receipt No",
      ReceiptNo: "Receipt No",
      InspectionRemark: "Site Inspection & Verification Remark",
      SpecificValidityNote: "Special Validity Note",
      ZoneType: "Approved Zone Type",
      SurveyNo: "CTS / Survey No",
      BuildingPermitNo: "Building Permit No",
      ArchitectName: "Architect / Engineer Name",
      ReservationDetails: "Reservation Details",
      RoadWidth: "Road Width",
    };

    if (isMr) {
      return (
        f.fieldLabelMarathi ||
        f.FieldLabelMarathi ||
        standardNameMarathi[key] ||
        f.fieldLabel ||
        f.label ||
        f.fieldLabelEnglish ||
        f.FieldLabelEnglish ||
        standardNameEnglish[key] ||
        key ||
        "अधिकारी नोंद"
      );
    }
    return (
      f.fieldLabelEnglish ||
      f.FieldLabelEnglish ||
      standardNameEnglish[key] ||
      f.fieldLabel ||
      f.label ||
      f.fieldLabelMarathi ||
      f.FieldLabelMarathi ||
      standardNameMarathi[key] ||
      key ||
      "Officer Input"
    );
  };

  const rawFields = previewData?.requiredOfficerFields && previewData.requiredOfficerFields.length > 0
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
          fieldKey: "InspectionRemark",
          fieldLabelMarathi: "स्थळ पाहणी व छाननी शेरा",
          fieldLabelEnglish: "Site Inspection & Scrutiny Remark",
          fieldType: "text",
          isMandatory: false,
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

  const fieldsToRender: OfficerFieldConfig[] = rawFields.map((f: any, i: number) => {
    const k = getFieldKey(f) || `Field_${i + 1}`;
    return {
      fieldKey: k,
      fieldLabelMarathi: getFieldLabel(f),
      fieldLabelEnglish: getFieldLabel(f),
      fieldType: f.fieldType || "text",
      isMandatory: f.isMandatory ?? (k === "OrderNo" || k === "OutwardNo"),
    };
  });

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
                {isMr ? "१. अधिकाऱ्याने भरावयाची अधिकृत माहिती" : "1. Official Officer Inputs"}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMr ? "येथे भरलेली माहिती उजवीकडील प्रमाणपत्रात त्या त्या ठिकाणी (टेबल व मजकुरात) थेट दिसेल." : "Information entered will reflect directly into corresponding fields and table in the certificate preview."}
              </p>
            </div>

            {/* Configured Officer Fields */}
            <div className="space-y-3">
              {fieldsToRender.map((field, idx) => {
                const fKey = field.fieldKey;
                const fLabel = getFieldLabel(field);
                return (
                  <div key={`${fKey}-${idx}`} className="space-y-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-slate-800">
                        {fLabel}
                        {field.isMandatory && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded font-semibold">
                        [[{fKey}]]
                      </span>
                    </div>

                    <Input
                      type="text"
                      value={officerInputs[fKey] || ""}
                      onChange={(e) => handleInputChange(fKey, e.target.value)}
                      placeholder={
                        (isMr ? `${fLabel} येथे प्रविष्ट करा...` : `Enter ${fLabel}...`)
                      }
                      className="h-8 text-xs bg-white rounded-md"
                    />
                  </div>
                );
              })}

              {/* Dynamic Added Custom Fields */}
              {customFields.map((cField) => (
                <div
                  key={cField.id}
                  className="space-y-1 p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg relative"
                >
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-blue-900">
                      {cField.label}
                      <span className="ml-1 text-[10px] text-blue-500 font-mono font-normal">
                        [[{cField.key}]]
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(cField.id, cField.key)}
                      className="text-red-500 hover:text-red-700 p-0.5 rounded"
                      title={isMr ? "हटवा" : "Delete"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={cField.value}
                    onChange={(e) => handleCustomFieldValueChange(cField.key, e.target.value)}
                    placeholder={isMr ? `${cField.label} ची माहिती...` : `Value for ${cField.label}...`}
                    className="h-8 text-xs bg-white rounded-md"
                  />
                </div>
              ))}
            </div>

            {/* Add More Dynamic Fields Button */}
            {!showAddCustomField ? (
              <button
                type="button"
                onClick={() => setShowAddCustomField(true)}
                className="w-full py-2 border border-dashed border-slate-300 hover:border-[#4b70a6] text-slate-600 hover:text-[#4b70a6] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-slate-50 hover:bg-white"
              >
                <Plus className="w-3.5 h-3.5" />
                {isMr ? "अतिरिक्त माहिती फील्ड जोडा" : "Add Custom Field"}
              </button>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>{isMr ? "नवीन डायनॅमिक फील्ड" : "New Dynamic Field"}</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomField(false)}
                    className="text-slate-400 hover:text-slate-600 text-[11px]"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">{isMr ? "नाव (Label)" : "Field Label"}</label>
                    <Input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder={isMr ? "उदा. क्षेत्रफळ" : "e.g. Area"}
                      className="h-7 text-xs bg-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">{isMr ? "किल्ली (Key)" : "Field Key"}</label>
                    <Input
                      type="text"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      placeholder={isMr ? "उदा. TotalArea" : "e.g. TotalArea"}
                      className="h-7 text-xs bg-white font-mono rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowAddCustomField(false)}
                    className="h-7 text-xs px-2.5"
                  >
                    {isMr ? "रद्द करा" : "Cancel"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddCustomField}
                    className="h-7 text-xs px-2.5 bg-[#4b70a6] hover:bg-[#3d5a8a] text-white"
                  >
                    {isMr ? "जोडा" : "Add"}
                  </Button>
                </div>
              </div>
            )}

            {/* Custom Conditions Append Block */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ListPlus className="w-3.5 h-3.5 text-emerald-600" />
                {isMr ? "अतिरिक्त विशेष अटी व शर्ती" : "Additional Special Terms & Conditions"}
              </label>
              <textarea
                value={customConditions}
                onChange={(e) => handleConditionsChange(e.target.value)}
                placeholder={isMr ? "येथे अतिरिक्त विशेष अटी टाईप करा (प्रत्येक ओळीवर १ अट)..." : "Enter additional conditions (one per line)..."}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg min-h-[70px] focus:outline-hidden focus:ring-1 focus:ring-[#4b70a6] resize-none"
              />
            </div>

            {/* Decision Remark Input */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isMr ? "मंजुरी शेरा (Action Remark)" : "Approval Action Remark"}
              </label>
              <Input
                type="text"
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
                placeholder={isMr ? "उदा. सर्व अटी पूर्ण असल्याने प्रमाणपत्र जारी केले..." : "e.g. All conditions verified, certificate issued..."}
                className="h-9 text-xs rounded-lg"
              />
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
                onClick={() => loadPreview(officerInputs, customConditions)}
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
