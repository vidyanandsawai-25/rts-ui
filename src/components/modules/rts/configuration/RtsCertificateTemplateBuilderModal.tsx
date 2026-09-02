"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Award,
  CheckCircle2,
  Copy,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Hash,
  Layers,
  LayoutTemplate,
  ListOrdered,
  MoveDown,
  MoveUp,
  Plus,
  QrCode,
  Save,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Table,
  Tag,
  Trash2,
  Type,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Input,
  Modal,
  ToggleSwitch,
} from "@/components/common";
import {
  fetchAvailableTagsAction,
  saveCertificateTemplateAction,
  type CertificateTemplateFormData,
  type CertificateUlbInfo,
} from "@/app/[locale]/rts/configuration-settings/rts-certificates/actions";
import type {
  CertificateAvailableTag,
  OfficerFieldConfig,
  RTSCertificateTemplate,
} from "@/types/rts/certificate.types";

interface RtsCertificateTemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: RTSCertificateTemplate | null;
  services: { id: string; name: string; departmentName?: string }[];
  ulbInfo?: CertificateUlbInfo;
  onSaved: () => void;
}

// ---------------------------------------------------------------------------
// Band Model for Drag & Drop Report Canvas
// ---------------------------------------------------------------------------
export type ReportBandType =
  | "HEADER_LETTERHEAD"      // 🏛️ मनपा लेटरहेड (Auto ULB Master)
  | "DISPATCH_DATE"          // 🔢 जावक क्रमांक व दिनांक पट्टी
  | "RECIPIENT_BLOCK"        // 👤 प्रति / अर्जदार तपशील
  | "SUBJECT_REFERENCE"      // 📌 विषय व संदर्भ
  | "SALUTATION"             // ✍️ संबोधन ('महोदय / महोदया,')
  | "NARRATIVE_BODY"         // 📜 मुख्य मजकूर परिच्छेद (Dynamic Placeholders)
  | "CONDITIONS_LIST"        // ⚖️ शर्ती व अटी / टिप (Numbered Clauses)
  | "TABULAR_GRID"           // 📊 तक्ता / तपशील ग्रिड
  | "SIGNATURE_AND_STAMP"    // 🖋️ स्वाक्षरी, मनपा अधिकृत शिक्का व पदनाम
  | "SECURITY_QR_BARCODE"    // 🛡️ डिजिटल सत्यापन, QR कोड व बारकोड
  | "FOOTER_FILE_PATH"       // 📄 फायलिंग संदर्भ ओळ
  | "CUSTOM_TEXT_BLOCK";     // 🔲 सानुकूल मजकूर

export interface ReportBand {
  id: string;
  type: ReportBandType;
  title: string;
  enabled: boolean;
  data: Record<string, any>;
}

// Default ULB Fallback Data
const DEFAULT_ULB: CertificateUlbInfo = {
  ulbName: "",
  ulbNameLocal: "",
  ulbAddress: "",
  emailId: "",
  websiteUrl: "",
  mobileNo: "",
  ulbLogo: "/images/org_logo.png",
};

// Available Toolbox Elements
const TOOLBOX_BANDS: { type: ReportBandType; title: string; desc: string; icon: any }[] = [
  { type: "HEADER_LETTERHEAD", title: "🏛️ मनपा लेटरहेड", desc: "बोधचिन्ह, मनपा नाव, पत्ता व ई-मेल (Auto ULB Master)", icon: LayoutTemplate },
  { type: "DISPATCH_DATE", title: "🔢 जावक व दिनांक", desc: "जावक क्रमांक, दाखला क्र. आणि निर्गमित दिनांक", icon: Hash },
  { type: "RECIPIENT_BLOCK", title: "👤 प्रति / अर्जदार", desc: "प्रति, अर्जदाराचे नाव, पत्ता व मोबाईल क्रमांक", icon: User },
  { type: "SUBJECT_REFERENCE", title: "📌 विषय व संदर्भ", desc: "विषय ओळ आणि अर्जाचा संदर्भ", icon: FileCheck2 },
  { type: "SALUTATION", title: "✍️ संबोधन", desc: "महोदय / महोदया संबोधन ओळ", icon: Type },
  { type: "NARRATIVE_BODY", title: "📜 मुख्य मजकूर", desc: "अधिकृत मजकूर व १-क्लिक डायनॅमिक टॅग्ज", icon: FileText },
  { type: "CONDITIONS_LIST", title: "⚖️ शर्ती व अटी", desc: "क्रमांकवार अटी-शर्तींची यादी (१ ते १३...)", icon: ListOrdered },
  { type: "TABULAR_GRID", title: "📊 तक्ता / गुणपत्रक", desc: "कॉलम व रो चा सुटसुटीत शासकीय तक्ता", icon: Table },
  { type: "SIGNATURE_AND_STAMP", title: "🖋️ स्वाक्षरी व शिक्का", desc: "मनपाचा अधिकृत गोल शिक्का व डिजिटल स्वाक्षरी", icon: ShieldCheck },
  { type: "SECURITY_QR_BARCODE", title: "🛡️ QR व सुरक्षा", desc: "सत्यापन QR कोड, बारकोड व कायदेशीर पादटीप", icon: QrCode },
  { type: "FOOTER_FILE_PATH", title: "📄 फायलिंग ओळ", desc: "संगणकीय पाथ संदर्भ (उदा. D:\\अकोला मनपा...)", icon: FileSpreadsheet },
  { type: "CUSTOM_TEXT_BLOCK", title: "🔲 सानुकूल ब्लॉक / टिप", desc: "विशेष सूचना, वैधता मुदत किंवा अतिरिक्त मजकूर", icon: Type },
];

export default function RtsCertificateTemplateBuilderModal({
  isOpen,
  onClose,
  template,
  services,
  ulbInfo,
  onSaved,
}: RtsCertificateTemplateBuilderModalProps) {
  // Use ULB info from master
  const activeUlb: CertificateUlbInfo = useMemo(() => {
    return {
      ulbName: ulbInfo?.ulbName || DEFAULT_ULB.ulbName,
      ulbNameLocal: ulbInfo?.ulbNameLocal || DEFAULT_ULB.ulbNameLocal,
      ulbAddress: ulbInfo?.ulbAddress || DEFAULT_ULB.ulbAddress,
      emailId: ulbInfo?.emailId || DEFAULT_ULB.emailId,
      websiteUrl: ulbInfo?.websiteUrl || DEFAULT_ULB.websiteUrl,
      mobileNo: ulbInfo?.mobileNo || DEFAULT_ULB.mobileNo,
      ulbLogo: ulbInfo?.ulbLogo || DEFAULT_ULB.ulbLogo,
    };
  }, [ulbInfo]);

  // Form State
  const [formData, setFormData] = useState({
    serviceId: services[0]?.id || "1",
    templateName: "अधिकृत शासकीय प्रमाणपत्र",
    templateCode: "RTS_CERT_STANDARD",
    isActive: true,
  });

  // Dynamic Officer Approval Fields
  const [officerFields, setOfficerFields] = useState<OfficerFieldConfig[]>([
    { fieldKey: "OutwardNo", fieldLabelMarathi: "जावक क्रमांक", fieldLabelEnglish: "Outward No", fieldType: "text", isMandatory: true },
    { fieldKey: "ValidityDays", fieldLabelMarathi: "दाखल्याची वैधता (दिवस)", fieldLabelEnglish: "Validity Days", fieldType: "number", isMandatory: false },
    { fieldKey: "FeeReceiptNo", fieldLabelMarathi: "पावती क्रमांक", fieldLabelEnglish: "Receipt No", fieldType: "text", isMandatory: false },
    { fieldKey: "OfficerRemarks", fieldLabelMarathi: "अधिकारी शेरा", fieldLabelEnglish: "Remarks", fieldType: "textarea", isMandatory: false },
  ]);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabelMr, setNewFieldLabelMr] = useState("");
  const [newFieldType, setNewFieldType] = useState<OfficerFieldConfig["fieldType"]>("text");

  // Dynamic Tags from DB for selected service
  const [availableTags, setAvailableTags] = useState<CertificateAvailableTag[]>([]);
  const [tagSearch, setTagSearch] = useState("");

  // Report Designer Canvas Bands
  const [bands, setBands] = useState<ReportBand[]>([]);
  const [selectedBandId, setSelectedBandId] = useState<string | null>("band-header");

  // Canvas UI State
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showSampleData, setShowSampleData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "officerInputs" | "tags">("canvas");

  const [isPending, startTransition] = useTransition();

  // Helper to generate a fully dynamic official base template assigned to any service
  const generateDynamicBaseBandsForService = (serviceId: string, serviceName: string, deptName?: string): ReportBand[] => {
    return [
      {
        id: "band-header",
        type: "HEADER_LETTERHEAD",
        title: "मनपा लेटरहेड (ULB Letterhead)",
        enabled: true,
        data: {
          showLogo: true,
          showEmblem: false,
          departmentSubtitle: deptName ? `${deptName} कार्यालय` : "अधिकृत विभाग कार्यालय",
          showAddress: true,
          showEmail: true,
          showDivider: true,
          topTrackingCode: `AKL-MC-RTS-${serviceId}-2026`,
        },
      },
      {
        id: "band-dispatch",
        type: "DISPATCH_DATE",
        title: "जावक क्र. व दिनांक",
        enabled: true,
        data: {
          outwardPrefix: "जा.क्र. अमनपा/RTS/[[OutwardNo]]/",
          outwardTag: "",
          outwardSuffix: "२०२६",
          datePrefix: "दिनांक: ",
          dateTag: "{{ApprovalDate}}",
        },
      },
      {
        id: "band-recipient",
        type: "RECIPIENT_BLOCK",
        title: "प्रति (Recipient Block)",
        enabled: true,
        data: {
          salutation: "प्रति,",
          applicantName: "श्री/श्रीमती {{ApplicantName}}",
          address: "पत्ता: {{ApplicantAddress}}",
          mobile: "मो.: {{ApplicantMobile}}",
        },
      },
      {
        id: "band-subject",
        type: "SUBJECT_REFERENCE",
        title: "विषय व संदर्भ",
        enabled: true,
        data: {
          subjectText: `विषय :- ${serviceName} बाबत अधिकृत प्रमाणपत्र पुरविणेबाबत.`,
          referenceText: "संदर्भ :- आपला ऑनलाईन RTS अर्ज क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}",
        },
      },
      {
        id: "band-salutation",
        type: "SALUTATION",
        title: "संबोधन",
        enabled: true,
        data: { text: "महोदय / महोदया," },
      },
      {
        id: "band-body",
        type: "NARRATIVE_BODY",
        title: "मुख्य मजकूर (Main Narrative)",
        enabled: true,
        data: {
          text: `उपरोक्त विषयान्वये आपणास कळविण्यात येते की, आपण महाराष्ट्र लोकसेवा हक्क अधिनियमान्वये केलेल्या अर्जानुसार (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}), संबंधित कागदपत्रांची छाननी व स्थळ पाहणी करण्यात आली आहे.

सबब, विहित नियमांच्या अधीन राहून {{ApplicantName}} (रा. {{ApplicantAddress}}) यांना ${serviceName} प्रमाणपत्र दिनांक {{ApprovalDate}} रोजी खालील अटी व शर्तींच्या अधीन राहून निर्गमित करण्यात येत आहे.`,
        },
      },
      {
        id: "band-conditions",
        type: "CONDITIONS_LIST",
        title: "शर्ती व अटी (Terms & Conditions)",
        enabled: true,
        data: {
          heading: "शर्ती व अटी",
          items: [
            "सदर प्रमाणपत्र हे अर्जदाराने सादर केलेल्या माहिती व कागदपत्रांच्या आधारे जारी करण्यात आले आहे.",
            "सादर केलेल्या माहितीमध्ये कोणतीही दिशाभूल अथवा खोटी माहिती आढळल्यास सदर दाखला रद्दबातल ठरविण्यात येईल.",
            "सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून विहित मुदतीपर्यंत ग्राह्य धरता येईल.",
            "महानगरपालिकेच्या सर्व प्रचलित नियमांचे व कायद्याचे पालन करणे बंधनकारक राहील.",
          ],
        },
      },
      {
        id: "band-tip",
        type: "CUSTOM_TEXT_BLOCK",
        title: "वैधता टिप (Validity Tip)",
        enabled: true,
        data: {
          text: "टिप :- सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून ९० दिवसांपर्यंत ग्राह्य धरता येईल.",
          isBold: true,
          borderColor: "border-transparent",
        },
      },
      {
        id: "band-sign",
        type: "SIGNATURE_AND_STAMP",
        title: "स्वाक्षरी, मनपा शिक्का व पदनाम",
        enabled: true,
        data: {
          showLeftClerkSign: true,
          leftSignLabel: "लिपिक / शाखा प्रमुख",
          showCenterSealStamp: true,
          showRightDigitalSign: true,
          officerDesignation: "सहायक आयुक्त / विभाग प्रमुख",
          departmentName: activeUlb.ulbNameLocal,
        },
      },
      {
        id: "band-sec",
        type: "SECURITY_QR_BARCODE",
        title: "QR कोड व पडताळणी",
        enabled: true,
        data: {
          showQr: true,
          showBarcode: true,
          disclaimer: "हे प्रमाणपत्र संगणकीय प्रणालीद्वारे डिजिटल स्वाक्षरीने जारी केलेले असून यावर प्रत्यक्ष स्वाक्षरीची आवश्यकता नाही.",
        },
      },
      {
        id: "band-footer-file",
        type: "FOOTER_FILE_PATH",
        title: "फायलिंग संदर्भ ओळ",
        enabled: true,
        data: {
          filePath: `D:${activeUlb.ulbNameLocal} \\ ${deptName || "RTS_Department"} \\ Certificate`,
        },
      },
    ];
  };

  // Load Initial Template or Initialize Standard Format
  useEffect(() => {
    if (template && isOpen) {
      setFormData({
        serviceId: String(template.serviceId),
        templateName: template.templateName,
        templateCode: template.templateCode,
        isActive: template.isActive,
      });

      if (template.officerFields && template.officerFields.length > 0) {
        setOfficerFields(template.officerFields);
      }

      const srv = services.find((s) => s.id === String(template.serviceId));
      const base = generateDynamicBaseBandsForService(
        String(template.serviceId),
        srv?.name || template.templateName,
        srv?.departmentName
      );
      setBands(base);
      setSelectedBandId(base[0]?.id || null);

      loadTags(template.serviceId);
    } else if (!template && isOpen) {
      const firstSrv = services[0];
      const base = generateDynamicBaseBandsForService(
        firstSrv?.id || "1",
        firstSrv?.name || "शासकीय सेवा",
        firstSrv?.departmentName
      );

      setFormData({
        serviceId: firstSrv?.id || "1",
        templateName: `${firstSrv?.name || "RTS"} प्रमाणपत्र दाखला`,
        templateCode: `RTS_CERT_${firstSrv?.id || "1"}`,
        isActive: true,
      });
      setBands(base);
      setSelectedBandId(base[0]?.id || null);

      if (firstSrv?.id) {
        loadTags(Number(firstSrv.id));
      }
    }
  }, [template, isOpen, services]);

  const loadTags = async (srvId: number) => {
    if (!srvId) return;
    const tags = await fetchAvailableTagsAction(srvId);
    setAvailableTags(tags);
  };

  const handleServiceChange = (srvId: string) => {
    const srv = services.find((s) => s.id === srvId);
    setFormData((prev) => ({
      ...prev,
      serviceId: srvId,
      templateName: `${srv?.name || "RTS"} प्रमाणपत्र दाखला`,
      templateCode: `RTS_CERT_${srvId}`,
    }));

    const base = generateDynamicBaseBandsForService(srvId, srv?.name || "शासकीय सेवा", srv?.departmentName);
    setBands(base);
    setSelectedBandId(base[0]?.id || null);
    loadTags(Number(srvId));
    toast.info(`'${srv?.name}' सेवेचे मानक शासकीय स्वरूप लोड केले.`);
  };

  // Band Reordering & Manipulation
  const moveBand = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bands.length) return;

    const updated = [...bands];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBands(updated);
  };

  const deleteBand = (id: string) => {
    if (bands.length <= 1) {
      toast.error("कमीत कमी १ विभाग असणे आवश्यक आहे.");
      return;
    }
    const updated = bands.filter((b) => b.id !== id);
    setBands(updated);
    if (selectedBandId === id) {
      setSelectedBandId(updated[0]?.id || null);
    }
    toast.success("विभाग काढला.");
  };

  const duplicateBand = (band: ReportBand) => {
    const newId = `band-${Date.now()}`;
    const copy: ReportBand = {
      ...JSON.parse(JSON.stringify(band)),
      id: newId,
      title: `${band.title} (प्रत)`,
    };
    const index = bands.findIndex((b) => b.id === band.id);
    const updated = [...bands];
    updated.splice(index + 1, 0, copy);
    setBands(updated);
    setSelectedBandId(newId);
    toast.success("विभागाची प्रत जोडली.");
  };

  const addBandFromToolbox = (type: ReportBandType) => {
    const tool = TOOLBOX_BANDS.find((t) => t.type === type);
    if (!tool) return;

    const newId = `band-${Date.now()}`;
    let defaultData: Record<string, any> = {};

    switch (type) {
      case "HEADER_LETTERHEAD":
        defaultData = {
          showLogo: true,
          showEmblem: false,
          departmentSubtitle: "अधिकृत शासकीय विभाग",
          showAddress: true,
          showEmail: true,
          showDivider: true,
          topTrackingCode: "AKL-MC-RTS-2026",
        };
        break;
      case "DISPATCH_DATE":
        defaultData = {
          outwardPrefix: "जा.क्र. अमनपा/RTS/[[OutwardNo]]/",
          outwardTag: "",
          outwardSuffix: "२०२६",
          datePrefix: "दिनांक: ",
          dateTag: "{{ApprovalDate}}",
        };
        break;
      case "RECIPIENT_BLOCK":
        defaultData = {
          salutation: "प्रति,",
          applicantName: "श्री. {{ApplicantName}}",
          address: "पत्ता: {{ApplicantAddress}}",
          mobile: "मो.: {{ApplicantMobile}}",
        };
        break;
      case "SUBJECT_REFERENCE":
        defaultData = {
          subjectText: "विषय :- {{ServiceTitle}} पुरविणेबाबत अधिकृत दाखला.",
          referenceText: "संदर्भ :- आपला RTS ऑनलाईन अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}",
        };
        break;
      case "SALUTATION":
        defaultData = { text: "महोदय / महोदया," };
        break;
      case "NARRATIVE_BODY":
        defaultData = {
          text: "उपरोक्त विषयान्वये आपणास कळविण्यात येते की, आपल्या अर्जानुसार (अर्ज क्र. {{ApplicationNo}}) संबंधित जागेची/व्यवसायाची पाहणी करण्यात आली असून खालीलप्रमाणे दाखला निर्गमित करण्यात येत आहे.",
        };
        break;
      case "CONDITIONS_LIST":
        defaultData = {
          heading: "शर्ती व अटी",
          items: [
            "सदर दाखला विहित मुदतीसाठीच ग्राह्य राहील.",
            "कोणत्याही अनधिकृत बदलास परवानगी असणार नाही.",
          ],
        };
        break;
      case "TABULAR_GRID":
        defaultData = {
          headers: ["अ.क्र.", "तपशील", "नोंद"],
          rows: [
            ["१", "अर्जदाराचे नाव", "{{ApplicantName}}"],
            ["२", "पत्ता", "{{ApplicantAddress}}"],
          ],
        };
        break;
      case "SIGNATURE_AND_STAMP":
        defaultData = {
          showLeftClerkSign: false,
          showCenterSealStamp: true,
          showRightDigitalSign: true,
          officerDesignation: "सक्षम प्राधिकारी",
          departmentName: activeUlb.ulbNameLocal,
        };
        break;
      case "SECURITY_QR_BARCODE":
        defaultData = {
          showQr: true,
          showBarcode: true,
          disclaimer: "हे प्रमाणपत्र डिजिटल स्वाक्षरीने जारी केले आहे.",
        };
        break;
      case "FOOTER_FILE_PATH":
        defaultData = {
          filePath: `D:${activeUlb.ulbNameLocal} \\ RTS_Certificate`,
        };
        break;
      case "CUSTOM_TEXT_BLOCK":
        defaultData = {
          text: "टिप :- सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून ९० दिवसांपर्यंत ग्राह्य धरता येईल.",
          isBold: true,
          borderColor: "border-transparent",
        };
        break;
    }

    const newBand: ReportBand = {
      id: newId,
      type,
      title: tool.title,
      enabled: true,
      data: defaultData,
    };

    setBands((prev) => [...prev, newBand]);
    setSelectedBandId(newId);
    toast.success(`'${tool.title}' कॅनव्हासवर जोडला!`);
  };

  const updateSelectedBandData = (key: string, value: any) => {
    if (!selectedBandId) return;
    setBands((prev) =>
      prev.map((b) =>
        b.id === selectedBandId
          ? { ...b, data: { ...b.data, [key]: value } }
          : b
      )
    );
  };

  // Add Dynamic Officer Field
  const handleAddOfficerField = () => {
    if (!newFieldKey.trim() || !newFieldLabelMr.trim()) {
      toast.error("कृपया फील्ड की आणि मराठी नाव प्रविष्ट करा.");
      return;
    }
    const cleanKey = newFieldKey.trim().replace(/[^a-zA-Z0-9]/g, "");
    if (officerFields.some((f) => f.fieldKey.toLowerCase() === cleanKey.toLowerCase())) {
      toast.error("ही फील्ड की आधीच अस्तित्वात आहे.");
      return;
    }

    const newField: OfficerFieldConfig = {
      fieldKey: cleanKey,
      fieldLabelMarathi: newFieldLabelMr.trim(),
      fieldLabelEnglish: cleanKey,
      fieldType: newFieldType,
      isMandatory: true,
    };

    setOfficerFields((prev) => [...prev, newField]);
    setNewFieldKey("");
    setNewFieldLabelMr("");
    toast.success(`'${newField.fieldLabelMarathi}' अधिकारी फील्ड जोडले!`);
  };

  const handleDeleteOfficerField = (key: string) => {
    setOfficerFields((prev) => prev.filter((f) => f.fieldKey !== key));
    toast.success("अधिकारी फील्ड काढले.");
  };

  // Insert dynamic tag into currently active band's text
  const insertTagIntoSelectedBand = (tagKey: string) => {
    if (!selectedBand) return;

    if (selectedBand.type === "NARRATIVE_BODY") {
      const current = selectedBand.data.text || "";
      updateSelectedBandData("text", `${current} ${tagKey} `);
      toast.success(`टॅग जोडला: ${tagKey}`);
    } else if (selectedBand.type === "SUBJECT_REFERENCE") {
      const current = selectedBand.data.subjectText || "";
      updateSelectedBandData("subjectText", `${current} ${tagKey} `);
      toast.success(`विषयात टॅग जोडला: ${tagKey}`);
    } else if (selectedBand.type === "CUSTOM_TEXT_BLOCK") {
      const current = selectedBand.data.text || "";
      updateSelectedBandData("text", `${current} ${tagKey} `);
      toast.success(`टॅग जोडला: ${tagKey}`);
    } else {
      toast.info("हा टॅग कॉपी केला: " + tagKey);
      navigator.clipboard.writeText(tagKey);
    }
  };

  // Compile Bands into Official Government HTML with Double Outline Border and Seal
  const compileReportHtml = (): string => {
    let html = `
      <div class='official-certificate-sheet p-8 bg-white text-slate-900 leading-normal border-[5px] border-double border-slate-900 relative shadow-sm' style='min-height: 297mm; font-family: "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif; font-size: 13px;'>
    `;

    for (const b of bands) {
      if (!b.enabled) continue;

      switch (b.type) {
        case "HEADER_LETTERHEAD":
          html += `
            <div class='header-letterhead mb-3'>
              ${b.data.topTrackingCode ? `<div class='flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1'><div>${b.data.topTrackingCode}</div><div>1/1065739/2026</div></div>` : ""}
              <div class='flex items-start justify-between gap-4'>
                ${b.data.showLogo ? `<div class='w-20 shrink-0 text-center'><img src='${activeUlb.ulbLogo}' alt='ULB Logo' class='max-h-20 max-w-full object-contain mx-auto' onerror="this.style.display='none'"/><div class='text-[9px] font-bold text-slate-700 mt-0.5'>${activeUlb.ulbNameLocal}</div></div>` : "<div></div>"}
                <div class='text-center flex-1'>
                  <div class='text-xl md:text-2xl font-bold text-slate-900 font-serif'>${activeUlb.ulbNameLocal}</div>
                  ${b.data.departmentSubtitle ? `<div class='text-sm md:text-base font-semibold text-slate-800 mt-0.5'>${b.data.departmentSubtitle}</div>` : ""}
                  ${b.data.showAddress ? `<div class='text-xs text-slate-700 mt-0.5'>${activeUlb.ulbAddress}</div>` : ""}
                  ${b.data.showEmail ? `<div class='text-[11px] text-slate-600 mt-0.5 font-sans'>ई-मेल - ${activeUlb.emailId}</div>` : ""}
                </div>
                <div class='w-20 shrink-0'></div>
              </div>
              ${b.data.showDivider ? `<div class='w-full border-b-2 border-slate-900 mt-2 mb-2'></div>` : ""}
            </div>
          `;
          break;

        case "DISPATCH_DATE":
          html += `
            <div class='dispatch-bar flex justify-between items-center text-xs md:text-sm font-semibold text-slate-900 my-2 px-1'>
              <div>${b.data.outwardPrefix || "जा.क्र. "}${b.data.outwardTag || ""}${b.data.outwardSuffix || ""}</div>
              <div>${b.data.datePrefix || "दिनांक: "}${b.data.dateTag || "{{ApprovalDate}}"}</div>
            </div>
          `;
          break;

        case "RECIPIENT_BLOCK":
          html += `
            <div class='recipient-block text-xs md:text-sm text-slate-900 my-3 leading-relaxed'>
              <div class='font-bold'>${b.data.salutation || "प्रति,"}</div>
              <div class='pl-6 font-bold'>${b.data.applicantName || "श्री. {{ApplicantName}}"}</div>
              ${b.data.address ? `<div class='pl-6 text-slate-800'>${b.data.address}</div>` : ""}
              ${b.data.mobile ? `<div class='pl-6 text-slate-800 font-mono'>${b.data.mobile}</div>` : ""}
            </div>
          `;
          break;

        case "SUBJECT_REFERENCE":
          html += `
            <div class='subject-ref-block text-xs md:text-sm text-slate-900 my-3 pl-8 leading-normal'>
              ${b.data.subjectText ? `<div class='font-bold mb-1'>${b.data.subjectText}</div>` : ""}
              ${b.data.referenceText ? `<div class='font-medium text-slate-800'>${b.data.referenceText}</div>` : ""}
            </div>
          `;
          break;

        case "SALUTATION":
          html += `
            <div class='salutation-block text-xs md:text-sm font-bold text-slate-900 mt-2 mb-1'>
              ${b.data.text || "महोदय / महोदया,"}
            </div>
          `;
          break;

        case "NARRATIVE_BODY":
          const paragraphs = (b.data.text || "").split("\n\n");
          html += `
            <div class='narrative-body text-xs md:text-sm text-slate-900 leading-relaxed text-justify space-y-2.5 my-3' style='text-indent: 2rem;'>
              ${paragraphs.map((p: string) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("")}
            </div>
          `;
          break;

        case "CONDITIONS_LIST":
          html += `
            <div class='conditions-block my-4 pt-2'>
              <div class='font-bold text-xs md:text-sm text-slate-900 mb-2'>
                ${b.data.heading || "शर्ती व अटी"}:
              </div>
              <ol class='list-decimal pl-6 text-xs text-slate-900 space-y-1.5 leading-normal'>
                ${(b.data.items || []).map((item: string) => `<li>${item}</li>`).join("")}
              </ol>
            </div>
          `;
          break;

        case "TABULAR_GRID":
          html += `
            <div class='tabular-grid-block my-4 overflow-hidden border border-slate-900'>
              <table class='w-full text-xs text-left border-collapse'>
                <thead class='bg-slate-100 font-bold border-b border-slate-900'>
                  <tr>
                    ${(b.data.headers || []).map((h: string) => `<th class='p-2 border-r border-slate-900 last:border-r-0 text-slate-900'>${h}</th>`).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${(b.data.rows || [])
                    .map(
                      (row: string[]) => `
                    <tr class='border-b border-slate-300 last:border-b-0'>
                      ${row.map((cell: string) => `<td class='p-2 border-r border-slate-300 last:border-r-0 text-slate-800'>${cell}</td>`).join("")}
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `;
          break;

        case "CUSTOM_TEXT_BLOCK":
          html += `
            <div class='custom-text-block my-3 p-2 text-xs md:text-sm text-slate-900 leading-normal ${b.data.isBold ? "font-bold" : ""}'>
              ${b.data.text || ""}
            </div>
          `;
          break;

        case "SIGNATURE_AND_STAMP":
          html += `
            <div class='signature-stamp-block mt-8 pt-4 flex justify-between items-end gap-4'>
              <div class='left-sign text-center text-xs'>
                ${b.data.showLeftClerkSign ? `
                  <div class='h-12 flex items-center justify-center font-serif italic text-slate-700 font-bold text-sm transform -rotate-6 border-b border-slate-400 pb-1'>
                    / / 2026
                  </div>
                  <div class='text-[11px] text-slate-600 font-medium mt-1'>${b.data.leftSignLabel || "लिपिक / शाखा"}</div>
                ` : "<div></div>"}
              </div>

              <div class='center-seal text-center'>
                ${b.data.showCenterSealStamp ? `
                  {{OfficialSealStamp}}
                ` : ""}
              </div>

              <div class='right-digital-sign text-right'>
                ${b.data.showRightDigitalSign ? `
                  {{DigitalSignature}}
                ` : ""}
              </div>
            </div>
          `;
          break;

        case "SECURITY_QR_BARCODE":
          html += `
            <div class='security-footer-block mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500'>
              <div class='flex items-center gap-2'>
                ${b.data.showQr ? `{{QRCode}}` : ""}
                ${b.data.showBarcode ? `<div class='font-mono tracking-widest text-[9px] font-bold'>||||||||||||||||||||||</div>` : ""}
              </div>
              <div class='text-center text-[9px] text-slate-500 max-w-md'>
                ${b.data.disclaimer || "सदर दाखला संगणकीय प्रणालीद्वारे तयार केलेला आहे."}
              </div>
            </div>
          `;
          break;

        case "FOOTER_FILE_PATH":
          html += `
            <div class='footer-file-path-block mt-6 pt-1 border-t-2 border-slate-900 text-[10px] text-slate-700 font-mono'>
              ${b.data.filePath || `D:${activeUlb.ulbNameLocal}`}
            </div>
          `;
          break;
      }
    }

    html += `</div>`;
    return html;
  };

  // Sample Data Replacement helper for Live Preview
  const replaceSamplePlaceholders = (text: string): string => {
    if (!showSampleData) return text;

    return text
      .replace(/{{ApplicantName}}/g, "मंगेश यादव कुलकर्णी")
      .replace(/{{ApplicantAddress}}/g, "रा. अकोला")
      .replace(/{{ApplicantMobile}}/g, "९९२११३४१५६")
      .replace(/{{ApplicationNo}}/g, "RTS00023191")
      .replace(/{{ApplicationDate}}/g, "२४/०७/२६")
      .replace(/{{ApprovalDate}}/g, "१२/०८/२०२६")
      .replace(/{{CurrentDate}}/g, "१२/०८/२०२६")
      .replace(/{{CertificateNo}}/g, "५४५/२०२६")
      .replace(/{{VillageName}}/g, "शिवापूर")
      .replace(/{{GatNo}}/g, "४०")
      .replace(/{{PlotNo}}/g, "१२")
      .replace(/{{ServiceTitle}}/g, "झोन दाखला")
      .replace(/{{DepartmentName}}/g, "नगर रचना विभाग")
      .replace(/\[\[OutwardNo\]\]/g, "५४५")
      .replace(/\[\[NocNumber\]\]/g, "TP/NOC/2026/0891")
      .replace(/\[\[ValidUptoDate\]\]/g, "३१ मार्च २०२७")
      .replace(/\[\[FeeReceiptNo\]\]/g, "REC/2026/00912")
      .replace(/\[\[EventDate\]\]/g, "०७.०९.२०२६")
      .replace(/\[\[GeneralRegNo\]\]/g, "GR/8912")
      .replace(/\[\[LeavingReason\]\]/g, "पालकांची बदली झाल्यामुळे")
      .replace(/\[\[ProgressRemark\]\]/g, "उत्तम (Very Good)");
  };

  // Save to Database
  const handleSave = () => {
    if (!formData.templateName.trim() || !formData.templateCode.trim()) {
      toast.error("कृपया प्रमाणपत्राचे नाव व कोड भरा.");
      return;
    }

    startTransition(async () => {
      const compiledHtml = compileReportHtml();

      // Extract conditions list for separate JSON field
      const condBand = bands.find((b) => b.type === "CONDITIONS_LIST");
      const defaultConditions = condBand?.data?.items || [];

      const payload: CertificateTemplateFormData = {
        id: template?.id,
        serviceId: formData.serviceId,
        templateName: formData.templateName,
        templateCode: formData.templateCode,
        headerContent: "",
        bodyContent: compiledHtml,
        footerContent: "",
        defaultConditions: defaultConditions,
        officerFields: officerFields,
        isActive: formData.isActive,
      };

      const res = await saveCertificateTemplateAction(payload);
      if (res.success) {
        toast.success("शासकीय प्रमाणपत्र टेम्पलेट यशस्वीरीत्या सेव्ह झाले!");
        onSaved();
        onClose();
      } else {
        toast.error(res.error || "टेम्पलेट सेव्ह करताना त्रुटी आली.");
      }
    });
  };

  const selectedBand = useMemo(() => {
    return bands.find((b) => b.id === selectedBandId);
  }, [bands, selectedBandId]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title=""
      maxWidth="2xl"
    >
      <div className="flex flex-col h-[90vh] bg-slate-100 -m-6 overflow-hidden">
        {/* Top Professional Action Bar without static sample presets */}
        <div className="bg-[#4b70a6] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-blue-100 border border-white/15">
                  RTS Municipal Certificate Studio
                </span>
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeUlb.ulbNameLocal}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-tight">
                {template ? `संपादन: ${template.templateName}` : "शासकीय दाखला डिझाईनर (Drag & Drop Certificate Studio)"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl px-3.5 py-2 border border-white/20"
            >
              बंद करा
            </Button>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 px-5 py-2 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              {isPending ? "जतन होत आहे..." : "डिझाईन सेव्ह करा"}
            </Button>
          </div>
        </div>

        {/* 3-Column Visual Workspace: Toolbox (Left) | Canvas (Center) | Properties & Tags (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">

          {/* Column 1: Toolbox Palette & Selected Service Info (3 Cols) */}
          <div className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Header Settings */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700">प्रमाणपत्राचे नाव</label>
                <Input
                  value={formData.templateName}
                  onChange={(e) => setFormData((p) => ({ ...p, templateName: e.target.value }))}
                  className="h-8 text-xs mt-0.5 rounded-lg"
                  placeholder="उदा. झोन दाखला"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600">टेम्पलेट कोड</label>
                  <Input
                    value={formData.templateCode}
                    onChange={(e) => setFormData((p) => ({ ...p, templateCode: e.target.value }))}
                    className="h-7 text-[11px] font-mono mt-0.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600">संलग्न सेवा</label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full h-7 text-[11px] font-medium border border-slate-300 rounded-lg px-2 bg-white mt-0.5"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Toolbox Bands Header */}
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#4b70a6]" />
                टूलबॉक्स (Toolbox Elements)
              </span>
              <span className="text-[10px] text-slate-500 font-medium">क्लिक करून जोडा</span>
            </div>

            {/* Toolbox Items List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {TOOLBOX_BANDS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.type}
                    type="button"
                    onClick={() => addBandFromToolbox(tool.type)}
                    className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-[#4b70a6] hover:bg-blue-50/50 bg-white transition-all group flex items-start gap-2.5 shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#4b70a6] group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#4b70a6] flex items-center justify-between">
                        <span>{tool.title}</span>
                        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4b70a6]" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{tool.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active ULB Info Banner (Auto Connected) */}
            <div className="p-2.5 bg-blue-50/80 border-t border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate leading-tight">
                <span className="font-bold">ULB Master: </span>
                <span className="text-slate-700">{activeUlb.ulbNameLocal}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Visual A4 Canvas with Double Outline Border and Live Render (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-200/90 flex flex-col h-full overflow-hidden border-r border-slate-200">
            {/* Canvas Toolbar */}
            <div className="bg-white border-b border-slate-300 px-4 py-2 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LayoutTemplate className="w-4 h-4 text-[#4b70a6]" />
                  A4 शासकीय कॅनव्हास ({bands.length} विभाग)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sample Data Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSampleData((p) => !p)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                    showSampleData
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                      : "bg-slate-100 text-slate-600 border-slate-300"
                  }`}
                  title="नमुना व्हॅल्यूज किंवा टॅग्स कोड स्विच करा"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showSampleData ? "नमुना डेटा दृश्य" : "टॅग्स दृश्य"}
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((p) => Math.max(70, p - 10))}
                    className="p-1 hover:bg-white rounded text-slate-600"
                    title="झूम कमी करा"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-700 px-1.5">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((p) => Math.min(130, p + 10))}
                    className="p-1 hover:bg-white rounded text-slate-600"
                    title="झूम वाढवा"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* A4 Sheet Canvas Area with Proper Double Outline Border */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  width: "210mm",
                  minHeight: "297mm",
                }}
                className="bg-white shadow-2xl rounded-sm border-[5px] border-double border-slate-900 p-8 space-y-2 transition-transform duration-150 relative text-slate-900"
              >
                {bands.map((band, idx) => {
                  const isSelected = band.id === selectedBandId;

                  return (
                    <div
                      key={band.id}
                      onClick={() => setSelectedBandId(band.id)}
                      className={`relative group rounded p-2 transition-all cursor-pointer border ${
                        isSelected
                          ? "border-[#4b70a6] bg-blue-50/20 ring-2 ring-[#4b70a6]/20 shadow-xs"
                          : "border-transparent hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Floating Band Control Toolbar on Hover/Select */}
                      <div
                        className={`absolute -top-3.5 right-2 z-20 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px] shadow-md transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <span className="font-bold text-blue-200 mr-1">{band.title}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBand(idx, "up");
                          }}
                          disabled={idx === 0}
                          className="hover:text-amber-300 disabled:opacity-30"
                          title="वर हलवा"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBand(idx, "down");
                          }}
                          disabled={idx === bands.length - 1}
                          className="hover:text-amber-300 disabled:opacity-30"
                          title="खाली हलवा"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBand(band);
                          }}
                          className="hover:text-blue-300"
                          title="प्रत करा"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBand(band.id);
                          }}
                          className="hover:text-red-400"
                          title="हटवा"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Render Band Content based on Type */}
                      {band.type === "HEADER_LETTERHEAD" && (
                        <div>
                          {band.data.topTrackingCode && (
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
                              <div>{band.data.topTrackingCode}</div>
                              <div>1/1065739/2026</div>
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-4">
                            {band.data.showLogo ? (
                              <div className="w-20 shrink-0 text-center">
                                <img
                                  src={activeUlb.ulbLogo}
                                  alt="ULB Logo"
                                  className="max-h-20 max-w-full object-contain mx-auto"
                                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                />
                                <div className="text-[9px] font-bold text-slate-700 mt-0.5">
                                  {activeUlb.ulbNameLocal}
                                </div>
                              </div>
                            ) : (
                              <div />
                            )}
                            <div className="text-center flex-1">
                              <div className="text-xl md:text-2xl font-bold text-slate-900 font-serif">
                                {activeUlb.ulbNameLocal}
                              </div>
                              {band.data.departmentSubtitle && (
                                <div className="text-sm md:text-base font-semibold text-slate-800 mt-0.5">
                                  {band.data.departmentSubtitle}
                                </div>
                              )}
                              {band.data.showAddress && (
                                <div className="text-xs text-slate-700 mt-0.5">
                                  {activeUlb.ulbAddress}
                                </div>
                              )}
                              {band.data.showEmail && (
                                <div className="text-[11px] text-slate-600 mt-0.5 font-sans">
                                  ई-मेल - {activeUlb.emailId}
                                </div>
                              )}
                            </div>
                            <div className="w-20 shrink-0" />
                          </div>
                          {band.data.showDivider && (
                            <div className="w-full border-b-2 border-slate-900 mt-2 mb-2" />
                          )}
                        </div>
                      )}

                      {band.type === "DISPATCH_DATE" && (
                        <div className="flex justify-between items-center text-xs md:text-sm font-semibold text-slate-900 my-1 px-1">
                          <div>
                            {replaceSamplePlaceholders(
                              `${band.data.outwardPrefix || ""}${band.data.outwardTag || ""}${band.data.outwardSuffix || ""}`
                            )}
                          </div>
                          <div>
                            {replaceSamplePlaceholders(
                              `${band.data.datePrefix || ""}${band.data.dateTag || ""}`
                            )}
                          </div>
                        </div>
                      )}

                      {band.type === "RECIPIENT_BLOCK" && (
                        <div className="text-xs md:text-sm text-slate-900 my-2 leading-relaxed">
                          <div className="font-bold">{band.data.salutation || "प्रति,"}</div>
                          <div className="pl-6 font-bold">
                            {replaceSamplePlaceholders(band.data.applicantName || "")}
                          </div>
                          {band.data.address && (
                            <div className="pl-6 text-slate-800">
                              {replaceSamplePlaceholders(band.data.address)}
                            </div>
                          )}
                          {band.data.mobile && (
                            <div className="pl-6 text-slate-800 font-mono">
                              {replaceSamplePlaceholders(band.data.mobile)}
                            </div>
                          )}
                        </div>
                      )}

                      {band.type === "SUBJECT_REFERENCE" && (
                        <div className="text-xs md:text-sm text-slate-900 my-2 pl-8 leading-normal">
                          {band.data.subjectText && (
                            <div className="font-bold mb-1">
                              {replaceSamplePlaceholders(band.data.subjectText)}
                            </div>
                          )}
                          {band.data.referenceText && (
                            <div className="font-medium text-slate-800">
                              {replaceSamplePlaceholders(band.data.referenceText)}
                            </div>
                          )}
                        </div>
                      )}

                      {band.type === "SALUTATION" && (
                        <div className="text-xs md:text-sm font-bold text-slate-900 mt-1 mb-1">
                          {band.data.text || "महोदय / महोदया,"}
                        </div>
                      )}

                      {band.type === "NARRATIVE_BODY" && (
                        <div
                          className="text-xs md:text-sm text-slate-900 leading-relaxed text-justify space-y-2.5 my-2"
                          style={{ textIndent: "2rem" }}
                        >
                          {(band.data.text || "").split("\n\n").map((p: string, i: number) => (
                            <p key={i}>{replaceSamplePlaceholders(p)}</p>
                          ))}
                        </div>
                      )}

                      {band.type === "CONDITIONS_LIST" && (
                        <div className="my-3 pt-1">
                          <div className="font-bold text-xs md:text-sm text-slate-900 mb-1.5">
                            {band.data.heading || "शर्ती व अटी"}:
                          </div>
                          <ol className="list-decimal pl-6 text-xs text-slate-900 space-y-1 leading-normal">
                            {(band.data.items || []).map((c: string, ci: number) => (
                              <li key={ci}>{replaceSamplePlaceholders(c)}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {band.type === "TABULAR_GRID" && (
                        <div className="my-3 overflow-hidden border border-slate-900">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-slate-100 font-bold border-b border-slate-900">
                              <tr>
                                {(band.data.headers || []).map((h: string, hi: number) => (
                                  <th key={hi} className="p-2 border-r border-slate-900 last:border-r-0">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(band.data.rows || []).map((row: string[], ri: number) => (
                                <tr key={ri} className="border-b border-slate-300 last:border-b-0">
                                  {row.map((cell: string, ci: number) => (
                                    <td key={ci} className="p-2 border-r border-slate-300 last:border-r-0">
                                      {replaceSamplePlaceholders(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {band.type === "CUSTOM_TEXT_BLOCK" && (
                        <div
                          className={`my-2 p-1 text-xs md:text-sm text-slate-900 leading-normal ${
                            band.data.isBold ? "font-bold" : ""
                          }`}
                        >
                          {replaceSamplePlaceholders(band.data.text || "")}
                        </div>
                      )}

                      {/* Official Seal Stamp and Digital Signature Block */}
                      {band.type === "SIGNATURE_AND_STAMP" && (
                        <div className="mt-8 pt-4 flex justify-between items-end gap-4">
                          <div className="left-sign text-center text-xs">
                            {band.data.showLeftClerkSign ? (
                              <div>
                                <div className="h-12 flex items-center justify-center font-serif italic text-slate-700 font-bold text-sm transform -rotate-6 border-b border-slate-400 pb-1">
                                  / / 2026
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium mt-1">
                                  {band.data.leftSignLabel || "लिपिक / शाखा"}
                                </div>
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>

                          {/* Center Official Municipal Seal Stamp */}
                          <div className="center-seal text-center">
                            {band.data.showCenterSealStamp && (
                              <div className="official-seal-stamp inline-block text-center">
                                <img
                                  src="/images/ulb-seal.png"
                                  alt={`${activeUlb.ulbNameLocal || activeUlb.ulbName || "स्थानिक स्वराज्य संस्था"} अधिकृत शिक्का`}
                                  className="w-28 h-28 object-contain transform -rotate-6 filter drop-shadow-xs inline-block"
                                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                />
                              </div>
                            )}
                          </div>

                          {/* Right Official Digital Signature Block */}
                          <div className="right-digital-sign text-right">
                            {band.data.showRightDigitalSign && (
                              <div>
                                <div className="digital-signature-card bg-emerald-50/90 border-2 border-emerald-600 p-2.5 rounded-lg text-left inline-block shadow-xs min-w-[220px] font-sans text-xs">
                                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] pb-1 border-b border-emerald-300 mb-1">
                                    <span className="text-emerald-700 font-bold text-sm">✔</span>
                                    <span>Digitally Signed (DSC Verified)</span>
                                  </div>
                                  <div className="font-bold text-slate-900 text-xs">Rajay Narayanrao Sable</div>
                                  <div className="text-[10px] text-slate-700 font-medium">
                                    {band.data.officerDesignation || "सहायक संचालक / विभाग प्रमुख"}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                    Date: 12-08-2026 18:14:06 IST
                                  </div>
                                  <div className="text-[9px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                                    <span>🔒</span> <span>e-Sign Verified & Authentic</span>
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-slate-900 mt-1">
                                  {band.data.officerDesignation || "सक्षम प्राधिकारी"}
                                </div>
                                <div className="text-[11px] text-slate-700">
                                  {band.data.departmentName || activeUlb.ulbNameLocal}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {band.type === "SECURITY_QR_BARCODE" && (
                        <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            {band.data.showQr && (
                              <div className="p-1 border border-slate-300 rounded font-mono text-[9px] font-bold">
                                [QR CODE]
                              </div>
                            )}
                            {band.data.showBarcode && (
                              <div className="font-mono tracking-widest text-[9px] font-bold">
                                ||||||||||||||||||||||
                              </div>
                            )}
                          </div>
                          <div className="text-center text-[9px] text-slate-500 max-w-md">
                            {band.data.disclaimer || "सदर दाखला संगणकीय प्रणालीद्वारे तयार केलेला आहे."}
                          </div>
                        </div>
                      )}

                      {band.type === "FOOTER_FILE_PATH" && (
                        <div className="mt-6 pt-1 border-t-2 border-slate-900 text-[10px] text-slate-700 font-mono">
                          {band.data.filePath || `D:${activeUlb.ulbNameLocal}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Properties Inspector & Dynamic Tags Palette (3 Cols) */}
          <div className="lg:col-span-3 bg-white flex flex-col h-full overflow-hidden">
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-1 p-2 border-b border-slate-200 bg-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("canvas")}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "canvas"
                    ? "bg-[#4b70a6] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                गुणधर्म
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tags")}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "tags"
                    ? "bg-[#4b70a6] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                टॅग्ज
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("officerInputs")}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "officerInputs"
                    ? "bg-[#4b70a6] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                अधिकारी
              </button>
            </div>

            {/* Tab 1: Band Properties Inspector */}
            {activeTab === "canvas" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedBand ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">निवडलेला विभाग</div>
                        <h4 className="text-sm font-bold text-slate-900">{selectedBand.title}</h4>
                      </div>
                      <Badge variant={selectedBand.enabled ? "success" : "secondary"} size="sm">
                        {selectedBand.enabled ? "सक्रिय" : "लपवलेला"}
                      </Badge>
                    </div>

                    {/* Properties specific to Band Type */}
                    {selectedBand.type === "HEADER_LETTERHEAD" && (
                      <div className="space-y-3">
                        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-xs text-blue-900">
                          🏛️ <strong>ULB Master ऑटो-कनेक्टेड:</strong> महानगरपालिकेचे नाव, पत्ता व ई-मेल आपोआप जोडले जातात.
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">विभाग / उप-शीर्षक (Department Subtitle)</label>
                          <Input
                            value={selectedBand.data.departmentSubtitle || ""}
                            onChange={(e) => updateSelectedBandData("departmentSubtitle", e.target.value)}
                            placeholder="उदा. सहायक संचालक, नगर रचना, यांचे कार्यालय"
                            className="mt-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">शीर्ष ट्रॅकिंग कोड (Top File Ref)</label>
                          <Input
                            value={selectedBand.data.topTrackingCode || ""}
                            onChange={(e) => updateSelectedBandData("topTrackingCode", e.target.value)}
                            placeholder="उदा. AKL-MC-8080(80)/433/2026"
                            className="mt-1 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">मनपा लोगो दाखवा</span>
                            <ToggleSwitch
                              checked={!!selectedBand.data.showLogo}
                              onChange={(val) => updateSelectedBandData("showLogo", val)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">पत्ता दाखवा</span>
                            <ToggleSwitch
                              checked={!!selectedBand.data.showAddress}
                              onChange={(val) => updateSelectedBandData("showAddress", val)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">ई-मेल दाखवा</span>
                            <ToggleSwitch
                              checked={!!selectedBand.data.showEmail}
                              onChange={(val) => updateSelectedBandData("showEmail", val)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">खालील विभाजन रेष (Divider)</span>
                            <ToggleSwitch
                              checked={!!selectedBand.data.showDivider}
                              onChange={(val) => updateSelectedBandData("showDivider", val)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "DISPATCH_DATE" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">जावक क्रमांक प्रिफिक्स</label>
                          <Input
                            value={selectedBand.data.outwardPrefix || ""}
                            onChange={(e) => updateSelectedBandData("outwardPrefix", e.target.value)}
                            className="mt-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">जावक सफिक्स</label>
                          <Input
                            value={selectedBand.data.outwardSuffix || ""}
                            onChange={(e) => updateSelectedBandData("outwardSuffix", e.target.value)}
                            className="mt-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">दिनांक प्रिफिक्स</label>
                          <Input
                            value={selectedBand.data.datePrefix || ""}
                            onChange={(e) => updateSelectedBandData("datePrefix", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "RECIPIENT_BLOCK" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">संबोधन (Salutation)</label>
                          <Input
                            value={selectedBand.data.salutation || ""}
                            onChange={(e) => updateSelectedBandData("salutation", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">अर्जदाराचे नाव</label>
                          <Input
                            value={selectedBand.data.applicantName || ""}
                            onChange={(e) => updateSelectedBandData("applicantName", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">पत्ता</label>
                          <Input
                            value={selectedBand.data.address || ""}
                            onChange={(e) => updateSelectedBandData("address", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">मोबाईल क्रमांक</label>
                          <Input
                            value={selectedBand.data.mobile || ""}
                            onChange={(e) => updateSelectedBandData("mobile", e.target.value)}
                            className="mt-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SUBJECT_REFERENCE" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">विषय ओळ (Subject)</label>
                          <textarea
                            value={selectedBand.data.subjectText || ""}
                            onChange={(e) => updateSelectedBandData("subjectText", e.target.value)}
                            rows={3}
                            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#4b70a6] mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">संदर्भ ओळ (Reference)</label>
                          <textarea
                            value={selectedBand.data.referenceText || ""}
                            onChange={(e) => updateSelectedBandData("referenceText", e.target.value)}
                            rows={2}
                            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#4b70a6] mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "NARRATIVE_BODY" && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700">मुख्य मजकूर परिच्छेद</label>
                        <textarea
                          value={selectedBand.data.text || ""}
                          onChange={(e) => updateSelectedBandData("text", e.target.value)}
                          rows={12}
                          className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#4b70a6] leading-relaxed font-serif"
                          placeholder="येथे शासकीय मजकूर प्रविष्ट करा..."
                        />
                        <div className="text-[11px] text-slate-500">
                          💡 <em>टिप:</em> उजवीकडील 'टॅग्ज' टॅबमधून १-क्लिकने टॅग जोडू शकता.
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "CONDITIONS_LIST" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">शीर्षक</label>
                          <Input
                            value={selectedBand.data.heading || ""}
                            onChange={(e) => updateSelectedBandData("heading", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">अटींची यादी ({(selectedBand.data.items || []).length})</label>
                          <div className="space-y-2 mt-1 max-h-72 overflow-y-auto">
                            {(selectedBand.data.items || []).map((item: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-600 mt-1">{idx + 1}.</span>
                                <textarea
                                  value={item}
                                  onChange={(e) => {
                                    const updated = [...(selectedBand.data.items || [])];
                                    updated[idx] = e.target.value;
                                    updateSelectedBandData("items", updated);
                                  }}
                                  rows={2}
                                  className="flex-1 p-1 text-xs border border-slate-300 rounded bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (selectedBand.data.items || []).filter((_: any, i: number) => i !== idx);
                                    updateSelectedBandData("items", updated);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => {
                              const updated = [...(selectedBand.data.items || []), "नवीन अट प्रविष्ट करा."];
                              updateSelectedBandData("items", updated);
                            }}
                            className="w-full mt-2 bg-white hover:bg-slate-50 text-[#4b70a6] text-xs font-bold border border-dashed border-[#4b70a6] py-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            अट जोडा
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SIGNATURE_AND_STAMP" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700">मनपा अधिकृत शिक्का (Official Seal)</span>
                          <ToggleSwitch
                            checked={!!selectedBand.data.showCenterSealStamp}
                            onChange={(val) => updateSelectedBandData("showCenterSealStamp", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700">डिजिटल स्वाक्षरी बॉक्स (DSC Card)</span>
                          <ToggleSwitch
                            checked={!!selectedBand.data.showRightDigitalSign}
                            onChange={(val) => updateSelectedBandData("showRightDigitalSign", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700">डावीकडील लिपिक/शाखा स्वाक्षरी</span>
                          <ToggleSwitch
                            checked={!!selectedBand.data.showLeftClerkSign}
                            onChange={(val) => updateSelectedBandData("showLeftClerkSign", val)}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700">अधिकारी पदनाम</label>
                          <Input
                            value={selectedBand.data.officerDesignation || ""}
                            onChange={(e) => updateSelectedBandData("officerDesignation", e.target.value)}
                            placeholder="उदा. सहायक संचालक, नगर रचना"
                            className="mt-1 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "CUSTOM_TEXT_BLOCK" && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700">मजकूर</label>
                        <textarea
                          value={selectedBand.data.text || ""}
                          onChange={(e) => updateSelectedBandData("text", e.target.value)}
                          rows={4}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#4b70a6]"
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-medium text-slate-700">ठळक (Bold) करा</span>
                          <ToggleSwitch
                            checked={!!selectedBand.data.isBold}
                            onChange={(val) => updateSelectedBandData("isBold", val)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    कॅनव्हासवरील कोणत्याही विभागावर क्लिक करून त्याचे गुणधर्म संपादित करा.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: 1-Click Dynamic Tags Palette */}
            {activeTab === "tags" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="टॅग शोधा..."
                    className="pl-8 h-8 text-xs rounded-lg"
                  />
                </div>

                {/* Citizen Tags */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    नागरिक व अर्ज माहिती (Citizen Tags)
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { key: "{{ApplicantName}}", label: "अर्जदाराचे पूर्ण नाव" },
                      { key: "{{ApplicantAddress}}", label: "अर्जदाराचा पत्ता" },
                      { key: "{{ApplicantMobile}}", label: "मोबाईल क्रमांक" },
                      { key: "{{ApplicationNo}}", label: "RTS अर्ज क्रमांक" },
                      { key: "{{ApplicationDate}}", label: "अर्ज दिनांक" },
                      { key: "{{ApprovalDate}}", label: "मंजुरी दिनांक" },
                      { key: "{{CertificateNo}}", label: "दाखला / जावक क्रमांक" },
                      { key: "{{ServiceTitle}}", label: "सेवेचे नाव" },
                      { key: "{{DepartmentName}}", label: "विभागाचे नाव" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => insertTagIntoSelectedBand(t.key)}
                        className="text-left p-2 rounded-lg border border-slate-200 hover:border-[#4b70a6] hover:bg-blue-50 bg-white transition-all flex items-center justify-between text-xs group"
                      >
                        <span className="font-semibold text-slate-800">{t.label}</span>
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 group-hover:bg-blue-200 font-mono">
                          {t.key}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Specific Tags from DB */}
                {availableTags.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      सेवा विशिष्ट टॅग्ज (Service Specific Tags)
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {availableTags
                        .filter(
                          (t) =>
                            t.tagLabelMarathi.toLowerCase().includes(tagSearch.toLowerCase()) ||
                            t.tagKey.toLowerCase().includes(tagSearch.toLowerCase())
                        )
                        .map((t) => (
                          <button
                            key={t.tagKey}
                            type="button"
                            onClick={() => insertTagIntoSelectedBand(t.tagKey)}
                            className="text-left p-2 rounded-lg border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 bg-emerald-50/20 transition-all flex items-center justify-between text-xs group"
                          >
                            <span className="font-semibold text-slate-800">{t.tagLabelMarathi}</span>
                            <code className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-mono">
                              {t.tagKey}
                            </code>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Officer Input Tags */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    अधिकारी इनपुट टॅग्ज (Officer Field Tags)
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {officerFields
                      .filter(
                        (f) =>
                          f.fieldLabelMarathi.toLowerCase().includes(tagSearch.toLowerCase()) ||
                          f.fieldKey.toLowerCase().includes(tagSearch.toLowerCase())
                      )
                      .map((f) => (
                        <button
                          key={f.fieldKey}
                          type="button"
                          onClick={() => insertTagIntoSelectedBand(`[[${f.fieldKey}]]`)}
                          className="text-left p-2 rounded-lg border border-amber-200 hover:border-amber-500 hover:bg-amber-50 bg-amber-50/20 transition-all flex items-center justify-between text-xs group"
                        >
                          <span className="font-semibold text-slate-800">{f.fieldLabelMarathi}</span>
                          <code className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono">
                            [[{f.fieldKey}]]
                          </code>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Dynamic Officer Approval Inputs Configurator */}
            {activeTab === "officerInputs" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  ⚙️ <strong>अधिकारी इनपुट्स:</strong> अर्ज मंजूर करताना अधिकाऱ्याने भरावयाची माहिती (उदा. जावक क्र., मुदत, पावती क्रमांक).
                </div>

                {/* Existing Fields List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">कॉन्फिगर केलेले फील्ड्स ({officerFields.length})</label>
                  {officerFields.map((f) => (
                    <div
                      key={f.fieldKey}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{f.fieldLabelMarathi}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                          <span>[[{f.fieldKey}]]</span>
                          <span>•</span>
                          <span className="capitalize">{f.fieldType}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteOfficerField(f.fieldKey)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="काढा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Officer Field */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">नवीन इनपुट फील्ड जोडा</div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">फील्ड की (English No-spaces)</label>
                    <Input
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      placeholder="उदा. OutwardNo, ReceiptNo"
                      className="h-7 text-xs font-mono mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">फील्डचे मराठी नाव (Label)</label>
                    <Input
                      value={newFieldLabelMr}
                      onChange={(e) => setNewFieldLabelMr(e.target.value)}
                      placeholder="उदा. जावक क्रमांक"
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600">प्रकार (Type)</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full h-7 text-xs border border-slate-300 rounded bg-white mt-0.5 px-2 font-medium"
                    >
                      <option value="text">मजकूर (Text)</option>
                      <option value="number">संख्या (Number)</option>
                      <option value="date">दिनांक (Date)</option>
                      <option value="textarea">सविस्तर शेरा (Textarea)</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleAddOfficerField}
                    className="w-full bg-[#4b70a6] hover:bg-[#3d5a8a] text-white text-xs font-bold py-1.5 rounded-lg mt-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    फील्ड जोडा
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
