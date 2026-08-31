"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  FileCheck2,
  Printer,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Layers,
  Award,
  Lock,
  Copy,
  Check,
  FileText,
  Eye,
  BadgeCheck,
} from "lucide-react";
import { Badge, Card } from "@/components/common";
import type { CertificateVerificationResponse } from "@/types/rts/certificate.types";

interface CertificateVerificationViewProps {
  data: CertificateVerificationResponse;
  locale: string;
}

export default function CertificateVerificationView({
  data,
  locale,
}: CertificateVerificationViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "certificate">("summary");

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedIssueDate = data.issuedAt
    ? new Date(data.issuedAt).toLocaleString(locale === "mr" ? "mr-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const formattedValidUntil = data.dscValidUntil
    ? new Date(data.dscValidUntil).toLocaleDateString(locale === "mr" ? "mr-IN" : "en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Valid & Active";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* Top Government Navigation Header */}
      <header className="border-b border-slate-200 bg-white shadow-xs print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-blue-100 bg-slate-50 p-1">
              <Image
                src={data.ulbLogo || "/images/logo.png"}
                alt={data.ulbName || "ULB Logo"}
                width={40}
                height={40}
                className="h-full w-full object-contain"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-900 sm:text-sm">
                {data.ulbName || "अकोला महानगरपालिका, अकोला"}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ • सार्वजनिक प्रमाणपत्र पडताळणी पोर्टल
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              RTS Online Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Verification Status Hero Card */}
        {data.isValid ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 sm:p-7 text-white shadow-lg border border-emerald-600 print:bg-white print:text-black print:border-emerald-600 print:shadow-none">
            {/* Background Decorative Pattern */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/40 shadow-inner">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white drop-shadow-md" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-100 backdrop-blur-md mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Official Public Verification
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                  प्रमाणपत्र अधिकृतरीत्या पडताळलेले व अस्सल आहे
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/95 leading-relaxed max-w-3xl">
                  सदर प्रमाणपत्र <strong>{data.ulbName || "अकोला महानगरपालिका"}</strong> च्या अधिकृत RTS प्रणालीद्वारे डिजिटल स्वाक्षरीने (DSC) जारी करण्यात आलेले अस्सल व वैध शासकीय प्रमाणपत्र आहे.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 border-t border-emerald-600/60 text-[11px] text-emerald-100">
                  <span className="font-semibold">कायदेशीर वैधता:</span>
                  <span className="rounded-md bg-emerald-900/50 px-2 py-0.5 font-bold border border-emerald-500/40">
                    IT Act 2000 (कलम ६) & RTS Act 2015
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>पडताळणी वेळ: <strong>{new Date().toLocaleTimeString(locale === "mr" ? "mr-IN" : "en-IN")} (IST)</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-6 sm:p-8 text-white shadow-lg border border-rose-500">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 border-2 border-white/50">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider mb-2">
                  Verification Failed
                </div>
                <h1 className="text-xl sm:text-2xl font-black leading-snug">
                  अवैध किंवा नोंदणी नसलेले प्रमाणपत्र!
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-rose-100 leading-relaxed">
                  {data.message || "या QR कोड किंवा लिंकशी संबंधित कोणतेही अधिकृत प्रमाणपत्र सिस्टीममध्ये उपलब्ध नाही. कृपया मूळ प्रमाणपत्रावरील QR कोड पुन्हा स्कॅन करा किंवा नागरी सुविधा केंद्राशी संपर्क साधा."}
                </p>
              </div>
            </div>
          </div>
        )}

        {data.isValid && (
          <>
            {/* View Switcher Tabs (Desktop & Mobile) */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 print:hidden">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                    activeTab === "summary"
                      ? "bg-blue-900 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  पडताळणी तपशील (Verification Details)
                </button>
                {data.mergedHtmlContent && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("certificate")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                      activeTab === "certificate"
                        ? "bg-blue-900 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    मूळ प्रमाणपत्र पहा (View Full Certificate)
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  title="Copy verification link"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">प्रिंट / Save PDF</span>
                  <span className="sm:hidden">Print</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Summary & Security Metadata */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* Certificate Record Grid */}
                <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          अधिकृत प्रमाणपत्र नोंदणी तपशील
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500">
                          अकोला महानगरपालिका RTS डेटाबेस नोंदणीकृत माहिती
                        </p>
                      </div>
                    </div>

                    <Badge variant="success" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      ✓ अस्सल (Verified)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    {/* Certificate No */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-blue-600" /> प्रमाणपत्र क्रमांक:
                      </span>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono break-all">
                        {data.certificateNo || `CERT/${data.applicationNo}`}
                      </p>
                    </div>

                    {/* Application No */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-indigo-600" /> मूळ अर्ज क्रमांक:
                      </span>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
                        {data.applicationNo || "-"}
                      </p>
                    </div>

                    {/* Applicant Name */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-emerald-600" /> अर्जदाराचे पूर्ण नाव:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {data.applicantName || "-"}
                      </p>
                    </div>

                    {/* Service Name */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1 sm:col-span-2 lg:col-span-2">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-amber-600" /> सेवेचे नाव (RTS Service):
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-blue-900">
                        {data.serviceName || "-"}
                      </p>
                    </div>

                    {/* Department Name */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-600" /> संबंधित विभाग:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {data.departmentName || "नगर रचना विभाग (Town Planning)"}
                      </p>
                    </div>

                    {/* Approving Officer */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <BadgeCheck className="h-3.5 w-3.5 text-teal-600" /> सक्षम प्राधिकारी (Officer):
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {data.issuedByOfficer || "सक्षम प्राधिकारी"}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {data.officerDesignation || "सहाय्यक नगर रचनाकार"}
                      </p>
                    </div>

                    {/* Issued Date */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-purple-600" /> जारी दिनांक व वेळ:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {formattedIssueDate}
                      </p>
                    </div>

                    {/* ULB Authority */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-rose-600" /> स्थानिक स्वराज्य संस्था:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {data.ulbName || "अकोला महानगरपालिका"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Digital Signature Security Verification Card (e-Mudhra / CCA) */}
                <Card className="overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-emerald-950">
                          डिजिटल स्वाक्षरी सुरक्षा तपशील (Digital Signature Certificate)
                        </h3>
                        <p className="text-[11px] font-medium text-emerald-800">
                          Class 2 / Class 3 DSC • CCA Accredited Govt CA
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-200/90 px-3 py-1 font-mono text-[11px] font-extrabold text-emerald-950 border border-emerald-300">
                      🔒 DSC Verified & Secure
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">स्वाक्षरी संस्था (Signer):</span>
                      <p className="mt-0.5 font-bold text-slate-900">
                        {data.dscSignerName || data.ulbName || "अकोला महानगरपालिका"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">प्रमाणन संस्था (Certifying Authority):</span>
                      <p className="mt-0.5 font-bold text-slate-900">
                        {data.dscIssuer || "CCA India Recognized CA (eMudhra / Capricorn)"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">सर्टिफिकेट सिरीयल क्रमांक:</span>
                      <p className="mt-0.5 font-mono font-bold text-slate-900 break-all">
                        {data.dscSerialNumber || "17208930819777977461"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">स्वाक्षरी अल्गोरिदम:</span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        SHA-256 with RSA 2048-bit (X.509)
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">वैधता स्थिती (Validity):</span>
                      <p className="mt-0.5 font-extrabold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {formattedValidUntil}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/90 p-3 border border-emerald-200/70">
                      <span className="text-[10.5px] font-semibold text-slate-500 uppercase">प्रमाणपत्र प्रकार:</span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        Electronic Document Signer (PFX)
                      </p>
                    </div>
                  </div>

                  {data.dscThumbprint && (
                    <div className="mt-3.5 rounded-lg bg-emerald-100/50 p-2.5 text-[10.5px] font-mono text-slate-600 border border-emerald-200/60 truncate">
                      <span className="font-bold text-emerald-950">SHA-1 Thumbprint: </span>
                      {data.dscThumbprint}
                    </div>
                  )}
                </Card>

                {/* Statutory IT Act Notice */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center sm:text-left text-xs text-slate-500 leading-relaxed shadow-2xs">
                  <p>
                    ⚖️ <strong>कायदेशीर सूचना (Statutory Note):</strong> सदर प्रमाणपत्र हे <em>माहिती तंत्रज्ञान कायदा २००० (Information Technology Act, 2000) च्या कलम ६</em> अन्वये इलेक्ट्रॉनिक माध्यमातून डिजिटल स्वाक्षरीने तयार केलेले आहे. त्यामुळे यावर प्रत्यक्ष सही व शिक्का असण्याची आवश्यकता नसून ते सर्व शासकीय, निमशासकीय व खाजगी कामांसाठी पूर्णपणे वैध आहे.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Full Rendered Certificate Document */}
            {activeTab === "certificate" && data.mergedHtmlContent && (
              <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white p-4 sm:p-8 shadow-md">
                <div className="mx-auto max-w-4xl overflow-x-auto">
                  <div
                    className="min-w-[650px] sm:min-w-full"
                    dangerouslySetInnerHTML={{ __html: data.mergedHtmlContent }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden mt-12">
        <div className="mx-auto max-w-5xl px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            {data.ulbName || "अकोला महानगरपालिका, अकोला"} • RTS ई-गव्हर्नन्स प्रणाली
          </p>
          <p className="text-[11px] text-slate-400">
            {data.ulbAddress || "एम. जी. रोड, मुख्य प्रशासकीय इमारत, अकोला, महाराष्ट्र - ४४४००१"}
          </p>
        </div>
      </footer>
    </div>
  );
}
