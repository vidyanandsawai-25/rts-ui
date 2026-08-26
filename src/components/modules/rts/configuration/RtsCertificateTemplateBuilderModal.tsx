"use client";

import { useEffect, useState, useTransition } from "react";
import {
  FileCode,
  Info,
  Layers,
  ListPlus,
  Plus,
  Save,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Modal,
} from "@/components/common";
import {
  fetchAvailableTagsAction,
  saveCertificateTemplateAction,
  type CertificateTemplateFormData,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type {
  CertificateAvailableTag,
  OfficerFieldConfig,
  RTSCertificateTemplate,
} from "@/types/rts/certificate.types";

interface RtsCertificateTemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: RTSCertificateTemplate | null;
  services: { id: string; name: string; departmentName?: string }[];
  onSaved: () => void;
}

type TabType = "basic" | "template" | "officerFields" | "conditions";

const DEFAULT_BODY_TEMPLATE = `<div class="certificate-body space-y-4">
    <p>प्रमाणित करण्यात येते की, अर्जदार <strong>{{ApplicantName}}</strong> (मोबाईल क्र.: <strong>{{ApplicantMobile}}</strong>) यांनी अकोला महानगरपालिकेकडे <strong>{{ServiceNameMarathi}}</strong> साठी अर्ज क्र. <strong>{{ApplicationNo}}</strong> अन्वये दिनांक <strong>{{AppliedDate}}</strong> रोजी अर्ज सादर केला होता.</p>

    <p>सदर अर्जाची व कागदपत्रांची नियमानुसार सविस्तर छाननी व प्रत्यक्ष पाहणी करण्यात आली असून, सक्षम प्राधिकाऱ्यांच्या आदेशानुसार हे प्रमाणपत्र खालील अटी व शर्तींच्या अधीन राहून जारी करण्यात येत आहे:</p>

    <div class="bg-slate-50 p-4 rounded border border-slate-200 text-sm space-y-2">
        <div><strong>जावक / आदेश क्र.:</strong> [[OrderNo]]</div>
        <div><strong>परवाना मुदत:</strong> [[ValidityPeriod]]</div>
        <div><strong>शुल्क पावती क्र.:</strong> [[ChallanNo]]</div>
        <div class="mt-2">
            <strong>विशेष अटी व शर्ती:</strong>
            <div class="mt-1 whitespace-pre-line">[[SpecialConditions]]</div>
        </div>
    </div>
</div>`;

export default function RtsCertificateTemplateBuilderModal({
  isOpen,
  onClose,
  template,
  services,
  onSaved,
}: RtsCertificateTemplateBuilderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  const [formData, setFormData] = useState<CertificateTemplateFormData>({
    serviceId: "",
    templateName: "",
    templateCode: "",
    headerContent: "",
    bodyContent: DEFAULT_BODY_TEMPLATE,
    footerContent: "",
    defaultConditions: [
      "सदर प्रमाणपत्र कायदेशीर नियमांचे पालन करण्याच्या अटीवर वैध राहील.",
      "प्रमाणपत्रातील माहिती खोटी आढळल्यास हे प्रमाणपत्र पूर्वसूचना न देता रद्द केले जाईल.",
    ],
    officerFields: [
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
      {
        fieldKey: "SpecialConditions",
        fieldLabelMarathi: "विशेष अटी व शर्ती",
        fieldLabelEnglish: "Terms & Conditions",
        fieldType: "textarea",
        isMandatory: false,
      },
    ],
    isActive: true,
  });

  const [availableTags, setAvailableTags] = useState<CertificateAvailableTag[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id,
        serviceId: String(template.serviceId),
        templateName: template.templateName,
        templateCode: template.templateCode,
        headerContent: template.headerContent || "",
        bodyContent: template.bodyContent || DEFAULT_BODY_TEMPLATE,
        footerContent: template.footerContent || "",
        defaultConditions: template.defaultConditions || [],
        officerFields: template.officerFields || [],
        isActive: template.isActive,
      });
      loadTags(template.serviceId);
    } else {
      setFormData({
        serviceId: services[0]?.id || "",
        templateName: "",
        templateCode: "",
        headerContent: "",
        bodyContent: DEFAULT_BODY_TEMPLATE,
        footerContent: "",
        defaultConditions: [
          "सदर प्रमाणपत्र कायदेशीर नियमांचे पालन करण्याच्या अटीवर वैध राहील.",
          "प्रमाणपत्रातील माहिती खोटी आढळल्यास हे प्रमाणपत्र पूर्वसूचना न देता रद्द केले जाईल.",
        ],
        officerFields: [
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
          {
            fieldKey: "SpecialConditions",
            fieldLabelMarathi: "विशेष अटी व शर्ती",
            fieldLabelEnglish: "Terms & Conditions",
            fieldType: "textarea",
            isMandatory: false,
          },
        ],
        isActive: true,
      });
      if (services[0]?.id) {
        loadTags(Number(services[0].id));
      }
    }
  }, [template, services, isOpen]);

  const loadTags = async (srvId: number) => {
    if (!srvId) return;
    const tags = await fetchAvailableTagsAction(srvId);
    setAvailableTags(tags);
  };

  const handleServiceChange = (srvId: string) => {
    setFormData((prev) => ({ ...prev, serviceId: srvId }));
    loadTags(Number(srvId));
  };

  const insertTag = (tagKey: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyContent: prev.bodyContent + ` ${tagKey} `,
    }));
    toast.success(`टॅग जोडला: ${tagKey}`);
  };

  const addOfficerField = () => {
    const newKey = `CustomField_${(formData.officerFields?.length || 0) + 1}`;
    setFormData((prev) => ({
      ...prev,
      officerFields: [
        ...(prev.officerFields || []),
        {
          fieldKey: newKey,
          fieldLabelMarathi: "नवीन फील्ड",
          fieldLabelEnglish: "New Field",
          fieldType: "text",
          isMandatory: false,
        },
      ],
    }));
  };

  const updateOfficerField = (index: number, patch: Partial<OfficerFieldConfig>) => {
    setFormData((prev) => {
      const updated = [...(prev.officerFields || [])];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, officerFields: updated };
    });
  };

  const removeOfficerField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      officerFields: prev.officerFields?.filter((_, i) => i !== index),
    }));
  };

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      defaultConditions: [...(prev.defaultConditions || []), "नवीन अट/शर्त"],
    }));
  };

  const updateCondition = (index: number, text: string) => {
    setFormData((prev) => {
      const updated = [...(prev.defaultConditions || [])];
      updated[index] = text;
      return { ...prev, defaultConditions: updated };
    });
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      defaultConditions: prev.defaultConditions?.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!formData.serviceId) {
      toast.error("कृपया सेवा निवडा");
      return;
    }
    if (!formData.templateName.trim()) {
      toast.error("कृपया टेम्पलेटचे नाव प्रविष्ट करा");
      return;
    }
    if (!formData.bodyContent.trim()) {
      toast.error("कृपया प्रमाणपत्र टेम्पलेट मजकूर प्रविष्ट करा");
      return;
    }

    startTransition(async () => {
      const res = await saveCertificateTemplateAction(formData);
      if (res.success) {
        toast.success(template ? "टेम्पलेट यशस्वीरीत्या अपडेट केले!" : "टेम्पलेट यशस्वीरीत्या तयार केले!");
        onSaved();
        onClose();
      } else {
        toast.error(res.error || "टेम्पलेट सेव्ह करताना त्रुटी आली.");
      }
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={template ? "प्रमाणपत्र टेम्पलेट संपादन (Edit Template)" : "नवीन प्रमाणपत्र टेम्पलेट तयार करा (New Template)"}
      maxWidth="xl"
    >
      <div className="flex flex-col h-[75vh]">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-all ${
              activeTab === "basic"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            मूलभूत माहिती (Basic Info)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("template")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-all ${
              activeTab === "template"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            टेम्पलेट मजकूर व टॅग्ज (Body & Tags)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("officerFields")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-all ${
              activeTab === "officerFields"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            अधिकाऱ्याचे इनपुट्स ({formData.officerFields?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("conditions")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-all ${
              activeTab === "conditions"
                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            अटी व शर्ती ({formData.defaultConditions?.length || 0})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Basic Info */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RTS सेवा निवडा <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                  disabled={!!template}
                >
                  <option value="">-- सेवा निवडा --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.departmentName ? `(${s.departmentName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  टेम्पलेटचे नाव <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.templateName}
                  onChange={(e) => setFormData((p) => ({ ...p, templateName: e.target.value }))}
                  placeholder="उदा. फेरफार प्रमाणपत्र टेम्पलेट"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  टेम्पलेट कोड (Code)
                </label>
                <Input
                  value={formData.templateCode}
                  onChange={(e) => setFormData((p) => ({ ...p, templateCode: e.target.value.toUpperCase() }))}
                  placeholder="उदा. CERT_PTIS_MUTATION"
                />
              </div>

              <div className="flex items-center pt-6 gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  हे टेम्पलेट सक्रिय (Active) ठेवा
                </label>
              </div>
            </div>
          )}

          {/* 2. Template Body & Tags */}
          {activeTab === "template" && (
            <div className="space-y-3">
              {/* Tag Selector Chips */}
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                <div className="text-xs font-bold text-blue-950 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  उपलब्ध डायनॅमिक टॅग्ज (क्लिक केल्यावर थेट टेम्पलेटमध्ये जोडले जाईल):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.tagKey}
                      type="button"
                      onClick={() => insertTag(tag.tagKey)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border shadow-2xs transition-all hover:scale-105 active:scale-95 ${
                        tag.sourceType === "Officer"
                          ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                          : "bg-white text-slate-800 border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      title={tag.tagLabelEnglish}
                    >
                      <span>{tag.tagLabelMarathi}</span>
                      <code className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded">{tag.tagKey}</code>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  प्रमाणपत्र HTML / मजकूर टेम्पलेट:
                </label>
                <textarea
                  rows={14}
                  value={formData.bodyContent}
                  onChange={(e) => setFormData((p) => ({ ...p, bodyContent: e.target.value }))}
                  className="w-full p-3 font-mono text-xs text-emerald-400 bg-slate-900 rounded-md border border-slate-700 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  placeholder="<div>...</div>"
                />
              </div>
            </div>
          )}

          {/* 3. Officer Fields Config */}
          {activeTab === "officerFields" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-600">
                  मंजुरी अधिकाऱ्याने अंतिम टप्प्यावर भरावयाचे इनपुट फील्ड्स कॉन्फिगर करा:
                </div>
                <button
                  type="button"
                  onClick={addOfficerField}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> नवीन फील्ड जोडा
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {formData.officerFields?.map((field, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-md shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">Field Key (Tag)</label>
                      <Input
                        value={field.fieldKey}
                        onChange={(e) => updateOfficerField(idx, { fieldKey: e.target.value })}
                        placeholder="e.g. OrderNo"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">स्थानिक नाव (मराठी)</label>
                      <Input
                        value={field.fieldLabelMarathi}
                        onChange={(e) => updateOfficerField(idx, { fieldLabelMarathi: e.target.value })}
                        placeholder="उदा. जावक क्रमांक"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-500">प्रकार (Field Type)</label>
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateOfficerField(idx, { fieldType: e.target.value as any })}
                        className="w-full h-9 px-2 rounded-md border border-slate-300 text-xs bg-white"
                      >
                        <option value="text">Single Line Text</option>
                        <option value="textarea">Multi-line Textarea</option>
                        <option value="date">Date Picker</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <label className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isMandatory}
                          onChange={(e) => updateOfficerField(idx, { isMandatory: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        आवश्यक?
                      </label>
                      <button
                        type="button"
                        onClick={() => removeOfficerField(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="काढून टाका"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Default Conditions */}
          {activeTab === "conditions" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-600">
                  प्रमाणपत्रावर छापल्या जाणाऱ्या नेहमीच्या (Default) अटी व शर्तींची यादी:
                </div>
                <button
                  type="button"
                  onClick={addCondition}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> नवीन अट जोडा
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {formData.defaultConditions?.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-md">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">{idx + 1}.</span>
                    <Input
                      value={cond}
                      onChange={(e) => updateCondition(idx, e.target.value)}
                      placeholder="अट प्रविष्ट करा..."
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end gap-2 shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            रद्द करा (Cancel)
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-1.5" />
            {isPending ? "सेव्ह होत आहे..." : "टेम्पलेट जतन करा (Save Template)"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
