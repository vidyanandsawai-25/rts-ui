"use client";

import {
  CheckCircle2,
  FileCheck2,
  Printer,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/common";
import type { CertificateVerificationResponse } from "@/types/rts/certificate.types";

interface CertificateVerificationViewProps {
  data: CertificateVerificationResponse;
  locale: string;
}

export default function CertificateVerificationView({
  data,
}: CertificateVerificationViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification Status Card */}
        {data.isValid ? (
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-5 border border-emerald-500">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                Official RTS Public Verification
              </div>
              <h1 className="text-2xl font-black">प्रमाणपत्र अधिकृतरीत्या पडताळलेले आहे</h1>
              <p className="text-sm text-emerald-100 mt-1">
                सदर प्रमाणपत्र अकोला महानगरपालिकेच्या अधिकृत RTS प्रणालीद्वारे डिजिटल स्वाक्षरीने जारी करण्यात आलेले अस्सल प्रमाणपत्र आहे.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-600 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-5 border border-red-500">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-black">अवैध किंवा बनावट प्रमाणपत्र!</h1>
              <p className="text-sm text-red-100 mt-1">
                {data.message || "या QR कोडशी संबंधित कोणतेही अधिकृत प्रमाणपत्र सिस्टीममध्ये नोंदणीकृत नाही."}
              </p>
            </div>
          </div>
        )}

        {/* Certificate Metadata Details Card */}
        {data.isValid && (
          <Card className="p-6 bg-white border border-slate-200 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                प्रमाणपत्र नोंदणी तपशील (Certificate Record)
              </h2>
              <Badge variant="success">वैध (Verified)</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">प्रमाणपत्र क्रमांक:</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{data.certificateNo}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">मूळ अर्ज क्रमांक:</span>
                <p className="text-sm font-bold text-slate-900 font-mono">{data.applicationNo}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">अर्जदाराचे नाव:</span>
                <p className="text-sm font-bold text-slate-900">{data.applicantName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">सेवेचे नाव:</span>
                <p className="text-sm font-bold text-blue-700">{data.serviceName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">मंजुरी अधिकारी / पदनाम:</span>
                <p className="text-sm font-bold text-slate-900">
                  {data.issuedByOfficer} ({data.officerDesignation})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold">जारी दिनांक:</span>
                <p className="text-sm font-bold text-slate-900">
                  {data.issuedAt ? new Date(data.issuedAt).toLocaleString("en-GB") : "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> पडताळणी प्रत प्रिंट करा (Print Verification)
              </Button>
            </div>
          </Card>
        )}

        {/* Certificate Rendered Preview */}
        {data.isValid && data.mergedHtmlContent && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-300">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: data.mergedHtmlContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
