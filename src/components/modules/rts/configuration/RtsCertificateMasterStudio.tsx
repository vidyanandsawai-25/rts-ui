"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Edit2,
  Eye,
  FileCheck2,
  Globe,
  GripVertical,
  Hand,
  ImageIcon,
  Italic,
  Layers,
  Layout,
  LayoutTemplate,
  MoveDown,
  MoveHorizontal,
  MoveUp,
  MoveVertical,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Redo2,
  Save,
  Settings2,
  Sliders,
  Sparkles,
  Strikethrough,
  Tag,
  Trash2,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Input,
  Modal,
  OfficialCertificateSheet,
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
import { useLocale, useTranslations } from "next-intl";

export type BandType =
  | "HEADER_LETTERHEAD"
  | "DISPATCH_DATE"
  | "RECIPIENT_BLOCK"
  | "SUBJECT_REFERENCE"
  | "SALUTATION"
  | "NARRATIVE_BODY"
  | "OFFICER_INPUTS_BLOCK"
  | "CONDITIONS_LIST"
  | "TIP_NOTE"
  | "SIGNATURE_SEAL"
  | "SECURITY_FOOTER";

export interface BandStyle {
  fontSize?: string;
  fontFamily?: string;
  lineHeight?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  textColor?: string;
  bgColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  // Crystal Reports Box Sizing & Dimension Controls (Interactive Mouse Drag)
  widthPercent?: number; // 30 to 100
  paddingY?: number; // 0 to 40 px
  paddingX?: number; // 0 to 40 px
  marginBottom?: number; // 0 to 40 px
  borderType?: "none" | "thin" | "solid" | "dashed" | "rounded-box";
  imageSize?: number; // 40 to 220 px (for Logo, Seal, QR)
}

export interface CertificateBand {
  id: string;
  type: BandType;
  title: string;
  titleLocal: string;
  enabled: boolean;
  data: Record<string, any>;
  style: BandStyle;
}

export type PageSize = "A4" | "Letter" | "Legal";
export type PageOrientation = "portrait" | "landscape";
export type MarginOption = "normal" | "narrow" | "wide";
export type BorderStyleOption = "double" | "solid" | "ornate" | "none";
export type CertificateLanguage = "mr" | "en" | "hi";

interface RtsCertificateMasterStudioProps {
  initialTemplates: RTSCertificateTemplate[];
  services: {
    id: string;
    name: string;
    nameLocal?: string;
    departmentId?: number;
    departmentName?: string;
    departmentNameLocal?: string;
  }[];
  ulbInfo?: CertificateUlbInfo;
  locale?: string;
}

// Generate Default Bands with Crystal Report Dimensions
function generateDefaultBands(
  lang: CertificateLanguage,
  serviceName: string,
  deptName: string
): CertificateBand[] {
  const isBirth = /जन्म|birth/i.test(serviceName);
  const isDeath = /मृत्यू|death/i.test(serviceName);
  const isMarriage = /विवाह|लग्न|marriage/i.test(serviceName);
  const isTrade = /व्यवसाय|परवाना|trade|license|shop|गुमास्ता/i.test(serviceName);
  const isWater = /पाणी|जल|water|tap/i.test(serviceName);
  const isTree = /वृक्ष|झाड|tree/i.test(serviceName);
  const isZone = /झोन|विभाग|zone/i.test(serviceName);
  const isProperty = /मालमत्ता|कर|property|tax|assessment/i.test(serviceName);
  const isFire = /अग्नि|fire/i.test(serviceName);
  const isBuilding = /इमारत|बांधकाम|building|construction/i.test(serviceName);

  if (lang === "en") {
    let p1 = "With reference to your application submitted under the Right to Public Services Act (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), verification of submitted documents and site scrutiny have been duly completed as per statutory municipal regulations.";
    let p2 = `Therefore, in accordance with applicable rules, this Official Certificate for ${serviceName} is hereby granted to {{ApplicantName}} (Residing at {{ApplicantAddress}}) on {{ApprovalDate}} subject to the conditions specified below.`;
    let conditions = [
      "This certificate is issued based on the verified documents and self-declaration submitted by the applicant.",
      "If any discrepancy or misrepresentation is discovered subsequently, this certificate shall stand revoked without prior notice.",
      "This certificate is valid strictly for the statutory official purpose for which it is granted.",
    ];

    if (isBirth) {
      p1 = "With reference to your application submitted under the Right to Public Services Act (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), birth registration records have been verified pursuant to Sections 12/17 of the Registration of Births and Deaths Act, 1969.";
      p2 = `It is hereby certified that according to the official municipal birth register, the birth details for the child of {{ApplicantName}} (Address: {{ApplicantAddress}}) have been officially recorded and this Birth Certificate is hereby granted on {{ApprovalDate}}.`;
      conditions = [
        "This Birth Certificate is an official statutory record under the Registration of Births and Deaths Act, 1969.",
        "Entries herein are authenticated strictly as per the original municipal birth register.",
      ];
    } else if (isDeath) {
      p1 = "With reference to your application submitted under the Right to Public Services Act (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), death records have been scrutinized pursuant to the Registration of Births and Deaths Act, 1969.";
      p2 = `It is hereby certified that according to the official municipal death register, the death entry has been officially registered and this Death Certificate is granted to {{ApplicantName}} on {{ApprovalDate}}.`;
    } else if (isMarriage) {
      p1 = "With reference to your application under the Maharashtra Regulation of Marriage Bureaus and Registration of Marriages Act, 1998 (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), solemnization proofs and statutory affidavits have been verified.";
      p2 = `It is hereby certified that the marriage of the concerned parties has been solemnized in accordance with applicable legal provisions and registered in the municipal marriage register on {{ApprovalDate}}.`;
    } else if (isTrade) {
      p1 = "With reference to your Trade License application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), site inspection and health hygiene scrutiny have been completed under Sections 376/386 of the Municipal Corporation Act.";
      p2 = `Subject to statutory compliance, official Trade License for '${serviceName}' is hereby granted to {{ApplicantName}} (Premises: {{ApplicantAddress}}) on {{ApprovalDate}} subject to the conditions below.`;
      conditions = [
        "The license holder must adhere strictly to fire safety and public health hygiene norms.",
        "Renewal of the trade license must be completed before expiry upon payment of prescribed municipal fees.",
        "No unauthorized or hazardous activity causing public nuisance shall be conducted on the premises.",
      ];
    } else if (isWater) {
      p1 = "With reference to your water supply application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), site plumbing feasibility and pipeline network verification have been completed by the Water Works Department.";
      p2 = `Official permission for water tap connection for ${serviceName} is hereby sanctioned to {{ApplicantName}} (Address: {{ApplicantAddress}}) on {{ApprovalDate}}.`;
    } else if (isTree) {
      p1 = "With reference to your Tree Trimming / Permission application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), field inspection has been conducted under the Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975.";
      p2 = `Based on the Tree Authority inspection report, official permission for ${serviceName} is hereby granted to {{ApplicantName}} on {{ApprovalDate}}.`;
    } else if (isZone) {
      p1 = "With reference to your Zone Certificate application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), Town Planning and Development Plan verification has been completed.";
      p2 = `Official Zone Information Certificate for the property (Plot/CTS No. under ${serviceName}) is hereby issued to {{ApplicantName}} (Address: {{ApplicantAddress}}) on {{ApprovalDate}}.`;
    } else if (isProperty) {
      p1 = "With reference to your Property Tax Assessment / NOC application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), tax records and ledger dues have been duly audited by the Property Tax Department.";
      p2 = `Official Assessment / No Dues Certificate for ${serviceName} is hereby issued to {{ApplicantName}} (Property: {{ApplicantAddress}}) on {{ApprovalDate}}.`;
    } else if (isFire) {
      p1 = "With reference to your Fire Safety NOC application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), fire prevention and life safety measures have been inspected under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006.";
      p2 = `Official Fire Safety NOC for ${serviceName} is hereby granted to {{ApplicantName}} (Premises: {{ApplicantAddress}}) on {{ApprovalDate}}.`;
    } else if (isBuilding) {
      p1 = "With reference to your Building Construction Permission / NOC application (Application No. {{ApplicationNo}} dated {{ApplicationDate}}), architectural scrutiny has been carried out under the Unified Development Control and Promotion Regulations (UDCPR).";
      p2 = `Official Permission / NOC for ${serviceName} is hereby sanctioned to {{ApplicantName}} on {{ApprovalDate}} subject to UDCPR norms.`;
    }

    return [
      {
        id: "b-header",
        type: "HEADER_LETTERHEAD",
        title: "Header Letterhead",
        titleLocal: "1. Municipal Letterhead",
        enabled: true,
        style: { fontSize: "14px", fontFamily: "sans", textAlign: "center", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none", imageSize: 75 },
        data: { showLogo: true, showAddress: true, showEmail: true, showDivider: true, topTrackingCode: "RTS/2026/DOC-VERIFIED", departmentSubtitle: deptName || "Right to Public Services Dept." },
      },
      {
        id: "b-dispatch",
        type: "DISPATCH_DATE",
        title: "Dispatch Outward & Date",
        titleLocal: "2. Outward No. & Date",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "sans", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 4, paddingX: 4, marginBottom: 8, borderType: "none" },
        data: { outwardPrefix: "Outward No. ", outwardTag: "MC/RTS/2026/{{ApplicationNo}}", datePrefix: "Date: ", dateTag: "{{ApprovalDate}}" },
      },
      {
        id: "b-recipient",
        type: "RECIPIENT_BLOCK",
        title: "Applicant Recipient",
        titleLocal: "3. Applicant Details",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "sans", textAlign: "left", isBold: false, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
        data: { toLabel: "To,", nameTag: "{{ApplicantName}}", addressTag: "{{ApplicantAddress}}", mobileTag: "{{ApplicantMobile}}" },
      },
      {
        id: "b-subject",
        type: "SUBJECT_REFERENCE",
        title: "Subject & Reference",
        titleLocal: "4. Subject & Reference",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "sans", textAlign: "left", isBold: true, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
        data: { subjectText: `Subject :- Issuance of Official Certificate for ${serviceName}.`, referenceText: "Reference :- Online RTS Application No. {{ApplicationNo}} dated {{ApplicationDate}}" },
      },
      {
        id: "b-salutation",
        type: "SALUTATION",
        title: "Salutation",
        titleLocal: "5. Salutation",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "sans", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 2, paddingX: 4, marginBottom: 6, borderType: "none" },
        data: { text: "Dear Sir / Madam," },
      },
      {
        id: "b-narrative",
        type: "NARRATIVE_BODY",
        title: "Narrative Body Paragraphs",
        titleLocal: "6. Main Narrative Content",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "sans", textAlign: "justify", lineHeight: "1.6", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 6, marginBottom: 12, borderType: "none" },
        data: { paragraph1: p1, paragraph2: p2 },
      },
      {
        id: "b-officer",
        type: "OFFICER_INPUTS_BLOCK",
        title: "Officer Decision Inputs Block",
        titleLocal: "7. Officer Input Fields Block",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "sans", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 10, borderType: "rounded-box", bgColor: "#fffbeb" },
        data: {
          officerFields: [
            { fieldKey: "InspectionRemark", fieldLabelMarathi: "स्थळ पाहणी व छाननी शेरा", fieldLabelEnglish: "Site Inspection & Verification Remark", fieldType: "textarea", isMandatory: false },
            { fieldKey: "SpecificValidityNote", fieldLabelMarathi: "विशेष वैधता नोंद", fieldLabelEnglish: "Special Validity Note", fieldType: "text", isMandatory: false },
          ],
        },
      },
      {
        id: "b-conditions",
        type: "CONDITIONS_LIST",
        title: "Terms & Conditions",
        titleLocal: "8. Terms & Conditions",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "sans", textAlign: "left", lineHeight: "1.5", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none" },
        data: { title: "Terms & Conditions:", conditions },
      },
      {
        id: "b-tip",
        type: "TIP_NOTE",
        title: "Validity Tip Note",
        titleLocal: "9. Validity Note",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "sans", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 12, borderType: "rounded-box", bgColor: "#f8fafc" },
        data: { validityDays: 90, customText: "Note :- The validity period of this certificate is 90 days from the date of issue." },
      },
      {
        id: "b-sign",
        type: "SIGNATURE_SEAL",
        title: "Signatures & Seal Stamp",
        titleLocal: "10. Signatures & Official Stamp",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "sans", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 10, paddingX: 6, marginBottom: 14, borderType: "none", imageSize: 105 },
        data: { showSeal: true, clerkTitle: "Clerk / Branch Head", officerTitle: "Assistant Commissioner / Authorizing Officer", officerName: "Authorized Officer" },
      },
      {
        id: "b-footer",
        type: "SECURITY_FOOTER",
        title: "Security QR & Barcode Footer",
        titleLocal: "11. Security QR & Footer",
        enabled: true,
        style: { fontSize: "10px", fontFamily: "sans", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 6, paddingX: 6, marginBottom: 8, borderType: "none", imageSize: 55 },
        data: { showQr: true, disclaimerText: "This is a computer-generated digitally signed certificate and does not require a physical signature." },
      },
    ];
  }

  if (lang === "hi") {
    let p1 = "उपरोक्त विषयांतर्गत आपको सूचित किया जाता है कि आपके द्वारा महाराष्ट्र लोक सेवा गारंटी अधिनियम के तहत प्रस्तुत आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) के आधार पर संबंधित दस्तावेजों की जांच एवं स्थल निरीक्षण विहित नियमानुसार पूर्ण कर लिया गया है।";
    let p2 = `अतः विहित नियमों के अधीन {{ApplicantName}} (निवासी {{ApplicantAddress}}) को ${serviceName} प्रमाण पत्र दिनांक {{ApprovalDate}} को अधोलिखित शर्तों के अधीन जारी किया जाता है।`;
    let conditions = [
      "यह प्रमाण पत्र आवेदक द्वारा प्रस्तुत स्व-प्रमाणित दस्तावेजों एवं विवरण के आधार पर जारी किया गया है।",
      "यदि भविष्य में कोई विसंगति या असत्य जानकारी पाई जाती है, तो यह प्रमाण पत्र बिना किसी पूर्व सूचना के निरस्त माना जाएगा।",
      "इस प्रमाण पत्र का उपयोग केवल उसी आधिकारिक उद्देश्य हेतु मान्य होगा जिसके लिए इसे जारी किया गया है।",
    ];

    if (isBirth) {
      p1 = "महाराष्ट्र लोक सेवा गारंटी अधिनियम के तहत प्रस्तुत आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) की जांच जन्म एवं मृत्यु पंजीकरण अधिनियम १९६९ की धारा १२/१७ अंतर्गत की गई।";
      p2 = `प्रमाणित किया जाता है कि मूल नगर निगम जन्म पंजी के अनुसार {{ApplicantName}} (निवासी {{ApplicantAddress}}) के बालक का जन्म अधिकृत रूप से पंजीकृत है तथा यह जन्म प्रमाण पत्र दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
      conditions = [
        "यह जन्म प्रमाण पत्र जन्म एवं मृत्यु पंजीकरण अधिनियम, १९६९ के तहत अधिकृत वैधानिक दस्तावेज है।",
        "इस प्रमाण पत्र में अंकित प्रविष्टियाँ मूल जन्म पंजी के आधार पर प्रमाणित हैं।",
      ];
    } else if (isDeath) {
      p1 = "महाराष्ट्र लोक सेवा गारंटी अधिनियम के तहत प्रस्तुत आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) की जांच मृत्यु पंजीकरण अधिनियम १९६९ अंतर्गत की गई।";
      p2 = `प्रमाणित किया जाता है कि नगर निगम मृत्यु पंजी के अनुसार मृत्यु का अधिकृत पंजीकरण हो चुका है तथा यह मृत्यु प्रमाण पत्र {{ApplicantName}} को दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
    } else if (isMarriage) {
      p1 = "महाराष्ट्र विवाह मंडल विनियमन एवं विवाह पंजीकरण अधिनियम १९९८ के तहत प्रस्तुत आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}} तथा विवाह साक्ष्यों का विधिवत सत्यापन किया गया।";
      p2 = `प्रमाणित किया जाता है कि वर एवं वधू का विवाह विहित विधि अनुसार संपन्न हुआ है और नगर निगम विवाह पंजी में विधिवत दर्ज किया गया है।`;
    } else if (isTrade) {
      p1 = "महाराष्ट्र नगर निगम अधिनियम की धारा ३७६/३८६ के तहत प्रस्तुत व्यवसाय लाइसेंस आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) की स्थल जांच एवं स्वास्थ्य सत्यापन पूर्ण कर लिया गया है।";
      p2 = `विहित नियमों के अधीन {{ApplicantName}} (पता: {{ApplicantAddress}}) को '${serviceName}' हेतु अधिकृत व्यवसाय लाइसेंस दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
      conditions = [
        "लाइसेंसधारक को अग्निशमन सुरक्षा एवं स्वच्छता मानकों का अनिवार्य रूप से पालन करना होगा।",
        "लाइसेंस की वैधता समाप्त होने से पूर्व निर्धारित शुल्क के साथ नवीनीकरण कराना अनिवार्य होगा।",
        "परिसर में किसी भी प्रकार की अवैध या असुविधाजनक गतिविधि संचालित नहीं की जाएगी।",
      ];
    } else if (isWater) {
      p1 = "महाराष्ट्र नगर निगम जल आपूर्ति उपनियमों के तहत प्रस्तुत नल संयोजन आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) का स्थल परीक्षण एवं तकनीकी जांच पूर्ण कर ली गई है।";
      p2 = `विहित शर्तों के अधीन {{ApplicantName}} (पता: {{ApplicantAddress}}) को '${serviceName}' दिनांक {{ApprovalDate}} को अधिकृत रूप से स्वीकृत किया जाता है।`;
    } else if (isTree) {
      p1 = "महाराष्ट्र (शहरी क्षेत्र) वृक्ष संरक्षण एवं संवर्धन अधिनियम १९७५ के तहत प्रस्तुत वृक्ष छंटाई / अनुमति आवेदन क्र. {{ApplicationNo}} का वृक्ष प्राधिकरण द्वारा निरीक्षण किया गया।";
      p2 = `निरीक्षण रिपोर्ट के आधार पर जनसुरक्षा एवं विहित नियमों के तहत {{ApplicantName}} को '${serviceName}' दिनांक {{ApprovalDate}} को प्रदान की जाती है।`;
    } else if (isZone) {
      p1 = "नगर रचना एवं विकास योजना के अनुसार आपके झोन प्रमाण पत्र आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) का सत्यापन पूर्ण कर लिया गया है।";
      p2 = `अधिकृत झोन प्रमाण पत्र {{ApplicantName}} (भूखंड: {{ApplicantAddress}}) को दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
    } else if (isProperty) {
      p1 = "संपत्ति कर विभाग द्वारा आपके कर निर्धारण / अनापत्ति प्रमाण पत्र आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) का ऑडिट पूर्ण कर लिया गया है।";
      p2 = `संपत्ति कर अनापत्ति / निर्धारण प्रमाण पत्र {{ApplicantName}} को दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
    } else if (isFire) {
      p1 = "महाराष्ट्र अग्नि निवारण एवं जीवन सुरक्षा उपाय अधिनियम २००६ के तहत आपके अग्नि सुरक्षा NOC आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) का निरीक्षण किया गया।";
      p2 = `अग्नि सुरक्षा अनापत्ति प्रमाण पत्र (NOC) {{ApplicantName}} को दिनांक {{ApprovalDate}} को जारी किया जाता है।`;
    } else if (isBuilding) {
      p1 = "एकीकृत विकास नियंत्रण एवं संवर्धन नियमावली (UDCPR) के तहत भवन निर्माण अनुमति आवेदन (आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}) की जांच की गई।";
      p2 = `विहित नियमों के अधीन निर्माण अनुमति / NOC {{ApplicantName}} को दिनांक {{ApprovalDate}} को प्रदान की जाती है।`;
    }

    return [
      {
        id: "b-header",
        type: "HEADER_LETTERHEAD",
        title: "Header Letterhead",
        titleLocal: "१. नगर निगम लेटरहेड बॉक्स",
        enabled: true,
        style: { fontSize: "14px", fontFamily: "devanagari", textAlign: "center", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none", imageSize: 75 },
        data: { showLogo: true, showAddress: true, showEmail: true, showDivider: true, topTrackingCode: "RTS/2026/DOC-VERIFIED", departmentSubtitle: deptName || "लोक सेवा गारंटी विभाग" },
      },
      {
        id: "b-dispatch",
        type: "DISPATCH_DATE",
        title: "Dispatch Outward & Date",
        titleLocal: "२. जावक क्र. व दिनांक बॉक्स",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 4, paddingX: 4, marginBottom: 8, borderType: "none" },
        data: { outwardPrefix: "जावक क्र. ", outwardTag: "मनपा/आर.टी.एस./२०२६/{{ApplicationNo}}", datePrefix: "दिनांक: ", dateTag: "{{ApprovalDate}}" },
      },
      {
        id: "b-recipient",
        type: "RECIPIENT_BLOCK",
        title: "Applicant Recipient",
        titleLocal: "३. आवेदक विवरण बॉक्स",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
        data: { toLabel: "सेवा में,", nameTag: "{{ApplicantName}}", addressTag: "{{ApplicantAddress}}", mobileTag: "{{ApplicantMobile}}" },
      },
      {
        id: "b-subject",
        type: "SUBJECT_REFERENCE",
        title: "Subject & Reference",
        titleLocal: "४. विषय व संदर्भ बॉक्स",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
        data: { subjectText: `विषय :- ${serviceName} हेतु प्राधिकृत प्रमाण पत्र जारी करने बाबत।`, referenceText: "संदर्भ :- आपका ऑनलाइन RTS आवेदन क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}" },
      },
      {
        id: "b-salutation",
        type: "SALUTATION",
        title: "Salutation",
        titleLocal: "५. संबोधन बॉक्स",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 2, paddingX: 4, marginBottom: 6, borderType: "none" },
        data: { text: "महोदय / महोदया," },
      },
      {
        id: "b-narrative",
        type: "NARRATIVE_BODY",
        title: "Narrative Body Paragraphs",
        titleLocal: "६. मुख्य सामग्री परिच्छेद बॉक्स",
        enabled: true,
        style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "justify", lineHeight: "1.6", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 6, marginBottom: 12, borderType: "none" },
        data: { paragraph1: p1, paragraph2: p2 },
      },
      {
        id: "b-officer",
        type: "OFFICER_INPUTS_BLOCK",
        title: "Officer Decision Inputs Block",
        titleLocal: "७. अधिकारी इनपुट बॉक्स",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 10, borderType: "rounded-box", bgColor: "#fffbeb" },
        data: {
          officerFields: [
            { fieldKey: "InspectionRemark", fieldLabelMarathi: "स्थळ पाहणी व छाननी शेरा", fieldLabelEnglish: "Site Inspection & Verification Remark", fieldType: "textarea", isMandatory: false },
            { fieldKey: "SpecificValidityNote", fieldLabelMarathi: "विशेष वैधता नोंद", fieldLabelEnglish: "Special Validity Note", fieldType: "text", isMandatory: false },
          ],
        },
      },
      {
        id: "b-conditions",
        type: "CONDITIONS_LIST",
        title: "Terms & Conditions",
        titleLocal: "८. नियम व शर्तें बॉक्स",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", lineHeight: "1.5", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none" },
        data: { title: "नियम व शर्तें:", conditions },
      },
      {
        id: "b-tip",
        type: "TIP_NOTE",
        title: "Validity Tip Note",
        titleLocal: "९. वैधता टिप्पणी बॉक्स",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 12, borderType: "rounded-box", bgColor: "#f8fafc" },
        data: { validityDays: 90, customText: "टिप्पणी :- इस प्रमाण पत्र की वैधता जारी होने की तिथि से ९० दिनों तक मान्य रहेगी।" },
      },
      {
        id: "b-sign",
        type: "SIGNATURE_SEAL",
        title: "Signatures & Seal Stamp",
        titleLocal: "१०. हस्ताक्षर व मुहर बॉक्स",
        enabled: true,
        style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 10, paddingX: 6, marginBottom: 14, borderType: "none", imageSize: 105 },
        data: { showSeal: true, clerkTitle: "लिपिक / शाखा प्रभारी", officerTitle: "सहायक आयुक्त / प्राधिकृत अधिकारी", officerName: "सक्षम प्राधिकारी" },
      },
      {
        id: "b-footer",
        type: "SECURITY_FOOTER",
        title: "Security QR & Barcode Footer",
        titleLocal: "११. सुरक्षा QR व फूटर",
        enabled: true,
        style: { fontSize: "10px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 6, paddingX: 6, marginBottom: 8, borderType: "none", imageSize: 55 },
        data: { showQr: true, disclaimerText: "यह प्रमाण पत्र कंप्यूटर द्वारा डिजिटल हस्ताक्षर से जारी किया गया है, अतः इस पर भौतिक हस्ताक्षर की आवश्यकता नहीं है।" },
      },
    ];
  }

  // Default: Marathi (mr)
  let p1 = "उपरोक्त विषयान्वये आपणास कळविण्यात येते की, आपण महाराष्ट्र लोकसेवा हक्क अधिनियमान्वये केलेल्या अर्जानुसार (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}), संबंधित कागदपत्रांची छाननी व स्थळ पाहणी नियमानुसार पूर्ण करण्यात आली आहे.";
  let p2 = `सबब, विहित नियमांच्या अधीन राहून {{ApplicantName}} (रा. {{ApplicantAddress}}) यांना ${serviceName} प्रमाणपत्र दिनांक {{ApprovalDate}} रोजी खालील अटी व शर्तींच्या अधीन राहून निर्गमित करण्यात येत आहे.`;
  let conditions = [
    "सदर प्रमाणपत्र केवळ अर्जदाराने सादर केलेल्या माहितीच्या आधारे देण्यात आले आहे.",
    "भविष्यात काही तफावत किंवा गैरप्रकार आढळल्यास हे प्रमाणपत्र पूर्वसूचना न देता रद्द करण्यात येईल.",
    "सदर प्रमाणपत्राचा वापर ज्या कारणासाठी मागितला आहे त्याच कारणासाठी वैध राहील.",
  ];

  if (isBirth) {
    p1 = "महाराष्ट्र लोकसेवा हक्क अधिनियमान्वये केलेल्या अर्जानुसार (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}), जन्म व मृत्यू नोंदणी अधिनियम १९६९ च्या कलम १२/१७ अन्वये नोंदवहीत तपासणी करण्यात आली.";
    p2 = `प्रमाणित करण्यात येते की, जन्म नोंदणी वहीतील मूळ नोंदीनुसार {{ApplicantName}} (रा. {{ApplicantAddress}}) यांच्या बालकाची जन्म नोंद अधिकृतरीत्या नोंदवली असून सदर जन्म प्रमाणपत्र दिनांक {{ApprovalDate}} रोजी जारी करण्यात येत आहे.`;
    conditions = [
      "सदर जन्म प्रमाणपत्र हे जन्म व मृत्यू नोंदणी अधिनियमान्वये अधिकृत शासकीय दस्तऐवज आहे.",
      "या प्रमाणपत्रातील नोंदी केवळ मूळ नोंदवहीतील उपलब्ध माहितीनुसार प्रमाणित करण्यात आलेल्या आहेत.",
    ];
  } else if (isDeath) {
    p1 = "महाराष्ट्र लोकसेवा हक्क अधिनियमान्वये केलेल्या अर्जानुसार (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}), मृत्यू नोंदणी अधिनियम १९६९ अन्वये नोंदवहीत पडताळणी करण्यात आली.";
    p2 = `प्रमाणित करण्यात येते की, महानगरपालिका मृत्यू नोंदणी वहीनुसार मयत व्यक्तीची नोंद अधिकृतरीत्या नोंदवण्यात आलेली असून सदर मृत्यू प्रमाणपत्र {{ApplicantName}} यांना दिनांक {{ApprovalDate}} रोजी जारी करण्यात येत आहे.`;
  } else if (isMarriage) {
    p1 = "महाराष्ट्र विवाह मंडळांचे विनियमन आणि विवाह नोंदणी अधिनियम १९९८ अन्वये सादर केलेला अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}} व विवाहाचे पुरावे तपासण्यात आले.";
    p2 = `प्रमाणित करण्यात येते की, वर व वधू यांचा विवाह विहित नियमानुसार संपन्न झालेला असून विवाह नोंदवहीत त्याची रीतसर नोंद करण्यात आली आहे.`;
  } else if (isTrade) {
    p1 = "महाराष्ट्र महानगरपालिका अधिनियम कलम ३७६/३८६ अन्वये सादर केलेल्या व्यवसाय परवाना अर्जाची (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) आरोग्य व परवाना विभागामार्फत छाननी व स्थळ पाहणी पूर्ण करण्यात आली आहे.";
    p2 = `विहित नियमांच्या अधीन राहून {{ApplicantName}} (रा. {{ApplicantAddress}}) यांना '${serviceName}' साठीचा अधिकृत व्यवसाय परवाना दिनांक {{ApprovalDate}} रोजी पुढील अटींवर मंजूर करण्यात येत आहे.`;
    conditions = [
      "परवानाधारक व्यक्तीने अग्निशामक सुरक्षा व स्वच्छता नियमांचे काटेकोर पालन करणे बंधनकारक राहील.",
      "परवाना मुदत संपण्यापूर्वी विहित शुल्कासह नूतनीकरण करून घेणे आवश्यक आहे.",
      "सार्वजनिक शांतता, वाहतूक किंवा पर्यावरणास बाधा पोहोचेल असा कोणताही अनधिकृत व्यवसाय करता येणार नाही.",
    ];
  } else if (isWater) {
    p1 = "महाराष्ट्र महानगरपालिका पाणीपुरवठा उपविधी अन्वये सादर केलेल्या नळ जोडणी अर्जाची (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) पाणीपुरवठा विभागामार्फत तांत्रिक तपासणी करण्यात आली आहे.";
    p2 = `विहित अटींवर {{ApplicantName}} (रा. {{ApplicantAddress}}) यांना ${serviceName} अधिकृतरीत्या दिनांक {{ApprovalDate}} रोजी मंजूर करण्यात येत आहे.`;
  } else if (isTree) {
    p1 = "महाराष्ट्र (नागरी क्षेत्र) झाडांचे जतन अधिनियम १९७५ अन्वये सादर केलेला वृक्ष छाटणी / परवानगी अर्ज क्र. {{ApplicationNo}} ची वृक्ष प्राधिकरणामार्फत स्थळ पाहणी करण्यात आली.";
    p2 = `सादर अहवालानुसार जनसुरक्षा व विहित नियमांच्या अधीन राहून {{ApplicantName}} यांना ${serviceName} बाबत दिनांक {{ApprovalDate}} रोजी अधिकृत परवानगी देण्यात येत आहे.`;
  } else if (isZone) {
    p1 = "नगररचना व विकास योजना नियमांनुसार सादर केलेल्या झोन दाखला अर्जाची (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) नगररचना विभागामार्फत पडताळणी करण्यात आली आहे.";
    p2 = `अधिकृत नगररचना अभिलेखानुसार सदर जागेचा झोन तपशील दाखला {{ApplicantName}} (जागा: {{ApplicantAddress}}) यांना दिनांक {{ApprovalDate}} रोजी निर्गमित करण्यात येत आहे.`;
  } else if (isProperty) {
    p1 = "मालमत्ता कर विभागाकडील कर निर्धारण व मागणी नोंदवहीनुसार (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) कर देयके व नोंदींची तपासणी करण्यात आली आहे.";
    p2 = `सदर मिळकतीबाबतचा अधिकृत कर निर्धारण / ना हरकत दाखला {{ApplicantName}} (मालमत्ता: {{ApplicantAddress}}) यांना दिनांक {{ApprovalDate}} रोजी जारी करण्यात येत आहे.`;
  } else if (isFire) {
    p1 = "महाराष्ट्र आग प्रतिबंधक व जीवसंरक्षक उपाययोजना अधिनियम २००६ अन्वये सादर केलेल्या ना हरकत अर्जाची (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) अग्निशामक विभागामार्फत तपासणी पूर्ण झाली आहे.";
    p2 = `विहित अग्निसुरक्षा मानकांचे पालन करण्याच्या अधीन राहून {{ApplicantName}} (जागा: {{ApplicantAddress}}) यांना ${serviceName} ना हरकत दाखला दिनांक {{ApprovalDate}} रोजी मंजूर करण्यात येत आहे.`;
  } else if (isBuilding) {
    p1 = "महाराष्ट्र सर्वसमावेशक विकास नियंत्रण व प्रोत्साहन नियमावली (UDCPR) अन्वये इमारत बांधकाम परवानगी अर्जाची (अर्ज क्र. {{ApplicationNo}} दि. {{ApplicationDate}}) छाननी करण्यात आली आहे.";
    p2 = `विहित अटी व शर्तींच्या अधीन राहून {{ApplicantName}} यांना ${serviceName} अधिकृतरीत्या दिनांक {{ApprovalDate}} रोजी मंजूर करण्यात येत आहे.`;
  }

  return [
    {
      id: "b-header",
      type: "HEADER_LETTERHEAD",
      title: "Header Letterhead",
      titleLocal: "१. मनपा लेटरहेड बॉक्स",
      enabled: true,
      style: { fontSize: "14px", fontFamily: "devanagari", textAlign: "center", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none", imageSize: 75 },
      data: { showLogo: true, showAddress: true, showEmail: true, showDivider: true, topTrackingCode: "RTS/2026/DOC-VERIFIED", departmentSubtitle: deptName || "लोकसेवा हक्क विभाग" },
    },
    {
      id: "b-dispatch",
      type: "DISPATCH_DATE",
      title: "Dispatch Outward & Date",
      titleLocal: "२. जावक क्र. व दिनांक बॉक्स",
      enabled: true,
      style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 4, paddingX: 4, marginBottom: 8, borderType: "none" },
      data: { outwardPrefix: "जा.क्र. ", outwardTag: "मनपा/आर.टी.एस./२०२६/{{ApplicationNo}}", datePrefix: "दिनांक: ", dateTag: "{{ApprovalDate}}" },
    },
    {
      id: "b-recipient",
      type: "RECIPIENT_BLOCK",
      title: "Applicant Recipient",
      titleLocal: "३. अर्जदार तपशील बॉक्स",
      enabled: true,
      style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
      data: { toLabel: "प्रति,", nameTag: "{{ApplicantName}}", addressTag: "{{ApplicantAddress}}", mobileTag: "{{ApplicantMobile}}" },
    },
    {
      id: "b-subject",
      type: "SUBJECT_REFERENCE",
      title: "Subject & Reference",
      titleLocal: "४. विषय व संदर्भ बॉक्स",
      enabled: true,
      style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.5", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 10, borderType: "none" },
      data: { subjectText: `विषय :- ${serviceName} बाबत अधिकृत प्रमाणपत्र पुरविणेबाबत.`, referenceText: "संदर्भ :- आपला ऑनलाईन RTS अर्ज क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}" },
    },
    {
      id: "b-salutation",
      type: "SALUTATION",
      title: "Salutation",
      titleLocal: "५. अभिवादन बॉक्स",
      enabled: true,
      style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 2, paddingX: 4, marginBottom: 6, borderType: "none" },
      data: { text: "महोदय / महोदया," },
    },
    {
      id: "b-narrative",
      type: "NARRATIVE_BODY",
      title: "Narrative Body Paragraphs",
      titleLocal: "६. मुख्य मजकूर परिच्छेद बॉक्स",
      enabled: true,
      style: { fontSize: "13px", fontFamily: "devanagari", textAlign: "justify", lineHeight: "1.6", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 6, marginBottom: 12, borderType: "none" },
      data: { paragraph1: p1, paragraph2: p2 },
    },
    {
      id: "b-officer",
      type: "OFFICER_INPUTS_BLOCK",
      title: "Officer Decision Inputs Block",
      titleLocal: "७. अधिकारी इनपुट बॉक्स",
      enabled: true,
      style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", isBold: false, lineHeight: "1.4", widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 10, borderType: "rounded-box", bgColor: "#fffbeb" },
      data: {
        officerFields: [
          { fieldKey: "InspectionRemark", fieldLabelMarathi: "स्थळ पाहणी व छाननी शेरा", fieldLabelEnglish: "Site Inspection & Verification Remark", fieldType: "textarea", isMandatory: false },
          { fieldKey: "SpecificValidityNote", fieldLabelMarathi: "विशेष वैधता नोंद", fieldLabelEnglish: "Special Validity Note", fieldType: "text", isMandatory: false },
        ],
      },
    },
    {
      id: "b-conditions",
      type: "CONDITIONS_LIST",
      title: "Terms & Conditions",
      titleLocal: "८. अटी व शर्ती बॉक्स",
      enabled: true,
      style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", lineHeight: "1.5", isBold: false, widthPercent: 100, paddingY: 8, paddingX: 8, marginBottom: 12, borderType: "none" },
      data: { title: "शर्ती व अटी:", conditions },
    },
    {
      id: "b-tip",
      type: "TIP_NOTE",
      title: "Validity Tip Note",
      titleLocal: "९. वैधता टिप बॉक्स",
      enabled: true,
      style: { fontSize: "12px", fontFamily: "devanagari", textAlign: "left", isBold: true, lineHeight: "1.4", widthPercent: 100, paddingY: 6, paddingX: 8, marginBottom: 12, borderType: "rounded-box", bgColor: "#f8fafc" },
      data: {
        validityDays: 90,
        customText: "टिप :- सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून ९० दिवसांपर्यंत ग्राह्य धरता येईल.",
      },
    },
    {
      id: "b-sign",
      type: "SIGNATURE_SEAL",
      title: "Signatures & Seal Stamp",
      titleLocal: "१०. स्वाक्षरी व मनपा शिक्का बॉक्स",
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "devanagari",
        textAlign: "left",
        isBold: false,
        lineHeight: "1.4",
        widthPercent: 100,
        paddingY: 10,
        paddingX: 6,
        marginBottom: 14,
        borderType: "none",
        imageSize: 105,
      },
      data: {
        showSeal: true,
        clerkTitle: "लिपिक / शाखा प्रमुख",
        officerTitle: "सहाय्यक आयुक्त / कर अधीक्षक",
        officerName: "सक्षम प्राधिकारी",
      },
    },
    {
      id: "b-footer",
      type: "SECURITY_FOOTER",
      title: "Security QR & Barcode Footer",
      titleLocal: "११. सुरक्षा QR व फूटर",
      enabled: true,
      style: {
        fontSize: "10px",
        fontFamily: "devanagari",
        textAlign: "left",
        isBold: false,
        lineHeight: "1.4",
        widthPercent: 100,
        paddingY: 6,
        paddingX: 6,
        marginBottom: 8,
        borderType: "none",
        imageSize: 55,
      },
      data: {
        showQr: true,
        disclaimerText: "हे प्रमाणपत्र संगणकीय प्रणालीद्वारे डिजिटल स्वाक्षरीने जारी केलेले असून यावर प्रत्यक्ष स्वाक्षरीची आवश्यकता नाही.",
      },
    },
  ];
}

export default function RtsCertificateMasterStudio({
  initialTemplates,
  services,
  ulbInfo,
  locale = "mr",
}: RtsCertificateMasterStudioProps) {
  const currentLocale = useLocale() || locale;
  const isPageMr = currentLocale === "mr";
  const t = useTranslations("rts.certificateMaster");

  // CERTIFICATE CONTENT LANGUAGE (Controls ONLY certificate body)
  const [certLang, setCertLang] = useState<CertificateLanguage>("mr");

  const [templates, setTemplates] = useState<RTSCertificateTemplate[]>(initialTemplates);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("ALL");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || "");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"bands" | "boxDimensions" | "pageSetup" | "tags" | "officerInputs">("bands");
  const [selectedBandId, setSelectedBandId] = useState<string | null>("ALL");
  const [applyToAllBands, setApplyToAllBands] = useState(true);

  const [isPending, startTransition] = useTransition();

  // Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [modalZoomLevel, setModalZoomLevel] = useState(100);

  // Ribbon Dropdown State
  const [openRibbonMenu, setOpenRibbonMenu] = useState<"insert" | "layout" | "lang" | "textColor" | "tags" | null>(null);

  // Page Setup State
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [margin, setMargin] = useState<MarginOption>("normal");
  const [borderStyle, setBorderStyle] = useState<BorderStyleOption>("double");
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(6);

  // New & Edit Officer Field State
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [fieldKeyInput, setFieldKeyInput] = useState("");
  const [fieldLabelMrInput, setFieldLabelMrInput] = useState("");
  const [fieldLabelEnInput, setFieldLabelEnInput] = useState("");
  const [fieldTypeInput, setFieldTypeInput] = useState<"text" | "textarea" | "date" | "number">("textarea");
  const [fieldMandatoryInput, setFieldMandatoryInput] = useState(false);

  // Condition State
  const [editingConditionIdx, setEditingConditionIdx] = useState<number | null>(null);
  const [conditionTextInput, setConditionTextInput] = useState("");

  // Tag Target Destination State (Where to insert dynamic tag)
  const [tagInsertDestination, setTagInsertDestination] = useState<
    "paragraph1" | "paragraph2" | "subject" | "reference" | "outward" | "recipient" | "conditions" | "tip"
  >("paragraph1");

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Interactive Mouse Drag / Resize State on Canvas
  const [resizingState, setResizingState] = useState<{
    bandId: string;
    type: "width" | "height" | "corner" | "move";
    startX: number;
    startY: number;
    initialWidthPercent: number;
    initialPaddingY: number;
    initialImageSize: number;
  } | null>(null);

  // Active ULB Info
  const activeUlb: CertificateUlbInfo = useMemo(
    () => ({
      ulbName: ulbInfo?.ulbName || "Municipal Corporation",
      ulbNameLocal: ulbInfo?.ulbNameLocal || "महानगरपालिका",
      ulbAddress: ulbInfo?.ulbAddress || "महानगरपालिका मुख्य कार्यालय",
      emailId: ulbInfo?.emailId || "support@ulb.gov.in",
      websiteUrl: ulbInfo?.websiteUrl || "https://ulb.gov.in",
      mobileNo: ulbInfo?.mobileNo || "0724-2434412",
      ulbLogo: ulbInfo?.ulbLogo || "/images/logo.png",
    }),
    [ulbInfo]
  );

  // Clean & Deduplicated Departments
  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of services) {
      if (s.departmentId !== undefined) {
        const dName = isPageMr ? s.departmentNameLocal || s.departmentName : s.departmentName;
        if (dName) map.set(String(s.departmentId), dName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [services, isPageMr]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    if (selectedDepartmentId === "ALL") return services;
    return services.filter((s) => String(s.departmentId) === selectedDepartmentId);
  }, [services, selectedDepartmentId]);

  // Active Selected Service
  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || filteredServices[0] || services[0];
  }, [services, selectedServiceId, filteredServices]);

  // Active Template
  const activeTemplate = useMemo(() => {
    return templates.find((t) => String(t.serviceId) === selectedServiceId);
  }, [templates, selectedServiceId]);

  // Template Metadata
  const [templateName, setTemplateName] = useState("");
  const [templateCode, setTemplateCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Dynamic Available Tags
  const [availableTags, setAvailableTags] = useState<CertificateAvailableTag[]>([]);

  // Canvas View Controls
  const [showSampleData, setShowSampleData] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Service Name & Dept Name for Certificate Content
  const currentServiceName = useMemo(() => {
    if (!activeService) return "सेवा";
    if (certLang === "en") return activeService.name;
    return activeService.nameLocal || activeService.name;
  }, [activeService, certLang]);

  const currentDeptName = useMemo(() => {
    if (!activeService) return "विभाग";
    if (certLang === "en") return activeService.departmentName || "Administration";
    return activeService.departmentNameLocal || activeService.departmentName || "प्रशासन";
  }, [activeService, certLang]);


  // Clean, Deduplicated Available Tags for Injection & Dropdown
  const allDisplayTags = useMemo(() => {
    const defaultList = [
      { key: "{{ApplicantName}}", desc: t("tag_ApplicantName") },
      { key: "{{ApplicationNo}}", desc: t("tag_ApplicationNo") },
      { key: "{{ApplicationDate}}", desc: t("tag_ApplicationDate") },
      { key: "{{ApprovalDate}}", desc: t("tag_ApprovalDate") },
      { key: "{{ApplicantAddress}}", desc: t("tag_ApplicantAddress") },
      { key: "{{ApplicantMobile}}", desc: t("tag_ApplicantMobile") },
      { key: "{{ServiceTitle}}", desc: t("tag_ServiceTitle") },
      { key: "{{DepartmentName}}", desc: t("tag_DepartmentName") },
      { key: "{{ULBName}}", desc: t("tag_ULBName") },
      { key: "{{OfficerName}}", desc: t("tag_OfficerName") },
      { key: "{{IssueDate}}", desc: t("tag_IssueDate") },
      { key: "{{CertificateNo}}", desc: t("tag_CertificateNo") },
    ];

    const seen = new Set(defaultList.map((d) => d.key.toLowerCase()));
    const list = [...defaultList];

    for (const tTag of availableTags) {
      const raw = tTag.tagKey.trim();
      const cleanKey =
        (raw.startsWith("{{") && raw.endsWith("}}")) || (raw.startsWith("[[") && raw.endsWith("]]"))
          ? raw
          : `{{${raw}}}`;

      if (!seen.has(cleanKey.toLowerCase())) {
        seen.add(cleanKey.toLowerCase());
        list.push({
          key: cleanKey,
          desc: isPageMr ? tTag.tagLabelMarathi || tTag.tagLabelEnglish || cleanKey : tTag.tagLabelEnglish || tTag.tagLabelMarathi || cleanKey,
        });
      }
    }

    return list;
  }, [availableTags, isPageMr, t]);

  // Master Bands Configuration State
  const [bands, setBands] = useState<CertificateBand[]>(() =>
    generateDefaultBands(
      "mr",
      services[0]?.nameLocal || services[0]?.name || "सेवा",
      services[0]?.departmentNameLocal || services[0]?.departmentName || "विभाग"
    )
  );

  // Undo / Redo History State (Max 50 steps)
  const historyRef = useRef<CertificateBand[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedoActionRef = useRef(false);

  // Helper to record history whenever bands change (unless from Undo/Redo itself)
  useEffect(() => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }
    if (!bands || bands.length === 0) return;

    const curHistory = historyRef.current;
    const curIndex = historyIndexRef.current;

    // Deep compare with current state to avoid duplicate history entries
    if (curIndex >= 0 && curHistory[curIndex] && JSON.stringify(curHistory[curIndex]) === JSON.stringify(bands)) {
      return;
    }

    const nextHistory = [...curHistory.slice(0, curIndex + 1), JSON.parse(JSON.stringify(bands))];
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [bands]);

  const handleUndo = useCallback(() => {
    const curIndex = historyIndexRef.current;
    if (curIndex > 0) {
      const targetIndex = curIndex - 1;
      const targetBands = JSON.parse(JSON.stringify(historyRef.current[targetIndex]));
      historyIndexRef.current = targetIndex;
      isUndoRedoActionRef.current = true;
      setBands(targetBands);
      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
      toast.success(isPageMr ? "बदल पूर्ववत केला (Undo)" : "Change undone");
    }
  }, [isPageMr]);

  const handleRedo = useCallback(() => {
    const curIndex = historyIndexRef.current;
    if (curIndex < historyRef.current.length - 1) {
      const targetIndex = curIndex + 1;
      const targetBands = JSON.parse(JSON.stringify(historyRef.current[targetIndex]));
      historyIndexRef.current = targetIndex;
      isUndoRedoActionRef.current = true;
      setBands(targetBands);
      setCanUndo(targetIndex > 0);
      setCanRedo(targetIndex < historyRef.current.length - 1);
      toast.success(isPageMr ? "बदल पुन्हा लागू केला (Redo)" : "Change redone");
    }
  }, [isPageMr]);

  // Keyboard Shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Selected Band
  const selectedBand = useMemo(() => {
    return bands.find((b) => b.id === selectedBandId) || bands[0];
  }, [bands, selectedBandId]);

  // Active style for the currently selected band
  const currentBandStyle: BandStyle = useMemo(() => {
    return (
      selectedBand?.style || {
        fontSize: "13px",
        fontFamily: "devanagari",
        lineHeight: "1.6",
        textAlign: "left",
        textColor: "#0f172a",
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        widthPercent: 100,
        paddingY: 6,
        paddingX: 6,
        marginBottom: 8,
        borderType: "none",
        imageSize: 80,
      }
    );
  }, [selectedBand]);

  // Direct Word-Style & Crystal-Report Sizing Modifier
  const updateSelectedBandStyle = useCallback(
    (updates: Partial<BandStyle>, forceApplyAll?: boolean) => {
      const isAll = forceApplyAll !== undefined ? forceApplyAll : (applyToAllBands || selectedBandId === "ALL");
      setBands((prev) => {
        const targetId = selectedBandId && selectedBandId !== "ALL" ? selectedBandId : prev[0]?.id;
        const nextBands = prev.map((b) => {
          if (isAll || b.id === targetId) {
            return {
              ...b,
              style: { ...b.style, ...updates },
            };
          }
          return b;
        });
        return nextBands;
      });
    },
    [selectedBandId, applyToAllBands]
  );



  // Font Size Increment / Decrement
  const changeFontSizeStep = (delta: number) => {
    const current = parseInt(currentBandStyle.fontSize || "13px", 10);
    const next = Math.max(9, Math.min(36, current + delta));
    updateSelectedBandStyle({ fontSize: `${next}px` });
  };

  // Box Vertical Padding (Y) Step Up / Down
  const changeBoxPaddingStep = (delta: number) => {
    const current = currentBandStyle.paddingY ?? 6;
    const next = Math.max(0, Math.min(40, current + delta));
    updateSelectedBandStyle({ paddingY: next });
    toast.success(`${t("paddingY")} ${next}px`);
  };

  // Box Horizontal Padding (X) Step Up / Down
  const changeBoxPaddingXStep = (delta: number) => {
    const current = currentBandStyle.paddingX ?? 6;
    const next = Math.max(0, Math.min(40, current + delta));
    updateSelectedBandStyle({ paddingX: next });
    toast.success(`${t("paddingX")} ${next}px`);
  };

  // Box Margin Bottom / Spacing Step Up / Down
  const changeBoxMarginStep = (delta: number) => {
    const current = currentBandStyle.marginBottom ?? 8;
    const next = Math.max(0, Math.min(50, current + delta));
    updateSelectedBandStyle({ marginBottom: next });
    toast.success(`${t("boxSpacing")} ${next}px`);
  };

  // Image / Seal Size Step Up / Down
  const changeBoxImageSizeStep = (delta: number) => {
    const current = currentBandStyle.imageSize ?? 80;
    const next = Math.max(40, Math.min(220, current + delta));
    updateSelectedBandStyle({ imageSize: next });
    toast.success(`प्रतिमा आकार: ${next}px`);
  };

  // Target Destination Labels
  const destinationLabels: Record<string, string> = {
    paragraph1: `${t("dest_paragraph1")} (${t("dest_paragraph1_desc")})`,
    paragraph2: `${t("dest_paragraph2")} (${t("dest_paragraph2_desc")})`,
    subject: `${t("dest_subject")} (${t("dest_subject_desc")})`,
    reference: `${t("dest_reference")} (${t("dest_reference_desc")})`,
    outward: `${t("dest_outward")} (${t("dest_outward_desc")})`,
    recipient: `${t("dest_recipient")} (${t("dest_recipient_desc")})`,
    conditions: `${t("dest_conditions")} (${t("dest_conditions_desc")})`,
    tip: `${t("dest_tip")} (${t("dest_tip_desc")})`,
  };

  // Helper to directly insert tag into active or selected target destination
  const handleInsertTagToTarget = (tagKey: string, dest = tagInsertDestination) => {
    let targetBandId = "";

    if (dest === "paragraph1") {
      const b = bands.find((x) => x.type === "NARRATIVE_BODY");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.paragraph1 || "";
        updateBandData(b.id, "paragraph1", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "paragraph2") {
      const b = bands.find((x) => x.type === "NARRATIVE_BODY");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.paragraph2 || "";
        updateBandData(b.id, "paragraph2", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "subject") {
      const b = bands.find((x) => x.type === "SUBJECT_REFERENCE");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.subjectText || "";
        updateBandData(b.id, "subjectText", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "reference") {
      const b = bands.find((x) => x.type === "SUBJECT_REFERENCE");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.referenceText || "";
        updateBandData(b.id, "referenceText", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "outward") {
      const b = bands.find((x) => x.type === "DISPATCH_DATE");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.outwardTag || "";
        updateBandData(b.id, "outwardTag", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "recipient") {
      const b = bands.find((x) => x.type === "RECIPIENT_BLOCK");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.nameTag || "";
        updateBandData(b.id, "nameTag", cur ? `${cur} ${tagKey}` : tagKey);
      }
    } else if (dest === "conditions") {
      const b = bands.find((x) => x.type === "CONDITIONS_LIST");
      if (b) {
        targetBandId = b.id;
        const conds: string[] = b.data.conditions || [];
        updateBandData(b.id, "conditions", [...conds, `सदर दाखला ${tagKey} च्या अधीन राहील.`]);
      }
    } else if (dest === "tip") {
      const b = bands.find((x) => x.type === "TIP_NOTE");
      if (b) {
        targetBandId = b.id;
        const cur = b.data.customText || "";
        updateBandData(b.id, "customText", cur ? `${cur} ${tagKey}` : tagKey);
      }
    }

    if (targetBandId) {
      setSelectedBandId(targetBandId);
    }
    setActiveSidebarTab("bands");
    toast.success(`✅ ${tagKey} हा टॅग '${destinationLabels[dest] || dest}' मध्ये जोडला गेला!`);
  };

  // Start Interactive Mouse Drag / Resize
  const startInteractiveResize = (
    bandId: string,
    type: "width" | "height" | "corner" | "move",
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBandId(bandId);

    const targetBand = bands.find((b) => b.id === bandId);
    if (!targetBand) return;

    setResizingState({
      bandId,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialWidthPercent: targetBand.style.widthPercent ?? 100,
      initialPaddingY: targetBand.style.paddingY ?? 6,
      initialImageSize: targetBand.style.imageSize ?? 80,
    });
  };

  // Global Mouse Move & Up Listeners for Direct Mouse Dragging
  useEffect(() => {
    if (!resizingState) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizingState.startX;
      const dy = e.clientY - resizingState.startY;

      if (resizingState.type === "width") {
        const deltaPercent = Math.round(dx / 4);
        const newWidth = Math.max(30, Math.min(100, resizingState.initialWidthPercent + deltaPercent));
        setBands((prev) =>
          prev.map((b) => (b.id === resizingState.bandId ? { ...b, style: { ...b.style, widthPercent: newWidth } } : b))
        );
      } else if (resizingState.type === "height") {
        const deltaPad = Math.round(dy / 3);
        const newPad = Math.max(0, Math.min(40, resizingState.initialPaddingY + deltaPad));
        setBands((prev) =>
          prev.map((b) => (b.id === resizingState.bandId ? { ...b, style: { ...b.style, paddingY: newPad } } : b))
        );
      } else if (resizingState.type === "corner") {
        const deltaPercent = Math.round(dx / 4);
        const deltaImg = Math.round((dx + dy) / 3);
        const newWidth = Math.max(30, Math.min(100, resizingState.initialWidthPercent + deltaPercent));
        const newImg = Math.max(40, Math.min(220, resizingState.initialImageSize + deltaImg));
        setBands((prev) =>
          prev.map((b) =>
            b.id === resizingState.bandId
              ? { ...b, style: { ...b.style, widthPercent: newWidth, imageSize: newImg } }
              : b
          )
        );
      } else if (resizingState.type === "move") {
        const deltaPad = Math.round(dy / 4);
        const newPad = Math.max(0, Math.min(40, resizingState.initialPaddingY + deltaPad));
        setBands((prev) =>
          prev.map((b) => (b.id === resizingState.bandId ? { ...b, style: { ...b.style, paddingY: newPad } } : b))
        );
      }
    };

    const onMouseUp = () => {
      setResizingState(null);
      toast.success("हाताने आकार व जागा यशस्वीरित्या बदलली!");
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizingState]);

  // Update Band Data Helper
  const updateBandData = (bandId: string, key: string, val: any) => {
    setBands((prev) =>
      prev.map((b) => (b.id === bandId ? { ...b, data: { ...b.data, [key]: val } } : b))
    );
  };

  // Add New Band
  const handleAddBand = (type: BandType, title: string, titleLocal: string) => {
    const newId = `b-${Date.now()}`;
    const newBand: CertificateBand = {
      id: newId,
      type,
      title,
      titleLocal,
      enabled: true,
      style: {
        fontSize: "13px",
        fontFamily: "devanagari",
        textAlign: "left",
        isBold: false,
        lineHeight: "1.5",
        widthPercent: 100,
        paddingY: 6,
        paddingX: 6,
        marginBottom: 8,
        borderType: "none",
        imageSize: 80,
      },
      data: {},
    };
    setBands((prev) => [...prev, newBand]);
    setSelectedBandId(newId);
    setOpenRibbonMenu(null);
    toast.success(`${titleLocal} जोडला!`);
  };

  // Remove Band
  const handleRemoveBand = (bandId: string) => {
    setBands((prev) => prev.filter((b) => b.id !== bandId));
    toast.success("विभाग काढला!");
  };

  // Move Band Up / Down
  const moveBand = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= bands.length) return;
    setBands((prev) => {
      const clone = [...prev];
      const temp = clone[index];
      clone[index] = clone[targetIdx];
      clone[targetIdx] = temp;
      return clone;
    });
    toast.success("विभाग हलवला!");
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setBands((prev) => {
      const clone = [...prev];
      const [draggedItem] = clone.splice(draggedIndex, 1);
      clone.splice(dropIndex, 0, draggedItem);
      return clone;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success("विभाग री-ऑर्डर झाला!");
  };

  // Add or Update Condition
  const handleSaveCondition = () => {
    if (!conditionTextInput.trim()) return;
    const condBand = bands.find((b) => b.type === "CONDITIONS_LIST");
    if (!condBand) return;

    const current: string[] = condBand.data.conditions || [];
    if (editingConditionIdx !== null) {
      const clone = [...current];
      clone[editingConditionIdx] = conditionTextInput.trim();
      updateBandData(condBand.id, "conditions", clone);
      setEditingConditionIdx(null);
      toast.success("अट अद्यतनित केली!");
    } else {
      updateBandData(condBand.id, "conditions", [...current, conditionTextInput.trim()]);
      toast.success("नवीन अट जोडली!");
    }
    setConditionTextInput("");
  };

  // Add or Update Officer Field
  const handleSaveOfficerField = () => {
    if (!fieldKeyInput.trim() || !fieldLabelMrInput.trim()) {
      toast.error("कृपया फील्ड की आणि लेबल प्रविष्ट करा.");
      return;
    }
    const offBand = bands.find((b) => b.type === "OFFICER_INPUTS_BLOCK");
    if (!offBand) return;

    const current: OfficerFieldConfig[] = offBand.data.officerFields || [];
    const newField: OfficerFieldConfig = {
      fieldKey: fieldKeyInput.trim(),
      fieldLabelMarathi: fieldLabelMrInput.trim(),
      fieldLabelEnglish: fieldLabelEnInput.trim() || fieldLabelMrInput.trim(),
      fieldType: fieldTypeInput,
      isMandatory: fieldMandatoryInput,
    };
    if (editingFieldKey) {
      const updated = current.map((f) => (f.fieldKey === editingFieldKey ? newField : f));
      updateBandData(offBand.id, "officerFields", updated);
      setEditingFieldKey(null);
      toast.success("अधिकारी फील्ड अद्यतनित केले!");
    } else {
      updateBandData(offBand.id, "officerFields", [...current, newField]);
      toast.success("नवीन अधिकारी इनपुट फील्ड जोडले!");
    }

    setFieldKeyInput("");
    setFieldLabelMrInput("");
    setFieldLabelEnInput("");
    setFieldMandatoryInput(false);
  };

  // Switch Certificate Content Language Only
  const handleSelectCertificateLanguage = useCallback((lang: CertificateLanguage) => {
    setCertLang(lang);
    setOpenRibbonMenu(null);

    const srvName = lang === "en" ? activeService?.name || "Service" : activeService?.nameLocal || activeService?.name || "सेवा";
    const deptName = lang === "en" ? activeService?.departmentName || "Department" : activeService?.departmentNameLocal || activeService?.departmentName || "विभाग";

    const freshBands = generateDefaultBands(lang, srvName, deptName);
    setBands(freshBands);
    toast.success(`दाखल्याचा मजकूर ${lang === "mr" ? "मराठी" : lang === "en" ? "English" : "हिंदी"} भाषेमध्ये बदलला!`);
  }, [activeService]);

  // Dynamic Service / Department Switch Handler
  const lastLoadedServiceIdRef = useRef<string>("");
  const lastLoadedLangRef = useRef<string>("");

  useEffect(() => {
    if (!activeService) return;

    const isServiceChanged = lastLoadedServiceIdRef.current !== activeService.id;
    const isLangChanged = lastLoadedLangRef.current !== certLang;

    // Only regenerate default bands when service or language actually changes
    if (!isServiceChanged && !isLangChanged) {
      return;
    }

    lastLoadedServiceIdRef.current = activeService.id;
    lastLoadedLangRef.current = certLang;

    const srvName = certLang === "en" ? activeService.name : activeService.nameLocal || activeService.name;
    const deptName = certLang === "en" ? activeService.departmentName || "Administration" : activeService.departmentNameLocal || activeService.departmentName || "प्रशासन";

    setTemplateName(`${activeService.nameLocal || activeService.name} अधिकृत प्रमाणपत्र दाखला`);
    setTemplateCode(`CERT_${activeService.id}`);
    setIsActive(activeTemplate ? activeTemplate.isActive : true);

    const freshBands = generateDefaultBands(certLang, srvName, deptName);

    if (activeTemplate?.defaultConditions && activeTemplate.defaultConditions.length > 0) {
      const condIdx = freshBands.findIndex((b) => b.type === "CONDITIONS_LIST");
      if (condIdx >= 0) freshBands[condIdx].data.conditions = activeTemplate.defaultConditions;
    }

    if (activeTemplate?.officerFields && activeTemplate.officerFields.length > 0) {
      const offIdx = freshBands.findIndex((b) => b.type === "OFFICER_INPUTS_BLOCK");
      if (offIdx >= 0) freshBands[offIdx].data.officerFields = activeTemplate.officerFields;
    }

    setBands(freshBands);

    // Load dynamic tags for service
    const loadTags = async () => {
      try {
        const tags = await fetchAvailableTagsAction(Number(activeService.id));
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to load service tags:", err);
      }
    };
    loadTags();
  }, [activeService?.id, certLang, activeTemplate]);

  // Direct Inline Style Helpers for Crystal Report Box & Typography
  const getBandBoxStyle = (b: CertificateBand) => {
    const s = b.style || {};
    const widthStyle = s.widthPercent ? `width: ${s.widthPercent}%;` : "width: 100%;";
    const paddingStyle = `padding-top: ${s.paddingY ?? 6}px !important; padding-bottom: ${s.paddingY ?? 6}px !important; padding-left: ${s.paddingX ?? 6}px !important; padding-right: ${s.paddingX ?? 6}px !important;`;
    const marginStyle = `margin-bottom: ${s.marginBottom ?? 8}px !important;`;
    const bgColor = s.bgColor && s.bgColor !== "transparent" ? `background-color: ${s.bgColor} !important;` : "";

    let borderCss = "";
    if (s.borderType === "thin") borderCss = "border: 1px solid #cbd5e1; border-radius: 4px;";
    else if (s.borderType === "solid") borderCss = "border: 2px solid #0f172a; border-radius: 6px;";
    else if (s.borderType === "dashed") borderCss = "border: 2px dashed #64748b; border-radius: 6px;";
    else if (s.borderType === "rounded-box") borderCss = "border: 1px solid #94a3b8; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);";

    return `${widthStyle} ${paddingStyle} ${marginStyle} ${bgColor} ${borderCss}`;
  };

  const getBandTextStyle = (b: CertificateBand) => {
    const s = b.style || {};
    const font =
      s.fontFamily === "devanagari"
        ? "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif"
        : s.fontFamily === "serif"
          ? "Georgia, 'Times New Roman', serif"
          : s.fontFamily === "mono"
            ? "Courier New, monospace"
            : "'Segoe UI', Arial, sans-serif";
    const textDeco = [s.isUnderline ? "underline" : "", s.isStrikethrough ? "line-through" : ""].filter(Boolean).join(" ") || "none";
    const textColor = s.textColor || "#0f172a";
    const fontSize = s.fontSize || "13px";
    const lineHeight = s.lineHeight || "1.6";
    const textAlign = s.textAlign || "left";
    const fontWeight = s.isBold ? "bold" : "normal";
    const fontStyle = s.isItalic ? "italic" : "normal";

    return `color: ${textColor} !important; font-size: ${fontSize} !important; font-family: ${font} !important; line-height: ${lineHeight} !important; text-align: ${textAlign} !important; font-weight: ${fontWeight} !important; font-style: ${fontStyle} !important; text-decoration: ${textDeco} !important;`;
  };

  const getBandDirectInlineStyle = (b: CertificateBand) => {
    return `${getBandTextStyle(b)} ${getBandBoxStyle(b)}`;
  };





  // Generate Certificate HTML - clean for saving to DB, or with edit outlines for studio canvas
  const generateCertificateHtml = useCallback((forCanvas: boolean) => {
    const ulbTitle = activeUlb.ulbNameLocal || activeUlb.ulbName;

    const marginClasses =
      margin === "narrow" ? "p-4 md:p-6" : margin === "wide" ? "p-8 md:p-12" : "p-6 md:p-8";

    const borderStyleClass =
      borderStyle === "double"
        ? "border-[5px] border-double border-slate-900"
        : borderStyle === "solid"
          ? "border-2 border-slate-900"
          : borderStyle === "ornate"
            ? "border-4 border-dashed border-slate-900 shadow-md"
            : "border-0";

    let html = `
      <div class='official-certificate-sheet ${marginClasses} bg-white ${borderStyleClass} relative shadow-sm transition-all' style='min-height: 297mm;'>
        <!-- Dynamic ULB Logo Background Watermark -->
        ${showWatermark && activeUlb.ulbLogo
        ? `<div class='absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden'>
                 <img src='${activeUlb.ulbLogo}' alt='ULB Watermark' style='opacity: ${(watermarkOpacity ?? 6) / 100};' class='w-72 h-72 object-contain filter grayscale' onerror="this.style.display='none'"/>
               </div>`
        : ""
      }
    `;

    for (const b of bands) {
      if (!b.enabled) continue;

      const isBandSelected = forCanvas && b.id === selectedBandId;
      const selectOutline = forCanvas
        ? isBandSelected
          ? "border-2 border-[#4b70a6] ring-2 ring-[#4b70a6]/30 rounded-lg bg-blue-50/20 relative"
          : "border border-transparent hover:border-dashed hover:border-blue-400 hover:bg-blue-50/10 rounded-lg transition-all relative"
        : "relative";

      const bandBadge = forCanvas && isBandSelected
        ? `<div class='absolute -top-3 right-2 bg-[#4b70a6] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs pointer-events-none z-30'>✏️ ${isPageMr ? b.titleLocal : b.title}</div>`
        : "";

      const bInlineStyle = getBandDirectInlineStyle(b);
      const bTextStyle = getBandTextStyle(b);
      const logoH = b.style.imageSize ?? 75;
      const sealH = b.style.imageSize ?? 105;
      const qrH = b.style.imageSize ?? 55;

      switch (b.type) {
        case "HEADER_LETTERHEAD":
          html += `
            <div class='header-letterhead relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              ${b.data.topTrackingCode
              ? `<div class='flex justify-between items-center font-mono mb-1 opacity-80' style='font-size: 0.75em;'><div>${b.data.topTrackingCode}</div><div>{{ApplicationNo}}</div></div>`
              : ""
            }
              <div class='flex items-center justify-between gap-4'>
                ${b.data.showLogo
              ? `<div class='shrink-0 text-left' style='width: ${logoH + 10}px;'><img src='${activeUlb.ulbLogo}' alt='ULB Logo' style='max-height: ${logoH}px; max-width: ${logoH}px;' class='object-contain' onerror="this.style.display='none'"/><div style='font-size: 0.72em; font-weight: bold; margin-top: 2px; text-align: left; ${bTextStyle}'>${ulbTitle}</div></div>`
              : `<div class='shrink-0' style='width: ${logoH + 10}px;'></div>`
            }
                <div class='flex-1 text-center' style='text-align: center !important;'>
                  <div style='font-size: 1.45em; font-weight: bold; font-family: inherit; text-align: center !important; ${bTextStyle}'>${ulbTitle}</div>
                  ${b.data.departmentSubtitle || currentDeptName
              ? `<div style='font-size: 1.05em; font-weight: bold; margin-top: 2px; text-align: center !important; ${bTextStyle}'>${b.data.departmentSubtitle || currentDeptName}</div>`
              : ""
            }
                  ${b.data.showAddress ? `<div style='font-size: 0.85em; margin-top: 2px; opacity: 0.9; text-align: center !important; ${bTextStyle}'>${activeUlb.ulbAddress}</div>` : ""}
                  ${b.data.showEmail ? `<div style='font-size: 0.8em; margin-top: 2px; opacity: 0.9; text-align: center !important; ${bTextStyle}'>${certLang === "en" ? "Email" : "ई-मेल"} - ${activeUlb.emailId}</div>` : ""}
                </div>
                <div class='shrink-0' style='width: ${logoH + 10}px;'></div>
              </div>
              ${b.data.showDivider ? `<div class='w-full border-b-2 border-current mt-2 mb-2'></div>` : ""}
            </div>
          `;
          break;

        case "DISPATCH_DATE":
          html += `
            <div class='dispatch-bar flex justify-between items-center relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div style='${bTextStyle}'>${b.data.outwardPrefix || (certLang === "en" ? "Outward No. " : "जा.क्र. ")}${b.data.outwardTag || "मनपा/आर.टी.एस./२०२६/{{ApplicationNo}}"}</div>
              <div style='${bTextStyle}'>${b.data.datePrefix || (certLang === "en" ? "Date: " : "दिनांक: ")}${b.data.dateTag || "{{ApprovalDate}}"}</div>
            </div>
          `;
          break;

        case "RECIPIENT_BLOCK":
          html += `
            <div class='recipient-block relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div style='${bTextStyle}'>${b.data.toLabel || (certLang === "en" ? "To," : certLang === "hi" ? "सेवा में," : "प्रति,")}</div>
              <div style='padding-left: 1.5rem; ${bTextStyle}'>${b.data.nameTag || "{{ApplicantName}}"}</div>
              <div style='padding-left: 1.5rem; ${bTextStyle}'>${b.data.addressTag || (certLang === "en" ? "Address: {{ApplicantAddress}}" : certLang === "hi" ? "पता: {{ApplicantAddress}}" : "पत्ता: {{ApplicantAddress}}")}</div>
              <div style='padding-left: 1.5rem; font-family: monospace; ${bTextStyle}'>${b.data.mobileTag || (certLang === "en" ? "Mob: {{ApplicantMobile}}" : "मो.: {{ApplicantMobile}}")}</div>
            </div>
          `;
          break;

        case "SUBJECT_REFERENCE":
          html += `
            <div class='subject-ref-block relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='padding-left: 1.5rem; ${bInlineStyle}'>
              ${bandBadge}
              <div style='margin-bottom: 0.25rem; ${bTextStyle}'>${b.data.subjectText || `विषय :- ${currentServiceName} बाबत अधिकृत प्रमाणपत्र पुरविणेबाबत.`}</div>
              <div style='opacity: 0.95; ${bTextStyle}'>${b.data.referenceText || "संदर्भ :- आपला ऑनलाईन RTS अर्ज क्र. {{ApplicationNo}} दिनांक {{ApplicationDate}}"}</div>
            </div>
          `;
          break;

        case "SALUTATION":
          html += `
            <div class='salutation-block relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div style='${bTextStyle}'>${b.data.text || (certLang === "en" ? "Dear Sir / Madam," : "महोदय / महोदया,")}</div>
            </div>
          `;
          break;

        case "NARRATIVE_BODY":
          html += `
            <div class='narrative-body relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <p style='text-indent: 2rem; margin-bottom: 0.5em; ${bTextStyle}'>${b.data.paragraph1 || ""}</p>
              <p style='text-indent: 2rem; ${bTextStyle}'>${b.data.paragraph2 || ""}</p>
            </div>
          `;
          break;

        case "OFFICER_INPUTS_BLOCK":
          html += `
            {{OfficerFieldsBlock}}
          `;
          break;

        case "CONDITIONS_LIST":
          const condList: string[] = b.data.conditions || [];
          if (condList.length > 0) {
            html += `
              <div class='conditions-block relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
                ${bandBadge}
                <div style='margin-bottom: 0.5rem; ${bTextStyle}'>${b.data.title || (certLang === "en" ? "Terms & Conditions:" : certLang === "hi" ? "नियम व शर्तें:" : "शर्ती व अटी:")}</div>
                <ol style='list-style-type: decimal; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; ${bTextStyle}'>
                  ${condList.map((c) => `<li style='${bTextStyle}'>${c}</li>`).join("")}
                  {{CustomConditionsList}}
                </ol>
              </div>
            `;
          }
          break;

        case "TIP_NOTE":
          const tipText =
            b.data.customText ||
            (certLang === "en"
              ? `Note :- The validity period of this certificate is ${b.data.validityDays || 90} days from the date of issue.`
              : certLang === "hi"
                ? `टिप्पणी :- इस प्रमाण पत्र की वैधता जारी होने की तिथि से ${b.data.validityDays || 90} दिनों तक मान्य रहेगी।`
                : `टिप :- सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून ${b.data.validityDays || 90} दिवसांपर्यंत ग्राह्य धरता येईल.`);
          html += `
            <div class='custom-text-block relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div style='${bTextStyle}'>${tipText}</div>
            </div>
          `;
          break;

        case "SIGNATURE_SEAL":
          html += `
            <div class='signature-stamp-block flex justify-between items-end gap-4 relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div class='left-sign text-center' style='font-size: 0.9em; ${bTextStyle}'>
                <div class='h-12 flex items-center justify-center italic border-b border-slate-400 pb-1' style='font-family: Georgia, serif; font-size: 1.1em;'>
                  {{ApprovalDate}}
                </div>
                <div style='margin-top: 0.25rem; font-size: 0.9em; ${bTextStyle}'>${b.data.clerkTitle || (certLang === "en" ? "Clerk / Branch Head" : "लिपिक / शाखा प्रमुख")}</div>
              </div>

              <div class='center-seal text-center'>
                ${b.data.showSeal
              ? `<div class='official-seal-stamp inline-block text-center'><img src='/images/ulb-seal.png' alt='Official Seal' style='width: ${sealH}px; height: ${sealH}px;' class='object-contain transform -rotate-6 filter drop-shadow-xs inline-block' onerror="this.style.display='none'"/></div>`
              : ""
            }
              </div>

              <div class='right-digital-sign text-right'>
                <div class='digital-signature-card bg-emerald-50/95 border-2 border-emerald-600 p-2.5 rounded-lg text-left inline-block shadow-xs min-w-[220px]' style='font-size: 0.85em; line-height: 1.4;'>
                  <div class='flex items-center gap-1.5 text-emerald-900 font-bold pb-1 border-b border-emerald-300 mb-1' style='font-size: 0.9em;'>
                    <span class='text-emerald-700 font-bold'>✔</span>
                    <span>Digitally Signed (DSC Verified)</span>
                  </div>
                  <div class='font-bold text-slate-950'>{{OfficerName}}</div>
                  <div class='text-slate-800' style='font-size: 0.9em;'>${b.data.officerTitle || (certLang === "en" ? "Authorizing Officer" : "सहाय्यक आयुक्त / कर अधीक्षक")}</div>
                  <div class='text-slate-600 font-mono mt-0.5' style='font-size: 0.85em;'>Date: {{ApprovalDate}} IST</div>
                  <div class='text-emerald-800 font-bold mt-1 flex items-center gap-1' style='font-size: 0.85em;'>
                    <span>🔒</span> <span>e-Sign Verified & Authentic</span>
                  </div>
                </div>
                <div style='margin-top: 0.25rem; font-size: 0.95em; ${bTextStyle}'>${b.data.officerTitle || "सक्षम प्राधिकारी"}</div>
                <div style='font-size: 0.85em; opacity: 0.9; ${bTextStyle}'>${ulbTitle}</div>
              </div>
            </div>
          `;
          break;

        case "SECURITY_FOOTER":
          html += `
            <div class='security-footer-block border-t border-slate-400 flex justify-between items-center relative z-10 transition-all ${forCanvas ? "cursor-pointer" : ""} ${selectOutline}' ${forCanvas ? `data-band-id='${b.id}'` : ""} style='${bInlineStyle}'>
              ${bandBadge}
              <div class='flex items-center gap-2'>
                <div class='inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center' style='width: ${qrH + 15}px;'>
                  <div style='width: ${qrH}px; height: ${qrH}px;' class='flex items-center justify-center bg-white'>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(b.data.qrCodePayload || 'https://akolacity.gov.in/verify-certificate?appNo={{ApplicationNo}}')}" alt="QR Verification" class="w-full h-full object-contain" />
                  </div>
                  <span class='text-slate-600 mt-0.5 font-bold' style='font-size: 8px;'>${b.data.qrNote || "Scan to Verify"}</span>
                </div>
                <div class='font-mono tracking-widest font-bold' style='font-size: 9px;'>${b.data.barcodePattern || "||||||||||||||||||||||"}</div>
              </div>
              <div class='text-center max-w-md opacity-90' style='font-size: 9px; ${bTextStyle}'>${b.data.disclaimerText || (certLang === "en" ? "This is a computer-generated digitally signed certificate and does not require a physical signature." : "हे प्रमाणपत्र संगणकीय प्रणालीद्वारे डिजिटल स्वाक्षरीने जारी केलेले असून यावर प्रत्यक्ष स्वाक्षरीची आवश्यकता नाही.")}</div>
            </div>

            <div class='footer-file-path-block mt-4 pt-1 border-t-2 border-current font-mono font-bold' style='font-size: 0.8em; ${bTextStyle}'>
              ${b.data.footerPath || `D:\\${ulbTitle}\\${currentDeptName}\\Certificate`}
            </div>
          `;
          break;
      }
    }

    html += `</div>`;
    return html;
  }, [
    bands,
    activeUlb,
    certLang,
    margin,
    borderStyle,
    showWatermark,
    watermarkOpacity,
    selectedBandId,
    currentServiceName,
    currentDeptName,
    isPageMr,
  ]);

  // Compiled HTML for interactive Canvas
  const compiledHtml = useMemo(() => generateCertificateHtml(true), [generateCertificateHtml]);

  // Live Sample Merged Preview Output for Canvas
  const livePreviewMergedHtml = useMemo(() => {
    if (!showSampleData) return compiledHtml;

    const sampleDate = new Date().toLocaleDateString("en-GB");
    const ulbTitle = activeUlb.ulbNameLocal || activeUlb.ulbName;

    let res = compiledHtml;
    res = res.replace(/{{ApplicationNo}}/g, "RTS00023191");
    res = res.replace(/{{ApplicationDate}}/g, "24/08/2026");
    res = res.replace(/{{ApprovalDate}}/g, sampleDate);
    res = res.replace(/{{AppliedDate}}/g, "24/08/2026");
    res = res.replace(/{{IssueDate}}/g, sampleDate);
    res = res.replace(/{{CertificateNo}}/g, "MC/RTS/2026/00482");
    res = res.replace(/{{ApplicantName}}/g, certLang === "en" ? "Aditya Sambhaji Phatke" : "आदित्य संभाजी फाटके");
    res = res.replace(/{{ApplicantAddress}}/g, certLang === "en" ? "Plot No. 24, Ram Nagar, Akola" : "प्लॉट क्र. २४, राम नगर, अकोला");
    res = res.replace(/{{ApplicantMobile}}/g, "९८७६५४३२१०");
    res = res.replace(/{{ServiceTitle}}/g, currentServiceName);
    res = res.replace(/{{ServiceName}}/g, currentServiceName);
    res = res.replace(/{{ServiceNameMarathi}}/g, activeService?.nameLocal || currentServiceName);
    res = res.replace(/{{DepartmentName}}/g, currentDeptName);
    res = res.replace(/{{ULBName}}/g, ulbTitle);
    res = res.replace(/{{ULBNameMarathi}}/g, activeUlb.ulbNameLocal || ulbTitle);
    res = res.replace(/{{OfficerName}}/g, certLang === "en" ? "Shri S. K. Joshi (Asst. Commissioner)" : "श्री. एस. के. जोशी (प्र. सहाय्यक आयुक्त)");
    res = res.replace(/{{ApprovedByOfficer}}/g, certLang === "en" ? "Shri S. K. Joshi" : "श्री. एस. के. जोशी");
    res = res.replace(/{{OfficerDesignation}}/g, certLang === "en" ? "Asst. Municipal Commissioner" : "सहाय्यक आयुक्त");
    res = res.replace(/\[\[OrderNo\]\]/g, "आदेश क्र. मनपा/प्रशासन/२०२६/२८१");
    res = res.replace(/\[\[ValidityPeriod\]\]/g, "९० दिवस (3 Months)");
    res = res.replace(/\[\[ChallanNo\]\]/g, "चलन क्र. CHN-2026-9812");
    res = res.replace(/\[\[SpecialConditions\]\]/g, "अटींचे काटेकोर पालन करणे बंधनकारक राहील.");

    // Replace any dynamic {{Field:...}} tags with clean sample preview values
    res = res.replace(/{{Field:([^}]+)}}/g, (_, fieldCode) => {
      return `[नमुना: ${fieldCode}]`;
    });

    const officerBand = bands.find((b) => b.type === "OFFICER_INPUTS_BLOCK");
    const officerFields: OfficerFieldConfig[] = officerBand?.data?.officerFields || [];

    if (officerFields.length > 0) {
      const officerBlock = `
        <div class='officer-dynamic-entries my-2 p-3 bg-amber-50/90 border border-amber-400 rounded-md space-y-1.5 relative z-10'>
          <div class='font-bold text-amber-950 flex items-center gap-1'>
            <span>📝</span> <span>${certLang === "en" ? "Officer Approval & Inspection Remarks:" : certLang === "hi" ? "अधिकारी निर्णय व सत्यापन प्रविष्टि:" : "अधिकारी निर्णय व पडताळणी तपशील (Officer Inputs):"}</span>
          </div>
          ${officerFields
          .map(
            (f) => `
            <div class='flex items-start gap-2'>
              <span class='font-bold text-slate-900 shrink-0'>${certLang === "en" ? f.fieldLabelEnglish : f.fieldLabelMarathi}:</span>
              <span class='text-slate-950'>${certLang === "en" ? "All documents verified as per statutory rules." : "विहित नियमांनुसार सर्व कागदपत्रांची पडताळणी पूर्ण झाली आहे."}</span>
            </div>
          `
          )
          .join("")}
        </div>
      `;
      res = res.replace(/{{OfficerFieldsBlock}}/g, officerBlock);
    } else {
      res = res.replace(/{{OfficerFieldsBlock}}/g, "");
    }

    res = res.replace(/{{CustomConditionsList}}/g, "");
    return res;
  }, [compiledHtml, showSampleData, certLang, currentServiceName, currentDeptName, activeUlb, activeService, bands]);

  // Save Template Action
  const handleSaveTemplate = () => {
    if (!activeService) return;

    startTransition(async () => {
      try {
        const conditionsBand = bands.find((b) => b.type === "CONDITIONS_LIST");
        const officerBand = bands.find((b) => b.type === "OFFICER_INPUTS_BLOCK");

        // Generate 100% clean HTML (NO studio selection borders or pencil badges) for saving in DB
        const cleanBodyHtml = generateCertificateHtml(false);

        const payload: CertificateTemplateFormData = {
          id: activeTemplate?.id,
          serviceId: activeService.id,
          templateName: templateName || `${activeService.nameLocal || activeService.name} Certificate Template`,
          templateCode: templateCode || `CERT_${activeService.id}`,
          bodyContent: cleanBodyHtml,
          defaultConditions: conditionsBand?.data?.conditions || [],
          officerFields: officerBand?.data?.officerFields || [],
          isActive: isActive,
        };

        const res = await saveCertificateTemplateAction(payload);

        if (res.success && res.template) {
          toast.success("दाखला मास्टर फॉरमॅट यशस्वीरित्या सेव्ह झाला!");
          setTemplates((prev) => {
            const idx = prev.findIndex(
              (t) => t.id === res.template!.id || String(t.serviceId) === activeService.id
            );
            if (idx >= 0) {
              const clone = [...prev];
              clone[idx] = res.template!;
              return clone;
            }
            return [res.template!, ...prev];
          });
        } else {
          toast.error(res.error || "फॉरमॅट सेव्ह करताना एरर आली.");
        }
      } catch (err: any) {
        toast.error(err.message || "एरर आली.");
      }
    });
  };

  // Instant Print Action
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templateName}</title>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * { font-family: 'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif; box-sizing: border-box; }
            @page { size: ${pageSize} ${orientation}; margin: 10mm; }
            body { background: white; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div style="width: 100%;">
            ${livePreviewMergedHtml}
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full h-[calc(100vh-65px)] flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* ================= TOP LEVEL HEADER STUDIO BAR ================= */}
      <div className="bg-white border-b border-slate-300 px-4 py-2 sticky top-0 z-30 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4b70a6] to-[#3a5885] text-white flex items-center justify-center shadow-sm shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
              <span>{t("title")}</span>
              <Badge variant="default" size="sm" className="font-bold">
                {pageSize} • {orientation === "portrait" ? "उभा" : "आडवा"}
              </Badge>
            </h1>
            <p className="text-[11px] font-semibold text-slate-600">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Action Buttons & Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Certificate Content Language Dropdown (Certificate Text Body Only) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenRibbonMenu((p) => (p === "lang" ? null : "lang"))}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border-2 border-[#4b70a6] rounded-lg text-xs font-extrabold text-[#4b70a6] flex items-center gap-1.5 shadow-2xs"
              title={t("certContentLang")}
            >
              <Globe className="w-3.5 h-3.5 text-[#4b70a6]" />
              <span>
                📜 {t("certContentLang")} {certLang === "mr" ? "मराठी" : certLang === "en" ? "English" : "हिंदी"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#4b70a6]" />
            </button>

            {openRibbonMenu === "lang" && (
              <div className="absolute top-full mt-1.5 left-0 w-60 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-2.5 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-200">
                  {t("certContentLang")}
                </div>
                {[
                  { id: "mr", label: "मराठी (Marathi)" },
                  { id: "en", label: "English" },
                  { id: "hi", label: "हिंदी (Hindi)" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectCertificateLanguage(l.id as CertificateLanguage)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${certLang === l.id ? "bg-blue-100 text-[#4b70a6]" : "text-slate-800 hover:bg-slate-100"
                      }`}
                  >
                    <span>{l.label}</span>
                    {certLang === l.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Section / Band Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenRibbonMenu((p) => (p === "insert" ? null : "insert"))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("addBand")}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {openRibbonMenu === "insert" && (
              <div className="absolute top-full mt-1.5 left-0 w-64 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 max-h-80 overflow-y-auto">
                {[
                  { type: "HEADER_LETTERHEAD" as BandType, title: "Header Letterhead", titleLocal: "मनपा लेटरहेड बॉक्स" },
                  { type: "DISPATCH_DATE" as BandType, title: "Dispatch Outward & Date", titleLocal: "जावक क्र. व दिनांक बॉक्स" },
                  { type: "RECIPIENT_BLOCK" as BandType, title: "Applicant Recipient", titleLocal: "अर्जदार तपशील बॉक्स" },
                  { type: "SUBJECT_REFERENCE" as BandType, title: "Subject & Reference", titleLocal: "विषय व संदर्भ बॉक्स" },
                  { type: "SALUTATION" as BandType, title: "Salutation", titleLocal: "अभिवादन बॉक्स" },
                  { type: "NARRATIVE_BODY" as BandType, title: "Narrative Body", titleLocal: "मुख्य मजकूर परिच्छेद बॉक्स" },
                  { type: "OFFICER_INPUTS_BLOCK" as BandType, title: "Officer Inputs Block", titleLocal: "अधिकारी इनपुट बॉक्स" },
                  { type: "CONDITIONS_LIST" as BandType, title: "Terms & Conditions", titleLocal: "अटी व शर्ती बॉक्स" },
                  { type: "TIP_NOTE" as BandType, title: "Validity Tip Note", titleLocal: "वैधता टिप बॉक्स" },
                  { type: "SIGNATURE_SEAL" as BandType, title: "Signatures & Seal Stamp", titleLocal: "स्वाक्षरी व मनपा शिक्का बॉक्स" },
                  { type: "SECURITY_FOOTER" as BandType, title: "Security QR & Footer", titleLocal: "सुरक्षा QR व फुटर बॉक्स" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddBand(item.type, item.title, item.titleLocal)}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-between"
                  >
                    <span>{item.titleLocal}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Page Setup Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenRibbonMenu((p) => (p === "layout" ? null : "layout"))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
            >
              <Layout className="w-3.5 h-3.5 text-[#4b70a6]" />
              <span>{t("pageSetupTab")}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {openRibbonMenu === "layout" && (
              <div className="absolute top-full mt-1.5 right-0 w-64 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-3 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>कागद व समास पर्याय</span>
                  <button type="button" onClick={() => setOpenRibbonMenu(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">आकार (Paper Size)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["A4", "Letter", "Legal"] as PageSize[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPageSize(s)}
                        className={`py-1 text-xs font-bold rounded border ${pageSize === s ? "bg-[#4b70a6] text-white" : "bg-slate-50 text-slate-800"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">दिशा (Orientation)</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "portrait", label: "उभा (Portrait)" },
                      { id: "landscape", label: "आडवा (Landscape)" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOrientation(o.id as PageOrientation)}
                        className={`py-1 text-xs font-bold rounded border ${orientation === o.id ? "bg-[#4b70a6] text-white" : "bg-slate-50 text-slate-800"}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">समास (Margins)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "normal", label: "सामान्य" },
                      { id: "narrow", label: "अरुंद" },
                      { id: "wide", label: "रुंद" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMargin(m.id as MarginOption)}
                        className={`py-1 text-xs font-bold rounded border ${margin === m.id ? "bg-[#4b70a6] text-white" : "bg-slate-50 text-slate-800"}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">बॉर्डर (Border Style)</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "double", label: "शासकीय डबल" },
                      { id: "solid", label: "सिंगल सॉलिड" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBorderStyle(b.id as BorderStyleOption)}
                        className={`py-1 text-xs font-bold rounded border ${borderStyle === b.id ? "bg-[#4b70a6] text-white" : "bg-slate-50 text-slate-800"}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between pt-1 border-t border-slate-200 cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">मनपा लोगो वॉटरमार्क</span>
                  <ToggleSwitch checked={showWatermark} onChange={setShowWatermark} />
                </label>
              </div>
            )}
          </div>



          {/* Dedicated Preview in Modal Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 border-[#4b70a6] text-[#4b70a6] hover:bg-blue-50 font-bold shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#4b70a6]" />
            <span>{t("previewModal")}</span>
          </Button>

          {/* Save & Publish */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTemplate}
            disabled={isPending}
            className="flex items-center gap-1.5 shadow-sm font-bold bg-[#4b70a6] hover:bg-[#3a5885] text-white"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? t("saving") : t("saveFormat")}</span>
          </Button>
        </div>
      </div>

      {/* ================= MS WORD & CRYSTAL REPORTS SIZING RIBBON TOOLBAR ================= */}
      <div className="bg-white border-b-2 border-slate-300 px-4 py-1.5 flex items-center justify-between gap-3 shrink-0 shadow-xs relative z-25 overflow-visible">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Selected Box Selector Dropdown */}
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-300 p-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse ml-1.5 shrink-0"></span>
            <select
              value={selectedBandId || "ALL"}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBandId(val);
                if (val === "ALL") {
                  setApplyToAllBands(true);
                } else {
                  setApplyToAllBands(false);
                }
              }}
              className="text-xs font-extrabold bg-transparent text-[#4b70a6] border-0 focus:ring-0 py-1 pr-6 cursor-pointer"
            >
              <option value="ALL">⚡ {isPageMr ? "संपूर्ण दाखला (All Bands)" : "All Certificate Bands"}</option>
              {bands.map((b, i) => (
                <option key={b.id} value={b.id}>
                  {i + 1}. {isPageMr ? b.titleLocal : b.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setApplyToAllBands((p) => !p)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all shrink-0 ${applyToAllBands || selectedBandId === "ALL"
                  ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              title={isPageMr ? "सर्व विभागांना हेच फॉरमॅटिंग लागू करा" : "Apply formatting to all bands"}
            >
              {isPageMr ? "सर्व दाखला" : "All"}
            </button>
          </div>

          {/* Undo / Redo Group */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-1 px-1.5 rounded text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 transition-colors"
              title={`${t("undo")} (Ctrl+Z)`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px]">{t("undo")}</span>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-1 px-1.5 rounded text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 transition-colors"
              title={`${t("redo")} (Ctrl+Y)`}
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px]">{t("redo")}</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300 mx-0.5"></div>

          {/* Font Family Selector */}
          <select
            value={currentBandStyle.fontFamily || "devanagari"}
            onChange={(e) => updateSelectedBandStyle({ fontFamily: e.target.value })}
            className="text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 shadow-2xs"
            title="फॉन्ट फॅमिली"
          >
            <option value="devanagari">देवनागरी (Noto Sans)</option>
            <option value="sans">Segoe UI / Arial</option>
            <option value="serif">Georgia / Times New Roman</option>
            <option value="mono">Courier New (Monospace)</option>
          </select>

          {/* Font Size Step Down & Dropdown */}
          <button
            type="button"
            onClick={() => changeFontSizeStep(-1)}
            className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-extrabold text-slate-800"
            title="फॉन्ट साईझ कमी करा (A-)"
          >
            A-
          </button>

          <select
            value={currentBandStyle.fontSize || "13px"}
            onChange={(e) => updateSelectedBandStyle({ fontSize: e.target.value })}
            className="text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 shadow-2xs"
            title="फॉन्ट साईझ"
          >
            {["10px", "11px", "12px", "13px", "14px", "15px", "16px", "18px", "20px", "22px", "24px", "28px", "32px"].map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => changeFontSizeStep(1)}
            className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-extrabold text-slate-800"
            title="फॉन्ट साईझ वाढवा (A+)"
          >
            A+
          </button>

          <div className="h-6 w-px bg-slate-300 mx-0.5"></div>

          {/* Bold, Italic, Underline, Strikethrough Button Group */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => updateSelectedBandStyle({ isBold: !currentBandStyle.isBold })}
              className={`p-1 rounded text-xs font-bold transition-all ${currentBandStyle.isBold ? "bg-[#4b70a6] text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                }`}
              title="ठळक (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedBandStyle({ isItalic: !currentBandStyle.isItalic })}
              className={`p-1 rounded text-xs font-bold transition-all ${currentBandStyle.isItalic ? "bg-[#4b70a6] text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                }`}
              title="तिरपा (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedBandStyle({ isUnderline: !currentBandStyle.isUnderline })}
              className={`p-1 rounded text-xs font-bold transition-all ${currentBandStyle.isUnderline ? "bg-[#4b70a6] text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                }`}
              title="अधोरेखित (Underline)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedBandStyle({ isStrikethrough: !currentBandStyle.isStrikethrough })}
              className={`p-1 rounded text-xs font-bold transition-all ${currentBandStyle.isStrikethrough ? "bg-[#4b70a6] text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                }`}
              title="स्ट्राइकथ्रू (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300 mx-0.5"></div>

          {/* Text Alignment Group */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 shadow-2xs">
            {[
              { id: "left", icon: AlignLeft, title: isPageMr ? "डावीकडे (Left)" : "Left Align" },
              { id: "center", icon: AlignCenter, title: isPageMr ? "मध्यभागी (Center)" : "Center Align" },
              { id: "right", icon: AlignRight, title: isPageMr ? "उजवीकडे (Right)" : "Right Align" },
              { id: "justify", icon: AlignJustify, title: isPageMr ? "समान दोन्ही बाजू (Justify)" : "Justify" },
            ].map((al) => {
              const IconComp = al.icon;
              return (
                <button
                  key={al.id}
                  type="button"
                  onClick={() => updateSelectedBandStyle({ textAlign: al.id as any })}
                  className={`p-1 rounded text-xs transition-all ${currentBandStyle.textAlign === al.id ? "bg-[#4b70a6] text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
                    }`}
                  title={al.title}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-300 mx-0.5"></div>

          {/* Line Height / Line Spacing Dropdown */}
          <select
            value={currentBandStyle.lineHeight || "1.6"}
            onChange={(e) => updateSelectedBandStyle({ lineHeight: e.target.value })}
            className="text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 shadow-2xs"
            title={t("lineHeight")}
          >
            <option value="1.2">1.2x</option>
            <option value="1.4">1.4x</option>
            <option value="1.5">1.5x</option>
            <option value="1.6">1.6x</option>
            <option value="1.8">1.8x</option>
            <option value="2.0">2.0x</option>
          </select>

          {/* 1-Click Fast Colors + Full MS Word Color Palette Dropdown */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-300">
              {[
                { color: "#0f172a", title: "Black" },
                { color: "#1e3a8a", title: "Navy Blue" },
                { color: "#991b1b", title: "Dark Red" },
                { color: "#065f46", title: "Forest Green" },
                { color: "#854d0e", title: "Gold" },
              ].map((sw) => (
                <button
                  key={sw.color}
                  type="button"
                  onClick={() => {
                    updateSelectedBandStyle({ textColor: sw.color });
                    toast.success("Color updated!");
                  }}
                  className={`w-5 h-5 rounded-full border transition-all ${currentBandStyle.textColor === sw.color
                      ? "ring-2 ring-[#4b70a6] scale-110 border-white shadow-xs"
                      : "border-slate-300 hover:scale-105"
                    }`}
                  style={{ backgroundColor: sw.color }}
                  title={sw.title}
                />
              ))}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenRibbonMenu((p) => (p === "textColor" ? null : "textColor"))}
                className="p-1 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-800 shadow-2xs"
                title={isPageMr ? "अधिक रंग (More Colors)" : "More Colors"}
              >
                <span className="font-extrabold text-xs">A</span>
                <span
                  className="w-3 h-3 rounded-full border border-slate-400"
                  style={{ backgroundColor: currentBandStyle.textColor || "#0f172a" }}
                ></span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {openRibbonMenu === "textColor" && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-3 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-200 flex items-center justify-between">
                    <span>{isPageMr ? "मजकूर रंग" : "Text Color"}</span>
                    <button type="button" onClick={() => setOpenRibbonMenu(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { color: "#0f172a", name: "Black" },
                      { color: "#1e3a8a", name: "Navy Blue" },
                      { color: "#991b1b", name: "Dark Red" },
                      { color: "#065f46", name: "Forest Green" },
                      { color: "#854d0e", name: "Gold" },
                      { color: "#581c87", name: "Royal Purple" },
                      { color: "#475569", name: "Slate Grey" },
                      { color: "#0284c7", name: "Sky Blue" },
                      { color: "#dc2626", name: "Bright Red" },
                      { color: "#16a34a", name: "Emerald Green" },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => {
                          updateSelectedBandStyle({ textColor: swatch.color });
                          setOpenRibbonMenu(null);
                          toast.success(`Color changed!`);
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-300 hover:scale-110 transition-transform shadow-2xs flex items-center justify-center"
                        style={{ backgroundColor: swatch.color }}
                        title={swatch.name}
                      >
                        {currentBandStyle.textColor === swatch.color && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <span>{isPageMr ? "सानुकूल रंग:" : "Custom Color:"}</span>
                      <input
                        type="color"
                        value={currentBandStyle.textColor || "#0f172a"}
                        onChange={(e) => updateSelectedBandStyle({ textColor: e.target.value })}
                        className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                      />
                    </label>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {currentBandStyle.textColor || "#0f172a"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Tag Injector Quick Ribbon Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenRibbonMenu((p) => (p === "tags" ? null : "tags"))}
              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 text-xs font-bold text-slate-800 shadow-2xs"
              title={t("insertTagRibbon")}
            >
              <Tag className="w-3.5 h-3.5 text-[#4b70a6]" />
              <span>{t("insertTagRibbon")}</span>
              <ChevronDown className="w-3 h-3 text-slate-600" />
            </button>

            {openRibbonMenu === "tags" && (
              <div className="absolute top-full mt-2 left-0 w-64 max-h-72 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-2.5 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>{t("selectTagRibbon")}</span>
                  <button type="button" onClick={() => setOpenRibbonMenu(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>
                {allDisplayTags.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      handleInsertTagToTarget(item.key);
                      setOpenRibbonMenu(null);
                    }}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-blue-50/60 flex items-center justify-between border border-transparent hover:border-blue-200 transition-colors"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#4b70a6]">{item.key}</div>
                      <div className="text-[10px] text-slate-600 font-semibold">{item.desc}</div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-[#4b70a6] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vertical Padding (Y) */}
          <div className="flex items-center gap-1 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded-lg">
            <span className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
              <MoveVertical className="w-3 h-3 text-[#4b70a6]" />
              <span>{t("paddingY")}</span>
            </span>
            <button
              type="button"
              onClick={() => changeBoxPaddingStep(-2)}
              className="px-1.5 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-extrabold text-blue-900"
              title="Padding Y -"
            >
              -
            </button>
            <span className="font-mono text-[10px] font-bold text-blue-950 w-7 text-center">
              {currentBandStyle.paddingY ?? 6}px
            </span>
            <button
              type="button"
              onClick={() => changeBoxPaddingStep(2)}
              className="px-1.5 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-extrabold text-blue-900"
              title="Padding Y +"
            >
              +
            </button>
          </div>

          {/* Horizontal Padding (X) */}
          <div className="flex items-center gap-1 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded-lg">
            <span className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3 text-[#4b70a6]" />
              <span>{t("paddingX")}</span>
            </span>
            <button
              type="button"
              onClick={() => changeBoxPaddingXStep(-2)}
              className="px-1.5 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-extrabold text-blue-900"
              title="Padding X -"
            >
              -
            </button>
            <span className="font-mono text-[10px] font-bold text-blue-950 w-7 text-center">
              {currentBandStyle.paddingX ?? 6}px
            </span>
            <button
              type="button"
              onClick={() => changeBoxPaddingXStep(2)}
              className="px-1.5 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-300 text-xs font-extrabold text-blue-900"
              title="Padding X +"
            >
              +
            </button>
          </div>

          {/* Margin Bottom / Box Spacing */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
            <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-600" />
              <span>{t("boxSpacing")}</span>
            </span>
            <button
              type="button"
              onClick={() => changeBoxMarginStep(-2)}
              className="px-1.5 py-0.5 bg-white hover:bg-amber-100 rounded border border-amber-300 text-xs font-extrabold text-amber-900"
              title="Margin -"
            >
              -
            </button>
            <span className="font-mono text-[10px] font-bold text-amber-950 w-7 text-center">
              {currentBandStyle.marginBottom ?? 8}px
            </span>
            <button
              type="button"
              onClick={() => changeBoxMarginStep(2)}
              className="px-1.5 py-0.5 bg-white hover:bg-amber-100 rounded border border-amber-300 text-xs font-extrabold text-amber-900"
              title="Margin +"
            >
              +
            </button>
          </div>

          {/* Quick Image / Seal Sizer */}
          {(selectedBand?.type === "HEADER_LETTERHEAD" || selectedBand?.type === "SIGNATURE_SEAL" || selectedBand?.type === "SECURITY_FOOTER") && (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg">
              <span className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-emerald-700" />
                <span>{t("imageSize")}</span>
              </span>
              <button
                type="button"
                onClick={() => changeBoxImageSizeStep(-10)}
                className="px-1.5 py-0.5 bg-white hover:bg-emerald-100 rounded border border-emerald-300 text-xs font-extrabold text-emerald-900"
                title="Image -"
              >
                -
              </button>
              <span className="font-mono text-[10px] font-bold text-emerald-950 w-8 text-center">
                {currentBandStyle.imageSize ?? 80}px
              </span>
              <button
                type="button"
                onClick={() => changeBoxImageSizeStep(10)}
                className="px-1.5 py-0.5 bg-white hover:bg-emerald-100 rounded border border-emerald-300 text-xs font-extrabold text-emerald-900"
                title="Image +"
              >
                +
              </button>
            </div>
          )}

          {/* Interactive Mouse Dragging & Sizing Status Indicator */}
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-300 px-2.5 py-1 rounded-lg">
            <Hand className="w-3.5 h-3.5 text-[#4b70a6] animate-bounce" />
            <span className="text-[11px] font-extrabold text-[#4b70a6]">
              {t("canvasDragHint")}
            </span>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-500 shrink-0">
          💡 {t("canvasDragHint")}
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN STUDIO WORKSPACE (EQUAL HEIGHT SCROLLERS) ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-full">
        {/* ================= LEFT COLUMN: STUDIO CONTROLS & TOOLBOX (5 Cols) ================= */}
        <div className="lg:col-span-5 bg-white border-r border-slate-300 flex flex-col h-full overflow-hidden">
          {/* Department & Service Select Dropdown Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                  {t("selectDepartment")}
                </label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => {
                    const newDeptId = e.target.value;
                    setSelectedDepartmentId(newDeptId);
                    const matched = services.find(
                      (s) => newDeptId === "ALL" || String(s.departmentId) === newDeptId
                    );
                    if (matched) setSelectedServiceId(matched.id);
                  }}
                  className="w-full text-xs bg-white border border-slate-300 text-slate-900 font-bold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#4b70a6]"
                >
                  <option value="ALL">{t("allDepartments")}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                  {t("selectService")}
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs bg-white border-2 border-[#4b70a6] text-[#4b70a6] font-extrabold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#4b70a6]"
                >
                  {filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isPageMr ? s.nameLocal || s.name : s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-700">
                  {t("status")}
                </span>
                <Badge variant={activeTemplate ? "success" : "warning"} size="sm" className="font-bold">
                  {activeTemplate ? t("templateConfigured") : t("defaultFormat")}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-800 cursor-pointer">
                  {t("isActive")}
                </label>
                <ToggleSwitch checked={isActive} onChange={setIsActive} />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-300 bg-slate-100 px-2 pt-1.5 gap-1 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveSidebarTab("bands")}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${activeSidebarTab === "bands"
                  ? "bg-white text-[#4b70a6] border-t-2 border-[#4b70a6] shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t("bandsTab")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("boxDimensions")}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${activeSidebarTab === "boxDimensions"
                  ? "bg-white text-[#4b70a6] border-t-2 border-[#4b70a6] shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
                }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>{t("dimensionsAndSpacingTab")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("pageSetup")}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${activeSidebarTab === "pageSetup"
                  ? "bg-white text-[#4b70a6] border-t-2 border-[#4b70a6] shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
                }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>{t("pageSetupTab")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("tags")}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${activeSidebarTab === "tags"
                  ? "bg-white text-[#4b70a6] border-t-2 border-[#4b70a6] shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
                }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{t("tagsTab")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarTab("officerInputs")}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${activeSidebarTab === "officerInputs"
                  ? "bg-white text-[#4b70a6] border-t-2 border-[#4b70a6] shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
                }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{t("officerInputsTab")}</span>
            </button>
          </div>

          {/* Scrollable Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* TAB 1: DRAGGABLE BANDS LIST & INLINE EDITORS */}
            {activeSidebarTab === "bands" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>विभाग ड्रॅग करून किंवा बाणाने क्रम बदला:</span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {bands.filter((b) => b.enabled).length} / {bands.length} {t("active")}
                  </span>
                </div>

                {/* Draggable Bands List */}
                <div className="space-y-1.5">
                  {bands.map((band, idx) => {
                    const isSelected = band.id === selectedBandId;
                    const isDragging = draggedIndex === idx;
                    const isOver = dragOverIndex === idx;

                    return (
                      <div
                        key={band.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => setSelectedBandId(band.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs group ${isDragging
                            ? "opacity-40 border-dashed border-slate-500 scale-95"
                            : isOver
                              ? "border-t-4 border-t-[#4b70a6] bg-blue-50/50"
                              : isSelected
                                ? "bg-blue-50/95 border-[#4b70a6] ring-2 ring-[#4b70a6]/25"
                                : "bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing shrink-0 hover:text-slate-700" />
                          <div className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center text-slate-900 font-mono text-[10px] font-extrabold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-950 truncate flex items-center gap-1.5">
                              <span>{band.titleLocal}</span>
                              {!band.enabled && (
                                <Badge variant="secondary" size="sm" className="font-bold">
                                  {t("inactive")}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium truncate">{band.title}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveBand(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-200 rounded text-slate-700 disabled:opacity-20"
                            title="वर हलवा"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBand(idx, "down")}
                            disabled={idx === bands.length - 1}
                            className="p-1 hover:bg-slate-200 rounded text-slate-700 disabled:opacity-20"
                            title="खाली हलवा"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <ToggleSwitch
                            checked={band.enabled}
                            onChange={(val) => {
                              setBands((prev) =>
                                prev.map((b) => (b.id === band.id ? { ...b, enabled: val } : b))
                              );
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBand(band.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="विभाग काढा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Band Details Live Editor */}
                {selectedBand && (
                  <div className="mt-4 p-3.5 bg-slate-50 border-2 border-[#4b70a6]/50 rounded-xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#4b70a6]" />
                        <span className="text-xs font-extrabold text-slate-950">
                          {selectedBand.titleLocal} {t("edit")}
                        </span>
                      </div>
                      <Badge variant="default" size="sm" className="font-mono text-[10px] font-bold">
                        {selectedBand.type}
                      </Badge>
                    </div>

                    {selectedBand.type === "HEADER_LETTERHEAD" && (
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <ToggleSwitch
                              checked={selectedBand.data.showLogo}
                              onChange={(v) => updateBandData(selectedBand.id, "showLogo", v)}
                            />
                            <span className="font-bold text-slate-900">मनपा लोगो</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <ToggleSwitch
                              checked={selectedBand.data.showAddress}
                              onChange={(v) => updateBandData(selectedBand.id, "showAddress", v)}
                            />
                            <span className="font-bold text-slate-900">पत्ता</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <ToggleSwitch
                              checked={selectedBand.data.showEmail}
                              onChange={(v) => updateBandData(selectedBand.id, "showEmail", v)}
                            />
                            <span className="font-bold text-slate-900">ई-मेल</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <ToggleSwitch
                              checked={selectedBand.data.showDivider}
                              onChange={(v) => updateBandData(selectedBand.id, "showDivider", v)}
                            />
                            <span className="font-bold text-slate-900">विभाजक रेष</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            विभागाचे उप-नाव (Department Subtitle)
                          </label>
                          <Input
                            value={selectedBand.data.departmentSubtitle || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "departmentSubtitle", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "DISPATCH_DATE" && (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              जावक उपसर्ग
                            </label>
                            <Input
                              value={selectedBand.data.outwardPrefix || ""}
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "outwardPrefix", e.target.value)
                              }
                              className="text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              दिनांक लेबल
                            </label>
                            <Input
                              value={selectedBand.data.datePrefix || ""}
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "datePrefix", e.target.value)
                              }
                              className="text-xs font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            जावक टॅग फॉरमॅट
                          </label>
                          <Input
                            value={selectedBand.data.outwardTag || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "outwardTag", e.target.value)
                            }
                            className="text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SUBJECT_REFERENCE" && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            विषय ओळ
                          </label>
                          <Input
                            value={selectedBand.data.subjectText || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "subjectText", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            संदर्भ ओळ
                          </label>
                          <Input
                            value={selectedBand.data.referenceText || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "referenceText", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "NARRATIVE_BODY" && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            परिच्छेद १ (पडताळणी व छाननी)
                          </label>
                          <textarea
                            rows={3}
                            value={selectedBand.data.paragraph1 || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "paragraph1", e.target.value)
                            }
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4b70a6] text-slate-950 font-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            परिच्छेद २ (दाखला मंजुरी व आदेश)
                          </label>
                          <textarea
                            rows={3}
                            value={selectedBand.data.paragraph2 || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "paragraph2", e.target.value)
                            }
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4b70a6] text-slate-950 font-normal"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "CONDITIONS_LIST" && (
                      <div className="space-y-2.5 text-xs">
                        <div className="flex gap-1.5">
                          <Input
                            placeholder={editingConditionIdx !== null ? "अट संपादित करा..." : "नवीन अट लिहा..."}
                            value={conditionTextInput}
                            onChange={(e) => setConditionTextInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveCondition();
                              }
                            }}
                            className="text-xs"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveCondition}
                            className="bg-[#4b70a6] text-white shrink-0"
                          >
                            {editingConditionIdx !== null ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{editingConditionIdx !== null ? "अपडेट करा" : "जोडा"}</span>
                          </Button>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(selectedBand.data.conditions || []).map((cond: string, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="flex items-start gap-1.5 p-2 bg-white border border-slate-300 rounded-md shadow-2xs"
                            >
                              <span className="font-extrabold text-[11px] text-slate-700 shrink-0">
                                {cIdx + 1}.
                              </span>
                              <span className="text-slate-950 font-semibold flex-1">{cond}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingConditionIdx(cIdx);
                                  setConditionTextInput(cond);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="संपादित करा"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = selectedBand.data.conditions.filter(
                                    (_: any, i: number) => i !== cIdx
                                  );
                                  updateBandData(selectedBand.id, "conditions", filtered);
                                }}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="काढा"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "RECIPIENT_BLOCK" && (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              प्रति लेबल (To Label)
                            </label>
                            <Input
                              value={selectedBand.data.toLabel || ""}
                              placeholder="प्रति, / To,"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "toLabel", e.target.value)
                              }
                              className="text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              अर्जदार नाव टॅग
                            </label>
                            <Input
                              value={selectedBand.data.nameTag || ""}
                              placeholder="{{ApplicantName}}"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "nameTag", e.target.value)
                              }
                              className="text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              पत्ता लेबल व टॅग
                            </label>
                            <Input
                              value={selectedBand.data.addressTag || ""}
                              placeholder="{{ApplicantAddress}}"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "addressTag", e.target.value)
                              }
                              className="text-xs font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              मोबाईल टॅग
                            </label>
                            <Input
                              value={selectedBand.data.mobileTag || ""}
                              placeholder="{{ApplicantMobile}}"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "mobileTag", e.target.value)
                              }
                              className="text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SALUTATION" && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            अभिवादन मजकूर (Salutation Text)
                          </label>
                          <Input
                            value={selectedBand.data.text || ""}
                            placeholder="महोदय / महोदया, / Dear Sir / Madam,"
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "text", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "TIP_NOTE" && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            वैधता दिवस (Validity Days)
                          </label>
                          <Input
                            type="number"
                            value={selectedBand.data.validityDays || 90}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "validityDays", Number(e.target.value))
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            सानुकूल टिप मजकूर (Custom Note Text)
                          </label>
                          <textarea
                            rows={3}
                            value={selectedBand.data.customText || ""}
                            placeholder="टिप :- सदर दाखल्याचा कालावधी..."
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "customText", e.target.value)
                            }
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4b70a6] text-slate-950 font-normal"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SECURITY_FOOTER" && (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            वैधानिक अस्वीकरण मजकूर (Disclaimer Text)
                          </label>
                          <textarea
                            rows={2}
                            value={selectedBand.data.disclaimerText || ""}
                            placeholder="हे प्रमाणपत्र संगणकीय प्रणालीद्वारे डिजिटल स्वाक्षरीने..."
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "disclaimerText", e.target.value)
                            }
                            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4b70a6] text-slate-950 font-normal"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              QR स्कॅन मजकूर
                            </label>
                            <Input
                              value={selectedBand.data.qrNote || ""}
                              placeholder="Scan to Verify"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "qrNote", e.target.value)
                              }
                              className="text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                              सुरक्षा बारकोड पॅटर्न
                            </label>
                            <Input
                              value={selectedBand.data.barcodePattern || ""}
                              placeholder="||||||||||||||||||||||"
                              onChange={(e) =>
                                updateBandData(selectedBand.id, "barcodePattern", e.target.value)
                              }
                              className="text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            फूटर फाईल पाथ मजकूर (Footer Path)
                          </label>
                          <Input
                            value={selectedBand.data.footerPath || ""}
                            placeholder={`D:\\${activeUlb.ulbNameLocal || activeUlb.ulbName}\\${currentDeptName}\\Certificate`}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "footerPath", e.target.value)
                            }
                            className="text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {selectedBand.type === "SIGNATURE_SEAL" && (
                      <div className="space-y-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <ToggleSwitch
                            checked={selectedBand.data.showSeal}
                            onChange={(v) => updateBandData(selectedBand.id, "showSeal", v)}
                          />
                          <span className="font-bold text-slate-900">मनपा गोल शिक्का दाखवा</span>
                        </label>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            लिपिक पदनाम
                          </label>
                          <Input
                            value={selectedBand.data.clerkTitle || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "clerkTitle", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-0.5">
                            सक्षम प्राधिकारी पदनाम
                          </label>
                          <Input
                            value={selectedBand.data.officerTitle || ""}
                            onChange={(e) =>
                              updateBandData(selectedBand.id, "officerTitle", e.target.value)
                            }
                            className="text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SPACING, PADDING & IMAGE SIZING */}
            {activeSidebarTab === "boxDimensions" && (
              <div className="space-y-3.5 text-xs">
                {/* 1. Active Selected Box Padding & Spacing Panel */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <div className="font-extrabold text-blue-950 flex items-center gap-1.5 text-xs">
                      <Sliders className="w-4 h-4 text-[#4b70a6]" />
                      <span>{t("dimensionsAndSpacingTab")}: {selectedBand ? (isPageMr ? selectedBand.titleLocal : selectedBand.title) : ""}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSelectedBandStyle({ paddingY: currentBandStyle.paddingY, paddingX: currentBandStyle.paddingX, marginBottom: currentBandStyle.marginBottom, lineHeight: currentBandStyle.lineHeight }, true)}
                      className="text-[10px] bg-white hover:bg-blue-100 border border-blue-300 text-[#4b70a6] px-2 py-0.5 rounded-md font-bold shadow-2xs transition-colors"
                      title="Apply current spacing to all bands"
                    >
                      {isPageMr ? "सर्व विभागांना लागू करा" : "Apply to All"}
                    </button>
                  </div>

                  {/* Vertical Padding (Y) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <MoveVertical className="w-3.5 h-3.5 text-[#4b70a6]" />
                        <span>{t("paddingY")}</span>
                      </span>
                      <span className="font-mono text-[#4b70a6]">{currentBandStyle.paddingY ?? 6}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={currentBandStyle.paddingY ?? 6}
                      onChange={(e) => updateSelectedBandStyle({ paddingY: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4b70a6]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>0px (Compact)</span>
                      <span>15px</span>
                      <span>40px (Spacious)</span>
                    </div>
                  </div>

                  {/* Horizontal Padding (X) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <MoveHorizontal className="w-3.5 h-3.5 text-[#4b70a6]" />
                        <span>{t("paddingX")}</span>
                      </span>
                      <span className="font-mono text-[#4b70a6]">{currentBandStyle.paddingX ?? 6}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={currentBandStyle.paddingX ?? 6}
                      onChange={(e) => updateSelectedBandStyle({ paddingX: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4b70a6]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>0px</span>
                      <span>15px</span>
                      <span>40px</span>
                    </div>
                  </div>

                  {/* Margin Bottom / Box Spacing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t("boxSpacing")}</span>
                      </span>
                      <span className="font-mono text-amber-700">{currentBandStyle.marginBottom ?? 8}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="2"
                      value={currentBandStyle.marginBottom ?? 8}
                      onChange={(e) => updateSelectedBandStyle({ marginBottom: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>0px (No Gap)</span>
                      <span>20px</span>
                      <span>50px (Large Gap)</span>
                    </div>
                  </div>

                  {/* Line Height / Line Spacing */}
                  <div className="space-y-1 pt-1 border-t border-blue-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {t("lineHeight")}
                    </label>
                    <div className="grid grid-cols-6 gap-1">
                      {["1.2", "1.4", "1.5", "1.6", "1.8", "2.0"].map((lh) => (
                        <button
                          key={lh}
                          type="button"
                          onClick={() => updateSelectedBandStyle({ lineHeight: lh })}
                          className={`py-1 text-xs font-bold rounded-md border transition-all ${(currentBandStyle.lineHeight || "1.6") === lh
                              ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                          {lh}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Image, Logo & Seal Sizers */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-1.5">
                  <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>{isPageMr ? "लोगो, शिक्का व प्रतिमा आकार" : "Logo & Seal Dimensions"}</span>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-900">
                    {isPageMr
                      ? "मनपा लोगो, अधिकृत गोल शिक्का आणि सुरक्षा QR कोडचा आकार खालील स्लायडरने बदला."
                      : "Adjust size of municipal logo, seal stamp, and QR verification block."}
                  </p>
                </div>

                {/* Municipal Logo Sizer */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#4b70a6]" />
                      <span>१. {isPageMr ? "मनपा लेटरहेड लोगो" : "Municipal Logo"}</span>
                    </div>
                    <span className="font-mono font-bold text-[#4b70a6] text-xs">
                      {bands.find((b) => b.type === "HEADER_LETTERHEAD")?.style.imageSize ?? 75}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="5"
                    value={bands.find((b) => b.type === "HEADER_LETTERHEAD")?.style.imageSize ?? 75}
                    onChange={(e) => {
                      const newSz = Number(e.target.value);
                      setBands((prev) =>
                        prev.map((b) =>
                          b.type === "HEADER_LETTERHEAD" ? { ...b, style: { ...b.style, imageSize: newSz } } : b
                        )
                      );
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4b70a6]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>{isPageMr ? "लहान (40px)" : "Small (40px)"}</span>
                    <span>{isPageMr ? "मध्यम (75px)" : "Medium (75px)"}</span>
                    <span>{isPageMr ? "मोठा (180px)" : "Large (180px)"}</span>
                  </div>
                </div>

                {/* Official Seal Stamp Sizer */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>२. {isPageMr ? "मनपा अधिकृत गोल शिक्का" : "Official Seal Stamp"}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {bands.find((b) => b.type === "SIGNATURE_SEAL")?.style.imageSize ?? 105}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={bands.find((b) => b.type === "SIGNATURE_SEAL")?.style.imageSize ?? 105}
                    onChange={(e) => {
                      const newSz = Number(e.target.value);
                      setBands((prev) =>
                        prev.map((b) =>
                          b.type === "SIGNATURE_SEAL" ? { ...b, style: { ...b.style, imageSize: newSz } } : b
                        )
                      );
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>{isPageMr ? "लहान (50px)" : "Small (50px)"}</span>
                    <span>{isPageMr ? "प्रमाणित (105px)" : "Standard (105px)"}</span>
                    <span>{isPageMr ? "मोठा (200px)" : "Large (200px)"}</span>
                  </div>
                </div>

                {/* Security QR Code Sizer */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-slate-800" />
                      <span>३. {isPageMr ? "सुरक्षा QR कोड" : "Security QR Code"}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {bands.find((b) => b.type === "SECURITY_FOOTER")?.style.imageSize ?? 55}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    step="5"
                    value={bands.find((b) => b.type === "SECURITY_FOOTER")?.style.imageSize ?? 55}
                    onChange={(e) => {
                      const newSz = Number(e.target.value);
                      setBands((prev) =>
                        prev.map((b) =>
                          b.type === "SECURITY_FOOTER" ? { ...b, style: { ...b.style, imageSize: newSz } } : b
                        )
                      );
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>{isPageMr ? "लहान (40px)" : "Small (40px)"}</span>
                    <span>{isPageMr ? "प्रमाणित (55px)" : "Standard (55px)"}</span>
                    <span>{isPageMr ? "मोठा (120px)" : "Large (120px)"}</span>
                  </div>
                </div>
              </div>
            )}


            {/* TAB 3: PAGE SETUP */}
            {activeSidebarTab === "pageSetup" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-blue-700" />
                    <span>कागद व मांडणी सेटअप (Page Setup)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">कागदाचा आकार (Paper Size)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["A4", "Letter", "Legal"] as PageSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPageSize(size)}
                          className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-center ${pageSize === size
                              ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-xs"
                              : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">कागदाचा समास (Margins)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "normal", label: "सामान्य (15mm)" },
                        { id: "narrow", label: "अरुंद (10mm)" },
                        { id: "wide", label: "रुंद (25mm)" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMargin(m.id as MarginOption)}
                          className={`py-1.5 px-1 rounded-lg font-bold border transition-all text-center text-[11px] ${margin === m.id
                              ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-xs"
                              : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">बॉर्डर स्टाईल (Border Style)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "double", label: "शासकीय डबल" },
                        { id: "solid", label: "सिंगल सॉलिड" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBorderStyle(b.id as BorderStyleOption)}
                          className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-left text-[11px] ${borderStyle === b.id
                              ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-xs"
                              : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-300 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-slate-900">
                        मनपा लोगो वॉटरमार्क (ULB Watermark)
                      </span>
                      <ToggleSwitch checked={showWatermark} onChange={setShowWatermark} />
                    </label>

                    {showWatermark && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">वॉटरमार्क पारदर्शकता (Opacity):</span>
                          <span className="font-mono text-[11px] font-bold text-[#4b70a6]">{watermarkOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="30"
                          step="1"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4b70a6]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DYNAMIC TAGS INJECTOR */}
            {activeSidebarTab === "tags" && (
              <div className="space-y-3 text-xs">
                {/* Target Destination Selector matching Page Setup theme */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#4b70a6]" />
                      <span>{t("targetLocationTitle")}</span>
                    </span>
                    <span className="bg-[#4b70a6] text-white font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs">
                      {destinationLabels[tagInsertDestination]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "paragraph1", label: `📄 ${t("dest_paragraph1")}`, desc: t("dest_paragraph1_desc") },
                      { id: "paragraph2", label: `📄 ${t("dest_paragraph2")}`, desc: t("dest_paragraph2_desc") },
                      { id: "subject", label: `🎯 ${t("dest_subject")}`, desc: t("dest_subject_desc") },
                      { id: "reference", label: `📌 ${t("dest_reference")}`, desc: t("dest_reference_desc") },
                      { id: "outward", label: `🔢 ${t("dest_outward")}`, desc: t("dest_outward_desc") },
                      { id: "recipient", label: `👤 ${t("dest_recipient")}`, desc: t("dest_recipient_desc") },
                      { id: "conditions", label: `⚖️ ${t("dest_conditions")}`, desc: t("dest_conditions_desc") },
                      { id: "tip", label: `💡 ${t("dest_tip")}`, desc: t("dest_tip_desc") },
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setTagInsertDestination(loc.id as any)}
                        className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col ${tagInsertDestination === loc.id
                            ? "bg-[#4b70a6] text-white border-[#4b70a6] shadow-xs font-bold ring-2 ring-[#4b70a6]/40"
                            : "bg-white text-slate-900 border-slate-300 hover:bg-slate-100 font-semibold"
                          }`}
                      >
                        <span className="leading-tight">{loc.label}</span>
                        <span
                          className={`text-[9px] mt-0.5 ${tagInsertDestination === loc.id ? "text-blue-100" : "text-slate-500"
                            }`}
                        >
                          {loc.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {allDisplayTags.map((item, idx) => (
                    <div
                      key={`${item.key}-${idx}`}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl hover:border-[#4b70a6] hover:bg-blue-50/20 transition-all shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-[#4b70a6] text-xs bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200 inline-block">
                            {item.key}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 mt-1">{item.desc}</div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleInsertTagToTarget(item.key)}
                          className="w-full py-1.5 px-3 bg-[#4b70a6] hover:bg-[#3d5d8a] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-98"
                          title={`${item.key} -> ${destinationLabels[tagInsertDestination]}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ {destinationLabels[tagInsertDestination]}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: OFFICER INPUTS CONFIGURATION */}
            {activeSidebarTab === "officerInputs" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>अधिकारी मंजुरी इनपुट्स व्याख्या</span>
                  </div>
                  <p className="text-[11px] font-medium text-amber-950 leading-normal">
                    येथे सेट केलेली फील्ड्स मंजुरी अधिकाऱ्याला 'Certificate Decision, Edit & Digital Signature' स्क्रीनवर भरण्यासाठी उपलब्ध होतील.
                  </p>
                </div>

                <div className="p-3 bg-white border-2 border-amber-300 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>{editingFieldKey ? "अधिकारी फील्ड संपादित करा:" : "नवीन फील्ड जोडा:"}</span>
                    {editingFieldKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFieldKey(null);
                          setFieldKeyInput("");
                          setFieldLabelMrInput("");
                          setFieldLabelEnInput("");
                          setFieldMandatoryInput(false);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                      >
                        रद्द करा
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">फील्ड की (उदा. Note1)</label>
                      <Input
                        value={fieldKeyInput}
                        onChange={(e) => setFieldKeyInput(e.target.value)}
                        placeholder="e.g. OrderNo"
                        disabled={!!editingFieldKey}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">प्रकार (Field Type)</label>
                      <select
                        value={fieldTypeInput}
                        onChange={(e) => setFieldTypeInput(e.target.value as any)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-1.5 font-bold"
                      >
                        <option value="textarea">मजकूर (Textarea)</option>
                        <option value="text">एकरेषी मजकूर (Text)</option>
                        <option value="date">दिनांक (Date)</option>
                        <option value="number">संख्या (Number)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">मराठी लेबल</label>
                    <Input
                      value={fieldLabelMrInput}
                      onChange={(e) => setFieldLabelMrInput(e.target.value)}
                      placeholder="उदा. आदेश क्रमांक व दिनांक"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">English Label</label>
                    <Input
                      value={fieldLabelEnInput}
                      onChange={(e) => setFieldLabelEnInput(e.target.value)}
                      placeholder="e.g. Order Number & Date"
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-800">
                      <ToggleSwitch checked={fieldMandatoryInput} onChange={setFieldMandatoryInput} />
                      <span>अनिवार्य फील्ड (Mandatory)</span>
                    </label>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveOfficerField}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      {editingFieldKey ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{editingFieldKey ? "अपडेट करा" : "फील्ड जोडा"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-xs">सध्याची सक्रिय फील्ड्स:</div>
                  {(bands.find((b) => b.type === "OFFICER_INPUTS_BLOCK")?.data?.officerFields || []).map(
                    (f: OfficerFieldConfig, idx: number) => (
                      <div
                        key={`${f.fieldKey || 'officer-field'}-${idx}`}
                        className="p-2.5 bg-white border border-slate-300 rounded-xl shadow-2xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-950 text-xs">
                            {f.fieldLabelMarathi}
                            {f.isMandatory && <span className="text-red-600 ml-1">*</span>}
                          </div>
                          <div className="text-[10px] font-mono font-semibold text-slate-600">
                            {f.fieldKey} • {f.fieldType} • {f.fieldLabelEnglish}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" size="sm" className="font-bold">
                            {f.fieldType}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFieldKey(f.fieldKey);
                              setFieldKeyInput(f.fieldKey);
                              setFieldLabelMrInput(f.fieldLabelMarathi);
                              setFieldLabelEnInput(f.fieldLabelEnglish);
                              setFieldTypeInput(f.fieldType as any);
                              setFieldMandatoryInput(f.isMandatory);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="संपादित करा"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const offBand = bands.find((b) => b.type === "OFFICER_INPUTS_BLOCK");
                              if (!offBand) return;
                              const current: OfficerFieldConfig[] = offBand.data.officerFields || [];
                              updateBandData(
                                offBand.id,
                                "officerFields",
                                current.filter((field) => field.fieldKey !== f.fieldKey)
                              );
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="काढा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: REAL-TIME A4 CANVAS WITH MOUSE-DRAG & RESIZE ================= */}
        <div className="lg:col-span-7 bg-slate-200/90 flex flex-col h-full overflow-hidden select-none">
          {/* Canvas Top Bar */}
          <div className="bg-white border-b border-slate-300 px-4 py-2 flex items-center justify-between gap-2 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#4b70a6]" />
                <span>
                  A4 थेट दाखला कॅनव्हास ({currentServiceName})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sample Data Toggle */}
              <button
                type="button"
                onClick={() => setShowSampleData((p) => !p)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${showSampleData
                    ? "bg-emerald-50 text-emerald-900 border-emerald-400 shadow-2xs"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                title="नमुना डेटा किंवा टॅग्ज दृश्य स्विच करा"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{showSampleData ? "नमुना डेटा दृश्य" : "टॅग्ज कोड दृश्य"}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((p) => Math.max(60, p - 10))}
                  className="p-1 hover:bg-white rounded text-slate-700 font-bold"
                  title="झूम कमी करा"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-extrabold text-slate-900 px-1.5">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((p) => Math.min(140, p + 10))}
                  className="p-1 hover:bg-white rounded text-slate-700 font-bold"
                  title="झूम वाढवा"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Mouse Resizable Canvas Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center items-start relative">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                width: pageSize === "A4" ? "210mm" : pageSize === "Letter" ? "216mm" : "216mm",
                minHeight: pageSize === "A4" ? "297mm" : pageSize === "Letter" ? "279mm" : "356mm",
              }}
              onClick={(e) => {
                const target = (e.target as HTMLElement).closest("[data-band-id]");
                if (target) {
                  const bandId = target.getAttribute("data-band-id");
                  if (bandId) {
                    setSelectedBandId(bandId);
                    setApplyToAllBands(false);
                    setActiveSidebarTab("bands");
                  }
                }
              }}
              className="bg-white shadow-2xl transition-transform duration-150 relative mb-8"
            >
              <OfficialCertificateSheet key={livePreviewMergedHtml} htmlContent={livePreviewMergedHtml} />

              {/* Interactive Visual Resize Floating Pill ONLY for Logo / Seal / QR Images */}
              {selectedBand && (selectedBand.type === "HEADER_LETTERHEAD" || selectedBand.type === "SIGNATURE_SEAL" || selectedBand.type === "SECURITY_FOOTER") && (
                <div
                  className="absolute inset-0 pointer-events-none z-30"
                  style={{
                    display: "block",
                  }}
                >
                  {/* Visual Indicator & Direct Mouse Drag Handle for Logo / Seal / QR */}
                  <div className="sticky top-3 right-4 pointer-events-auto inline-flex items-center gap-2 bg-slate-950/95 text-white text-xs px-3.5 py-2 rounded-full shadow-2xl border border-slate-700 backdrop-blur-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-extrabold text-[11px]">
                      {selectedBand.type === "HEADER_LETTERHEAD"
                        ? "मनपा लोगो"
                        : selectedBand.type === "SIGNATURE_SEAL"
                          ? "मनपा गोल शिक्का"
                          : "सुरक्षा QR कोड"}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300 font-bold">
                      {selectedBand.style.imageSize ?? 80}px
                    </span>

                    <button
                      type="button"
                      onClick={() => changeBoxImageSizeStep(-10)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-extrabold text-slate-200"
                      title="लहान करा"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => changeBoxImageSizeStep(10)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-extrabold text-slate-200"
                      title="मोठा करा"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => startInteractiveResize(selectedBand.id, "corner", e)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-full text-[10px] font-extrabold text-white cursor-nwse-resize flex items-center gap-1 shadow-xs active:scale-95"
                      title="माऊसने दाबून ओढा आणि लोगो/शिक्का लहान किंवा मोठा करा"
                    >
                      <Hand className="w-3 h-3" />
                      <span>✋ माऊसने ओढून आकार बदला</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMMON COMPONENT PREVIEW MODAL ================= */}
      <Modal
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        maxWidth="2xl"
        title={
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#4b70a6]" />
            <span>
              दाखला थेट प्रिव्ह्यू (Official Certificate Preview)
            </span>
          </div>
        }
        subtitle={`${currentServiceName} - प्रत्यक्ष निर्गमित होणारा A4 दाखला`}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setModalZoomLevel((p) => Math.max(60, p - 10))}
                className="p-1 hover:bg-white rounded text-slate-700 font-bold"
                title="झूम कमी"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-900 px-2">
                {modalZoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setModalZoomLevel((p) => Math.min(150, p + 10))}
                className="p-1 hover:bg-slate-700 rounded text-slate-200"
                title="झूम जास्त"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                बंद करा
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="bg-[#4b70a6] hover:bg-[#3a5885] text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट करा</span>
              </Button>
            </div>
          </div>
        }
      >
        <div className="p-4 bg-slate-200/80 flex justify-center items-start min-h-[60vh] max-h-[75vh] overflow-y-auto">
          <div
            style={{
              transform: `scale(${modalZoomLevel / 100})`,
              transformOrigin: "top center",
              width: pageSize === "A4" ? "210mm" : pageSize === "Letter" ? "216mm" : "216mm",
              minHeight: pageSize === "A4" ? "297mm" : pageSize === "Letter" ? "279mm" : "356mm",
            }}
            className="bg-white shadow-2xl transition-transform duration-150 relative mb-8"
          >
            <OfficialCertificateSheet htmlContent={livePreviewMergedHtml} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
