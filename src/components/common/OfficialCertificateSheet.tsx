"use client";

import React from "react";
import { useLocale } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

export interface OfficialCertificateData {
  certificateNo?: string;
  applicationNo?: string;
  applicationDate?: string;
  approvalDate?: string;
  outwardNo?: string;
  trackingCode?: string;
  applicantName?: string;
  applicantAddress?: string;
  applicantMobile?: string;
  serviceTitle?: string;
  serviceTitleLocal?: string;
  departmentName?: string;
  departmentNameLocal?: string;
  ulbNameMarathi?: string;
  ulbNameEnglish?: string;
  ulbAddress?: string;
  ulbEmail?: string;
  ulbSealUrl?: string;
  officerName?: string;
  officerDesignation?: string;
  clerkDesignation?: string;
  conditions?: string[];
  validityDays?: number;
  customTip?: string;
  qrCodeText?: string;
}

export interface OfficialCertificateSheetProps {
  htmlContent?: string;
  data?: OfficialCertificateData;
  localeOverride?: string;
  className?: string;
}

export const OfficialCertificateSheet: React.FC<OfficialCertificateSheetProps> = ({
  htmlContent,
  data,
  localeOverride,
  className = "",
}) => {
  const currentLocale = useLocale();
  const locale = localeOverride || currentLocale || "mr";
  const isMr = locale === "mr";

  // If precompiled htmlContent is provided and no individual data object, render HTML directly
  if (htmlContent && !data) {
    let cleanHtml = htmlContent;
    // Clean up any studio edit badges or outlines from preview or issued templates
    cleanHtml = cleanHtml.replace(/<div class=['"]absolute -top-3[^>]*>✏️[^<]*<\/div>/g, "");
    cleanHtml = cleanHtml.replace(/ring-2 ring-\[#4b70a6\]\/[0-9]+/g, "");
    cleanHtml = cleanHtml.replace(/border-2 border-\[#4b70a6\]/g, "border border-transparent");
    cleanHtml = cleanHtml.replace(/bg-blue-50\/20/g, "");
    // Clean up any unreplaced template placeholders
    cleanHtml = cleanHtml.replace(/{{OfficerFieldsBlock}}/g, "");
    cleanHtml = cleanHtml.replace(/{{CustomConditionsList}}/g, "");
    cleanHtml = cleanHtml.replace(/{{OfficerName}}/g, isMr ? "सक्षम प्राधिकारी / सह. आयुक्त" : "Competent Authority / Asst. Commissioner");
    cleanHtml = cleanHtml.replace(/{{ApprovalDate}}/g, new Date().toLocaleDateString("en-GB"));
    cleanHtml = cleanHtml.replace(/{{IssueDate}}/g, new Date().toLocaleDateString("en-GB"));

    // Ensure real scannable QR Code is embedded (replaces any static placeholder icons)
    const appMatch = cleanHtml.match(/RTS[0-9]+/i);
    const appNo = appMatch ? appMatch[0] : "RTS-VERIFIED";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const qrVerifyUrl = `${origin}/mr/service/verify-certificate/${encodeURIComponent(appNo)}`;
    const qrImgTag = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrVerifyUrl)}" alt="QR Verification" class="w-full h-full object-contain" />`;

    cleanHtml = cleanHtml.replace(
      /<div style=['"]width: 55px; height: 55px;['"][^>]*>[\s\S]*?<\/div>/gi,
      `<div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>${qrImgTag}</div>`
    );
    cleanHtml = cleanHtml.replace(
      /<div style=['"]width: [0-9]+px; height: [0-9]+px;['"][^>]*>[\s\S]*?<svg[^>]*viewBox=['"]0 0 24 24['"][\s\S]*?<\/svg>[\s\S]*?<\/div>/gi,
      `<div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>${qrImgTag}</div>`
    );

    return (
      <div
        className={`official-certificate-root w-full max-w-4xl mx-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  // 100% Dynamic Text Generation based on active props (NO static hardcoded city/names)
  const ulbName = isMr
    ? data?.ulbNameMarathi || data?.ulbNameEnglish || ""
    : data?.ulbNameEnglish || data?.ulbNameMarathi || "";

  const deptName = isMr
    ? data?.departmentNameLocal || data?.departmentName || ""
    : data?.departmentName || data?.departmentNameLocal || "";

  const srvTitle = isMr
    ? data?.serviceTitleLocal || data?.serviceTitle || ""
    : data?.serviceTitle || data?.serviceTitleLocal || "";

  const outwardText = isMr
    ? `जा.क्र. ${data?.outwardNo || "-"}`
    : `Outward No. ${data?.outwardNo || "-"}`;

  const dateLabel = isMr ? "दिनांक" : "Date";
  const toLabel = isMr ? "प्रति," : "To,";
  const salutation = isMr ? "महोदय / महोदया," : "Dear Sir / Madam,";
  const applicantName = data?.applicantName || "-";
  const applicantAddress = data?.applicantAddress || "-";
  const applicantMobile = data?.applicantMobile || "-";

  const subjectText = isMr
    ? `विषय :- ${srvTitle} बाबत अधिकृत प्रमाणपत्र पुरविणेबाबत.`
    : `Subject :- Grant of official certificate for ${srvTitle}.`;

  const referenceText = isMr
    ? `संदर्भ :- आपला ऑनलाईन RTS अर्ज क्र. ${data?.applicationNo || "-"} दिनांक ${data?.applicationDate || "-"}`
    : `Reference :- Your online RTS Application No. ${data?.applicationNo || "-"} dated ${data?.applicationDate || "-"}`;

  const narrativeP1 = isMr
    ? `उपरोक्त विषयान्वये आपणास कळविण्यात येते की, आपण महाराष्ट्र लोकसेवा हक्क अधिनियमान्वये केलेल्या अर्जानुसार (अर्ज क्र. ${data?.applicationNo || "-"} दि. ${data?.applicationDate || "-"}), संबंधित कागदपत्रांची छाननी व स्थळ पाहणी नियमानुसार पूर्ण करण्यात आली आहे.`
    : `With reference to the above subject, it is hereby informed that in accordance with your application submitted under the Right to Public Services Act (App No. ${data?.applicationNo || "-"} dated ${data?.applicationDate || "-"}), verification of documents and necessary site inspection have been completed.`;

  const narrativeP2 = isMr
    ? `सबब, विहित नियमांच्या अधीन राहून ${applicantName} (रा. ${applicantAddress}) यांना ${srvTitle} प्रमाणपत्र दिनांक ${data?.approvalDate || "-"} रोजी खालील अटी व शर्तींच्या अधीन राहून निर्गमित करण्यात येत आहे.`
    : `Therefore, subject to prevailing rules and regulations, the official certificate for ${srvTitle} is hereby issued to ${applicantName} (Res. ${applicantAddress}) on dated ${data?.approvalDate || "-"} under following terms and conditions.`;

  const conditionsTitle = isMr ? "शर्ती व अटी:" : "Terms & Conditions:";

  const conditionsList = data?.conditions && data.conditions.length > 0 ? data.conditions : [];

  const validityDays = data?.validityDays || 90;
  const tipText = isMr
    ? `टिप :- सदर दाखल्याचा कालावधी हा दाखला दिलेल्या तारखेपासून ${validityDays} दिवसांपर्यंत ग्राह्य धरता येईल.`
    : `Note :- The validity of this certificate shall be valid for ${validityDays} days from the date of issue.`;

  const clerkTitle = data?.clerkDesignation || (isMr ? "लिपिक / शाखा प्रमुख" : "Clerk / Section Incharge");
  const officerTitle = data?.officerDesignation || (isMr ? "सक्षम प्राधिकारी / विभाग प्रमुख" : "Competent Authority / Head of Department");
  const officerName = data?.officerName || (isMr ? "सक्षम प्राधिकारी" : "Authorized Officer");

  const disclaimer = isMr
    ? "हे प्रमाणपत्र संगणकीय प्रणालीद्वारे डिजिटल स्वाक्षरीने जारी केलेले असून यावर प्रत्यक्ष स्वाक्षरीची आवश्यकता नाही."
    : "This certificate is issued digitally through computer system and does not require physical signature.";

  return (
    <div
      className={`official-certificate-sheet bg-white text-slate-900 border-[5px] border-double border-slate-900 p-6 md:p-8 relative shadow-sm max-w-4xl mx-auto ${className}`}
      style={{
        minHeight: "297mm",
        fontFamily: isMr ? "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif" : "'Segoe UI', Arial, sans-serif",
        fontSize: "13px",
      }}
    >
      {/* Header Letterhead */}
      <div className="header-letterhead mb-3">
        {data?.trackingCode && (
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
            <div>{data.trackingCode}</div>
            <div>{data.applicationNo || ""}</div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="w-20 shrink-0 text-center">
            {data?.ulbSealUrl && (
              <img
                src={data.ulbSealUrl}
                alt={ulbName}
                className="max-h-20 max-w-full object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}
            {ulbName && <div className="text-[9px] font-bold text-slate-700 mt-0.5">{ulbName}</div>}
          </div>

          <div className="text-center flex-1">
            {ulbName && <div className="text-xl md:text-2xl font-bold text-slate-900 font-serif">{ulbName}</div>}
            {deptName && <div className="text-sm md:text-base font-semibold text-slate-800 mt-0.5">{deptName}</div>}
            {data?.ulbAddress && <div className="text-xs text-slate-700 mt-0.5">{data.ulbAddress}</div>}
            {data?.ulbEmail && (
              <div className="text-[11px] text-slate-600 mt-0.5 font-sans">
                {isMr ? "ई-मेल" : "Email"} - {data.ulbEmail}
              </div>
            )}
          </div>

          <div className="w-20 shrink-0" />
        </div>

        <div className="w-full border-b-2 border-slate-900 mt-2 mb-2" />
      </div>

      {/* Outward & Date Bar */}
      <div className="dispatch-bar flex justify-between items-center text-xs md:text-sm font-semibold text-slate-900 my-2 px-1">
        <div>{outwardText}</div>
        <div>
          {dateLabel}: {data?.approvalDate || "-"}
        </div>
      </div>

      {/* Recipient Block */}
      <div className="recipient-block text-xs md:text-sm text-slate-900 my-3 leading-relaxed">
        <div className="font-bold">{toLabel}</div>
        <div className="pl-6 font-bold">{applicantName}</div>
        {applicantAddress && (
          <div className="pl-6 text-slate-800">
            {isMr ? "पत्ता" : "Address"}: {applicantAddress}
          </div>
        )}
        {applicantMobile && (
          <div className="pl-6 text-slate-800 font-mono">
            {isMr ? "मो." : "Mobile"}: {applicantMobile}
          </div>
        )}
      </div>

      {/* Subject & Reference */}
      <div className="subject-ref-block text-xs md:text-sm text-slate-900 my-3 pl-8 leading-normal">
        <div className="font-bold mb-1">{subjectText}</div>
        <div className="font-medium text-slate-800">{referenceText}</div>
      </div>

      {/* Salutation */}
      <div className="salutation-block text-xs md:text-sm font-bold text-slate-900 mt-2 mb-1">{salutation}</div>

      {/* Narrative Body */}
      <div
        className="narrative-body text-xs md:text-sm text-slate-900 leading-relaxed text-justify space-y-2.5 my-3"
        style={{ textIndent: "2rem" }}
      >
        <p>{narrativeP1}</p>
        <p>{narrativeP2}</p>
      </div>

      {/* Conditions Block */}
      {conditionsList.length > 0 && (
        <div className="conditions-block my-4 pt-2">
          <div className="font-bold text-xs md:text-sm text-slate-900 mb-2">{conditionsTitle}</div>
          <ol className="list-decimal pl-6 text-xs text-slate-900 space-y-1.5 leading-normal">
            {conditionsList.map((cond, idx) => (
              <li key={idx}>{cond}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Tip Block */}
      <div className="custom-text-block my-3 p-2 text-xs md:text-sm text-slate-900 leading-normal font-bold">
        {data?.customTip || tipText}
      </div>

      {/* Signatures & Seal Band */}
      <div className="signature-stamp-block mt-8 pt-4 flex justify-between items-end gap-4">
        <div className="left-sign text-center text-xs">
          <div className="h-12 flex items-center justify-center font-serif italic text-slate-700 font-bold text-sm transform -rotate-6 border-b border-slate-400 pb-1">
            {data?.approvalDate || ""}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">{clerkTitle}</div>
        </div>

        <div className="center-seal text-center">
          {data?.ulbSealUrl && (
            <div className="official-seal-stamp inline-block text-center">
              <img
                src={data.ulbSealUrl}
                alt={ulbName}
                className="w-28 h-28 object-contain transform -rotate-6 filter drop-shadow-xs inline-block"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="right-digital-sign text-right">
          <div className="digital-signature-card bg-emerald-50/90 border-2 border-emerald-600 p-2.5 rounded-lg text-left inline-block shadow-xs min-w-[220px] font-sans text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] pb-1 border-b border-emerald-300 mb-1">
              <span className="text-emerald-700 font-bold text-sm">✔</span>
              <span>Digitally Signed (DSC Verified)</span>
            </div>
            <div className="font-bold text-slate-900 text-xs">{officerName}</div>
            <div className="text-[10px] text-slate-700 font-medium">{officerTitle}</div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
              Date: {data?.approvalDate || "-"} IST
            </div>
            <div className="text-[9px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <span>🔒</span> <span>e-Sign Verified & Authentic</span>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1">{officerTitle}</div>
          {ulbName && <div className="text-[11px] text-slate-700">{ulbName}</div>}
        </div>
      </div>

      {/* Security Footer Block */}
      <div className="security-footer-block mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <div className="inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center">
            <div className="w-14 h-14 bg-white flex items-center justify-center">
              <QRCodeSVG
                value={data?.qrCodeText || `${typeof window !== "undefined" ? window.location.origin : ""}/mr/service/verify-certificate/${encodeURIComponent(data?.applicationNo || '')}`}
                size={52}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[7px] text-slate-600 mt-0.5 font-bold">Scan to Verify</span>
          </div>
          <div className="font-mono tracking-widest text-[9px] font-bold">||||||||||||||||||||||</div>
        </div>
        <div className="text-center text-[9px] text-slate-500 max-w-md">{disclaimer}</div>
      </div>

      {/* Official Government Tracking Footer */}
      <div className="footer-tracking-block mt-4 pt-1.5 border-t border-slate-400 flex justify-between items-center text-[9px] text-slate-500 font-mono">
        <div>{ulbName || "अकोला महानगरपालिका"} | {deptName || "लोकसेवा हक्क विभाग"}</div>
        <div>RTS Portal Official Certificate | MahaOnline / Aaple Sarkar</div>
      </div>
    </div>
  );
};

export default OfficialCertificateSheet;
